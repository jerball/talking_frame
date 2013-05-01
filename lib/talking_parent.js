"use strict";
var inherits = require('inh');
var TalkingBase = require('./talking_base');
var w = window;


var TalkingParent = function (opt_options) {
	TalkingBase.call(this, opt_options);
	this.target = w.opener || w.parent;
};
inherits(TalkingParent, TalkingBase);

TalkingParent.prototype.loadTarget = function () {
	this.callInternal('__ready__');
	this.onTargetReady();
};

TalkingParent.prototype.getReady = function () {
	this.ensureTargetIsReady();
};


module.exports = TalkingParent;
