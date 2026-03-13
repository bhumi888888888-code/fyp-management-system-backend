import nodeMailer from "nodemailer";
import { ENV } from "../lib/ENV.js";

export const sendEmail = async ({ to, subject, message }) => {
  const transporter = nodeMailer.createTransport({
    service: "gmail",
    auth: {
      user: ENV.SMTP_USER,
      pass: ENV.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: ENV.SMTP_USER,
    to,
    subject,
    html: message,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};
/**
 * Request Accepted Email
 */
export function generateRequestAcceptedTemplate(supervisorName) {
  return `
    <div style="font-family: Arial; padding:20px; background:#fff; border:1px solid #ddd; border-radius:8px;">
      <h2 style="color:#10b981;">✅ Supervisor Request Accepted</h2>
      <p>Your supervisor request has been accepted by <strong>${supervisorName}</strong>.</p>
      <p>You can now start working on your project and upload files.</p>
    </div>
  `;
}

/**
 * Request Rejected Email
 */
export function generateRequestRejectedTemplate(supervisorName) {
  return `
    <div style="font-family: Arial; padding:20px; background:#fff; border:1px solid #ddd; border-radius:8px;">
      <h2 style="color:#ef4444;">❌ Supervisor Request Rejected</h2>
      <p>Your supervisor request has been rejected by <strong>${supervisorName}</strong>.</p>
      <p>You can try requesting another supervisor.</p>
    </div>
  `;
}




// import nodeMailer from "nodemailer"
// import { ENV } from "../lib/ENV.js";

// export const sendEmail = async({to, subject, message}) =>{
//   try {
//     // const transporter = nodeMailer.createTransport({
//     //   host: ENV.SMTP_HOST,
//     //   port:ENV.SMTP_PORT,
//     //   auth:{
//     //     user:ENV.SMTP_USER,
//     //     pass:ENV.SMTP_PASSWORD,
//     //   },
//     //   service: ENV.SMTP_SERVICE
//     // });
//       const transporter = nodeMailer.createTransport({
//          service: "gmail",
//          auth: {
//          user: ENV.SMTP_USER,
//          pass: ENV.SMTP_PASSWORD,
//          }
//       });
//     const mailOptions = {
//       from : ENV.SMTP_USER,
//       to,
//       subject,
//       html: message
//     }

//    const info = await transporter.sendMail(mailOptions);
//    return info

//   } catch (error) {
//    throw new Error(error.message || "Cannot send email.")
//   }
// }

