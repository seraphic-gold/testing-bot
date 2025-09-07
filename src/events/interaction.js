import { Events, MessageFlags } from "discord.js";

const name = Events.InteractionCreate;
const execute = async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  console.log(interaction.client.commands);
  const command = interaction.client.commands.get(interaction.commandName);
  console.log(command);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.log(error);
  }
};

export { name, execute };
