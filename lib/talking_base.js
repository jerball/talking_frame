"use strict";
var TalkingBase = function (opt_options) {
	this.options = opt_options || {};

	this.targetOrigin = this.options.targetOrigin || '*';

	this.isTargetReady = false;
	this.target = null;

	this.callFunc = null;

	this.callbacks = {};
};

TalkingBase.prototype.call = function (path, data, cb) {
	var requestId = null;
	var self = this;
	this.ensureTargetIsReady(function () {
		var msg = { path: path };
		if (cb != null) {
			requestId = self.registerRequest(cb);
			msg.requestId = requestId;
		}
		if (data !== undefined) {
			msg.data = data;
		}
		self.target.postMessage(msg, self.targetOrigin);
	});
	return requestId;
};

TalkingBase.prototype.ensureTargetIsReady = function (cb) {
	if (this.isTargetReady) {
		cb();
	}
	else {
		this.prepareTarget(cb);
	}
};

TalkingBase.prototype.prepareTarget = function (cb) {
	this.startListenTarget();
	this.isTargetReady = true;
	cb();
};

TalkingBase.prototype.startListenTarget = function () {
	var self = this;
	this.target.addEventListener('message', function (ev) {
		self.onMessage(ev);
	});
};

TalkingBase.prototype.onMessage = function (ev) {
	if (ev.source == this.target) {
		var path = ev.data.path;
		if (path) {
			if (path == '__ready__') {
				this.onTargetReadyMessage(ev);
			}
			else {
				this.onCallMessage(ev);
			}
		}
		else {
			this.onCallbackMessage(ev);
		}
	}
};

TalkingBase.prototype.onTargetReadyMessage = function (ev) {
};

TalkingBase.prototype.onCallMessage = function (ev) {
	if (this.callFunc) {
		var data = ev.data;
		var self = this;
		this.callFunc(data.path, data.data, function () {
			var msg = {};
			if (data.requestId != null) {
				msg.requestId = data.requestId;
			}
			if (arguments.length > 0) {
				msg.results = Array.prototype.slice(arguments);
			}
			self.target.postMessage(msg, self.targetOrigin);
		});
	}
};

TalkingBase.prototype.onCallbackMessage = function (ev) {
	var data = ev.data;
	if (data.requestId != null) {
		var cb = this.callbacks[data.requestId];
		if (cb != null) {
			if (data.results == null) {
				cb();
			}
			else {
				cb.apply(null, data.results);
			}
		}
	}
};

TalkingBase.prototype.registerRequest = function (cb) {
	var requestId = this.createRequestId();
	this.callbacks[requestId] = cb;
	return requestId;
};

TalkingBase.prototype.createRequestId = function () {
	var result = new Date().getTime() + '';
	var base = result;
	var i = 0;
	while (result in this.requests) {
		result = [base, i++].join('-');
	}
	return result;
};


module.exports = TalkingBase;
