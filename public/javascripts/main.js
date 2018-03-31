var socket = io();
var id = 0;

socket.on("connect", () => {
	console.log("Connected : ", socket.id);
});

socket.on("sync", newState => {
	console.log(newState);
	document.getElementById("state").innerHTML = JSON.stringify(newState, null, 4);
});

socket.on("id", newId => {
	id = newId;
	document.getElementById("id").innerHTML = id;
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
