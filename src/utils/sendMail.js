import nodemailer from "nodemailer";
import { getEnvVar } from "./getEnvVar.js";

const transporter = nodemailer.createTransport({
  host: getEnvVar("SMTP_HOST"),
  port: Number(getEnvVar("SMTP_PORT")),
  secure: false,
  auth: {
    user: getEnvVar("SMTP_USER"),
    pass: getEnvVar("SMTP_PASSWORD"),
  },
});

export const sendMail = async (to, subject, html) => {
  return await transporter.sendMail({
    from: getEnvVar("SMTP_FROM"),
    to,
    subject,
    html,
  });
};
