const {
  GoogleGenerativeAI,
} = require(
  "@google/generative-ai"
);

const genAI =
  new GoogleGenerativeAI(
    process.env
      .GEMINI_API_KEY
  );

const model =
  genAI.getGenerativeModel(
    {
      model:
        "gemini-3-flash-preview",
    }
  );

const generateMatchExplanation =
  async (
    workerProfile,
    job,
    explanationData
  ) => {

    /*
      NORMALIZE JOB DATA
    */
    const jobSkills =
      (
        job.skills ||
        job.requiredSkills ||
        []
      );

    const jobRole =
      (
        job.role ||
        job.workerCategory ||
        job.title ||
        ""
      );

    /*
      NORMALIZE WORKER
    */
    const workerSkills =
      (
        workerProfile.skills ||
        []
      );

    const workerRole =
      (
        workerProfile.role ||
        workerProfile.jobRole ||
        ""
      );

    /*
      EXPLANATION DATA
    */
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
- Do NOT exaggerate.
- Do NOT claim skills exist if they are missing.
- Mention missing skills if important.
- Keep response under 2 sentences.

Worker:
Role: ${workerRole}
Skills: ${workerSkills.join(", ")}
Location: ${
      workerProfile.location ||
      ""
    }

Job:
Title: ${
      job.title || ""
    }
Role: ${jobRole}
Location: ${
      job.location || ""
    }
Required Skills:
${jobSkills.join(", ")}

Calculated Match Data:
Skill Match: ${skillMatch}%
Matched Skills:
${matchedSkills.join(", ") || "None"}

Missing Skills:
${missingSkills.join(", ") || "None"}

Location Match:
${
  locationMatch
    ? "Yes"
    : "No"
}

Experience Match:
${
  experienceMatch
    ? "Yes"
    : "No"
}

Write a realistic explanation.
`;

    const result =
      await model.generateContent(
        prompt
      );

    const response =
      result.response;

    return response.text();
  };

  /*
  PROFESSIONAL SUMMARY
*/
const generateProfessionalSummary =
  async ({
    role,
    skills,
    experience,
    totalYears,
    goals,
  }) => {

    try {

      const prompt = `
Generate a professional ATS-friendly resume summary.

Role:
${role}

Skills:
${skills.join(", ")}

Experience:
${JSON.stringify(experience)}

Total Experience:
${totalYears} years

Career Goals:
${goals.join(", ")}

Requirements:
- 2 to 4 lines
- professional tone
- concise
- ATS optimized
- strong but realistic
`;

      const result =
        await model.generateContent(
          prompt
        );

      return result.response
        .text()
        .trim();

    } catch (error) {

      console.log(error);

      return `
Professional with experience in ${role}
and skills in ${skills.join(", ")}.
      `;
    }
  };

module.exports = {

  generateMatchExplanation,

  generateProfessionalSummary,
};
