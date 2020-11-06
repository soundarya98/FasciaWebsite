const net = require('net');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var fs = require('fs');
var ejs = require('ejs');
var express = require('express');

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/views'));
app.get("/", function(req, res)
{
    res.render("index.ejs")
});

io.on('connection', (socket) =>
{
      console.log('Connected');
      socket.on('disconnect', () =>
      {
        console.log('Disconnected');
      });

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