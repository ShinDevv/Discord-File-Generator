const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config.json');
const generated = new Set();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gen')
        .setDescription('Generate a specified service if stocked')
        .addStringOption(option =>
            option.setName('service')
                .setDescription('The name of the service to generate')
                .setRequired(true)),

    async execute(interaction) {
        try {
            const service = interaction.options.getString('service');
            const member = interaction.member;
            const stockDir = './stock';
            const filePath = path.join(stockDir, `${service}.txt`);

            // First check all conditions before deferring the reply
            if (interaction.channelId !== config.genChannel) {
                return await interaction.reply({
                    embeds: [new MessageEmbed()
                        .setColor(config.color.red)
                        .setTitle('Wrong command usage!')
                        .setDescription(`You cannot use the \`/gen\` command in this channel! Try it in <#${config.genChannel}>!`)
                        .setFooter({ text: interaction.user.tag })
                        .setTimestamp()],
                    ephemeral: true
                });
            }

            if (generated.has(member.id)) {
                return await interaction.reply({
                    embeds: [new MessageEmbed()
                        .setColor(config.color.red)
                        .setTitle('Cooldown!')
                        .setDescription(`Please wait **${config.genCooldown}** seconds before executing that command again!`)
                        .setFooter({ text: interaction.user.tag })
                        .setTimestamp()],
                    ephemeral: true
                });
            }

            if (!fs.existsSync(filePath)) {
                return await interaction.reply({
                    embeds: [new MessageEmbed()
                        .setColor(config.color.red)
                        .setTitle('Generator error!')
                        .setDescription(`Service \`${service}\` not found!`)
                        .setFooter({ text: interaction.user.tag })
                        .setTimestamp()],
                    ephemeral: true
                });
            }

            // Read stock before deferring
            let contents = fs.readFileSync(filePath, 'utf8').split('\n').filter(line => line.trim());

            if (contents.length < 100) {
                return await interaction.reply({
                    embeds: [new MessageEmbed()
                        .setColor(config.color.red)
                        .setTitle('Generator error!')
                        .setDescription(`Service \`${service}\` needs at least 100 accounts in stock!`)
                        .setFooter({ text: interaction.user.tag })
                        .setTimestamp()],
                    ephemeral: true
                });
            }

            // Defer the reply as file operations might take time
            await interaction.deferReply();

            // Shuffle the accounts array
            for (let i = contents.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [contents[i], contents[j]] = [contents[j], contents[i]];
            }

            // Get 100 accounts and remove them from stock
            const accounts = contents.slice(0, 100);
            const remainingAccounts = contents.slice(100).filter(line => line.trim());
            fs.writeFileSync(filePath, remainingAccounts.join('\n'));

            // Create user's file
            const userFileName = `${service}-skibidi.txt`;
            const userFilePath = path.join(stockDir, userFileName);
            fs.writeFileSync(userFilePath, accounts.join('\n'));

            // Add cooldown
            generated.add(member.id);
            setTimeout(() => generated.delete(member.id), config.genCooldown * 1000);

            try {
                // Send DM with file and embed
                await interaction.user.send({
                    embeds: [new MessageEmbed()
                        .setColor(config.color.green)
                        .setDescription(`Generated **${service}** hits\n${new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' })}\nSkibidiZen's Generator`)],
                    files: [{
                        attachment: userFilePath,
                        name: userFileName
                    }]
                });

                // Delete the temporary file
                fs.unlinkSync(userFilePath);

                // Edit the deferred reply with success message
                await interaction.editReply({
                    embeds: [new MessageEmbed()
                        .setColor(config.color.green)
                        .setDescription(`Generated **${service}** hits\n${new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' })}\nSkibidiZen's Generator`)]
                });
            } catch (dmError) {
                // Clean up file if DM failed
                if (fs.existsSync(userFilePath)) {
                    fs.unlinkSync(userFilePath);
                }

                // Edit the deferred reply with error message
                await interaction.editReply({
                    content: 'Failed to send DM. Please make sure your DMs are open.',
                    ephemeral: true
                });
            }
        } catch (err) {
            console.error('Generation error:', err);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'An error occurred while generating the account.',
                    ephemeral: true
                });
            } else {
                await interaction.editReply({
                    content: 'An error occurred while generating the account.',
                    ephemeral: true
                });
            }
        }
    },
};