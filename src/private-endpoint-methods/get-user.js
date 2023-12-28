const Database = require("../db-helper");
const { prepareResponse } = require("../response-formatter");
const { validateRequest } = require("../request-validator");
const { validateAuthentication } = require("../auth-validator");

const getUser = async (req, res, next) => {
  try {
    validateAuthentication(req.auth);

    // Extract user id from auth token
    const userId = req.auth.payload.user_id;
    console.log('req.auth.payload.user_id :>> ', req.auth.payload.user_id);

    // Try to get user from database
    const userRecord = await Database.runQuery(`
      SELECT * FROM USERS
      WHERE (user_id = '${userId}')
    `);

    if (!(userRecord && userRecord.length)) {
      // Record doesn't exist
      throw {
        status: 401,
        message: "User not found",
      };
    }

    // Send back the new custom JWT
    res.status(200).send(prepareResponse({ userData: userRecord[0] }));
  } catch (error) {
    console.log("error :>> ", error);
    res.status(error.status || 500).send(
      prepareResponse(
        {},
        {
          errorMessage: error.message,
        }
      )
    );
  }
};

module.exports = getUser;
