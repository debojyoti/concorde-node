const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const replaceAll = (str, term, replacement) => {
  return str.replace(new RegExp(escapeRegExp(term), "g"), replacement);
};

const groupSponsors = ({ events, allSponsors }) => {
  // const groupedEvents = {};
  const eventIdMappedSponsors = {};

  allSponsors.forEach((sponsor) => {
    if (!eventIdMappedSponsors[sponsor.event_id]) {
      eventIdMappedSponsors[sponsor.event_id] = [];
    }
    eventIdMappedSponsors[sponsor.event_id].push(sponsor);
  });
  events.forEach((event) => {
    event.sponsors = [];
    if (eventIdMappedSponsors[event.event_id]) {
      event.sponsors = eventIdMappedSponsors[event.event_id];
    }
  });
  return events;
};

const groupSpeakers = ({ events, allSpeakers }) => {
  // const groupedEvents = {};
  const eventIdMappedSpeakers = {};

  allSpeakers.forEach((speaker) => {
    if (!eventIdMappedSpeakers[speaker.event_id]) {
      eventIdMappedSpeakers[speaker.event_id] = [];
    }
    eventIdMappedSpeakers[speaker.event_id].push(speaker);
  });
  events.forEach((event) => {
    event.speakers = [];
    if (eventIdMappedSpeakers[event.event_id]) {
      event.speakers = eventIdMappedSpeakers[event.event_id];
    }
  });
  return events;
};

module.exports = { replaceAll, groupSponsors, groupSpeakers };
