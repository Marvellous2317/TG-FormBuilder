import express from 'express';
import  {UserController} from './controller.js';
import { isAuthenticated } from '../middlewares/authorization.js';
import {  userDetailedMiddleware ,resesetPasswordMiddleware,forgotPasswordMiddleware, changePasswordMiddleware, checkAuth, validatePictureUpload, updateUserDetailsMiddleware, validateSignatureUpload} from './middleware.js';




const router = express.Router();


router.put(
  '/me',
  checkAuth,
  updateUserDetailsMiddleware,
  UserController.updateUserDetails
);


router.get(
  '/me',
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
  validateSignatureUpload,
  UserController.uploadSignatureApi
);


router.delete(
  '/delete-account',
  checkAuth,
  UserController.deleteAccountApi
);


router.get(
  '/analytics',
  isAuthenticated,
  UserController.getUserAnalyticsApi
);



export default router;

