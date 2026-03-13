import jwt from "jsonwebtoken";
import ErrorHandler from "./error.js";
import { ENV } from "../lib/ENV.js";
import User from "../models/user.model.js";

export const isAuthenticated = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return next(new ErrorHandler("Please login to access this resource.", 401));
  }

  const decoded = jwt.verify(token, ENV.JWT_SECRET);
  if (!decoded) {
    return next(new ErrorHandler("Invaild Token.", 401));
  }

  //finding which uer this token belongs to
  const user = await User.findById(decoded._id).select(
    "-resetPasswordToken,-resetPasswordExpire",
  );
  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  req.user = user;
  next();
};

export const isAuthorized = (...roles) => {
 return (req,res,next) => {
  if(!roles.includes(req.user.role)){
    return next(new ErrorHandler(
      `Role: ${req.user.role} is not allowed to access this resource`,
       403
    ))
  }
  next()
 }
};

//_id shpuld be the same as we did in generate token while creating a token
//...roles means we will get an string and comapre this string to req.user.role
// Adminnnnzee != Admin but it will return true cause admin word exist in fiest word
