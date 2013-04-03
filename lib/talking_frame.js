"use strict";
var inherits = require('inh');
var TalkingBase = require('./talking_base');


var TalkingFrame = function (url, opt_options) {
	TalkingBase.call(this, opt_options);

	this.url = url;
	this.parentEl = this.options.parentEl || document.body;

	this.targetWaiters = [];
	this.frame = null;
};
inherits(TalkingFrame, TalkingBase);

TalkingFrame.prototype.prepareTarget = function (cb) {
	if (this.isTargetReady) {
		cb();
	}
	else {
		this.targetWaiters.push(cb);
		if (this.frame == null) {
			this.frame = this.createFrame();
			this.startListenTarget();
			this.parentEl.appendChild(this.frame);
			this.target = this.frame.contentWindow;
		}
	}
};

TalkingFrame.prototype.createFrame = function () {
	var frame = document.createElement('iframe');
	frame.style.display = 'none';
	frame.src = this.url;
	return frame;
};

TalkingFrame.prototype.onTargetReadyMessage = function (ev) {
	this.isTargetReady = true;
	for (var i = 0; i < this.targetWaiters.length; i++) {
		this.targetWaiters[i]();
	}
	this.targetWaiters = [];
};


module.exports = TalkingFrame;
