const axios = require("axios");
const Database = require("../db-helper");

class ZoomHelper {
  static async addToWebinar({ registrationId }) {
    const zoomAccessToken = await ZoomHelper._fetchAuthToken();
    console.log("registrationId :>> ", registrationId);
    console.log("zoomAccessToken :>> ", zoomAccessToken);
    if (zoomAccessToken && zoomAccessToken.length) {
      // Grab user info from registrationId
      const user = await ZoomHelper._getUserInfoFromRegistrationId(
        registrationId
      );
      if (user) {
        const { first_name, last_name, email, webinar_id } = user;
        if (
          first_name && first_name.length &&
          last_name && last_name.length &&
          email && email.length &&
          webinar_id && webinar_id.length
        ) {
          const config = {
            method: "post",
            url: `https://api.zoom.us/v2/webinars/${webinar_id}/registrants`,
            headers: {
              Authorization: `Bearer ${zoomAccessToken}`,
              "Content-Type": "application/json",
            },
            data: JSON.stringify({
              first_name: first_name,
              last_name: last_name,
              email: email,
            }),
          };
          try {
            const { data } = await axios(config);
            if (data && data.join_url && data.join_url.length) {
              await ZoomHelper._addJoinUrlToRegistration({
                joinUrl: data.join_url,
                registrantKey: data.registrant_id,
                registrationId: user.registration_id,
              });
            }
          } catch (error) {
            console.log("error :>> ", error);
          }
        }
      }
    }
  }

  static async removeFromWebinar({ userId, eventId }) {
    const zoomAccessToken = await ZoomHelper._fetchAuthToken();
    if (zoomAccessToken && zoomAccessToken.length) {
      // Grab user info from registrationId
      const user = await ZoomHelper._getRegistrationKey({
        userId,
        eventId,
      });
      if (user) {
        const { registrantKey, webinar_id, registration_id } = user;
        console.log('registration_id deleted :>> ', registration_id);
        if (registrantKey && registrantKey.length && webinar_id && webinar_id.length) {
          const config = {
            method: "delete",
            url: `https://api.zoom.us/v2/webinars/${webinar_id}/registrants/${registrantKey}`,
            headers: {
              Authorization: `Bearer ${zoomAccessToken}`,
              "Content-Type": "application/json",
            },
          };
          try {
            await axios(config);
            await ZoomHelper._removeJoinUrlToRegistration({
              registrationId: user.registration_id,
            });
          } catch (error) {
            console.log("error :>> ", error);
          }
        }
      }
    }
  }

  static async _fetchAuthToken() {
    let accessToken = "";
    try {
      var config = {
        method: "post",
        url: "https://zoom.us/oauth/token?grant_type=account_credentials&account_id=1_oVtK2JRBGK5SbLmQqI2A",
        headers: {
          Authorization:
            "Basic VUQ1bFlqZmpUbENMeW9kYVRaME1SUTozRHprTDRxZDRodHdVVUxjOFlpNFlCak9Ec01PRElicg==",
        },
      };
      const { data } = await axios(config);
      if (data && data.access_token && data.access_token.length) {
        accessToken = data.access_token;
      }
    } catch (error) {
      console.log("error while generating zoom token :>> ", error);
    }
    return accessToken;
  }

  static async _getUserInfoFromRegistrationId(registrationId) {
    let user = null;
    try {
      const registrations = await Database.runQuery(`
    SELECT
    *
FROM
    REGISTRATIONS
INNER JOIN USERS ON USERS.user_id = REGISTRATIONS.user_id
INNER JOIN EVENTS_SLOTS ON EVENTS_SLOTS.event_slot_id = REGISTRATIONS.event_slot_id
WHERE
    REGISTRATIONS.registration_id = '${registrationId}'
  `);
      if (registrations && registrations.length) {
        user = registrations[0];
      }
    } catch (error) {
      console.log("error :>> ", error);
    }
    return user;
  }

  static async _getRegistrationKey({ userId, eventId }) {
    let user = null;
    try {
      const registrations = await Database.runQuery(`
    SELECT
    *
FROM
    REGISTRATIONS
INNER JOIN USERS ON USERS.user_id = REGISTRATIONS.user_id
INNER JOIN EVENTS_SLOTS ON EVENTS_SLOTS.event_slot_id = REGISTRATIONS.event_slot_id
WHERE (REGISTRATIONS.user_id = '${userId}') AND (REGISTRATIONS.event_id = '${eventId}')
  `);
      if (registrations && registrations.length) {
        user = registrations[0];
      }
    } catch (error) {
      console.log("error :>> ", error);
    }
    return user;
  }

  static async _addJoinUrlToRegistration({
    joinUrl,
    registrantKey,
    registrationId,
  }) {
    try {
      await Database.runQuery(`
      UPDATE REGISTRATIONS
      SET joinURL = '${joinUrl}', registrantKey = '${registrantKey}'
      WHERE (registration_id = '${registrationId}');
    `);
    } catch (error) {
      console.log("error :>> ", error);
    }
  }

  static async _removeJoinUrlToRegistration({ registrationId }) {
    try {
      await Database.runQuery(`
      UPDATE REGISTRATIONS
      SET joinURL = '', registrantKey = ''
      WHERE (registration_id = '${registrationId}');
    `);
    } catch (error) {
      console.log("error :>> ", error);
    }
  }
}

module.exports = ZoomHelper;
