// Process imports
const { Router } = require("express");
const getNotes = require("../public-endpoint-methods/getNotes");

// Create an instance of express router
const api = Router();

// Group and handle routes with various methods
api.route('/public')
	.get(getNotes)
	// .post(addNote);

module.exports = api;
