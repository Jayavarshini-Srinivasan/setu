const { GoogleGenerativeAI } = require("@google/generative-ai");
const { normalizeRole }      = require("../normalization/roleOntologyNormalizer");
const { roleSkillMap }       = require("../../data/roleSkillMap");
const { normalizeLocation }  = require("../normalization/locationNormalizer");
const { geminiQueue }        = require("../aiService");

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY_PROFILE_EXTRACTION || process.env.GEMINI_API_KEY
);

// Use gemini-2.5-flash as default since it is highly available, extremely fast, and highly accurate on this environment
const modelName = process.env.GEMINI_MODEL_PROFILE_EXTRACTION || "gemini-2.5-flash";
const model = genAI.getGenerativeModel({ model: modelName });

const emptyProfile = () => ({
  fullName:           "",
  rawRole:            "",
  skills:             [],
  professionalSkills: [],
  experience:         0,
  location:           "",
  availability:       "",
  preferredShift:     "",
  canonicalRole:      "",
  category:           "",
  education:          {
    degree:           "",
    institution:      "",
    graduationYear:   "",
    fieldOfStudy:     ""
  },
  experienceDetails:  [],
  languages:          [],
  age:                "",
  phoneNumber:        "",
  workRadius:         "",
  expectedWage:       "",
  expectedSalary:     null,
  careerGoal:         "",
  transportAccess:    false
});

// Helper for checking if an explicit override is requested in the transcript
const hasExplicitOverride = (transcript, fieldName) => {
  const lower = (transcript || "").toLowerCase();
  const keywords = ["change", "correct", "update", "instead of", "not my", "not", "no, i am", "actually", "correction", "fix", "error"];
  return keywords.some(kw => lower.includes(kw));
};

// Clean duplicates from string arrays case-insensitively
const cleanArrayOfStrings = (arr) => {
  if (!Array.isArray(arr)) return [];
  const seen = new Set();
  return arr
    .map(s => String(s).trim())
    .filter(s => {
      if (!s) return false;
      const lower = s.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });
};

// Safe JSON parse with multi-layered fallbacks (bracket matching + regex field recovery)
const safeJSONParse = (text, fallback) => {
  if (!text) return fallback;
  let cleaned = text.trim();
  
  // Clean markdown json block ticks if any
  cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  
  // Isolate first curly block
  const jsonStart = cleaned.indexOf("{");
  const jsonEnd   = cleaned.lastIndexOf("}");
  if (jsonStart >= 0 && jsonEnd >= 0) {
    cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
  }
  
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn("[profileExtractionService] JSON parse failed, triggering regex recovery...", err.message);
    const recovered = { ...fallback };

    // Helper functions for recovery
    const extractString = (key) => {
      const match = new RegExp(`"${key}"\\s*:\\s*"([^"]*)"`, "i").exec(cleaned);
      return match ? match[1] : null;
    };
    const extractArray = (key) => {
      const match = new RegExp(`"${key}"\\s*:\\s*\\[([^\\]]*)\\]`, "i").exec(cleaned);
      if (match) {
        return match[1]
          .split(",")
          .map(s => s.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean);
      }
      return null;
    };
    const extractNumber = (key) => {
      const match = new RegExp(`"${key}"\\s*:\\s*(\\d+)`, "i").exec(cleaned);
      return match ? Number(match[1]) : null;
    };
    const extractBoolean = (key) => {
      const match = new RegExp(`"${key}"\\s*:\\s*(true|false)`, "i").exec(cleaned);
      return match ? match[1] === "true" : null;
    };

    // Restore top-level properties
    const fullName = extractString("fullName");
    if (fullName !== null) recovered.fullName = fullName;
    
    const rawRole = extractString("rawRole");
    if (rawRole !== null) recovered.rawRole = rawRole;
    
    const location = extractString("location");
    if (location !== null) recovered.location = location;
    
    const availability = extractString("availability");
    if (availability !== null) recovered.availability = availability;
    
    const preferredShift = extractString("preferredShift");
    if (preferredShift !== null) recovered.preferredShift = preferredShift;
    
    const age = extractString("age") || extractNumber("age");
    if (age !== null) recovered.age = String(age);
    
    const expectedWage = extractString("expectedWage");
    if (expectedWage !== null) recovered.expectedWage = expectedWage;
    
    const careerGoal = extractString("careerGoal");
    if (careerGoal !== null) recovered.careerGoal = careerGoal;

    const experience = extractNumber("experience");
    if (experience !== null) recovered.experience = experience;

    const transportAccess = extractBoolean("transportAccess");
    if (transportAccess !== null) recovered.transportAccess = transportAccess;

    const skills = extractArray("skills");
    if (skills !== null) recovered.skills = skills;

    const professionalSkills = extractArray("professionalSkills");
    if (professionalSkills !== null) recovered.professionalSkills = professionalSkills;

    const languages = extractArray("languages");
    if (languages !== null) recovered.languages = languages;

    // Parse nested education object via regex
    const eduMatch = /"education"\s*:\s*\{([^}]*)\}/i.exec(cleaned);
    if (eduMatch) {
      const eduContent = eduMatch[1];
      const getEduStr = (k) => {
        const m = new RegExp(`"${k}"\\s*:\\s*"([^"]*)"`, "i").exec(eduContent);
        return m ? m[1] : "";
      };
      const getEduNum = (k) => {
        const m = new RegExp(`"${k}"\\s*:\\s*(\\d+)`, "i").exec(eduContent);
        return m ? Number(m[1]) : "";
      };
      recovered.education = {
        degree: getEduStr("degree") || recovered.education.degree,
        institution: getEduStr("institution") || recovered.education.institution,
        graduationYear: getEduNum("graduationYear") || recovered.education.graduationYear,
        fieldOfStudy: getEduStr("fieldOfStudy") || recovered.education.fieldOfStudy
      };
    }

    // Parse nested experienceDetails array of objects via regex (even if missing/cut off bracket ])
    const expDetailsBlockMatch = /"experienceDetails"\s*:\s*\[([\s\S]*)$/i.exec(cleaned);
    if (expDetailsBlockMatch) {
      const blockContent = expDetailsBlockMatch[1];
      const detailBlocks = [];
      const rx = /\{([^}]*)\}/g;
      let m;
      while ((m = rx.exec(blockContent)) !== null) {
        detailBlocks.push(m[1]);
      }
      if (detailBlocks.length > 0) {
        recovered.experienceDetails = detailBlocks.map(block => {
          const getVal = (k) => {
            const m = new RegExp(`"${k}"\\s*:\\s*"([^"]*)"`, "i").exec(block);
            return m ? m[1] : "";
          };
          const getNum = (k) => {
            const m = new RegExp(`"${k}"\\s*:\\s*(\\d+)`, "i").exec(block);
            return m ? Number(m[1]) : null;
          };
          return {
            company: getVal("company"),
            role: getVal("role"),
            startYear: getNum("startYear"),
            endYear: getVal("endYear") || getNum("endYear"),
            achievements: getVal("achievements")
          };
        }).filter(item => item.company || item.role);
      }
    }

    return recovered;
  }
};

const extractProfileData = async (transcript, context = {}) => {
  if (!transcript || transcript.trim().length < 3) {
    return { ...emptyProfile(), ...context };
  }

  // Refined prompt - extremely token-efficient, concise schema & strict rules
  const prompt = `Extract profile details from the transcript under the context of existing selections.
Do NOT overwrite existing non-empty values in context unless the transcript explicitly commands an update or correction.
Support natural conversational & mixed-language speech (e.g. Hinglish, Tamil-English). Ignore filler words.
Return ONLY a single compact JSON object. No markdown formatting, no explanations, no wrapping in \`\`\`json.

Context: ${JSON.stringify(context)}
Transcript: "${transcript}"

JSON Schema:
{
  "fullName": "Extracted name",
  "rawRole": "Spoken job role/title",
  "skills": ["Extracted labour/trade skills"],
  "professionalSkills": ["Extracted professional/office/software skills"],
  "experience": "Total years of experience as a number",
  "location": "City/area",
  "availability": "Availability (Full-time, Part-time)",
  "preferredShift": "Preferred shift (Day, Night)",
  "education": {
    "degree": "Degree (e.g. 10th, BTech)",
    "institution": "School/College name",
    "graduationYear": "Graduation year as a number",
    "fieldOfStudy": "Major/Field of study"
  },
  "experienceDetails": [
    {
      "company": "Company name",
      "role": "Job Title",
      "startYear": "Start year as number",
      "endYear": "End year as number or 'Present'",
      "achievements": "Description of work done"
    }
  ],
  "languages": ["Languages spoken"],
  "age": "Age as a number or string",
  "expectedWage": "Expected wage",
  "expectedSalary": { "min": "Number", "max": "Number", "currency": "INR" },
  "careerGoal": "Career goal summary",
  "transportAccess": "true/false boolean if they mention having a vehicle/bike"
}`;

  let parsed = emptyProfile();
  try {
    const result   = await geminiQueue.add(() => model.generateContent(prompt));
    const response = result.response.text();
    parsed = safeJSONParse(response, emptyProfile());
  } catch (err) {
    console.warn("[profileExtractionService] extractProfileData failed:", err?.message);
    // If the generation fails entirely, safely fallback to merging emptyProfile with existing context
    return {
      ...emptyProfile(),
      ...context,
      canonicalRole: context.canonicalRole || 'other',
      error: true
    };
  }

  // --- POST-EXTRACTION MERGING & MANUAL PRESERVATION ---
  const mergeStringNumber = (key, parsedVal, contextVal) => {
    if (contextVal !== undefined && contextVal !== null && contextVal !== "") {
      if (parsedVal && parsedVal !== contextVal && hasExplicitOverride(transcript, key)) {
        return parsedVal;
      }
      return contextVal;
    }
    return parsedVal || "";
  };

  const mergeBoolean = (key, parsedVal, contextVal) => {
    if (contextVal === true || contextVal === false) {
      if (parsedVal !== undefined && parsedVal !== null && parsedVal !== contextVal && hasExplicitOverride(transcript, key)) {
        return parsedVal;
      }
      return contextVal;
    }
    return parsedVal ?? false;
  };

  const mergeArray = (parsedVal, contextVal) => {
    const arr1 = Array.isArray(contextVal) ? contextVal : [];
    const arr2 = Array.isArray(parsedVal) ? parsedVal : [];
    return cleanArrayOfStrings([...arr1, ...arr2]);
  };

  const mergeEducation = (prs, ctx) => {
    const p = prs || {};
    const c = ctx || {};
    return {
      degree: mergeStringNumber("degree", p.degree, c.degree),
      institution: mergeStringNumber("institution", p.institution, c.institution),
      graduationYear: mergeStringNumber("graduationYear", p.graduationYear, c.graduationYear),
      fieldOfStudy: mergeStringNumber("fieldOfStudy", p.fieldOfStudy, c.fieldOfStudy)
    };
  };

  const mergeExperienceDetails = (prsList, ctxList) => {
    const list1 = Array.isArray(ctxList) ? ctxList : [];
    const list2 = Array.isArray(prsList) ? prsList : [];
    const merged = [...list1];
    for (const p of list2) {
      if (!p.company && !p.role) continue;
      const isDuplicate = list1.some(c => 
        String(c.company || "").toLowerCase().trim() === String(p.company || "").toLowerCase().trim() &&
        String(c.role || "").toLowerCase().trim() === String(p.role || "").toLowerCase().trim()
      );
      if (!isDuplicate) {
        merged.push(p);
      }
    }
    return merged;
  };

  // Perform safe merges across all fields
  const mergedProfile = {
    fullName:           mergeStringNumber("fullName", parsed.fullName, context.fullName),
    rawRole:            mergeStringNumber("rawRole", parsed.rawRole, context.rawRole || context.role),
    skills:             mergeArray(parsed.skills, context.skills),
    professionalSkills: mergeArray(parsed.professionalSkills, context.professionalSkills),
    experience:         mergeStringNumber("experience", parsed.experience, context.experience),
    location:           mergeStringNumber("location", parsed.location, context.location),
    availability:       mergeStringNumber("availability", parsed.availability, context.availability),
    preferredShift:     mergeStringNumber("preferredShift", parsed.preferredShift, context.preferredShift),
    languages:          mergeArray(parsed.languages, context.languages),
    age:                mergeStringNumber("age", parsed.age, context.age),
    phoneNumber:        mergeStringNumber("phoneNumber", parsed.phoneNumber, context.phoneNumber),
    workRadius:         mergeStringNumber("workRadius", parsed.workRadius, context.workRadius),
    expectedWage:       mergeStringNumber("expectedWage", parsed.expectedWage, context.expectedWage),
    expectedSalary:     context.expectedSalary || parsed.expectedSalary,
    careerGoal:         mergeStringNumber("careerGoal", parsed.careerGoal, context.careerGoal),
    transportAccess:    mergeBoolean("transportAccess", parsed.transportAccess, context.transportAccess),
    education:          mergeEducation(parsed.education, context.education),
    experienceDetails:  mergeExperienceDetails(parsed.experienceDetails, context.experienceDetails)
  };

  // Normalize Role & Location using existing logic
  const roleData = normalizeRole(mergedProfile.rawRole);
  const inferredSkills = roleSkillMap[roleData.canonicalRole] || [];
  
  // Combine extracted skills with inferred role skills, removing duplicates
  mergedProfile.skills = cleanArrayOfStrings([...mergedProfile.skills, ...inferredSkills]);
  mergedProfile.category = roleData.category;
  mergedProfile.canonicalRole = roleData.canonicalRole;
  
  if (mergedProfile.location) {
    mergedProfile.location = normalizeLocation(mergedProfile.location);
  }

  return mergedProfile;
};

// ── Screen-specific lightweight extraction (no context-merging) ──

const SCREEN_PROMPTS = {
  profile: {
    instruction: `Extract ONLY the person's name and job role/title from the transcript.
Return ONLY a compact JSON: {"fullName":"","rawRole":"","professionalRole":""}
No markdown, no explanation. Empty string if not found.`,
    fallback: () => ({ fullName: "", rawRole: "", professionalRole: "" }),
  },
  skills: {
    instruction: `Extract ONLY skills, tools, and technologies mentioned in the transcript.
Return ONLY a compact JSON: {"professionalSkills":[],"skills":[]}
professionalSkills = office/software/professional skills. skills = trade/labour skills.
No markdown, no explanation. Empty arrays if none found.`,
    fallback: () => ({ professionalSkills: [], skills: [] }),
  },
  education: {
    instruction: `Extract ONLY education details from the transcript.
Return ONLY a compact JSON: {"education":{"degree":"","institution":"","graduationYear":"","fieldOfStudy":""}}
graduationYear should be a number if mentioned. No markdown, no explanation. Empty strings if not found.`,
    fallback: () => ({ education: { degree: "", institution: "", graduationYear: "", fieldOfStudy: "" } }),
  },
  experience: {
    instruction: `Extract ONLY work experience entries from the transcript.
Return ONLY a compact JSON: {"experienceDetails":[{"company":"","role":"","startYear":null,"endYear":"","achievements":""}]}
startYear/endYear as numbers or "Present". No markdown, no explanation. Empty array if none found.`,
    fallback: () => ({ experienceDetails: [] }),
  },
  goals: {
    instruction: `Extract ONLY career goals, salary expectations, and preferred roles from the transcript.
Return ONLY a compact JSON: {"careerGoal":"","expectedSalary":{"min":null,"max":null,"currency":"INR"},"preferredRoles":[]}
Salary values as numbers. No markdown, no explanation. Null/empty if not found.`,
    fallback: () => ({ careerGoal: "", expectedSalary: null, preferredRoles: [] }),
  },
};

const extractScreenData = async (transcript, screenType) => {
  const config = SCREEN_PROMPTS[screenType];
  if (!config) {
    console.warn(`[profileExtractionService] unknown screenType "${screenType}", falling back to full extraction`);
    return extractProfileData(transcript, {});
  }

  if (!transcript || transcript.trim().length < 3) {
    return config.fallback();
  }

  const prompt = `${config.instruction}
Support mixed-language speech (Hinglish, Tamil-English etc). Ignore filler words.
Transcript: "${transcript}"`;

  try {
    const result = await geminiQueue.add(() => model.generateContent(prompt));
    const response = result.response.text();
    const parsed = safeJSONParse(response, config.fallback());

    // Clean any arrays in the result
    if (Array.isArray(parsed.skills)) parsed.skills = cleanArrayOfStrings(parsed.skills);
    if (Array.isArray(parsed.professionalSkills)) parsed.professionalSkills = cleanArrayOfStrings(parsed.professionalSkills);
    if (Array.isArray(parsed.preferredRoles)) parsed.preferredRoles = cleanArrayOfStrings(parsed.preferredRoles);

    // Clean experience details
    if (Array.isArray(parsed.experienceDetails)) {
      parsed.experienceDetails = parsed.experienceDetails.filter(item => item.company || item.role);
    }

    return parsed;
  } catch (err) {
    console.warn(`[profileExtractionService] extractScreenData(${screenType}) failed:`, err?.message);
    return config.fallback();
  }
};

module.exports = { extractProfileData, extractScreenData };