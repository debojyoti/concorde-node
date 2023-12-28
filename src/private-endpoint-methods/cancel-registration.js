const Database = require("../db-helper");
const JWTHelper = require("../jwt-helper");
const { validateRequest } = require("../request-validator");
const { prepareResponse } = require("../response-formatter");
const { validateAuthentication } = require("../auth-validator");
const cuid = require("cuid");
const ZoomHelper = require("../third-party/zoom-helper");

const cancelEventRegistration = async (req, res, next) => {
  try {
    validateAuthentication(req.auth);
    validateRequest(["eventId"], req.body);

    const { eventId } = req.body;

    // Extract user id from auth token
    const userId = req.auth.payload.user_id;

    console.log("req.auth :>> ", req.auth);

    await ZoomHelper.removeFromWebinar({
      userId,
      eventId
    })

    // Delete
    await Database.runQuery(`
        DELETE FROM REGISTRATIONS
        WHERE (user_id = '${userId}') AND (event_id = '${eventId}')
      `);

    res
      .status(200)
      .send(
        prepareResponse({ message: "Registration cancelled Successfully" })
      );
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

module.exports = cancelEventRegistration;
