import  nodemailer from 'nodemailer';
import   ejs from 'ejs';
import path from 'path';
import  fs  from'fs';
import config from '../appConfig.js';

import {EamilTransporter} from "../config/emailConfig.js"


import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const  logo ='https://iili.io/HLNnXrF.png';

export const  sendApprovalEmail =async ({email,firstName})=> {
    try {
        const emailHtml = await ejs.renderFile(
            path.join(__dirname, './approval.ejs'),
            {
                firstName: firstName,
                email: email,
                logoUrl: logo,
              
            }
        );

        const info = await EamilTransporter.sendMail({
            from: `Packaging Check List <${config.Email_Username}>`,
            to: email,
            subject: `Packaging Check List Account Approved`,
            html: emailHtml,
        });
        return true;
    } catch (error) {
        console.error('Error sending approval email:', error);
        throw error;
    }
}






export const  sendPasswordMail =async ({email,firstName, password})=> {
    try {
        const emailHtml = await ejs.renderFile(
            path.join(__dirname, './passwordMail.ejs'),
            {
                firstName: firstName,
                email: email,
                logoUrl: logo,
                password 
           
            }
        );
        const info = await EamilTransporter.sendMail({
            from: `Packaging Check List <${config.Email_Username}>`,
            to: email,
            subject: `Packaging Check List Account Verification`,
            html: emailHtml,
        });
        return true;
    } catch (error) {
        console.error('Error sending approval email:', error);
        throw error;
    }
}





export const  sendVerificationMail =async ({email,firstName, otp})=> {
    try {
        const emailHtml = await ejs.renderFile(
            path.join(__dirname, './verification.ejs'),
            {
                firstName: firstName,
                email: email,
                logoUrl: logo,
                otp 
           
            }
        );
        const info = await EamilTransporter.sendMail({
            from: `Packaging Check List <${config.Email_Username}>`,
            to: email,
            subject: `Packaging Check List Account Verification`,
            html: emailHtml,
        });
        return true;
    } catch (error) {
        console.error('Error sending approval email:', error);
        throw error;
    }
}