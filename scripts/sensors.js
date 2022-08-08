
const AccelerationStates = {
  Stationary: 'Stationary',
  Accelerate: 'Accelerate',
  Decelerate: 'Decelerate'
};

const AccelerationThreshold = 1;
const DecelerationThreshold = AccelerationThreshold / 3;
const AccelerationMax = AccelerationThreshold * 2;
const AccelerationThresholdCount = 3;


const Direction = {
  Undefined: 'Undefined',
  Forwards: 'Forwards',
  Backwards: 'Backwards',
};

var accelerationState = AccelerationStates.Stationary;
var currentDirection = Direction.Undefined;

// ---------------

class ExponentialMovingAverage {
	constructor(alpha, mean) {
		this.alpha = alpha;
		this.mean = !mean ? 0 : mean;
	}

	get beta() {
		return 1 - this.alpha;
	}

  get filtered() {
		return this.mean;
	}

	update(newValue) {
		const redistributedMean = this.beta * this.mean;
		const meanIncrement = this.alpha * newValue;
		const newMean = redistributedMean + meanIncrement;
		this.mean = newMean;
	}
}

let smoothAx =  new ExponentialMovingAverage(0.7);
let smoothAy =  new ExponentialMovingAverage(0.7);
let smoothAz =  new ExponentialMovingAverage(0.7);

// ---------------


var rotationRateSeries1 = new TimeSeries();
var rotationRateSeries2 = new TimeSeries();
var rotationRateSeries3 = new TimeSeries();

var accelerationSeries1 = new TimeSeries();
var accelerationSeries2 = new TimeSeries();
var accelerationSeries3 = new TimeSeries();

var orientationSeries1 = new TimeSeries();
var orientationSeries2 = new TimeSeries();
var orientationSeries3 = new TimeSeries();

function createTimeline() {

  var rotationRateChart = new SmoothieChart({ responsive: true, scrollBackwards: false });
  rotationRateChart.addTimeSeries(rotationRateSeries1, { strokeStyle: 'rgba(255, 0, 0, 1)', fillStyle: 'rgba(255, 0, 0, 0.2)', lineWidth: 3 });
  rotationRateChart.addTimeSeries(rotationRateSeries2, { strokeStyle: 'rgba(0, 255, 0, 1)', fillStyle: 'rgba(0, 255, 0, 0.2)', lineWidth: 3 });
  rotationRateChart.addTimeSeries(rotationRateSeries3, { strokeStyle: 'rgba(0, 0, 255, 1)', fillStyle: 'rgba(0, 0, 255, 0.2)', lineWidth: 3 });
  rotationRateChart.streamTo(document.getElementById("rotation-rate-chart"), 500);

  var accelerationChart = new SmoothieChart({ responsive: true, scrollBackwards: false });
  accelerationChart.addTimeSeries(accelerationSeries1, { strokeStyle: 'rgba(255, 0, 0, 1)', fillStyle: 'rgba(255, 0, 0, 0.2)', lineWidth: 3 });
  accelerationChart.addTimeSeries(accelerationSeries2, { strokeStyle: 'rgba(0, 255, 0, 1)', fillStyle: 'rgba(0, 255, 0, 0.2)', lineWidth: 3 });
  accelerationChart.addTimeSeries(accelerationSeries3, { strokeStyle: 'rgba(0, 0, 255, 1)', fillStyle: 'rgba(0, 0, 255, 0.2)', lineWidth: 3 });
  accelerationChart.streamTo(document.getElementById("acceleration-chart"), 500);

  var orientationChart = new SmoothieChart({ maxValue: 9.81, minValue: -9.81, responsive: true, scrollBackwards: false });
  orientationChart.addTimeSeries(orientationSeries1, { strokeStyle: 'rgba(255, 0, 0, 1)', fillStyle: 'rgba(255, 0, 0, 0.2)', lineWidth: 3 });
  orientationChart.addTimeSeries(orientationSeries2, { strokeStyle: 'rgba(0, 255, 0, 1)', fillStyle: 'rgba(0, 255, 0, 0.2)', lineWidth: 3 });
  orientationChart.addTimeSeries(orientationSeries3, { strokeStyle: 'rgba(0, 0, 255, 1)', fillStyle: 'rgba(0, 0, 255, 0.2)', lineWidth: 3 });
  orientationChart.streamTo(document.getElementById("orientation-chart"), 500);

}

function requestPermission() {

  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    // Handle iOS 13+ devices.
    DeviceMotionEvent.requestPermission()
      .then((state) => {
        if (state === 'granted') {
          window.addEventListener('devicemotion', handleMotion);
        } else {
          console.error('Request to access the orientation was rejected');
        }
      })
      .catch(console.error);
  } else {
    // Handle regular non iOS 13+ devices.
    window.addEventListener('devicemotion', handleMotion);
  }
}

function handleMotion(event) {

  var now = Date.now();

  smoothAx.update(event.acceleration.x);
  smoothAy.update(event.acceleration.y);
  smoothAz.update(event.acceleration.z);

  rotationRateSeries1.append(now, event.rotationRate.alpha);
  rotationRateSeries2.append(now, event.rotationRate.beta);
  rotationRateSeries3.append(now, event.rotationRate.gamma);

  accelerationSeries1.append(now, smoothAx.filtered);
  accelerationSeries2.append(now, smoothAy.filtered);
  accelerationSeries3.append(now, smoothAz.filtered);
  /*
  accelerationSeries1.append(now, event.acceleration.x);
  accelerationSeries2.append(now, event.acceleration.y);
  accelerationSeries3.append(now, event.acceleration.z);
*/

  orientationSeries1.append(now, event.accelerationIncludingGravity.x - event.acceleration.x);
  orientationSeries2.append(now, event.accelerationIncludingGravity.y - event.acceleration.y);
  orientationSeries3.append(now, event.accelerationIncludingGravity.z - event.acceleration.z);

  updateState(event);

}

function updateState(event) {

  var newValue = event.acceleration.z;
  // implement a crude schmitt trigger
 

  //console.log(newValue);

  switch (accelerationState) {

    case AccelerationStates.Stationary:

      if (Math.abs(newValue) >= AccelerationThreshold) {
        newValue = newValue >= 0 ? AccelerationMax : -AccelerationMax;
      }
      else {
        newValue = 0;
      }

      if (Math.abs(newValue) == AccelerationMax) {
        currentDirection = newValue < 0 ? Direction.Forwards : Direction.Backwards;
        accelerationState = AccelerationStates.Accelerate;
        console.log(event.acceleration.z, 'STATIONARY -> ACCELERATE', currentDirection);
      }
      break;

    case AccelerationStates.Accelerate:

      if (Math.abs(newValue) >= DecelerationThreshold) {
        newValue = newValue >= 0 ? AccelerationMax : -AccelerationMax;
      }
      else {
        newValue = 0;
      }
      if (Math.abs(newValue) == AccelerationMax) {
        if (currentDirection == Direction.Forwards && newValue > 0) {
          accelerationState = AccelerationStates.Decelerate;
          console.log(event.acceleration.z, 'ACCELERATE -> DECELERATE');
        }
        else if (currentDirection == Direction.Backwards && newValue < 0) {
          accelerationState = AccelerationStates.Decelerate;
          console.log(event.acceleration.z, 'ACCELERATE -> DECELERATE');
        }
      }
      break;

    case AccelerationStates.Decelerate:

      if (Math.abs(newValue) >= DecelerationThreshold) {
        newValue = newValue >= 0 ? AccelerationMax : -AccelerationMax;
      }
      else {
        newValue = 0;
      }

      if (newValue == 0) {
        accelerationState = AccelerationStates.Stationary;
        console.log(event.acceleration.z, 'DECELERATE -> STATIONARY');
      }
      break;
  }
}