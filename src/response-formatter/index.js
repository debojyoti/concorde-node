const { replaceAll } = require("../utlis");

const prepareResponse = (data, error=null) => {
  const preparedResponse = {data};
  if (error) {
    preparedResponse['error'] = true;
    preparedResponse['errorMessage'] = replaceAll(JSON.stringify(error.errorMessage), `"`, ``);
  } else {
    preparedResponse['error'] = false;
  }
  return preparedResponse;
}

module.exports = {prepareResponse};