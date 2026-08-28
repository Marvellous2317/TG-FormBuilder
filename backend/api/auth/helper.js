

import crypto from "crypto";
import bcrypt from "bcrypt";
import { ApplicationError } from "../../utils/errorHandler.js";

import jwt from "jsonwebtoken";
import config from "../../appConfig.js";

// The token carries the ACTIVE workspace alongside the user id, so a request's
// company scope is decided by the credential presented, not by whatever the user
// row happens to say. Two sessions can therefore sit in two different companies.
// companyId is optional: tokens issued before this change simply omit it and fall
// back to the user's stored company at decode time.
export function generateJWT(userId, companyId = null) {
  const payload = {
    id: userId,
    companyId: companyId || null,
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

// Default 30 days if not configured
const REFRESH_TOKEN_TTL_SECONDS = Number(config.REFRESH_TOKEN_EXPIRATION) || 60 * 60 * 24 * 30;

export function getRefreshTokenTtlMs() {
  return REFRESH_TOKEN_TTL_SECONDS * 1000;
}

export function generateRefreshSecret() {
  // 48 random bytes -> 64 url-safe chars
  return crypto.randomBytes(48).toString("base64url");
}

export async function hashRefreshSecret(secret) {
  try {
    return await bcrypt.hash(secret, 10);
  } catch (error) {
    throw new ApplicationError("Error hashing refresh token");
  }
}

export async function compareRefreshSecret(secret, secretHash) {
  try {
    return await bcrypt.compare(secret, secretHash);
  } catch (error) {
    throw new ApplicationError("Error verifying refresh token");
  }
}

// Compose the opaque token string the client receives: "<tokenId>.<secret>"
export function composeRefreshToken(tokenId, secret) {
  return `${tokenId}.${secret}`;
}

export function parseRefreshToken(raw) {
  if (typeof raw !== "string") return null;
  const idx = raw.indexOf(".");
  if (idx <= 0 || idx === raw.length - 1) return null;
  const tokenId = raw.slice(0, idx);
  const secret = raw.slice(idx + 1);
  return { tokenId, secret };
}






