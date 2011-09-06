( function () {

	function addQuestion ( tree ) {

		var questionInfo = xpert.getQuestionInfo( tree ),

			$question  = $( "<h2/>" ).html( questionInfo.question ),
			$container = $( "<div/>" ).hide().append( $question );

		$.each( questionInfo.responses, function (i, answer) {

			var next = questionInfo.subTree[ i ][ 1 ],

			$answer = $( "<a/>", {
				"href": "#",
				"class": "radio",
				"html": answer
			}).bind( "click", function () {

				nextQuestion( next );

				$( this ).animate( {"font-size": "1.5em"}, 200 )
						 .addClass( "active" )
						 .siblings( "a" ).addClass( "inactive" )
						 .add( this )
						   .removeClass( "radio" )
						   .removeAttr( "href" )
						   .unbind( "click" );

				return false;

			});

			$container.append( $answer );

		});

		$( "#questions" ).append( $container );
		$container.fadeIn();

		return $question;

	}

	function answerFound ( result ) {

		// first part is the answer, second the wiki page
		result = result.split( "|" );

		var language = result[ 0 ],
			URL = "http://en.wikipedia.org/wiki/" + result[ 1 ],

			message = "It's " + language + "!",

			$result = $( "<h2/>" ).addClass( "result" ).hide().html( message ),

			// set frameborder to 0 for IE
			$wiki = $( "<iframe/>", {"src":  URL, "frameborder": 0} ).hide();

		$( "#questions" ).append( $result )
						 .append( $wiki );

		$wiki.slideDown();

		$result.fadeIn( function () {
			$( "#restart" ).fadeIn();
		});

		return $result;

	}

	function scrollTo ( $el ) {

		// do this animation then skip to
		// the latest one
		$( "body" ).stop().animate({

			scrollTop: $el.offset().top

		}, 1000 );

	}

	function nextQuestion ( next ) {

		var nextHeading = typeof next === "string" ?
				answerFound( next ) : addQuestion( next );

		scrollTo( nextHeading );

	}

	// assume initial indent is 0, this
	// strips out all whitespace before
	// the first question
	// TODO: trim() doesn't work on IE
	var tree = $( "#tree" ).html().split( "\n" );
	tree = xpert( tree );

	// if executed with the context of
	// a DOM element, restart and hide it
	function init () {

		// context is a DOM element
		if ( this.nodeType ) {
			$( "#questions" ).html( "" );
			$( this ).hide();
		}

		nextQuestion( tree );
		return false;

	}

	init();

	$( "#restart" ).click( init );

}() );
