const Database = require("../../db-helper");
const { prepareResponse } = require("../../response-formatter");
const { validateRequest } = require("../../request-validator");
const { validateAuthentication } = require("../../auth-validator");
const cuid = require("cuid");


const cloneSpeaker = async (req, res, next) => {
  try {
    validateAuthentication(req.auth);
    validateRequest(["speaker_id", "clone_to_event_id", "set_day"], req.body);
    const {
        speaker_id,
        clone_to_event_id,
        set_day = "1"
    } = req.body;

    // Try to get speaker from database
    const speakerRecords = await Database.runQuery(`
      SELECT * FROM EVENT_SPEAKERS  
      WHERE (id = '${speaker_id}')
    `);

    if (!(speakerRecords && speakerRecords.length)) {
      // Record doesn't exist
      throw {
        status: 403,
        message: "Speaker not found",
      };
    }
    const speakerDetailsToClone = speakerRecords[0];
    if (speakerDetailsToClone.event_id === clone_to_event_id && speakerDetailsToClone.day === set_day) {
        throw {
            status: 403,
            message: "Cannot clone to same event",
          };
    }
    // Create new speaker in database
    const newSpeaker = {
        ...speakerRecords[0],
        event_id: clone_to_event_id,
        day: set_day
    }
    const speakerId = cuid();
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
        last_updated_on)
    VALUES ('${speakerId}',
        '${newSpeaker.event_id}',
        '${newSpeaker.logo}',
        '${newSpeaker.name}',
        '${newSpeaker.event_name}',
        '${newSpeaker.event_details}',
        '${newSpeaker.presenter_name}',
        '${newSpeaker.presenter_details}',
        '${newSpeaker.contact_email}',
        '${newSpeaker.contact_website}',
        '${+new Date()}',
        '${newSpeaker.day}',
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

module.exports = cloneSpeaker;
