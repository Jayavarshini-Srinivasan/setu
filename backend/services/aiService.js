const {
  GoogleGenerativeAI,
} = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const safeGenerate = async (prompt, fallback = "") => {
  try {
    const result   = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.warn("[aiService] generateContent failed:", err?.message || err);
    return fallback;
  }
};
const generateMatchExplanation = async (
  workerProfile,
  job,
  explanationData,
  language
) => {
  const jobSkills   = (job.skills || job.requiredSkills || []);
  const jobRole     = (job.role || job.workerCategory || job.title || "");
  const workerSkills = (workerProfile.skills || []);
  const workerRole   = (workerProfile.role || workerProfile.jobRole || "");
  const {
    skillMatch,
    matchedSkills,
    missingSkills,
    locationMatch,
    experienceMatch,
  } = explanationData;
  const prompt = `
You are an AI job matching assistant.
Write a SHORT and REALISTIC explanation for this job recommendation.
IMPORTANT:
- Write the response strictly in the language code: "${language || "en"}". If it is "hi", use Hindi. If "ta", use Tamil. If "mr", use Marathi. If "en", use English.
- Do NOT exaggerate.
- Do NOT claim skills exist if they are missing.
- Mention missing skills if important.
- Keep response under 2 sentences.
Worker:
Role: ${workerRole}
Skills: ${workerSkills.join(", ")}
Location: ${workerProfile.location || ""}
Job:
Title: ${job.title || ""}
Role: ${jobRole}
Location: ${job.location || ""}
Required Skills: ${jobSkills.join(", ")}
Match Data:
Skill Match: ${skillMatch}%
Matched Skills: ${matchedSkills.join(", ") || "None"}
Missing Skills: ${missingSkills.join(", ") || "None"}
Location Match: ${locationMatch ? "Yes" : "No"}
Experience Match: ${experienceMatch ? "Yes" : "No"}
Write a realistic explanation.
`;
  const fallback = `${skillMatch}% skill alignment for ${job.title || "this role"}${missingSkills.length > 0 ? `. Missing: ${missingSkills.slice(0, 2).join(", ")}.` : "."}`;
  return safeGenerate(prompt, fallback);
};
const generateProfessionalSummary = async ({
  role,
  skills,
  experience,
  totalYears,
  goals,
}) => {
  const prompt = `
Generate a professional ATS-friendly resume summary.
Role: ${role}
Skills: ${skills.join(", ")}
Experience: ${JSON.stringify(experience)}
Total Experience: ${totalYears} years
Career Goals: ${goals.join(", ")}
Requirements:
- 2 to 4 lines
- professional tone
- concise
- ATS optimized
- strong but realistic
`;
  const fallback = `Professional with ${totalYears} year${totalYears !== 1 ? "s" : ""} of experience in ${role} and skills in ${skills.slice(0, 4).join(", ")}.`;
  return safeGenerate(prompt, fallback);
};
module.exports = {
  generateMatchExplanation,
  generateProfessionalSummary,
};
