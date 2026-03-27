import { ValidationError } from "../../utils/errorHandler.js";





import jwt from 'jsonwebtoken';
 

import config from '../../appConfig.js';




export async function decodeToken(token) {
  try {
    const decoded = jwt.verify(token, config.SECRET_KEY, { algorithms: [config.algorithm] });

    const userId = decoded.id;
 
   
    if (!userId) return null;


    return userId; 
  } catch {
    return null;
  }
}











export function checkAuth(req, res, next) {
  if (req.method === "OPTIONS") return next();
  let token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ error: 'Token is missing' });
  }

  if (token.startsWith('Bearer ')) {
    token = token.split(' ')[1];
  }

  decodeToken(token)
    .then((userId) => {
      if (!userId) {
        return res.status(401).json({ error: 'Invalid user' });
      }
      req.userId = userId;
      next();
    })
    .catch((err) => {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
      }
      return res.status(401).json({ error: `Auth failed: ${err.message}` });
    });
}





export const searchUserMiddleware = (req, res, next) => {
  const email = req.query.email || req.body.email;

  if (!email) {
    return res.status(400).json({
      msg: 'Email parameter is required',
      responseCode: 400
    });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      msg: 'Invalid email format',
      responseCode: 400
    });
  }

  next(); 
};





export const userDetailedMiddleware = (req, res, next) => {
  const { address, phone, longitude, latitude } = req.body;


  if (!address || typeof address !== "string" || address.trim().length < 3) {
    return res.status(400).json({ error: "Invalid address" });
  }

  if (!phone || typeof phone !== "string" || phone.length !== 11) {
    return res.status(400).json({ error: "Invalid phone number" });
  }

  if (!longitude) {
    return res.status(400).json({ error: "Invalid longitude format" });
  }

  if (!latitude) {
    return res.status(400).json({ error: "Invalid latitude format" });
  }

  next();
};



export function resesetPasswordMiddleware(req, res, next) {

  const { email, ...extraFields } = req.body;
  const extraKeys = Object.keys(extraFields);
        if (extraKeys.length > 0) throw new  ValidationError(`${extraKeys.join(", ") } not required`);
        

  if (!email) {
    return res.status(400).json({
      success: false,
      errors: ["Email is required"],
    });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      errors: ["Invalid email format"],
    });
  }

  req.body.email = email.trim().toLowerCase();

  next();
}




export const forgotPasswordMiddleware = (req, res, next) => {
  try {
    const { otp, password, ...extraFields } = req.body;
    const email = req.params.email

    if (!email) {
      throw new ValidationError(`Email not required`);
    }

    const extraKeys = Object.keys(extraFields);
    if (extraKeys.length > 0) {
      throw new ValidationError(`${extraKeys.join(", ")} not required`);
    }

 
    if (otp === undefined || otp === null) {
      throw new ValidationError("otp required");


    }
    if (password === undefined || password.length<5) {
      throw new ValidationError("Invalid Password");
    }


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email)) {
  throw new ValidationError("Invalid email format");
}

    const otpStr = String(otp);

    if (!/^\d{6}$/.test(otpStr)) {
      throw new ValidationError("otp must be exactly 6 digits");
    }

    next();
  } catch (error) {
    next(error);
  }
};



export const changePasswordMiddleware = (req, res, next) => {
  const { newPassword, password , ...extraFields} = req.body;



         const extraKeys = Object.keys(extraFields);
        if (extraKeys.length > 0) throw new  ValidationError(`${extraKeys.join(", ") } not required`);
        

      if (!newPassword || !password)  throw new  ValidationError("All fields required.")

      if (typeof password !== 'string' || password.length < 5) throw new  ValidationError('Password must be at least 4 characters')
      if (typeof newPassword !== 'string' || newPassword.length < 5) throw new  ValidationError('new Password must be at least 4 characters')


  next();
};





export const validatePictureUpload = (req, res, next) => {
  try {
  
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({ message: "Uploaded file must be an image" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Error validating request", error });
  }
};