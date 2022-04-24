export interface dbFile {
    dm: {
        clientId: string;
        channelId: string;
        messageId: string;
    }[]; // clientId: Discord Id of the Sender | channelId: Discord Id of which channel is assigned to him | messageId: Reply Message Id (Embed)
}
