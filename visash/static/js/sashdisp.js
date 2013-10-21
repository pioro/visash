var graph1 ; // first graph

var highlightedIndex = -1 ;
var samplesize = 90;




function resetData() {
	$("input[id*='sample_time']").val("");
}
window.onbeforeunload = resetData;


// on instance change 
function instchange(name) {
	$("#sample_time_"+name).val(""); 
	points = chartsarr[name].data;
	points.reset();
	aas_instance.refresh(name);
	topsql_instance.refresh(name);
	//runtopsql(name);
}


var i=0;
    


//function makeseries ( inputdata ) {
//  $.each( inputdata , function ( ltime, values ) {
//               oncpu = values[0];
//               userwait = values[1];
//               //dtime = Date.parse(ltime);
//               lasttime = ltime;
//	       cpudata.data.push([ltime, oncpu]);
//	       useriodata.data.push([ltime, userwait]);
//  });
//}





$(document).ready(function() {

//	// request the data
//	 $( "#error-messages" ).dialog({
//		 modal: true,
//		 buttons: {
//			 Refresh: function() {
//				 $( this ).dialog( "close" );
//				 location.reload();
//			 }
//		 }
//	});
	 
	getTable();
	if (sash_detected == 1) {

		aas_instance = new aas_class();
		//aas_instance1 = new aas_class();
		
		
		aas_instance.start('AAS1', aas_instance);
		aas_instance.start('AAS2', aas_instance);
		
		topsql_instance = new topsql_class();
		//topsql_instance1 = new topsql_class();
		
		topsql_instance.start('AAS1');
		topsql_instance.start('AAS2');
        //topsqlstart('AAS2');
		move_scheduler('AAS1', aas_instance);
		move_scheduler('AAS2', aas_instance);
        runtopsql_scheduler('AAS1', topsql_instance);
        runtopsql_scheduler('AAS2', topsql_instance);
        //move('AAS2');
        
        hideshowall();
        
        $("a#comp").click( function() {
		       if ($("div#AAS2").is(":hidden")) {
		          hideshowall();
		          aas_instance.refresh("AAS2");
		       } else {
		          hideshowall();
		       }
		   });
        
	}
});


//$(document).ready(
//		function()
//		{
//		   $("p#comp").click( function() {
//		       if ($("div#AAS2").is(":hidden")) {
//		          hideshowall();
//		          move("AAS2");
//		       } else {
//		          hideshowall();
//		       }
//		   });
//		});

