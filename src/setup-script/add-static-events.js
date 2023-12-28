const cuid = require("cuid");
const Database = require("../db-helper");

const events = [
  {
    event_name: "Concorde Piston IA Renewal",
    event_id: cuid(),
    speakers: null,
    description: null,
    focus_id: "5adbdeef2e506436356338c5512bd477",
    event_slots: [
      {
        event_slot_id: cuid(),
        start_date: "13/1/2022",
        end_date: "14/1/2022",
        start_time: "08:00",
        end_time: "12:00",
      },
      {
        event_slot_id: cuid(),
        start_date: "13/1/2022",
        end_date: "14/1/2022",
        start_time: "17:00",
        end_time: "21:00",
      },
    ],
  },
  {
    event_name: "Concorde Turbine IA Renewal",
    event_id: cuid(),
    speakers: null,
    description: null,
    focus_id: "d41d8cd98f00b204e9800998ecf8427e",
    event_slots: [
      {
        event_slot_id: cuid(),
        start_date: "20/1/2022",
        end_date: "21/1/2022",
        start_time: "08:00",
        end_time: "12:00",
      },
      {
        event_slot_id: cuid(),
        start_date: "20/1/2022",
        end_date: "21/1/2022",
        start_time: "17:00",
        end_time: "21:00",
      },
    ],
  },
  {
    event_name: "Concorde Rotorcraft IA Renewal",
    event_id: cuid(),
    speakers: null,
    description: null,
    focus_id: "14cd8fc76bbf5e51a31cf1b854c29dc8",
    event_slots: [
      {
        event_slot_id: cuid(),
        start_date: "27/1/2022",
        end_date: "28/1/2022",
        start_time: "08:00",
        end_time: "12:00",
      },
      {
        event_slot_id: cuid(),
        start_date: "27/1/2022",
        end_date: "28/1/2022",
        start_time: "17:00",
        end_time: "21:00",
      },
    ],
  },
];

(async () => {
  const dotenv = require("dotenv");
  dotenv.config();

  await Database.connect({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  for (let event of events) {
    // Add the event
    await Database.runQuery(`
    INSERT INTO EVENTS (event_name,
      event_id)
    VALUES ('${event.event_name}',
      '${event.event_id}');
  `);
    // Add the event slots
    for (let event_slot of event.event_slots) {
      await Database.runQuery(`
    INSERT INTO EVENTS_SLOTS (
      event_slot_id,
      event_id,
        start_date,
        end_date,
        start_time,
        end_time,
        focus_id
    )
    VALUES (
      '${event_slot.event_slot_id}',
      '${event.event_id}',
        '${event_slot.start_date}',
        '${event_slot.end_date}',
        '${event_slot.start_time}',
        '${event_slot.end_time}',
        '${event.focus_id}'
    );
  `);
    }
  }
})();
