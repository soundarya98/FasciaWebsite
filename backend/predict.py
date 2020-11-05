#!/usr/bin/env python3.6
import os
from models import get_model_cnn_crf_psg
import numpy as np
from utils import gen, chunker, WINDOW_SIZE, rescale_array
import tensorflow.compat.v1 as tf
tf.disable_v2_behavior()

import logging

os.environ['CUDA_VISIBLE_DEVICES'] = '-1'


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
                Y_pred = Y_pred.argmax(axis=-1)
        return Y_pred[0]

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
                    self.model = get_model_cnn_crf_psg(lr=0.0001)
                    file_path = "models/cnn_crf_model.ckpt"
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
    Y_pred = p.predict(file_path)
    q.put(Y_pred)

def main(q):
    func(q)
