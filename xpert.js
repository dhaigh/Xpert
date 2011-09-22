var Xpert = ( function (undef) {

	"use strict";

	// some ES5 methods to work with
	String.prototype.trim = String.prototype.trim || function () {
		return this.replace( /^\s+/g, "" ).replace( /\s+$/g, "" );
	};

	Array.prototype.forEach = Array.prototype.forEach || function ( callback, context ) {

		var i = 0, len = this.length;
		for ( ; i < len; i++ ) {
			if ( this[i] !== undef ) {
				// context is optional - func.call(null/undef) is the same as func()
				callback.call( context, this[i], i, this );
			}
		}

	};

	Array.prototype.map = Array.prototype.map || function ( callback, context ) {

		var result = [];

		this.forEach( function (curr, i, self) {
			result[ i ] = callback.call( context, curr, i, self );
		});

		return result;

	};

	// length of a string with regex removed
	function count ( regex, str ) {
		return str.length - str.replace( regex, "" ).length;
	}

	// get the indentation level
	function getIndentation ( str ) {
		return count( /^\s*/, str );
	}

	// the constructor - takes a raw tree and the two callbacks
	var Xpert = function ( tree, displayQuestion, displayResult ) {

		this.displayQuestion = displayQuestion;
		this.displayResult = displayResult;

		// parse the tree if it isn't already
		if ( typeof tree === "string" ) {
			tree = Xpert.parseTree( tree );
		}

		// display the first question
		this.next( tree );

	};

	Xpert.prototype.next = function ( next ) {

		// use for storing the current state of the tree
		this.tree = next;

		if ( typeof next === "string" ) {
			this.displayResult( next );
		} else {
			this.displayQuestion( next[0], next[1] );
		}

	};

	// returns array of each possible result in a tree
	// (should probably add getQuestions and getAnswers)
	function getResults ( tree ) {

		var results = [],
			subTree = tree[ 1 ];

		// was the final answer - result found
		if ( typeof subTree === "string" ) {
			results.push( tree );

		// more questions
		} else {

			// add the results
			subTree.forEach( function (curr) {
				results = results.concat( getResults(curr[1]) );
			});

		}

		return results;

	}

	Xpert.prototype.getResults = function () {
		return getResults( this.tree );
	};

	// where the real parsing happens
	// the actual process probably needs more explaining
	function parseTree ( tree ) {

		var question = tree[ 0 ],
			answers = [],
			questionLevel = getIndentation( question );

		// the first item will always be the question
		// so get the second onwards
		tree.slice( 1 ).forEach( function (curr) {

			var answerLevel = getIndentation( curr ),
				last = answers.length - 1;

			// the next line is further indented, more questions coming
			if ( answerLevel === questionLevel + 1 ) {
				answers.push( [curr] );
			} else {
				answers[ last ].push( curr );
			}

		});

		answers = answers.map( function (curr) {

			// if more than one question-answer pair, more
			// sub-questions have not been nested - recursion!
			if ( curr.length > 2 ) {
				return [ curr[0], parseTree(curr.slice(1)) ];
			} else {
				return curr;
			}

		});

		return [ question, answers ];

	}

	Xpert.parseTree = function ( tree ) {

		// assume initial indent is 0, this
		// strips out all whitespace before
		// the first question
		tree = tree.trim().split( "\n" );

		// parse the tree
		tree = parseTree( tree );

		// clean tabs from the start of each question
		return Xpert.mapResponses( tree, function (response) {
			return response.trim();
		});

	};

	// applies a function to each response (question/possible answers/eventual result)
	// used internally for cleaning the indentation white-space
	// named function expression for recursion ftw!
	Xpert.mapResponses = function mapResponses ( tree, func ) {

		return tree.map( function (curr) {

			// sets of question/answer/result are stored
			// in arrays - apply the function to the
			// actual string of each
			if ( typeof curr === "string" ) {
				// function called with the response as
				// the argument and returns changes to it
				return func( curr );
			} else {
				return mapResponses( curr, func );
			}

		});

	};

	return Xpert;

}() );
