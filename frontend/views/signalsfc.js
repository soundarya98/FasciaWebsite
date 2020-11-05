let fusionDataStore = new FusionCharts.DataStore();
const socket = io();
socket.on('SleepStage', function (fulldata) {
    var eeg=fulldata.eeg
    let fusionTable_eeg = fusionDataStore.createDataTable(eeg, schema_eeg);
    new FusionCharts({
        type: 'timeseries',
        renderAt: 'EEG',
        width: "100%",
        height: 300,
        dataSource: {
            data: fusionTable_eeg,
            caption: {
                text: 'EEG FPZ-CZ and EEG PZ-OZ'
            },
            series: "Type",
            yAxis: {
                "plot": {
                    "value": "Voltage",
                    "type": "Signal"
                }
            }
        }
    }).render()

    var eog=fulldata.eog
    let fusionTable_eog = fusionDataStore.createDataTable(eog, schema_signals);
    new FusionCharts({
        type: 'timeseries',
        renderAt: 'EOG',
        width: "100%",
        height: 300,
        dataSource: {
            data: fusionTable_eog,
            caption: {
                text: 'EOG'
            },
            yAxis: {
                "plot": {
                    "value": "Voltage",
                    "type": "Signal"
                }
            }
        }
    }).render()

    var emg=fulldata.emg
    let fusionTable_emg = fusionDataStore.createDataTable(emg, schema_signals);
    new FusionCharts({
        type: 'timeseries',
        renderAt: 'EMG',
        width: "100%",
        height: 300,
        dataSource: {
            data: fusionTable_emg,
            caption: {
                text: 'EMG'
            },
            yAxis: {
                "plot": {
                    "value": "Voltage",
                    "type": "Signal"
                }
            }
        }
    }).render()

    var resp=fulldata.resp
    let fusionTable_resp = fusionDataStore.createDataTable(resp, schema_signals);
    new FusionCharts({
        type: 'timeseries',
        renderAt: 'Resp-oro-nasal',
        width: "100%",
        height: 300,
        dataSource: {
            data: fusionTable_resp,
            caption: {
                text: 'Resp-Oro-Nasal'
            },
            yAxis: {
                "plot": {
                    "value": "Voltage",
                    "type": "Signal"
                }
            }
        }
    }).render()
});