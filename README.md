----------------------------------------------
This repository will not receive more updates.
----------------------------------------------


# livesearch-hgc
Use this JQuery plug-in to turn a normal form-input in to a live ajax search widget. The plug-in displays any HTML you like in the results and the search-results are updated live as the user types.

Based in original 2.0 Live Search version by Andreas Lagerkvist.
Url: http://andreaslagerkvist.com/jquery/live-search/#jquery-plugin-example-code

example of preprocess functions:

		var liveSearchPreprocess1 = function(data) { 
			alert(data); //just for debugging
			//do something with the data here!
			return data; 
		}
		var liveSearchPreprocess2 = function(data,div) { 
			alert(data); //just for debugging
			//here you can create lot of stuff with or without jquery and then fill the result div yourself!
			div.html(data);
			return data; 
		}

Modifications:

v1.0 31-Jan-2015
- cut default durations.
- onSlideUp default value now is null to make it easier to verify.
- updatePosition config parameter had a typo.
- css config parameter added to set a class into the results div.
- preprocess1 and preprocess2 config functions to be able to process the result data and also to fill manually the results div.
- debug config and function added to see the resulting data before filling the result div.
- showLiveSearch was moved out of the object code to reuse the same function on other places.
- the slideUp function to hide the result div was cut to zero instead of using the duration from config.
- the width of result div now it's set to auto instead of a fixed width in pixels.

EOF
