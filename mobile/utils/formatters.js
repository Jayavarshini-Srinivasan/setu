/*
  FORMAT DATE
*/
export function formatDate(
  dateValue
) {
  if (!dateValue) {
    return "Unknown Date";
  }

  /*
    FIRESTORE TIMESTAMP
  */
  if (
    dateValue.seconds
  ) {
    return new Date(
      dateValue.seconds *
        1000
    ).toLocaleDateString();
  }

  return new Date(
    dateValue
  ).toLocaleDateString();
}

/*
  FORMAT EXPERIENCE
*/
export function formatExperience(
  experience
) {
  if (
    experience === undefined ||
    experience === null ||
    experience === ""
  ) {
    return "N/A";
  }

  return `${experience} years`;
}

/*
  FORMAT SKILLS
*/
export function formatSkills(
  skills
) {
  if (
    !skills ||
    skills.length === 0
  ) {
    return "N/A";
  }

  return skills.join(", ");
}

/*
  FORMAT SALARY
*/
export function formatSalary(
  salary,
  category
) {
  if (!salary) {
    return "N/A";
  }

  const isLabour = (category || "").toLowerCase() === "labour";
  const period = isLabour ? "/mo" : "/yr";
  const formatted = typeof salary === "number" ? salary.toLocaleString() : salary;
  return `₹${formatted}${period}`;
}