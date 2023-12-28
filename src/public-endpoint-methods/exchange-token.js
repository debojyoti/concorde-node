const Database = require("../db-helper");
const JWTHelper = require("../jwt-helper");
const { validateRequest } = require("../request-validator");
const { prepareResponse } = require("../response-formatter");

const exchangeToken = async (req, res, next) => {
  try {
    validateRequest(["authToken"], req.body);
    const { authToken } = req.body;
    // Decode firebase token
    const decodedData = JWTHelper.decodeToken(authToken);

    // Try to get user from database
    const userRecord = await Database.runQuery(`
      SELECT * FROM USERS
      WHERE (user_id = '${decodedData.user_id}')
    `);

    if (!(userRecord && userRecord.length)) {
      // Record doesn't exist
      throw {
        status: 401,
        message: "User not found",
      };
    }

    // Record exists
    // Wrap the user data in a new custom JWT
    const token = JWTHelper.createToken(userRecord[0]);

    // Send back the new custom JWT
    res.status(200).send(prepareResponse({ userData: userRecord[0], token }));
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

module.exports = exchangeToken;
