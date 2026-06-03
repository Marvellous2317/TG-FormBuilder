
import fs from 'fs';
import path from 'path';
import { PassThrough } from 'stream';
import mime from 'mime-types';
import { blobServiceClient, imageClient} from '../config/azureBlobConfig.js';
import { encryptBuffer, decryptBuffer,   extractBlobPath } from './cryptedUtili.js';



import { ApplicationError } from './errorHandler.js';
import crypto from "crypto"
import { fileTypeFromBuffer } from 'file-type';

 



const DATA_URI_REGEX = /^data:([^;]+);base64,(.+)$/;

const isBlobUrl = (value) => typeof value === "string" && /^https?:\/\//i.test(value);

const parseBase64File = async (value, fallbackName) => {
  const match = value.match(DATA_URI_REGEX);
  const base64 = match ? match[2] : value;
  const buffer = Buffer.from(base64, "base64");
  const detectedType = await fileTypeFromBuffer(buffer);
  const contentType = match?.[1] || detectedType?.mime || "application/octet-stream";
  const ext = detectedType?.ext ? `.${detectedType.ext}` : `.${mime.extension(contentType) || "bin"}`;

  return {
    buffer,
    originalname: `${fallbackName}${ext}`,
    mimetype: contentType,
  };
};

async function uploadSingleFileToAzureBlob(file, fileName = "image") {
  try {
    if (!file) {
      throw new Error("No file provided");
    }

    if (isBlobUrl(file)) {
      return {
        success: true,
        blobName: path.basename(new URL(file).pathname),
        url: file,
      };
    }

    if (typeof file === "string") {
      file = await parseBase64File(file, fileName);
    } else if (Buffer.isBuffer(file)) {
      file = { buffer: file, originalname: `${fileName}.bin` };
    } else if (file.data || file.base64) {
      file = await parseBase64File(file.data || file.base64, file.originalname || file.name || fileName);
    } else if (file.url || file.blobUrl) {
      return {
        success: true,
        blobName: path.basename(new URL(file.url || file.blobUrl).pathname),
        url: file.url || file.blobUrl,
      };
    }

    const buffer = file.buffer || (file.path ? await fs.promises.readFile(file.path) : null);
    if (!buffer) {
      throw new Error("Unable to read file buffer");
    }

    const ext = path.extname(file.originalname || file.name || ".pdf") || ".bin";
    const uniqueId = crypto.randomBytes(8).toString("hex");
    const blobName = `${fileName}-${uniqueId}${ext}`;

    const createResponse = await imageClient.createIfNotExists();
    if (createResponse.succeeded) {
      await imageClient.setAccessPolicy("blob");
    }

    const blockBlobClient = imageClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype || mime.lookup(ext) || "application/octet-stream",
      },
    });



    return {
      success: true,
      blobName,
      url: blockBlobClient.url,
    };
  } catch (error) {


    return {
      success: false,
      error: error.message || "File upload failed",
    };
  }
}

export async function uploadFileToAzureBlob(file, fileName = "image") {
  if (Array.isArray(file)) {
    const files = await Promise.all(file.map((item, index) => uploadSingleFileToAzureBlob(item, `${fileName}-${index + 1}`)));
    const failed = files.find((item) => !item.success);

    if (failed) {
      return {
        success: false,
        files,
        error: failed.error || "One or more files failed to upload",
      };
    }

    return {
      success: true,
      files,
      urls: files.map((item) => item.url),
    };
  }

  return uploadSingleFileToAzureBlob(file, fileName);
}

export async function uploadChecklistImageValue(value, fileName = "image") {
  if (value === undefined || value === null || value === "") return null;

  if (Array.isArray(value) && value.length === 0) return null;

  const uploadResult = await uploadFileToAzureBlob(value, fileName);
  if (!uploadResult.success) {
    throw new ApplicationError(uploadResult.error || "Image upload failed", 400);
  }

  if (uploadResult.urls) return JSON.stringify(uploadResult.urls);
  return uploadResult.url;
}














export async function deleteAzureBlob(blobUrl) {
  const url = new URL(blobUrl);
  const [, containerName, ...blobParts] = url.pathname.split('/');
  const blobName = blobParts.join('/');

  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(blobName);

  await blobClient.deleteIfExists();
}




export async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (data) => chunks.push(data));
    readableStream.on('end', () => resolve(Buffer.concat(chunks)));
    readableStream.on('error', reject);
  });
}



export function bufferToStream(buffer) {
  const stream = new PassThrough();
  stream.end(buffer);
  return stream;
}




const normalizeFileUrls = (fileUrl) => {
  if (Array.isArray(fileUrl)) return fileUrl;

  if (typeof fileUrl === "string") {
    try {
      const parsed = JSON.parse(fileUrl);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {}
  }

  return [fileUrl];
};

const downloadSingleAzureImage = async (fileUrl) => {
  const blobPath = decodeURIComponent(extractBlobPath(fileUrl));
  const [containerName, ...blobParts] = blobPath.split('/');
  const blobName = blobParts.join('/');

  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(blobName);

  const downloadBlockBlobResponse = await blobClient.download();
  const file = await streamToBuffer(downloadBlockBlobResponse.readableStreamBody);

  const type = await fileTypeFromBuffer(file);
  const imageMime = type?.mime || 'application/octet-stream';

  const base64String = file.toString('base64');
  return `data:${imageMime};base64,${base64String}`;
};

export const AzureImageDownloader = async (fileUrl) => {


  try {
    const urls = normalizeFileUrls(fileUrl).filter(Boolean);
    const dataUris = await Promise.all(urls.map((url) => downloadSingleAzureImage(url)));

    return Array.isArray(fileUrl) || dataUris.length > 1 ? dataUris : dataUris[0];
  } catch (error) {
    console.error("AzureImageDownloader error:", error);
    throw new ApplicationError(
      'Failed to download document'
    );
  }
};


export const AzureImageListDownloader = async (fileUrls) => {
  try {
    return AzureImageDownloader(fileUrls);
  } catch (error) {
    throw new ApplicationError('Failed to download document(s)');
  }
};
