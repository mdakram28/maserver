const io = require("socket.io-client");
const request = require("request");
const fs = require("fs");
const config = (process.env.CONFIG && JSON.parse(process.env.CONFIG)) || require("../config.json");
var id = config.id;
var neighbours = config.neighbours;

console.log("ID : " + id);

var isPi = true;
try {
	var Gpio = require("onoff").Gpio;
	var forwardPinNums = [17,18,19];
	var forwardPins = forwardPinNums.map(pinNum => new Gpio(pinNum, 'out'));

	process.on('SIGINT', () => {
		forwardPins.forEach(pin => {
			pin.unexport();
		});
	});
	console.log("GPIO Initialized");
} catch (err) {
	isPi = false;
	console.log("GPIO not found. Running headless.");
}

const coord = "http://mdakram28-pc:4000";
const state = {
	[id]: {
		buying: false,
		selling: false,
		forwarding: []
	}
};


var registered = false;

function init() {

	function register(cb) {
		request(coord + "/register?config=" + encodeURIComponent(JSON.stringify(config)) + "&state=" + encodeURIComponent(JSON.stringify(state[id])), cb);
	}
	function sync(cb) {
		request(coord + "/sync", cb);
	}

	function updatePins() {
		if(!isPi)return;
		neighbours.forEach((neighbour, index) => {
			console.log(`FORWARD TO ${neighbour} : ${state[id].forwarding.indexOf(neighbour) >= 0}`);
			if(state[id].forwarding.indexOf(neighbour) >= 0) {
				forwardPins[index].writeSync(0);
			}else{
				forwardPins[index].writeSync(1);
			}
		});
	}

	function loop() {
		if (!registered) {
			console.log("Trying to register ...");
			register((err, res, body) => {
				if (!err && res.statusCode == 200) {
					console.log("Successfully registered");
					registered = true;
				}
				setTimeout(loop, 1000);
			});
		} else {
			console.log("Sync ...");
			sync((err, res, body) => {
				if (!err && res.statusCode == 200) {
					var newState = JSON.parse(body);
					if (JSON.stringify(state) != JSON.stringify(newState)) {
						console.log("State modified : " + JSON.stringify(state) + " --> " + JSON.stringify(newState));
						if (socket) socket.emit("sync", newState);
						Object.assign(state, newState);
						updatePins();
					} else {
						Object.assign(state, newState);
					}
				} else {
					registered = false;
				}
				setTimeout(loop, 1000);
			});
		}
	}

	setTimeout(loop, 1000);
}

function sendState(newState, cb) {
	newState = Object.assign(JSON.parse(JSON.stringify(state[id])), newState);
	request(coord + "/setState?id=" + id + "&state=" + encodeURIComponent(JSON.stringify(newState)), (err, res, body) => {
		if (err || res.statusCode != 200) {
			registered = false;
		}
		if (cb) cb(err);
	});
}


var socket;
module.exports = function (io) {

	io.on("connection", newSocket => {
		socket = newSocket;
		console.log("New Socket connected : ", socket.id);
		socket.emit("sync", state);
		socket.emit("id", id);

		socket.on("start_selling", () => {
			console.log("Start selling received");
			sendState({ selling: true });
		});

		socket.on("stop_selling", () => {
			console.log("Stop selling received");
			sendState({ selling: false });
		});

		socket.on("start_buying", () => {
			console.log("Start buying received");
			sendState({ buying: true });
		});

		socket.on("stop_buying", () => {
			console.log("Stop buying received");
			sendState({ buying: false });
		});

	});
}

init();
