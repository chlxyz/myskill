import * as tf from '@tensorflow/tfjs';

let model = null;

export const loadModel = async () => {

  if (!model) {
    model = await tf.loadLayersModel('/tfjs2/model.json');
  }
  return model;
};
