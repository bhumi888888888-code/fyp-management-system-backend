import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { CloudinaryStorage } from "multer-storage-cloudinary"
import cloudinary from "../config/cloudinary.js"

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file)=>{
    let folder = "temp";

    if(req.params.projectId){
      folder = `projects/${req.params.projectId}`;
    }else if(req.params.userId){
      folder = `users/${req.params.userId}`;
    }

    return {
      folder,
      resource_type: "raw",
      // public_id: `${Date.now()}-${file.originalname}`,
      public_id: `${Date.now()}-${path.parse(file.originalname).name}`,
    }
  }
})

/* =========================
   File filter
========================= */
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/zip",
    "application/x-zip-compressed",
    "application/x-rar-compressed",
    "application/x-rar",
    "application/vnd.rar",
    "application/octet-stream",
    "image/jpeg",
    "image/png",
    "image/gif",
    "text/plain",
    "application/javascript",
    "text/css",
    "text/html",
    "application/json",
  ];

  const allowedExtensions = [
    ".pdf",
    ".doc",
    ".docx",
    ".ppt",
    ".pptx",
    ".zip",
    ".rar",
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".txt",
    ".js",
    ".css",
    ".html",
    ".json",
  ];

  const fileExt = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PDF, DOC, DOCX, PPTX, ZIP, RAR, images, and code files are allowed."
      ),
      false
    );
  }
};

/* =========================
   Multer instance
========================= */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10,
  },
});

/* =========================
   Error handler
========================= */
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "File too large. Maximum size is 10MB",
      });
    }

    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        error: "Too many files. Maximum 10 files allowed at once.",
      });
    }
  }

  if (err?.message?.includes("Invalid file type")) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  next(err);
};

export { upload, handleUploadError };





// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const ensureDirExists = (dir) => {
//   if(!fs.existsSync(dir)){
//     fs.mkdirSync(dir, { recursive: true });
//   }
// };

// const storage = multer.diskStorage({
//      destination: (req, file, cb)=>{
//       let uploadPath;

//       if(req.route.path.includes("/upload/:projectId")){
//         uploadPath = path.join(__dirname, "../uploads/projects", req.params.projectId)
//       }else if (req.route.path.includes("/upload/:userId")){
//         uploadPath = path.join(__dirname, "../uploads/userId", req.params.userId)
//       }else{
//         uploadPath = path.join(__dirname, "../upload/temp")
//       }

//       ensureDirExists(uploadPath);
//       cb(null, uploadPath);
//      },

//      filname: (req, file, cb) => {
//       const uniqueSuffix = `${Date.now}-${Math.round(Math.random() * 1e9)}`
//       const ext = path.extname(file.originalname);
//       cb(null, `${file.filname}-${uniqueSuffix}${ext}`);
//      }
// })


// const fileFilter = (req, file, cb) => {
//    const allowedTypes = [
//     "application/pdf",
//     "application/msword",
//     "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//     "application/vnd.ms-powerpoint",
//     "application/vnd.openxmlformats-officedocument.presentationml.presentation",
//     "application/zip",
//     "application/x-zip-compressed",
//     "application/x-rar-compressed",
//     "application/x-rar",
//     "application/vnd.rar",
//     "application/octet-stream",
//     "image/jpeg",
//     "image/png",
//     "image/gif",
//     "text/plain",
//     "application/javascript",
//     "text/css",
//     "text/html",
//     "application/json",
//   ];

//   const allowedExtensions = [
//     ".pdf",
//     ".doc",
//     ".docx",
//     ".ppt",
//     ".pptx",
//     ".zip",
//     ".rar",
//     ".jpg",
//     ".jpeg",
//     ".png",
//     ".gif",
//     ".txt",
//     ".js",
//     ".css",
//     ".html",
//     ".json",
//   ];

//   const fileExt = path.extname(file.originalname).toLowerCase();

//   if(allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExt)){
//     cb(null, true)
//   }else{
//     cb(new Error(
//       "Invaild file type. Only PDF, DOC, DOCX, PPTX, ZIP, RAR, IMAGES, and code files are allowed."
//     ),false
//   );
//   }
// };

// const upload = multer({
//   storage, fileFilter,
//    limits: {
//     fileSize: 10 * 1024 * 1024,
//     files: 10,
//    }
// });


// const handleUploadError = (err, req, res, next) => {
//   if(err instanceof multer.MulterError){
//     if(err.code === "LIMIT_FILE_SIZE"){
//       return res.status(400).json({
//         success: false,
//         error: "File too large. Maximum size is 10  MB"
//       })
//     }

//     if(err.code === "LIMIT_FILE_COUNT"){
//       return res.status(400).json({
//         success: false,
//         error: "Too many files. Maximum 10 files allowed at once.",
//       })
//     }

//     if(err.message && err.message.includes("Invaild file type")){
//       return res.status(400).json({
//         success: false,
//         error: err.message,
//       })
//     }
//   }
//   next(err)
// };

// export {upload, handleUploadError};

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// /* =========================
//    Ensure directory exists
// ========================= */
// const ensureDirExists = (dir) => {
//   if (!fs.existsSync(dir)) {
//     fs.mkdirSync(dir, { recursive: true });
//   }
// };
