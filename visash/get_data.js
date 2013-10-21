/**
 * get json based data from database
 */

var sys = require("sys");
var querystring = require('querystring');
var http = require('http');
var log4js = require('./logger.js').log4js;




exports.get_aas_graph = function (param, serresp) {  
	if (param == null) {
		param = "sample_time=0";
	}
	log4js.debug("/sash/home?"+param);
	paramarray = querystring.parse(param);
	log4js.debug(paramarray);
	log4js.debug(paramarray.sample_time);
	log4js.debug("/sash/home?sample_time="+paramarray.sample_time);
  

	// callback fuction for DB request
	dbrequest = function(response) {	
	  var str = '';
	  log4js.debug("Callback start" + str);
	  response.on('data', function (chunk) {
		str += chunk;
	  });

	  response.on('end', function () {
		log4js.debug("we have data back");
		serresp.writeHeader(200, { "Content-Type" : "text/plain" });  
		//log4js.debug(str);
		// adding data into server response on ajax request
		serresp.write(str, "binary");  
		serresp.end();
	  });
	};
	
	// Calling DB request
	var request = http.request("http://192.168.23.130:8080/sash/get_aas_graph?sample_time="+paramarray.sample_time, dbrequest);
	
	request.on('error', function(err) {
		log4js.debug('unable to connect to http://192.168.23.130');
		// put empty ajax here
		serresp.end('');
    });
	
    request.end();  
    log4js.debug("request end");
   };
