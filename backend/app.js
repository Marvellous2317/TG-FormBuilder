import  express  from "express";
import  cors  from 'cors';
import  bodyParser from 'body-parser';
import  helmet from 'helmet';
import  xss   from 'xss-clean';
import  hpp from'hpp';
import  compression from 'compression';
import morgan from "morgan";


import { errorHandler } from "./utils/errorHandler.js";
import  {connectDB} from  "./config/database.js";
import config   from "./appConfig.js";

import authRoute from "./api/auth/route.js"
import adminRoute from "./api/admin/route.js"
import userRoute from "./api/user/route.js"
import supervisor from "./api/supervisor/route.js"
import caseRoute from "./api/case/route.js"
import managerRoute from "./api/manger/route.js"

import { importStates,createBulkSku } from "./utils/db.js";

import { sendExpoNotificationTesting, sendPushNotification } from "./utils/notification.js";
import { globalRateLimiting ,endpointLimiters, unprotectedRoute} from "./utils/rateLimiting.js";
import { checkAuth } from "./api/user/middleware.js";







const app = express();
app.use(express.json());



app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://appinterface.tolaram.com",
    "https://tolaram.com"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.set("trust proxy", (ip) => {
  if (!ip || !ip.match(/\d+\.\d+\.\d+\.\d+/)) return false;
  return ip === "127.0.0.1" || ip === "::1";
});




// app.use((req, res, next) => {
//   if (unprotectedRoute.includes(req.path)) return next();
//   checkAuth(req, res, () => {
//     globalRateLimiting(req, res, next);
//   });
// });




// Object.entries(endpointLimiters).forEach(([path, limiter]) => {
//   app.use(path, limiter);
// });

app.use(helmet());



app.use(xss());

app.use(hpp());

app.use(compression());


app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());







app.use(morgan('combined'));



const PORT = process.env.PORT || config.PORT || 5005;





globalThis.sendPushNotification = sendPushNotification


app.use("/api/v1/auth", authRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/supervisor", supervisor);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/case", caseRoute);

app.use("/api/v1/manager", managerRoute);







app.get("/", (req, res) => {
  return res.status(200).json({
    code: 200,
    responseCode:"00",
    status: "success",
    message: ' BACKEND SERVER Service up and running local',
  }); 
})





app.use(errorHandler)




app.use((req, res) => {
  return res.status(404).json({
    code: 404,
    responseCode:"99",
    status: "failed",
    message: 'End-point not found',
    error: "An Error Occured",
  });
});





const startServer = async () => {
  await connectDB();
  
  // Seed default roles
  const { seedDefaultRoles } = await import("./models/model.js");
  await seedDefaultRoles();
  
  //await importStates();
  //await createBulkSku()
  //await sendExpoNotificationTesting()

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer();
