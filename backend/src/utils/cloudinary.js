import dotenv from "dotenv";
import cloudinary from "cloudinary";

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadBuffer = async (buffer, mimetype, folder = "fresh-bite") => {
  try {
    const dataUri = `data:${mimetype};base64,${buffer.toString("base64")}`;
    return await cloudinary.v2.uploader.upload(dataUri, { folder });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

export default cloudinary.v2;
