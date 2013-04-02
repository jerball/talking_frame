"use strict";
var inherits = require('inh');
var TalkingBase = require('./talking_base');


var ParentFrame = function (opt_options) {
	TalkingBase.call(this, opt_options);
	this.target = window.opener || window.parent;
};
inherits(ParentFrame, TalkingBase);

ParentFrame.prototype.prepareTarget = function (cb) {
	throw new Error('Call getReady() before using call()');
};

ParentFrame.prototype.getReady = function () {
	this.startListenTarget();
	this.isTargetReady = true;
	this.call('__ready__');
};


module.exports = ParentFrame;
