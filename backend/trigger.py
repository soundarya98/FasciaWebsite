import threading
import time
import queue as Queue
from time import sleep
from predict import func
import socket
import json
import numpy as np
import math
from time import gmtime, strftime
import os
import yasa
from scipy import signal
from mne.time_frequency import psd_array_multitaper
from yasa import sw_detect
import matplotlib.pyplot as plt
plt.rcParams["figure.figsize"] = (20,3)

os.environ['CUDA_VISIBLE_DEVICES'] = '-1'
os.environ["TZ"] = "US/Eastern"
qu = Queue.Queue()


def nodeserv(transfdata, cn):
    # tfdata = transfdata.values.tolist()
    tfdatajson = json.dumps(transfdata)
    cn.send(bytes(tfdatajson, encoding='utf8'))

def main():
    count = 600
    sn = socket.socket()
    hostn = 'localhost'
    portn = 14564
    sn.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sn.bind((hostn, portn))
    print('Server Started')
    sn.listen(5)
    cn, addrn = sn.accept()
    print('Got connection from', addrn)
    

    mapping = {0: 'Wake', 1: 'N1', 2: 'N2', 3: 'N3', 4: 'REM'}
    # hyp = {0: 4, 1: 2, 2: 1, 3: 0, 4: 3}
    channels = {0: 'EEG-FPZ-CZ', 1: 'EEG-PZ-OZ', 2: 'EOG', 3: 'Resp-Oro-Nasal', 4: 'EMG', 5: 'Temp'}

    npz_file = 'SleepEDF_NPZ/SC4001E0.npz'
    with np.load(npz_file) as f:
        data = f["x"]
        labels = f["y"]

    save_path = 'data/epoch_custom.npz'

    save_dict = {
        "x": data[count, :, :],
        "y": labels[count]}

    np.savez(save_path, **save_dict)

    while True:
        print("Epoch Number: ", count)
        save_dict = {
            'x': data[count, :, :],
            'y': labels[count]}
        np.savez(save_path, **save_dict)
        func(qu)
        dict_temp = qu.get()

        grads = dict_temp["grads"]
        sleepstage = dict_temp["Y_pred"]
        print("Sleep Stage is:"+str(sleepstage))

        json_data = data[count, :, :]

        from datetime import datetime
        now = datetime.now()
        print("now =", now)

        root_time = strftime("%b-%d-%Y %H:%M")

        just_time = strftime("%H:%M:%S")

        json_data_eeg_fpzcz = np.transpose(np.transpose(json_data)[0][:][:])
        json_data_eeg_pzoz = np.transpose(np.transpose(json_data)[1][:][:])

        json_data_eeg_fpzcz = json_data_eeg_fpzcz.reshape(3000, )
        json_data_eeg_pzoz = json_data_eeg_pzoz.reshape(3000, )

        plt.specgram(json_data_eeg_fpzcz, Fs=100, cmap='viridis')
        plt.ylabel('Frequency [Hz]')
        plt.xlabel('Time [sec]')
        plt.savefig('../frontend/views/eeg_fpzcz_specgram.png', bbox_inches='tight')


        sf = 100
        # Define window length (4 seconds)
        win = 4 * sf

        # Apply the detection using yasa.spindles_detect
        sp = yasa.spindles_detect(json_data_eeg_fpzcz, sf)

        sw = sw_detect(json_data_eeg_fpzcz, sf, include=(2, 3), freq_sw=(0.3, 2),
                       dur_neg=(0.3, 1.5), dur_pos=(0.1, 1), amp_neg=(40, 300),
                       amp_pos=(10, 150), amp_ptp=(75, 400), remove_outliers=False,
                       coupling=False, freq_sp=(12, 16))

        if sp is None:
            mask_spindles = np.zeros(len(json_data_eeg_fpzcz))
        else:
            mask_spindles = sp.get_mask()

        spindles_highlight = json_data_eeg_fpzcz * mask_spindles
        spindles_highlight[spindles_highlight == 0] = np.nan

        if sw is None:
            mask_sw = np.zeros(len(json_data_eeg_fpzcz))
        else:
            mask_sw = sw.get_mask()

        sw_highlight = json_data_eeg_fpzcz * mask_sw
        sw_highlight[sw_highlight == 0] = np.nan

        all_rows = []
        for i in range(len(json_data_eeg_fpzcz)):
            current_time = root_time + ':{}:{}0'.format(str(math.floor(i / 100)).zfill(2),
                                                    str(math.floor(i % 100)).zfill(2))
            current_time = "{}".format(current_time).replace('\'', '')
            row = {}
            row["date"] = current_time
            row["EEG_FPZ_CZ"] = json_data_eeg_fpzcz[i]
            if (np.isnan(spindles_highlight[i])):
                row["EEG_FPZ_CZ_Spindle"] = None
            else:
                row["EEG_FPZ_CZ_Spindle"] = json_data_eeg_fpzcz[i]

            if (np.isnan(sw_highlight[i])):
                row["EEG_FPZ_CZ_Slow Waves"] = None
            else:
                row["EEG_FPZ_CZ_Slow Waves"] = json_data_eeg_fpzcz[i]
            all_rows.append(row)

        with open('../frontend/data/EEG-FPZ-CZ.json', 'w') as f:
            f.write(str(all_rows).replace('\'', '"').replace('None', 'null'))


        # Apply the detection using yasa.spindles_detect
        sp = yasa.spindles_detect(json_data_eeg_pzoz, sf)

        sw = sw_detect(json_data_eeg_pzoz, sf, include=(2, 3), freq_sw=(0.3, 2),
                       dur_neg=(0.3, 1.5), dur_pos=(0.1, 1), amp_neg=(40, 300),
                       amp_pos=(10, 150), amp_ptp=(75, 400), remove_outliers=False,
                       coupling=False, freq_sp=(12, 16))

        if sp is None:
            mask_spindles = np.zeros(len(json_data_eeg_pzoz))
        else:
            mask_spindles = sp.get_mask()

        spindles_highlight = json_data_eeg_pzoz * mask_spindles
        spindles_highlight[spindles_highlight == 0] = np.nan

        if sw is None:
            mask_sw = np.zeros(len(json_data_eeg_pzoz))
        else:
            mask_sw = sw.get_mask()

        sw_highlight = json_data_eeg_pzoz * mask_sw
        sw_highlight[sw_highlight == 0] = np.nan

        all_rows = []
        for i in range(len(json_data_eeg_pzoz)):
            current_time = root_time + ':{}:{}0'.format(str(math.floor(i / 100)).zfill(2),
                                                    str(math.floor(i % 100)).zfill(2))
            current_time = "{}".format(current_time).replace('\'', '')
            row = {}
            row["date"] = current_time
            row["EEG_PZ_OZ"] = json_data_eeg_pzoz[i]
            if (np.isnan(spindles_highlight[i])):
                row["EEG_PZ_OZ_Spindle"] = None
            else:
                row["EEG_PZ_OZ_Spindle"] = json_data_eeg_pzoz[i]

            if (np.isnan(sw_highlight[i])):
                row["EEG_PZ_OZ_Slow Waves"] = None
            else:
                row["EEG_PZ_OZ_Slow Waves"] = json_data_eeg_pzoz[i]
            all_rows.append(row)

        with open('../frontend/data/EEG-PZ-OZ.json', 'w') as f:
            f.write(str(all_rows).replace('\'', '"').replace('None', 'null'))

        # EEG-FPZ-CZ-Grad
        all_rows = []
        for i in range(len(json_data_eeg_fpzcz)):
            current_time = root_time + ':{}:{}0'.format(str(math.floor(i / 100)).zfill(2),
                                                    str(math.floor(i % 100)).zfill(2))
            current_time = "{}".format(current_time).replace('\'', '')
            row = {}
            row["date"] = current_time
            row["EEG-FPZ-CZ"] = json_data_eeg_fpzcz[i]
            if (grads[0, i]<0.15):
                row["EEG-FPZ-CZ-Grad"] = None
            else:
                row["EEG-FPZ-CZ-Grad"] = json_data_eeg_fpzcz[i]

            all_rows.append(row)

        with open('../frontend/data/EEG-FPZ-CZ-Grad.json', 'w') as f:
            f.write(str(all_rows).replace('\'', '"').replace('None', 'null'))

        # EEG-PZ-OZ-Grad
        all_rows = []
        for i in range(len(json_data_eeg_pzoz)):
            current_time = root_time + ':{}:{}0'.format(str(math.floor(i / 100)).zfill(2),
                                                    str(math.floor(i % 100)).zfill(2))
            current_time = "{}".format(current_time).replace('\'', '')
            row = {}
            row["date"] = current_time
            row["EEG-PZ-OZ"] = json_data_eeg_pzoz[i]
            if (grads[0, i]<0.15):
                row["EEG-PZ-OZ-Grad"] = None
            else:
                row["EEG-PZ-OZ-Grad"] = json_data_eeg_pzoz[i]

            all_rows.append(row)

        with open('../frontend/data/EEG-PZ-OZ-Grad.json', 'w') as f:
            f.write(str(all_rows).replace('\'', '"').replace('None', 'null'))

        #Other channel grads
        for index in range(2, 6):
            json_data_tmp = np.transpose(np.transpose(json_data)[index][:][:])
            json_data_tmp = json_data_tmp.reshape(3000, )

            all_rows = []
            for i in range(len(json_data_tmp)):
                current_time = root_time + ':{}:{}0'.format(str(math.floor(i / 100)).zfill(2),
                                                            str(math.floor(i % 100)).zfill(2))
                current_time = "{}".format(current_time).replace('\'', '')
                row = {}
                row["date"] = current_time
                row[channels[index]] = json_data_tmp[i]
                if (grads[0, i] < 0.15):
                    row[channels[index]+"-Grad"] = None
                else:
                    row[channels[index]+"-Grad"] = json_data_tmp[i]
                all_rows.append(row)

            with open('../frontend/data/'+channels[index]+'-Grad.json', 'w') as f:
                f.write(str(all_rows).replace('\'', '"').replace('None', 'null'))

        #Normal non-EEG channels
        for index in range(2, 6):
            json_data_tmp = np.transpose(np.transpose(json_data)[index][:][:])
            json_data_tmp = json_data_tmp.reshape(3000, )

            all_rows = []
            for i in range(len(json_data_tmp)):
                current_time = root_time + ':{}:{}0'.format(str(math.floor(i / 100)).zfill(2),
                                                            str(math.floor(i % 100)).zfill(2))
                current_time = "{}".format(current_time).replace('\'', '')
                row = {}
                row["date"] = current_time
                row[channels[index]] = json_data_tmp[i]
                all_rows.append(row)

            with open('../frontend/data/'+channels[index]+'.json', 'w') as f:
                f.write(str(all_rows).replace('\'', '"').replace('None', 'null'))

        psd, freqs = psd_array_multitaper(json_data_eeg_fpzcz, sf, normalization='full', verbose=0)

        all_rows = []
        for i in range(len(freqs[:1801])): #Upto 60Hz (Elaborate)
            row = {}
            row["Frequencies"] = freqs[i]
            row["PSD"] = psd[i]
            all_rows.append(row)

        with open('../frontend/data/PSD-FPZCZ.json', 'w') as f:
            f.write(str(all_rows).replace('\'', '"'))

        psd, freqs = psd_array_multitaper(json_data_eeg_pzoz, sf, normalization='full', verbose=0)

        all_rows = []
        for i in range(len(freqs[:1801])):
            row = {}
            row["Frequencies"] = freqs[i]
            row["PSD"] = psd[i]
            all_rows.append(row)

        with open('../frontend/data/PSD-PZOZ.json', 'w') as f:
            f.write(str(all_rows).replace('\'', '"'))

        from scipy.fftpack import rfft, rfftfreq
        SAMPLE_RATE = 100
        DURATION = 30

        # Number of samples in normalized_tone
        N = SAMPLE_RATE * DURATION

        yf = rfft(json_data_eeg_fpzcz)
        xf = rfftfreq(N, 1 / SAMPLE_RATE)

        all_rows = []
        for i in range(len(xf)):
            row = {}
            row["x"] = xf[i]
            row["y"] = np.abs(yf[i])
            all_rows.append(row)

        with open('../frontend/data/FFT-FPZCZ.json', 'w') as f:
            f.write(str(all_rows).replace('\'', '"'))

        count_json = {}
        count_json["data"]=count

        with open('../frontend/data/count.json', 'w') as f:
            f.write(str(count_json).replace('\'', '"'))

        print("Sleepstage: ", mapping[sleepstage])

        row = {}
        row["time"] = just_time
        row["stage"] = sleepstage + 1
        print(row)
        with open('../frontend/data/sleepstage.json', 'w') as f:
            f.write(str(row).replace('\'', '"'))

        # nodeserv(hyp[int(sleepstage)], cn)
        nodeserv(int(sleepstage), cn)
        count += 1
        qu.task_done()
        cn.recv(2048) # When it recives 'next' signal from server.js, this gets unblocked 
    


if __name__ == "__main__":
    main()
