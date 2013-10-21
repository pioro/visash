/**
 * New node file
 */

var l4js = require('log4js');

l4js.configure({
	  appenders: [
	    { type: 'console', layout: "pattern" }
	    //, { type: 'file', filename: 'logs.log' }
	  ]
	});

var log4js = l4js.getLogger();
log4js.setLevel('INFO');


exports.log4js = log4js;

