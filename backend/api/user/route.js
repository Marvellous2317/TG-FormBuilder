import express from 'express';
import  {UserController} from './controller.js';
import { isAuthenticated } from '../middlewares/authorization.js';
import {  userDetailedMiddleware ,resesetPasswordMiddleware,forgotPasswordMiddleware, changePasswordMiddleware, checkAuth, validatePictureUpload} from './middleware.js';




const router = express.Router();


router.post(
  '/update-user-details',
  checkAuth,
  UserController.updateUserDetails
);
router.post(
'/create-user-details',
userDetailedMiddleware,
  checkAuth,
  UserController.createUserDetails
);


router.get(
  '/get-details',
  checkAuth,
  UserController.getUser
);

router.post(
  '/forgot-password/:email',
  forgotPasswordMiddleware,
  UserController.forgotPasswordApi
);

router.post(
  '/reset-password',
  UserController.resetPasswordApi
);

router.post(
  '/change-password',
  changePasswordMiddleware,
  checkAuth,
  UserController.changePasswordApi
);


router.post(
  '/upload-signature',
  checkAuth,
  UserController.uploadSignatureApi
);


router.get(
  '/get-picture',
  checkAuth,
  UserController.getUserPictureApi
);


router.delete(
  '/delete-account',
  checkAuth,
  UserController.deleteAccountApi
);







export default router;

