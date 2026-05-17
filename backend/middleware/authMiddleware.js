const admin = require(
  "firebase-admin"
);

const authMiddleware =
  async (req, res, next) => {
    try {
      /*
        GET TOKEN
      */
      const authHeader =
        req.headers.authorization;

      /*
        NO TOKEN
      */
      if (!authHeader) {
        return res
          .status(401)
          .json({
            error:
              "No token provided",
          });
      }

      /*
        FORMAT:
        Bearer TOKEN
      */
      const token =
        authHeader.split(
          "Bearer "
        )[1];

      /*
        VERIFY TOKEN
      */
      const decodedToken =
        await admin
          .auth()
          .verifyIdToken(
            token
          );

      /*
        ATTACH USER
      */
      req.user =
        decodedToken;

      next();
    } catch (error) {
      console.log(error);

      res.status(401).json({
        error:
          "Unauthorized",
      });
    }
  };

module.exports =
  authMiddleware;