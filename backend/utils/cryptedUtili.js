import crypto from 'crypto';
import axios from 'axios';
import { fileTypeFromBuffer } from 'file-type';
import config from '../appConfig.js';
import { PassThrough } from 'stream';

const algorithm = 'aes-256-cbc';
const keyLength = 32;       
const ivLength = 16;        
const iterations = 100000; 


function deriveKeyAndIV(password, salt) {
  const key = crypto.pbkdf2Sync(password, salt, iterations, keyLength, 'sha256');
  const iv = key.slice(0, ivLength);
  return { key, iv };
}


export function encryptBuffer(buffer) {
const password = config.FILE_ENCRYPTION_KEY
  const salt = crypto.randomBytes(16);
  const { key, iv } = deriveKeyAndIV(password, salt);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return Buffer.concat([salt, encrypted]);
}


export function decryptBuffer(buffer) {
  const salt = buffer.slice(0, 16);
  const encrypted = buffer.slice(16);
  const { key, iv } = deriveKeyAndIV(config.FILE_ENCRYPTION_KEY, salt);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}



export function bufferToStream(buffer) {
  const stream = new PassThrough();
  stream.end(buffer);
  return stream;
}


export async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (data) => chunks.push(data));
    readableStream.on('end', () => resolve(Buffer.concat(chunks)));
    readableStream.on('error', reject);
  });
}




export function extractBlobPath(url) {
  const urlObj = new URL(url);
  return urlObj.pathname.replace(/^\/+/, ''); 
}