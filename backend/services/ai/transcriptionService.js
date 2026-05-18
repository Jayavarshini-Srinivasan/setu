const fs =
  require("fs");

const mime =
  require("mime-types");

const {
  GoogleGenerativeAI,
} = require(
  "@google/generative-ai"
);

const genAI =
  new GoogleGenerativeAI(
    process.env
      .GEMINI_API_KEY
  );

const model =
  genAI.getGenerativeModel(
    {
      model:
        "gemini-3-flash-preview",
    }
  );

const transcribeAudio =
  async (
    filePath
  ) => {

    /*
      READ AUDIO FILE
    */
    const audioBuffer =
      fs.readFileSync(
        filePath
      );

    /*
      MIME TYPE
    */
    const mimeType =
      mime.lookup(
        filePath
      );

    /*
      GEMINI REQUEST
    */
    const result =
      await model.generateContent([
        {
          inlineData: {
            data:
              audioBuffer.toString(
                "base64"
              ),

            mimeType,
          },
        },

        `
Transcribe this audio accurately.

The speaker may use:
- Hindi
- Tamil
- Marathi
- English
- mixed Indian languages

If the audio is completely silent, contains only background noise, or has no discernible speech, return the exact word "SILENCE".
Do NOT hallucinate or make up phrases.
Return ONLY the transcript text.
`,
      ]);

    const response =
      result.response;

    return response.text();
  };

module.exports = {
  transcribeAudio,
};