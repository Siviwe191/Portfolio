const surface = document.getElementById('demo');
const surfaceb = document.getElementById('demo2');

function getmodel(modeltype = ''){
return modeltype
}

async function plotClasses (pointsArray, classKey, size = 400, equalizeClassSizes = false,mtype = '') {
 const allSeries = {};
 // Add each class as a series
 pointsArray.forEach(p => {
   // Add each point to the series for the class it is in
   const seriesName = `${classKey}: ${p.class}`;
   let series = allSeries[seriesName];
   if (!series) {
     series = [];
     allSeries[seriesName] = series;
   }
   series.push(p);
 });

 if (equalizeClassSizes) {
   // Find smallest class
   let maxLength = null;
   Object.values(allSeries).forEach(series => {
     if (maxLength === null || series.length < maxLength && series.length >= 100) {
       maxLength = series.length;
     }
   });
   // Limit each class to number of elements of smallest class
   Object.keys(allSeries).forEach(keyName => {
     allSeries[keyName] = allSeries[keyName].slice(0, maxLength);
     if (allSeries[keyName].length < 100) {
       delete allSeries[keyName];
     }
   });
 }

 
 const series = ["Square feet", "Price"];
let tags;
if(mtype == 'heart_d_model') {
  tags = {
    name: 'RestingBP vs Cholesterol',
    xLab: 'Resting Blood Pressure',
    yLab: 'Cholesterol'
  }
}else if(mtype == 'house_p_model' || mtype == ''){
  tags = {
    name: 'Square feet vs House Price',
    xLab: 'Square feet',
    yLab: 'Price'
  }
}
const data = { name: tags.name,values: Object.values(allSeries), series: Object.keys(allSeries)}
tfvis.render.scatterplot(surface, data,{
   xLabel: tags.xLab,
   yLabel: tags.yLab,
   height: size,
   width: size * 1.5,
});
}

async function plot(pointsArray, featureName, predictedPointsArray = null) {
 const values = [pointsArray.slice(0, 1000)];
 const series = ["original"];
 if (Array.isArray(predictedPointsArray)) {
   values.push(predictedPointsArray);
   series.push("predicted");
 }

 tfvis.render.scatterplot(
   { name: `${featureName} vs House Price` },
   { values, series },
   {
     xLabel: featureName,
     yLabel: "Price",
     height: 300,
   }
 )
}

async function plotPredictionHeatmap(name = "Predicted class", size = 400,mtype = '') {
 const [ valuesPromise, xTicksPromise, yTicksPromise ] = tf.tidy(() => {
   const gridSize = 50;
   const predictionColumns = [];
   for (let colIndex = 0; colIndex < gridSize; colIndex++) {
     // Loop for each column, starting from the left
     const colInputs = [];
     const x = colIndex / gridSize;
     for (let rowIndex = 0; rowIndex < gridSize; rowIndex++) {
       // Loop for each row, starting from the top
       const y = (gridSize - rowIndex)/ gridSize;
       colInputs.push([x, y]);
     }

     const colPredictions = model.predict(tf.tensor2d(colInputs));
     predictionColumns.push(colPredictions);
   }
   const valuesTensor = tf.stack(predictionColumns);

   const normalisedTicksTensor = tf.linspace(0, 1, gridSize);
   const xTicksTensor = denormalise(normalisedTicksTensor,
     normalisedFeature.min[0], normalisedFeature.max[0]);
   const yTicksTensor = denormalise(normalisedTicksTensor.reverse(),
     normalisedFeature.min[1], normalisedFeature.max[1]);

   return [ valuesTensor.array(), xTicksTensor.array(), yTicksTensor.array() ];
 });

 const values = await valuesPromise;
 const xTicks = await xTicksPromise;
 const yTicks = await yTicksPromise;
 let tags;
  if(mtype == 'heart_d_model') {
    tags = {
      suffix: 'bp',
      xLab: '',
      yLab: ''
    }
  }else if(mtype == 'house_p_model' || mtype == ''){
    tags = {
      suffix: 'k sqft',
      xLab: '$',
      yLab: 'k'
    }
  }
 const xTickLabels = xTicks.map(v => (v).toFixed(1));
 const yTickLabels = yTicks.map(v => (v).toFixed(0));
 const data = {
   values,
   xTickLabels,
   yTickLabels,
 };

 tfvis.render.heatmap(surfaceb, data,{ height: size });
 tfvis.render.heatmap({
   name: `${name} (full domain)`,
   tab: "Predictions"
 }, data, { height: size, domain: [0, 1] });
}

function normalise(tensor, previousMin = null, previousMax = null) {
 const featureDimensions = tensor.shape.length > 1 && tensor.shape[1];

 if (featureDimensions && featureDimensions > 1) {
   // More than one feature

   // Split into separate tensors
   const features = tf.split(tensor, featureDimensions, 1);

   // Normalise and find min/max values for each feature
   const normalisedFeatures = features.map((featureTensor, i) =>
     normalise(featureTensor,
       previousMin ? previousMin[i] : null,
       previousMax ? previousMax[i] : null,
     )
   );

   // Prepare return values
   const returnTensor = tf.concat(normalisedFeatures.map(f => f.tensor), 1);
   const min = normalisedFeatures.map(f => f.min);
   const max = normalisedFeatures.map(f => f.max);

   return { tensor: returnTensor, min, max };
 }
 else {
   // Just one feature
   const min = previousMin || tensor.min();
   const max = previousMax || tensor.max();
   const normalisedTensor = tensor.sub(min).div(max.sub(min));
   return {
     tensor: normalisedTensor,
     min,
     max
   };
 }
}

function denormalise(tensor, min, max) {
 const featureDimensions = tensor.shape.length > 1 && tensor.shape[1];

 if (featureDimensions && featureDimensions > 1) {
   // More than one feature

   // Split into separate tensors
   const features = tf.split(tensor, featureDimensions, 1);

   const denormalised = features.map((featureTensor, i) => denormalise(featureTensor, min[i], max[i]));

   const returnTensor = tf.concat(denormalised, 1);
   return returnTensor;
 }
 else {
   // Just one feature
   const denormalisedTensor = tensor.mul(max.sub(min)).add(min);
   return denormalisedTensor;
 }
}

let model;
function createModel () {
 model = tf.sequential();

 model.add(tf.layers.dense({
   units: 10,
   useBias: true,
   activation: 'sigmoid',
   inputDim: 2,
 }));
 model.add(tf.layers.dense({
   units: 10,
   useBias: true,
   activation: 'sigmoid',
 }));
 model.add(tf.layers.dense({
   units: 1,
   useBias: true,
   activation: 'sigmoid',
 }));

 const optimizer = tf.train.adam();
 model.compile({
   loss: 'binaryCrossentropy',
   optimizer,
 })

 return model;
}

async function trainModel (model, trainingFeatureTensor, trainingLabelTensor) {

 const { onBatchEnd, onEpochEnd } = tfvis.show.fitCallbacks(
   { name: "Training Performance" },
   ['loss']
 )

 return model.fit(trainingFeatureTensor, trainingLabelTensor, {
   batchSize: 32,
   epochs: 2000,
   validationSplit: 0.2,
   callbacks: {
     onEpochEnd,
     onEpochBegin: async function () {
       await plotPredictionHeatmap();
       const layer = model.getLayer(undefined, 0);
       tfvis.show.layer({ name: "Layer 1" }, layer);
     }
   }
 });
}

async function predict (mtype = '') {
 const predictionInputOne = parseInt(document.getElementById("prediction-input-1").value);
 const predictionInputTwo = parseInt(document.getElementById("prediction-input-2").value);
 if (isNaN(predictionInputOne) || isNaN(predictionInputTwo)) {
  Swal.fire({
    icon: 'warning',
    title: 'Alert',
    text: 'Please enter a valid number',
  })
 }
 else if (predictionInputOne < 1) {
   Swal.fire({
    icon: 'warning',
    title: 'Alert',
    text: 'Please enter a value above 0',
  })
 }
 else if (predictionInputTwo < 1) {
   Swal.fire({
    icon: 'warning',
    title: 'Alert',
    text: 'Please enter a value above 0',
  })
 }
 else {
   tf.tidy(() => {
     const inputTensor = tf.tensor2d([[predictionInputOne, predictionInputTwo]]);
     const normalisedInput = normalise(inputTensor, normalisedFeature.min, normalisedFeature.max);
     const normalisedOutputTensor = model.predict(normalisedInput.tensor);
     const outputTensor = denormalise(normalisedOutputTensor, normalisedLabel.min, normalisedLabel.max);
     const outputValue = outputTensor.dataSync()[0];
     const outputValuePercent = (outputValue*100).toFixed(1);
     let tags;
     if(mtype == 'heart_d_model') {
      tags = {
        predmessage: 'The likelihood of heart disease is'
      }
    }else if(mtype == 'house_p_model' || mtype == ''){
      tags = {
        predmessage: 'The likelihood of being a waterfront property is'
      }
    }
     document.getElementById("prediction-output").innerHTML = `${tags.predmessage}<br>`
       + `<span style="font-size: 2em">${outputValuePercent}%</span>`;
   });
 }
}

const storageID = "kc-house-price-binary";
async function save () {
 const saveResults = await model.save(`localstorage://${storageID}`);
 document.getElementById("model-status").innerHTML = `Trained (saved ${saveResults.modelArtifactsInfo.dateSaved})`;
}

async function load (mtype='') {
 if(mtype == 'heart_d_model') {
    tags = {
      skey: 'https://siviwesportfolio.co.za/heartdisease-model.json'
    }
  }else if(mtype == 'house_p_model' || mtype == ''){
    tags = {
      skey: 'https://siviwesportfolio.co.za/model.json'
    }
  }
  const storageKey = tags.skey;
  
  const models = await tf.io.listModels();
  const modelInfo = models[storageKey];
  console.log(modelInfo)
  if (storageKey) {
    model = await tf.loadLayersModel(storageKey);

    await plotPredictionHeatmap('','',mtype);
    tfvis.show.modelSummary({ name: "Model summary" }, model);
    const layer = model.getLayer(undefined, 0);
    tfvis.show.layer({ name: "Layer 1" }, layer);

    document.getElementById("predict-button").removeAttribute("disabled");
  }
  else {
    alert("Could not load: no saved model found");
  }
}

async function test () {
 const lossTensor = model.evaluate(testingFeatureTensor, testingLabelTensor);
 const loss = (await lossTensor.dataSync())[0];
 console.log(`Testing set loss: ${loss}`);

 document.getElementById("testing-status").innerHTML = `Testing set loss: ${loss.toPrecision(5)}`;
}

async function train () {
 // Disable all buttons and update status
 ["train", "test", "load", "predict", "save"].forEach(id => {
   document.getElementById(`${id}-button`).setAttribute("disabled", "disabled");
 });
 document.getElementById("model-status").innerHTML = "Training...";

 const model = createModel();
 tfvis.show.modelSummary({ name: "Model summary" }, model);
 const layer = model.getLayer(undefined, 0);
 tfvis.show.layer({ name: "Layer 1" }, layer);

 const result = await trainModel(model, trainingFeatureTensor, trainingLabelTensor);
 await plotPredictionHeatmap();
 console.log(result);
 const trainingLoss = result.history.loss.pop();
 console.log(`Training set loss: ${trainingLoss}`);
 const validationLoss = result.history.val_loss.pop();
 console.log(`Validation set loss: ${validationLoss}`);

 document.getElementById("model-status").innerHTML = "Trained (unsaved)\n"
   + `Loss: ${trainingLoss.toPrecision(5)}\n`
   + `Validation loss: ${validationLoss.toPrecision(5)}`;
 document.getElementById("test-button").removeAttribute("disabled");
 document.getElementById("save-button").removeAttribute("disabled");
 document.getElementById("predict-button").removeAttribute("disabled");
}

async function plotParams(weight, bias) {
 model.getLayer(null, 0).setWeights([
   tf.tensor2d([[weight]]), // Kernel (input multiplier)
   tf.tensor1d([bias]), // Bias
 ])
 await plotPredictionLine();
 const layer = model.getLayer(undefined, 0);
 tfvis.show.layer({ name: "Layer 1" }, layer);
}

async function toggleVisor () {
 tfvis.visor().toggle();
}

let points;
let normalisedFeature, normalisedLabel;
let trainingFeatureTensor, testingFeatureTensor, trainingLabelTensor, testingLabelTensor;
let modeltype = getmodel();
async function run (mtype= '') {
 // Import from CSV
 let tags;
 if(mtype == 'heart_d_model') {
  tags = {
    csvfile: './heart.csv'
 
  }
}else if(mtype == 'house_p_model' || mtype == ''){
  tags = {
    csvfile: './kc_house_data.csv'
 
  }
}
 const houseSalesDataset = tf.data.csv(tags.csvfile);
console.log(houseSalesDataset)
 // Extract x and y values to plot
 const pointsDataset = houseSalesDataset.map(record => ({
   x: (mtype == 'house_p_model' || mtype == '') ? record.sqft_living : record.RestingBP,
   y: (mtype == 'house_p_model' || mtype == '') ? record.price : record.Cholesterol,
   class: (mtype == 'house_p_model' || mtype == '') ? record.waterfront : record.HeartDisease,
 }));
 points = await pointsDataset.toArray();
 if(points.length % 2 !== 0) {
   points.pop();
 }console.log(points);
 tf.util.shuffle(points);
let classes;
 (mtype == 'house_p_model' || mtype == '') ? classes = 'Waterfront':  classes = 'Heart Disease';
 plotClasses(points, classes,400,false,mtype);

 // Extract Features (inputs)
 const featureValues = points.map(p => [p.x, p.y]);
 const featureTensor = tf.tensor2d(featureValues);

 // Extract Labels (outputs)
 const labelValues = points.map(p => p.class);
 const labelTensor = tf.tensor2d(labelValues, [labelValues.length, 1]);

 // Normalise features and labels
 normalisedFeature = normalise(featureTensor);
 normalisedLabel = normalise(labelTensor);
 featureTensor.dispose();
 labelTensor.dispose();

 [trainingFeatureTensor, testingFeatureTensor] = tf.split(normalisedFeature.tensor, 2);
 [trainingLabelTensor, testingLabelTensor] = tf.split(normalisedLabel.tensor, 2);

 document.getElementById("load-button").removeAttribute("disabled");
}
async function displayModelSummary() {
  const storageKey = 'file://model.json';
   const models = await tf.io.listModels();
   const modelInfo = models[storageKey];
const model = await tf.loadLayersModel(storageKey); 
const modelSummary = model.summary();
$("#demo2").html(modelSummary);

}
run(modeltype);
