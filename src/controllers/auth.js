import {
  registerUser,
  loginUser,
  logoutUser,
  refreshSession,
  requestResetToken,
  resetPassword,
  loginOrRegister,
} from "../services/auth.js";

// import { getAuthUrl, validateCode } from "../utils/googleOAuth.js";

export async function registerUserController(req, res) {
  const user = await registerUser(req.body);

  res.status(201).json({
    status: 201,
    message: "Successfully create a user!",
    data: user,
  });
}

export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body.email, req.body.password);

  res.cookie("sessionId", session._id, {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
  });

  res.cookie("refreshToken", session.refreshToken, {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
  });

  res.status(200).json({
    status: 200,
    message: "Successfully Login a user!",
    data: { accessToken: session.accessToken },
  });
};

export const logoutController = async (req, res) => {
  let { sessionId } = req.cookies;

  try {
    if (sessionId?.startsWith("j:")) {
      sessionId = JSON.parse(sessionId.slice(2));
    }
  } catch (error) {
    console.warn("Failed to parse sessionId from cookie", error);
  }

  if (typeof sessionId === "string") {
    await logoutUser(sessionId);
  }

  res.clearCookie("sessionId");
  res.clearCookie("refreshToken");

  res.status(204).end();
};

export const refreshController = async (req, res) => {
  const { sessionId, refreshToken } = req.cookies;

  const session = await refreshSession(sessionId, refreshToken);

  res.cookie("sessionId", session._id, {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
  });

  res.cookie("refreshToken", session.refreshToken, {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
  });

  res.status(200).json({
    status: 200,
    message: "Refresh completed successfully!",
    data: { accessToken: session.accessToken },
  });
};

export const requestResetEmailController = async (req, res) => {
  const { email } = req.body;

  await requestResetToken(email);
  res.json({
    status: 200,
    message: "Reset password email has been successfully sent",
    data: {},
  });
};

export const resetPasswordController = async (req, res) => {
  const { password, token } = req.body;
  await resetPassword(password, token);

  res.json({
    status: 200,
    message: "Password has been successfully reset.",
    data: {},
  });
};

// export const getOuthController = (req, res) => {
//   const url = getAuthUrl();
//   res.json({
//     status: 200,
//     message: "successfully url.",
//     data: { oauth_url: url },
//   });
// };

// export const loginWithGoogleController = async (req, res) => {
//   const ticket = await validateCode(req.body.code);
//   const session = await loginOrRegister(
//     ticket.payload.email,
//     ticket.payload.name
//   );

//   res.cookie("sessionId", session._id, {
//     httpOnly: true,
//     expires: session.refreshTokenValidUntil,
//   });

//   res.cookie("refreshToken", session.refreshToken, {
//     httpOnly: true,
//     expires: session.refreshTokenValidUntil,
//   });

//   res.json({
//     status: 200,
//     message: "Successfully logged in via Google OAuth!",
//     data: {
//       accessToken: session.accessToken,
//     },
//   });
// };
