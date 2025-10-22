import crypto from "node:crypto";
import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import { User } from "../db/models/user.js";
import { Session } from "../db/models/session.js";

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
