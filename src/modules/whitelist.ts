import { serialize } from "v8";
import { client } from "..";
import { data } from "../utils/dbFileManager";
import { getPermLevel } from "../utils/getPermLevel";
import { createCommand } from "../utils/registerCommand";

// wlCommand Function called to create the Button on all Users Profile with createCommand Utils
const wlCommand = (
    guilds: {
        name: string;
        guildId: string;
        commands?: string[] | undefined;
    }[] = data.guilds
) =>
    guilds
        .filter(e => e.commands?.some(e => e === "wl")) // Get back guilds id which this command is noticed in the db.json file
        .forEach(e =>
            // For Each Guild which corresponds to the previous filter, add this interaction by using CreateCommand Utils
            createCommand(
                {
                    name: "Gérer la WL",
                    type: "USER",
                },
                e.guildId
            )
        );
wlCommand(); // Call the init function to setup update server interaction at the begging

client.on("interactionCreate", async interaction => {
    // Add an Event Handler for All Interaction
    if (
        !interaction.isApplicationCommand() || // Stop tout si ce n'est pas une Commande ou si ce n'est pas la bonne
        interaction.commandName !== "Gérer la WL" ||
        !interaction.guild
    )
        return;
    // Skip if it's not a commandInteraction or not in a guild or if this is not the good command

    if (getPermLevel(interaction.user.id) < 1)
        // Check if the interaction author is authorized to do that, else c'est Ciao ;)
        return interaction.reply({
            ephemeral: true,
            content:
                "Tu n'as pas la Permission de Gérer la WL d'un Membre de ce Serveur .. Si c'est une erreur, n'hésites pas à faire un Ticket",
        });

    const user = interaction.options.data[0].user;
    if (!user) return;
    const member = interaction.guild.members.resolve(user.id);
    if (!member) return;

    const roleId = "937141114333454376";

    let message = "";

    if (!member.roles.resolve(roleId))
        await member.roles
            .add(roleId)
            .then(e => (message = `${member} à bien été ajouté à la WL !`))
            .catch(
                e =>
                    (message = `Une erreur est survenue lors de l'ajout de ${member} à la WL !`)
            );
    else
        await member.roles
            .remove(roleId)
            .then(e => (message = `${member} à bien été retiré à la WL !`))
            .catch(
                e =>
                    (message = `Une erreur est survenue lors du retrait de la WL à ${member} !`)
            );

    interaction.reply({
        ephemeral: true,
        content: message,
    });
});
