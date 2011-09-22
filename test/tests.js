( function () {

function emptyFunc () { return function () {}; }

var tree1 = document.getElementById( "test1" ).innerHTML,
	tree1parsed = Xpert.makeTree( tree1 ),
	q1 = emptyFunc(),
	r1 = emptyFunc(),
	expert1 = new Xpert( tree1, q1, r1 ),

	tree2 = document.getElementById( "test2" ).innerHTML,
	tree2parsed = Xpert.makeTree( tree2 ),
	q2 = function ( q, a ) { expert2question = [q, a]; },
	r2 = function ( r ) { expert2result = r; },
	expert2 = new Xpert( tree2, q2, r2 ),
	expert2question,
	expert2result,

	tree3 = document.getElementById( "test3" ).innerHTML,
	tree3parsed = Xpert.makeTree( tree3 ),
	expert3 = new Xpert( tree3, emptyFunc(), emptyFunc() ),

	tree4 = document.getElementById( "test4" ).innerHTML,
	tree4parsed = Xpert.makeTree( tree4 ),
	expert4 = new Xpert( tree4, emptyFunc(), emptyFunc() );

test( "initialization", function () {
	expect( 3 );

	deepEqual( expert1.tree, tree1parsed, "tree parsed and exposed" );
	equal( expert1.displayQuestion, q1, "question callback registered" );
	equal( expert1.displayResult, r1, "result callback registered" );
});

test( "Xpert.makeTree() - parsing", function () {
	expect( 4 );

	var expected1 = [
		"testing 123", [
			["yes", "foo"],
			["no", "bar"]
		]
	],

	expected2 = [
		"testing 123", [
			["yes", "foo"],
			["no", [
				"moar test?",[
					["ja", "boo"],
					["nay", "hoo"]
				]
			]]
		]
	],

	expected3 = [
		"testing 123", [
			["yes", [
				"can has foo?", [
					["yes", [
						"sure?", [
							["yes", "fine, foo!"]
						]
					]]
				]
			]],
			["no", [
				"moar test?", [
					["ja", "boo"],
					["nay", "hoo"],
					["mm", "goo"]
				]
			]]
		]
	],

	expected4 = [
		"whitespace test!!1", [
			["pick me!", "^_^"]
		]
	];

	deepEqual( tree1parsed, expected1, "simple tree" );
	deepEqual( tree2parsed, expected2, "one level of nesting" );
	deepEqual( tree3parsed, expected3, "different numbers of responses including one" );
	deepEqual( tree4parsed, expected4, "spaces instead of tabs" );
});

test( "Xpert.mapResponses()", function () {
	expect( 1 );

	deepEqual( Xpert.mapResponses(expert1.tree, function (response) {
		return response + "x";
	}), ["testing 123x",[["yesx","foox"],["nox","barx"]]]);
});

test( ".getResults()", function () {
	expect( 1 );

	deepEqual( expert1.getResults(), ["foo","bar"] );
});

test( ".next()", function () {
	expect( 4 );

	expert1.next( tree1parsed[1][0] );
	deepEqual( expert1.tree, ["yes","foo"], "tree updated correctly #1" );

	expert1.next( tree1parsed[1][1] );
	deepEqual( expert1.tree, ["no","bar"], "tree updated correctly #2" );

	expert2.next( expert2.tree[1][0][1] );
	equal( expert2result, "foo", "result callback called with correct parameters" );

	expert2.next( tree2parsed[1][1][1] );
	deepEqual( expert2question, ["moar test?",[["ja","boo"],["nay","hoo"]]], "question callback called with correct parameters" );
});

// TODO: check the ES5 stuff is implemented correctly

}() );

