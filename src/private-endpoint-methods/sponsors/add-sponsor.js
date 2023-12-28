const Database = require("../../db-helper");
const { validateRequest } = require("../../request-validator");
const { prepareResponse } = require("../../response-formatter");
const cuid = require("cuid");

const addSponsor = async (req, res, next) => {
  try {
    validateRequest(["event_id", "name"], req.body);
    const {
      event_id,
      logo = "",
      name = "",
      description = "",
      contact_email = "",
      contact_website = "",
    } = req.body;

    const sponsorId = cuid();

    // Record doesn't exist
    // So insert
    await Database.runQuery(`
    INSERT INTO EVENT_SPONSORS (id,
        event_id,
        logo,
        name,
        description,
        contact_email,
        contact_website,
        created_on,
        last_updated_on)
    VALUES ('${sponsorId}',
        '${event_id}',
        '${logo}',
        '${name}',
        '${description}',
        '${contact_email}',
        '${contact_website}',
        '${+new Date()}',
        '${+new Date()}');
        `);
    const sponsors = await Database.runQuery(`
  SELECT * FROM EVENT_SPONSORS
  WHERE (id = '${sponsorId}')
`);

    // Send back the new custom JWT
    res.status(200).send(prepareResponse({ newSponsor: sponsors[0] }));
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

module.exports = addSponsor;
