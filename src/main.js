// dotenv setup
import { config } from "@dotenvx/dotenvx";
config({ quiet: true });

// bot setup
import { Bot } from "./bot.js";
const sold = new Bot(process.env.TOKEN);
await sold.init();
