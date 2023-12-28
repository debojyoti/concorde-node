const CERT_TEMPLATES = {
  2023: {
    default: {
      templateImageLink: "cert-templates/2023_cert_template.png",
      formattings: {
        namePosition: [0, 326],
        hourPosition: [355, 361],
        dateRangePosition: [414, 428],
        notesPosition: [15, 450],
        datePosition: [280, 492],
        date: "February 4, 2023"
      },
    },
    pksqzrx170000ybzp1r55fztl: {
      // PISTON
      templateImageLink: "cert-templates/2023/2023_piston.png",
      formattings: {
        namePosition: [0, 326],
        hourPosition: [355, 361],
        dateRangePosition: [414, 428],
        notesPosition: [15, 450],
        datePosition: [280, 492],
        date: "January 12-13, 2023"

      },
    },
    oksqzrx180003ybzp1ilf98lx: {
      // 2023 turbine
      templateImageLink: "cert-templates/2023/2023_turbine.jpg",
      formattings: {
        namePosition: [0, 326],
        hourPosition: [355, 361],
        dateRangePosition: [414, 428],
        notesPosition: [15, 450],
        datePosition: [280, 492],
        date: "January 19-20, 2023"

      },
    },
    rksqzrx180006ybzp4lzf82w9: {
      // 2023 rotorcraft
      templateImageLink: "cert-templates/2023/2023_rotorcraft.jpg",
      formattings: {
        namePosition: [0, 326],
        hourPosition: [355, 361],
        dateRangePosition: [414, 428],
        notesPosition: [15, 450],
        datePosition: [280, 492],
        date: "January 26-27, 2023"

      },
    },
  },
  2022: {
    default: {
      templateImageLink: "cert-templates/2022_cert_template.png",
      formattings: {
        namePosition: [0, 326],
        hourPosition: [355, 361],
        dateRangePosition: [414, 428],
        notesPosition: [15, 450],
        datePosition: [280, 538],
      },
    },
  },
};

module.exports = CERT_TEMPLATES;
