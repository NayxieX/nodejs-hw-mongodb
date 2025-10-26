import * as fs from "node:fs";
import path from "node:path";
import Handlebars from "handlebars";
import jwt from "jsonwebtoken";

import crypto from "node:crypto";
import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import { User } from "../db/models/user.js";
import { Session } from "../db/models/session.js";
import { sendMail } from "../utils/sendMail.js";
import { getEnvVar } from "../utils/getEnvVar.js";

const RESET_PASSWORD_TEMPLATE = fs.readFileSync(
  path.resolve("src", "templates", "reset-password-email.hbs"),
  "utf-8"
);
// console.log(RESET_PASSWORD_TEMPLATE);

export const registerUser = async (payload) => {
  const user = await User.findOne({ email: payload.email });
  if (user !== null)
    throw new createHttpError.Conflict("Email is already in use");

  payload.password = await bcrypt.hash(payload.password, 10);

  return User.create(payload);
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (user === null) {
    throw new createHttpError.Unauthorized("Email or Password is incorect");
  }
  const isEqual = await bcrypt.compare(password, user.password);

  if (isEqual !== true) {
    throw new createHttpError.Unauthorized("Email or Password is incorect");
  }

  await Session.deleteOne({ userId: user._id });

  return Session.create({
    userId: user._id,
    accessToken: crypto.randomBytes(30).toString("base64"),
    refreshToken: crypto.randomBytes(30).toString("base64"),
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(Date.now() + 30 * 60 * 60 * 1000),
  });
};

export const logoutUser = async (sessionId) => {
  await Session.deleteOne({ _id: sessionId });
};

export const refreshSession = async (sessionId, refreshToken) => {
  const session = await Session.findOne({ _id: sessionId });

  if (session === null) {
    throw new createHttpError.Unauthorized("Session not found");
  }

  if (session.refreshToken !== refreshToken) {
    throw new createHttpError.Unauthorized("Refresh token is invalid");
  }

  if (session.refreshTokenValidUntil < new Date()) {
    throw new createHttpError.Unauthorized("Refresh token is expired");
  }
  await Session.deleteOne({ _id: session._id });

  return Session.create({
    userId: session.userId,
    accessToken: crypto.randomBytes(30).toString("base64"),
    refreshToken: crypto.randomBytes(30).toString("base64"),
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(Date.now() + 30 * 60 * 60 * 1000),
  });
};

export const requestResetToken = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new createHttpError(404, "User not found");
  }

  const template = Handlebars.compile(RESET_PASSWORD_TEMPLATE);

  const token = jwt.sign(
    {
      sub: user._id,
      name: user.name,
    },
    getEnvVar("JWT_SECRET"),

    { expiresIn: "5m" }
  );

  const link = `${getEnvVar(
    "APP_DOMAIN"
  )}/reset-password-email/?token=${token}`;

  const html = template({
    name: user.name || user.email,
    link,
  });
  try {
    await sendMail(user.email, "Reset your password", html);
    return {
      status: 200,
      message: "Reset password email has been successfully sent.",
      data: {},
    };
  } catch (error) {
    console.error("Send mail error:", error);
    throw createHttpError(
      500,
      "Failed to send the email, please try again later."
    );
  }
};

export const resetPassword = async (password, token) => {
  try {
    const decoded = jwt.verify(token, getEnvVar("JWT_SECRET"));

    const user = await User.findById(decoded.sub);

    if (user === null) {
      throw new createHttpError(404, "User not found");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate(user._id, { password: hashedPassword });

    await Session.deleteMany({ userId: user._id });
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      throw createHttpError(401, "Token is expired or invalid.");
    }

    throw error;
  }
};
