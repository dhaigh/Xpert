Xpert
=====

Xpert is a little thing for making expert systems.

`var someSexyExpert = new Xpert( tree, questionCallback, resultFoundCallback );`

Upon initialization, the question callback is immediately invoked.

The question callback has two parameters: the question, and the answer tree (more on that in a second).

The result callback has one: the result. It's only called if the result is an actual result - i.e. it's not a question (if that makes sense).

Trees
-----

A tree is an instance of a question and it's associated answers.

Trees are of the form:

`[question_text, [answer1, answer2, ... answerN]]`

Answers are of the form:

`[answer_text, result_text_or_another_question]`

A tree is a string that has the following raw syntax:

For example:

<pre>Question
	Answer 1
		Result
	Answer 2
		Another result
	Answer 3
		Moar result!</pre>

This tree parses to give:

<pre>["Question", [
	["Answer 1", "Result"],
	["Answer 2", "Another result"],
	["Answer 3", "Moar result!"]
]]</pre>

So if this was the tree that was passed to the constructor, the first call to the question callback would be:

`questionCallback( "Question", [["Answer 1", "Result"],["Answer 2", "Another result"],["Answer 3", "Moar result!"]] )`

The idea is that you take the question argument, display it, then take the answer tree, display each possible answer and keep track of the result of each answer.

Either way, what you want to do is when an answer is selected, call the `.next()` method of your Xpert object, with the parameter being the result of that answer. Xpert will determine if more questions need to be asked or not, and runs the appropriate callback.

Here's another example if you're not quite sure:

<pre>Question
	Tough choice really
		Foo?
			Yes
				Foo!
			No thanks
				Bar it is</pre>

This tree would parse to give:

<pre>["Question", [
	["Tough choice really", [
		"Foo?", [
			["Yes", "Foo!"],
			["No thanks", "Bar it is"]
		]
	]]
]]</pre>

Methods
-------

`.next(tree)` - takes an Xpert object to a new state with a new tree and runs the appropriate callback

`.getResults()` - returns an array of all the results in the tree

Helper functions
----------------

`Xpert.parseTree(tree)` - takes a raw tree as the only parameter and returns the tree parsed

`Xpert.mapResponses(tree, func)` - takes a parsed tree and maps to each response and returns the new tree