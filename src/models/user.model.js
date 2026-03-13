import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { ENV } from "../lib/ENV.js";

const userSchema = new mongoose.Schema({
  name:{
    type: String,
    required: [true, "Please neter you name"],
    trim: true,
    maxLength: [50, "Name is required."]
  },
  email:{
    type: String,
    required: [true, "Email is required."],
    unique: true,
    lowercase: true,
    trim: true,
      match: [
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    "Please enter a valid email address"
  ],
  },
  password: {
    type:String,
    required: [true, "Password is required."],
    select: false,
    minLength: [8, "Password must be 8 characters long."],
  },
  role: {
    type: String,
    enum: ["Student", "Teacher", "Admin"],
    default: "Student"
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  department: {
    type:String,
    trim : true,
    default: null,
  },
  experties: {
    type:[String],
    default: [],
  },
  maxStudents: {
    type: Number,
    default: 10,
    min: [1, "Min studnets must be atleast 1."]
  },
 assignedStudents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  ],
  supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
  },
  project :{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",// table
    default: null
  }

},{timestamps:true})

// userSchema.pre("save", async function (next){
//   if(!this.isModified("password")) return next()

//   try {
//     this.password = await bcrypt.hash(this.password , 10)
//     next()
//   } catch (error) {
//   //  console.error("Error hashing password")
//    next(error)
//   }
// })


userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});


userSchema.methods.comparePassword = async function (password) {
     return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateToken = function () {
  return jwt.sign({_id: this._id},ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES,
  })
}

userSchema.methods.hasCapacity = function(){
  if(this.role !== "Teacher") return false;
 return this.assignedStudents.length < this.maxStudents
}

userSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
}


const User = mongoose.model("User", userSchema)
export default User;

