const net = require('net');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var fs = require('fs');
var ws = fs.createWriteStream("exported_data.csv");
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
        }
    })
    res.render("home");
});

// Showing main interface
app.get("/index", isLoggedIn, function (req, res) {
    res.render("index", { username: req.user.username });
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
            res.render("index", { username: req.user.username });
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
    res.render('index.ejs', { username: req.user.username });
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

  //data contains the sleep stage
    client.on('data', (data) =>
    {
        strData = parseInt(data.toString());
        console.log(parseInt(strData));

        let rawsleepstage = fs.readFileSync('data/sleepstage.json');
        let sleepstage = JSON.parse(rawsleepstage);

        let rawsleepprob = fs.readFileSync('data/SleepProb.json');
        let sleepprob = JSON.parse(rawsleepprob);

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

        let raweeg_fpzcz_grad = fs.readFileSync('data/EEG-FPZ-CZ-Grad.json');
        let eeg_fpzcz_grad = JSON.parse(raweeg_fpzcz_grad);

        let raweeg_pzoz_grad = fs.readFileSync('data/EEG-PZ-OZ-Grad.json');
        let eeg_pzoz_grad = JSON.parse(raweeg_pzoz_grad);

        let raweog_grad = fs.readFileSync('data/EOG-Grad.json');
        let eog_grad = JSON.parse(raweog_grad);

        let rawresp_grad = fs.readFileSync('data/Resp-Oro-Nasal-Grad.json');
        let resp_grad = JSON.parse(rawresp_grad);

        let rawemg_grad = fs.readFileSync('data/EMG-Grad.json');
        let emg_grad = JSON.parse(rawemg_grad);

        let rawtemp_grad = fs.readFileSync('data/Temp-Grad.json');
        let temp_grad = JSON.parse(rawtemp_grad);

        let rawpsd_fpzcz = fs.readFileSync('data/PSD-FPZCZ.json');
        let psd_fpzcz = JSON.parse(rawpsd_fpzcz);

        let rawpsd_pzoz = fs.readFileSync('data/PSD-PZOZ.json');
        let psd_pzoz = JSON.parse(rawpsd_pzoz);

        let rawfft_fpzcz = fs.readFileSync('data/FFT-FPZCZ.json');
        let fft_fpzcz = JSON.parse(rawfft_fpzcz);

        socket.emit('SleepStage',
            {
                psd_fpzcz: psd_fpzcz,
                psd_pzoz: psd_pzoz,
                sleepprob: sleepprob,
                stage: sleepstage,
                eeg_fpzcz: eeg_fpzcz,
                eeg_pzoz: eeg_pzoz,
                eeg_fpzcz_grad: eeg_fpzcz_grad,
                eeg_pzoz_grad: eeg_pzoz_grad,
                eog_grad: eog_grad,
                resp_grad: resp_grad,
                emg_grad: emg_grad,
                temp_grad: temp_grad,
                eog:eog,
                resp:resp,
                emg:emg,
                fft_fpzcz: fft_fpzcz,
                temp:temp
            });

        MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          var dbo = db.db("FASCIA");

          let raw_count = fs.readFileSync('data/count.json');
          let  count = JSON.parse(raw_count);
          count = count.data;
          console.log("count is", count);

          var insert = {_id: count, EEG_FPZ_CZ:eeg_fpzcz, EEG_PZ_OZ:eeg_pzoz, EOG:eog, Resp_Oro_Nasal:resp, EMG:emg, Temp:temp};

          let coll = dbo.collection('UserData');

            coll.insert(insert, function (err, res) {
              if (err) {
                  console.log("Updating");
              }
              else {
                  console.log("Number of epochs inserted: " + res.insertedCount);
                  db.close();
              }
          });
        });
    });

    socket.on('Updated', (data) =>
    {
        let rawsleepstage = fs.readFileSync('data/sleepstage.json');
        let sleepstage = JSON.parse(rawsleepstage);

        let rawsleepprob = fs.readFileSync('data/SleepProb.json');
        let sleepprob = JSON.parse(rawsleepprob);

        // console.log(sleepprob);

        let raweeg_fpzcz = fs.readFileSync('data/EEG-FPZ-CZ.json');
        let eeg_fpzcz = JSON.parse(raweeg_fpzcz);

        let raweeg_pzoz = fs.readFileSync('data/EEG-PZ-OZ.json');
        let eeg_pzoz = JSON.parse(raweeg_pzoz);

        let raweeg_fpzcz_grad = fs.readFileSync('data/EEG-FPZ-CZ-Grad.json');
        let eeg_fpzcz_grad = JSON.parse(raweeg_fpzcz_grad);

        let raweeg_pzoz_grad = fs.readFileSync('data/EEG-PZ-OZ-Grad.json');
        let eeg_pzoz_grad = JSON.parse(raweeg_pzoz_grad);

        let raweog_grad = fs.readFileSync('data/EOG-Grad.json');
        let eog_grad = JSON.parse(raweog_grad);

        let rawresp_grad = fs.readFileSync('data/Resp-Oro-Nasal-Grad.json');
        let resp_grad = JSON.parse(rawresp_grad);

        let rawemg_grad = fs.readFileSync('data/EMG-Grad.json');
        let emg_grad = JSON.parse(rawemg_grad);

        let rawtemp_grad = fs.readFileSync('data/Temp-Grad.json');
        let temp_grad = JSON.parse(rawtemp_grad);

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

        let rawfft_fpzcz = fs.readFileSync('data/FFT-FPZCZ.json');
        let fft_fpzcz = JSON.parse(rawfft_fpzcz);

        socket.emit('SleepStage',
            {
                psd_fpzcz: psd_fpzcz,
                psd_pzoz: psd_pzoz,
                sleepprob: sleepprob,
                stage: sleepstage,
                eeg_fpzcz: eeg_fpzcz,
                eeg_pzoz: eeg_pzoz,
                eeg_fpzcz_grad: eeg_fpzcz_grad,
                eeg_pzoz_grad: eeg_pzoz_grad,
                eog_grad: eog_grad,
                resp_grad: resp_grad,
                emg_grad: emg_grad,
                temp_grad: temp_grad,
                eog:eog,
                resp:resp,
                emg:emg,
                fft_fpzcz: fft_fpzcz,
                temp:temp
            });
    });

    socket.on('Download', (data) => {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;

            var dbo = db.db("FASCIA");
            dbo.collection("UserData").find({}).toArray(function (err, result) {
                if (err) throw err;
                // console.log(result);
                socket.emit('DownloadResponse', {result});
                db.close();
            });

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