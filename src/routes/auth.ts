import passport from "passport"
import express from "express"

const router = express.Router()

router.get("/discord/callback", passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => {
     if (!req.user) return
     console.log(req.user)
     //@ts-ignore
     req.session.discord = req.user
     res.redirect('/')
})

router.get('/steam/callback', passport.authenticate('steam', { failureRedirect: '/' }), (req, res) => { 
     console.log(req.user)
     //@ts-ignore
     req.session.steam = { ...req.user, creationdate : req.user._json.timecreated }
     res.redirect('/')
 });

export default router