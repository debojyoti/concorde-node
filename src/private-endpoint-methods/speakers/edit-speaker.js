const Database = require("../../db-helper");
const { prepareResponse } = require("../../response-formatter");
const { validateRequest } = require("../../request-validator");
const { validateAuthentication } = require("../../auth-validator");

const editSpeaker = async (req, res, next) => {
  try {
    validateAuthentication(req.auth);
    validateRequest(["id", "event_id", "name"], req.body);
    const {
      id,
      logo = "",
      name = "",
      event_name = "",
      event_details = "",
      presenter_name = "",
      presenter_details = "",
      contact_email = "",
      contact_website = "",
      youtube_video_link = "",
      day = ""
    } = req.body;

    // Try to get user from database
    const sponsorRecords = await Database.runQuery(`
      SELECT * FROM EVENT_SPEAKERS  
      WHERE (id = '${id}')
    `);

    if (!(sponsorRecords && sponsorRecords.length)) {
      // Record doesn't exist
      throw {
        status: 403,
        message: "Sponsor not found",
      };
    }
    // first_name = '${firstName}', last_name = '${lastName}', state = '${state}', zip = '${zip}', phone = '${phone}', company_name = '${companyName}', country = '${country}'
    // Update
    await Database.runQuery(`
      UPDATE EVENT_SPEAKERS
      SET 
        logo = '${logo}',
        name = '${name}',
        event_name = '${event_name}',
        event_details = '${event_details}',
        presenter_name = '${presenter_name}',
        presenter_details = '${presenter_details}',
        contact_email = '${contact_email}',
        contact_website = '${contact_website}',
        youtube_video_link = '${youtube_video_link}',
        day = '${day}',
        last_updated_on = '${+new Date()}'
      WHERE (id = '${id}');
    `);

    // Get updated record from database
    const updatedRecords = await Database.runQuery(`
        SELECT * FROM EVENT_SPEAKERS
        WHERE (id = '${id}')
      `);

    res
      .status(200)
      .send(prepareResponse({ updatedSponsor: updatedRecords[0] }));
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

module.exports = editSpeaker;
