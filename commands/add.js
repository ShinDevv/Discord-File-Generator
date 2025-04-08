
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Add stock to the generator')
        .addStringOption(option =>
            option.setName('service')
                .setDescription('The service name')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('content')
                .setDescription('The account content')
                .setRequired(true)),

    async execute(interaction) {
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({
                content: 'You do not have permission to use this command!',
                ephemeral: true
            });
        }

        const service = interaction.options.getString('service');
        const content = interaction.options.getString('content');
        const stockDir = './stock';
        const filePath = path.join(stockDir, `${service}.txt`);

        try {
            if (!fs.existsSync(stockDir)) {
                fs.mkdirSync(stockDir);
            }
            
            fs.appendFileSync(filePath, content + '\n');

            const embed = new MessageEmbed()
                .setColor(config.color.green)
                .setTitle('Stock Added')
                .setDescription(`Successfully added stock to service: ${service}`)
                .setFooter(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true, size: 64 }))
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (err) {
            console.error(err);
            return interaction.reply('An error occurred while adding stock.');
        }
    },
};
