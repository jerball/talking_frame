"use strict";
var TalkingBase = function (opt_options) {
	this.options = opt_options || {};

	this.targetOrigin = this.options.targetOrigin;

	this.isTargetReady = false;
	this.isTargetPaused = false;
	this.target = null;
	this.targetWaiters = [];

	this.callHandler = null;

	this.callbacks = {};
};

TalkingBase.prototype.setTargetOrigin = function (origin) {
	this.targetOrigin = origin;
};

TalkingBase.prototype.getUrlOrigin = function (url) {
	var a = document.createElement('a');
	a.href = url;
	return a.origin;
};

TalkingBase.prototype.setCallHandler = function (f) {
	this.callHandler = f;
};

TalkingBase.prototype.pause = function (cb) {
	this.call('__pause__', null, cb);
};

TalkingBase.prototype.resume = function () {
	this.call('__resume__');
};

TalkingBase.prototype.call = function (path, opt_data, opt_cb) {
	var requestId = null;
	if (opt_cb != null) {
		requestId = this.registerRequest(opt_cb);
	}
	var self = this;
	this.ensureTargetIsReady(function () {
		self.callWithRequestId(path, opt_data, requestId);
	});
	return requestId;
};

TalkingBase.prototype.callNotReady = function (path, opt_data, opt_cb) {
	var requestId = null;
	if (opt_cb != null) {
		requestId = this.registerRequest(opt_cb);
	}
	this.callWithRequestId(path, opt_data, requestId);
	return requestId;
};

TalkingBase.prototype.ensureTargetIsReady = function (opt_cb) {
	if (this.isTargetReady) {
		if (opt_cb != null) {
			if (this.isTargetPaused) {
				this.targetWaiters.push(opt_cb);
			}
			else {
				opt_cb();
			}
		}
	}
	else {
		this.prepareTarget(opt_cb);
	}
};

// internal

TalkingBase.prototype.callWithRequestId = function (path, opt_data, opt_requestId) {
	var msg = { path: path };
	if (opt_requestId != null) {
		msg.requestId = opt_requestId;
	}
	if (opt_data !== undefined) {
		msg.data = opt_data;
	}
	this.target.postMessage(msg, this.getCallTargetOrigin());
};

TalkingBase.prototype.prepareTarget = function (cb) {
	this.startListenTarget();
	if (cb != null) {
		this.targetWaiters.push(cb);
	}
	this.loadTarget();
};

TalkingBase.prototype.loadTarget = function () {
	this.onTargetReady();
};

TalkingBase.prototype.startListenTarget = function () {
	var self = this;
	addEventListener('message', function (ev) {
		self.onMessage(ev);
	});
};

TalkingBase.prototype.onMessage = function (ev) {
	if (this.isMessageAllowed(ev)) {
		if (this.targetOrigin == null) { // fix origin, if not previously set
			this.setTargetOrigin(ev.origin);
		}
		this.handleMessage(ev);
	}
};

TalkingBase.prototype.isMessageAllowed = function (ev) {
	// check origin, because it may be changed even when window stays same
	return this.isAllowedSource(ev.source) && this.isAllowedOrigin(ev.origin);
};

TalkingBase.prototype.isAllowedSource = function (source) {
	return source == this.target;
};

TalkingBase.prototype.isAllowedOrigin = function (origin) {
	return this.targetOrigin == null || this.targetOrigin == '*' || this.targetOrigin == origin;
};

TalkingBase.prototype.handleMessage = function (ev) {
	var path = ev.data.path;
	if (path) {
		if (!this.isTargetReady && path == '__ready__') {
			this.onTargetReadyMessage(ev);
		}
		else if (!this.isTargetPaused && path == '__pause__') {
			this.onTargetPause(ev);
		}
		else if (this.isTargetPaused && path == '__resume__') {
			this.onTargetResume(ev);
		}
		else {
			this.onCallMessage(ev);
		}
	}
	else {
		this.onCallbackMessage(ev);
	}
};

TalkingBase.prototype.onTargetReadyMessage = function (ev) {
	this.onTargetReady();
};

TalkingBase.prototype.onTargetReady = function () {
	this.isTargetReady = true;
	if (!this.isTargetPaused) {
		this.runTargetWaiters();
	}
};

TalkingBase.prototype.onTargetPause = function (ev) {
	this.isTargetPaused = true;
	var cb = this.createCallCallback(ev, ev.data);
	cb();
};

TalkingBase.prototype.onTargetResume = function () {
	this.isTargetPaused = false;
	if (this.isTargetReady) {
		this.runTargetWaiters();
	}
};

TalkingBase.prototype.runTargetWaiters = function () {
	for (var i = 0; i < this.targetWaiters.length; i++) {
		this.targetWaiters[i]();
	}
	this.targetWaiters = [];
};

TalkingBase.prototype.onCallMessage = function (ev) {
	if (this.callHandler != null) {
		var data = ev.data;
		this.callHandler(ev, data, this.createCallCallback(ev, data));
	}
};

TalkingBase.prototype.createCallCallback = function (ev, data) {
	var self = this;
	return function () {
		var msg = {};
		if (data.requestId != null) {
			msg.requestId = data.requestId;
		}
		if (arguments.length > 0) {
			msg.results = Array.prototype.slice.call(arguments);
		}
		self.target.postMessage(msg, self.getCallbackTargetOrigin(ev, data));
	};
};

TalkingBase.prototype.getCallTargetOrigin = function () {
	var result = this.targetOrigin;
	return result == null ? '*' : result;
};

TalkingBase.prototype.getCallbackTargetOrigin = function (ev, data) {
	return ev.origin; // answering only to one who called us initially
};

TalkingBase.prototype.onCallbackMessage = function (ev) {
	var data = ev.data;
	if (data.requestId != null) {
		var cb = this.callbacks[data.requestId];
		if (cb != null) {
			delete this.callbacks[data.requestId];
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
	while (result in this.callbacks) {
		result = [base, i++].join('-');
	}
	return result;
};


module.exports = TalkingBase;
