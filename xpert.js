window.xpert = ( function () {

	"use strict";

	var xpert = function ( tree ) {

		// match any indent
		var rIndent = /^\s*/g;

		// get the indentation level
		function getIndentation ( str ) {

			// a little trick to count the occurrences
			// of a regex in a string
			function count ( regex, str ) {
				return str.length - str.replace( regex, "" ).length;
			}

			return count( rIndent, str );

		}

		// clean whitespace from the start of a tree
		function clean ( tree ) {

			tree = xpert.eachResponse( tree, function (answer) {
				return answer.replace( rIndent, "" );
			});

			return tree;

		}

		// where the real parsing happens
		// the actual process probably needs more explaining
		function makeTree ( tree ) {

			var question = tree[ 0 ],
				subTree = [],
				newTree = [ question, subTree ],
				nestLevel = getIndentation( question );

			// the first item will always be the question
			// so get the second onwards
			$.each( tree.slice(1), function (i, curr) {

				var indentation = getIndentation(curr),
					nextQuestion = subTree,
					lastIndex = nextQuestion.length - 1;

				// the next line is further indented, more questions coming
				if ( indentation === nestLevel + 1 ) {
					nextQuestion.push( [curr] );
				} else {
					nextQuestion[ lastIndex ].push( curr );
				}

			});

			$.each( subTree, function (i, curr) {

				var question = curr[ 0 ],
					next = curr.slice( 1 );

				// if more than one question-answer pair, more
				// sub-questions have not been nested
				if ( curr.length > 2 ) {
					subTree[ i ] = [ question, makeTree(next) ];
				}

			});

			// clean tabs from the start of each question
			return clean( newTree );

		}

		return makeTree( tree );

	};

	xpert.cleanTree = function ( tree ) {

		// implement a trim function because IE
		// doesn't have "".trim()
		function trim ( str ) {

			var nativeTrim = String.prototype.trim;

			if ( nativeTrim ) {
				return nativeTrim.call( str );
			} else {
				return str.replace( /^\s+/g, "" ).replace( /\s+$/g, "" );
			}

		}

		// assume initial indent is 0, this
		// strips out all whitespace before
		// the first question
		tree = trim( tree ).split( "\n" );

		// strip out blank lines
		$.each( tree, function (i, curr) {
			if ( !curr || !trim(curr) ) {
				tree.splice( i, 1 );
			}
		});

		return tree;

	};

	// applies a function to each response (question/possible answers/eventual result)
	// used internally for cleaning the indentation white-space
	// named function expression for recursion ftw!
	xpert.eachResponse = function eachResponse ( tree, func ) {

		$.each( tree, function (i, curr) {

			// sets of question/answer/result are stored
			// in arrays - apply the function to the
			// actual string of each
			if ( typeof curr === "string" ) {
				// function called with the response as
				// the argument and returns changes to it
				tree[ i ] = func( curr );
			} else {
				tree[ i ] = eachResponse( curr, func );
			}

		});

		return tree;

	};

	// returns array of each possible result in a tree
	// should probably add getQuestions and getAnswers
	xpert.getResults = function getResults ( tree ) {

		var results = [],
			subTree = tree[ 1 ];

		// if there are more questions
		if ( $.isArray(subTree) ) {

			$.each( subTree, function( i, answer ){
				// add each result
				$.each( getResults(answer[1]), function (j, result) {
					results.push( result );
				});
			});

		// was the final answer - result found
		} else {
			results.push( tree );
		}

		return results;

	};

	return xpert;

}() );
