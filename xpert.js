;var Xpert = (function () {


    'use strict';


    var Xpert,

        getFunctions,
        mapFunctions;



    //////////////////////////////////////////////////////////////
    // Helpers
    //////////////////////////////////////////////////////////////

    // length of a string with regex removed
    function count(regex, str) {
        return str.length - str.replace(regex, '').length;
    }

    // get the indentation level
    function getIndentation(str) {
        return count(/^\s*/, str);
    }

    // strim trimmer
    function trim(str) {
        if (String.prototype.trim) {
            return str.trim();
        }

        return str.replace(/^\s+/).replace(/\s+$/);
    }





    //////////////////////////////////////////////////////////////
    // Parser
    //////////////////////////////////////////////////////////////


    function parseTree(tree) {

        // assume initial indent is 0, this
        // strips out all whitespace before
        // the first question
        tree = trim(tree).split('\n');

        // where the real parsing happens
        // the actual process probably needs more explaining
        function parse(tree) {

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

        }

        // parse the tree
        tree = parse(tree);

        // clean tabs from the start of each question
        tree = mapAll(tree, function (response) {
            return trim(response);
        });

        return tree;

    }


    // parse a tree if it isn't already
    function fix(tree) {
        if (typeof tree === 'string') {
            tree = parseTree(tree);
        }

        return tree;
    }



    //////////////////////////////////////////////////////////////
    // Xpert
    //////////////////////////////////////////////////////////////


    // the constructor - takes a raw tree and the two callbacks
    Xpert = function (tree, displayQuestion, displayResult) {

        this.displayQuestion = displayQuestion;
        this.displayResult = displayResult;

        tree = fix(tree);

        // display the first question
        this.next(tree);

    };


    Xpert.prototype.next = function (next) {

        // current state of the tree
        this.tree = next;

        if (typeof next === 'string') {
            this.displayResult(next);
        } else {
            this.displayQuestion(next[0], next[1]);
        }

    };


    Xpert.parseTree = parseTree;



    //////////////////////////////////////////////////////////////
    // .map
    //////////////////////////////////////////////////////////////

    mapFunctions = {
        'questions': mapQuestions,
        'answers': mapAnswers,
        'results': mapResults
    };



    // applies a function to each response (question/possible answers/eventual result)
    // used internally for cleaning the indentation white-space
    function mapAll(tree, callback) {

        return _.map(tree, function (curr) {

            // sets of question/answer/result are stored
            // in arrays - apply the function to the
            // actual string of each
            if (typeof curr === 'string') {
                // function called with the response as
                // the argument and returns changes to it
                return callback(curr);
            } else {
                return mapAll(curr, callback);
            }

        });

    }

    function mapQuestions(tree, callback) {

    }

    function mapAnswers(tree, callback) {

    }

    function mapResults(tree, callback) {

    }


    Xpert.map = function (type, tree, callback) {
        if (arguments.length === 2) {
            callback = tree;
            tree = type;

            tree = fix(tree);

            return mapAll(tree, callback);
        }

        tree = fix(tree);


    };

    Xpert.prototype.map = function (type, callback) {
        if (arguments.length === 1) {
            callback = type;

            return mapAll(this.tree, callback);
        }
    };







    //////////////////////////////////////////////////////////////
    // .get
    //////////////////////////////////////////////////////////////

    function getAll(tree) {

        var items = [tree[0]]; // first question

        _.each(tree[1], function (item) {
            items.push(item[0]); // answer

            if (typeof item[1] === 'string') {
                items.push(item[1]);                
            } else {
                items = items.concat(getAll(item[1])); // subtree
            }

        });

        return items;

    }

    function getQuestions(tree) {

        // tree always starts with a question
        var questions = [tree[0]];

        _.forEach(tree[1], function (curr) {
            var currNext = curr[1];

            // more questions - result not found
            if (typeof currNext !== 'string') {
                questions = questions.concat(getQuestions(currNext));
            }
        });

        return questions;

    }

    function getAnswers(tree) {

        var answers = [];

        _.each(tree[1], function (curr) {
            answers.push(curr[0]);

            if (typeof curr[1] !== 'string') {
                answers = answers.concat(getAnswers(curr[1]));
            }
        });

        return answers;

    }

    function getResults(tree) {

        var results = [];

        // was the final answer - result found
        if (typeof tree === 'string') {
            return [tree];
        }

        // more questions
        _.forEach(tree[1], function (curr) {
            var currNext = curr[1];
            results = results.concat(getResults(currNext));
        });

        return results;

    }

    getFunctions = {
        'questions': getQuestions,
        'answers': getAnswers,
        'results': getResults
    };

    Xpert.get = function (type, tree) {
        if (arguments.length === 1) {
            tree = type;

            tree = fix(tree);
            return getAll(tree);
        }

        tree = fix(tree);

        return getFunctions[type](tree);
    };

    Xpert.prototype.get = function (type) {
        if (arguments.length === 0) {
            return getAll(this.tree);
        }

        return getFunctions[type](this.tree);
    };


    //////////////////////////////////////////////////////////////
    // .each
    //////////////////////////////////////////////////////////////

    function each(type, tree, callback) {
        var items;

        if (arguments.length === 2) {
            items = getAll(tree);
        } else {
            items = getFunctions[type](tree);
        }

        _.forEach(items, function (curr) {
            callback(curr);
        });
    }

    Xpert.each = function (type, tree, callback) {
        tree = fix(tree);

        each(type, tree, callback);
    };

    Xpert.prototype.each = function (type, callback) {
        if (arguments.length === 1) {
            callback = type;
            each(this.tree, callback);

            return;
        }

        each(type, this.tree, callback);
    };


    return Xpert;

}());