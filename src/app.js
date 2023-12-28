(async () => {
  // High priority
  // Require and configure dotenv at the very begining
  // To make env varaibles available in all modules
  const dotenv = require("dotenv");
  dotenv.config();

  // All other imports
  const Database = require("./db-helper");
  const express = require("express");
  const publicApi = require("./api/public-api");
  const privateApi = require("./api/private-api");
  const cors = require("cors");
  var jwt = require("express-jwt");

  // Initiate express middleware
  const app = express();

  // Add express json parser as middleware
  app.use(express.json());

  // Add cors as a middleware
  app.use(cors());

  await Database.connect({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  // Initiate api modules
  // To handle all public endpoints
  app.use("/public", publicApi);
  // To handle all private endpoints
  app.use(
    "/private",
    jwt({
      secret: process.env.JWT_SECRET,
      credentialsRequired: false,
      requestProperty: "auth",
      getToken: function fromHeaderOrQuerystring(req) {
        if (
          req.headers.authorization &&
          req.headers.authorization.split(" ")[0] === "Bearer"
        ) {
          return req.headers.authorization.split(" ")[1];
        } else {
          return null;
        }
      },
    }),
    privateApi
  );

  const port = process.env.APP_PORT;
  app.listen(port, () => console.log(`Node Server running on port ${port}`));
})();
