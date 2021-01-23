var _util = {
	url: window.location.origin + window.location.pathname,
	save: {
		trash: 0,
		cash: 0,
		employees: 0,
		admins: 0
	},
	game: null,
	infoTimer: null,
	employeeInterval: null,
	adminInterval: null
};
var _GET = [];

//https://stackoverflow.com/a/2901298/1617361
_util.formatNumber = function(number) {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

//https://stackoverflow.com/a/28344281/1617361

_util.hasClass = function(ele, cls) {
	return !!ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
};

_util.addClass = function(ele, cls) {
	if (!_util.hasClass(ele, cls)) ele.className += " " + cls;
};

_util.removeClass = function(ele, cls) {
	if (_util.hasClass(ele, cls)) {
		var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
		ele.className = ele.className.replace(reg, ' ');
	}
};

_util.replaceClass = function(ele, clsa, clsb) {
	_util.removeClass(ele, clsa);
	_util.addClass(ele, clsb);
};

_util.writeInfo = function(message) {
	clearTimeout(_util.infoTimer);

	var info = document.getElementById('info');
	info.innerHTML = message;
	_util.replaceClass(info, 'dn', 'db');

	_util.infoTimer = setTimeout(function() {
		_util.replaceClass(info, 'db', 'dn');
	}, 5000);
};

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
	document.getElementById('gameId').value = _util.game;

	document.getElementById('trash').innerHTML = _util.formatNumber(_util.save.trash);
	document.getElementById('cash').innerHTML = '$' + _util.formatNumber(_util.save.cash) + '.00';
	document.getElementById('employees').innerHTML = _util.formatNumber(_util.save.employees);
	document.getElementById('admins').innerHTML = _util.formatNumber(_util.save.admins);

	if (_util.save.cash > 50) {
		_util.replaceClass(document.getElementById('showHireEmployee'), 'dn', 'db');
	} else {
		_util.replaceClass(document.getElementById('showHireEmployee'), 'db', 'dn');
	}

	if (_util.save.cash > 150) {
		_util.replaceClass(document.getElementById('showHireAdmin'), 'dn', 'db');
	} else {
		_util.replaceClass(document.getElementById('showHireAdmin'), 'db', 'dn');
	}
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
	_util.save.cash += 4;

	_util.saveGame();
};

_util.employeeCollect = function() {
	if (_util.save.employees > 0) {
		_util.save.trash += _util.save.employees;
		_util.save.cash += _util.save.employees * 2;

		_util.saveGame();
	}
};

_util.adminCollect = function() {
	if (_util.save.admins > 0) {
		for(i = 0; i < _util.save.admins; i++) {
			_util.hireEmployee();
		}

		_util.writeInfo('Your administrators hired ' + i + ' employees.');
	}
};

_util.hireEmployee = function() {
	if (_util.save.cash > 50) {
		_util.save.cash -= 50;
		_util.save.employees += 1;

		_util.saveGame();
	}
};

_util.hireAdmin = function() {
	if (_util.save.cash > 150) {
		_util.save.cash -= 150;
		_util.save.admins += 1;

		_util.saveGame();
	}
};

_util.intervalEmployee = function() {
	clearInterval(_util.employeeInterval);

	_util.employeeInterval = setInterval(function() {
		_util.employeeCollect();
	}, 1000);
}

_util.intervalAdmin = function() {
	clearInterval(_util.adminInterval);

	_util.adminInterval = setInterval(function() {
		_util.adminCollect();
	}, 5000);
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
		_util.writeInfo("You've collected a trash pickup! You've earned four dollars!");
	}

	document.getElementById('hireEmployee').onclick = function(e) {
		_util.hireEmployee();
		_util.writeInfo("You've hired an employee! They will automatically collect trash every second.");
	}

	document.getElementById('hireAdmin').onclick = function(e) {
		_util.hireAdmin();
		_util.writeInfo("You've hired an administrator! They will automatically hire employees every five seconds.");
	}

	_util.intervalEmployee();
	_util.intervalAdmin();

	var pause = document.getElementById('pause');

	pause.onclick = function(e) {
		if (!_util.hasClass(pause, 'paused')) {
			clearInterval(_util.employeeInterval);
			clearInterval(_util.adminInterval);

			_util.addClass(pause, 'paused');

			pause.innerHTML = 'Start';
		} else {
			_util.intervalEmployee();
			_util.intervalAdmin();

			_util.removeClass(pause, 'paused');

			pause.innerHTML = 'Pause';
		}
	};
}());