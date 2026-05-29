const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: "c:\\Users\\Lenovo\\SETU\\backend\\.env" });

const key = process.env.GEMINI_API_KEY_PROFILE_EXTRACTION || process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(key);

const models = [
  "gemini-1.5-flash",
  "gemini-2.5-flash",
  "gemini-2.0-flash-exp",
  "gemini-3.1-pro-preview",
  "gemini-1.5-pro",
];

async function checkModels() {
  for (const m of models) {
    try {
      console.log(`Checking model: ${m}...`);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Test response with single word OK");
      console.log(`  ✓ SUCCESS: ${m} works! Response: "${result.response.text().trim()}"`);
    } catch (err) {
      console.log(`  ✕ FAILED: ${m}. Error:`, err.message || err);
    }
  }
}

checkModels();
