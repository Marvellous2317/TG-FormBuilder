
import { ApplicationError } from "../../utils/errorHandler.js";
import { AuthRepository } from "./repository.js";
import ResponseManager from "../../utils/responseManager.js";

export class AuthController {
  static async signinApi(req, res, next) {
    const { email, password } = req.body;

    try {
      const data = await AuthRepository.signin({ email, password });
      return ResponseManager.success(res, data, 200, data.message);
    } catch (e) {
      next(e);
    }
  }

  static async signupApi(req, res, next) {
    try {
      const response = await AuthRepository.signup(req);
      return ResponseManager.success(res, response, 201, response.message);
    } catch (err) {
      next(err);
    }
  }

  static async verifyEmailApi(req, res, next) {
    try {
      const response = await AuthRepository.verifyEmail(req);
      return ResponseManager.success(res, response, 200, response.message);
    } catch (err) {
      next(err);
    }
  }

  static async requestOtpApi(req, res, next) {
    try {
      const response = await AuthRepository.requestForOtp(req);
      return ResponseManager.success(res, response, 200, response.message);
    } catch (err) {
      next(err);
    }
  }

  static async changePasswordApi(req, res, next) {
    try {
      const response = await AuthRepository.changePassword(req);
      return ResponseManager.success(res, response, 200, response.message);
    } catch (err) {
      next(err);
    }
  }



  static async createBulkUsersApi(req, res, next) {
    try {
      const response = await AuthRepository.createBulkUsers();
      return ResponseManager.success(res, response, 200, response.message);
    } catch (err) {
      next(err);
    }
  }
}
