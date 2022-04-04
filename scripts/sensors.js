
const AccelerationStates = {
    Stationary: 'Stationary',
    Accelerate: 'Accelerate',
    Decelerate: 'Decelerate'
  };

const AccelerationThreshold = 1.0;
 
const Direction = {
  Undefined: 'Undefined',
  Forwards: 'Forwards',
  Backwards: 'Backwards',
};

var accelerationState = AccelerationStates.Stationary;
var currentDirection = Direction.Undefined;





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

  var orientationChart = new SmoothieChart({ responsive: true, scrollBackwards: false });
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
  rotationRateSeries1.append(now, event.rotationRate.alpha);
  rotationRateSeries2.append(now, event.rotationRate.beta);
  rotationRateSeries3.append(now, event.rotationRate.gamma);

  accelerationSeries1.append(now, event.acceleration.x);
  accelerationSeries2.append(now, event.acceleration.y);
  accelerationSeries3.append(now, event.acceleration.z);

  orientationSeries1.append(now, event.accelerationIncludingGravity.x - event.acceleration.x);
  orientationSeries2.append(now, event.accelerationIncludingGravity.y - event.acceleration.y);
  orientationSeries3.append(now, event.accelerationIncludingGravity.z - event.acceleration.z);

  updateState(event);
  
}

function updateState(event) {
  
//console.log(Math.abs(event.acceleration.z), accelerationState);

  switch (accelerationState) {

    case AccelerationStates.Stationary: 
      if (Math.abs(event.acceleration.z) > AccelerationThreshold) {
        currentDirection = event.acceleration.z < 0 ? Direction.Forwards : Direction.Backwards; 
        accelerationState = AccelerationStates.Accelerate;  
        console.log(event.acceleration.z, 'STATIONARY -> ACCELERATE', currentDirection);
      }
    break;

    case AccelerationStates.Accelerate: 

      if (Math.abs(event.acceleration.z) > AccelerationThreshold) {

        if(currentDirection == Direction.Forwards && event.acceleration.z > 0) {
          accelerationState = AccelerationStates.Decelerate;
          console.log(event.acceleration.z,'ACCELERATE -> DECELERATE');
        }  
        else if(currentDirection == Direction.Backwards && event.acceleration.z < 0) {
          accelerationState = AccelerationStates.Decelerate;
          console.log(event.acceleration.z,'ACCELERATE -> DECELERATE');
        }
      }
    break;

    case AccelerationStates.Decelerate: 
      if (Math.abs(event.acceleration.z) < AccelerationThreshold) {
        accelerationState = AccelerationStates.Stationary;
        console.log(event.acceleration.z,'DECELERATE -> STATIONARY');
      }
      break;
  }
}
