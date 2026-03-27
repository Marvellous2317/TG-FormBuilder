
import config from "../appConfig.js";
import nodemailer from 'nodemailer';



export const EamilTransporter = nodemailer.createTransport({
  host: config.Email_Host,         
  port: config.Email_Port,        
  secure: false,
  auth: {
    user: config.Email_Username,
    pass: config.Email_Password,
  },
  pool: true,
  maxConnections: 3,              
  maxMessages: 100,
  rateLimit: 5,                    
  rateDelta: 1000,               
  tls: {
    rejectUnauthorized: true       
  }
});
