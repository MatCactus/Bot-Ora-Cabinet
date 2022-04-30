import {
    DMChannel,
    MessageActionRow,
    MessageAttachment,
    MessageButton,
    MessageEmbed,
} from "discord.js";
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
    const messageAttachments: any[] = [];
    message.attachments.forEach(e => {
        messageAttachments.push(
            new MessageAttachment(e.url, e.name ?? undefined, {
                url: e.url,
                filename: e.name ?? "",
                id: e.id,
                proxy_url: e.proxyURL,
                size: e.size,
            })
        );
    });
    if (linkedChannel?.type === "GUILD_TEXT")
        await linkedChannel.send({
            content: `**${message.author.username}:** ${message.content}`,
            files: messageAttachments,
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
    if (!message.content.startsWith(".")) {
        const messageAttachments: any[] = [];
        message.attachments.forEach(e => {
            messageAttachments.push(
                new MessageAttachment(e.url, e.name ?? undefined, {
                    url: e.url,
                    filename: e.name ?? "",
                    id: e.id,
                    proxy_url: e.proxyURL,
                    size: e.size,
                })
            );
        });
        await client.users
            .resolve(
                data.dm.find(e => e.channelId === message.channel.id)
                    ?.clientId ?? ""
            )
            ?.send({
                content: `**(${message.member?.roles.highest.name}) ${message.member?.displayName}:**\n${message.content}`,
                files: messageAttachments,
            })
            .catch(e =>
                message.reply(
                    "An error occurred when transcripting this message.."
                )
            );
    } else {
        console.log("command");
    }
});

client.on("channelDelete", async channel => {
    if (!data.dm.some(e => e.channelId === channel.id)) return;

    await client.users
        .resolve(data.dm.find(e => e.channelId === channel.id)?.clientId ?? "")
        ?.send({
            embeds: [
                new MessageEmbed()
                    .setDescription(
                        `**Bonjour à vous**,\nNous vous confirmons que le __lien__établi entre l'__actuel salon de conversation__ et celui dans lequel les __intervenants du cabinet__ interagissait avec vous vient d'être __clôturé__.\n*Ceci est un message automatique destiné à ${await client.users.resolve(
                            data.dm.find(e => e.channelId === channel.id)
                                ?.clientId ?? ""
                        )} suite à une interaction avec notre service. Si vous n'êtes pas le destinataire esconté, merci de supprimer cette conversation et de nous en aventir au plus vite.*\n\n*Message Automatique,*\n*Secrétariat Cabinet Hermerion,*\n*Hermerion Law Firm GP*:H2:`
                    )
                    .setColor("DARK_BUT_NOT_BLACK")
                    .setThumbnail(
                        "https://cdn.discordapp.com/attachments/922993915966160896/922994083381772319/Hermerion_petit_blanc.png"
                    )
                    .setTimestamp(),
            ],
        })
        .catch(e =>
            console.log(
                `An error occurred when closing this ticket .. (Channel ID: ${channel.id})`
            )
        );

    const linkedChannel = client.channels.resolve("888762420099698698");
    if (linkedChannel?.type === "GUILD_TEXT" && channel.type === "GUILD_TEXT")
        await linkedChannel.send({
            embeds: [
                new MessageEmbed()
                    .setDescription(
                        `Suppresion du Channel de discussion « ${
                            channel.name
                        } » en lien avec ${await client.users.resolve(
                            data.dm.find(e => e.channelId === channel.id)
                                ?.clientId ?? ""
                        )}.`
                    )
                    .setColor("DARK_BUT_NOT_BLACK")
                    .setThumbnail(
                        "https://cdn.discordapp.com/attachments/922993915966160896/922994083381772319/Hermerion_petit_blanc.png"
                    )
                    .setTimestamp(),
            ],
        });

    // edit message component by locking the close button

    const dmClientChannel = client.users.resolve(
        data.dm.find(e => e.channelId === channel.id)?.clientId ?? ""
    )?.dmChannel;
    if (dmClientChannel?.type === "DM") {
        dmClientChannel.messages
            .resolve(
                data.dm.find(e => e.channelId === channel.id)?.messageId ?? ""
            )
            ?.edit({
                components: [
                    new MessageActionRow().addComponents(
                        new MessageButton()
                            .setCustomId(`dm_stop_disabled`)
                            .setEmoji("<:H2:923011948088553512>")
                            .setLabel("Clore cette transcription")
                            .setStyle("DANGER")
                            .setDisabled(true)
                    ),
                ],
            });
    }

    data.dm.splice(data.dm.findIndex(f => f.channelId === channel.id));
});

client.on("interactionCreate", async interaction => {
    if (!interaction.isButton() || !interaction.customId.startsWith("dm_stop_"))
        return;

    const [dm, stop, clientId, channelId] = interaction.customId.split("_");

    await interaction.reply({
        content:
            "Votre requête a bien été prise en compte et est en cours de traitement.",
        ephemeral: true,
    });
    const channel = client.channels.resolve(channelId);
    if (channel) channel.delete();
});
