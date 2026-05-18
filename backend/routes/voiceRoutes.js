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

      console.log(
        "VOICE FILE RECEIVED"
      );

      console.log(
        req.file
      );


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
  } catch(e) {}
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

      console.log(error);

      res.status(500).json({
        error:
          "Failed to upload audio",
      });
    }
  }
);

module.exports =
  router;