"use strict";
var inherits = require('inh');
var TalkingBase = require('./talking_base');


var TalkingParent = function (opt_options) {
	TalkingBase.call(this, opt_options);
	this.target = window.opener || window.parent;
};
inherits(TalkingParent, TalkingBase);

TalkingParent.prototype.loadTarget = function () {
	this.callNotReady('__ready__');
	this.onTargetReady();
};

TalkingParent.prototype.getReady = function () {
	this.ensureTargetIsReady();
};


module.exports = TalkingParent;
