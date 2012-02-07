var Xpert = (function () {

    'use strict';

    var Xpert, methods = {'map': null, 'get': null};


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


        // get the indentation level
        function getIndentation(str) {

            // length of a string with regex removed
            function count(regex, str) {
                return str.length - str.replace(regex, '').length;
            }

            return count(/^\s*/, str);
        }

        // where the real parsing happens
        // the actual process probably needs more explaining
        function parse(tree) {

            var question = tree[0],
                answers = [],
                questionLevel = getIndentation(question),
                indentAmount = getIndentation(tree[1]) - questionLevel;

            // the first item will always be the question
            // so get the second onwards
            _.each(tree.slice(1), function (curr) {

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
        tree = methods.map.all(tree, function (response) {
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

    methods.map = {
        'all': function mapAll(tree, callback) {

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

        // todo: questions answers results
    };

    Xpert.map = function (type, tree, callback) {
        if (arguments.length === 2) {
            type = 'all';
            tree = arguments[0];
            callback = arguments[1];
        }

        tree = fix(tree);

        return methods.map[type](tree, callback);
    };

    Xpert.prototype.map = function (type, callback) {
        if (arguments.length === 1) {
            type = 'all';
            callback = arguments[0];
        }

        return methods.map[type](this.tree, callback);
    };




    //////////////////////////////////////////////////////////////
    // .get
    //////////////////////////////////////////////////////////////

    methods.get = {
        'all': function getAll(tree) {

            var items = [tree[0]]; // question

            _.each(tree[1], function (curr) {
                var currNext = curr[1];

                items.push(curr[0]); // answer

                if (typeof currNext === 'string') {
                    items.push(currNext); // result
                } else {
                    items = items.concat(getAll(currNext)); // recursion!
                }
            });

            return items;
        },

        'questions': function getQuestions(tree) {

            // tree always starts with a question
            var questions = [tree[0]];

            _.each(tree[1], function (curr) {
                var currNext = curr[1];

                if (typeof currNext !== 'string') {
                    questions = questions.concat(getQuestions(currNext));
                }
            });

            return questions;
        },

        'answers': function getAnswers(tree) {

            var answers = [];

            _.each(tree[1], function (curr) {
                var currNext = curr[1];

                answers.push(curr[0]);

                if (typeof currNext !== 'string') {
                    answers = answers.concat(getAnswers(currNext));
                }
            });

            return answers;
        },

        'results': function getResults(tree) {

            var results = [];

            // was the final answer - result found
            if (typeof tree === 'string') {
                return [tree];
            }

            // more questions
            _.each(tree[1], function (curr) {
                var currNext = curr[1];
                results = results.concat(getResults(currNext));
            });

            return results;
        }
    };

    Xpert.get = function (type, tree) {
        if (arguments.length === 1) {
            type = 'all';
            tree = arguments[0];
        }

        tree = fix(tree);

        return methods.get[type](tree);
    };

    Xpert.prototype.get = function (type) {
        if (arguments.length === 0) {
            type = 'all';
        }

        return methods.get[type](this.tree);
    };




    //////////////////////////////////////////////////////////////
    // .each
    //////////////////////////////////////////////////////////////

    function each(type, tree, callback) {
        _.each(methods.get[type](tree), callback);
    }

    Xpert.each = function (type, tree, callback) {
        if (arguments.length === 2) {
            type = 'all';
            tree = arguments[0];
            callback = arguments[1];
        }

        tree = fix(tree);

        each(type, tree, callback);
    };

    Xpert.prototype.each = function (type, callback) {
        if (arguments.length === 1) {
            type = 'all';
            callback = arguments[0];
        }

        each(type, this.tree, callback);
    };




    return Xpert;

}());