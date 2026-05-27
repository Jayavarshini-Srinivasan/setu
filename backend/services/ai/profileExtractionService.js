const { GoogleGenerativeAI } = require("@google/generative-ai");
const { normalizeRole }      = require("../normalization/roleOntologyNormalizer");
const { roleSkillMap }       = require("../../data/roleSkillMap");
const { normalizeLocation }  = require("../normalization/locationNormalizer");
const { geminiQueue }        = require("../aiService");
const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY_PROFILE_EXTRACTION || process.env.GEMINI_API_KEY
);
const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });
const emptyProfile = () => ({
  rawRole:       "",
  skills:        [],
  experience:    0,
  location:      "",
  availability:  "",
  preferredShift:"",
  canonicalRole: "",
  category:      "",
});
const extractProfileData = async (transcript, context = {}) => {
  if (!transcript || transcript.trim().length < 3) {
    return emptyProfile();
  }
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
5. Return ONLY valid JSON. No explanation, no markdown.
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
  let parsed = emptyProfile();
  try {
    const result   = await geminiQueue.add(() => model.generateContent(prompt));
    const response = result.response.text();
    let cleaned = response.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonStart = cleaned.indexOf("{");
    const jsonEnd   = cleaned.lastIndexOf("}");
    if (jsonStart >= 0 && jsonEnd >= 0) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }
    parsed = { ...emptyProfile(), ...JSON.parse(cleaned) };
  } catch (err) {
    console.warn("[profileExtractionService] extractProfileData failed:", err?.message);
    return {
      canonicalRole: 'other',
      skills: [],
      location: '',
      availability: '',
      error: true
    };
  }
  const roleData = normalizeRole(parsed.rawRole);
  const inferredSkills = roleSkillMap[roleData.canonicalRole] || [];
  const extractedSkills = (parsed.skills || []).map((s) =>
    (s || "").toString().toLowerCase().trim()
  );
  const mergedSkills = [...new Set([...extractedSkills, ...inferredSkills])];
  const normalizedLocation = normalizeLocation(parsed.location);
  return {
    ...parsed,
    skills:       mergedSkills,
    category:     roleData.category,
    canonicalRole:roleData.canonicalRole,
    location:     normalizedLocation,
  };
};
module.exports = { extractProfileData };