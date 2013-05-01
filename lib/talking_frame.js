"use strict";
var inherits = require('inh');
var TalkingBase = require('./talking_base');
var d = document;


var TalkingFrame = function (url, opt_options) {
	TalkingBase.call(this, opt_options);

	this.url = url;
	this.options.parentEl = this.options.parentEl || this.getDefaultParentEl();

	this.frame = null;
};
inherits(TalkingFrame, TalkingBase);

TalkingFrame.prototype.getDefaultParentEl = function () {
	return d.body;
};

TalkingFrame.prototype.loadTarget = function () {
	this.frame = this.createFrame();
	this.options.parentEl.appendChild(this.frame);
	this.target = this.frame.contentWindow;
};

TalkingFrame.prototype.createFrame = function () {
	var frame = d.createElement('iframe');
	frame.style.display = 'none';
	frame.src = this.url;
	return frame;
};


module.exports = TalkingFrame;
