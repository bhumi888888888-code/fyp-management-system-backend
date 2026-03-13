import mongoose from "mongoose"
import { ENV } from "./ENV.js"

export const connectDB = async() => {
  try {
    const conn = await mongoose.connect(ENV.MONGO_URI)
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.log(`MongoDB failed to connect:`,error)
    process.exit(1) //1 means failure
  }
}
