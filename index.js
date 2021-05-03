const { json } = require('express');
let express = require('express'),
    passport = require('passport'),
    util = require('util'),
    session = require('express-session'),
    SteamStrategy = require('passport-steam'),
    moment = require('moment'),
    DiscordStrategy = require('passport-discord'),
    ejs = require('ejs'),
    Discord = require('discord.js'),
    fs = require('fs'),
    axios = require('axios').default
let config = {
    port: process.env.port,
    mainhost: process.env.mainhost || `http://localhost:${process.env.port}/`,
    steamwebapikey: process.env.apikey || "BC447756ECF4F2F4F97DED744D8CD013",
    secret: process.env.secret || "demo",
    discordclientid: process.env.discordclientid || "544199344786505729",
    discordclientsecret: process.env.discordclientsecret || "iU285MJfISpIqL5Tpv_0FjiohV_tD-qC",
    discordtoken : process.env.discordtoken || "NTQ0MTk5MzQ0Nzg2NTA1NzI5.XGBXIg.yggMFQLYxIzvwQbWP5yQ7GBUDTQ"
}


let DiscordConfig = JSON.parse(fs.readFileSync('./config.json').toString())

/* 
  DİSCORD
*/
const discordclient = new Discord.Client();
discordclient.on('ready', () => {
    console.log('Discord botu bağlandı')
});

discordclient.login(config.discordtoken);

function manuelverificationrequired(session,reason){
    let steamid = session.steam.id
    let discordid = session.discord.id
    let guild = discordclient.guilds.cache.get(DiscordConfig.guildid)
    let member = guild.members.cache.get(discordid)
    if(member == undefined){return}
    member.roles.add(guild.roles.cache.get(DiscordConfig.manuelverifyrole))
    member.roles.remove(guild.roles.cache.get(DiscordConfig.unregisteredroleid))
    guild.channels.cache.get(DiscordConfig.manuelverifych).send(`Discord Hesabı : ${member}\nDiscord ID : ${discordid}\nSteam Profil ID:${steamid}\nSteam Profil Linki:${"https://steamcommunity.com/profiles/"+steamid}\nManuel Doğrulama Sebebi:${reason}`)

}


/* 
  PASSPORT - OAUTH
*/
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

passport.use(new SteamStrategy({
        returnURL: config.mainhost + 'auth/steam/callback',
        realm: config.mainhost,
        apiKey: config.steamwebapikey
    },
    function (identifier, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {
            profile.identifier = identifier;
            return done(null, profile);
        });
    }
));

passport.use(new DiscordStrategy({
    clientID: config.discordclientid,
    clientSecret: config.discordclientsecret,
    callbackURL: config.mainhost + 'auth/discord/callback',
    scope: ['identify', 'email', 'connections'],
    prompt: 'consent'
}, function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
        return done(null, profile);
    });
}));

/* 
  EXPRESS
*/
var app = express();

app.engine('.ejs', ejs.__express);
app.set('views',__dirname+'/views');

app.use(session({
    secret: config.secret,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
/* 
  EXPRESS - ROUTES
*/
app.get('/', function (req, res) {
    res.sendFile('connection.html',{root:"./views"})
});

app.get('/link',async function(req,res){
    if(discordclient.ws.status != 0){
        return res.json({status : 500 , message : "Discord botu hazırlanıyor. 1-2 Dakika içinde tekrar deneyin."})
    }
    if (!req.session.discord&&!req.session.steam){ return res.json({status : 401 , message:"Tekrar Giriş Yapın"}) }
    let guild = discordclient.guilds.cache.get(DiscordConfig.guildid)
    let member = guild.members.cache.get(req.session.discord.id)
    if(member == undefined){return res.json({status : 403 , message : "Discordda bulunmuyorsunuz."})}
    let unregistered = member.roles.cache.get(DiscordConfig.unregisteredroleid)
    let manuelverifyrole = member.roles.cache.get(DiscordConfig.manuelverifyrole)
    if(manuelverifyrole != undefined){return res.json({status : 403 , message : "Hesabınız Yetkili Tarafından Manuel Olarak Doğrulanacak."})}
    if(unregistered == undefined){return res.json({status : 403 , message : "Hesabınız zaten doğrulanmış."})}
    let connection = req.session.discord.connections.find(jsn => {
        if(jsn.type == 'steam') { return jsn }
    })
    if(!connection){return res.json({status : 403 , message : "Discord hesabınız ile Steam hesabınızı Discord üzerinden eşleştirin."})}
    if(connection.id != req.session.steam.id){return res.json({status : 403 , message : "Discord hesabınız ile eşleştirilmiş olan Steam hesabı sistemde eşleştirdiğiniz Steam hesabı ile uyuşmuyor."})}
    let discordgunfark = moment().diff( moment(member.user.createdTimestamp) , 'days' )
    let steamgunfark = moment().diff( moment.unix(req.session.steam.creationdate) , 'days' )
    if(discordgunfark < 30 || steamgunfark < 30){
        manuelverificationrequired(req.session , "Hesaplar Çok Yeni")
        return res.json({status : 403 , message : "Hesabınız Güvenlik Sebebiyle Yetkili Tarafından Manuel Olarak Doğrulanacak. Discord DM'lerinizi açın ve Yetkilileri Bekleyin."})
        
    }
    let playtime = 0
    try {

        let steamoyunlari = await axios.get(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${config.steamwebapikey}&steamid=${req.session.steam.id}&format=json`)
        steamoyunlari = steamoyunlari.data
        if(steamoyunlari["response"] == "{}" || steamoyunlari["response"] == {}){
            return res.json({status : 403 , message : "Steam oyun süreniz alınamıyor. Steam hesabınızın gizliliğini herkese açık yapın."})
        }
        steamoyunlari = steamoyunlari["response"]["games"]      
        Object.keys(steamoyunlari).forEach(id => {
            if(steamoyunlari[id].appid == "4000"){
                playtime = steamoyunlari[id].playtime_forever
            }
        });
        if(playtime < DiscordConfig.minimumoyunsuresi){
            manuelverificationrequired(req.session , "Oyun Süresi Çok Az")
            return res.json({status : 403 , message : "Hesabınız Güvenlik Sebebiyle Yetkili Tarafından Manuel Olarak Doğrulanacak. Discord DM'lerinizi açın ve Yetkilileri Bekleyin."})
        }
    } catch (err) {
        manuelverificationrequired(req.session , "Steam Oyun Verileri Alınamadı")
        return res.json({status : 500 , message : "Hesabınız Güvenlik Sebebiyle Yetkili Tarafından Manuel Olarak Doğrulanacak. Discord DM'lerinizi açın ve Yetkilileri Bekleyin."})
    }
    member.roles.add(guild.roles.cache.get(DiscordConfig.registeredroleid))
    member.roles.remove(guild.roles.cache.get(DiscordConfig.unregisteredroleid))
    res.json({status : 200 , message : "Hesabınız başarıyla doğrulandı. Garry's Mod Türkiye Developer Platformuna Hoşgeldiniz."})
    guild.channels.cache.get(DiscordConfig.adminlogch).send(`Discord Hesabı : ${member}\nDiscord ID : ${req.session.discord.id}\nSteam Profil ID: ${req.session.steam.id}\nSteam Profil Linki: ${"https://steamcommunity.com/profiles/"+req.session.steam.id}\nDiscord Hesabı Açılış(Gün): ${discordgunfark}\nSteam Hesabı Açılış(Gün): ${steamgunfark}}\nGarry's Mod Saati: ${Math.floor(playtime / 60) +"," + Math.floor( playtime % 60 )}`)
})
app.get('/account', function (req, res) {
    if (req.session.discord&&req.session.steam){
        res.render('./account.ejs', {
            discordname : req.session.discord.nick,
            discordid : req.session.discord.id,
            steamname : req.session.steam.nick,
            steamid : req.session.steam.id

        });
    }else{
        if(!req.session.discord){
            res.redirect('/auth/discord');
            return
        }
        if(!req.session.steam){
            res.redirect('/auth/steam');
            return
        }
    }
});

app.get('/logout', function (req, res) {
    req.logout();
    req.session.destroy()
    res.redirect('/');
});
app.get('/auth/discord', passport.authenticate('discord'), function(req, res) {
    res.send('Discord aktarılamadı.');
});
app.get('/auth/discord/callback',
    passport.authenticate('discord', { failureRedirect: '/' }), function(req, res) {
      req.session.discord = {
        nick : req.user.username + "#" + req.user.discriminator,
        id : req.user.id,
        connections : req.user.connections
      }  
      res.redirect('/account')
    } 
);
app.get('/auth/steam', passport.authenticate('steam', { failureRedirect: '/' }), function (req, res) {
    res.send('Steam aktarılamadı.');
});

app.get('/auth/steam/callback', passport.authenticate('steam', { failureRedirect: '/' }), function (req, res) { 
    req.session.steam = {
        nick : req.user.displayName,
        id : req.user.id,
        creationdate : req.user._json.timecreated
      }  
    res.redirect('/account')
});

app.listen(config.port);