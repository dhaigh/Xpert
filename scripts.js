( function () {

	"use strict";

	// main elements
	// note all vars that are jQuery objects have $ prefix
	var $QUESTIONS = $( "#questions" ),
		$RESTART = $( "#restart" ),

		// the raw tree
		tree = $( "#tree" ).html();

	// assume initial indent is 0, this
	// strips out all whitespace before
	// the first question
	tree = xpert.cleanTree( tree );

	// make nested
	tree = xpert( tree );

	function addQuestion ( tree ) {

		// get info about the current tree
		var question = tree[ 0 ],
			subTree = tree[ 1 ],

			// the next question heading
			$question = $( "<h2/>" ).html( question ),

			// container for the question (plus answers)
			$container = $( "<div/>" ).hide().append( $question );

		$.each( subTree, function (i, curr) {

			// the subtree of the answer - can
			// be another tree or an answer
			var answer = curr[ 0 ],
				next = curr[ 1 ],

				// the link of the answer
				$answer = $( "<a/>", {
					"href": "#",
					"class": "radio",
					"html": answer
				}).bind( "click", function () {
					// trigger the next question
					nextQuestion.call( this, next );

					// don't follow the #
					return false;
				});

			// show the answer
			$container.append( $answer );

		});

		// show the question its answers
		$QUESTIONS.append( $container );
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

			// the language found heading
			$result = $( "<h2/>" ).hide().addClass( "result" ).html( message ),

			// wiki iframe - set frameborder to 0 for IE
			$wiki = $( "<iframe/>", {src:  URL, frameborder: 0} ).hide();

		// add the result and the wiki iframe
		$QUESTIONS.append( $result )
				  .append( $wiki );

		$wiki.slideDown();

		$result.fadeIn( function () {
			$RESTART.fadeIn();
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

	// if executed with the context of
	// a DOM element, restart and hide it
	function init () {

		// context is a DOM element
		if ( this && this.nodeType ) {

			$QUESTIONS.fadeOut( function () {
				$( this ).html( "" ).show();
				addQuestion( tree );
			});

			// hide the element that called the restart
			$( this ).hide();

			return false;

		} else {
			addQuestion( tree );
		}

	}

	$RESTART.click( init );

	init();

}() );
