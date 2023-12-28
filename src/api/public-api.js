// Process imports
const { Router } = require("express");
const exchangeToken = require('../public-endpoint-methods/exchange-token');
const createUser = require('../public-endpoint-methods/create-user');
const getReistrationsDetails = require('../public-endpoint-methods/get-registration-details');
const checkAdminAccess = require('../public-endpoint-methods/check-admin-access');

// Create an instance of express router
const PublicApi = Router();

PublicApi.route("/exchange-token").post(exchangeToken);
PublicApi.route("/create-user").post(createUser);
PublicApi.route("/get-all-registrations").get(getReistrationsDetails);
PublicApi.route("/check-admin-access").post(checkAdminAccess);

module.exports = PublicApi;
