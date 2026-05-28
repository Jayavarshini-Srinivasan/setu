const express =
  require("express");

const multer =
  require("multer");

const path =
  require("path");

const fs =
  require("fs");

const router =
  express.Router();
  const {
  transcribeAudio,
} = require(
  "../services/ai/transcriptionService"
);
const {
  extractProfileData,
} = require(
  "../services/ai/profileExtractionService"
);
/*
  CREATE uploads FOLDER
*/
const uploadPath =
  path.join(
    __dirname,
    "../uploads"
  );

if (
  !fs.existsSync(
    uploadPath
  )
) {
  fs.mkdirSync(
    uploadPath
  );
}

/*
  STORAGE
*/
const storage =
  multer.diskStorage({

    destination:
      (
        req,
        file,
        cb
      ) => {

        cb(
          null,
          uploadPath
        );
      },

    filename:
      (
        req,
        file,
        cb
      ) => {

        cb(
          null,
          `${Date.now()}-${file.originalname}`
        );
      },
  });

const upload =
  multer({
    storage,
  });

/*
  UPLOAD AUDIO
*/
router.post(
  "/upload-audio",

  upload.single(
    "audio"
  ),

  async (
    req,
    res
  ) => {

    try {

      if (!req.file?.path) {
        console.error("[voiceRoutes] upload-audio missing audio file");
        return res.status(400).json({
          success: false,
          error: "Audio file is required",
        });
      }

      console.log("[voiceRoutes] audio received:", {
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });


/*
  TRANSCRIBE
*/
const transcript =
  await transcribeAudio(
    req.file.path
  );

/*
  EXTRACT PROFILE
*/
let contextData = {};
if (req.body.context) {
  try {
    contextData = JSON.parse(req.body.context);
  } catch(error) {
    console.error("[voiceRoutes] invalid context JSON:", error?.message);
  }
}

const extractedProfile =
  await extractProfileData(
    transcript,
    contextData
  );

res.status(200).json({
  success: true,

  file:
    req.file.filename,

  transcript,

  extractedProfile,
});
    } catch (error) {

      console.error("[voiceRoutes] upload-audio failed:", error?.message, error);

      res.status(500).json({
        success: false,
        error:
          error?.message || "Failed to upload audio",
      });
    } finally {
      if (req.file?.path) {
        fs.unlink(req.file.path, (error) => {
          if (error) {
            console.error("[voiceRoutes] failed to delete uploaded audio:", error?.message);
          }
        });
      }
    }
  }
);

module.exports =
  router;
