
import {UserRepository} from './repository.js';
import { ApplicationError } from '../../utils/errorHandler.js';

export class UserController {



    static async changePasswordApi(req, res, next) {
    const userId = req.userId
    const data = req.body
    try {
      const result = await UserRepository.changePassword(userId, data);
    
      return res.status(200).json({ data: result });
     } catch (error) {

    next(error)
  }
}

    static async forgotPasswordApi(req, res, next) {

    const data = req.body
    const email = req.params.email
    try {
      const result = await UserRepository.forgotPassword({data, email});
    
      return res.status(200).json({ data: result });
     } catch (e) {

    next(e)
  }
}





    static async resetPasswordApi(req, res, next) {

    const email = req.body.email
    try {
      const result = await UserRepository.resetPassword(email);
    
      return res.status(200).json({ data: result });
     } catch (e) {

    next(e)
  }
}


  static async createUserDetails(req, res, next) {
    const userId = req.userId


    try {
         
         
      const details = await UserRepository.createUserDetails(userId, req.body);
      res.json({ success: true, data: details });
    } catch (error) {
     next(error)
    }
  }



    static async updateUserDetails(req, res, next) {
    const userId = req.userId


    try {
         
         
      const details = await UserRepository.updateUserDetails(userId, req.body);
      res.json({ success: true, data: details });
    } catch (error) {
     next(error)
    }
  }

  
  static async getUser(req, res, next) {
     const userId = req.userId
  
    try {
      const {user, nextBadgeInfo,progress} = await UserRepository.getUser(userId);
      res.json({ success: true, user, nextBadgeInfo,progress });
    } catch (error) {
      next(error)
    }
  }




  

  static async uploadSignatureApi(req, res, next) {
    try {
            let userId = req.userId
            const {signature} = req.body
         
            const user = await UserRepository.uploadSignature({userId: userId, signature});
            res.json({ success: true, data: user });
          } catch (error) {
           next(error)
          }

  }



    static async getUserPictureApi(req, res, next) {
    try {
            let userId = req.userId
        
      
            const user = await UserRepository.getUserPicture(userId);
            res.json({ success: true, data: user });
          } catch (error) {
           next(error)
          }

  }
  

  
  static async deleteAccountApi(req, res, next) {
    try {
            let userId = req.userId
            const user = await UserRepository.deleteAccount(userId);
            res.json({ success: true, data: user });
          } catch (error) {
           next(error)
          }

  }
  
}
