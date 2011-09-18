window.Xpert = ( function () {

	"use strict";

	// match any indent
	var rIndent = /^\s*/;

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

	// strips out the beginning and trailing
	// whitespace and blank lines of a raw tree
	function initialClean ( tree ) {

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

	}

	// get the indentation level
	function getIndentation ( str ) {

		// length of a string with regex removed
		function count ( regex, str ) {
			return str.length - str.replace( regex, "" ).length;
		}

		return count( rIndent, str );

	}

	// clean the indentation off a tree
	function clean ( tree ) {

		tree = Xpert.eachResponse( tree, function (answer) {
			return trim( answer );
		});

		return tree;

	}

	function makeTree ( tree ) {

		var question = tree[ 0 ],
			subTree = [],
			newTree = [ question, subTree ],
			nestLevel = getIndentation( question );

		// the first item will always be the question
		// so get the second onwards
		// TODO: custom iterator
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

	var Xpert = function ( tree, displayQuestion, displayResult ) {

		this.displayQuestion = displayQuestion;
		this.displayResult = displayResult;

		// display the first question
		this.next( Xpert.makeTree(tree) );

	};

	Xpert.prototype.next = function ( next ) {

		this.tree = next;

		if ( typeof next === "string" ) {
			this.displayResult( next );
		} else {
			this.displayQuestion( next[0], next[1] );
		}

	};

	// where the real parsing happens
	// the actual process probably needs more explaining
	Xpert.makeTree = function ( tree ) {
		tree = initialClean( tree );
		return makeTree( tree );
	};

	// applies a function to each response (question/possible answers/eventual result)
	// used internally for cleaning the indentation white-space
	// named function expression for recursion ftw!
	Xpert.eachResponse = function eachResponse ( tree, func ) {

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
	// (should probably add getQuestions and getAnswers)
	Xpert.getResults = function getResults ( tree ) {

		var results = [],
			subTree = tree[ 1 ];

		// was the final answer - result found
		if ( typeof subTree === "string" ) {
			results.push( tree );

		// more questions
		} else {

			$.each( subTree, function( i, answer ){
				// add each result
				$.each( getResults(answer[1]), function (j, result) {
					results.push( result );
				});
			});

		}

		return results;

	};

	return Xpert;

}() );
