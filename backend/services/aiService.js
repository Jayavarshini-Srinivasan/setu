const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_RECOMMENDATION || process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });

class GeminiQueue {
  constructor() {
    this.queue = [];
    this.running = 0;
    this.concurrencyLimit = 2; // Allow 2 concurrent requests
  }

  async add(fn, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject, timeoutMs });
      this.next();
    });
  }

  async next() {
    if (this.running >= this.concurrencyLimit || this.queue.length === 0) {
      return;
    }
    
    this.running++;
    const { fn, resolve, reject, timeoutMs } = this.queue.shift();
    
    const timeout = new Promise((_, rej) => 
      setTimeout(() => rej(new Error(`[GeminiQueue] Timeout after ${timeoutMs}ms`)), timeoutMs)
    );
    
    try {
      console.log(`[GeminiQueue] Processing request. Queue length: ${this.queue.length}, Running: ${this.running}`);
      const res = await Promise.race([fn(), timeout]);
      resolve(res);
    } catch (err) {
      console.error(`[GeminiQueue] Error processing request:`, err.message || err);
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
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (err) {
      console.warn("[aiService] generateContent failed:", err?.message || err);
      return fallback;
    }
  });
};

const generateMatchExplanation = async (workerProfile, job, explanationData, language) => {
  const jobSkills = (job.skills || job.requiredSkills || []);
  const workerSkills = (workerProfile.skills || workerProfile.professionalSkills || []);
  const { matchScore, growthScore, missingSkills } = explanationData;
  const jobMin = job.salary?.min || 0;
  const jobMax = job.salary?.max || 0;
  const currency = job.salary?.currency || "INR";
  const period = job.salary?.period || "month";
  
  let ukSpecific = "";
  if (currency === "GBP") {
    ukSpecific = "Also note if the worker needs to check visa eligibility for working in the UK.";
  }

  const prompt = `You are an employment advisor helping a worker understand a job match.
Write exactly 2 sentences in ${language || "en"} explaining why this job is or isn't a good fit for this worker. Be specific � use their actual skills and the job's actual requirements. Do not be generic.
   
Worker profile:
- Role: ${workerProfile.canonicalRole || workerProfile.role || ""}
- Skills: ${workerSkills.join(", ")}
- Experience: ${workerProfile.experience || 0} years
- Location: ${workerProfile.location || ""}
- Expected wage: ${workerProfile.expectedWage || workerProfile.expectedSalary?.min || ""}
   
Job:
- Title: ${job.title}
- Required skills: ${jobSkills.join(", ")}
- Location: ${job.location || ""}
- Salary: ${jobMin}-${jobMax} ${currency}/${period}
- Minimum experience: ${job.minimumExperience || job.experienceRequired || 0} years
   
Match scores: ${matchScore}% skill match, ${growthScore}% growth potential
Missing skills: ${missingSkills.join(", ")}
   
${ukSpecific}

Write in ${language || "en"}. 2 sentences maximum.`;

  const fallback = `${matchScore}% skill alignment for ${job.title || "this role"}${missingSkills.length > 0 ? `. Missing: ${missingSkills.slice(0, 2).join(", ")}.` : "."}`;
  return safeGenerate(prompt, fallback);
};

const generateProfessionalSummary = async ({ role, skills, experience, goals }) => {
  const prompt = `Write a professional resume summary (3 sentences max) for a ${role} with ${experience} years experience. 
Skills: ${skills.join(", ")}. 
Career goals: ${goals}.
Focus on impact and clarity.`;
  return safeGenerate(prompt, `${experience} years experienced ${role} specializing in ${skills.slice(0,3).join(", ")}.`);
};

const generateInsightsRecommendations = async (stats) => {
  const prompt = `You are a recruitment AI analyzing candidate data.
Here is the data:
Total Applicants: ${stats.totalApplicants}
Top Skills Present: ${JSON.stringify(stats.topSkills)}
Top Skill Gaps: ${JSON.stringify(stats.topSkillGaps)}

Generate 3 actionable, insightful bullet points (maximum 1 sentence each) for the recruiter on how to adjust their job posts or hiring strategy based on these gaps and present skills. Return a valid JSON array of 3 strings. Do not include markdown formatting like \`\`\`json.`;

  const fallback = '["Consider lowering experience requirements to increase applicant pool.", "Consider providing on-the-job training for commonly missing skills.", "Expand outreach to candidates with adjacent skill sets." ]';
  
  try {
    const raw = await safeGenerate(prompt, fallback);
    let cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    if (!cleaned.startsWith("[")) {
      cleaned = cleaned.substring(cleaned.indexOf("["));
    }
    if (!cleaned.endsWith("]")) {
      cleaned = cleaned.substring(0, cleaned.lastIndexOf("]") + 1);
    }
    return JSON.parse(cleaned);
  } catch (err) {
    return JSON.parse(fallback);
  }
};

module.exports = {
  geminiQueue,
  safeGenerate,
  generateMatchExplanation,
  generateProfessionalSummary,
  generateInsightsRecommendations
};
