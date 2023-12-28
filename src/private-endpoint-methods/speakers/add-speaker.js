const Database = require("../../db-helper");
const { validateRequest } = require("../../request-validator");
const { prepareResponse } = require("../../response-formatter");
const cuid = require("cuid");

const addSpeaker = async (req, res, next) => {
  try {
    validateRequest(["event_id", "name"], req.body);
    const {
      event_id,
      logo = "",
      name = "",
      event_name = "",
      event_details = "",
      presenter_name = "",
      presenter_details = "",
      contact_email = "",
      contact_website = "",
      youtube_video_link = "",
      day = "1"
    } = req.body;

    const speakerId = cuid();

    // Record doesn't exist
    // So insert
    await Database.runQuery(`
    INSERT INTO EVENT_SPEAKERS (id,
        event_id,
        logo,
        name,
        event_name,
        event_details,
        presenter_name,
        presenter_details,
        contact_email,
        contact_website,
        created_on,
        day,
        youtube_video_link,
        last_updated_on)
    VALUES ('${speakerId}',
        '${event_id}',
        '${logo}',
        '${name}',
        '${event_name}',
        '${event_details}',
        '${presenter_name}',
        '${presenter_details}',
        '${contact_email}',
        '${contact_website}',
        '${+new Date()}',
        '${day}',
        '${youtube_video_link}',
        '${+new Date()}');
        `);
    const speakers = await Database.runQuery(`
  SELECT * FROM EVENT_SPEAKERS
  WHERE (id = '${speakerId}')
`);

    // Send back the new custom JWT
    res.status(200).send(prepareResponse({ newSpeaker: speakers[0] }));
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

module.exports = addSpeaker;
