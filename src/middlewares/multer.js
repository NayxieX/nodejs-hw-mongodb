import path from "node:path";

import multer from "multer";

// import { TEMP_UPLOAD_DIR } from '../index.js';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve("src", "tmp"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, `${uniqueSuffix}_${file.originalname}`);
  },
});

export const upload = multer({ storage });
