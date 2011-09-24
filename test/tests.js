( function () {

function emptyFunc () { return function () {}; }

var tree1 = document.getElementById( "test1" ).innerHTML,
	tree1parsed = Xpert.parseTree( tree1 ),
	q1 = emptyFunc(),
	r1 = emptyFunc(),
	expert1 = new Xpert( tree1, q1, r1 ),

	tree2 = document.getElementById( "test2" ).innerHTML,
	tree2parsed = Xpert.parseTree( tree2 ),
	q2 = function ( q, a ) { expert2question = [q, a]; },
	r2 = function ( r ) { expert2result = r; },
	expert2 = new Xpert( tree2, q2, r2 ),
	expert2question,
	expert2result,

	tree3 = document.getElementById( "test3" ).innerHTML,
	tree3parsed = Xpert.parseTree( tree3 ),
	expert3 = new Xpert( tree3, emptyFunc(), emptyFunc() ),

	tree4 = document.getElementById( "test4" ).innerHTML,
	tree4parsed = Xpert.parseTree( tree4 ),
	expert4 = new Xpert( tree4, emptyFunc(), emptyFunc() ),

	tree5 = document.getElementById( "test5" ).innerHTML,
	tree5parsed = Xpert.parseTree( tree5 ),
	expert5 = new Xpert( tree5, emptyFunc(), emptyFunc() );

test( "Xpert", function () {
	expect( 4 );

	var expert1a = new Xpert( tree1parsed, emptyFunc(), emptyFunc() );

	deepEqual( expert1.tree, tree1parsed, "tree parsed and exposed" );
	deepEqual( expert1a.tree, tree1parsed, "tree that is already parsed is exposed" );
	equal( expert1.displayQuestion, q1, "question callback registered" );
	equal( expert1.displayResult, r1, "result callback registered" );
});

test( "Xpert#next", function () {
	expect( 4 );

	expert1.next( tree1parsed[1][0] );
	deepEqual( expert1.tree, ["yes","foo"], "tree updated correctly #1" );

	expert1.next( tree1parsed[1][1] );
	deepEqual( expert1.tree, ["no","bar"], "tree updated correctly #2" );

	expert2.next( expert2.tree[1][0][1] );
	equal( expert2result, "foo", "result callback called with correct parameters" );

	expert2.next( tree2parsed[1][1][1] );
	deepEqual( expert2question, ["moar test?",[["ja","boo"],["nay","hoo"]]], "question callback called with correct parameters" );

	expert1.next( tree1parsed );
	expert2.next( tree2parsed );

});

test( "Xpert#getQuestions", function () {
	expect( 5 );

	deepEqual( expert1.getQuestions(), ["testing 123"] );
	deepEqual( expert2.getQuestions(), ["testing 123","moar test?"] );
	deepEqual( expert3.getQuestions(), ["testing 123","can has foo?","sure?","moar test?"] );
	deepEqual( expert4.getQuestions(), ["whitespace test!!1"] );
	deepEqual( expert5.getQuestions(), ["x?","test..?","0.1+0.2?","bla?","blaa?","blaaaa?","who?","PhD?","5x2?","q?"] );
});

test( "Xpert#getResults", function () {
	expect( 5 );

	deepEqual( expert1.getResults(), ["foo","bar"] );
	deepEqual( expert2.getResults(), ["foo","boo","hoo"] );
	deepEqual( expert3.getResults(), ["fine, foo!","boo","hoo","goo"] );
	deepEqual( expert4.getResults(), ["^_^"] );
	deepEqual( expert5.getResults(), ["aye","correct!","durp?","yay","bla.","foo","c'mon children don't be shy","sounds good to me","fine","DR.","bar","nah","rawr","2","123","123"] );
});

test( "Xpert.parseTree", function () {
	expect( 5 );

	var expected1 = ["testing 123",[["yes", "foo"],["no", "bar"]]],
		expected2 = ["testing 123", [["yes", "foo"],["no", ["moar test?",[["ja", "boo"],["nay", "hoo"]]]]]],
		expected3 = ["testing 123", [["yes", ["can has foo?", [["yes", ["sure?", [["yes", "fine, foo!"]]]]]]],["no", ["moar test?", [["ja", "boo"],["nay", "hoo"],["mm", "goo"]]]]]],
		expected4 = ["whitespace test!!1", [["pick me!", "^_^"]]],
		expected5 = ["x?",[["a)","aye"],["b)",["test..?",[["a)",["0.1+0.2?",[["0.3","correct!"],["0.30000000000000004","durp?"]]]],["b)","yay"]]]],["c)",["bla?",[["yes",["blaa?",[["yes","bla."],["no",["blaaaa?",[["yes","foo"],["sorta",["who?",[["dr",["PhD?",[["ya",["5x2?",[["12","c'mon children don't be shy"],["10","sounds good to me"],["5x2","fine"]]]]]]],["who","DR."]]]],["not rly","bar"],["no","nah"]]]]]]],["no","rawr"]]]],["d)","2"],["e)",["q?",[["a)","123"],["b)","123"]]]]]];

	deepEqual( tree1parsed, expected1, "simple tree" );
	deepEqual( tree2parsed, expected2, "one level of nesting" );
	deepEqual( tree3parsed, expected3, "different numbers of responses including one" );
	deepEqual( tree4parsed, expected4, "spaces instead of tabs" );
	deepEqual( tree5parsed, expected5, "14 levels of nesting" );
});

test( "Xpert.mapTree", function () {
	expect( 1 );

	deepEqual( Xpert.mapTree(expert1.tree, function (response) {
		return response + "x";
	}), ["testing 123x",[["yesx","foox"],["nox","barx"]]]);
});

test( "Xpert.getQuestions", function () {
	expect( 5 );

	deepEqual( Xpert.getQuestions(expert1.tree), ["testing 123"] );
	deepEqual( Xpert.getQuestions(expert2.tree), ["testing 123","moar test?"] );
	deepEqual( Xpert.getQuestions(expert3.tree), ["testing 123","can has foo?","sure?","moar test?"] );
	deepEqual( Xpert.getQuestions(expert4.tree), ["whitespace test!!1"] );
	deepEqual( Xpert.getQuestions(expert5.tree), ["x?","test..?","0.1+0.2?","bla?","blaa?","blaaaa?","who?","PhD?","5x2?","q?"] );
});

test( "Xpert.getResults", function () {
	expect( 5 );

	deepEqual( Xpert.getResults(expert1.tree), ["foo","bar"] );
	deepEqual( Xpert.getResults(expert2.tree), ["foo","boo","hoo"] );
	deepEqual( Xpert.getResults(expert3.tree), ["fine, foo!","boo","hoo","goo"] );
	deepEqual( Xpert.getResults(expert4.tree), ["^_^"] );
	deepEqual( Xpert.getResults(expert5.tree), ["aye","correct!","durp?","yay","bla.","foo","c'mon children don't be shy","sounds good to me","fine","DR.","bar","nah","rawr","2","123","123"] );
});

}() );
