Xpert
=====

Xpert is a little thing for making expert systems.

`var someSexyExpert = new Xpert(tree, questionCallback, resultFoundCallback);`

Upon initialization, the question callback is immediately invoked.

The question callback has two parameters: the question, and the answer tree (more on that in a second).

The result callback has one: the result. It's only called if the result is an actual result - i.e. it's not a question (if that makes sense).

Trees
-----

A tree is an instance of a question and it's associated answers.

A tree may look like this:

<pre>Question
	Answer 1
		Result
	Answer 2
		Another result
	Answer 3
		Moar result!</pre>

Important: use the same amount of spacing for the indentation of anything on the same 'level'. It would be a good idea to simply pick one and use it for everything, e.g. one tab.

The idea is that you put your trees in a hidden `<pre>` and load the contents of it it into your script. Alternatively, you could Ajax them in if you felt like it.

This tree parses to give:

<pre>[
	"Question", [
		["Answer 1", "Result"],
		["Answer 2", "Another result"],
		["Answer 3", "Moar result!"]
	]
]</pre>

In general, trees are of the form:

`[question_text, [answer1, answer2, ... answerN]]`

and answers are of the form:

`[answer_text, result_text_or_another_question]`

Here's another example of how trees are parsed if you're still not quite sure:

<pre>Question
	Answer
		Foo?
			Yes
				Foo!
			No thanks
				Bar it is
	Answer 2.0
		party</pre>

Parsed:

<pre>[
	"Question", [
		["Answer", [
			"Foo?", [
				["Yes", "Foo!"],
				["No thanks", "Bar it is"]
			]
		]],
		["Answer 2.0", "party"]
	]
]</pre>

So if the first tree was passed to the constructor, the first call to the question callback would be something like:

`questionCallback("Question", [["Answer 1", "Result"],["Answer 2", "Another result"],["Answer 3", "Moar result!"]])`

Then in your callback function, you take the question argument, display it, then take the answer tree, display each possible answer and keep track of the result of each answer.

Either way, what you want to do is when an answer is selected, call the `.next()` method of your Xpert object, with the parameter being the result of that answer. Xpert will determine if more questions need to be asked or not, and runs the appropriate callback.

API
---

### Types

`all` - the whole tree

`questions` - any question

`answers` - any possible answer to any question

`results` - any possible result following an answer - i.e. no more questions exist

### Methods

#### Xpert#map(callback)

Returns a map of the tree.

#### Xpert#get(type = 'all')

Returns a list of the specified type in the tree.

#### Xpert#each(type = 'all', callback)

Short-hand for `_.each(Xpert#get(type = 'all'), callback)`

### Static methods

#### Xpert.map(tree, callback)

#### Xpert.get(type = 'all', tree)

#### Xpert.each(type = 'all', tree, callback)