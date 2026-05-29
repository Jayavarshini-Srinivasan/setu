const crypto = require("crypto");
const { db } = require("../../config/firebase");

/**
 * Generates a unique, deterministic hash of a worker's profile attributes and language.
 * This guarantees that if the profile or selected language changes, a new explanation is generated.
 */
const getProfileHash = (workerProfile, language = "en") => {
  const role = (
    workerProfile.canonicalRole ||
    workerProfile.role ||
    workerProfile.professionalRole ||
    ""
  ).trim().toLowerCase();
  
  // Merge both skills arrays so professionals are hashed correctly
  const allSkills = [
    ...(Array.isArray(workerProfile.skills) ? workerProfile.skills : []),
    ...(Array.isArray(workerProfile.professionalSkills) ? workerProfile.professionalSkills : []),
  ];
  const skills = allSkills
    .map((s) => (s || "").toString().toLowerCase().trim())
    .sort()
    .join(",");
    
  const experience = parseInt(workerProfile.experience || 0, 10);
  const location = (workerProfile.location || "").trim().toLowerCase();
  const langCode = (language || "en").trim().toLowerCase();

  const profileStr = `${role}|${skills}|${experience}|${location}|${langCode}`;
  return crypto.createHash("md5").update(profileStr).digest("hex");
};

/**
 * Retrieves a cached explanation from Firestore if it exists.
 */
const getCachedExplanation = async (workerProfile, jobId, language = "en") => {
  try {
    const profileHash = getProfileHash(workerProfile, language);
    const docId = `${profileHash}_${jobId}`;
    
    const docRef = db.collection("ai_explanations_cache").doc(docId);
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      console.log(`[Cache Hit] Reusing explanation for Job ${jobId} in language: ${language}`);
      return docSnap.data().explanation;
    }
  } catch (error) {
    console.warn("[Cache Service] getCachedExplanation failed:", error?.message);
  }
  return null;
};

/**
 * Saves a generated explanation to the Firestore cache.
 */
const saveExplanationCache = async (workerProfile, jobId, workerId, explanation, language = "en") => {
  try {
    if (!explanation) return;
    
    const profileHash = getProfileHash(workerProfile, language);
    const docId = `${profileHash}_${jobId}`;
    
    await db.collection("ai_explanations_cache").doc(docId).set({
      workerId: workerId || "anonymous",
      jobId,
      explanation,
      profileHash,
      language: language || "en",
      generatedAt: new Date().toISOString(),
    });
    
    console.log(`[Cache Save] Cached explanation for Job ${jobId} in language: ${language}`);
  } catch (error) {
    console.warn("[Cache Service] saveExplanationCache failed:", error?.message);
  }
};

module.exports = {
  getCachedExplanation,
  saveExplanationCache,
};
