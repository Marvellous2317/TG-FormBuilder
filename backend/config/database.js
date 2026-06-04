import { Sequelize } from 'sequelize';

import config from "../appConfig.js"




const isProduction = config.NODE_ENV === 'production';

const dbConfig = {
  username: isProduction ? config.PRODUCTION_USER : config.UAT_USER,
  password: isProduction ? config.PRODUCTION_PASSWORD : config.UAT_PASSWORD,
  database: isProduction ? config.PRODUCTION_DB : config.UAT_DB,
  host: isProduction ? config.PRODUCTION_HOST : config.UAT_HOST,
};

const dbSchema = process.env.DB_SCHEMA || config.DB_SCHEMA || (isProduction ? config.PRODUCTION_SCHEMA || 'public' : config.UAT_SCHEMA || 'uat');

if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(dbSchema)) {
  throw new Error(`Invalid database schema name: ${dbSchema}`);
}

console.log(`Database connecting to ${isProduction ? 'PRODUCTION' : 'UAT'} environment using ${dbSchema} schema`);

export const sequelize = new Sequelize({
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,     
  host: dbConfig.host,        
  dialect: 'postgres',   
  dialectOptions: {
    connectTimeout: 60000, 
     ssl: {
    require: true,
    rejectUnauthorized: false, 
  },
  },
  logging: false,
  schema: dbSchema,
  searchPath: dbSchema,
  define: {
    schema: dbSchema,
  },
  hooks: {
    afterConnect: async (connection) => {
      await connection.query(`SET search_path TO "${dbSchema}", public`);
    },
  },
  pool: {
    max: 10,      
    min: 0,
    acquire: 60000, 
    idle: 30000    
  }
});




export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to postgres database');
    return sequelize;
  } catch (err) {
    console.error('Error connecting to postgres database:', err);
    process.exit(1);
  }
};