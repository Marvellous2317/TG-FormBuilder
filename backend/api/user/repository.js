
import { col, fn, literal, Op, Sequelize } from "sequelize";
import fs from "fs";
import { ApplicationError, ValidationError } from "../../utils/errorHandler.js";
import { User, Role, Company, Verification, } from "../../models/index.js";
import { generateJWT, generateOpt } from "../auth/helper.js";
import { sendVerificationMail } from "../../views/index.js";
import { getStateAndLGA } from "../../utils/index.js";
import { AzureImageDownloader, uploadFileToAzureBlob } from "../../utils/azureService.js";
import { sequelize } from "../../config/database.js";


export class UserRepository {



static async updateUser(userId, data) {
     const user = await User.findByPk(userId);
      if (!user) throw new ApplicationError("User not found");

    try {
   

      await user.update(data);
      return user;
    } catch (error) {
     throw new ApplicationError("An error occur");
    }
  }

   

  static async changePassword(userId, data) {

    const password = data.password;
    const newPassword = data.newPassword;

    if (!password || password.length < 5) {
      throw new ApplicationError("Password must be greater than four characters", 400);
    }

    const user = await User.findOne({
      where: { userId: userId}
    });

    if (!user) {
      throw new ApplicationError("User not found", 404);
    }

     const password_check =await user.checkPassword(password)
    if (!password_check) throw new ApplicationError("Invalid Credentials", 400)
  try {
    await user.setPassword(newPassword); 
    await user.save();

    const token = generateJWT(user.userId);

    return { 
      token, 
      user, 
      message: 'Password changed successfully' 
    };

  } catch (error) {
   
    throw new ApplicationError("An error occur");
  }
}



  static async forgotPassword({data, email}) {

       const {password, otp} = data
    if (!password || password.length < 5) {
      throw new ApplicationError("Password must be greater than four characters", 400);
    }


 
    const user = await User.findOne({
      where: { email: email },
   
    });

    if (!user) {
      throw new ApplicationError("User not found", 404);
    }

    let verifyOtp = await Verification.findOne({
      where:{
        email :email,
        otp : otp
      }
    })

    if (!verifyOtp) throw new ApplicationError("Invalid OTP", 400);
    if (verifyOtp.expiry < new Date()) throw new ApplicationError("OTP expired", 400);
  try {
    await user.setPassword(password); 
    await user.save();
    await verifyOtp.destroy();
    const token = generateJWT(user.userId);
    return { 
      token, 
      user, 
      message: 'Password changed successfully' 
    };

  } catch (error) {
   
    throw new ApplicationError("An error Occur");
  }
  }


  
  static async resetPassword(email) {
      const user = await User.findOne({
      where: { email: email }

    });

    if (!user) {
      throw new ApplicationError("User not found", 404);
    }

  try {


    const {otp, expiry} = generateOpt()
    
   await Verification.create({ email: email, otp, expiry });
  
    await sendVerificationMail({email:user.email ,otp, firstName:user.firstName});

    return { 
      message: 'OTP sent to your email successfully' 
    };

  } catch (error) {
   
    throw new ApplicationError("An Error occur");
  }
  }








  static async getUser(userId) {
 
    try {
      let user = await User.findOne( {
        where:{userId : userId},
        include: [{ model: UserDetails, as: "userDetails" }],
        attributes: { exclude: ["password"] },
      });
      if (!user) throw new ValidationError("User not found");
      if(user.role.includes("user")){
      const nextBadgeInfo =  BadgeService.getNextBadgeInfo(user.badge, user.totalClosedCases);
      let  progress = BadgeService.calculateProgress(user.badge, user.totalClosedCases);
      progress = Math.round(progress)
      return {user, nextBadgeInfo,progress};
      }

  return {user};

    } catch (error) {
      throw error;
    }
  }







static async uploadSignature({userId, signature}) {
      const user = await User.findByPk(userId);
    if (!user) throw new ApplicationError("User not found");

  try {

    
    await user.update(
      { signature: signature }, 
      { where: { userId } }
    );


    return {message : "Signature uploaded successfully"};
  } catch (error) {
    throw error;
  }
}



static async deleteAccount(userId) {
    const user = await User.findOne({ where: { userId } });

    if (!user) {
      throw new ApplicationError(`No user found with ID:`, 400);
    }
  try {
  
    await user.destroy()
    return { success: true, message: "Account deleted successfully" };
  } catch (error) {
    throw new ApplicationError(`Failed to delete account`);
  }
}

}

