import { ENV } from "../lib/ENV.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import User from "../models/user.model.js";
import { generateForgotPasswordEmailTemplate } from "../utils/emailTemplates.js";
import { generateToken } from "../utils/generateToken.js";
import crypto from "crypto";
import {sendEmail} from "../services/emailService.js"

export const register = asyncHandler(async(req,res,next)=> {

  const {email , name, password, role} = req.body;

  if(!email || !name || !password || !role) {
    return next (new ErrorHandler("All fields are required.", 400))
  }

  let user = await User.findOne({email})
  if(user){
      return next(new ErrorHandler("User already exists", 400))
  }

  const userInfo = {
    email,
    name,
    password,
    role,
  }

   user =  await User.create(userInfo);

   generateToken(user, 201 , "User register successfully.", res)

  // res.status(201).json({
  //   success: true,
  //   user,
  // })


})

export const login = asyncHandler(async(req,res,next)=> {
  const {email, password} = req.body;
  if(!email || !password ){
    return next(new ErrorHandler("All fields are required.", 400))
  }
  const user = await User.findOne({email}).select("+password");
  if(!user){
    return next(new ErrorHandler("Invalid credentails.",401))
  }

  const isPasswordMatched = await user.comparePassword(password);
  if(!isPasswordMatched){
    return next(new ErrorHandler("Invalid credentails.",401))
  }

  generateToken(user, 200, "User logged in successfully.",res)

})

export const getUser = asyncHandler(async(req,res,next)=> {
  // const user = req.user;
  const user = await User.findById(req.user._id).populate("assignedStudents")
  res.status(200).json({
    success:true,
    user
  })
})

export const logout = asyncHandler(async(req,res,next)=> {
  res
  .status(200)
  .cookie( "token", null,
   { expries: new Date(Date.now()),
    httpOnly:true,
    sameSite: "none",
    secure: ENV.NODE_ENV === "production",
  }).json({
    success: true,
    messaged: "User logged out successfully"
})
})

export const forgotPassword = asyncHandler(async(req,res,next)=> {
  const {email} = req.body;
  if(!email){
    return next(new ErrorHandler("Email is required.",400))
  }

  const user = await User.findOne({email});
  if(!user){
    return next(new ErrorHandler("User not found this email.",404))
  }

const resetToken = user.getResetPasswordToken();

await user.save({validateBeforeSave: false});

const resetPasswordUrl = `${ENV.FRONTEND_URL}/reset-password?token=${resetToken}`

const message = generateForgotPasswordEmailTemplate(resetPasswordUrl);

try {
  await sendEmail({
    to:user.email,
    subject: "FYP SYSTEM - 🔒 Password Reset Request",
    message
  });
  res.status(200).json({
    success: true,
    message: `Email sent to ${user.email} successfully.`,
  })
} catch (error) {
   user.resetPasswordToken = undefined;
   user.resetPasswordExpire = undefined;
   await user.save({validateBeforeSave: false});
   return next(new ErrorHandler(error.message || "Cannot send email", 500))
}



})

export const resetPassword = asyncHandler(async(req,res,next)=>{
    const { newPassword , newConfirmPassword } = req.body;

    const {token}= req.params;
    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");


    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: {$gt: Date.now()},
    });
    if(!user){
      return next(new ErrorHandler("Invaild or expired password reset token.", 404))
    }

    // const isPasswordMatched = user.comparePassword(currentPassword);
    // if(!currentPassword){
    //   return next(new ErrorHandler("Incorrect Current Password.", 400))
    // }

    if(!newPassword || !newConfirmPassword){
      return next(new ErrorHandler("Please provide all required fields.",400))
    }

    if(
      newPassword.length < 8 ||
      newPassword.length > 16
    ){
      return next(new ErrorHandler("New password must be between 8 and 16 characters.", 400))
    }

    if(newConfirmPassword.length < 8 || newConfirmPassword.length > 16){
      return next(new ErrorHandler("New confirm password must be between 8 and 16 characters,", 400))
    }

    if(newPassword !== newConfirmPassword){
      return next(new ErrorHandler("Confirm new password does not match new password.",400))
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined ;

    await user.save();

    generateToken(user, 200, "Password reset successfully.", res)

})

// const tokenG = (id, res) => {
//   const tokeen = jwt.sign({id}, ServiceWorkerContainer, {
//     expreies : 2days
//   } )

//   res.cookie(onkeydown, "jwt", {
//     maxAge :15DOMMatrixReadOnly
//     httpOnly :true
//     sameSite : StrictMode,
//     secure : Nide-env=== production
//   })
// }
