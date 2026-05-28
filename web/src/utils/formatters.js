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
    dateValue._seconds
  ) {
    return new Date(
      dateValue._seconds *
        1000
    ).toLocaleDateString();
  }

  return new Date(
    dateValue
  ).toLocaleDateString();
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
  FORMAT SALARY
*/
export function formatSalary(
  salary
) {
  if (!salary) {
    return "N/A";
  }

  return `₹${salary}`;
}

/*
  FORMAT STATUS
*/
export function formatStatus(
  status
) {
  if (!status) {
    return "Unknown";
  }

  return (
    status.charAt(0)
      .toUpperCase() +
    status.slice(1)
  );
}

/*
  GET DISPLAY NAME
*/
export function getDisplayName(profile = {}, authUser = {}) {
  if (profile.name && profile.name.trim()) {
    return profile.name.trim();
  }
  if (profile.fullName && profile.fullName.trim()) {
    return profile.fullName.trim();
  }
  if (profile.resumeSummary && profile.resumeSummary.includes("|")) {
    return profile.resumeSummary.split("|")[0].trim();
  }
  if (authUser && authUser.name && authUser.name.trim()) {
    return authUser.name.trim();
  }
  if (authUser && authUser.fullName && authUser.fullName.trim()) {
    return authUser.fullName.trim();
  }
  if (authUser && authUser.email) {
    return authUser.email.split("@")[0].trim();
  }
  return "Worker";
}