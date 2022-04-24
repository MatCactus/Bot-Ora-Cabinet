import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { client } from "../index";
import { data } from "../utils/dbFileManager";

// DM Messages Manager
client.on("messageCreate", async message => {
    if (message.author.bot) return;
    const channel = message.channel;
    if (channel.type !== "DM") return;

    const errorMessage = {
        embeds: [
            new MessageEmbed()
                .setDescription(
                    "Une erreur s'est produite, veuillez réessayer ultérieurement.\nSi l'erreur persiste, veuillez contacter <@541264156158853124>.\n\n*Message Automatique,*\n*Secrétariat Cabinet Hermerion,*\n*Hermerion Law Firm GP*<:H2:923011948088553512>"
                )
                .setColor("RED")
                .setThumbnail(
                    "https://cdn.discordapp.com/attachments/922993915966160896/922994083381772319/Hermerion_petit_blanc.png"
                )
                .setTimestamp(),
        ],
    };

    if (!data.dm.some(e => e.clientId === message.author.id)) {
        const channelToClone = client.channels.resolve(
            process.env.CHANNELID ?? ""
        );

        let newChannel;

        if (
            channelToClone &&
            channelToClone.isText() &&
            channelToClone.type === "GUILD_TEXT"
        ) {
            newChannel = await channelToClone.clone({
                name: `💬≫${message.author.username}`,
                topic: `Channel de mise en relation Client.\n ${message.author}`,
            });
        }

        if (!newChannel) {
            await message.reply(errorMessage);
            return;
        }

        const replyMessage = await message.reply({
            embeds: [
                new MessageEmbed()
                    .setDescription(
                        `**Bonjour à vous,**\nNous vous confirmons que votre __demande__ a été __réceptionnée et transmise__ aux forces compétentes.\n\n*Par ailleurs, sachez qu'à partir de maintenant, et ce jusqu'au terme de cette discussion, la totalité de vos messages seront retranscrits et enregistrés dans les registres du Cabinet.*\n*Enfin, ceci est un message automatique destiné à ${message.author} suite à une interaction avec notre service. Si vous n'êtes pas le destinataire esconté, merci de supprimer cette conversation et de nous en aventir au plus vite.*\n\n*Message Automatique,*\n*Secrétariat Cabinet Hermerion,*\n*Hermerion Law Firm GP*<:H2:923011948088553512>`
                    )
                    .setColor("DARK_BUT_NOT_BLACK")
                    .setThumbnail(
                        "https://cdn.discordapp.com/attachments/922993915966160896/922994083381772319/Hermerion_petit_blanc.png"
                    )
                    .setTimestamp(),
            ],
            components: [
                new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId(
                            `dm_stop_${message.author.id}_${newChannel.id}`
                        )
                        .setEmoji("<:H2:923011948088553512>")
                        .setLabel("Clore cette transcription")
                        .setStyle("DANGER")
                ),
            ],
        });

        data.dm.push({
            clientId: message.author.id,
            messageId: replyMessage.id,
            channelId: newChannel.id,
        });
    }

    const linkedChannel = client.channels.resolve(
        data.dm.find(e => e.clientId === message.author.id)?.channelId ?? ""
    );
    if (linkedChannel?.type === "GUILD_TEXT")
        await linkedChannel.send({
            content: `**${message.author.username}:** ${message.content}`,
        });
    else message.reply(errorMessage);
});

client.on("messageCreate", async message => {
    if (
        message.author.bot ||
        message.guild?.id !== process.env.MAINGUILDID ||
        !data.dm.some(e => e.channelId === message.channel.id)
    )
        return;
    if (!message.content.startsWith("."))
        await client.users
            .resolve(
                data.dm.find(e => e.channelId === message.channel.id)
                    ?.clientId ?? ""
            )
            ?.send(
                `**(${message.member?.roles.highest.name}) ${message.member?.displayName}:**\n${message.content}`
            )
            .catch(e =>
                message.reply(
                    "An error occurred when transcripting this message.."
                )
            );
    else {
        console.log("command");
    }
});
