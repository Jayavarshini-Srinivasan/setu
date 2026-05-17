const {
  GoogleGenerativeAI,
} = require(
  "@google/generative-ai"
);

const {
  normalizeRole,
} = require(
  "../normalization/roleNormalizer"
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
    transcript
  ) => {

    const prompt = `
Extract structured worker information from this transcript.

Transcript:
"${transcript}"

Return ONLY valid JSON.

Format:
{
  "rawRole": "",
  "skills": [],
  "experience": 0,
  "location": "",
  "availability": ""
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
    const cleaned =
      response
        .replace(
          /```json/g,
          ""
        )
        .replace(
          /```/g,
          ""
        )
        .trim();

    const parsed =
      JSON.parse(
        cleaned
      );

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