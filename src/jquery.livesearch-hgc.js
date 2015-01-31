/***
Live Search Improved
v1.0 - 31-jan-2015
by Herman Gomez
herman_internet@yahoo.es (for comments and questions)
based in original 2.0 Live Search version by Andreas Lagerkvist

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
- cut default durations.
- onSlideUp default value now is null to make it easier to verify.
- updatePosition config parameter had a typo.
- css config parameter added to set a class into the results div.
- preprocess1 and preprocess2 config functions to be able to process the result data and also to fill manually the results div.
- debug config and function added to see the resulting data before filling the result div.
- showLiveSearch was moved out of the object code to reuse the same function on other places.
- the slideUp function to hide the result div was cut to zero instead of using the duration from config.
- the width of result div now it's set to auto instead of a fixed width in pixels.


@title:
Live Search

@version:
2.0

@author:
Andreas Lagerkvist

@date:
2008-08-31

@url:
http://andreaslagerkvist.com/jquery/live-search/

@license:
http://creativecommons.org/licenses/by/3.0/

@copyright:
2008 Andreas Lagerkvist (andreaslagerkvist.com)

@requires:
jquery, jquery.liveSearch.css

@does:
Use this plug-in to turn a normal form-input in to a live ajax search widget. The plug-in displays any HTML you like in the results and the search-results are updated live as the user types.

@howto:
jQuery('#q').liveSearch({url: '/ajax/search.php?q='}); would add the live-search container next to the input#q element and fill it with the contents of /ajax/search.php?q=THE-INPUTS-VALUE onkeyup of the input.

@exampleHTML:
<form method="post" action="/search/">

	<p>
		<label>
			Enter search terms<br />
			<input type="text" name="q" />
		</label> <input type="submit" value="Go" />
	</p>

</form>

@exampleJS:
jQuery('#jquery-live-search-example input[name="q"]').liveSearch({url: Router.urlForModule('SearchResults') + '&q='});
***/
jQuery.fn.liveSearch = function (conf) {
	var config = jQuery.extend({
		url:			'/search-results.php?q=', 
		id:				'jquery-live-search',
		duration:		100, /*** hgc: 400, ***/ 
		typeDelay:		400, /*** hgc: 200, ***/
		loadingClass:	'loading',
		
		//hgc 31-jan-2015: slide up default set on null to make it easy to verify
		//onSlideUp:		function () {}, 
		onSlideUp:		null,
		
		//hgc 31-jan-2015: typo on source
		//uptadePosition:	false,
		updatePosition:	false,

		//hgc 31-jan-2015: added default class attribute
		css:				'jquery-live-search',
		
		//hgc 31-jan-2015: added data preprocess function
		preprocess1:			null,
		preprocess2:			null,

		//hgc 31-jan-2015: added debug of search results
		debug:			false
		
	}, conf);

	var liveSearch	= jQuery('#' + config.id);

	// hgc 31-jan-2015: moved this routine to outside call it from everywhere if need
	// Hides live-search for this input
	var hideLiveSearch2 = function () {
		/***
		 * hgc: original code on internals
		liveSearch.slideUp(config.duration, function () {
			config.onSlideUp();
		});
		***/
		if (null == config.onSlideUp) {
			liveSearch.slideUp(0);
		} else {
			liveSearch.slideUp(config.duration, function () {
				config.onSlideUp();
			});
		}
	};
	
	// Create live-search if it doesn't exist
	if (!liveSearch.length) {
		//hgc: add class attribute
		//liveSearch = jQuery('<div id="' + config.id + '"></div>')
		liveSearch = jQuery('<div id="' + config.id + '" class="' + config.css + '"></div>')
			.appendTo(document.body)
			.hide()
			.slideUp(0);

		// Close live-search when clicking outside it
		jQuery(document.body).click(function(event) {
			var clicked = jQuery(event.target);

			if (!(clicked.is('#' + config.id) || clicked.parents('#' + config.id).length || clicked.is('input'))) {
				/***
				 * hgc 31-jan-2015: using the new outer function to hide the results
				liveSearch.slideUp(config.duration, function () {
					config.onSlideUp();
				});
				***/
				hideLiveSearch2();
			}
		});
	}

	return this.each(function () {
		var input							= jQuery(this).attr('autocomplete', 'off');
		var liveSearchPaddingBorderHoriz	= parseInt(liveSearch.css('paddingLeft'), 10) + parseInt(liveSearch.css('paddingRight'), 10) + parseInt(liveSearch.css('borderLeftWidth'), 10) + parseInt(liveSearch.css('borderRightWidth'), 10);

		// Re calculates live search's position
		var repositionLiveSearch = function () {
			var tmpOffset	= input.offset();
			var inputDim	= {
				left:		tmpOffset.left, 
				top:		tmpOffset.top, 
				
				//hgc 31-jan-2015: width set to auto
				//width:	input.outerWidth(), 
				width:		'auto',
				//
				
				height:		input.outerHeight()
			};

			inputDim.topPos		= inputDim.top + inputDim.height;
			inputDim.totalWidth	= inputDim.width - liveSearchPaddingBorderHoriz;

			liveSearch.css({
				position:	'absolute', 
				left:		inputDim.left + 'px', 
				top:		inputDim.topPos + 'px',
				width:		inputDim.totalWidth + 'px'
			});
		};

		// Shows live-search for this input
		var showLiveSearch = function () {
			// Always reposition the live-search every time it is shown
			// in case user has resized browser-window or zoomed in or whatever
			repositionLiveSearch();

			// We need to bind a resize-event every time live search is shown
			// so it resizes based on the correct input element
			$(window).unbind('resize', repositionLiveSearch);
			$(window).bind('resize', repositionLiveSearch);

			liveSearch.slideDown(config.duration);
		};

		// Hides live-search for this input
		/***
		 * hgc: 31-jan-2015: moved/cloned to outside, but internally it will use it too
		var hideLiveSearch = function () {
			//liveSearch.slideUp(config.duration, function () {
			//	config.onSlideUp();
			//});
			if (null == config.onSlideUp) {
				liveSearch.slideUp(0);
			} else {
				liveSearch.slideUp(config.duration, function () {
					config.onSlideUp();
				});
			}
		};
		***/
		var hideLiveSearch = hideLiveSearch2;
		
		//hgc 31-jan-2015: added debug of search results
		var debugData = function(data) {
			alert('debugging...\nlength: ' + data.length + '\ndata:' + data);
		}; 

		input
			// On focus, if the live-search is empty, perform an new search
			// If not, just slide it down. Only do this if there's something in the input
			.focus(function () {
				if (this.value !== '') {
					// Perform a new search if there are no search results
					if (liveSearch.html() == '') {
						this.lastValue = '';
						input.keyup();
					}
					// If there are search results show live search
					else {
						// HACK: In case search field changes width onfocus
						setTimeout(showLiveSearch, 1);
					}
				}
			})
			// Auto update live-search onkeyup
			.keyup(function () {
				// Don't update live-search if it's got the same value as last time
				if (this.value != this.lastValue) {
					input.addClass(config.loadingClass);

					var q = this.value;

					// Stop previous ajax-request
					if (this.timer) {
						clearTimeout(this.timer);
					}

					// Start a new ajax-request in X ms
					this.timer = setTimeout(function () {
						jQuery.get(config.url + q, function (data) {
							input.removeClass(config.loadingClass);
							
							if (config.debug) debugData(data);

							// Show live-search if results and search-term aren't empty
							if (data.length && q.length) {
								
								//hgc 31-jan-2015: running new preprocess function
								if (null != config.preprocess1) {
									data = config.preprocess1(data);
									liveSearch.html(data);
									
								} else if(config.preprocess2) {
									config.preprocess2(data,liveSearch);
								}

								//hgc 31-jan-2015: because added two preprocess function
								//liveSearch.html(data);
								
								showLiveSearch();
							}
							else {
								hideLiveSearch();
							}
						});
					}, config.typeDelay);

					this.lastValue = this.value;
				}
			});
	});
};
