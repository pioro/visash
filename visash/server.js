var express = require('express');
//var connect = require('connect');
var run_sash = require('./run_sash_proc.js');
var l4js = require('log4js');
var log4js = require('./logger.js').log4js;
var url = require("url");




//app = connect.createServer(    
//			l4js.connectLogger(log4js, { level: 'auto' })
//		  , connect.favicon()
//		  , connect.cookieParser()
//		  , connect.static('./static',  { index: 'basic.html' , maxAge: 1000 })
//		);


app = express();


//express app
app.configure(function() {
  app.use(express.favicon(''));
  app.use ( l4js.connectLogger(log4js, { level: 'auto' }) );
  app.use (express.static('./static',  { index: 'basic.html' , maxAge: 1000 }) );
});


app.get('/sash/:function_name', function(req, res) {
	  uri = url.parse(req.url);  
	  run_sash.run_sash_proc(req.params.function_name,uri.query, res);
});



app.use(function(req, res, next){
	  res.send(404, 'Sorry cant find that!');
	});


app.listen(3000);