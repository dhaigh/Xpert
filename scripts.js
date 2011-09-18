( function () {

	"use strict";

	// main elements
	// note all vars that are jQuery objects have $ prefix
	var $QUESTIONS = $( "#questions" ),
		$RESTART = $( "#restart" ),

		// the raw tree
		tree = $( "#tree" ).html(),

		// the actual expert system object
		expert = new Xpert( tree, displayQuestion, displayResult ),

		// each possible result
		results = [],

		// whether or not an answer is being animated
		isAnimating = false;

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

	// remove the siblings after a given element
	function removeSiblingsAfter( $el ) {
		// get the index of the element and
		// .slice on the set of siblings
		$el.siblings().slice(
			$el.index()
		).remove();
	}

	function nextQuestion ( next ) {

		// do nothing for already selected answers
		if ( this.hasClass("active") ) {
			return;

		} else if ( this.hasClass("inactive") ) {

			this.siblings( ".active" ).animate( {"font-size": "1em"}, 200 )
									  .toggleClass( "active inactive" );

			// remove all descendant answers from view
			removeSiblingsAfter( this.parent() );

			// hide the restart button if an answer
			// was changed after a result was found
			$RESTART.hide();

		// neither answer has been chosen yet - 'radio'
		} else {

			// other answers are inactive
			this.siblings().addClass( "inactive" )
						   // answers can no longer be radio
						   .andSelf().removeClass( "radio" );

		}

		// flag to disable clicking the other
		// answer while this one is animating
		isAnimating = true;

		this.animate( {"font-size": "1.5em"}, 200, function () {
			isAnimating = false;

			// display the next question or result
			expert.next( next );
		}).removeClass( "inactive" ).addClass( "active" );

	}

	function displayQuestion ( question, answers ) {

		// the next question heading
		var $question = $( "<h2/>" ).html( question ),

			// container for the question (and answers)
			$container = $( "<div/>" ).hide().append( $question );

		$.each( answers, function (i, curr) {

			// the subTree of the answer - can
			// be another expert or an answer
			var answer = curr[ 0 ],
				next = curr[ 1 ],

				// the link of the answer
				$answer = $( "<a/>", {
					"href": "#",
					"class": "radio",
					"html": answer
				}).bind( "click", function () {

					// trigger the next question only if another
					// answer isn't being animated
					if ( !isAnimating ) {
						nextQuestion.call( $(this), next );
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

	function displayResult ( result ) {

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
			$wiki = $( "<iframe/>", {"src":  URL, "frameborder": 0} );

		// add the result and the wiki iframe
		$container.append( $result )
				  .append( $wiki );

		$QUESTIONS.append( $container );

		scrollTo( $container.fadeIn() );

		$RESTART.fadeIn();

	}

	$RESTART.click( function () {

		$QUESTIONS.fadeOut( function () {
			$( this ).html( "" ).show();

			// run the initial tree
			expert.next( Xpert.makeTree(tree) );
		});

		$( this ).hide();

		return false;

	});

	$.each( Xpert.getResults(expert.tree), function (i, result) {
		// trim off the wiki part
		results.push( result.split("|")[0] );
	});

	results.sort();
	results = results.join( "\n" );

	$( "#a-language" ).click( function () {
		alert( results );
		return false;
	});

}() );
