// Neural Network with Tensorflow.js
/**
 * tf.sequential (config?)
 * Creates a tf.Sequential model. A sequential model is any model where the outputs of one layer are the inputs to the next layer, i.e. the model topology is a simple 'stack' of layers, with no branching or skipping.
 */
/**
 * tf.tidy (nameOrFn, fn?)
 * Executes the provided function fn and after it is executed, cleans up all intermediate tensors allocated by fn except those returned by fn. 
 */
class NeuralNetwork {
    // Variable names are like this because they can be anything.
    constructor (a, b, c, d) {
        if (a instanceof tf.Sequential) {   // Check for model object.
            this.model = a;   // The model itself comes as an input.
            this.input_nodes = b;
            this.hidden_nodes = c;
            this.output_nodes = d;
        } else {
            this.input_nodes = a;
            this.hidden_nodes = b;
            this.output_nodes = c;
            this.model = this.createModel();
        }
    } // End of constructor.

    /**
     * API's: createModel, predict, dispose, mutate and copy.
     */
    createModel () {
        const model = tf.sequential();  // Creates a tf.Sequential model.
        const hidden_layer = tf.layers.dense({
            units: this.hidden_nodes,
            inputShape: [this.input_nodes],  // This argument goes as a array.
            activation: 'sigmoid'
        });   // Creates first hidden layer along with input layer.
        
        model.add(hidden_layer);   // Add the layer to the model.

        // No need to pass the input shape. Tensorflow automatically infers.
        const output_layer = tf.layers.dense({
            units: this.output_nodes,
            activation: 'sigmoid'
        });   // Create the last output layer.

        model.add(output_layer);   // Add the layer to the model.

        return model;
    }  // End of createModel function.

    predict (inputs) {
        const y = tf.tidy(() => {   // Will clean the tensors after processing.
            const xs = tf.tensor2d([inputs]);  // Converting 1-d array to 2-d array for tensor processing.
            const ys = this.model.predict(xs);   // Our model will predict the result.
            // Now ys are in GPU. We need to extract these values from there.
            const outputs = ys.dataSync();   //Synchronously downloads the values from the tf.Tensor. This blocks the UI thread until the values are ready, which can cause performance issues.
            return outputs;   // Prediction results.
        });
        return y;
    } // End of predict function.

    dispose () {
        this.model.dispose();
    }  // End of dispose function.

    copy () {
        const y = tf.tidy(() => {
            const model_copy = this.createModel();   // Creating similar structure copy of the model.
            const weights = this.model.getWeights();  // Returns the current values of the weights of the layer. Returns tf.Tensor.
            const weight_copies = [];
            for (let i = 0; i < weights.length; i++)
                weight_copies[i] = weights[i].clone();  // Creates a new tensor with the same values and shape as the specified tensor.
            model_copy.setWeights(weight_copies); // Sets the weights of the layer, from Tensors.
            return new NeuralNetwork(model_copy, this.input_nodes, this.hidden_nodes, this.output_nodes);
        });   // End of tidy anonymous function.
        return y;
    }  // End of copy function.

    mutate (mutation_rate) {
        // We are supposed to mutate the tensor weights which are in GPU.
        tf.tidy(() => {
            const weights = this.model.getWeights();   // Get the weights from tensors.
            const mutated_weights = [];
            for (let i = 0; i < weights.length; i++) {
                let tensor = weights[i];
                let shape = tensor.shape;
                let values = tensor.dataSync().slice();  // Extract tensor from GPU and create a copy of it.
                for (let j = 0; j < values.length; j++) {
                    if (random(1) < mutation_rate) {
                        let t = values[j];
                        // values[j] = t + randomGaussian(); 
                        // values[j] = t + random(-0.5, 0.5); 
                        values[j] = t + random(-1, 1); 
                    }
                }  // End of j loop.
                let newTensor = tf.tensor(values, shape);
                mutated_weights[i] = newTensor;
            }  // End of i for loop.
            this.model.setWeights(mutated_weights);
        });  // End of tidy anonymous function.
    }   // End of mutate function.
}  // End of class.