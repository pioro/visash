function runtopsql_scheduler(chartname, topsql_instance) {
	if ( $("#refresh_" + chartname).is(':checked') ) {
		topsql_instance.refresh(chartname);
	}
	setTimeout(function() {
		runtopsql_scheduler(chartname, topsql_instance);
	}, 15000);
}

function topsql_class() {

	this.topsqlsarr = new Array();

	this.getdata = function getdata(topsqlpoints) {
		name = topsqlpoints.getname();
		var inst_id = "";
		var dbid = "";

		if (typeof sash_targets[$('#grupe').val()] != 'undefined') {
			inst_id = sash_targets[$('#grupe').val()].INST_ID;
			dbid = sash_targets[$('#grupe').val()].DBID;
		}

		$.ajax({
			url : '/sash/get_topsql',
			type : 'GET',
			dataType : 'json',
			async : false,
			data : {
				sample_time : $('#sample_time_' + name).val(),
    			inst_id	    : sash_targets[$('#grupe_'+name).val()].INST_ID,
    			dbid	    : sash_targets[$('#grupe_'+name).val()].DBID   
			},
			success : function(mydata) {
				if ( ! check_error (mydata)) {
					ltopsql = mydata.topsql;
					topsqlpoints.addtopsql(ltopsql);
					tsDate = new Date(mydata.currenttime * 1000);
					oldtime = new Date (Date.parse(mydata.oldest_time));
					$("#" + name + "_topstats").html(
							"Number of samples: " + mydata.total
									+ "<br>Oldest sample date : "
									+ oldtime.toUTCString());
				}
			},
			error : function(XMLHttpRequest, textStatus, errorThrown) {
				//alert(textStatus);
				display_error ("Problme with top sql gathering " + errorThrown.message);
			},
			cache : true
		});
	}

	//function runtopsql(name) {
	this.refresh = function(name) {
		var graphl = this.topsqlsarr[name].chart;
		var points = this.topsqlsarr[name].data;

		points.reset();

		this.getdata(points);

		newoptions = graphl.getOptions();

		graphset = points.getpoints();
		graphl.setData(graphset);
		graphl.setupGrid(newoptions);
		graphl.draw();

	};

	//	function createtopsql(name) {

	this.createchart = function(name) {
		topsqlpoints = new aasdata(name);
		this.getdata(topsqlpoints);
		ysize = topsqlpoints.getsize();
		topsqlgraph = $
				.plot(
						$("#" + name + "_topsql"),
						topsqlpoints.getpoints(),
						{
							xaxis : {
								show : true,
								tickLength : 0
							},
							yaxis : {
								tickFormatter : function(v, axis) {
									v = -v;
									if (topsqlpoints.getsql(v) == null) {
										retstr = '';
									} else {
										retstr = "<div style='margin-right: 10px; text-align: left'>"
												+ topsqlpoints.getsql(v)
												+ "</div>";
									}
									return retstr;
								},
								min : -ysize,
								max : 0.5,
								tickSize : 1,
								tickLength : 0
							},
							colors : [ "lime", "blue", "#3BB9FF", "#CA226B",
									"#B041FF", "#F62817", "#805817" ],
							series : {
								stack : true,
								bars : {
									show : true,
									horizontal : true,
									barWidth : 0.5,
									align : "center"
								}
							},
							grid : {
								show : true,
								borderWidth : 0,
								hoverable : true
							},
							legend : {
								show : false
							}
						});

		//  setTimeout(function() {runtopsql(name) }, 60000);
		return {
			chart : topsqlgraph,
			data : topsqlpoints
		};
	}

	//function topsqlstart(name) {
	this.start = function(name) {
		var previousPoint = null;
		function showTooltip(x, y, contents) {
			$('<div id="tooltip">' + contents + '</div>').css({
				position : 'absolute',
				display : 'none',
				top : y + 5,
				left : x + 5,
				border : '1px solid #fdd',
				padding : '2px',
				'background-color' : '#fee',
				opacity : 0.80
			}).appendTo("body").fadeIn(200);
		}

		topsqlgraph = this.createchart(name);
		$("#" + name + "_topsql")
				.bind(
						"plothover",
						function(event, pos, item) {
							if (item) {
								if (previousPoint != item.datapoint) {
									previousPoint = item.datapoint;

									$("#tooltip").remove();
									var x = item.datapoint[0].toFixed(2);

									showTooltip(item.pageX, item.pageY,
											item.series.label + " " + x + " %");
								}
							} else {
								$("#tooltip").remove();
								previousPoint = null;
							}
						});

		this.topsqlsarr[name] = topsqlgraph;

	};

}; // end of topsql module