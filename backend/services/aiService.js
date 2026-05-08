const {
  GoogleGenerativeAI,
} = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview",
});

const generateMatchExplanation =
  async (workerProfile, job) => {
    const prompt = `
Explain in 1-2 short sentences why this worker matches this job.

Worker:
Role: ${workerProfile.role}
Skills: ${workerProfile.skills.join(", ")}
Location: ${workerProfile.location}

Job:
Title: ${job.title}
Role: ${job.role}
Location: ${job.location}
Skills: ${job.skills.join(", ")}

Keep explanation simple and short.
`;

    const result =
      await model.generateContent(prompt);

    const response = result.response;

    return response.text();
  };

module.exports = {
  generateMatchExplanation,
};