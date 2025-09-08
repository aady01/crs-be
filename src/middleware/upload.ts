import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "civic-issues",
      resource_type: "auto", // handles images/videos
      public_id: Date.now().toString(),
    };
  },
});

const upload = multer({ storage });

export default upload;
