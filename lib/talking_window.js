"use strict";
var inherits = require('inh');
var TalkingBase = require('./talking_base');


var TalkingWindow = function (url, opt_options) {
	TalkingBase.call(this, opt_options);

	this.url = url;
	if (this.options.targetOrigin == null && url != null) {
		this.setTargetOrigin(this.getUrlOrigin(url));
	}

	this.windowFeatures = this.options.windowFeatures || this.defaultWindowFeatures;
	this.closeCheckingInterval = (this.options.closeCheckingInterval != null ? this.options.closeCheckingInterval : this.defaultCloseCheckingInterval);

	this.onClose = null;

	this.closeCheckingId = null;
	this.isCloseHandled = false;
	this.startCloseChecking();
};
inherits(TalkingWindow, TalkingBase);

TalkingWindow.prototype.defaultWindowFeatures = 'location=yes,dialog=yes';
TalkingWindow.prototype.defaultCloseCheckingInterval = 200; // ms

TalkingWindow.prototype.snapToUrl = function () {
	this.targetOrigin = this.getUrlOrigin(this.url);
	this.snapToOrigin = false;
};

TalkingWindow.prototype.loadTarget = function () {
	this.target = open(this.url, this.options.windowName, this.windowFeatures);
};

TalkingWindow.prototype.startCloseChecking = function () {
	var self = this;
	this.closeCheckingId = setTimeout(function () {
		if (self.isClosed()) {
			self.handleCloseOnce();
		}
		else {
			self.startCloseChecking();
		}
	}, this.closeCheckingInterval);
};

TalkingWindow.prototype.stopCloseChecking = function () {
	if (this.closeCheckingId != null) {
		clearTimeout(this.closeCheckingId);
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
		code: 'WindowCloseError'
	};
};

TalkingWindow.prototype.isCloseError = function (err) {
	return err.code == 'WindowCloseError';
};


module.exports = TalkingWindow;
