const Database = require("../db-helper");
const JWTHelper = require("../jwt-helper");
const { validateRequest } = require("../request-validator");
const { prepareResponse } = require("../response-formatter");
const { validateAuthentication } = require("../auth-validator");
const { groupSponsors, groupSpeakers } = require("../utlis");

const _mergeRegistrationsWithUsers = ({ users, registrations }) => {
  const idMappedUsers = {};
  for (let user of users) {
    idMappedUsers[user.user_id] = {
      user,
      registrations: [],
    };
  }
  for (let registration of registrations) {
    if (idMappedUsers[registration.user_id]) {
      idMappedUsers[registration.user_id].registrations.push(registration);
    }
  }
  return Object.values(idMappedUsers);
};

const getUnregisteredUsers = async (req, res, next) => {
  try {
    validateAuthentication(req.auth);
    // Get all events
    let allUsers = await Database.runQuery(`
    SELECT * 
    FROM USERS;
    `);
    let allRegistrations = await Database.runQuery(`
    SELECT * 
    FROM REGISTRATIONS;
    `);
    const mergedValues = _mergeRegistrationsWithUsers({
      users: allUsers,
      registrations: allRegistrations,
    });
    res.status(200).send(prepareResponse({ allUsers: mergedValues }));
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

module.exports = getUnregisteredUsers;
