const moment = require("moment");
const Database = require("../db-helper");
const JWTHelper = require("../jwt-helper");
const { validateRequest } = require("../request-validator");
const { prepareResponse } = require("../response-formatter");
const converter = require('json-2-csv');


const convert24To12 = (time24) => {
  var ts = time24;
  var H = +ts.substr(0, 2);
  var h = H % 12 || 12;
  h = h < 10 ? "0" + h : h; // leading 0 at the left for 1 digit hours
  var ampm = H < 12 ? " AM" : " PM";
  ts = h + ts.substr(2, 3) + ampm;
  return ts;
};

const getReistrationsDetails = async (req, res, next) => {
  try {
    let registrations = [];

    // Get all events and slots
    const allEventSlots = await Database.runQuery(`
    SELECT * 
    FROM EVENTS
    INNER JOIN EVENTS_SLOTS ON EVENTS_SLOTS.event_id=EVENTS.event_id
    ;
  `);

    // Get all user registrations

    let eventRegistrations = await Database.runQuery(`
    SELECT * 
    FROM REGISTRATIONS
    ;
  `);

    const userSlots = [];

    // Get all events
    const focus = await Database.runQuery(`
      SELECT * 
      FROM FOCUS;
    `);

    // Get all users
    const users = await Database.runQuery(`
      SELECT * 
      FROM USERS;
    `);

    eventRegistrations.forEach((registration) => {
      const userSlot = allEventSlots.find(
        (slot) => slot.event_slot_id === registration.event_slot_id
      );
      userSlots.push({
        ...userSlot,
        ...registration,
        focus: focus.find((f) => f.focus_id === registration.focus_id)
          .focus_name,
      });
    });

    eventRegistrations.forEach((reg) => {
      // Attach users
      reg.user = users.find((u) => u.user_id === reg.user_id);
      // Attach event details
      reg.event = allEventSlots.find(
        (es) => es.event_slot_id === reg.event_slot_id
      );
    });

    // Format
    eventRegistrations = eventRegistrations.map((reg) => {
      return {
        "User Id": `${reg.registration_id}`,
        "User Name": `${reg.user? reg.user.first_name: ''} ${reg.user? reg.user.last_name: ''}`,
        "User Email": `${reg.user? reg.user.email: ''}`,
        "User Phone": `${reg.user? reg.user.phone: ''}`,
        "User Company Name": `${reg.user? reg.user.company_name: ''}`,
        "User State": `${reg.user? reg.user.state: ''}`,
        "User Zip": `${reg.user? reg.user.zip: ''}`,
        "User Country": `${reg.user? reg.user.country: ''}`,
        "Reg Id": `${reg.registration_id}`,
        "Event Name": reg.event? reg.event.event_name: '',
        "Event Date": reg.event? `${reg.event.start_date} - ${reg.event.end_date}`: '',
        "Join URL": `${reg.joinURL}`,
        "Hours": `${reg.completedHours}`,
        "Notes": `${reg.notes}`,
        "Should Print Notes": `${reg.should_print_notes}`,
        "Certificate": `${reg.cert_link}`,
        "Event Hours": reg.event? `${reg.event.start_date} - ${reg.event.end_date}`: reg.event,
        "Event Time": reg.event ? `${convert24To12(
          reg.event.start_time
        )} EST - ${convert24To12(reg.event.end_time)} EST`: '',
        "Registration Date": `${moment(parseInt(reg.registered_at)).format(
          "MM-DD-YYYY"
        )}`,
        registrationId: reg.registration_id,
        eventId: reg.event_id,
        eventSlotId: reg.event_slot_id,
        focusId: reg.focus_id,
        userId: reg.user_id,
      };
    });

    res.status(200).send(prepareResponse({ eventRegistrations }));

    // Send back the new custom JWT
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

module.exports = getReistrationsDetails;
