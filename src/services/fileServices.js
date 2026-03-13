import fs from "fs";
import ErrorHandler from "../middlewares/error.js";

export const streamDownload = (filePath, res, originalName) => {
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      error: "File not found",
    });
  }

  res.download(filePath, originalName, (error) => {
    if (error) {
      console.error("Download error:", error.message);

      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: "Error downloading file",
        });
      }
    }
  });
};


// import fs from "fs";
// import ErrorHandler from "../middlewares/error.js";

// export const streamDownload = async(filePath, res, originalName) => {
//   try {
//     if(!fs.existsSync(filePath)){
//       throw new ErrorHandler("File not found", 404);
//     }

//     res.download(filePath, originalName, (err)=> {
//       throw new ErrorHandler("Error downloading file", 500);
//     })

//   } catch (error) {
//    if(error instanceof ErrorHandler){
//     return res.status(err.statusCode).json({
//       success:false,
//        error:error.message
//       })
//    }

//    return res.status(500).json({
//     success: false,
//     error: "Error streaming file."
//    })
//   }
// }
