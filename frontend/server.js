const net = require('net');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var fs = require('fs');
var ejs = require('ejs');
var express = require('express');

let rawschema_eeg = fs.readFileSync('schema/schema_eeg.json');
let schema_eeg = JSON.parse(rawschema_eeg);

let rawschema_signals = fs.readFileSync('schema/schema_signals.json');
let schema_signals = JSON.parse(rawschema_signals);

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/views'));
app.get("/", function(req, res)
{
    res.render("index.ejs", {schema_eeg:schema_eeg, schema_signals:schema_signals})
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

        let eeg = fs.readFileSync('data/EEG.json');
        eeg = JSON.parse(eeg);

        let eog = fs.readFileSync('data/EOG.json');
        eog = JSON.parse(eog);

        let resp = fs.readFileSync('data/Resp-Oro-Nasal.json');
        resp = JSON.parse(resp);

        let emg = fs.readFileSync('data/EMG.json');
        emg = JSON.parse(emg);

        let temp = fs.readFileSync('data/Temp.json');
        temp = JSON.parse(temp);

        let rawpsd = fs.readFileSync('data/PSD-FPZCZ.json');
        let psd = JSON.parse(rawpsd);

        let rawpsd_pzoz = fs.readFileSync('data/PSD-PZOZ.json');
        let psd_pzoz = JSON.parse(rawpsd_pzoz);

        let rawspindles_fpzcz = fs.readFileSync('data/Spindles-FPZCZ.json');
        let spindles_fpzcz = JSON.parse(rawspindles_fpzcz);

        let rawspindles_pzoz = fs.readFileSync('data/Spindles-PZOZ.json');
        let spindles_pzoz = JSON.parse(rawspindles_pzoz);

        socket.emit('SleepStage',
            {stage: strData,
                eeg:eeg,
                eog:eog,
                resp:resp,
                emg:emg,
                psd:psd,
                psd_pzoz: psd_pzoz,
                spindles_fpzcz: spindles_fpzcz,
                spindles_pzoz: spindles_pzoz,
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