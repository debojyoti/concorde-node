
const Database = require("../db-helper");
const { prepareResponse } = require("../response-formatter");
const { validateRequest } = require("../request-validator");
const { validateAuthentication } = require("../auth-validator");

const updateUser = async (req, res, next) => {
  try {
    validateAuthentication(req.auth);
    validateRequest(
      [
        "firstName",
        "lastName",
        "state",
        "zip",
        "country",
        "companyName",
      ],
      req.body
    );
    const {
      firstName,
      lastName,
      state,
      zip,
      phone = '',
      country,
      companyName,
    } = req.body;

    // Extract user id from auth token
    const userId = req.auth.payload.user_id;

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

    // Update
    await Database.runQuery(`
      UPDATE USERS
      SET first_name = '${firstName}', last_name = '${lastName}', state = '${state}', zip = '${zip}', phone = '${phone}', company_name = '${companyName}', country = '${country}'
      WHERE (user_id = '${userId}');
    `);

    // Get updated user from database
    const updatedRecords = await Database.runQuery(`
        SELECT * FROM USERS
        WHERE (user_id = '${userId}')
      `);

    // Send back the new custom JWT
    res.status(200).send(prepareResponse({ userData: updatedRecords[0] }));
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

module.exports = updateUser;
