"use strict";
var inherits = require('inh');
var TalkingBase = require('./talking_base');


var ParentFrame = function (opt_options) {
	TalkingBase.call(this, opt_options);
	this.frame = window.opener || window.parent;
};
inherits(ParentFrame, TalkingBase);


module.exports = ParentFrame;
