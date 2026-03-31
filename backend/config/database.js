import { Sequelize } from 'sequelize';

import config from "../appConfig.js"




const isProduction = config.NODE_ENV === 'production';

const dbConfig = {
  username: isProduction ? config.PRODUCTION_USER : config.UAT_USER,
  password: isProduction ? config.PRODUCTION_PASSWORD : config.UAT_PASSWORD,
  database: isProduction ? config.PRODUCTION_DB : config.UAT_DB,
  host: isProduction ? config.PRODUCTION_HOST : config.UAT_HOST,
};

console.log(`Database connecting to ${isProduction ? 'PRODUCTION' : 'UAT'} environment`);

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

    //  if (config.NODE_ENV === 'uat') {

    //     try {
    //       await sequelize.sync({ alter: true, logging: console.log });
    //       console.log('Database sync completed successfully');
    //     } catch (syncError) {
    //       console.error('Database sync failed:', {
    //         message: syncError.message,
    //         name: syncError.name,
    //         sql: syncError.sql,
    //         original: syncError.original,
    //         parent: syncError.parent,
    //         stack: syncError.stack
    //       });
    //       throw syncError;
    //     }
    //   }
    return sequelize;
  } catch (err) {
    console.error('Error connecting to postgres database:', err);
    process.exit(1);
  }
};