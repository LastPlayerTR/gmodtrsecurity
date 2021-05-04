import passport from "passport"
import DiscordStrategy from "passport-discord"
import SteamStrategy from "passport-steam"
import { clientID, clientSecret } from "./constants/discord";
import { apiKey, host } from "./constants/server";

//@ts-ignore
passport.use(new SteamStrategy({
     returnURL: host + 'auth/steam/callback',
     realm: host,
     apiKey: apiKey
}, (link: string, profile: any, done: any) => {
     profile.link = link
     done(null, profile)
}));

passport.use(new DiscordStrategy({
     clientID: clientID,
     clientSecret: clientSecret,
     callbackURL: host + 'auth/discord/callback',
     scope: ['identify', 'connections'],
}, (_, __, profile, done) => done(null, profile)));

passport.serializeUser((user, done) => {
     done(null, user)
})
   
passport.deserializeUser((user, done) => {
     done(null, user)
})

export const loadPassport = 0