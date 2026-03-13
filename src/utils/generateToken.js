import { ENV } from "../lib/ENV.js";

export const generateToken = async(user, statusCode, message ,res) => {
  const token = user.generateToken();
  res.status(statusCode)
  .cookie("token", token , {
    expires : new Date(
      Date.now()  + ENV.COOKIE_EXPIRE  * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: "none",
    secure: ENV.NODE_ENV === "production"
  }).json({
    success: true,
    user,
    message,
    token,
  })
}
