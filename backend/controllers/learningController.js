const {
  generateLearningPath,
} = require(
  "../services/learningPathService"
);

const {
  db,
} = require(
  "../config/firebase"
);

/*
  GET LEARNING PATH
*/
const getLearningPath =
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
      const learningPath =
        await generateLearningPath(
          profile
        );

      return res.json(
        learningPath
      );

    } catch (error) {

      console.log(error);

      return res
        .status(500)
        .json({
          error:
            "Failed to generate learning path",
        });
    }
  };

module.exports = {
  getLearningPath,
};