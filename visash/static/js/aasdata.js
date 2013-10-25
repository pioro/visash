// Class for keep data for AAS graph and top sql

function aasdata (name) {
 this.cpudata = { label: "CPU", data : []};
 this.useriodata = { label: "User IO", data : []};
 this.systemiodata = { label: "System IO", data : []};
 this.concurdata = { label: "Concurrency", data : []};
 this.applicationdata = { label: "Application", data : []};
 this.commitdata = { label: "Commit", data : []};
 this.clusterdata = { label: "Cluster", data : []};
 this.networkdata = { label: "Network", data : []};
 this.topsql = { label: "SQLID", data : []};
 this.name = name;
 this.current_time = "";
 
 
// get point to display  
 this.getpoints = function() {
   return [ this.cpudata, this.useriodata, this.systemiodata, this.concurdata, this.applicationdata, this.commitdata, this.clusterdata, this.networkdata ];
 };

 
// get one point - probably doesn't use 
this.getone = function () {
   return this.cpudata;
};
 

// get name of object
this.getname = function () {
   return this.name;
};


// get size of topsql data
this.getsize = function () {
  return this.topsql.data.length;
};


// get sql_id from data 
this.getsql = function(v) {
  return this.topsql.data[v];
};

 this.reset = function () {
  this.cpudata = { label: "CPU", data : []};
  this.useriodata = { label: "User IO", data : []};
  this.systemiodata = { label: "System IO", data : []};
  this.concurdata = { label: "Concurrency", data : []};
  this.applicationdata = { label: "Application", data : []};
  this.commitdata = { label: "Commit", data : []};
  this.clusterdata = { label: "Cluster", data : []};
  this.networkdata = { label: "Network", data : []};
  this.topsql = { label: "SQLID", data : []};
 };

 this.addemptyline = function ( currentime ) {
  this.cpudata.data.push([currenttime,0]);
  this.useriodata.data.push([currenttime,0]);
  this.systemiodata.data.push([currenttime,0]);
  this.concurdata.data.push([currenttime,0]);
  this.applicationdata.data.push([currenttime,0]);
  this.commitdata.data.push([currenttime,0]);
  this.clusterdata.data.push([currenttime,0]);
  this.networkdata.data.push([currenttime,0]);
 };


// adding lines for AAS
// this one is calling addline 
this.addlines = function ( ash ) {
	var points = this;
    $.each( ash , function ( ltime, values ) {
		if (typeof values.SAMPLE_TIME != 'undefined') {
			lcpudata = values[0];
			luseriodata = values[1];
			// change date into epoch format
			dtime = Date.parse(values.SAMPLE_TIME);
			points.addline(dtime, values);
		}
    });
};
 
 

// add line for AAS
this.addline = function ( ltime, values ) {
  this.cpudata.data.push([ltime, values.CPU]);
  this.useriodata.data.push([ltime, values.USERIO]);
  this.systemiodata.data.push([ltime, values.SYSTEMIO]);
  this.concurdata.data.push([ltime,values.CONCURRENCY]);
  this.applicationdata.data.push([ltime,values.APPLICATION]);
  this.commitdata.data.push([ltime,values.COMMIT]);
  this.clusterdata.data.push([ltime,values.CLUSTER]);
  this.networkdata.data.push([ltime,values.NETWORK]);
  this.cpudata.data.sort(this.sortNumber);
  this.useriodata.data.sort(this.sortNumber);
  this.systemiodata.data.sort(this.sortNumber);
  this.concurdata.data.sort(this.sortNumber);
  this.applicationdata.data.sort(this.sortNumber);
  this.commitdata.data.sort(this.sortNumber);
  this.clusterdata.data.sort(this.sortNumber);
  this.networkdata.data.sort(this.sortNumber);
} ;


this.sortNumber = function(a,b)
{
	return a[0] - b[0];
};

// add data for topsql 
this.addtopsql = function ( ltopsql ) {
   i = 0;
   this.reset();
   temppoint = this;
   $.each( ltopsql , function ( sqlid, values ) {
	   if (typeof values.SQL_ID != 'undefined') {
	        temppoint.topsql.data.push( values.SQL_ID );
	        i = 0 - $.inArray(values.SQL_ID,  temppoint.topsql.data );
	        temppoint.cpudata.data.push ([ values.CPU, i ]);
	        temppoint.useriodata.data.push ([ values.USERIO, i ]);
	        temppoint.systemiodata.data.push ([ values.SYSTEMIO, i ]);
	        temppoint.concurdata.data.push ([ values.CONCURRENCY, i ]);
	        temppoint.applicationdata.data.push ([ values.APPLICATION, i ]);
	        temppoint.commitdata.data.push ([ values.COMMIT, i ]);
	        temppoint.clusterdata.data.push ([values.CLUSTER, i ]);
	        temppoint.networkdata.data.push ([ values.NETWORK, i ]);
	   }
   });
  
};
 

 
// moving points  
this.shiftpoints = function ( samplesize ) {
    arraysize = this.cpudata.data.length;
    if (arraysize > samplesize) {
          this.cpudata.data = this.cpudata.data.slice(arraysize-samplesize);
          this.useriodata.data = this.useriodata.data.slice(arraysize-samplesize);
          this.systemiodata.data = this.systemiodata.data.slice(arraysize-samplesize);
          this.concurdata.data = this.concurdata.data.slice(arraysize-samplesize);
          this.applicationdata.data = this.applicationdata.data.slice(arraysize-samplesize);
          this.commitdata.data = this.commitdata.data.slice(arraysize-samplesize);
          this.clusterdata.data = this.clusterdata.data.slice(arraysize-samplesize);
          this.networkdata.data = this.networkdata.data.slice(arraysize-samplesize);
    }
} ;



 this.getfirst = function () {
   return this.cpudata.data[0];
 };

 this.getmintime = function () {
   return  (this.cpudata.data[0])[0] ;
 };

 this.getmaxtime = function () {
	return this.current_time;
 };

 this.setmaxtime = function (l_time) {
	this.current_time = l_time;
 };
 
} 

// end of class

