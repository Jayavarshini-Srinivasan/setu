const { jobs: localJobs }     = require("../data/jobs");
const { db }                   = require("../config/firebase");
const { analyzeMatchedJob }    = require("../services/ai/jobAnalysisService");
const { calculateMatchScore, checkRoleCompatibility }  = require("../services/matchService");
const matchJobs = async (req, res) => {
  try {
    const body = req.body || {};
    const isProfessional = body.isProfessional === true;
    const workerProfile = {
      workerId:      (body.workerId || "anonymous").trim(),
      canonicalRole: (body.role || "").trim(),
      role:          (body.role || "").trim(),
      skills:        Array.isArray(body.skills) ? body.skills.map(s => (s || "").toString().toLowerCase()) : [],
      location:      (body.location || "").trim(),
      experience:    parseInt(body.experience || 0, 10),
      isProfessional,
    };
    if (!workerProfile.canonicalRole && !workerProfile.role) {
      return res.status(400).json({ error: "Missing worker role" });
    }
    let availableJobs = [];
    try {
      const snapshot = await db
        .collection("jobs")
        .where("isActive", "==", true)
        .get();
      if (!snapshot.empty) {
        availableJobs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        console.log(`Using Firestore jobs (${availableJobs.length})`);
      }
    } catch (fsErr) {
      console.warn("[matchController] Firestore fetch failed:", fsErr?.message);
    }
    if (availableJobs.length === 0) {
      availableJobs = localJobs;
      console.log(`Using local jobs fallback (${availableJobs.length})`);
    }
    const targetCategory = isProfessional ? "professional" : "labour";
    const workerRole = (workerProfile.canonicalRole || workerProfile.role || "").toLowerCase();
    
    const categoryJobs   = availableJobs.filter((j) => {
      const jobCat = (j.category || j.workerCategory || "").toLowerCase();
      const isCorrectCategory = (!jobCat || jobCat === targetCategory);
      
      const jobTitle = (j.title || j.role || "").toLowerCase();
      
      let isRoleMatch = false;
      if (!workerRole || !jobTitle) {
        isRoleMatch = true; // Fallback if undefined
      } else if (jobTitle.includes(workerRole) || workerRole.includes(jobTitle)) {
        isRoleMatch = true;
      } else if (checkRoleCompatibility && checkRoleCompatibility(workerRole, jobTitle).compatibility !== "weak") {
        isRoleMatch = true;
      } else {
        const stopWords = new Set(["and", "the", "for", "with", "from", "in", "of", "to", "at", "on", "a", "an"]);
        const workerTokens = workerRole.split(/[\s_-]+/).filter(t => t.length >= 2 && !stopWords.has(t));
        const jobTokens = jobTitle.split(/[\s_-]+/).filter(t => t.length >= 2 && !stopWords.has(t));
        
        isRoleMatch = workerTokens.some(wt => jobTokens.some(jt => jt.includes(wt) || wt.includes(jt)));
        
        if (!isRoleMatch) {
          const checkAbbreviation = (w, j) => {
            const wNorm = w.toLowerCase();
            const jNorm = j.toLowerCase();
            if (wNorm === "sde" && (jNorm.includes("software") || jNorm.includes("developer") || jNorm.includes("engineer"))) return true;
            if (jNorm === "sde" && (wNorm.includes("software") || wNorm.includes("developer") || wNorm.includes("engineer"))) return true;
            if (wNorm === "qa" && (jNorm.includes("test") || jNorm.includes("quality") || jNorm.includes("assurance"))) return true;
            if (jNorm === "qa" && (wNorm.includes("test") || wNorm.includes("quality") || wNorm.includes("assurance"))) return true;
            if (wNorm === "pm" && (jNorm.includes("product") || jNorm.includes("project") || jNorm.includes("manager"))) return true;
            if (jNorm === "pm" && (wNorm.includes("product") || wNorm.includes("project") || wNorm.includes("manager"))) return true;
            if (wNorm === "hr" && (jNorm.includes("human") || jNorm.includes("resource") || jNorm.includes("recruiter"))) return true;
            if (jNorm === "hr" && (wNorm.includes("human") || wNorm.includes("resource") || wNorm.includes("recruiter"))) return true;
            return false;
          };
          isRoleMatch = workerTokens.some(wt => jobTokens.some(jt => checkAbbreviation(wt, jt)));
        }
      }

      return isCorrectCategory;
    });
    const matchedJobs = calculateMatchScore(workerProfile, categoryJobs);
    const MIN_SCORE  = isProfessional ? 5 : 10;
    const filteredJobs = matchedJobs.filter((j) => j.matchScore >= MIN_SCORE);
    const language = body.language || "en";
    // Explicitly ensure the jobs are sorted in descending order of matchScore
    filteredJobs.sort((a, b) => b.matchScore - a.matchScore);
    const settledResults = await Promise.allSettled(
      filteredJobs.map((job, idx) => analyzeMatchedJob(workerProfile, job, language, idx >= 3))
    );
    const analyzedJobs = settledResults.map((result, i) => {
      if (result.status === "fulfilled") {
        return result.value;
      }
      console.warn(`[matchController] analyzeMatchedJob failed for job ${filteredJobs[i]?.id}:`, result.reason?.message);
      return {
        ...filteredJobs[i],
        aiSummary:           `${filteredJobs[i].matchScore}% match for ${filteredJobs[i].title}.`,
        pros:                [],
        cons:                [],
        missingSkills:       filteredJobs[i].analysis?.missingSkills || [],
        potentialMatchScore: Math.min(98, (filteredJobs[i].matchScore || 0) + 10),
        recommendationType:  filteredJobs[i].matchScore >= 80 ? "best_pick"
                           : filteredJobs[i].matchScore >= 50 ? "good_fit"
                           : "average_fit",
      };
    });
    analyzedJobs.sort((a, b) => b.matchScore - a.matchScore);
    return res.status(200).json(analyzedJobs);
  } catch (error) {
    console.error("[matchController] matchJobs:", error);
    return res.status(500).json({ error: "Failed to match jobs" });
  }
};
module.exports = { matchJobs };