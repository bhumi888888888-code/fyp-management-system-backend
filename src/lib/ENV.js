import "dotenv/config"

export const ENV = {
  PORT: process.env.PORT || 5001,
  NODE_ENV: process.env.NODE_ENV,
  FRONTEND_URL: process.env.FRONTEND_URL,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  COOKIE_EXPIRE: process.env.COOKIE_EXPIRE,
  JWT_EXPIRES: process.env.JWT_EXPIRES,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  // ✅ ADD THESE
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  SMTP_SERVICE: process.env.SMTP_SERVICE,
}
