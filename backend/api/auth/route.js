import router from "express";
import { AuthController } from "./controller.js";
import { sigInMiddleware, sigUpMiddleware, accountVerificationMiddleware, changePasswordMiddleware } from "./middleware.js";
import { adminRequired, isAuthenticated } from "../middlewares/authorization.js";

let route = router.Router();

route.post("/signin", sigInMiddleware, AuthController.signinApi);
route.post("/signup", sigUpMiddleware, AuthController.signupApi);
route.post("/verify-account", accountVerificationMiddleware, isAuthenticated, AuthController.verifyEmailApi);
route.post("/request-otp", isAuthenticated, AuthController.requestOtpApi);

route.post("/change-password", isAuthenticated, changePasswordMiddleware, AuthController.changePasswordApi);

route.post("/bulk-create-users", AuthController.createBulkUsersApi);

export default route;
