"use strict";
var TalkingFrame = function (url, opt_options) {
	this.url = url;
	this.options = opt_options || {};

	this.target = this.options.target || '*';

	this.parentEl = this.options.parentEl || document.body;

	this.frameWaiters = [];
	this.frame = null;
	this.isFrameReady = false;

	this.requests = {};
};

TalkingFrame.prototype.call = function (path, data, cb) {
	var self = this;
	this.ensureFrame(function () {
		var requestId = self.registerRequest(cb);
		self.frame.postMessage({
			path: path,
			requestId: requestId,
			data: data
		}, self.target);
	});
};

TalkingFrame.prototype.createFrame = function () {
	var frame = document.createElement('iframe');
	frame.style = 'display:none';
	return frame;
};

TalkingFrame.prototype.ensureFrame = function (cb) {
	if (this.frame == null) {
		var frame = this.createFrame();

		this.frame = frame;
		this.frameWaiters.push(cb);

		var self = this;
		var handler = function (ev) {
			if (ev.source == frame && ev.data.path == 'ready') {
				frame.removeEventListener(handler);
				self.isFrameReady = true;
				for (var i = 0; i < self.frameWaiters; i++) {
					self.frameWaiters[i]();
				}
				self.frameWaiters = [];
			}
		};
		frame.addEventListener('message', handler);

		this.parentEl.appendChild(frame);
	}
	else if (this.isFrameReady) {
		cb();
	}
	else {
		this.frameWaiters.push(cb);
	}
};

TalkingFrame.prototype.registerRequest = function (cb) {
	var requestId = this.createRequestId();
	this.requests[requestId] = cb;
	return requestId;
};

TalkingFrame.prototype.createRequestId = function () {
	var result = new Date().getTime() + '';
	var base = result;
	var i = 0;
	while (result in this.requests) {
		result = [base, i++].join('-');
	}
	return result;
};


module.exports = TalkingFrame;
