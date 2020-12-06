#!/usr/bin/env python3.6
import os
from models import get_model_cnn_crf_psg, get_model_lstm
import numpy as np
from utils import rescale_array
import tensorflow.compat.v1 as tf
tf.disable_v2_behavior()

import logging
from vis import visualization, utils
# from keras import activations

os.environ['CUDA_VISIBLE_DEVICES'] = '-1'
mapping = {0: 'Wake', 1: 'N1', 2: 'N2', 3: 'N3', 4: 'REM'}
hyp = {0: 4, 1: 2, 2: 1, 3: 0, 4: 3}


class predict_single_epoch:
    def __init__(self):
        self.session = tf.Session()
        self.graph = tf.get_default_graph()
        # the folder in which the model and weights are stored
        self.model_folder = os.path.join(os.path.abspath("src"), "static")
        self.model = None
        self.test_dict = {}

        with self.graph.as_default():
            with self.session.as_default():
                logging.info("Predict network initialised")

    def predict(self, record):
        with self.graph.as_default():
            with self.session.as_default():
                indices = np.r_[0:6]
                X = np.transpose(np.transpose(self.test_dict[record]["x"])[indices][:][:])
                X = np.expand_dims(X, 0)
                X = np.expand_dims(X, 0)
                X = rescale_array(X)
                Y_pred = self.model.predict(X)

                all_rows = []
                print(Y_pred.shape)
                for i in range(len(Y_pred[0][0])):
                    row = {}
                    row["sleepstage"] = i
                    row["value"] = Y_pred[0][0][i]
                    all_rows.append(row)

                with open('../frontend/data/SleepProb.json', 'w') as f:
                    f.write(str(all_rows).replace('\'', '"').replace('None', 'null'))

                grads = visualization.visualize_saliency(self.model, -2, filter_indices=None, seed_input=X)
                # print("Predicted values", Y_pred)
                Y_pred = Y_pred.argmax(axis=-1)
        return grads, Y_pred[0]

    def load(self, test=None):
        """
        :param file_name: [model_file_name, weights_file_name]
        :return:
        """
        with self.graph.as_default():
            with self.session.as_default():
                try:
                    self.test_dict[test] = {}
                    data = np.load(test)
                    self.test_dict[test]["y"] = data["y"]
                    self.test_dict[test]["x"] = data["x"]
                    self.model = get_model_lstm()
                    file_path = "models/lstm-6.ckpt"
                    self.model.load_weights(file_path)
                    logging.info("Neural Network loaded: ")
                    return True

                except Exception as e:
                    logging.exception(e)
                    return False
def func(q):
    p = predict_single_epoch()
    file_path = 'data/epoch_custom.npz'
    p.load(file_path)
    grads, Y_pred = p.predict(file_path)

    dict_temp = {"grads": grads, "Y_pred": Y_pred[0]}
    q.put(dict_temp)

def main(q):
    func(q)
