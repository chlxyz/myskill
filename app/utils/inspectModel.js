import { loadModel } from './loadModel';

export const inspectModel = async () => {
  const model = await loadModel();
  
  // Log model summary
  console.log('Model Summary:');
  model.layers.forEach((layer, index) => {
    console.log(`Layer ${index + 1}: ${layer.name}`);
    console.log(`Type: ${layer.constructor.name}`);
    console.log(`Input Shape: ${layer.inputShape}`);
    console.log(`Output Shape: ${layer.outputShape}`);
    console.log(`Config: ${JSON.stringify(layer.getConfig(), null, 2)}`);
  });
};

// Call the function to inspect the model
inspectModel();
