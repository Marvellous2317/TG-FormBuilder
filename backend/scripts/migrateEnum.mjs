import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'tgpackagingdbprd.postgres.database.azure.com',
  database: 'postgres',
  user: 'tgazadmin',
  password: 'Tolaram@2026',
  ssl: { rejectUnauthorized: false },
});

await client.connect();
try {
  await client.query("ALTER TYPE public.enum_checklist_entries_type ADD VALUE IF NOT EXISTS 'section_formular'");
  console.log('Migration successful: section_formular added to enum');
} catch (err) {
  console.error('Migration error:', err.message);
} finally {
  await client.end();
}
