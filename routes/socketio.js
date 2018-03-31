const io = require("socket.io-client");
const request = require("request");
const fs = require("fs");
var id;

if(fs.existsSync("id.txt")){
	id = parseInt(fs.readFileSync("id.txt", "utf8"));
}else{
	id = Math.floor(Math.random() * 1000);
	fs.writeFileSync("id.txt", id.toString());
}

console.log("ID : "+id);

var prod = true;
try {
	var Gpio = require("onoff").Gpio;
	var sellPin = new Gpio(17, 'out');
	var buyPin = new Gpio(18, 'out');
} catch (err) {
	prod = false;
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
					}
					Object.assign(state, newState);
				} else {
					registered = false;
				}
				setTimeout(loop, 1000);
			});
		}
	}

	setTimeout(loop, 1000);
}



module.exports = function (io) {
	io.on("connection", socket => {
		console.log("New Socket connected : ", socket.id);

		socket.on("start_selling", () => {
			console.log("Start selling received");
			state[id].selling = true;
			// if (prod) sellPin.write(1, err => { if (err) console.log(err); });
		});

		socket.on("stop_selling", () => {
			console.log("Stop selling received");
			state[id].selling = false;
			// if (prod) sellPin.write(0, err => { if (err) console.log(err); });
		});

		socket.on("start_buying", () => {
			console.log("Start buying received");
			state[id].buying = true;
			// if (prod) buyPin.write(1, err => { if (err) console.log(err); });
		});

		socket.on("stop_buying", () => {
			console.log("Stop buying received");
			state[id].buying = false;
			// if (prod) buyPin.write(0, err => { if (err) console.log(err); });
		});

	});
}

init();
