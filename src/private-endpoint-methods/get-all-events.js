const Database = require("../db-helper");
const JWTHelper = require("../jwt-helper");
const { validateRequest } = require("../request-validator");
const { prepareResponse } = require("../response-formatter");
const { validateAuthentication } = require("../auth-validator");
const { groupSponsors, groupSpeakers } = require("../utlis");

const getAllEvents = async (req, res, next) => {
  try {
    validateAuthentication(req.auth);

    // Extract user id from auth token
    const userId = req.auth.user_id;

    // Get all events
    let events = await Database.runQuery(`
    SELECT * 
    FROM EVENTS
    INNER JOIN EVENTS_SLOTS ON EVENTS_SLOTS.event_id=EVENTS.event_id
    ;
  `);

    // Get all sponsors
    let allSponsors = await Database.runQuery(`
  SELECT * 
  FROM EVENT_SPONSORS
  ;
`);
    // Group sponsors
    events = groupSponsors({ events, allSponsors });
    // Get all speakers
    let allSpeakers = await Database.runQuery(`
        SELECT * 
        FROM EVENT_SPEAKERS
        ;
      `);
    // Group sponsors
    events = groupSpeakers({ events, allSpeakers });
    res.status(200).send(prepareResponse({ events }));
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

module.exports = getAllEvents;
