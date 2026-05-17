const {
  db,
} = require(
  "../config/firebase"
);

const recruiterMiddleware =
  async (
    req,
    res,
    next
  ) => {
    try {
      /*
        AUTH USER
      */
      const uid =
        req.user.uid;

      /*
        FETCH USER
      */
      const userDoc =
        await db
          .collection(
            "users"
          )
          .doc(uid)
          .get();

      /*
        USER NOT FOUND
      */
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
        RECRUITER ONLY
      */
      if (
        userData.role !==
        "recruiter"
      ) {
        return res
          .status(403)
          .json({
            error:
              "Recruiter access only",
          });
      }

      /*
        ATTACH RECRUITER
        DATA
      */
      req.recruiter =
        userData;

      next();
    } catch (error) {
      console.log(error);

      res.status(500).json({
        error:
          "Authorization failed",
      });
    }
  };

module.exports =
  recruiterMiddleware;