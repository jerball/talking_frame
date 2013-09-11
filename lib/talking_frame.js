"use strict";
var inherits = require('inherits');
var TalkingBase = require('./talking_base');


var TalkingFrame = function (url, opt_options) {
	TalkingBase.call(this, opt_options);

	this.url = url;
	if (this.options.targetOrigin == null && url != null) {
		this.setTargetOrigin(this.getUrlOrigin(url));
	}

	this.parentEl = this.options.parentEl || this.getDefaultParentEl();

	this.frame = null;
};
inherits(TalkingFrame, TalkingBase);

TalkingFrame.prototype.getDefaultParentEl = function () {
	return document.body;
};

TalkingFrame.prototype.loadTarget = function () {
	this.frame = this.createFrame();
	this.parentEl.appendChild(this.frame);
	this.target = this.frame.contentWindow;
};

TalkingFrame.prototype.createFrame = function () {
	var frame = document.createElement('iframe');
	frame.style.display = 'none';
	frame.src = this.url;
	return frame;
};


module.exports = TalkingFrame;
