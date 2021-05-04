import express from "express"
import passport from "passport"
import { PORT } from "./constants/server"
import Logger from "./utils/Logger"
import next from "next"
import link from "./routes/link"
import expressSession from "express-session"
import path from "path"
import auth from "./routes/auth"
import { Request } from "express-serve-static-core"
import DiscordStrategy from "passport-discord"
import { ParsedUrlQuery } from "querystring"

export const next_app = next({
     dev: process.env.NODE_ENV !== 'production',
     dir: path.join(__dirname, "../serve"),
     quiet: process.env.NODE_ENV === 'production',
     conf: {
          future: {},
          experimental: {
               turboMode: false,
               reactRoot: false
          }
     }
})

let ready = false

next_app.prepare().then(() => {
     ready = true
     Logger.success("Next App Ready!")
})

const app = express()

app.use((req, res, next) => {
     if (!ready) res.send("Sunucu açılıyor, lütfen bekle!")
     else next()
})

app.use(expressSession({
     secret: "default",
     resave: true,
     saveUninitialized: true
}))

app.use(passport.initialize())

app.use(passport.session())

app.use("/link", link)

app.use("/_next/static", express.static(path.join(__dirname, "../serve/.next/static")))

app.use("/assets", express.static(path.join(__dirname, "../serve/public")))

app.use("/auth", auth)

//@ts-ignore
app.get("/", async (req: Request & { session: { discord: DiscordStrategy.Profile, steam: any } }, res) => {
     const q: ParsedUrlQuery = {}

     if (req.session.discord?.id) {
          q.discord_id = req.session.discord.id
          q.discord_disc = req.session.discord.discriminator
          q.discord_name = req.session.discord.username
          q.discord_avatar = req.session.discord.avatar
     }

     if (req.session.steam?.id) {
          q.steam_name = req.session.steam.displayName
          q.steam_avatar = req.session.steam.photos[req.session.steam.photos.length - 1].value
     }

     await next_app.render(req, res, "/", q)
})

//@ts-ignore
app.use(async (err, req, res, next) => {
     if (!err) return next()
     if (!req.headersSent) return next(err)
     else {
          await next_app.render(req, res, "/error", { text: "Iç sunucu hatası, adminlere bildirin." })
          console.error(err)
     }
})

app.use(async (req, res, next) => {
     if (!res.headersSent) await next_app.render(req, res, "/error", { text: "404, Sayfa bulunamadı." })
     next()
})

app.listen(PORT).once("listening", () => Logger.success("Listening on port " + PORT))

export const loadServer = 0