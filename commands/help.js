const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const config = require('../config.json');
const stock = require('./stock');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Display the command list.'),

	async execute(interaction) {
		const { commands } = interaction.client;

		const commandListEmbed = new MessageEmbed()
			.setColor(config.color.default)
			.setTitle('Help Panel')
			.setDescription(`**${interaction.guild.name}**!\n\n**Here is a list of available commands:**`)
			.setImage(config.banner)
			.setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true, size: 64 })) // Set the bot's avatar as the thumbnail
			.addFields({
				name: `# Commands`,
				value: "`/help`   **Displays the help command**\n`/create` **Create a new service**\n`/gen`   **Generate a file**\n`/add`    **Add a reward to the stock**\n`/stock`  **View the current stock**"
			})
			.setFooter(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true, size: 64 }))
			.setTimestamp()
			.addField('Social Links', `[**Facebook**](${config.website})`);

		await interaction.reply({ embeds: [commandListEmbed] });
	},
};
