var socket = io();
var scope;

socket.on("connect", () => {
	console.log("Connected : ", socket.id);
});

socket.on("id", newId => {
	scope.id = newId;
	scope.$apply();
});

socket.on("sync", newState => {
	console.log(newState);
	scope.state = newState;
	scope.$apply();
});

socket.on("config", newConfig => {
	scope.config = newConfig;
	scope.$apply();
});

var app = angular.module("app", []);

app.controller("MainPageController", ['$scope', ($scope) => {
	scope = $scope;
	$scope.state = {};

	$scope.config = {
		id: 0,
		neighbours: []
	}

	$scope.id = 0;

	console.log("Initialized");

	$scope.startSelling = function() {
		socket.emit("start_selling");
	}
	$scope.stopSelling = function() {
		socket.emit("stop_selling");
	}
	$scope.startBuying = function() {
		socket.emit("start_buying");
	}
	$scope.stopBuying = function() {
		socket.emit("stop_buying");
	}
	
}])