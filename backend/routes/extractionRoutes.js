const express =
  require("express");

const router =
  express.Router();

const {
  extractProfileData,
} = require(
  "../services/ai/profileExtractionService"
);

/*
  TEST EXTRACTION
*/
router.post(
  "/extract-profile",

  async (
    req,
    res
  ) => {

    try {

      const {
        transcript,
      } = req.body;

      const data =
        await extractProfileData(
          transcript
        );

      res.status(200).json(
        data
      );

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error:
          "Extraction failed",
      });
    }
  }
);

module.exports =
  router;