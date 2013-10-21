/**
 * get json based data from database
 */

var sys = require("sys");
var querystring = require('querystring');
var http = require('http');
var log4js = require('./logger.js').log4js;
var config = require('./config.json');




exports.run_sash_proc = function (func_name, param, serresp) {  

	var paramarray = querystring.parse(param);

	
	var new_param_string = "?";

	for(var name in paramarray) {
		var attr = paramarray[name];
		if ( name != '_') {
			new_param_string =  new_param_string + '' + name + "=" + attr + "&";
		}
	}
	
	log4js.info(new_param_string);


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
	//var request = http.request("http://192.168.23.130:8080/sash/get_aas_graph?sample_time="+paramarray.sample_time, dbrequest);
	
	var sash_db_url = "http://" + config.dbrepo + ":" + config.port + "/sash/" + func_name + new_param_string;
	
	log4js.info(sash_db_url);
	
	var request = http.request(sash_db_url, dbrequest);
	
	request.on('socket', function (socket) {
	    socket.setTimeout(15000);  
	    socket.on('timeout', function() {
	    	request.abort();
	    });
	});
	
	
	request.on('error', function(err) {
		log4js.debug('unable to connect to ' + sash_db_url);
		// put empty ajax here
		serresp.end('{ "error": {"message" : "Can\'t access database gateway using url :' + sash_db_url + '<BR>Error message: ' + err.message + '",  "refresh" : "yes"} }');
    });
	
    request.end();  
    log4js.debug("request end");
   };
