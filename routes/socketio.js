var prod = true;
try {
	var Gpio = require("onoff").Gpio;
	var sellPin = new Gpio(17, 'out');
	var buyPin = new Gpio(18, 'out');
} catch (err) {
	prod = false;
}

module.exports = function (io) {
	io.on("connection", socket => {
		console.log("New Socket connected : ", socket.id);

		socket.on("start_selling", () => {
			if(prod)sellPin.write(1, err => { if (err) console.log(err); });
		});

		socket.on("stop_selling", () => {
			if(prod)sellPin.write(0, err => { if (err) console.log(err); });
		});

		socket.on("start_buying", () => {
			if(prod)buyPin.write(1, err => { if (err) console.log(err); });
		});

		socket.on("stop_buying", () => {
			if(prod)buyPin.write(0, err => { if (err) console.log(err); });
		});

	});
}