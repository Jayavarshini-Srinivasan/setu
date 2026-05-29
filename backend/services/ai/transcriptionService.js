const fs = require("fs");
const Groq = require("groq-sdk");

const groq =
new Groq({
apiKey:
process.env.GROQ_API_KEY,
});

async function transcribeAudio(
filePath
){

try{

const response =
await groq.audio.transcriptions.create({


  file:
   fs.createReadStream(
     filePath
   ),

  model:
   "whisper-large-v3",

  

  temperature:
   0,

  response_format:
   "verbose_json",


});

return response.text;

}
catch (err) {

  console.log("========== GROQ TRANSCRIPTION ERROR ==========");

  console.log("Message:", err.message);

  console.log("Response:",
    err.response?.data || "No response data"
  );

  console.log("Status:",
    err.status || err.response?.status
  );

  console.log("=============================================");

  throw err;
}

}

module.exports = {
transcribeAudio
};