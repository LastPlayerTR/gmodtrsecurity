import { Client } from "discord.js";
import { clientToken } from "./constants/discord";
import Logger from "./utils/Logger";

export const client = new Client()

client.once("ready", () => {
     Logger.success("Discord Client has connected!")
})


client.login(clientToken)