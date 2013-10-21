// call move every 15 sec
// need to add customer refresh name
function move_scheduler (chartname, aas_instance) {
	if ( $("#refresh_" + chartname).is(':checked') ) {
		aas_instance.refresh(chartname);
	}
	setTimeout(function() {
    	move_scheduler(chartname,aas_instance); 
    }, 15000);
};


var chartsarr = new Array();


function aas_class() {
	

	this.getdata = function  (points){ 
        name = points.getname();
        $.ajax({
                url: '/sash/get_aas_graph',
                type: 'GET',
                async: false,
                dataType : 'json',
                data: { sample_time : $("#sample_time_"+name).val() ,
	        			inst_id	    : sash_targets[$('#grupe_'+name).val()].INST_ID,
	        			dbid	    : sash_targets[$('#grupe_'+name).val()].DBID                	
                      },
                success: function(mydata) {
                	if ( ! check_error (mydata)) {
                        ash = mydata.ash;
						ctime = mydata.current_time;
						points.setmaxtime(Date.parse(ctime));
						$("#sample_time_"+name).val("" + ctime);
						if (ash.length == 0 ) {
							points.addemptyline(mydata.currenttime*1000);
						} else {
							points.addlines ( ash ) ;
			 			}
                	}
                },                
                error : function(XMLHttpRequest, textStatus, errorThrown) {
                        //alert ( textStatus );
                		display_error ("Problme with aas gathering " + errorThrown.message);
                },
                cache: true
        });
	}; 
        
        
     // moving points 

     this.refresh = function (chartname) {
               if ($("div#" + chartname).is(":hidden")) {
        		return;
               } 
               graphl = null ;

               graphl = chartsarr[chartname].chart;
               points = chartsarr[chartname].data;

               this.getdata(points);
               points.shiftpoints(samplesize);
               if (points.getfirst != null) { // always true
        	        newoptions = graphl.getOptions();
        	        (newoptions['xaxes'])[0].min = points.getmaxtime()-900000;
                	(newoptions['xaxes'])[0].max = points.getmaxtime(); 
                	(newoptions['xaxes'])[0].tickSize = [1, "minute"];
                	(newoptions['xaxes'])[0].minTickSize = [30, "second"];
        	        (newoptions['xaxes'])[0].show = true;
                        
                    graphset = points.getpoints(); 
                	graphl.setData(graphset);
                	graphl.setupGrid(newoptions);
                	graphl.draw();
                        
                	if (highlightedIndex != -1 ) {
                		this.highlighseries(chartname,highlightedIndex);
                    }
                } else {
                	graphset = [];
                    graphl.setData(graphset);
                    graphl.draw();
                }
        };

        

     // highlighting series

     this.highlighseries = function (chartname,seriesindex) {
       lgraph = chartsarr[chartname].chart;
       lgraph.unhighlight();
       series = lgraph.getData();
       highseries = series[seriesindex];
       numberofpoints = series[seriesindex].datapoints.points.length / series[seriesindex].datapoints.pointsize;
       for (var i=0;i<numberofpoints;i++) { 
     	  lgraph.highlight(seriesindex, i);
       }
     };

     this.start = function (chartname) {
        resetData();
        
        // create new instance of points class
        points = new aasdata (chartname);   

        graph = $.plot($("#" + chartname), points.getpoints(),
             {
                     xaxis: { show: true, mode: "time", minTickSize: [30, "second"] } ,
                     yaxis: { show: true, ticks: 4, min: 0 } ,
                     series: {
                       stack: true,
                       //lines: { show: true, fill: false, steps: false, lineWidth: 1 },
                       bars: { show: true, barWidth: 13*1000 , align: 'left',  lineWidth: 0 },
                     },
                     colors: ["lime", "blue", "#3BB9FF", "#CA226B", "#B041FF", "#F62817", "#805817"],
                     legend: {
                         show: true,
                         container:  $("#legend"),
                         labelFormatter: function(label, series) {
                         	// series is the series object for the label
                         	return '<div id="' + label.replace(/\s+/g, '-') + '">' + label + '</div>';
                         }
                     },
                     grid: {
                         show: true,
                         borderWidth: 0,
                         hoverable: true 
                     },
                     selection: { 
                     	mode: "x" 
                     }
             }
         );

        // add this object into array of graphs and data points 
        chartsarr[chartname] = { chart : graph, data : points };
        
        aas_object = this;
        
        
        // adding highlight serie if mouse over 
        $("#" + chartname).bind("plothover", function (event, pos, item) {
             // axis coordinates for other axes, if present, are in pos.x2, pos.x3, ...
             // if you need global screen coordinates, they are pos.pageX, pos.pageY
             
             if (item) {
                 if ( highlightedIndex != item.seriesIndex ) {
     		    //graph.unhighlight();
                	 aas_object.highlighseries(chartname,item.seriesIndex);
                    highlightedIndex = item.seriesIndex;
                 }
             } else {
            	chartsarr[chartname].chart.unhighlight();
                highlightedIndex = -1;
             }
         });



     };

}