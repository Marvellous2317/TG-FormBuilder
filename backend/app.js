import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import helmet from "helmet";
import xss from "xss-clean";
import hpp from "hpp";
import compression from "compression";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { errorHandler } from "./utils/errorHandler.js";
import { connectDB } from "./config/database.js";
import config from "./appConfig.js";

import authRoute from "./api/auth/route.js";
import adminRoute from "./api/admin/route.js";
import userRoute from "./api/user/route.js";
import checkListRoute from "./api/checklists/route.js";
import { EamilTransporter } from "./config/emailConfig.js";

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://digiforms.tolaram.com",
      "https://tolaram.com",
      "https://digiforms.tolaram.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.set("trust proxy", 1);

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = req.headers["x-real-ip"];
  if (realIp) {
    return realIp;
  }

  return req.ip || req.connection?.remoteAddress || "unknown";
};

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req) => getClientIp(req), // Use device IP as the key
  message: {
    code: 429,
    status: "error",
    message: "Too many requests from this IP, please try again later.",
  },
  skipSuccessfulRequests: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  message: {
    code: 429,
    status: "error",
    message:
      "Too many authentication attempts from this IP, please try again after 15 minutes.",
  },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  message: {
    code: 429,
    status: "error",
    message: "Too many API requests from this IP, please try again later.",
  },
});

app.use(globalLimiter);


app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      // connectSrc: ["'self'", "https://tgpackagingappprd.azurewebsites.net"],
      // fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
}));

app.use(xss());

app.use(mongoSanitize());

app.use(
  hpp({
    whitelist: [],
  }),
);

app.use(compression());

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()",
  );
  next();
});

app.use(morgan("combined"));

const PORT = process.env.PORT || config.PORT || 5000;

app.get("/api/v1", (req, res) => {
  return res.status(200).json({
    code: 200,
    status: "success",
    message: "API Health Check - Service up and running",
  });
});

app.use("/api/v1/auth", authLimiter, authRoute);

app.use("/api/v1/user", apiLimiter, userRoute);
app.use("/api/v1/admin", apiLimiter, adminRoute);
app.use("/api/v1/checklists", apiLimiter, checkListRoute);

const distPathAzure = path.join(__dirname, "dist");
const distPathLocal = path.join(__dirname, "..", "frontend", "dist");
const distPath = fs.existsSync(path.join(distPathAzure, "index.html"))
  ? distPathAzure
  : distPathLocal;

app.use("/assets", express.static(path.join(distPath, "assets")));
app.use(express.static(distPath, { index: false }));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }
  const indexPath = path.join(distPath, "index.html");
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  next();
});

app.use(errorHandler);

app.use((req, res) => {
  return res.status(404).json({
    code: 404,
    status: "failed",
    message: "End-point not found",
    error: "An Error Occured",
  });
});

const startServer = async () => {
  //await connectDB();
  app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
  });
};

startServer();
