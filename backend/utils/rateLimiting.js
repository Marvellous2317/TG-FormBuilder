
import rateLimit from "express-rate-limit";
import { isIP } from "net";
import ipRangeCheck from "ip-range-check";


const azureProxyRanges = [
  "40.74.0.0/15",
  "40.76.0.0/14",
  "40.80.0.0/12",
  "40.96.0.0/12",
  "40.112.0.0/13",
  "40.123.0.0/16",
];

const trustedLocalRanges = [
  "127.0.0.1",
  "::1",
  "192.168.0.0/16",
  "10.0.0.0/8",
  "172.16.0.0/12",
];


const getClientIP = (req) => {
  const xForwardedFor = req.get("x-forwarded-for");
  if (xForwardedFor) return xForwardedFor.split(",")[0].trim();

  return req.get("x-real-ip") ||
         req.get("cf-connecting-ip") ||
         req.socket?.remoteAddress ||
         req.ip;
};

const extractUserId = (req) => {
  return req?.userId ||
         req.get("x-user-id") ||
         null;
};


const isAzureRuntime = (ip) => {
  if (!ip || !isIP(ip)) return false;
  return ipRangeCheck(ip, azureProxyRanges) || ipRangeCheck(ip, trustedLocalRanges);
};




export const globalRateLimiting = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const userId = extractUserId(req);
    if (userId) return `user-${userId}`;

    const xForwardedFor = req.headers['x-forwarded-for'];
    if (xForwardedFor) return `ip-${xForwardedFor.split(',')[0].trim()}`;

    const remoteIp = req.socket?.remoteAddress || req.ip || 'unknown';
    return `ip-${remoteIp}`;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
    });
  },
});



export const endpointLimiters = {
  "/api/v1/case/create-case": rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      const userId = extractUserId(req);
      return userId || getClientIP(req);
    },
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: "Too many requests to this endpoint. Please try again later.",
      });
    },
  }),
  "/api/v1/auth/request-otp": rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      const userId = extractUserId(req);
      return userId || getClientIP(req);
    },
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: "Too many requests to this endpoint. Please try again later.",
      });
    },
  }),
};





export const unprotectedRoute = [
  "/",
  "/api/v1/auth/signin",
  "/api/v1/auth/signup",
  "/api/v1/auth/request-otp",
  "/api/v1/user/forgot-password/:email",
  "/api/v1/user/reset-password",
  "/api/v1/admin/signin",
  "/generate-report"
];



