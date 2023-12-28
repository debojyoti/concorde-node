const Database = require("../../db-helper");
const { prepareResponse } = require("../../response-formatter");
const { validateRequest } = require("../../request-validator");
const { validateAuthentication } = require("../../auth-validator");

const markAsFeaturedSponsor = async (req, res, next) => {
  try {
    validateAuthentication(req.auth);
    validateRequest(["event_id"], req.body);
    const {
        sponsor_id,
        event_id = ""
    } = req.body;

    // Try to get sponsor from database
    const sponsorRecords = await Database.runQuery(`
      SELECT * FROM EVENT_SPONSORS  
      WHERE (id = '${sponsor_id}')
    `);
    let formattedSponsorId = sponsor_id;
    if (!(sponsorRecords && sponsorRecords.length)) {
      // Record doesn't exist
    //   throw {
    //     status: 403,
    //     message: "Sponsor not found",
    //   };
    formattedSponsorId = '';
    }
    // Try to get event from database
    const eventRecords = await Database.runQuery(`
      SELECT * FROM EVENTS  
      WHERE (event_id = '${event_id}')
    `);

    if (!(eventRecords && eventRecords.length)) {
      // Record doesn't exist
      throw {
        status: 403,
        message: "Event not found",
      };
    }
    await Database.runQuery(`
      UPDATE EVENTS
      SET 
      featured_sponsor_id = '${formattedSponsorId}'
      WHERE (event_id = '${event_id}');
    `);

    console.log('1');
    
    // Get updated record from database
    const updatedRecords = await Database.runQuery(`
    SELECT * FROM EVENTS
    WHERE (event_id = '${event_id}')
    `);
    
    console.log('2');
    res
      .status(200)
      .send(prepareResponse({ updatedEvent: updatedRecords[0] }));
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

module.exports = markAsFeaturedSponsor;
