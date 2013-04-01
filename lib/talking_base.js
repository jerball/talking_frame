"use strict";
var TalkingBase = function (opt_options) {
	this.options = opt_options || {};

	this.target = this.options.target || '*';

	this.isFrameReady = false;
	this.frame = null;

	this.requests = {};
};

TalkingBase.prototype.call = function (path, data, cb) {
	var requestId = null;
	var self = this;
	this.ensureFrameIsReady(function () {
		requestId = self.registerRequest(cb);
		self.frame.postMessage({
			path: path,
			requestId: requestId,
			data: data
		}, self.target);
	});
	return requestId;
};

TalkingBase.prototype.ensureFrameIsReady = function (cb) {
	if (this.isFrameReady) {
		cb();
	}
	else {
		this.prepareFrame(cb);
	}
};

TalkingBase.prototype.prepareFrame = function (cb) {
	this.startListenFrame();
	this.isFrameReady = true;
	cb();
};

TalkingBase.prototype.startListenFrame = function () {
	var self = this;
	this.frame.addEventListener('message', function (ev) {
		self.onMessage(ev);
	});
};

TalkingBase.prototype.onMessage = function (ev) {
	if (ev.source == this.frame) {
		if (ev.data.path == 'ready') {
			this.onFrameReadyMessage(ev);
		}
		// TODO call vs callback
		else if (ev.data.requestId != null) {
			var cb = this.requests[ev.data.requestId];
			if (cb) {
				cb(ev.data.err, ev.data.result);
			}
		}
		else if (this.callFunc != null) {
			var x;
		}
	}
};

TalkingBase.prototype.onFrameReadyMessage = function (ev) {
};

TalkingBase.prototype.registerRequest = function (cb) {
	var requestId = this.createRequestId();
	this.requests[requestId] = cb;
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
