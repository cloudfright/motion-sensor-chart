

var gyroSeries1 = new TimeSeries();
var gyroSeries2 = new TimeSeries();
var gyroSeries3 = new TimeSeries();

var accellSeries1 = new TimeSeries();
var accellSeries2 = new TimeSeries();
var accellSeries3 = new TimeSeries();

var accellGravitySeries1 = new TimeSeries();
var accellGravitySeries2 = new TimeSeries();
var accellGravitySeries3 = new TimeSeries();

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

let smoothAx;


function createTimeline() {

    var gyroChart = new SmoothieChart({ responsive: true, scrollBackwards: false });
    gyroChart.addTimeSeries(gyroSeries1, { strokeStyle: 'rgba(255, 0, 0, 1)', fillStyle: 'rgba(255, 0, 0, 0.2)', lineWidth: 3 });
    gyroChart.addTimeSeries(gyroSeries2, { strokeStyle: 'rgba(0, 255, 0, 1)', fillStyle: 'rgba(0, 255, 0, 0.2)', lineWidth: 3 });
    gyroChart.addTimeSeries(gyroSeries3, { strokeStyle: 'rgba(0, 0, 255, 1)', fillStyle: 'rgba(0, 0, 255, 0.2)', lineWidth: 3 });
    gyroChart.streamTo(document.getElementById("gryo-chart"), 500);

    var accellChart = new SmoothieChart({ responsive: true, scrollBackwards: false });
    accellChart.addTimeSeries(accellSeries1, { strokeStyle: 'rgba(255, 0, 0, 1)', fillStyle: 'rgba(255, 0, 0, 0.2)', lineWidth: 3 });
    accellChart.addTimeSeries(accellSeries2, { strokeStyle: 'rgba(0, 255, 0, 1)', fillStyle: 'rgba(0, 255, 0, 0.2)', lineWidth: 3 });
    accellChart.addTimeSeries(accellSeries3, { strokeStyle: 'rgba(0, 0, 255, 1)', fillStyle: 'rgba(0, 0, 255, 0.2)', lineWidth: 3 });
    accellChart.streamTo(document.getElementById("accel-ng-chart"), 500);

    smoothAx = new ExponentialMovingAverage(0.7);

    var accellGravityChart = new SmoothieChart({ responsive: true, scrollBackwards: false });
    accellGravityChart.addTimeSeries(accellGravitySeries1, { strokeStyle: 'rgba(255, 0, 0, 1)', fillStyle: 'rgba(255, 0, 0, 0.2)', lineWidth: 3 });
    accellGravityChart.addTimeSeries(accellGravitySeries2, { strokeStyle: 'rgba(0, 255, 0, 1)', fillStyle: 'rgba(0, 255, 0, 0.2)', lineWidth: 3 });
    accellGravityChart.addTimeSeries(accellGravitySeries3, { strokeStyle: 'rgba(0, 0, 255, 1)', fillStyle: 'rgba(0, 0, 255, 0.2)', lineWidth: 3 });
    accellGravityChart.streamTo(document.getElementById("accel-wg-chart"), 500);

}

function requestPermission() {
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    // Handle iOS 13+ devices.
    DeviceMotionEvent.requestPermission()
      .then((state) => {
        if (state === 'granted') {
          window.addEventListener('devicemotion', handleOrientation);
        } else {
          console.error('Request to access the orientation was rejected');
        }
      })
      .catch(console.error);
  } else {
    // Handle regular non iOS 13+ devices.
    window.addEventListener('devicemotion', handleOrientation);
  }
}



function handleOrientation(event) {

  var now = Date.now();
  gyroSeries1.append(now, event.rotationRate.alpha);
  gyroSeries2.append(now, event.rotationRate.beta);
  gyroSeries3.append(now, event.rotationRate.gamma);

  smoothAx.update(event.acceleration.x);

  accellSeries1.append(now, event.acceleration.x);
  //accellSeries2.append(now, smoothAx.filtered);
  accellSeries2.append(now, event.acceleration.y);
  accellSeries3.append(now, event.acceleration.z);

  

  accellGravitySeries1.append(now, event.accelerationIncludingGravity.x - event.acceleration.x);
  accellGravitySeries2.append(now, event.accelerationIncludingGravity.y - event.acceleration.y);
  accellGravitySeries3.append(now, event.accelerationIncludingGravity.z - event.acceleration.z);
}
