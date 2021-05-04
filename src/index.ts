import { client } from "./bot"
import { loadPassport } from "./passport"
import { loadServer } from "./server"

client
loadPassport
loadServer

//https://discord.com/api/oauth2/authorize?client_id=838852631606067221&redirect_uri=http%3A%2F%2Flocalhost%3A3030%2Fauth%2Fdiscord%2Fcallback&response_type=code&scope=identify%20connections
/* 
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

Reported Speech
When you report someone's speech, you should follow these rules:
    1- "Tom has never seen an elephant.", said his mother.
    His mother said that Tom had never seen an elephant

    2- "Josh works too hard", says Tim.
        Tim says that Josh works too hard.

    3- "I had been here before" said Tim,
        Tim said that he had been there before.

    4- "We are reading our books now" said the students.
        The students told us that they were reading their books then.

    5- "Where do you live?", asked Loura
        Loura asked me where I lived.

    6- "Have you seen ", asked my mother
        My mother asked me is have

app.listen(config.port);*/