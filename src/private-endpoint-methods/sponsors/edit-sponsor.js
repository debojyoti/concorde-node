const Database = require("../../db-helper");
const { prepareResponse } = require("../../response-formatter");
const { validateRequest } = require("../../request-validator");
const { validateAuthentication } = require("../../auth-validator");

const editSponsor = async (req, res, next) => {
  try {
    validateAuthentication(req.auth);
    validateRequest(["id", "event_id", "name"], req.body);
    const {
      id,
      logo = "",
      name = "",
      description = "",
      contact_email = "",
      contact_website = "",
    } = req.body;

    // Try to get user from database
    const sponsorRecords = await Database.runQuery(`
      SELECT * FROM EVENT_SPONSORS  
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
      UPDATE EVENT_SPONSORS
      SET 
        logo = '${logo}',
        name = '${name}',
        description = '${description}',
        contact_email = '${contact_email}',
        contact_website = '${contact_website}',
        last_updated_on = '${+new Date()}'
      WHERE (id = '${id}');
    `);

    // Get updated record from database
    const updatedRecords = await Database.runQuery(`
        SELECT * FROM EVENT_SPONSORS
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

module.exports = editSponsor;
