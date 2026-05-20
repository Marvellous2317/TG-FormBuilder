
import {UserRepository} from './repository.js';
import { ApplicationError } from '../../utils/errorHandler.js';
import ResponseManager from '../../utils/responseManager.js';

export class UserController {



    static async changePasswordApi(req, res, next) {
    const userId = req.userId
    const data = req.body
    try {
      const result = await UserRepository.changePassword(userId, data);
    
      return ResponseManager.success(res, result, 200, result.message || "Password changed successfully");
     } catch (error) {

    next(error)
  }
}

    static async forgotPasswordApi(req, res, next) {

    const data = req.body
    const email = req.params.email
    if (!email) {
      return ResponseManager.error(res, "ValidationError", "Email is required", 400);
    }
    try {
      const result = await UserRepository.forgotPassword({data, email});
    
      return ResponseManager.success(res, result, 200, result.message || "OTP sent to email");
     } catch (e) {

    next(e)
  }
}





    static async resetPasswordApi(req, res, next) {

    const email = req.body.email
    try {
      const result = await UserRepository.resetPassword(email);
    
      return ResponseManager.success(res, result, 200, result.message || "Password reset successfully");
     } catch (e) {

    next(e)
  }
}


  static async createUserDetails(req, res, next) {
    const userId = req.userId


    try {
         
         
      const details = await UserRepository.createUserDetails(userId, req.body);
      return ResponseManager.success(res, details, 200, "User details created successfully");
    } catch (error) {
     next(error)
    }
  }



    static async updateUserDetails(req, res, next) {
    const userId = req.userId


    try {
        
      const details = await UserRepository.updateUserDetails(userId, req.body);
      return ResponseManager.success(res, details, 200, "User details updated successfully");
    } catch (error) {
     next(error)
    }
  }

  
  static async getUser(req, res, next) {
     const userId = req.userId
  
    try {
      const {user, nextBadgeInfo,progress} = await UserRepository.getUser(userId);
      return ResponseManager.success(res, { user, nextBadgeInfo, progress }, 200, "User fetched successfully");
    } catch (error) {
      next(error)
    }
  }




  

  static async uploadSignatureApi(req, res, next) {
    try {
            let userId = req.userId
            const {signature} = req.body
         
            const user = await UserRepository.uploadSignature({userId: userId, signature});
            return ResponseManager.success(res, user, 200, "Signature uploaded successfully");
          } catch (error) {
           next(error)
          }

  }



    static async getUserPictureApi(req, res, next) {
    try {
            let userId = req.userId
        
      
            const user = await UserRepository.getUserPicture(userId);
            return ResponseManager.success(res, user, 200, "Picture fetched successfully");
          } catch (error) {
           next(error)
          }

  }
  

  
  static async deleteAccountApi(req, res, next) {
    try {
            let userId = req.userId
            const user = await UserRepository.deleteAccount(userId);
            return ResponseManager.success(res, user, 200, "Account deleted successfully");
          } catch (error) {
           next(error)
          }

  }

  static async getUserAnalyticsApi(req, res, next) {
    try {
      const user = req.user;
      if (!user) {
        return ResponseManager.error(res, "AuthorizationError", "Unauthorized access", 401);
      }
      const result = await UserRepository.getUserAnalytics(user);
      return ResponseManager.success(res, result, 200, "User analytics fetched successfully");
    } catch (error) {
      next(error);
    }
  }
  
}
