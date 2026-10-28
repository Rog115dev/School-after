import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsRoot = path.join(__dirname, "..", "uploads");
export const videosDir = path.join(uploadsRoot, "videos");

fs.mkdirSync(videosDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, videosDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

export const videoUpload = multer({
  storage,
  limits: { fileSize: 250 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      /^video\//.test(file.mimetype) ||
      /\.(mp4|mov|webm|m4v|avi)$/i.test(file.originalname);
    if (ok) cb(null, true);
    else cb(new Error("Only video files are allowed"));
  },
});

/** External link or an uploaded file path served from /uploads. */
export const videoUrlSchema = z
  .string()
  .min(1)
  .refine(
    (value) =>
      /^https?:\/\//i.test(value) || value.startsWith("/uploads/"),
    { message: "Use a video link or an uploaded file path" }
  );
