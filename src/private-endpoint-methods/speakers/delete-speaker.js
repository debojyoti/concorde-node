const Database = require("../../db-helper");
const { validateRequest } = require("../../request-validator");
const { prepareResponse } = require("../../response-formatter");
const { validateAuthentication } = require("../../auth-validator");

const deleteSpeaker = async (req, res, next) => {
  try {
    validateAuthentication(req.auth);
    validateRequest(["id"], req.body);
    const { id } = req.body;
    // Extract user id from auth token
    // Delete
    await Database.runQuery(`
        DELETE FROM EVENT_SPEAKERS
        WHERE (id = '${id}')
      `);

    res
      .status(200)
      .send(
        prepareResponse({ message: "sponsor deleted successfully" })
      );
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

module.exports = deleteSpeaker;
