const {
  roleRequirements,
} = require(
  "../data/roleRequirements"
);

/*
  GENERATE LEARNING PATH
*/
const generateLearningPath =
  async (
    profile
  ) => {

    /*
      CURRENT SKILLS
    */
    const currentSkills =
      (
        profile.professionalSkills || []
      ).map(
        (skill) =>
          skill.toLowerCase()
      );

    /*
      TARGET ROLE
    */
    const targetRole =
      (
        profile.preferredRoles || []
      )[0];

    /*
      ROLE DATA
    */
    const roleData =
      roleRequirements[
        targetRole
      ];

    /*
      FALLBACK
    */
    if (!roleData) {

      return {

        targetRole,

        currentSkills,

        missingSkills:
          [],

        recommendedSkills:
          [],

        roadmap:
          [],

        estimatedMatchImprovement:
          0,
      };
    }

    /*
      REQUIRED SKILLS
    */
    const requiredSkills =
      roleData.requiredSkills;

    /*
      SKILL GAP
    */
    const missingSkills =
      requiredSkills.filter(
        (skill) =>
          !currentSkills.includes(
            skill
          )
      );

    /*
      PRIORITIZE
    */
    const prioritizedSkills =
      [
        ...roleData.foundationalSkills.filter(
          (skill) =>
            missingSkills.includes(
              skill
            )
        ),

        ...missingSkills.filter(
          (skill) =>
            !roleData.foundationalSkills.includes(
              skill
            )
        ),
      ];

    /*
      ROADMAP
    */
    const roadmap =
      prioritizedSkills.map(
        (
          skill,
          index
        ) => ({

          step:
            index + 1,

          skill,

          title:
            `Learn ${skill}`,

          description:
            `Develop practical skills in ${skill} to improve your readiness for ${targetRole}.`,
        })
      );

    /*
      IMPROVEMENT ESTIMATE
    */
    const estimatedMatchImprovement =
      Math.min(
        95,
        missingSkills.length * 12
      );

    return {

      targetRole,

      currentSkills,

      missingSkills,

      recommendedSkills:
        prioritizedSkills,

      roadmap,

      estimatedMatchImprovement,
    };
  };

module.exports = {
  generateLearningPath,
};