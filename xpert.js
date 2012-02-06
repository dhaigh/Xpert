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

    function trim(str) {
        
    }

    // the constructor - takes a raw tree and the two callbacks
    var Xpert = function (tree, displayQuestion, displayResult) {

        this.displayQuestion = displayQuestion;
        this.displayResult = displayResult;

        // parse the tree if it isn't already
        if (typeof tree === "string") {
            tree = parseTree(tree);
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

    function parseTree(tree) {

        // assume initial indent is 0, this
        // strips out all whitespace before
        // the first question
        tree = tree.trim().split("\n"); // todo: whitespace newlines, shim

        // where the real parsing happens
        // the actual process probably needs more explaining
        var parse = function parse(tree) {

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

            answers = _.map(answers, function (curr) {

                // if more than one question-answer pair, more
                // sub-questions have not been nested - recursion!
                if (curr.length > 2) {
                    return [curr[0], parse(curr.slice(1))];
                } else {
                    return curr;
                }

            });

            return [question, answers];

        };

        // parse the tree
        tree = parse(tree);

        // clean tabs from the start of each question
        return mapAll(tree, function (response) {
            return response.trim(); //fill
        });

    }

    Xpert.parseTree = parseTree;




    function getQuestions(tree) {

        if (typeof tree === "string") {
            tree = Xpert.parseTree(tree);
        }

        // returns array of each possible question in a tree
        var get = function (tree) {

            // tree always starts with a question
            var questions = [tree[0]];

            _.forEach(tree[1], function (curr) {
                var currNext = curr[1];

                // more questions - result not found
                if (typeof currNext !== "string") {
                    questions = questions.concat(getQuestions(currNext));
                }
            });

            return questions;

        }

        return get(tree);

    }

    function getAnswers(tree) {

    }

    function getResults(tree) {

        var results = [];

        // was the final answer - result found
        if (typeof tree === "string") {
            return [tree];
        }

        // more questions
        tree[1].forEach(function (curr) {
            var currNext = curr[1];
            results = results.concat(getResults(currNext)); //todo:concat spprt?
        });

        return results;

    }

    Xpert.get = function (type, tree) {
        var funcs = {
            'questions' : getQuestions,
            'answers'   : getAnswers,
            'results'   : getResults
        };

        return funcs[type](tree);
    };

    Xpert.prototype.get = function (type) {
        return Xpert.get(type, this.tree);
    };





    Xpert.each = function (types, tree, callback) {
        if (arguments.length === 2) {
            func = tree;
            tree = types;
            mapAll(tree, callback);
        }

        var funcs = {
            'questions' : eachQuestion,
            'answers'   : eachAnswer,
            'results'   : eachResult
        };

        _.forEach(types, function (type) {
            funcs[type](tree, callback);
        });
        
    };

    Xpert.prototype.each = function (types, callback) {
        Xpert.each(types, this.tree, callback);
    };






    // applies a function to each response (question/possible answers/eventual result)
    // used internally for cleaning the indentation white-space
    function mapAll(tree, callback) {

        var map = function map(tree, callback) {

            if (typeof tree === "string") {
                tree = Xpert.parseTree(tree);
            }

            return _.map(tree, function (curr) {

                // sets of question/answer/result are stored
                // in arrays - apply the function to the
                // actual string of each
                if (typeof curr === "string") {
                    // function called with the response as
                    // the argument and returns changes to it
                    return callback(curr);
                } else {
                    return map(curr, callback);
                }

            });

        };

        if (typeof tree === "string") {
            tree = parseTree(tree);
        }

        return map(tree, callback);

    }


    // grand-daddy of maps
    Xpert.map = function (types, tree, callback) {
        if (arguments.length === 2) {
            callback = tree;
            tree = types;

            mapAll(tree, callback);
        }

        var funcs = {
            'questions' : mapQuestions,
            'answers'   : mapAnswers,
            'results'   : mapResults
        };

        _.forEach(types, function (type) {
            funcs[type](tree, callback);
        });

    };

    Xpert.prototype.map = function (types, callback) {

        if (arguments.length === 1) {
            return Xpert.map(this.tree, callback);
        }

        return Xpert.map(types, this.tree, callback);

    };

    return Xpert;

}());