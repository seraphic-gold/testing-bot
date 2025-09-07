import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
} from "discord.js";
import { box } from "./utilities.js";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promises as fs } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class Bot {
  constructor(TOKEN) {
    this.TOKEN = TOKEN;
    this.COMMANDS = [];
  }

  async init() {
    const CLIENT = new Client({ intents: [GatewayIntentBits.Guilds] });
    CLIENT.commands = new Collection();
    CLIENT.once(Events.ClientReady, (readyClient) => {
      box(`Logged in as ${readyClient.user.tag}`, "round", "Status");
    });
    await this.registerCommands(this.COMMANDS);
    await this.reloadCommands();
    await this.registerEvents(CLIENT);
    this.COMMANDS.forEach((command) =>
      CLIENT.commands.set(command.data.name, command)
    );
    CLIENT.login(this.TOKEN);
  }

  // handle commands
  async handleCommands(interaction) {}

  async registerCommands(commands) {
    box("📡 Registering commands...", "round", "Status");

    const foldersPath = path.join(__dirname, "commands"); // getting the commands folder
    const items = await fs.readdir(foldersPath); // getting the items in the commands folder

    for (const item of items) {
      // iterating over the items in cmds folder
      const itemPath = path.join(foldersPath, item); // getting the path of the item
      const stats = await fs.stat(itemPath); // getting the stats of the item

      if (stats.isDirectory()) {
        // if the item is a folder
        // handle subfolders
        const commandFiles = (await fs.readdir(itemPath)).filter((file) =>
          file.endsWith(".js")
        ); // getting the js files in the subfolder

        for (const file of commandFiles) {
          // iterating over the js files
          const filePath = path.join(itemPath, file); // getting the path of the js file
          await this.loadCommand(filePath, commands); // loading the command
        }
      } else if (stats.isFile() && item.endsWith(".js")) {
        // if the item is a js file
        // and not a subdirectory
        await this.loadCommand(itemPath, commands); // loading the command
      }
    }
    box(`📦 Loaded ${this.COMMANDS.length} commands.`, "round", "Status");
  }

  async loadCommand(filePath, commands) {
    const fileURL = pathToFileURL(filePath).href; // converting the file path to a file URL

    try {
      const command = await import(fileURL); // importing the command

      if ("data" in command && "execute" in command) {
        // if the command module has data + execute
        this.COMMANDS.push(command);
        console.log(`✅ Loaded command: ${command.data.name}`);
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" field.`
        );
      }
    } catch (error) {
      console.error("❌ Error loading command at " + filePath);
      console.error(error);
    }
  }

  async reloadCommands() {
    const rest = new REST().setToken(process.env.TOKEN);
    try {
      box(
        `🚀 Started refreshing ${this.COMMANDS.length} application (/) commands.`,
        "round",
        "Status"
      );
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
        body: this.COMMANDS.map((command) => command.data.toJSON()),
      });
      box(
        `✅ Successfully reloaded ${this.COMMANDS.length} application (/) commands.`,
        "round",
        "Status"
      );
    } catch (error) {
      console.error(`❌ Error reloading commands: ${error}`);
    }
  }

  async registerEvents(client) {
    const eventsPath = path.join(__dirname, "events");
    const items = await fs.readdir(eventsPath);
    const eventFiles = [];

    for (const item of items) {
      const itemPath = path.join(eventsPath, item);
      const stats = await fs.stat(itemPath);
      if (stats.isDirectory()) {
        // handle subfolders
        // still todo
        console.log("Subfolders not yet supported");
      } else if (stats.isFile() && item.endsWith(".js")) {
        console.log("File event detected.");
        eventFiles.push(itemPath);
      }
    }
    for (const file of eventFiles) {
      const fileURL = pathToFileURL(file).href;
      const event = await import(fileURL);
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
      } else {
        client.on(event.name, (...args) => event.execute(...args));
      }
    }
  }
}
