var mysql = require("mysql");

const deafultDbConfig = {
  host: "localhost",
  user: "deb",
  password: "deb",
  database: "concorde_events_management",
};

let dbConnection = null;

class Database {
  static connect(connectionConfig = deafultDbConfig) {
    return new Promise((resolve, reject) => {
      dbConnection = mysql.createConnection(connectionConfig);
      dbConnection.connect(function (err) {
        if (err) throw err;
        // Connected!
        resolve();
      });
    });
  }

  static runQuery(query) {
    return new Promise((resolve, reject) => {
      dbConnection.query(query, (err, rows) => {
        if (err) {
          console.log('err :>> ', err);
          reject({
            status: 403,
            message: JSON.stringify(err)
          });
        }
        resolve(rows);
      });
    });
  }
}

module.exports = Database;
