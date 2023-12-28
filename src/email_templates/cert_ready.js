const certTemplates = {
  generatePistonTemplate: (firstName, lastName) => {
    return `
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td align="center">
      <img
        src="https://dexterous-static-assets.s3.us-west-1.amazonaws.com/concorde-assets/piston/concorde-piston-event-logo.png"
        width="300" height="150" style="margin-bottom: 2cm;">
        <div style="margin: auto; width: 600px; font-size: 1.2rem!important;">
      <p style="margin-bottom: 1cm;line-height: 108%;text-align: left;background: transparent;">Hello ${firstName} ${lastName},</p>

      <p style="margin-bottom: 0.28cm;line-height: 108%;text-align: left;background: transparent;">Your certificate of
        completion for the 2022 Piston IA Renewal is ready to download.</p>
      <p style="margin-bottom: 0.28cm;line-height: 108%;text-align: left;background: transparent;">To download your
        certificate, login to the Concorde Battery Portal at: <u><a
            href="https://portal.concordebattery.com/">https://portal.concordebattery.com</a></u>. Find your event under
        the Registered Events tab in the upper left-hand corner of the screen and click on the button Download
        Certificate.</p>
      <p style="margin-bottom: 1cm;line-height: 108%;text-align: left;background: transparent;">A tutorial is posted
        at <u><a href="https://www.youtube.com/watch?v=MPQ39qeL_o4">https://www.youtube.com/watch?v=MPQ39qeL_o4</a></u>.
        If you have any questions, please contact Chris Holder at <u><a
            href="mailto:cholder@concordebattery.com">cholder@concordebattery.com</a></u> or Noga Holck at <u><a
            href="mailto:nholck@concordebattery.com">nholck@concordebattery.com</a></u>.</p>
      
      <p style="margin-bottom: 1cm;line-height: 108%;text-align: left;background: transparent;">We welcome all
        feedback and appreciate your thoughts and suggestions. Thank you for your participation in this event!</p>
      
      <p style="margin-bottom: 0.28cm;line-height: 108%;text-align: left;background: transparent;">Sincerely,</p>
      <p style="margin-bottom: 0.28cm;line-height: 108%;text-align: left;background: transparent;">The Concorde Battery
        IA Renewal Team</p>
        </div>
    </td>
  </tr>
</table>
    `;
  },
  generateRotorcraftTemplate: (firstName, lastName) => {
    return `
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <img
          src="https://dexterous-static-assets.s3.us-west-1.amazonaws.com/concorde-assets/rotorcraft/concorde-rotorcraft-event-logo.png"
          width="300" height="150" style="margin-bottom: 2cm;">
          <div style="margin: auto; width: 600px; font-size: 1.2rem!important;">
          <p style="margin-bottom: 1cm;line-height: 108%;text-align: left;background: transparent;">Hello ${firstName} ${lastName},</p>

          <p style="margin-bottom: 0.28cm;line-height: 108%;text-align: left;background: transparent;">Your certificate of completion for the 2022 Rotorcraft IA Renewal is ready to download.</p>
          <p style="margin-bottom: 1cm;line-height: 108%;text-align: left;background: transparent;">To download your certificate, login to the Concorde Battery Portal at <u><a href="https://portal.concordebattery.com/">https://portal.concordebattery.com</a>.&nbsp;</u> Find your event under the Registered Events tab in the upper left-hand corner of the screen and click on the button Download Certificate.</p>
          
          <p style="margin-bottom: 1cm;line-height: 108%;text-align: left;background: transparent;">A tutorial is posted at <u><a href="https://www.youtube.com/watch?v=MPQ39qeL_o4">https://www.youtube.com/watch?v=MPQ39qeL_o4</a></u>. If you have any questions, please contact Chris Holder at <u><a href="mailto:cholder@concordebattery.com">cholder@concordebattery.com</a></u> or Noga Holck at <u><a href="mailto:nholck@concordebattery.com">nholck@concordebattery.com</a></u>.</p>
          
          <p style="margin-bottom: 1cm;line-height: 108%;text-align: left;background: transparent;">We welcome all feedback and appreciate your thoughts and suggestions. Thank you for your participation in this event!</p>
          
          <p style="margin-bottom: 0.28cm;line-height: 108%;text-align: left;background: transparent;">Sincerely,</p>
          <p style="margin-bottom: 0.28cm;line-height: 108%;text-align: left;background: transparent;">The Concorde Battery IA Renewal Team</p>
  </div>
      </td>
    </tr>
  </table>
    `;
  },
  generateTurbineTemplate: (firstName, lastName) => {
    return `
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td align="center">
      <img
        src="https://dexterous-static-assets.s3.us-west-1.amazonaws.com/concorde-assets/turbine/concorde-turbine-event-logo.png"
        width="300" height="150" style="margin-bottom: 2cm;">
        <div style="margin: auto; width: 600px; font-size: 1.2rem!important;">
      <p style="margin-bottom: 1cm;line-height: 108%;text-align: left;background: transparent;">Hello ${firstName} ${lastName},</p>

      <p style="margin-bottom: 0.28cm;line-height: 108%;text-align: left;background: transparent;">Your certificate of
        completion for the 2022 Turbine IA Renewal is ready to download.</p>
      <p style="margin-bottom: 1cm;line-height: 108%;text-align: left;background: transparent;">To download your
        certificate, login to the Concorde Battery Portal at: <u><a
            href="https://portal.concordebattery.com/">https://portal.concordebattery.com</a>.&nbsp;</u> Find your event
        under the Registered Events tab in the upper left-hand corner of the screen and click on the button Download
        Certificate.</p>
      
      <p style="margin-bottom: 1cm;line-height: 108%;text-align: left;background: transparent;">A tutorial is posted
        at <u><a href="https://www.youtube.com/watch?v=MPQ39qeL_o4">https://www.youtube.com/watch?v=MPQ39qeL_o4</a></u>.
        If you have any questions, please contact Chris Holder at <u><a
            href="mailto:cholder@concordebattery.com">cholder@concordebattery.com</a></u> or Noga Holck at <u><a
            href="mailto:nholck@concordebattery.com">nholck@concordebattery.com</a></u>.</p>
      
      <p style="margin-bottom: 1cm;line-height: 108%;text-align: left;background: transparent;">We welcome all
        feedback and appreciate your thoughts and suggestions. Thank you for your participation in this event!</p>
      
      <p style="margin-bottom: 0.28cm;line-height: 108%;text-align: left;background: transparent;">Sincerely,</p>
      <p style="margin-bottom: 0.28cm;line-height: 108%;text-align: left;background: transparent;">The Concorde Battery
        IA Renewal Team</p>
</div>
    </td>
  </tr>
</table>
    `;
  },
};

module.exports = certTemplates;
