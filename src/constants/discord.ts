import { Guild } from "discord.js"
import { client } from "../bot"

export const clientID = process.env.discordclientid 
export const clientSecret = process.env.discordclientsecret 
export const clientToken = process.env.token 

export const roles = {
     unregistered: "657685135185149965",
     registered: "657687107300753408",
     manual: "838854303724208200"
}

export const minPlayMins = 1500
export const channels = {
     manualVerify: "838854578002722906",
     log: "838854491951595570"
}

const _: any = {}

export const guild: () => Guild = () => client.guilds.cache.first()
