const Database = require("../db-helper");
const JWTHelper = require("../jwt-helper");
const { validateRequest } = require("../request-validator");
const { prepareResponse } = require("../response-formatter");
const { validateAuthentication } = require("../auth-validator");

const getRegisteredEvents = async (req, res, next) => {
  try {
    validateAuthentication(req.auth);

    // Extract user id from auth token
    const userId = req.auth.payload.user_id;

    // Get all events and slots
    const allEventSlots = await Database.runQuery(`
    SELECT * 
    FROM EVENTS
    INNER JOIN EVENTS_SLOTS ON EVENTS_SLOTS.event_id=EVENTS.event_id
    ;
  `);

    // Get all user registrations

    const eventRegistrations = await Database.runQuery(`
    SELECT * 
    FROM REGISTRATIONS
    WHERE user_id = '${userId}'
    ;
  `);

    const userSlots = [];

    // Get all events
    const focus = await Database.runQuery(`
      SELECT * 
      FROM FOCUS;
    `);

    eventRegistrations.forEach((registration) => {
      const userSlot = allEventSlots.find(
        (slot) => slot.event_slot_id === registration.event_slot_id
      );
      userSlots.push({
        ...userSlot,
        ...registration,
        focus: focus.find((f) => f.focus_id === registration.focus_id)
          .focus_name,
      });
    });

    res.status(200).send(prepareResponse({ registeredEvents: userSlots }));
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

module.exports = getRegisteredEvents;
