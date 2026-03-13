export function generateForgotPasswordEmailTemplate(resetPasswordUrl) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f6f8;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          h2 {
            color: #333;
          }
          p {
            color: #555;
            line-height: 1.6;
          }
          .btn {
            display: inline-block;
            margin-top: 20px;
            padding: 12px 24px;
            background-color: #2563eb;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
          }
          .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #888;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>FYP SYSTEM - 🔒 Password Reset Request</h2>
          <p>
            You requested to reset your password. Click the button below to
            create a new password.
          </p>

          <a href="${resetPasswordUrl}" class="btn">Reset Password</a>

          <p>
            If you did not request this, please ignore this email. This password
            reset link will expire in <strong>15 minutes</strong>.
          </p>

          <div class="footer">
            <p>© ${new Date().getFullYear()} Project Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
