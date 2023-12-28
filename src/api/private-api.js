// Process imports
const { Router } = require("express");
const getAllEvents = require("../private-endpoint-methods/get-all-events");
const getRegisteredEvents = require("../private-endpoint-methods/get-my-events");
const getAllFocus = require("../private-endpoint-methods/get-all-focus");
const eventRegistration = require("../private-endpoint-methods/event-registration");
const updateUser = require("../private-endpoint-methods/update-user");
const getUser = require("../private-endpoint-methods/get-user");
const cancelEventRegistration = require("../private-endpoint-methods/cancel-registration");
const deleteRegistration = require("../private-endpoint-methods/delete-registration");
const generateRegistrationCertificate = require("../private-endpoint-methods/generate-registration-certificate");
const updateNotes = require("../private-endpoint-methods/update-notes");
const addSponsor = require("../private-endpoint-methods/sponsors/add-sponsor");
const editSponsor = require("../private-endpoint-methods/sponsors/edit-sponsor");
const deleteSponsor = require("../private-endpoint-methods/sponsors/delete-sponsor");
const markAsFeaturedSponsor = require("../private-endpoint-methods/sponsors/mark-as-featured-sponsor");
const addSpeaker = require("../private-endpoint-methods/speakers/add-speaker");
const editSpeaker = require("../private-endpoint-methods/speakers/edit-speaker");
const deleteSpeaker = require("../private-endpoint-methods/speakers/delete-speaker");
const cloneSpeaker = require("../private-endpoint-methods/speakers/clone-speaker");
const updateTimeslot = require("../private-endpoint-methods/update-timeslot");
const getUnregisteredUsers = require("../private-endpoint-methods/get-unregistered-users");
const updateUserByAdmin = require("../private-endpoint-methods/update-user-by-admin");
// Create an instance of express router
const PrivateApi = Router();

// Private endpoints
PrivateApi.route("/get-all-events").get(getAllEvents);
PrivateApi.route("/get-registered-events").get(getRegisteredEvents);
PrivateApi.route("/get-all-focus").get(getAllFocus);
PrivateApi.route("/event-registration").post(eventRegistration);
PrivateApi.route("/cancel-event-registration").post(cancelEventRegistration);
PrivateApi.route("/delete-registration").post(deleteRegistration);
PrivateApi.route("/update-profile").post(updateUser);
PrivateApi.route("/get-profile").get(getUser);
PrivateApi.route("/generate-registration-certificate").post(
  generateRegistrationCertificate
);
PrivateApi.route("/update-notes").post(updateNotes);

PrivateApi.route("/add-sponsor").post(addSponsor);
PrivateApi.route("/edit-sponsor").post(editSponsor);
PrivateApi.route("/delete-sponsor").post(deleteSponsor);
PrivateApi.route("/mark-as-featured-sponsor").post(markAsFeaturedSponsor);

PrivateApi.route("/add-speaker").post(addSpeaker);
PrivateApi.route("/edit-speaker").post(editSpeaker);
PrivateApi.route("/delete-speaker").post(deleteSpeaker);
PrivateApi.route("/clone-speaker").post(cloneSpeaker);
PrivateApi.route("/update-timeslot").post(updateTimeslot);
PrivateApi.route("/get-all-users").get(getUnregisteredUsers);
PrivateApi.route("/update-user-by-admin").post(updateUserByAdmin);

module.exports = PrivateApi;
