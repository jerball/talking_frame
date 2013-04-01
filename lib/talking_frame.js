"use strict";
var inherits = require('inh');
var TalkingBase = require('./talking_base');


var TalkingFrame = function (url, opt_options) {
	TalkingBase.call(this, opt_options);

	this.url = url;
	this.parentEl = this.options.parentEl || document.body;

	this.frameWaiters = [];
	this.isFrameReady = false;
};
inherits(TalkingFrame, TalkingBase);

TalkingFrame.prototype.prepareFrame = function (cb) {
	if (this.isFrameReady) {
		cb();
	}
	else {
		this.frameWaiters.push(cb);
		if (this.frame == null) {
			this.frame = this.createFrame();
			this.startListenFrame();
			this.parentEl.appendChild(this.frame);
		}
	}
};

TalkingFrame.prototype.createFrame = function () {
	var frame = document.createElement('iframe');
	frame.style = 'display:none';
	return frame;
};

TalkingFrame.prototype.onFrameReadyMessage = function (ev) {
	this.isFrameReady = true;
	for (var i = 0; i < this.frameWaiters; i++) {
		this.frameWaiters[i]();
	}
	this.frameWaiters = [];
};


module.exports = TalkingFrame;
