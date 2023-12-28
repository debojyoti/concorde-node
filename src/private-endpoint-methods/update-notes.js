const PDFDocument = require("pdfkit");
const fs = require("fs");

const Database = require("../db-helper");
const { prepareResponse } = require("../response-formatter");
const { validateRequest } = require("../request-validator");
const { validateAuthentication } = require("../auth-validator");

const AWS = require("aws-sdk");
const { default: axios } = require("axios");
const certTemplates = require("../email_templates/cert_ready");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const sleepTime = (n) => new Promise((r) => setTimeout(() => r(), n));

const _uploadToS3 = (fileName, tempFilePath) => {
  return new Promise(async (resolve, reject) => {
    // Additonal time delay to wait for file to load
    await sleepTime(1000);
    const fileContent = fs.readFileSync(`./${tempFilePath}`);
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${fileName}.pdf`,
      Body: fileContent,
      ACL: "public-read",
    };
    s3.upload(params, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data.Location);
    });
  });
};

const _determineAction = (registration, newHours) => {
  let action = "NO_ACTION";
  if (registration.joinURL && registration.joinURL.length) {
    // console.log('parseInt(registration.completedHours) :>> ', parseInt(registration.completedHours));
    if (registration.completedHours > 0) {
      const previousHours = parseInt(registration.completedHours);
      // Has hours assigned previously
      if (newHours == 0) {
        // Need to clear registration
        action = "CLEAR_REGISTRATION";
      } else if (newHours > 0 && parseInt(newHours) !== previousHours) {
        // Need to regenerate certificate
        action = "REGENARATE_CERTIFICATE";
      } else if (newHours > 0 && parseInt(newHours) === previousHours) {
        // Need to regenerate certificate
        action = "NO_ACTION";
      }
    } else {
      if (newHours == 0) {
        // Need to clear registration
        action = "NO_ACTION";
      } else if (newHours > 0) {
        // Need to regenerate certificate
        action = "REGENARATE_CERTIFICATE";
      }
    }
  }
  return action;
};

const _removeFile = (link) => {
  return new Promise((resolve, reject) => {
    fs.unlink(link, (err) => {
      if (err) console.log(err);
      else {
      }
      resolve();
    });
  });
};

const _getEventDate = (registration) => {
  if (registration.event_id === "cksqzrx170000ybzp1r55fzty") {
    // Piston
    return "January 13-14, 2022";
  } else if (registration.event_id === "cksqzrx180003ybzp1ilf98lb") {
    // Turbine
    return "January 20-21, 2022";
  } else if (registration.event_id === "cksqzrx180006ybzp4lzf82wd") {
    // Rotorcraft
    return "January 27-28, 2022";
  }
};

const _generateCertificate = async (registration, notes, shouldPrintNotes) => {
  let tempLink = null;
  let s3Link = null;

  const doc = new PDFDocument({
    layout: "landscape",
    size: "A4",
    margins: {
      bottom: 0,
      left: 0,
      right: 0,
    },
  });

  tempLink = `temp-certs/${registration.registration_id}.pdf`;
  doc.image("2022_IA_Renewal_Cert_Piston_Jan13-14_V3.png", 0, 0, {
    width: doc.page.width,
    height: doc.page.height,
  });
  // doc.text("Debojyoti Saha", 250, 330);
  doc
    .fontSize(18)
    .text(`${registration.first_name} ${registration.last_name}`, 0, 326, {
      align: "center",
    });
  doc.fontSize(11).text(registration.completedHours, 355, 361);
  const date = _getEventDate(registration);
  doc.fontSize(13).text(date, 414, 428);
  if (notes.length && shouldPrintNotes) {
    doc.fontSize(11).text(notes, 15, 450, {
      align: "center",
    });
  }
  doc.fontSize(9).text(date, 280, 538);
  doc.pipe(fs.createWriteStream(tempLink));
  doc.end();

  if (tempLink && tempLink.length) {
    s3Link = await _uploadToS3(registration.registration_id, tempLink);
    await _removeFile(tempLink);
  }
  return s3Link;
};

const _emailUser = async (registration) => {
  try {
    let emailContent = `Hi ${registration.first_name} ${registration.last_name},
    Your 2022 IA Renewal Certificate is ready to download.
    To download your certificate, login to the Concorde Battery Portal
    https://portal.concordebattery.com
    Find your event under Registered Events and click on the button to download certificate.
    You can find a tutorial here https://www.youtube.com/watch?v=MPQ39qeL_o4
    If there are any questions, please contact Chris Holder at cholder@concordebattery.com or Noga Holck at nholck@concordebattery.com.
    We welcome all feedback and appreciate your thoughts and suggestions.
    Thank you for your participation in this event!`;

    if (registration.event_id === "cksqzrx170000ybzp1r55fzty") {
      // Piston
      emailContent = certTemplates.generatePistonTemplate(
        registration.first_name,
        registration.last_name
      );
    } else if (registration.event_id === "cksqzrx180003ybzp1ilf98lb") {
      // Turbine
      emailContent = certTemplates.generateTurbineTemplate(
        registration.first_name,
        registration.last_name
      );
    } else if (registration.event_id === "cksqzrx180006ybzp4lzf82wd") {
      // Rotorcraft
      emailContent = certTemplates.generateRotorcraftTemplate(
        registration.first_name,
        registration.last_name
      );
    }
    const { data } = await axios.post(
      "https://dt-sms-api.azurewebsites.net/api/email?code=4R6g/NhGSlTlmasM1Si6wiZkSPd0SNKaWbZWQbLdCt6vnzAb1dT2pA==",
      {
        EmailContent: emailContent,
        ToEmail: registration.email,
        FromEmail: "cholder@concordebattery.com",
        EmailSubject: "Your 2022 IA Renewal Certificate is ready to download",
      }
    );
  } catch (error) {
    console.log("error :>> ", error);
  }
};

const updateNotes = async (req, res, next) => {
  let certificateLink = "";
  try {
    validateAuthentication(req.auth);
    validateRequest(["registrationId", "shouldPrintNotes", "notes"], req.body);
    const { registrationId, notes, shouldPrintNotes } = req.body;

    // Extract user id from auth token
    // const userId = req.auth.payload.user_id;

    // Try to get registration from database
    const registrations = await Database.runQuery(`
      SELECT * FROM REGISTRATIONS
      INNER JOIN USERS ON USERS.user_id=REGISTRATIONS.user_id
      INNER JOIN EVENTS ON EVENTS.event_id=REGISTRATIONS.event_id
      WHERE (registration_id = '${registrationId}')
    `);

    if (!(registrations && registrations.length)) {
      // Record doesn't exist
      throw {
        status: 403,
        message: "Registration not found",
      };
    }

    const registration = registrations[0];
    // update db
    await Database.runQuery(`
    UPDATE REGISTRATIONS
    SET notes = '${notes}', should_print_notes = '${shouldPrintNotes}'
    WHERE (registration_id = '${registrationId}');
  `);
    if (
      shouldPrintNotes.length &&
      parseInt(shouldPrintNotes) &&
      registration.completedHours > 0
    ) {
      certificateLink = await _generateCertificate(
        registration,
        notes,
        shouldPrintNotes
      );
      await Database.runQuery(`
      UPDATE REGISTRATIONS
      SET cert_link = '${certificateLink}'
      WHERE (registration_id = '${registrationId}');
    `);

      _emailUser(registration);
    }

    // Get updated data from database
    const updatedRegistrations = await Database.runQuery(`
        SELECT * FROM REGISTRATIONS
      INNER JOIN USERS ON USERS.user_id=REGISTRATIONS.user_id
      WHERE (registration_id = '${registrationId}')
      `);

    const updatedRegistration = updatedRegistrations[0];

    res
      .status(200)
      .send(prepareResponse({ registration: updatedRegistration }));
  } catch (error) {
    console.log("error :>> ", error);
    res.status(error.status || 500).send(
      prepareResponse(
        {},
        {
          errorMessage: error.message,
        }
      )
    );
  }
};

module.exports = updateNotes;
