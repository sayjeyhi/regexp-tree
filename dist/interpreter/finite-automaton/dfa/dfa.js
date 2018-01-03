/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DFAMinimizer = require('./dfa-minimizer');
var TablePrinter = require('../table-printer');
var colors = require('colors');

var _require = require('../special-symbols'),
    EPSILON_CLOSURE = _require.EPSILON_CLOSURE;

/**
 * DFA is build by converting from NFA (subset construction).
 */


var DFA = function () {
  function DFA(nfa) {
    _classCallCheck(this, DFA);

    this._nfa = nfa;
  }

  /**
   * Minimizes DFA.
   */


  _createClass(DFA, [{
    key: 'minimize',
    value: function minimize() {
      this.getTransitionTable();

      this._originalAcceptingStateNumbers = this._acceptingStateNumbers;
      this._originalTransitionTable = this._transitionTable;

      DFAMinimizer.minimize(this);
    }

    /**
     * Returns alphabet for this DFA.
     */

  }, {
    key: 'getAlphabet',
    value: function getAlphabet() {
      return this._nfa.getAlphabet();
    }

    /**
     * Returns accepting states.
     */

  }, {
    key: 'getAcceptingStateNumbers',
    value: function getAcceptingStateNumbers() {
      if (!this._acceptingStateNumbers) {
        // Accepting states are determined during table construction.
        this.getTransitionTable();
      }

      return this._acceptingStateNumbers;
    }

    /**
     * Returns original accepting states.
     */

  }, {
    key: 'getOriginaAcceptingStateNumbers',
    value: function getOriginaAcceptingStateNumbers() {
      if (!this._originalAcceptingStateNumbers) {
        // Accepting states are determined during table construction.
        this.getTransitionTable();
      }

      return this._originalAcceptingStateNumbers;
    }

    /**
     * Sets transition table.
     */

  }, {
    key: 'setTransitionTable',
    value: function setTransitionTable(table) {
      this._transitionTable = table;
    }

    /**
     * Sets accepting states.
     */

  }, {
    key: 'setAcceptingStateNumbers',
    value: function setAcceptingStateNumbers(stateNumbers) {
      this._acceptingStateNumbers = stateNumbers;
    }

    /**
     * DFA transition table is built from NFA table.
     */

  }, {
    key: 'getTransitionTable',
    value: function getTransitionTable() {
      var _this = this;

      if (this._transitionTable) {
        return this._transitionTable;
      }

      // Calculate from NFA transition table.
      var nfaTable = this._nfa.getTransitionTable();
      var nfaStates = Object.keys(nfaTable);

      this._acceptingStateNumbers = new Set();

      // Start state of DFA is E(S[nfa])
      var startState = nfaTable[nfaStates[0]][EPSILON_CLOSURE];

      // Init the worklist (states which should be in the DFA).
      var worklist = [startState];

      var alphabet = this.getAlphabet();
      var nfaAcceptingStates = this._nfa.getAcceptingStateNumbers();

      var dfaTable = {};

      // Determine whether the combined DFA state is accepting.
      var updateAcceptingStates = function updateAcceptingStates(states) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = nfaAcceptingStates[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var nfaAcceptingState = _step.value;

            // If any of the states from NFA is accepting, DFA's
            // state is accepting as well.
            if (states.includes(nfaAcceptingState)) {
              _this._acceptingStateNumbers.add(states.join(','));
              break;
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      };

      while (worklist.length > 0) {
        var states = worklist.shift();
        var dfaStateLabel = states.join(',');
        dfaTable[dfaStateLabel] = {};

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = alphabet[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var symbol = _step2.value;

            var onSymbol = [];

            // Determine whether the combined state is accepting.
            updateAcceptingStates(states);

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
              for (var _iterator3 = states[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var state = _step3.value;

                var nfaStatesOnSymbol = nfaTable[state][symbol];
                if (!nfaStatesOnSymbol) {
                  continue;
                }

                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                  for (var _iterator4 = nfaStatesOnSymbol[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var nfaStateOnSymbol = _step4.value;

                    if (!nfaTable[nfaStateOnSymbol]) {
                      continue;
                    }
                    onSymbol.push.apply(onSymbol, _toConsumableArray(nfaTable[nfaStateOnSymbol][EPSILON_CLOSURE]));
                  }
                } catch (err) {
                  _didIteratorError4 = true;
                  _iteratorError4 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                      _iterator4.return();
                    }
                  } finally {
                    if (_didIteratorError4) {
                      throw _iteratorError4;
                    }
                  }
                }
              }
            } catch (err) {
              _didIteratorError3 = true;
              _iteratorError3 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                  _iterator3.return();
                }
              } finally {
                if (_didIteratorError3) {
                  throw _iteratorError3;
                }
              }
            }

            var dfaStatesOnSymbolSet = new Set(onSymbol);
            var dfaStatesOnSymbol = [].concat(_toConsumableArray(dfaStatesOnSymbolSet));

            if (dfaStatesOnSymbol.length > 0) {
              var dfaOnSymbolStr = dfaStatesOnSymbol.join(',');

              dfaTable[dfaStateLabel][symbol] = dfaOnSymbolStr;

              if (!dfaTable.hasOwnProperty(dfaOnSymbolStr)) {
                worklist.unshift(dfaStatesOnSymbol);
              }
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }

      return this._transitionTable = this._remapStateNumbers(dfaTable);
    }

    /**
     * Remaps state numbers in the resulting table:
     * combined states '1,2,3' -> 1, '3,4' -> 2, etc.
     */

  }, {
    key: '_remapStateNumbers',
    value: function _remapStateNumbers(calculatedDFATable) {
      var newStatesMap = {};

      this._originalTransitionTable = calculatedDFATable;
      var transitionTable = {};

      Object.keys(calculatedDFATable).forEach(function (originalNumber, newNumber) {
        newStatesMap[originalNumber] = newNumber + 1;
      });

      for (var originalNumber in calculatedDFATable) {
        var originalRow = calculatedDFATable[originalNumber];
        var row = {};

        for (var symbol in originalRow) {
          row[symbol] = newStatesMap[originalRow[symbol]];
        }

        transitionTable[newStatesMap[originalNumber]] = row;
      }

      // Remap accepting states.
      this._originalAcceptingStateNumbers = this._acceptingStateNumbers;
      this._acceptingStateNumbers = new Set();

      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = this._originalAcceptingStateNumbers[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var _originalNumber = _step5.value;

          this._acceptingStateNumbers.add(newStatesMap[_originalNumber]);
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      return transitionTable;
    }

    /**
     * Returns original DFA table, where state numbers
     * are combined numbers from NFA.
     */

  }, {
    key: 'getOriginalTransitionTable',
    value: function getOriginalTransitionTable() {
      if (!this._originalTransitionTable) {
        // Original table is determined during table construction.
        this.getTransitionTable();
      }
      return this._originalTransitionTable;
    }

    /**
     * Prints transition table.
     */

  }, {
    key: 'printTransitionTable',
    value: function printTransitionTable() {
      var header = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '\nDFA transition table:\n';

      console.info(colors.bold(header));

      var alphabet = [].concat(_toConsumableArray(this.getAlphabet()));

      var printer = new TablePrinter({
        head: [''].concat(alphabet)
      });

      var table = this.getTransitionTable();
      var acceptingStates = this.getAcceptingStateNumbers();

      var _loop = function _loop(stateNumber) {
        var tableRow = table[stateNumber];

        var stateLabel = acceptingStates.has(Number(stateNumber)) ? colors.bold(colors.green(stateNumber + ' \u2713')) : colors.blue(stateNumber);

        if (stateNumber == 1) {
          stateLabel += colors.yellow(' >');
        }

        var row = _defineProperty({}, stateLabel, []);

        alphabet.forEach(function (symbol) {
          row[stateLabel].push(tableRow[symbol] || '');
        });

        printer.push(row);
      };

      for (var stateNumber in table) {
        _loop(stateNumber);
      }

      console.info(printer.toString());
      console.info('');
    }

    /**
     * Checks whether this DFA accepts a string.
     */

  }, {
    key: 'matches',
    value: function matches(string) {
      var state = 1;
      var i = 0;
      var table = this.getTransitionTable();

      while (string[i]) {
        state = table[state][string[i++]];
        if (!state) {
          return false;
        }
      }

      if (!this.getAcceptingStateNumbers().has(state)) {
        return false;
      }

      return true;
    }
  }]);

  return DFA;
}();

module.exports = DFA;