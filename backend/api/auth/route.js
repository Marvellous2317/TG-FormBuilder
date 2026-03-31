import router from "express";
import { AuthController } from "./controller.js";
import { UserController } from "../user/controller.js";
import { sigInMiddleware, sigUpMiddleware, accountVerificationMiddleware, changePasswordMiddleware } from "./middleware.js";
import { forgotPasswordMiddleware } from "../user/middleware.js";
import { adminRequired, isAuthenticated } from "../middlewares/authorization.js";

let route = router.Router();

route.post("/signin", sigInMiddleware, AuthController.signinApi);
route.post("/verify-account", accountVerificationMiddleware, isAuthenticated, AuthController.verifyEmailApi);
route.post("/request-otp", isAuthenticated, AuthController.requestOtpApi);

route.post("/change-password", isAuthenticated, changePasswordMiddleware, AuthController.changePasswordApi);


route.post("/forgot-password/:email", forgotPasswordMiddleware, UserController.forgotPasswordApi);
route.post("/reset-password", UserController.resetPasswordApi);

export default route;
