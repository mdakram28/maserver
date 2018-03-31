var socket = io();

socket.on("connect", () => {
	console.log("Connected : ", socket.id);
});

function startSelling() {
	socket.emit("start_selling");
}
function stopSelling() {
	socket.emit("stop_selling");
}
function startBuying() {
	socket.emit("start_buying");
}
function stopBuying() {
	socket.emit("stop_buying");
}