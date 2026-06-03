import { Client } from "pg";
import config from "../appConfig.js";

const args = new Set(process.argv.slice(2));
const isProduction = config.NODE_ENV === "production";
const sourceSchema = getArgValue("--source") || process.env.SOURCE_SCHEMA || "public";
const targetSchema = getArgValue("--target") || process.env.TARGET_SCHEMA || "uat";
const shouldReset = args.has("--reset") || process.env.RESET_TARGET_SCHEMA === "true";
const allowProduction = args.has("--allow-production") || process.env.ALLOW_PRODUCTION_SCHEMA_COPY === "true";

const dbConfig = {
  user: isProduction ? config.PRODUCTION_USER : config.UAT_USER,
  password: isProduction ? config.PRODUCTION_PASSWORD : config.UAT_PASSWORD,
  database: isProduction ? config.PRODUCTION_DB : config.UAT_DB,
  host: isProduction ? config.PRODUCTION_HOST : config.UAT_HOST,
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 60000,
};

function getArgValue(name) {
  const prefix = `${name}=`;
  const arg = process.argv.slice(2).find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : null;
}

function validateIdentifier(name, label) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    throw new Error(`Invalid ${label}: ${name}`);
  }
}

function quoteIdent(name) {
  return `"${name.replaceAll('"', '""')}"`;
}

function quoteLiteral(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function rewriteSchemaReferences(value) {
  return value
    .replaceAll(`${quoteIdent(sourceSchema)}.`, `${quoteIdent(targetSchema)}.`)
    .replaceAll(`${sourceSchema}.`, `${targetSchema}.`);
}

async function getTables(client) {
  const result = await client.query(
    `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = $1
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `,
    [sourceSchema],
  );

  return result.rows.map((row) => row.table_name);
}

async function getTargetTableCount(client) {
  const result = await client.query(
    `
      SELECT COUNT(*)::int AS table_count
      FROM information_schema.tables
      WHERE table_schema = $1
        AND table_type = 'BASE TABLE'
    `,
    [targetSchema],
  );

  return result.rows[0].table_count;
}

async function copySerialSequences(client, tableName) {
  const result = await client.query(
    `
      SELECT
        c.column_name,
        split_part(pg_get_serial_sequence(format('%I.%I', c.table_schema, c.table_name), c.column_name), '.', 2) AS sequence_name,
        s.increment_by,
        s.min_value,
        s.max_value,
        s.cache_size,
        s.cycle,
        s.last_value
      FROM information_schema.columns c
      JOIN pg_sequences s
        ON s.schemaname = $1
       AND s.sequencename = split_part(pg_get_serial_sequence(format('%I.%I', c.table_schema, c.table_name), c.column_name), '.', 2)
      WHERE c.table_schema = $1
        AND c.table_name = $2
        AND pg_get_serial_sequence(format('%I.%I', c.table_schema, c.table_name), c.column_name) IS NOT NULL
    `,
    [sourceSchema, tableName],
  );

  for (const row of result.rows) {
    const sourceTable = `${quoteIdent(sourceSchema)}.${quoteIdent(tableName)}`;
    const targetTable = `${quoteIdent(targetSchema)}.${quoteIdent(tableName)}`;
    const targetSequence = `${quoteIdent(targetSchema)}.${quoteIdent(row.sequence_name)}`;
    const sequenceRegclass = quoteLiteral(`${targetSchema}.${row.sequence_name}`);

    await client.query(`DROP SEQUENCE IF EXISTS ${targetSequence} CASCADE`);
    await client.query(`
      CREATE SEQUENCE ${targetSequence}
      INCREMENT BY ${row.increment_by}
      MINVALUE ${row.min_value}
      MAXVALUE ${row.max_value}
      START WITH ${row.last_value || 1}
      CACHE ${row.cache_size}
      ${row.cycle ? "CYCLE" : "NO CYCLE"}
    `);
    await client.query(`ALTER TABLE ${targetTable} ALTER COLUMN ${quoteIdent(row.column_name)} SET DEFAULT nextval(${sequenceRegclass}::regclass)`);
    await client.query(`ALTER SEQUENCE ${targetSequence} OWNED BY ${targetTable}.${quoteIdent(row.column_name)}`);
    await client.query(`SELECT setval(${sequenceRegclass}::regclass, COALESCE((SELECT MAX(${quoteIdent(row.column_name)}) FROM ${sourceTable}), 1), true)`);
  }
}

async function copyForeignKeys(client) {
  const result = await client.query(
    `
      SELECT con.conname, rel.relname AS table_name, pg_get_constraintdef(con.oid) AS definition
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
      WHERE nsp.nspname = $1
        AND con.contype = 'f'
      ORDER BY rel.relname, con.conname
    `,
    [sourceSchema],
  );

  await client.query(`SET search_path TO ${quoteIdent(targetSchema)}, ${quoteIdent(sourceSchema)}, public`);

  let copied = 0;
  for (const row of result.rows) {
    const existing = await client.query(
      `
        SELECT 1
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE nsp.nspname = $1
          AND rel.relname = $2
          AND con.conname = $3
      `,
      [targetSchema, row.table_name, row.conname],
    );

    if (existing.rowCount > 0) continue;

    await client.query(
      `ALTER TABLE ${quoteIdent(targetSchema)}.${quoteIdent(row.table_name)} ADD CONSTRAINT ${quoteIdent(row.conname)} ${rewriteSchemaReferences(row.definition)}`,
    );
    copied += 1;
  }

  return copied;
}

async function cloneSchema() {
  validateIdentifier(sourceSchema, "source schema");
  validateIdentifier(targetSchema, "target schema");

  if (sourceSchema === targetSchema) {
    throw new Error("Source and target schemas must be different");
  }

  if (isProduction && !allowProduction) {
    throw new Error("Refusing to clone schemas while NODE_ENV=production. Pass --allow-production if you really intend to run this there.");
  }

  const client = new Client(dbConfig);
  await client.connect();

  try {
    await client.query("BEGIN");

    const tables = await getTables(client);
    if (tables.length === 0) {
      throw new Error(`No tables found in ${sourceSchema} schema`);
    }

    if (shouldReset) {
      await client.query(`DROP SCHEMA IF EXISTS ${quoteIdent(targetSchema)} CASCADE`);
    } else {
      const tableCount = await getTargetTableCount(client);
      if (tableCount > 0) {
        throw new Error(`${targetSchema} schema already has tables. Re-run with --reset to replace it.`);
      }
    }

    await client.query(`CREATE SCHEMA IF NOT EXISTS ${quoteIdent(targetSchema)}`);

    for (const tableName of tables) {
      const sourceTable = `${quoteIdent(sourceSchema)}.${quoteIdent(tableName)}`;
      const targetTable = `${quoteIdent(targetSchema)}.${quoteIdent(tableName)}`;

      await client.query(`CREATE TABLE ${targetTable} (LIKE ${sourceTable} INCLUDING ALL)`);
      await copySerialSequences(client, tableName);
      await client.query(`INSERT INTO ${targetTable} SELECT * FROM ${sourceTable}`);
      console.log(`Copied ${sourceSchema}.${tableName} to ${targetSchema}.${tableName}`);
    }

    const foreignKeyCount = await copyForeignKeys(client);

    await client.query("COMMIT");
    console.log(`Copied ${tables.length} table(s) and ${foreignKeyCount} foreign key constraint(s) from ${sourceSchema} schema to ${targetSchema} schema.`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

cloneSchema().catch((error) => {
  console.error(error.message);
  process.exit(1);
});