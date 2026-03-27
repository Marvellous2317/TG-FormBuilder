

import crypto from "crypto";
import bcrypt from "bcrypt";
import { ApplicationError } from "../../utils/errorHandler.js";

import jwt from "jsonwebtoken";
import config from "../../appConfig.js";

export function generateJWT(userId) {
  const payload = {
    id: userId,
  };



  const token = jwt.sign(payload, config.SECRET_KEY, {
    algorithm:  config.algorithm,
    expiresIn: config.JWT_EXPIRATION, 
  });

  return token;
}




export const generateOpt = ()=>{
    const otp = crypto.randomInt(100000, 999999).toString();
      const expiry = new Date(Date.now() + 10 * 60 * 1000); //10mins

      return {otp, expiry}

}








export async function makePassword(password) {
  try {
    const saltRounds = 12; 
    const hash = await bcrypt.hash(password, saltRounds);
    return hash; 
  } catch (error) {
    throw new ApplicationError("Error hashing password");
  }
}

export async function checkPassword(password, password_hash) {
  try {
    const isMatch = await bcrypt.compare(password, password_hash);
    return isMatch;
  } catch (error) {
    throw new ApplicationError("Error verifying password");
  }
}






