const { generateLearningPath } = require("../services/learningPathService");
const { db } = require("../config/firebase");


const getLearningPath = async (req, res) => {

  try {

    const { userId, matchContext, language } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data();
    const profile  = userData.profile || {};

    const context = {
      role:        profile.professionalRole || profile.role || "",
      skills:      profile.professionalSkills || profile.skills || [],
      careerGoal:  profile.careerGoal || "",
      experience:  profile.experienceDetails || [],

      topJob:           matchContext?.topJob           || null,
      allMissingSkills: matchContext?.allMissingSkills || [],
      currentMatchScore:matchContext?.currentMatchScore|| 0,
    };

    const learningPath = await generateLearningPath(context, language);

    return res.json(learningPath);

  } catch (error) {

    console.error("[learningController]", error);
    return res.status(500).json({ error: "Failed to generate learning path" });
  }
};

module.exports = { getLearningPath };