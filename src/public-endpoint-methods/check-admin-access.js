const Database = require("../db-helper");
const JWTHelper = require("../jwt-helper");
const { validateRequest } = require("../request-validator");
const { prepareResponse } = require("../response-formatter");

const checkAdminAccess = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Try to get user from database
    const userRecord = await Database.runQuery(`
      SELECT * FROM ADMINS
      WHERE (admin_email = '${email}')
    `);

    const payload = {
      hasAccess: true
    }

    if (!(userRecord && userRecord.length)) {
      // Record doesn't exist
      payload.hasAccess = false;
    }

    // Send back the new custom JWT
    res.status(200).send(prepareResponse({ hasAccess: payload.hasAccess }));
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

module.exports = checkAdminAccess;
