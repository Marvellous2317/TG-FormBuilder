
import config from '../appConfig.js'; 



const isProduction = config.NODE_ENV === 'production';

const dbConfig = {
  username: isProduction ? config.PRODUCTION_USER : config.UAT_USER,
  password: isProduction ? config.PRODUCTION_PASSWORD : config.UAT_PASSWORD,
  database: isProduction ? config.PRODUCTION_DB : config.UAT_DB,
  host: isProduction ? config.PRODUCTION_HOST : config.UAT_HOST,
};

export default {
  development: {
    username: config.UAT_USER,
    password: config.UAT_PASSWORD,
    database: config.UAT_DB,     
    host: config.UAT_HOST,        
    dialect: 'postgres',                
    dialectOptions: {
      connectTimeout: 60000, 
      ssl: {
        require: true,
        rejectUnauthorized: false, 
      },
    },
    logging: false,
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
    dialectOptions: {
      connectTimeout: 60000, 
      ssl: {
        require: true,
        rejectUnauthorized: false, 
      },
    },
    logging: false,
    pool: {
      max: 10,
      min: 1,
      acquire: 30000,
      idle: 10000
    }
  },
};

