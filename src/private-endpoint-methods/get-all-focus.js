const Database = require("../db-helper");
const JWTHelper = require("../jwt-helper");
const { validateRequest } = require("../request-validator");
const { prepareResponse } = require("../response-formatter");
const { validateAuthentication } = require("../auth-validator");

const getAllFocus = async (req, res, next) => {
  try {
    validateAuthentication(req.auth);

    // Extract user id from auth token
    const userId = req.auth.user_id;

    // Get all events
    const focus = await Database.runQuery(`
    SELECT * 
    FROM FOCUS;
  `);

    res.status(200).send(prepareResponse({ focus }));
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

module.exports = getAllFocus;
