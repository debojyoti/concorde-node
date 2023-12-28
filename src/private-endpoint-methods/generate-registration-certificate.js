const PDFDocument = require("pdfkit");
const fs = require("fs");

const Database = require("../db-helper");
const { prepareResponse } = require("../response-formatter");
const { validateRequest } = require("../request-validator");
const { validateAuthentication } = require("../auth-validator");

const AWS = require("aws-sdk");
const { default: axios } = require("axios");
const certTemplates = require("../email_templates/cert_ready");
const CERT_TEMPLATES = require("../../cert-templates");

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

const _determineCertTemplate = (registration) => {
  let certYear = "2023";
  Object.keys(CERT_TEMPLATES).forEach((year) => {
    if (registration.event_name.indexOf(year) > -1) {
      certYear = year;
    }
  });
  let template = CERT_TEMPLATES[certYear].default;
  if (registration.event_id && CERT_TEMPLATES[certYear][registration.event_id]) {
    template = CERT_TEMPLATES[certYear][registration.event_id];
  }
  return template;
};

const _generateCertificate = async (registration, hours) => {
  let tempLink = null;
  let s3Link = null;
  const certTemplate = _determineCertTemplate(registration);
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
  doc.image(certTemplate.templateImageLink, 0, 0, {
    width: doc.page.width,
    height: doc.page.height,
  });
  // doc.text("Debojyoti Saha", 250, 330);
  console.log(certTemplate);
  doc
    .fontSize(18)
    .text(
      `${registration.first_name} ${registration.last_name}`,
      ...certTemplate.formattings.namePosition,
      {
        align: "center",
      }
    );
  doc.fontSize(11).text(hours, ...certTemplate.formattings.hourPosition);
  let date = _getEventDate(registration);
  if (certTemplate?.formattings?.date) {
    date = certTemplate?.formattings?.date;
  }
  console.log('date :>> ', date);
  doc.fontSize(13).text(date, ...certTemplate.formattings.dateRangePosition);
  if (registration?.notes?.length && parseInt(registration.should_print_notes)) {
    doc
      .fontSize(11)
      .text(registration.notes, ...certTemplate.formattings.notesPosition, {
        align: "center",
      });
  }
  doc.fontSize(9).text(date, ...certTemplate.formattings.datePosition);
  doc.pipe(fs.createWriteStream(tempLink));
  doc.end();

  if (tempLink && tempLink.length) {
    s3Link = await _uploadToS3(registration.registration_id, tempLink);
    await _removeFile(tempLink);
  }
  return s3Link;
};

const _emailUser = async ({registration, certificateLink}) => {
  try {
    let fromEmail = 'iarenewal@concordebattery.com';
    let emailContent = `<table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <img
          src="https://dexterous-static-assets.s3.us-west-1.amazonaws.com/concorde-assets/Concorde_IARenewalSeries.png"
          width="400" height="150" style="margin-bottom: 2cm;">
          <div style="margin: auto; width: 600px; font-size: 1.2rem!important;">
        <p style="margin-bottom: 1cm;line-height: 108%;text-align: left;background: transparent;">Hi ${registration.first_name} ${registration.last_name},</p>
    
        <p style="margin-bottom: 0.28cm;line-height: 108%;text-align: left;background: transparent;">Your 2023 IA Renewal Certificate is now available.</p>
        <p style="margin-bottom: 0.28cm;line-height: 108%;text-align: left;background: transparent;"><u><a href="https://portal.concordebattery.com/download?f=${certificateLink}">Click Here</a></u> to download your certificate, or  login to the Concorde Battery Portal to download at: <u><a
              href="https://portal.concordebattery.com/">https://portal.concordebattery.com</a></u>. In the portal navigate to Registered Events and click on the button to download certificate under each event you attended.</p>
        <p style="margin-bottom: 1cm;line-height: 108%;text-align: left;background: transparent;">You can find a tutorial here <u><a href="https://www.youtube.com/watch?v=MPQ39qeL_o4">https://www.youtube.com/watch?v=MPQ39qeL_o4</a></u>.
        If you have any questions, please contact the Concorde IA Renewal Team at <u><a
        href="mailto:iarenewal@concordebattery.com">iarenewal@concordebattery.com</a></u>.  We welcome all feedback and appreciate your thoughts and suggestions.</p>
        
        <p style="margin-bottom: 1cm;line-height: 108%;text-align: left;background: transparent;">   For information on submitting your IA Renewal Application to the FAA please use this link to review the latest revision of the Flight Standards Information Management System, 8900.1 Contents, Volume 5, Chapter 5, Section 8: https://drs.faa.gov/browse/excelExternalWindow/DRSDOCID100205040220221118221704.0001.
            </p>
        
        <p style="margin-bottom: 0.28cm;line-height: 108%;text-align: left;background: transparent;">Thank you for your participation in this event!</p>
        <p style="margin-bottom: 0.28cm;line-height: 108%;text-align: left;background: transparent;">
        Concorde's IA Renewal Team</p>
          </div>
      </td>
    </tr>
    </table>`;

    if (registration.event_id === "cksqzrx170000ybzp1r55fzty") {
      fromEmail = 'cholder@concordebattery.com';
      // Piston
      emailContent = certTemplates.generatePistonTemplate(
        registration.first_name,
        registration.last_name
      );
    } else if (registration.event_id === "cksqzrx180003ybzp1ilf98lb") {
      fromEmail = 'cholder@concordebattery.com';
      // Turbine
      emailContent = certTemplates.generateTurbineTemplate(
        registration.first_name,
        registration.last_name
      );
    } else if (registration.event_id === "cksqzrx180006ybzp4lzf82wd") {
      fromEmail = 'cholder@concordebattery.com';
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
        FromEmail: fromEmail,
        EmailSubject: "Your 2023 IA Renewal Certificate is ready to download",
      }
    );
  } catch (error) {
    console.log("error :>> ", error);
  }
};

const generateRegistrationCertificate = async (req, res, next) => {
  try {
    validateAuthentication(req.auth);
    validateRequest(["registrationId", "hours"], req.body);
    const { registrationId, hours } = req.body;

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

    const requiredAction = _determineAction(registration, hours);

    console.log("requiredAction :>> ", requiredAction);

    switch (requiredAction) {
      case "CLEAR_REGISTRATION": {
        // Update database
        await Database.runQuery(`
        UPDATE REGISTRATIONS
        SET completedHours = '${hours}', cert_link = ${null}
        WHERE (registration_id = '${registrationId}');
      `);
        break;
      }
      case "REGENARATE_CERTIFICATE": {
        console.log("REGENARATE_CERTIFICATE");
        // Generate certificate
        const certificateLink = await _generateCertificate(registration, hours);
        // Update database with link
        await Database.runQuery(`
        UPDATE REGISTRATIONS
        SET completedHours = '${hours}', cert_link = '${certificateLink}'
        WHERE (registration_id = '${registrationId}');
      `);
        _emailUser({registration, certificateLink});
        break;
      }
      case "NO_ACTION": {
        break;
      }
      default: {
      }
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

module.exports = generateRegistrationCertificate;
