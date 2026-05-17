const {
  generateMatchExplanation,
} = require("../aiService");

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
  ANALYZE MATCHED JOB
*/
const analyzeMatchedJob =
  async (
    workerProfile,
    matchedJob
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

    const missingSkills =
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
      missingSkills.length > 0
    ) {
      cons.push(
        `Missing skills: ${missingSkills.join(
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

      missingSkills,

      locationMatch:
        locationScore >= 90,

      experienceMatch:
        experienceScore >= 90,
    };

    /*
      AI SUMMARY
    */
    const aiSummary =
      await generateMatchExplanation(
        workerProfile,
        matchedJob,
        explanationData
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
    };
  };

module.exports = {
  analyzeMatchedJob,
};