/*
  REQUIRED STRING
*/
export function isRequiredString(
  value
) {
  return (
    typeof value ===
      "string" &&
    value.trim() !== ""
  );
}

/*
  VALID EMAIL
*/
export function isValidEmail(
  email
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

/*
  CLEAN SKILLS
*/
export function normalizeSkills(
  skills
) {
  if (
    typeof skills !==
    "string"
  ) {
    return [];
  }

  return skills
    .split(",")
    .map((skill) =>
      skill.trim()
    )
    .filter(Boolean);
}