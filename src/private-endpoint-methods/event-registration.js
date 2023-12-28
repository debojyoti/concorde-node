const Database = require("../db-helper");
const JWTHelper = require("../jwt-helper");
const { validateRequest } = require("../request-validator");
const { prepareResponse } = require("../response-formatter");
const { validateAuthentication } = require("../auth-validator");
const cuid = require("cuid");
const ZoomHelper = require("../third-party/zoom-helper");

const eventRegistration = async (req, res, next) => {
  try {
    validateAuthentication(req.auth);
    validateRequest(["eventId", "eventSlotId", "focusId"], req.body);

    const { eventId, eventSlotId, focusId, userId: bodyUserId = null } = req.body;

    // Extract user id from auth token
    let userId = req.auth.payload.user_id;
    if (bodyUserId) {
      userId = bodyUserId;
    }

    console.log("req.auth :>> ", req.auth);

    // Record doesn't exist
    // So insert
    const registrationId = cuid();
    await Database.runQuery(`
    INSERT INTO REGISTRATIONS (event_id,
      event_slot_id,
      focus_id,
      user_id,
      registered_at,
      registration_id)
    VALUES (
      '${eventId}',
      '${eventSlotId}',
      '${focusId}',
      '${userId}',
      '${+new Date()}',
      '${registrationId}');
  `);
    ZoomHelper.addToWebinar({
      registrationId,
    });
    res
      .status(200)
      .send(prepareResponse({ message: "Registered Successfully" }));
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

module.exports = eventRegistration;
