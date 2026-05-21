const {
  GoogleGenerativeAI,
} = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY_RECOMMENDATION || process.env.GEMINI_API_KEY
);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

class GeminiQueue {
  constructor() {
    this.queue = [];
    this.running = 0;
  }

  async add(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.next();
    });
  }

  async next() {
    if (this.running >= 1 || this.queue.length === 0) {
      return;
    }
    this.running++;
    const { fn, resolve, reject } = this.queue.shift();
    try {
      const res = await fn();
      resolve(res);
    } catch (err) {
      reject(err);
    } finally {
      this.running--;
      this.next();
    }
  }
}
const geminiQueue = new GeminiQueue();

const safeGenerate = async (prompt, fallback = "") => {
  return geminiQueue.add(async () => {
    try {
      const result   = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (err) {
      console.warn("[aiService] generateContent failed:", err?.message || err);
      return fallback;
    }
  });
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
const generateApplicantSummary = async (workerProfile, job) => {
  const prompt = `
You are an expert technical recruiter AI.
Write ONE concise, professional sentence (max 15 words) summarizing why this candidate is a fit for this job based on their skills and experience. Do not mention missing skills.
Candidate Role: ${workerProfile.role || workerProfile.jobRole || "Professional"}
Candidate Skills: ${(workerProfile.skills || []).join(", ")}
Candidate Experience: ${workerProfile.experience || 0} years
Job Title: ${job.title}
Job Required Skills: ${(job.requiredSkills || []).join(", ")}
`;
  const fallback = `A candidate with ${workerProfile.experience || 0} years of experience matching some required skills.`;
  return safeGenerate(prompt, fallback);
};

const generateInsightsRecommendations = async (stats) => {
  const prompt = `
You are an expert HR Data Analyst and AI Recruiter. 
Analyze the following recruiter pipeline stats and provide exactly 3 actionable hiring recommendations or insights for this specific recruiter.
For each recommendation, provide:
1. An icon (a single emoji suitable for the recommendation, e.g., 📉, 🌐, ⏰, 💼, 💡, 📊, 🚀).
2. A short title (2-4 words, e.g., "Shortlist now", "Skills gap in Python", "Attract blue collar").
3. A description (1-2 sentences, detailing the recommendation and referencing the actual stats if relevant).

Provide the output STRICTLY in a JSON array format where each element is an object having keys "icon", "title", and "desc".
Example:
[
  {
    "icon": "📉",
    "title": "Lower experience bar",
    "desc": "Consider lowering experience requirements to attract more of the \${stats.totalApplicants || 0} candidates in the pipeline."
  }
]

Stats for this Recruiter:
Total Pipeline Applicants: \${stats.totalApplicants || 0}
Professional Candidates: \${stats.workerTypeCounts?.professional || 0}
Blue Collar/Labour Candidates: \${stats.workerTypeCounts?.labour || 0}
Top Skills Present in Pipeline: \${stats.topSkills?.slice(0, 5).map(s => s.skill).join(", ") || "None"}
Top Skill Gaps (missing from applicants): \${stats.topSkillGaps?.slice(0, 5).map(s => s.skill).join(", ") || "None"}
`;
  const fallback = JSON.stringify([
    {
      icon: "💼",
      title: "Engage Top Candidates",
      desc: `You have ${stats.totalApplicants || 0} candidates in your pipeline. Reach out to the highest-scoring candidates within 48 hours to secure them.`
    },
    {
      icon: "📊",
      title: "Address Skill Gaps",
      desc: stats.topSkillGaps && stats.topSkillGaps.length > 0 
        ? `A significant portion of your applicants lack "${stats.topSkillGaps[0].skill}". Consider providing training or modifying job descriptions.`
        : "Ensure your active jobs clearly specify required skills to attract the most compatible talent."
    },
    {
      icon: "🚀",
      title: "Pipeline Composition",
      desc: `Your talent pool consists of ${stats.workerTypeCounts?.professional || 0} professional and ${stats.workerTypeCounts?.labour || 0} blue-collar candidates. Optimize your posting channels accordingly.`
    }
  ]);
  
  try {
    let result = await safeGenerate(prompt, fallback);
    // Strip markdown formatting if Gemini returns ```json ... ```
    if (result.includes("```")) {
      result = result.replace(/```json/g, "").replace(/```/g, "").trim();
    }
    const parsed = JSON.parse(result);
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].title && parsed[0].desc) {
      return parsed;
    }
    return JSON.parse(fallback);
  } catch(e) {
    console.error("[aiService] Error parsing insights recommendations", e);
    return JSON.parse(fallback);
  }
};

module.exports = {
  generateMatchExplanation,
  generateProfessionalSummary,
  generateApplicantSummary,
  generateInsightsRecommendations,
};
