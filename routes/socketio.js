const io = require("socket.io-client");
const request = require("request");
const fs = require("fs");
var id;

if (process.env.ID) {
	id = parseInt(process.env.ID);
} else if (fs.existsSync("id.txt")) {
	id = parseInt(fs.readFileSync("id.txt", "utf8"));
} else {
	id = Math.floor(Math.random() * 1000);
	fs.writeFileSync("id.txt", id.toString());
}

console.log("ID : " + id);

var isPi = true;
try {
	var Gpio = require("onoff").Gpio;
	var sellPin = new Gpio(17, 'out');
	var buyPin = new Gpio(18, 'out');
	var forwardPin = new Gpio(19, 'out');

	process.on('SIGINT', function () {
		sellPin.unexport();
		buyPin.unexport();
		forwardPin.unexport();
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
		forwarding: false
	}
};


var registered = false;

function init() {

	function register(cb) {
		request(coord + "/register?id=" + id + "&state=" + encodeURIComponent(JSON.stringify(state[id])), cb);
	}
	function sync(cb) {
		request(coord + "/sync", cb);
	}

	function updatePins() {
		if (isPi) {
			console.log(state[id].selling, state[id].buying, state[id].forwarding);
			sellPin.writeSync(state[id].selling ? 0 : 1);
			buyPin.writeSync(state[id].buying ? 0 : 1);
			forwardPin.writeSync(state[id].forwarding ? 0 : 1);
		}
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
