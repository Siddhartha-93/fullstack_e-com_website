import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
import { normalizePhone } from '../utils/phone.js'
// import { generateAccessToken, generateRefreshToken } from '../utils/generateTokens.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const register = async (req, res) => {
  try {
    const { name, email, phone, password, role = 'customer' } = req.body;
    let normalizedPhone
    try {
      normalizedPhone = normalizePhone(phone)
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid phone number' })
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address' })
    }
    const existingUser = await User.findOne({ phone: normalizedPhone });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Phone already registered' });
    }
    const user = await User.create({ name, email: email?.trim().toLowerCase(), phone: normalizedPhone, password, role });
   const token = generateToken(user._id);

    // const accessToken = generateAccessToken(user._id);
    // const refreshToken = generateRefreshToken(user._id);
   
    res.status(201).json({
      success: true,
      token,
      // cookies are set to httpOnly and secure in production for security
      // accessToken,
      // refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    let normalizedPhone
    try {
      normalizedPhone = normalizePhone(phone)
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid phone number' })
    }
    const user = await User.findOne({ phone: normalizedPhone }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid phone or password' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid phone or password' });
    }
    const token = generateToken(user._id);

    // const accessToken = generateAccessToken(user._id);
    // const refreshToken = generateRefreshToken(user._id);

    
    

    //cookies are set to httpOnly and secure in production for security
  //   res.cookie("refreshToken", refreshToken, {
  //   httpOnly: true,
  //   secure: false,
  //   sameSite: "none",
  //   maxAge: 7 * 24 * 60 * 60 * 1000,
  // });

    res.json({
      success: true,
      token,
      // accessToken,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
//logout function to clear the refresh token cookie
// export const logout = (req, res) => {
//   res.clearCookie("refreshToken", {
//     httpOnly: true,
//     secure: true,
//     sameSite: "none",
//   });
//   res.json({ success: true, message: "Logged out successfully" });
// };

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
