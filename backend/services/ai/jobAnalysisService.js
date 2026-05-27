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
  salary,
  category
) {
  if (!salary) {
    return 50;
  }

  let monthlySalary = salary;
  if (salary > 100000) {
    monthlySalary = salary / 12;
  }

  const isLabour = (category || "").toLowerCase() === "labour";
  if (isLabour) {
    return Math.min(100, Math.max(30, Math.round((monthlySalary / 35000) * 100)));
  } else {
    return Math.min(100, Math.max(30, Math.round((monthlySalary / 120000) * 100)));
  }
}

/*
  GROWTH SCORE
*/
function calculateGrowthScore(workerProfile, job) {
  let base = 0;
  
  const workerExpectedMax = workerProfile.expectedSalary?.max || parseInt(workerProfile.expectedWage) || 0;
  const jobSalaryMax = job.salary?.max || parseInt(job.salary) || 0;
  if (jobSalaryMax > 0 && workerExpectedMax > 0 && jobSalaryMax > workerExpectedMax * 1.1) {
    base += 30;
  }
  
  const roleHierarchy = { helper: 1, operator: 2, technician: 3, supervisor: 4, manager: 5 };
  const wRole = (workerProfile.canonicalRole || "").toLowerCase();
  const jRole = (job.canonicalRole || "").toLowerCase();
  if (roleHierarchy[jRole] && roleHierarchy[wRole] && roleHierarchy[jRole] > roleHierarchy[wRole]) {
    base += 20;
  }
  
  const workerSkills = (workerProfile.skills || workerProfile.professionalSkills || []).map(s => s.toLowerCase());
  const jobSkills = (job.requiredSkills || []).map(s => s.toLowerCase());
  const missingSkills = jobSkills.filter(s => !workerSkills.includes(s));
  if (missingSkills.length > 0) {
    base += 20;
  }
  
  if (workerProfile.location && job.location && workerProfile.location.toLowerCase() !== job.location.toLowerCase()) {
    base += 15;
  }
  
  const growingSectors = ["manufacturing", "logistics", "tech", "healthcare"];
  const sector = (job.sector || job.category || "").toLowerCase();
  if (growingSectors.some(s => sector.includes(s))) {
    base += 15;
  }
  
  return Math.min(100, base);
}

/*
  STABILITY SCORE
*/
function calculateStabilityScore(workerProfile, job) {
  let base = 0;
  
  if (job.createdAt) {
    const createdTime = job.createdAt._seconds ? job.createdAt._seconds * 1000 : new Date(job.createdAt).getTime();
    const daysOld = (Date.now() - createdTime) / (1000 * 60 * 60 * 24);
    if (daysOld > 90) base += 30;
  }
  
  const jobType = (job.jobType || job.availability || "").toLowerCase();
  if (jobType === "full-time" || jobType === "fulltime") {
    base += 25;
  }
  
  const period = (job.salary?.period || job.salaryPeriod || "").toLowerCase();
  if (period === "month" || period === "year") {
    base += 20;
  }
  
  if (workerProfile.location && job.location && workerProfile.location.toLowerCase() === job.location.toLowerCase()) {
    base += 15;
  }
  
  if (job.isActive && !job.expiresAt) {
    base += 10;
  }
  
  return Math.min(100, base);
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
  LOCALIZED FALLBACK EXPLANATION
*/
const getFallbackExplanation = (skillMatch, jobTitle, missingSkills, language = "en") => {
  const title = jobTitle || "this role";
  const missingStr = missingSkills.slice(0, 2).join(", ");
  
  if (language === "hi") {
    return `${title} के लिए ${skillMatch}% कौशल संरेखण।${missingSkills.length > 0 ? ` अनुपलब्ध: ${missingStr}।` : ""}`;
  }
  if (language === "ta") {
    return `${title}க்கான ${skillMatch}% திறன் பொருத்தம். ${missingSkills.length > 0 ? ` விடுபட்டவை: ${missingStr}.` : ""}`;
  }
  if (language === "mr") {
    return `${title} साठी ${skillMatch}% कौशल्य संरेखन. ${missingSkills.length > 0 ? ` गहाळ कौशल्ये: ${missingStr}.` : ""}`;
  }
  return `${skillMatch}% skill alignment for ${title}${missingSkills.length > 0 ? `. Missing: ${missingStr}.` : "."}`;
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
        matchedJob.salary,
        matchedJob.workerCategory || matchedJob.category
      );

    const growthScore =
      calculateGrowthScore(workerProfile, matchedJob);

    const stabilityScore =
      calculateStabilityScore(workerProfile, matchedJob);

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

      growthScore,
      stabilityScore,
      matchScore: matchedJob.matchScore
    };

    /*
      AI SUMMARY
    */
    const jobId = matchedJob.id || matchedJob.jobId;
    let aiSummary = await getCachedExplanation(workerProfile, jobId, language);

    if (!aiSummary) {
      if (skipAi) {
        aiSummary = getFallbackExplanation(skillMatch, matchedJob.title, analysisMissingSkills, language);
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
              aiSummary,
              language
            );
          }
        } catch (error) {
          console.warn(`[jobAnalysisService] generateMatchExplanation failed for job ${jobId}:`, error?.message);
          aiSummary = getFallbackExplanation(skillMatch, matchedJob.title, analysisMissingSkills, language);
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

    /*
      UK SALARY WARNING
    */
    let warning = null;
    if (matchedJob.salary?.currency === 'GBP') {
      const jobMin = matchedJob.salary?.min || 0;
      if ((jobMin / 2080) < 10.82) {
        warning = 'Salary may be below minimum wage — verify with employer';
      }
    }

    return {

      ...matchedJob,
      warning,

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