const {
  generateResume,
} = require(
  "../services/resumeGenerationService"
);

const {
  db,
} = require(
  "../config/firebase"
);

/*
  GENERATE RESUME
*/
const buildResume =
  async (
    req,
    res
  ) => {

    try {

      const {
        userId,
      } = req.body;

      /*
        USER DOC
      */
      const userDoc =
        await db
          .collection("users")
          .doc(userId)
          .get();

      if (
        !userDoc.exists
      ) {

        return res
          .status(404)
          .json({
            error:
              "User not found",
          });
      }

      const userData =
        userDoc.data();

      /*
        PROFILE
      */
      const profile =
        userData.profile;

      /*
        GENERATE
      */
console.log(
  "PROFILE DATA:"
);

console.log(
  JSON.stringify(
    profile,
    null,
    2
  )
);
      const resume =
        await generateResume(
          profile

        );

      return res.json(
        resume
      );

    } catch (error) {

      console.log(error);

      return res
        .status(500)
        .json({
          error:
            "Failed to generate resume",
        });
    }
  };

module.exports = {
  buildResume,
};