var _util = {
	url: window.location.origin + window.location.pathname,
	save: {
		trash: 0,
		cash: 0,
		employees: 0,
		admins: 0
	},
	game: null
};
var _GET = [];

_util.GET = function(param) {
	var params = new URLSearchParams(window.location.search);
	return params.get(param);
};

_util.resetGame = function() {
	_util.save.trash = 0;
	_util.save.cash = 0;
	_util.save.employees = 0;
	_util.save.admins = 0;

	_util.saveGame();
}

_util.saveGame = function() {
	_util.game = btoa(JSON.stringify(_util.save));
	var newUrl = _util.url + '?game=' + _util.game;

	if (typeof history.pushState !== 'undefined') {
		window.history.pushState({
			path: newUrl
		}, '', newUrl);
	} else {
		window.location = newUrl;
	}

	_util.updateStatus();
};

_util.updateStatus = function() {
	_util.save.cash = Math.round(_util.save.trash * 2);

	document.getElementById('gameId').value = _util.game;

	document.getElementById('trash').innerHTML = _util.save.trash;
	document.getElementById('cash').innerHTML = '$' + _util.save.cash + '.00';
	//document.getElementById('employees').innerHTML = _util.save.employees;
	//document.getElementById('admins').innerHTML = _util.save.admins;
};

_util.loadGame = function() {
	_util.game = _util.GET('game');

	var loadSave = JSON.parse(atob(_util.game));

	_util.save.trash = loadSave.trash || _util.save.trash;
	_util.save.cash = loadSave.cash || _util.save.cash;
	_util.save.employees = loadSave.employees || _util.save.employees;
	_util.save.admins = loadSave.admins || _util.save.admins;

	_util.saveGame();
};

_util.collectTrash = function() {
	_util.save.trash += 1;

	document.getElementById('trash').innerHTML = _util.save.trash;

	_util.saveGame();
};

(function() {
	if (!_util.GET('game')) {
		_util.saveGame();
	}

	_util.loadGame();

	document.getElementById('resetGame').onclick = function(e) {
		_util.resetGame();
	}

	document.getElementById('collectTrash').onclick = function(e) {
		_util.collectTrash();
	}
}());