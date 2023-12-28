const Database = require("../db-helper");
const { prepareResponse } = require("../response-formatter");
const { validateRequest } = require("../request-validator");
const { validateAuthentication } = require("../auth-validator");
const ZoomHelper = require("../third-party/zoom-helper");

const updateUserByAdmin = async (req, res, next) => {
  try {
    validateAuthentication(req.auth);
    validateRequest(["fields", "userId"], req.body);
    const { fields, userId } = req.body;

    const { firstName, lastName, state, zip, phone, companyName, country } =
      fields;

    // Update
    await Database.runQuery(`
      UPDATE USERS
      SET first_name = '${firstName}', last_name = '${lastName}', state = '${state}', zip = '${zip}', phone = '${phone}', company_name = '${companyName}', country = '${country}'
      WHERE (user_id = '${userId}');
    `);

    // Extract user id from auth token
    // const userId = req.auth.payload.user_id;

    res.status(200).send(prepareResponse({ success: true }));
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

module.exports = updateUserByAdmin;
