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
import checkListRoute from "./api/checklists/route.js"



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



const PORT = process.env.PORT || config.PORT || 6000;







app.use("/api/v1/auth", authRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/checklists", checkListRoute);







app.get("/", (req, res) => {
  return res.status(200).json({
    code: 200,
    status: "success",
    message: ' BACKEND SERVER Service up and running',
  }); 
})





app.use(errorHandler)


app.use((req, res) => {
  return res.status(404).json({
    code: 404,
    status: "failed",
    message: 'End-point not found',
    error: "An Error Occured",
  });
});







const startServer = async () => {
  await connectDB();
  


  
  app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
  });
};

startServer();
