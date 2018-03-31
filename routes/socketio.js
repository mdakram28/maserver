// var Gpio = require("onoff").Gpio;
// var sellPin = new Gpio(17, 'out');
// var buyPin = new Gpio(18, 'out');

module.exports = function(io) {
	io.on("connection", socket => {
		console.log("New Socket connected : ", socket.id);
		
		socket.on("start_selling", () => {
			// sellPin.write(1, err => {if(err)console.log(err);});
		});

		socket.on("stop_selling", () => {
			// sellPin.write(0, err => {if(err)console.log(err);});
		});

		socket.on("start_buying", () => {
			// buyPin.write(1, err => {if(err)console.log(err);});
		});

		socket.on("stop_buying", () => {
			// buyPin.write(0, err => {if(err)console.log(err);});
		});

	});
}