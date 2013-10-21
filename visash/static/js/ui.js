function hideshowall() {
  $("div#AAS2").toggle(); 
  $("div#AAS2_topsql").toggle(); 
  $("div#AAS2_topstats").toggle(); 
  $("div#AAS2_controls").toggle(); 
  //$("#ash_params_aas2").toggle(); 
}

function display_error ( message ) {
	$("#dialog-message").html(message);
	$('#dialog-overlay').show();
	$('#dialog-box').show();
}

function check_error ( data ) {
	if (typeof data.error != 'undefined') {
		display_error ( "Error message " + data.error.message );
		return 1;
	} else {
		return 0;
	}
}

var sash_targets = new Array();

var sash_detected = 0;

// disable the select control until you get the data
//$("#groupe").prop('disabled', true);    


function populateSelectWithOptions($select, data)
{
    // remove any exisiting contents
    $select.prop('disabled', true);
    $select.html('');
    
    //iterate over the data and append a select option for each item
    $.each(data.sash_targets, function(key, val) {
    	if (typeof val.SID != 'undefined') {
    		sash_targets.push (val);
    		$select.append('<option value="' + (sash_targets.length-1) + '">' + val.DBNAME + " - " + val.SID + '</option>');
    	}
    });
    
    // enable the select control
    $select.prop('disabled', false);
}

function getTable() {
    $.ajax({
        dataType: 'json',
        type: 'GET',
        url: '/sash/get_sash_targets',
        async: false,
        success: function(response, status) {
            console.log(response, status);
            if (status == "success")
            {
            	if ( ! check_error (response)) {
                	sash_detected = 1;
                    populateSelectWithOptions($("#grupe_AAS1"), response);
                    populateSelectWithOptions($("#grupe_AAS2"), response);
            	} else {
            		sash_detected = 0;
            	}
            }
        },
    });
}

