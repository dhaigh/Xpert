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

test( "Xpert#next()", function () {
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

test( "Xpert#map(callback)", function () {
	expect( 2 );

	deepEqual( expert1.map( function (response) {
		return response + "x";
	}), ["testing 123x",[["yesx","foox"],["nox","barx"]]]);

	deepEqual( expert1.tree, ["testing 123",[["yes","foo"],["no","bar"]]], "tree not modified" );
});

test( "TODO: Xpert#map('questions', callback)", function () {

});

test( "TODO: Xpert#map('answers', callback)", function () {

});

test( "TODO: Xpert#map('results', callback)", function () {

});

test( "TODO: Xpert#get('questions')", function () {

});

test( "Xpert#get('questions')", function () {
	expect( 5 );

	deepEqual( expert1.get('questions'), ["testing 123"] );
	deepEqual( expert2.get('questions'), ["testing 123","moar test?"] );
	deepEqual( expert3.get('questions'), ["testing 123","can has foo?","sure?","moar test?"] );
	deepEqual( expert4.get('questions'), ["whitespace test!!1"] );
	deepEqual( expert5.get('questions'), ["x?","test..?","0.1+0.2?","bla?","blaa?","blaaaa?","who?","PhD?","5x2?","q?"] );
});

test( "TODO: Xpert#get('answers')", function () {

});

test( "Xpert#get('results')", function () {
	expect( 5 );

	deepEqual( expert1.get('results'), ["foo","bar"] );
	deepEqual( expert2.get('results'), ["foo","boo","hoo"] );
	deepEqual( expert3.get('results'), ["fine, foo!","boo","hoo","goo"] );
	deepEqual( expert4.get('results'), ["^_^"] );
	deepEqual( expert5.get('results'), ["aye","correct!","durp?","yay","bla.","foo","c'mon children don't be shy","sounds good to me","fine","DR.","bar","nah","rawr","2","123","123"] );
});

test( "TODO: Xpert#each(callback)", function () {

});

test( "Xpert#each('questions', callback)", function () {
	expect( 5 );

	var questions1 = [],
		questions2 = [],
		questions3 = [],
		questions4 = [],
		questions5 = [];

	expert1.each('questions', function (question) {
		questions1.push(question);
	});
	expert2.each('questions', function (question) {
		questions2.push(question);
	});
	expert3.each('questions', function (question) {
		questions3.push(question);
	});
	expert4.each('questions', function (question) {
		questions4.push(question);
	});
	expert5.each('questions', function (question) {
		questions5.push(question);
	});

	deepEqual( questions1, expert1.get('questions') );
	deepEqual( questions2, expert2.get('questions') );
	deepEqual( questions3, expert3.get('questions') );
	deepEqual( questions4, expert4.get('questions') );
	deepEqual( questions5, expert5.get('questions') );
});

test( "Xpert#each('answers', callback)", function () {
	expect( 5 );

	var answers1 = [],
		answers2 = [],
		answers3 = [],
		answers4 = [],
		answers5 = [];

	expert1.each('answers', function (answer) {
		answers1.push(answer);
	});
	expert2.each('answers', function (answer) {
		answers2.push(answer);
	});
	expert3.each('answers', function (answer) {
		answers3.push(answer);
	});
	expert4.each('answers', function (answer) {
		answers4.push(answer);
	});
	expert5.each('answers', function (answer) {
		answers5.push(answer);
	});

	deepEqual( answers1, expert1.get('answers') );
	deepEqual( answers2, expert2.get('answers') );
	deepEqual( answers3, expert3.get('answers') );
	deepEqual( answers4, expert4.get('answers') );
	deepEqual( answers5, expert5.get('answers') );
});

test( "Xpert#each('results', callback)", function () {
	expect( 5 );

	var results1 = [],
		results2 = [],
		results3 = [],
		results4 = [],
		results5 = [];

	expert1.each('results', function (result) {
		results1.push(result);
	});
	expert2.each('results', function (result) {
		results2.push(result);
	});
	expert3.each('results', function (result) {
		results3.push(result);
	});
	expert4.each('results', function (result) {
		results4.push(result);
	});
	expert5.each('results', function (result) {
		results5.push(result);
	});

	deepEqual( results1, expert1.get('results') );
	deepEqual( results2, expert2.get('results') );
	deepEqual( results3, expert3.get('results') );
	deepEqual( results4, expert4.get('results') );
	deepEqual( results5, expert5.get('results') );
});

test( "Xpert.parseTree(tree)", function () {
	expect( 5 );

	var expected1 = ["testing 123",[["yes", "foo"],["no", "bar"]]],
		expected2 = ["testing 123", [["yes", "foo"],["no", ["moar test?",[["ja", "boo"],["nay", "hoo"]]]]]],
		expected3 = ["testing 123", [["yes", ["can has foo?", [["yes", ["sure?", [["yes", "fine, foo!"]]]]]]],["no", ["moar test?", [["ja", "boo"],["nay", "hoo"],["mm", "goo"]]]]]],
		expected4 = ["whitespace test!!1", [["pick me!", "^_^"]]],
		expected5 = ["x?",[["a)","aye"],["b)",["test..?",[["a)",["0.1+0.2?",[["0.3","correct!"],["0.30000000000000004","durp?"]]]],["b)","yay"]]]],["c)",["bla?",[["yes",["blaa?",[["yes","bla."],["no",["blaaaa?",[["yes","foo"],["sorta",["who?",[["dr",["PhD?",[["ya",["5x2?",[["12","c'mon children don't be shy"],["10","sounds good to me"],["5x2","fine"]]]]]]],["who","DR."]]]],["not rly","bar"],["no","nah"]]]]]]],["no","rawr"]]]],["d)","2"],["e)",["q?",[["a)","123"],["b)","123"]]]]]];

	deepEqual( tree1parsed, expected1, "simple tree" );
	deepEqual( tree2parsed, expected2, "one level of nesting" );
	deepEqual( tree3parsed, expected3, "varying indents" );
	deepEqual( tree4parsed, expected4, "spaces instead of tabs" );
	deepEqual( tree5parsed, expected5, "14 levels of nesting" );
});

test( "Xpert.map(tree)", function () {
	expect( 3 );

	deepEqual( Xpert.map(expert1.tree, function (response) {
		return response + "x";
	}), ["testing 123x",[["yesx","foox"],["nox","barx"]]]);

	deepEqual( Xpert.map(tree1, function (response) {
		return response + "x";
	}), ["testing 123x",[["yesx","foox"],["nox","barx"]]], "works for non-parsed trees" );

	deepEqual( expert1.tree, ["testing 123",[["yes","foo"],["no","bar"]]], "tree not modified" );
});

test( "Xpert.get('questions', tree)", function () {
	expect( 6 );

	deepEqual( Xpert.get('questions', expert1.tree), ["testing 123"] );
	deepEqual( Xpert.get('questions', tree1), ["testing 123"], "works for non-parsed trees" );
	deepEqual( Xpert.get('questions', expert2.tree), ["testing 123","moar test?"] );
	deepEqual( Xpert.get('questions', expert3.tree), ["testing 123","can has foo?","sure?","moar test?"] );
	deepEqual( Xpert.get('questions', expert4.tree), ["whitespace test!!1"] );
	deepEqual( Xpert.get('questions', expert5.tree), ["x?","test..?","0.1+0.2?","bla?","blaa?","blaaaa?","who?","PhD?","5x2?","q?"] );
});

test( "TODO: Xpert.get('answers', tree)", function () {

});

test( "Xpert.get('results', tree)", function () {
	expect( 6 );

	deepEqual( Xpert.get('results', expert1.tree), ["foo","bar"] );
	deepEqual( Xpert.get('results', tree1), ["foo","bar"], "works for non-parsed trees" );
	deepEqual( Xpert.get('results', expert2.tree), ["foo","boo","hoo"] );
	deepEqual( Xpert.get('results', expert3.tree), ["fine, foo!","boo","hoo","goo"] );
	deepEqual( Xpert.get('results', expert4.tree), ["^_^"] );
	deepEqual( Xpert.get('results', expert5.tree), ["aye","correct!","durp?","yay","bla.","foo","c'mon children don't be shy","sounds good to me","fine","DR.","bar","nah","rawr","2","123","123"] );
});






}() );