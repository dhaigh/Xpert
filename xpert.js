var Xpert = (function () {

    "use strict";

    // length of a string with regex removed
    function count(regex, str) {
        return str.length - str.replace(regex, "").length;
    }

    // get the indentation level
    function getIndentation(str) {
        return count(/^\s*/, str);
    }

    // the constructor - takes a raw tree and the two callbacks
    var Xpert = function (tree, displayQuestion, displayResult) {

        this.displayQuestion = displayQuestion;
        this.displayResult = displayResult;

        // parse the tree if it isn't already
        if (typeof tree === "string") {
            tree = Xpert.parseTree(tree);
        }

        // display the first question
        this.next(tree);

    };

    Xpert.prototype.next = function (next) {

        // use for storing the current state of the tree
        this.tree = next;

        if (typeof next === "string") {
            this.displayResult(next);
        } else {
            this.displayQuestion(next[0], next[1]);
        }

    };

    Xpert.parseTree = function (tree) {

        // assume initial indent is 0, this
        // strips out all whitespace before
        // the first question
        tree = tree.trim().split("\n"); // todo: whitespace

        // where the real parsing happens
        // the actual process probably needs more explaining
        function parseTree(tree) {

            var question = tree[0],
                answers = [],
                questionLevel = getIndentation(question),
                indentAmount = getIndentation(tree[1]) - questionLevel;

            // the first item will always be the question
            // so get the second onwards
            _.forEach(tree.slice(1), function (curr) {

                var answerLevel = getIndentation(curr),
                    last = answers.length - 1;

                // the next line is further indented, more questions coming
                if (answerLevel === questionLevel + indentAmount) {
                    answers.push([curr]);
                } else {
                    answers[last].push(curr);
                }

            });

            answers = answers.map(function (curr) {

                // if more than one question-answer pair, more
                // sub-questions have not been nested - recursion!
                if (curr.length > 2) {
                    return [curr[0], parseTree(curr.slice(1))];
                } else {
                    return curr;
                }

            });

            return [question, answers];

        }

        // parse the tree
        tree = parseTree(tree);

        // clean tabs from the start of each question
        return Xpert.mapTree(tree, function (response) {
            return response.trim();
        });

    };

    // returns array of each possible question in a tree
    function getQuestions(tree) {

        // tree always starts with a question
        var questions = [tree[0]];

        tree[1].forEach(function (curr) {
            var currNext = curr[1];

            // more questions - result not found
            if (typeof currNext !== "string") {
                questions = questions.concat(getQuestions(currNext));
            }
        });

        return questions;

    }

    Xpert.getQuestions = function (tree) {

        if (typeof tree === "string") {
            tree = Xpert.parseTree(tree);
        }

        return getQuestions(tree);

    };

    Xpert.prototype.getQuestions = function () {
        return getQuestions(this.tree);
    };

    function getResults(tree) {

        var results = [];

        // was the final answer - result found
        if (typeof tree === "string") {
            return [tree];
        }

        // more questions
        tree[1].forEach(function (curr) {
            var currNext = curr[1];
            results = results.concat(getResults(currNext));
        });

        return results;

    }

    // returns array of each possible result in a tree
    Xpert.getResults = function (tree) {

        if (typeof tree === "string") {
            tree = Xpert.parseTree(tree);
        }

        return getResults(tree);

    };

    Xpert.prototype.getResults = function () {
        return getResults(this.tree);
    };

    function mapTree(tree, func) {

        if (typeof tree === "string") {
            tree = Xpert.parseTree(tree);
        }

        return tree.map(function (curr) {

            // sets of question/answer/result are stored
            // in arrays - apply the function to the
            // actual string of each
            if (typeof curr === "string") {
                // function called with the response as
                // the argument and returns changes to it
                return func(curr);
            } else {
                return mapTree(curr, func);
            }

        });

    }

    // applies a function to each response (question/possible answers/eventual result)
    // used internally for cleaning the indentation white-space
    Xpert.mapTree = function (tree, func) {

        if (typeof tree === "string") {
            tree = Xpert.parseTree(tree);
        }

        return mapTree(tree, func);

    };

    Xpert.prototype.mapTree = function (func) {
        return mapTree(this.tree, func);
    };

    return Xpert;

}());