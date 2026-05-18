const {
  GoogleGenerativeAI,
} = require(
  "@google/generative-ai"
);

const {
  normalizeRole,
} = require(
  "../normalization/roleOntologyNormalizer"
);

const {
  roleSkillMap,
} = require(
  "../../data/roleSkillMap"
);
const {
  normalizeLocation,
} = require(
  "../normalization/locationNormalizer"
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

const extractProfileData =
  async (
    transcript,
    context = {}
  ) => {

    const prompt = `
Extract structured worker information from this transcript.
The user might be continuing a flow. Here is what they have selected so far:
${JSON.stringify(context, null, 2)}

Transcript:
"${transcript}"

Instructions:
1. Identify any new info mentioned in the transcript.
2. MERGE this new info with the existing selections. Do NOT overwrite existing information unless the user explicitly changes it.
3. If they say "I also do X", append X to their skills.
4. If they say a role, update the role.
5. Return ONLY valid JSON.

Format:
{
  "rawRole": "",
  "skills": [],
  "experience": 0,
  "location": "",
  "availability": "",
  "preferredShift": ""
}
`;

    const result =
      await model.generateContent(
        prompt
      );

    const response =
      result.response
        .text();

    /*
      CLEAN JSON
    */
    let cleaned = response.replace(/```json/g, "").replace(/```/g, "").trim();

    // Sometimes LLM returns non-json text before or after
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');
    if (jsonStart >= 0 && jsonEnd >= 0) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }

    let parsed = {
      rawRole: "",
      skills: [],
      experience: 0,
      location: "",
      availability: ""
    };

    try {
      if (cleaned) {
        parsed = JSON.parse(cleaned);
      }
    } catch (e) {
      console.log("JSON parsing failed, using fallback:", e.message);
      // Fallback: try to extract some basic information
      const lowerResp = response.toLowerCase();
      if (lowerResp.includes("driver")) parsed.rawRole = "driver";
      else if (lowerResp.includes("electrician")) parsed.rawRole = "electrician";
      // fallback skills
      parsed.skills = [];
    }

    /*
      ROLE NORMALIZATION
    */
    const roleData =
      normalizeRole(
        parsed.rawRole
      );

    /*
      INFERRED SKILLS
    */
    const inferredSkills =
      roleSkillMap[
        roleData
          .canonicalRole
      ] || [];

    /*
      EXTRACTED SKILLS
    */
    const extractedSkills =
      (
        parsed.skills || []
      ).map((skill) =>
        skill
          .toLowerCase()
          .trim()
      );

    /*
      MERGED SKILLS
    */
    const mergedSkills =
      [
        ...new Set([
          ...extractedSkills,
          ...inferredSkills,
        ]),
      ];

/*
  LOCATION NORMALIZATION
*/
    const normalizedLocation =
    normalizeLocation(
        parsed.location
    );

    return {
      ...parsed,

      skills:
        mergedSkills,

      category:
        roleData.category,

      canonicalRole:
        roleData.canonicalRole,
      location:
        normalizedLocation,
    };
  };

module.exports = {
  extractProfileData,
};