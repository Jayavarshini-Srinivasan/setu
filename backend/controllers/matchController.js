const { jobs: localJobs }     = require("../data/jobs");
const { db }                   = require("../config/firebase");
const { analyzeMatchedJob }    = require("../services/ai/jobAnalysisService");
const { calculateMatchScore }  = require("../services/matchService");
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
    const categoryJobs   = availableJobs.filter((j) => {
      const jobCat = (j.category || j.workerCategory || "").toLowerCase();
      return !jobCat || jobCat === targetCategory;
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