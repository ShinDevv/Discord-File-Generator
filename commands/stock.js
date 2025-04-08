const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stock')
        .setDescription('Display the service stock.'),

    async execute(interaction) {
        try {
            const stockDir = './stock';

            if (!fs.existsSync(stockDir)) {
                fs.mkdirSync(stockDir);
            }

            const files = fs.readdirSync(stockDir).filter(file => file.endsWith('.txt'));

            let embed = new MessageEmbed()
                .setColor(config.color.default)
                .setTitle(`${interaction.guild.name} Service Stock`)
                .setDescription(`**SKIBIDI GENERATOR**`)
                .setFooter({ text: `${config.footer} - Updated: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' })}` })
                .setImage(config.banner);

            if (files.length > 0) {
                const stockInfo = files.map(file => {
                    try {
                        const content = fs.readFileSync(`${stockDir}/${file}`, 'utf8');
                        const lines = content.split('\n').filter(line => line.trim() !== '').length;
                        return `**${file.replace('.txt', '')}:** \`${lines}\``;
                    } catch (err) {
                        console.error(`Error reading file ${file}:`, err);
                        return `**${file.replace('.txt', '')}:** \`Error\``;
                    }
                }).join('\n');

                embed.addFields({ name: 'Available Stocks', value: stockInfo });
            } else {
                embed.addFields({ name: 'Available Stocks', value: 'No stocks available' });
            }

            embed.addFields({ name: 'Social Links', value: `[**Facebook**](${config.website})` });

            await interaction.reply({ embeds: [embed] });
        } catch (err) {
            console.error('Stock command error:', err);
            if (!interaction.replied) {
                await interaction.reply({ 
                    content: 'An error occurred while fetching stock information.',
                    ephemeral: true 
                });
            }
        }
    },
};