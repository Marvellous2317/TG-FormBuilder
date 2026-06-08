
import config from '../appConfig.js'; 

// Set NODE_ENV for Sequelize CLI to auto-detect environment from appConfig.json
process.env.NODE_ENV = config.NODE_ENV === 'production' ? 'production' : 'development';

const isProduction = config.NODE_ENV === 'production';

const dbConfig = {
  username: isProduction ? config.PRODUCTION_USER : config.UAT_USER,
  password: isProduction ? config.PRODUCTION_PASSWORD : config.UAT_PASSWORD,
  database: isProduction ? config.PRODUCTION_DB : config.UAT_DB,
  host: isProduction ? config.PRODUCTION_HOST : config.UAT_HOST,
};

const productionSchema = config.DB_SCHEMA || config.PRODUCTION_SCHEMA || 'public';
const uatSchema = config.DB_SCHEMA || config.UAT_SCHEMA || 'uat';

export default {
  development: {
    username: config.UAT_USER,
    password: config.UAT_PASSWORD,
    database: config.UAT_DB,     
    host: config.UAT_HOST,        
    dialect: 'postgres',                
    schema: uatSchema,
    searchPath: uatSchema,
    define: {
      schema: uatSchema,
    },
    dialectOptions: {
      connectTimeout: 60000, 
      ssl: {
        require: true,
        rejectUnauthorized: false, 
      },
    },
    logging: false,
    migrationStorageTableSchema: uatSchema,
    pool: {
      max: 10,
      min: 1,
      acquire: 30000,
      idle: 10000
    }
  },
  production: {
    username: config.PRODUCTION_USER,
    password: config.PRODUCTION_PASSWORD,
    database: config.PRODUCTION_DB,     
    host: config.PRODUCTION_HOST,        
    dialect: 'postgres',                
    schema: productionSchema,
    searchPath: productionSchema,
    define: {
      schema: productionSchema,
    },
    dialectOptions: {
      connectTimeout: 60000, 
      ssl: {
        require: true,
        rejectUnauthorized: false, 
      },
    },
    logging: false,
    migrationStorageTableSchema: productionSchema,
    pool: {
      max: 10,
      min: 1,
      acquire: 30000,
      idle: 10000
    }
  },
};

