import { GuildMember, MessageEmbed, TextChannel } from "discord.js";
import moment from "moment";
import { client } from "../bot";
import { channels, guild, roles } from "../constants/discord";

export default async function requireManualVerification({ discord: { id: discordID }, steam: { id: steamID } }: {
     steam: { id: string },
     discord: { id: string }
}, reason: string) {
     const member: GuildMember | null = await guild().members.fetch({
          user: discordID,
          force: false
     }).catch(() => null)

     if (!member) return

     member.roles.add(roles.manual)
     member.roles.remove(roles.unregistered);

     (<TextChannel>client.channels.cache.get(channels.manualVerify)).send(new MessageEmbed({
          color: "BLUE",
          fields: [{
               name: "Discord Hesabı",
               value: `<@!${discordID}>`
          }, {
               name: "Steam Profil ID",
               value: `[${steamID}](https://steamcommunity.com/profiles/${steamID})`
          }, {
               name: "Discord Hesabı Açılış Tarihi",
               value: `${moment(member.user.createdAt).format("dddd, MMMM Do YYYY, h:mm:ss a")}${moment(member.user.createdAt).locale("tr-TR").fromNow()}`
          }],
          footer: {
               text: `Manuel alma sebebi: ${reason}`
          }
     }).setTimestamp())
}
