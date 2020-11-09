const net = require('net');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var fs = require('fs');
var ejs = require('ejs');
var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var url = "mongodb://localhost:27017/";
var passport = require('passport');
var bodyParser = require('body-parser');
var LocalStrategy = require('passport-local');
var passportLocalMongoose = require('passport-local-mongoose');
var User = require("./models/user");
// User.collection.drop();

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost/auth_demo_app");

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//=====================
// ROUTES
//=====================

// Showing home page


app.get("/", function (req, res) {
    User.find({}, 'name', function(err, users){
        if(err){
            console.log(err);
        }else{
            console.log('retrieved list of names' + users.length);
            if(users.length >=1)
            {
                console.log(users[0]);
            }
        }
    })
    res.render("home");
});

// Showing secret page
app.get("/index", isLoggedIn, function (req, res) {
    res.render("index");
});

// Showing register form
app.get("/register", function (req, res) {
    res.render("register");
});

// Handling user signup
app.post("/register", function (req, res) {
    var username = req.body.username
    var password = req.body.password
    User.register(new User({ username: username }),
            password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render("register");
        }

        passport.authenticate("local")(
            req, res, function () {
            res.render("index");
        });
    });
});

//Showing login form
app.get("/login", function (req, res) {
    res.render("login");
});

// //Handling user login
app.post("/login", passport.authenticate("local", {
    failureRedirect: "/login"
}), function (req, res) {
    res.render('index.ejs');
});

//Handling user logout
app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
}

io.on('connection', (socket) =>
{
      console.log('Connected');
      socket.on('disconnect', () =>
      {
        console.log('Disconnected');
      });

      var count = 0;
    client.on('data', (data) =>
    {
        strData = parseInt(data.toString());
        console.log(parseInt(strData));

        let raweeg_fpzcz = fs.readFileSync('data/EEG-FPZ-CZ.json');
        let eeg_fpzcz = JSON.parse(raweeg_fpzcz);

        let raweeg_pzoz = fs.readFileSync('data/EEG-PZ-OZ.json');
        let eeg_pzoz = JSON.parse(raweeg_pzoz);

        let eog = fs.readFileSync('data/EOG.json');
        eog = JSON.parse(eog);

        let resp = fs.readFileSync('data/Resp-Oro-Nasal.json');
        resp = JSON.parse(resp);

        let emg = fs.readFileSync('data/EMG.json');
        emg = JSON.parse(emg);

        let temp = fs.readFileSync('data/Temp.json');
        temp = JSON.parse(temp);

        let rawpsd_fpzcz = fs.readFileSync('data/PSD-FPZCZ.json');
        let psd_fpzcz = JSON.parse(rawpsd_fpzcz);

        let rawpsd_pzoz = fs.readFileSync('data/PSD-PZOZ.json');
        let psd_pzoz = JSON.parse(rawpsd_pzoz);

        socket.emit('SleepStage',
            {stage: strData,
                eeg_fpzcz: eeg_fpzcz,
                eeg_pzoz: eeg_pzoz,
                eog:eog,
                resp:resp,
                emg:emg,
                psd_fpzcz:psd_fpzcz,
                psd_pzoz: psd_pzoz,
                temp:temp
            });

        MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          var dbo = db.db("mydb");

          var insert = {_id: count, data:eeg_fpzcz};

          let coll = dbo.collection('EEG-FPZ-CZ');
            coll.estimatedDocumentCount().then((countincoll) => {
                console.log("countincil is", countincoll);
                console.log("count is", count);

                coll.insert(insert, function (err, res) {
                  if (err) {
                      console.log("Updating");
                  }
                  else {
                      console.log("Number of epochs inserted: " + res.insertedCount);
                      db.close();
                  }
              });

                db.close();
            });
          count = count + 1;
        });
    });
});

const client = net.createConnection
({port: 14564 }, () =>
{
  console.log('Client connected to the server.');
  client.write('CLIENT: Hello this is the client!');
});

http.listen(8080, () => {
  console.log('listening on *:8080');
});