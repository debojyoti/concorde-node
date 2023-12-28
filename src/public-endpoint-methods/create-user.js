const Database = require("../db-helper");
const JWTHelper = require("../jwt-helper");
const { validateRequest } = require("../request-validator");
const { prepareResponse } = require("../response-formatter");

const createUser = async (req, res, next) => {
  try {
    validateRequest(
      [
        "email",
        "authToken"
      ],
      req.body
    );
    const {
      firstName = '',
      lastName = '',
      state = '',
      zip = '',
      email,
      authToken,
      country = '',
      phone = '',
      companyName = '',
    } = req.body;

    const decodedData = JWTHelper.decodeToken(authToken);

    const userId = decodedData.user_id;

    // First check if user exits
    // Try to get user from database
    const userRecord = await Database.runQuery(`
        SELECT * FROM USERS
        WHERE (user_id = '${userId}')
      `);

    if (userRecord && userRecord.length) {
      // User already exist
      throw {
        status: 403,
        message: "User already exists",
      };
    }

    // Record doesn't exist
    // So insert
    await Database.runQuery(`
    INSERT INTO USERS (first_name,
      last_name,
      state,
      zip,
      email,
      user_id,
      role,
      country,
      phone,
      company_name,
      registered_at)
    VALUES ('${firstName}',
      '${lastName}',
      '${state}',
      '${zip}',
      '${email}',
      '${userId}',
      'user',
      '${country}',
      '${phone}',
      '${companyName}',
      ${+new Date()});
  `);

    const users = await Database.runQuery(`
      SELECT * FROM USERS
      WHERE (user_id = '${userId}')
    `);

    // Wrap the user data in a new custom JWT
    const token = JWTHelper.createToken(users[0]);

    // Send back the new custom JWT
    res.status(200).send(prepareResponse({ userData: users[0], token }));
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

module.exports = createUser;
