import app from"./app.js"
import { connectDB } from "./lib/db.js"
import { ENV } from "./lib/ENV.js"

//-----------------------------
// CONNECTING TO THE DATABASE
// ----------------------------


connectDB()
console.log("MONGO URI:", ENV.MONGO_URI ? "Loaded" : "Missing");

//-------------------
// STARTING SEVRER
// ------------------

const server = app.listen(ENV.PORT, ()=> {
  console.log(`Sever is running on the http://localhost:${ENV.PORT}`)

});

//-------------------
// ERROR HANDLING
// ------------------

process.on("unhandledRejection", (err)=>{
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(()=> process.exit(1));
});

process.on("uncaughtException", (err)=>{
  console.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

export default server;

// unhandledRejection -> we used try block without using catch
// uncaughtException -> we havent used try catch block
