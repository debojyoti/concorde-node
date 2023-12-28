var axios = require("axios");
var qs = require("qs");
var fs = require("fs");
var WEBINARS = require("./webinar-mappings.json");
var pistonZoom = require("./piston-first.json");
const dotenv = require("dotenv");
dotenv.config();
// let SLOT_ID = 'cksqzrx180007ybzpa6pv7h0w'; // 1
// let SESSION_ID = '1842823690171499275'; // 1
let SLOT_ID = WEBINARS.ROTORCRAFT_MORNING.slotId; // 2
let SESSION_ID = WEBINARS.ROTORCRAFT_MORNING.webinar_id; // 2
let AUTH_TOKEN =
  "eyJhbGciOiJIUzUxMiIsInYiOiIyLjAiLCJraWQiOiI0N2NmY2UxMy0xNzVjLTQzMDYtYTg0Ny1mZjk0Y2MwNmFiNzAifQ.eyJ2ZXIiOjgsImF1aWQiOiI0MjYzZDRkY2Y4NGE2YzFiOWVhZDc4OTY1YTBiOTY3MSIsImNvZGUiOiI1dS1TVThUVlRxeXljRGdSeVJleGZRbDg1M2k3UG9wWUsiLCJpc3MiOiJ6bTpjaWQ6VUQ1bFlqZmpUbENMeW9kYVRaME1SUSIsImdubyI6MCwidHlwZSI6MywiYXVkIjoiaHR0cHM6Ly9vYXV0aC56b29tLnVzIiwidWlkIjoiTVRsQWZHcVZRdU9VTGRLcWxZS2ZsdyIsIm5iZiI6MTY3NDcwNzQ4NiwiZXhwIjoxNjc0NzExMDg2LCJpYXQiOjE2NzQ3MDc0ODYsImFpZCI6IjFfb1Z0SzJKUkJHSzVTYkxtUXFJMkEiLCJqdGkiOiI1MzEwOTQyNi1hNTI4LTRhOGItOWY3Zi00NWMyMGZkZjAzNDkifQ.SI_YljCvJrUePBo23YeIV3CbwGrzymaxL70H8wnzTrgSxLIjQ0fD6dKRI2kdlYPE8HtFErEqJexXQ3E2UaYxLQ";
const Database = require("../db-helper");
/*  Function declarations starts here */
async function readUsers() {
  // const users = [];
  // let startWith = 10000;
  // for (let i = 0; i < 2; i++) {
  //   users.push({
  //     firstName: `John${startWith}`,
  //     lastName: `Doe${startWith}`,
  //     email: `john_doe@yahoo${startWith}.com`,
  //   });
  //   startWith++;
  // }
  // return users;
  let users = await Database.runQuery(`
  SELECT USERS.user_id, USERS.first_name, USERS.last_name, USERS.email, REGISTRATIONS.registration_id, REGISTRATIONS.event_slot_id, REGISTRATIONS.joinURL FROM REGISTRATIONS, USERS WHERE event_slot_id = '${SLOT_ID}' AND USERS.user_id = REGISTRATIONS.user_id ORDER BY REGISTRATIONS.registered_at DESC
`);
users = users.map(user => {
  let formattedUser = user;
  if (user.email && user.email.length) {
    const emailParts = user.email.split('@');
    if (!(user.first_name && user.first_name.length)) {
      formattedUser.first_name = emailParts[0]; 
    }
    if (!(user.last_name && user.last_name.length)) {
      formattedUser.last_name = emailParts[0]; 
    }
  }
  return formattedUser;
})
  return users.filter(
    (user) => (user.first_name && user.first_name.length) && (user.last_name && user.last_name.length) && !(user.joinURL && user.joinURL !== 'undefined' && user.joinURL.length) 
  );
}

function writeUsers(users) {
  fs.writeFileSync("./file.json", JSON.stringify(users));
}

async function fetchAuthToken() {
  try {
    var data = {
      grant_type: "authorization_code",
      code: ACCESS_TOKEN,
      redirect_uri: "https://portal.concordebattery.com/login",
    };
    const response = await axios.post(
      "https://api.getgo.com/oauth/v2/token",
      data,
      {
        Authorization:
          "Basic NmMyNTJjZDItNDVjNC00ZDJlLWE0YjUtNmEyMGVhNjE3YjdkOmFsejhCRHU0cVg3SXN2a0loa0trdVhGUw==",
        "Content-Type": "application/x-www-form-urlencoded",
      }
    );
    console.log("response.data :>> ", response.data);
    return response.data;
  } catch (error) {
    console.log("error :>> ", error);
  }
}

async function registerUser(user) {
  try {
    const response = await axios.post(
      `https://api.zoom.us/v2/webinars/${SESSION_ID}/registrants`,
      {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      },
      {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      }
    );
    const formattedUser = {
      ...user,
      ...response.data,
    };
    // console.log('formattedUser :>> ', formattedUser);
    return formattedUser;
  } catch (error) {
    console.log("error user :>> ", user);
    if (error && error.response && error.response.data) {
      console.log('error.response.status :>> ', error.response.status);
      console.log('error.response.data :>> ', error.response.data);
    }
    // console.log("error.data :>> ", error.data);
    // console.log("error.config :>> ", error.config);
    // if (error.response.status === 409) {
    //   const formattedUser = {
    //     ...user,
    //     ...error.response.data
    //   };
    //   console.log('formattedUser error :>> ', formattedUser);
    //   return formattedUser;
    // }
    return user;
  }
}

async function registerUsers(users) {
  const totalUsers = users.length;
  let finalUsers = [];
  let batchCount = 20;
  console.log("totalUsers :>> ", totalUsers);
  for (let i = 0; i < totalUsers; i = i + batchCount) {
    if (i > 0) {
      await sleepTime(3000);
    }
    let lastIndex = i + batchCount;
    if (lastIndex > totalUsers) {
      lastIndex = totalUsers;
    }
    console.log("i :>> ", i);
    console.log("lastIndex :>> ", lastIndex);
    const batchUsers = users.slice(i, lastIndex);
    console.log(
      "batchUsers :>> ",
      batchUsers.map((u) => ({ f: u.first_name }))
    );
    try {
      const apiCalls = batchUsers.map((user) => registerUser(user));
      const responses = await Promise.allSettled(apiCalls);
      responses.forEach((response, responseIndex) => {
        batchUsers[responseIndex] = {
          ...batchUsers[responseIndex],
          response
        }
      })
      // Write in to db
      if (responses && responses.length) {
        console.log("responses.length :>> ", responses.length);
        const zoomUsers = responses.map((response) => response.value);
        finalUsers = [...finalUsers, ...zoomUsers];
        console.log('zoomUsers :>> ', zoomUsers);
        await updateUsers(zoomUsers);
        // writeUsers(finalUsers);
      }
    } catch (error) {
      console.log("error :>> ", error);
    }
  }
}

const sleepTime = (n) => new Promise((r) => setTimeout(() => r(), n));

async function updateUsers(users) {
  try {
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      // console.log('user :>> ', user);
      await Database.runQuery(`
      UPDATE REGISTRATIONS
      SET joinURL = '${user.join_url}', registrantKey = '${user.registrant_id}'
      WHERE (registration_id = '${user.registration_id}');
    `);
    }
  } catch (error) {
    console.log("error :>> ", error);
  }
}

async function syncZoomInfo({ inputUsers, pistonZoom }) {
  for (let i = 0; i < pistonZoom.length; i++) {
    const zoomInfo = pistonZoom[i];
    const registration = inputUsers.find(
      (user) => user.email === zoomInfo.email
    );
    if (registration) {
      await Database.runQuery(`
        UPDATE REGISTRATIONS
        SET joinURL = '${zoomInfo.join_url}', registrantKey = '${zoomInfo.id}'
        WHERE (registration_id = '${registration.registration_id}');
      `);
      console.log("Updated: ", i);
    }
  }
}

function figureOutNonZoomPiston({ inputUsers, pistonZoom }) {
  const emailMappedZoomUsers = {};
  pistonZoom.forEach((zoomUser) => {
    emailMappedZoomUsers[zoomUser.email] = zoomUser;
  });
  const unregisteredUsers = [];
  inputUsers.forEach((user) => {
    if (!emailMappedZoomUsers[user.email]) {
      unregisteredUsers.push(user);
    }
  });
  return unregisteredUsers.filter(
    (user) => (user.first_name && user.first_name.length) && (user.last_name && user.last_name.length)
  );
}

/*  Function declarations ends here */

// Main function (Execution begins)
(async () => {
  await Database.connect({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  const inputUsers = await readUsers();
  console.log("inputUsers.length :>> ", inputUsers.length);
  // console.log('pistonZoom.length :>> ', pistonZoom.length);
  // // const authToken = await fetchAuthToken();
  // await syncZoomInfo({
  //     inputUsers,
  //     pistonZoom
  //   })
  // const unregisteredUsers = figureOutNonZoomPiston({
  //   inputUsers,
  //   pistonZoom
  // })
  // console.log('unregisteredUsers.length :>> ', unregisteredUsers.length);
  // writeUsers(unregisteredUsers);
  await registerUsers(inputUsers);
  // // writeUsers(inputUsers);
  // fs.writeFileSync("non-zoom-piston.json", JSON.stringify(unregisteredUsers));
})();
