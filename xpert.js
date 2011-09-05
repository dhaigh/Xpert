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

		// clean whitespace from the start of an array
		// with sub-arrays
		function clean ( tree ) {

			$.each( tree, function (i, curr) {

				if ( typeof curr === "string" ) {
					tree[ i ] = curr.replace( rIndent, "" );
				} else {
					tree[ i ] = clean( curr );
				}

			});

			return tree;

		}

		// where the real parsing happens
		function makeTree ( tree ) {

			var question       = tree[ 0 ],
				subTree        = [],
				newTree        = [ question, subTree ],
				questionIndent = getIndentation( question );

			// the first item will always be the question
			// so get the second onwards
			$.each( tree.slice(1), function (i, curr) {

				var indentation  = getIndentation(curr),
					nextQuestion = subTree,
					lastIndex    = nextQuestion.length - 1;

				// the next line is further indented, more questions coming
				if ( indentation === questionIndent + 1 ) {
					nextQuestion.push( [curr] );
				} else {
					nextQuestion[ lastIndex ].push( curr );
				}

			});

			$.each( subTree, function (i, curr) {

				var question    = curr[ 0 ],
					nextSubTree = curr.slice( 1 );

				// if more than one question-answer pair, more
				// sub-questions have not been nested
				if ( curr.length > 2 ) {
					subTree[ i ] = [ question, makeTree(nextSubTree) ];
				}

			});

			// clean tabs from the start of each question
			return clean( newTree );

		}

		return makeTree( tree );

	};

	// a simple utility to get some information about
	// a particular tree
	xpert.getQuestionInfo = function ( tree ) {

		var question  = tree[ 0 ],
			subTree   = tree[ 1 ],
			responses = [];

		// get each possible response for the question
		$.each( subTree, function (i, curr) {
			responses.push( curr[0] );
		});

		return {
			question: question,
			subTree: subTree,
			responses: responses
		};

	};

	return xpert;

}() );
