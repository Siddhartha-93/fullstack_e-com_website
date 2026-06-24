
// import jwt from "jsonwebtoken";
// import { generateAccessToken } from "../utils/generateTokens.js";
// import dotenv from "dotenv";

// dotenv.config();


// export const refreshTokenController = async (req, res) => {

//   const refreshToken = req.cookies.refreshToken;

//   if (!refreshToken) {
//     return res.status(401).json({
//       message: "No refresh token"
//     });
//   }

//   try {

//     const decoded = jwt.verify(
//       refreshToken,
//       process.env.REFRESH_TOKEN_SECRET
//     );

//     const accessToken = generateAccessToken(
//       decoded.userId
//     );

//     res.json({
//       accessToken
//     });

//   } catch (error) {

//     return res.status(403).json({
//       message: "Invalid refresh token"
//     });

//   }
// };