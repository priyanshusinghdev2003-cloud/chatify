import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/node";
import { isSpoofedBot } from "@arcjet/inspect";
import "dotenv/config"

const aj = arcjet({ 
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        // Uncomment to allow these other common bot categories
        // See the full list at https://arcjet.com/bot-list
        //"CATEGORY:MONITOR", // Uptime monitoring services
        //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
      ],
    }),
    // Create a token bucket rate limit. Other algorithms are supported.
    slidingWindow({
        mode: "LIVE",
        max: 100,
        interval: 60
    }),
  ],
});

export default aj