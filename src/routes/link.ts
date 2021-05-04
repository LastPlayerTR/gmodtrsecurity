import { client } from "../bot"
import express from "express"
import type { ParamsDictionary } from "express-serve-static-core"
import { GuildMember, MessageEmbed, TextChannel } from "discord.js"
import moment from "moment"
import { channels, guild, minPlayMins, roles } from "../constants/discord"
import type DiscordStrategy from "passport-discord"
import requireManualVerification from "../utils/requireManualVerification"
import fetch from "node-fetch"
import { apiKey } from "../constants/server"
import { next_app } from "../server"

const router = express.Router()

//@ts-ignore
router.get("/", async (req: (express.Request<ParamsDictionary, any, any, any, Record<string, any>> & { session: { discord: DiscordStrategy.Profile, steam: any }  }), res) => {
     if (!req.session.discord && !req.session.steam) return res.redirect("/")

     const member: GuildMember | null = await guild().members.fetch({
          user: req.session.discord.id,
          force: false
     }).catch(() => null)

     if (!member) return await next_app.render(req, res, "/error", { text: "Görünüşe göre hesabın sunucuda yok, discord davet linki: https://discord.gg/G69vyBSPJv" })

     if (member.roles.cache.has(roles.manual)) return await next_app.render(req, res, "/error", { text: "Hesabın yeterli kriterlere uymadığı için manüel aktivasyona alındı, Discord üzerinden bir yetkiliyle iletişime geçmen lazım." })
     if (member.roles.cache.has(roles.registered)) return await next_app.render(req, res, "/success" )

     const matchedConnection = req.session.discord.connections.find(x => x.type === "steam" && x.id === req.session.steam.id)
     
     if (!matchedConnection) return await next_app.render(req, res, "/error", { text: "Discord hesabında bu Steam hesabın yok, Discord'da hesap ayarlarından Steam'i bağlamayı unutma!" })
     
     if ((Date.now() - member.user.createdTimestamp) < 2.592e+9 || (Date.now() - req.session.steam.creationdate) < 2.592e+9) {
          await requireManualVerification(req.session, "Hesaplar Çok Yeni")
          return await next_app.render(req, res, "/error", { text: "Ya Steam yada Discord hesabın çok yeni, Discord üzerinden bir yetkiliyle iletişime geçmen lazım." })
     }

     const playTime: number | null = await new Promise<number>(async (resolve, reject) => {
          const games: any[] = await fetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${req.session.steam.id}&format=json`).then(x => x.json()).then(x => x.response.games)

          const game = games.find(x => x.appid === 4000)

          if (!game) reject()

          if (game.playtime_forever < minPlayMins) {
               await requireManualVerification(req.session, "Yeterli Gmod süresi yok")
               await next_app.render(req, res, "/error", { text: "Gmod süren yeterli olmadığı için uymadığı için (+"+  (minPlayMins / 60) + " saat) manüel aktivasyona alındın, Discord üzerinden bir yetkiliyle iletişime geçmen lazım." })
               resolve(null)
          }
          else return resolve(game.playtime_forever as number)
     }).catch(async (x) => {
          await requireManualVerification(req.session, "Steam Oyun Verileri Alınamadı")
          await next_app.render(req, res, "/error", { text: "Hesabından oyun bilgileri alınamadığı için, hesabın manüel aktivasyona alındı, Discord üzerinden bir yetkiliyle iletişime geçmen lazım." })
          return null
     })

     if (!playTime) return

     member.roles.add(roles.registered)
     member.roles.remove(roles.unregistered)

     await next_app.render(req, res, "/success");
     (<TextChannel>client.channels.cache.get(channels.log)).send(new MessageEmbed({
          color: "GREEN",
          fields: [{
               name: "Discord Hesabı",
               value: `<@!${member.id}>`
          }, {
               name: "Steam Profil ID",
               value: `[${req.session.steam.id}](https://steamcommunity.com/profiles/${req.session.steam.id})`
          }, {
               name: "Discord Hesabı Açılış Tarihi",
               value: `${moment(member.user.createdAt).locale("tr-TR").format("dddd, MMMM Do YYYY, h:mm:ss a")} **(${moment(member.user.createdAt).locale("tr-TR").fromNow()})**`
          }, {
               name: "Steam Hesabı Açılış Tarihi",
               value: `${moment.unix(req.session.steam.creationdate).locale("tr-TR").format("dddd, MMMM Do YYYY, h:mm:ss a")} **(${moment.unix(req.session.steam.creationdate).locale("tr-TR").fromNow()})**`
          }, {
               name: "Garry's Mod Saati",
               value: `Toplam **${Math.floor(playTime / 60)} saat**`
          }]
     }).setTimestamp())
})

export default router