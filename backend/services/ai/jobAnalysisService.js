const {
  generateMatchExplanation,
} = require("../aiService");
const {
  getCachedExplanation,
  saveExplanationCache,
} = require("./explanationCacheService");

/*
  SALARY SCORE
*/
function calculateSalaryScore(
  salary
) {
  if (!salary) {
    return 50;
  }

  return Math.min(
    100,
    Math.round(
      salary / 1000
    )
  );
}

/*
  GROWTH SCORE
*/
function calculateGrowthScore() {
  return 75;
}

/*
  STABILITY SCORE
*/
function calculateStabilityScore() {
  return 80;
}

/*
  RECOMMENDATION LABEL
*/
function getRecommendationType(
  score
) {
  if (score >= 80) {
    return "best_pick";
  }

  if (score >= 50) {
    return "good_fit";
  }

  return "average_fit";
}

/*
  IMPROVEMENT ANALYSIS
*/
const generateImprovementInsights =
  (
    workerSkills,
    requiredSkills,
    currentMatchScore
  ) => {

    const normalizedWorkerSkills =
      (workerSkills || []).map(
        (skill) =>
          (skill || "").toString().toLowerCase()
      );

    /*
      MISSING
    */
    const missingSkills =
      (requiredSkills || []).filter(
        (skill) =>
          !normalizedWorkerSkills.includes(
            (skill || "").toString().toLowerCase()
          )
      );

    /*
      PRIORITIZE
    */
    const prioritizedSkills =
      missingSkills.slice(
        0,
        3
      );

    /*
      PROJECTED IMPROVEMENT
    */
    const potentialMatchScore =
      Math.min(
        98,
        currentMatchScore +
        (
          prioritizedSkills.length *
          8
        )
      );

    return {

      missingSkills:
        prioritizedSkills,

      improvementSuggestions:
        prioritizedSkills.map(
          (skill) =>
            `Learn ${skill}`
        ),

      potentialMatchScore,
    };
  };

/*
  ANALYZE MATCHED JOB
*/
const analyzeMatchedJob =
  async (
    workerProfile,
    matchedJob,
    language,
    skipAi = false
  ) => {

    /*
      METRICS
    */
    const salaryScore =
      calculateSalaryScore(
        matchedJob.salary
      );

    const growthScore =
      calculateGrowthScore();

    const stabilityScore =
      calculateStabilityScore();

    /*
      ANALYSIS DATA
    */
    const skillMatch =
      matchedJob.analysis
        ?.skillMatch || 0;

    const matchedSkills =
      matchedJob.analysis
        ?.matchedSkills || [];

    const analysisMissingSkills =
      matchedJob.analysis
        ?.missingSkills || [];

    const experienceScore =
      matchedJob.analysis
        ?.experienceScore ||
      0;

    const locationScore =
      matchedJob.analysis
        ?.locationScore ||
      0;

    /*
      PROS
    */
    const pros = [];

    if (
      skillMatch >= 70
    ) {
      pros.push(
        "Strong skill alignment"
      );
    }

    if (
      locationScore >= 90
    ) {
      pros.push(
        "Close to your location"
      );
    }

    if (
      salaryScore >= 80
    ) {
      pros.push(
        "High salary opportunity"
      );
    }

    /*
      CONS
    */
    const cons = [];

    if (
      analysisMissingSkills.length > 0
    ) {
      cons.push(
        `Missing skills: ${analysisMissingSkills.join(
          ", "
        )}`
      );
    }

    if (
      experienceScore < 70
    ) {
      cons.push(
        "Experience gap for this role"
      );
    }

    /*
      STRUCTURED AI CONTEXT
    */
    const explanationData = {

      skillMatch,

      matchedSkills,

      missingSkills:
        analysisMissingSkills,

      locationMatch:
        locationScore >= 90,

      experienceMatch:
        experienceScore >= 90,
    };

    /*
      AI SUMMARY
    */
    const jobId = matchedJob.id || matchedJob.jobId;
    let aiSummary = await getCachedExplanation(workerProfile, jobId);

    if (!aiSummary) {
      if (skipAi) {
        aiSummary = `${skillMatch}% skill alignment for ${matchedJob.title || "this role"}${analysisMissingSkills.length > 0 ? `. Missing: ${analysisMissingSkills.slice(0, 2).join(", ")}.` : "."}`;
      } else {
        try {
          aiSummary = await generateMatchExplanation(
            workerProfile,
            matchedJob,
            explanationData,
            language
          );
          if (aiSummary) {
            await saveExplanationCache(
              workerProfile,
              jobId,
              workerProfile.workerId,
              aiSummary
            );
          }
        } catch (error) {
          console.warn(`[jobAnalysisService] generateMatchExplanation failed for job ${jobId}:`, error?.message);
          aiSummary = `${skillMatch}% skill alignment for ${matchedJob.title || "this role"}${analysisMissingSkills.length > 0 ? `. Missing: ${analysisMissingSkills.slice(0, 2).join(", ")}.` : "."}`;
        }
      }
    }

    /*
      IMPROVEMENT INSIGHTS
    */
    const improvementData =
      generateImprovementInsights(

        workerProfile.skills || [],

        matchedJob.requiredSkills || [],

        matchedJob.matchScore
      );

    return {

      ...matchedJob,

      recommendationType:
        getRecommendationType(
          matchedJob.matchScore
        ),

      metrics: {

        salary:
          salaryScore,

        proximity:
          locationScore,

        skillMatch,

        experience:
          experienceScore,

        growth:
          growthScore,

        stability:
          stabilityScore,
      },

      pros,

      cons,

      aiSummary,

      missingSkills:
        improvementData.missingSkills,

      improvementSuggestions:
        improvementData.improvementSuggestions,

      potentialMatchScore:
        improvementData.potentialMatchScore,
    };
  };

module.exports = {

  analyzeMatchedJob,

  generateImprovementInsights,
};