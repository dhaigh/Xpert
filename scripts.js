( function () {

	"use strict";

	// main elements
	// note all vars that are jQuery objects have $ prefix
	var $QUESTIONS = $( "#questions" ),
		$RESTART = $( "#restart" ),

		// the raw tree
		tree = $( "#tree" ).html(),

		// array to hold each possible result
		results = [],

		// whether or not an answer is being animated
		isAnimating = false;

	// assume initial indent is 0, this
	// strips out all whitespace before
	// the first question
	tree = xpert.cleanTree( tree );

	// make nested
	tree = xpert( tree );

	// animate the window's scroll position
	// to the specified element
	function scrollTo ( $el ) {
		// do this animation then skip to
		// the latest one. note: some browsers
		// require scrolling body (Chrome), some html (FF, IE)
		$( "html, body" ).clearQueue().animate({
			scrollTop: $el.offset().top
		}, 1000 );
	}

	function addQuestion ( tree ) {

		// get info about the current tree
		var question = tree[ 0 ],
			subTree = tree[ 1 ],

			// the next question heading
			$question = $( "<h2/>" ).html( question ),

			// container for the question (and answers)
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
					if ( !isAnimating ) {
						nextQuestion.call( this, next );
					}

					// don't follow the #
					return false;
				});

			$container.append( $answer );

		});

		// show the question its answers
		$QUESTIONS.append( $container );

		scrollTo( $container.fadeIn() );

	}

	function answerFound ( result ) {

		// first part is the answer, second the wiki page
		result = result.split( "|" );

		var language = result[ 0 ],
			// wiki page of the language found
			URL = "http://en.wikipedia.org/wiki/" + result[ 1 ],

			message = "It's " + language + "!",

			$container = $( "<div/>" ).hide(),

			// the language found heading
			$result = $( "<h2/>" ).addClass( "result" ).html( message ),

			// wiki iframe - set frameborder to 0 for IE
			$wiki = $( "<iframe/>", {src:  URL, frameborder: 0} );

		// add the result and the wiki iframe
		$container.append( $result )
				  .append( $wiki );

		$QUESTIONS.append( $container );

		scrollTo( $container.fadeIn( function () {
			$RESTART.fadeIn();
		}));

	}

	// insert the appropriate heading and scroll to it
	// next can be an array of the next
	// question(s) or the answer
	function nextQuestion ( next ) {

		var answerLinks = {
				activate: function ( el, callback ) {

					$( el ).animate( {"font-size": "1.5em"}, 200, callback )
						   .addClass( "active" )

						   // disable other answers
						   .siblings( "a" ).addClass( "inactive" )

						   // no longer radio
						   .andSelf().removeClass( "radio" );
				},

				deactivateOthers: function  ( el ) {
					$( el ).removeClass( "inactive" )

							// animate the active link back to normal
						   .siblings( ".active" )
								.animate( {"font-size": "1em"}, 200 )
								.toggleClass( "active inactive" );
				}
			},

			nextIsAnswer = typeof next === "string";

		function removeSiblingsAfter( $el ) {
			// get the index of the element and
			// .slice on the set of siblings
			$el.siblings().slice(
				$el.index()
			).remove();
		}

		// do nothing for already selected answers
		if ( $(this).hasClass("active") ) {
			return;
		} else if ( $(this).hasClass("inactive") ) {

			// remove all descendant answers from view
			removeSiblingsAfter( $(this).parent() );

			// make the currently active link no longer active
			answerLinks.deactivateOthers( this );

			// hide the restart button if an answer
			// was changed after a result was found
			$RESTART.hide();

		}

		// flag to disable clicking the other
		// answer while this one is animating
		isAnimating = true;
		answerLinks.activate( this, function () {

			isAnimating = false;

			if ( nextIsAnswer ) {
				answerFound( next );
			} else {
				addQuestion( next );
			}

		});
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

	$.each( xpert.getResults(tree), function (i, result) {
		// trim off the wiki part
		results.push( result.split("|")[0] );
	});

	results.sort();
	results = results.join( "\n" );

	$( "#a-language" ).click( function () {
		alert( results );
		return false;
	});

	init();

}() );
