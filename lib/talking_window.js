"use strict";
var inherits = require('inh');
var TalkingBase = require('./talking_base');
var w = window;


var TalkingWindow = function (url, opt_options) {
	TalkingBase.call(this, opt_options);
	this.url = url;

	this.options.windowFeatures = this.options.windowFeatures || this.defaultWindowFeatures;
	this.options.closeCheckingInterval = (this.options.closeCheckingInterval != null ? this.options.closeCheckingInterval : this.defaultCloseCheckingInterval);

	this.onClose = null;

	this.closeCheckingId = null;
	this.isCloseHandled = false;
	this.startCloseChecking();
};
inherits(TalkingWindow, TalkingBase);

TalkingWindow.prototype.defaultWindowFeatures = 'centerscreen=yes,location=yes,dialog=yes';
TalkingWindow.prototype.defaultCloseCheckingInterval = 200; // ms

TalkingWindow.prototype.loadTarget = function () {
	this.target = w.open(this.url, this.options.windowName, this.options.windowFeatures);
};

TalkingWindow.prototype.startCloseChecking = function () {
	var self = this;
	this.closeCheckingId = w.setTimeout(function () {
		if (self.isClosed()) {
			self.handleCloseOnce();
		}
		else {
			self.startCloseChecking();
		}
	}, this.options.closeCheckingInterval);
};

TalkingWindow.prototype.stopCloseChecking = function () {
	if (this.closeCheckingId != null) {
		w.clearTimeout(this.closeCheckingId);
		this.closeCheckingId = null;
	}
};

TalkingWindow.prototype.handleCloseOnce = function () {
	if (!this.isCloseHandled) {
		this.isCloseHandled = true;
		this.handleClose();
	}
};

TalkingWindow.prototype.handleClose = function () {
	this.stopCloseChecking();
	this.sendCloseErrorToAll();
	if (this.onClose != null) {
		this.onClose(this.createCloseError());
	}
};

TalkingWindow.prototype.isClosed = function () {
	return this.target.closed;
};

TalkingWindow.prototype.close = function () {
	if (this.target != null && !this.isClosed()) {
		this.target.close();
	}
	this.handleCloseOnce();
};

TalkingWindow.prototype.sendCloseErrorToAll = function () {
	var callbacks = this.callbacks;
	this.callbacks = [];
	for (var k in callbacks) {
		var cb = callbacks[k];
		cb(this.createCloseError());
	}
};

TalkingWindow.prototype.createCloseError = function () {
	return {
		code: 'Close'
	};
};

TalkingWindow.prototype.isCloseError = function (err) {
	return err.code == 'Close';
};


module.exports = TalkingWindow;
