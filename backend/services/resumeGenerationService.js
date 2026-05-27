const {
  generateProfessionalSummary,
} = require(
  "./aiService"
);

/*
  BUILD RESUME
*/
const generateResume =
  async (
    profile
  ) => {

    /*
      EXTRACT
    */
    const professionalRole =
      profile.professionalRole || "";

    const skills =
      profile.professionalSkills || [];

    const experience =
      profile.experienceDetails || [];

    const education =
      profile.education || {};

    const preferredRoles =
      profile.preferredRoles || [];

    /*
      TOTAL EXPERIENCE
    */
    const totalYears =
      experience.reduce(
        (
          total,
          item
        ) => {

          return (
            total +
            Number(
              item.years || 0
            )
          );
        },
        0
      );

    /*
      AI SUMMARY
    */
    const summary =
      await generateProfessionalSummary({

        role:
          professionalRole,

        skills,

        experience,

        totalYears,

        goals:
          preferredRoles,
      });

    /*
      STRUCTURED RESUME
    */
    return {

      role:
        professionalRole,

      summary,

      skills,

      education,

      experience,

      preferredRoles,

      location:profile.location || "",
      email : profile.email || "",
      phoneNumber : profile.phoneNumber || "",
      fullName : profile.fullName || "",


      links: {

        linkedin:
          profile.linkedin || "",

        github:
          profile.github || "",

        portfolio:
          profile.portfolio || "",
      },
    };
  };

module.exports = {
  generateResume,
};