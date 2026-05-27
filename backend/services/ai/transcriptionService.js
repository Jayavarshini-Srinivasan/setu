const fs   = require("fs");
const mime = require("mime-types");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { geminiQueue } = require("../aiService");

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY_TRANSCRIPTION || process.env.GEMINI_API_KEY
);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/*
  transcribeAudio
  ──────────────────────────────────────────────────────────────────────────────
  Sends the audio file to Gemini as inline base64 data.
  If the model is unavailable or the audio is too short, returns an
  empty string instead of throwing — callers must handle empty transcripts.
*/
const transcribeAudio = async (filePath) => {

  try {

    const audioBuffer = fs.readFileSync(filePath);
    const mimeType    = mime.lookup(filePath) || "audio/m4a";

    const result = await geminiQueue.add(() => model.generateContent([
      {
        inlineData: {
          data:     audioBuffer.toString("base64"),
          mimeType,
        },
      },
      `Transcribe this audio accurately.

The speaker may use:
- Hindi
- Tamil
- Marathi
- English
- mixed Indian languages

If the audio is completely silent, contains only background noise, or has no discernible speech, return the exact word "SILENCE".
Do NOT hallucinate or make up phrases.
Return ONLY the transcript text.`,
    ]));

    const text = result.response.text().trim();
    return text === "SILENCE" ? "" : text;

  } catch (err) {

    console.warn("[transcriptionService] transcribeAudio failed:", err?.message);
    /* Return empty string — voiceRoutes will still respond with success:true
       and an empty transcript so the mobile app gets a graceful result */
    return "";
  }
};

module.exports = { transcribeAudio };