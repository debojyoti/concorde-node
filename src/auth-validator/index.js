const validateAuthentication = (auth) => {
  if (auth && Object.keys(auth).length) {
    return true;
  } else {
    throw {
      status: 401,
      message: "Authorization failed"
    };
  }
};

module.exports = { validateAuthentication };
