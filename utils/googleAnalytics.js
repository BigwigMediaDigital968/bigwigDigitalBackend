// const { BetaAnalyticsDataClient } = require("@google-analytics/data");
// const path = require("path");
// require("dotenv").config();

// // Auth using service account JSON key
// const analyticsDataClient = new BetaAnalyticsDataClient({
//   keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
// });

// // Replace with your actual GA4 property ID
// const PROPERTY_ID = "499321668";

// async function getReport() {
//   const [response] = await analyticsDataClient.runReport({
//     property: `properties/${PROPERTY_ID}`,
//     dateRanges: [
//       {
//         startDate: "7daysAgo",
//         endDate: "today",
//       },
//     ],
//     dimensions: [{ name: "city" }],
//     metrics: [{ name: "activeUsers" }],
//   });

//   return response;
// }

// module.exports = { getReport };

const { BetaAnalyticsDataClient } = require("@google-analytics/data");
require("dotenv").config();

let analyticsDataClient = null;

if (
  process.env.GA_CLIENT_EMAIL &&
  process.env.GA_PRIVATE_KEY &&
  process.env.GA_PROPERTY_ID
) {
  analyticsDataClient = new BetaAnalyticsDataClient({
    credentials: {
      client_email: process.env.GA_CLIENT_EMAIL,
      private_key: process.env.GA_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
  });
} else {
  console.warn("⚠️ Google Analytics disabled: missing credentials");
}

async function getReport() {
  if (!analyticsDataClient) {
    throw new Error("Google Analytics not configured");
  }

  const [response] = await analyticsDataClient.runReport({
    property: `properties/${process.env.GA_PROPERTY_ID}`,
    dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
    dimensions: [{ name: "city" }],
    metrics: [{ name: "activeUsers" }],
  });

  return response;
}

module.exports = { getReport };
