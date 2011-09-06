( function () {

	function addQuestion ( tree ) {

		// get info about the current tree
		var questionInfo = xpert.getQuestionInfo( tree ),

			// the next question heading
			$question  = $( "<h2/>" ).html( questionInfo.question ),

			// container for the question (plus answers)
			$container = $( "<div/>" ).hide().append( $question );

		$.each( questionInfo.responses, function (i, answer) {

			// the tree of each question - can
			// be another tree or an answer
			var next = questionInfo.subTree[ i ][ 1 ],

			$answer = $( "<a/>", {
				"href": "#",
				"class": "radio",
				"html": answer
			}).bind( "click", function () {

				nextQuestion.call( this, next );

				// don't follow the #
				return false;

			});

			// show the answer
			$container.append( $answer );

		});

		// show the question its answers
		$( "#questions" ).append( $container );
		$container.fadeIn();

		// return the question element for scrolling
		return $question;

	}

	function answerFound ( result ) {

		// first part is the answer, second the wiki page
		result = result.split( "|" );

		var language = result[ 0 ],
			// wiki page of the language found
			URL = "http://en.wikipedia.org/wiki/" + result[ 1 ],

			message = "It's " + language + "!",

			$result = $( "<h2/>" ).hide().addClass( "result" ).html( message ),

			// set frameborder to 0 for IE
			$wiki = $( "<iframe/>", {src:  URL, frameborder: 0} ).hide();

		// add the result and the wiki iframe
		$( "#questions" ).append( $result )
						 .append( $wiki );

		$wiki.slideDown();

		$result.fadeIn( function () {
			$( "#restart" ).fadeIn();
		});

		return $result;

	}

	// animate the window's scroll position
	// to the specified element
	function scrollTo ( $el ) {
		// do this animation then skip to
		// the latest one. note: some browsers
		// require scrolling body (Chrome), some html (FF, IE)
		$( "html, body" ).stop().animate({

			scrollTop: $el.offset().top

		}, 1000 );
	}

	// insert the appropriate heading and scroll to it
	// next can be an array of the next
	// question(s) or the answer
	function nextQuestion ( next ) {

		var nextHeading = typeof next === "string" ?
				answerFound( next ) : addQuestion( next );

		scrollTo( nextHeading );

		// "this" is the link of the answer chosen

		$( this ).animate( {"font-size": "1.5em"}, 200 )
				 .addClass( "active" )

				 // disable other answers
				 .siblings( "a" ).addClass( "inactive" )
				 
				  // disable all answers
				 .add( this )
				   .removeClass( "radio" )
				   .removeAttr( "href" )
				   .unbind( "click" );

	}

	// assume initial indent is 0, this
	// strips out all whitespace before
	// the first question
	var tree = $("#tree").html();

	// clean blank lines
	tree = xpert.cleanTree( tree );

	// make nested
	tree = xpert( tree );

	// if executed with the context of
	// a DOM element, restart and hide it
	function init () {

		// context is a DOM element
		if ( this.nodeType ) {
			$( "#questions" ).html( "" );
			$( this ).hide();
		}

		addQuestion( tree );
		return false;

	}

	$( "#restart" ).click( init );

	init();

}() );
