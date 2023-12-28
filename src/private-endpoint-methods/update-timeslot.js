const Database = require("../db-helper");
const { prepareResponse } = require("../response-formatter");
const { validateRequest } = require("../request-validator");
const { validateAuthentication } = require("../auth-validator");
const ZoomHelper = require("../third-party/zoom-helper");

const updateTimeslot = async (req, res, next) => {
  try {
    validateAuthentication(req.auth);
    validateRequest(
      ["newFocusId", "newTimeSlotId", "registrationId", "eventId", "userId"],
      req.body
    );
    const { newFocusId, newTimeSlotId, registrationId, eventId, userId } =
      req.body;

    await ZoomHelper.removeFromWebinar({
        userId,
        eventId
    })

    // Update registration
    await Database.runQuery(`
      UPDATE REGISTRATIONS
      SET event_slot_id = '${newTimeSlotId}', focus_id = '${newFocusId}'
      WHERE (registration_id = '${registrationId}');
    `);

    await ZoomHelper.addToWebinar({
        registrationId
    })

    // Extract user id from auth token
    // const userId = req.auth.payload.user_id;

    // Try to get user from database
    const updatedRecords = await Database.runQuery(`
      SELECT * FROM REGISTRATIONS
      WHERE (registration_id = '${registrationId}')
    `);

    res.status(200).send(prepareResponse({ registration: updatedRecords[0] }));
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

module.exports = updateTimeslot;
