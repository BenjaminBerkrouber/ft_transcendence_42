/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./matchFound.js":
/*!***********************!*\
  !*** ./matchFound.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   matchFound: () => (/* binding */ matchFound)\n/* harmony export */ });\nfunction updatePlayerInfo(player, gameType) {\n  var isOpponent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;\n  var prefix = isOpponent ? 'opps' : 'player';\n  var imgPath = player.img.startsWith(\"profile_pics\") ? \"/media/\".concat(player.img) : player.img;\n  document.getElementById(\"\".concat(prefix, \"Avatar\")).src = imgPath;\n  document.getElementById(\"\".concat(prefix, \"Name\")).textContent = player.username;\n  if (gameType === \"pong\") document.getElementById(\"\".concat(prefix, \"Elo\")).textContent = player.eloPong;else document.getElementById(\"\".concat(prefix, \"Elo\")).textContent = player.eloConnect4;\n  document.getElementById(\"\".concat(prefix, \"-btn\")).style.display = \"flex\";\n}\nfunction updateGameInfo(data) {\n  console.log('ICI MON GRAND');\n  updatePlayerInfo(data.player, data.game_type);\n  updatePlayerInfo(data.opponent, data.game_type, true);\n  document.getElementById(\"vs-text\").style.display = \"flex\";\n  document.getElementById(\"waiting-btn\").style.display = \"none\";\n  document.getElementById(\"game-type\").innerHTML = \"<h1>\".concat(data.game_type, \"</h1>\");\n  startTimer();\n  setTimeout(function () {\n    var timerText = document.getElementById(\"timer-text\");\n    if (timerText && timerText.style.display === \"flex\") {\n      htmx.ajax('GET', \"/game/\".concat(data.game_type, \"?id=\").concat(data.game_id), {\n        target: '#main-content',\n        // The target element to update\n        swap: 'innerHTML' // How to swap the content\n      }).then(function (response) {\n        history.pushState({}, '', \"/game/\".concat(data.game_type, \"?id=\").concat(data.game_id));\n      });\n    }\n  }, 5000); // FOR RESPONSIVE awef\n}\nvar timerInterval;\nfunction startTimer() {\n  var timer = document.getElementById(\"timer\");\n  var timerText = document.getElementById(\"timer-text\");\n  [timer, timerText].forEach(function (el) {\n    return el.style.display = \"flex\";\n  });\n  timer.textContent = 5;\n\n  // Clear any existing interval to prevent multiple intervals running\n  clearInterval(timerInterval);\n\n  // Start a new interval and store its ID in the global variable\n  timerInterval = setInterval(function () {\n    var time = parseInt(timer.textContent);\n    if (time > 0) {\n      timer.textContent = time - 1;\n    } else {\n      timer.textContent = \"Starting game...\";\n      clearInterval(timerInterval); // Clear the interval when the timer reaches 0\n    }\n  }, 1000);\n}\nfunction matchFound(data) {\n  updateGameInfo(data);\n}\n\n//# sourceURL=webpack:///./matchFound.js?");

/***/ }),

/***/ "./socket.js":
/*!*******************!*\
  !*** ./socket.js ***!
  \*******************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   createSocket: () => (/* binding */ createSocket)\n/* harmony export */ });\n/* harmony import */ var _matchFound_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./matchFound.js */ \"./matchFound.js\");\nfunction _typeof(o) { \"@babel/helpers - typeof\"; return _typeof = \"function\" == typeof Symbol && \"symbol\" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && \"function\" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? \"symbol\" : typeof o; }, _typeof(o); }\nfunction _regeneratorRuntime() { \"use strict\"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = \"function\" == typeof Symbol ? Symbol : {}, a = i.iterator || \"@@iterator\", c = i.asyncIterator || \"@@asyncIterator\", u = i.toStringTag || \"@@toStringTag\"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, \"\"); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, \"_invoke\", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: \"normal\", arg: t.call(e, r) }; } catch (t) { return { type: \"throw\", arg: t }; } } e.wrap = wrap; var h = \"suspendedStart\", l = \"suspendedYield\", f = \"executing\", s = \"completed\", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { [\"next\", \"throw\", \"return\"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if (\"throw\" !== c.type) { var u = c.arg, h = u.value; return h && \"object\" == _typeof(h) && n.call(h, \"__await\") ? e.resolve(h.__await).then(function (t) { invoke(\"next\", t, i, a); }, function (t) { invoke(\"throw\", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke(\"throw\", t, i, a); }); } a(c.arg); } var r; o(this, \"_invoke\", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error(\"Generator is already running\"); if (o === s) { if (\"throw\" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if (\"next\" === n.method) n.sent = n._sent = n.arg;else if (\"throw\" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else \"return\" === n.method && n.abrupt(\"return\", n.arg); o = f; var p = tryCatch(e, r, n); if (\"normal\" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } \"throw\" === p.type && (o = s, n.method = \"throw\", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, \"throw\" === n && e.iterator[\"return\"] && (r.method = \"return\", r.arg = t, maybeInvokeDelegate(e, r), \"throw\" === r.method) || \"return\" !== n && (r.method = \"throw\", r.arg = new TypeError(\"The iterator does not provide a '\" + n + \"' method\")), y; var i = tryCatch(o, e.iterator, r.arg); if (\"throw\" === i.type) return r.method = \"throw\", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, \"return\" !== r.method && (r.method = \"next\", r.arg = t), r.delegate = null, y) : a : (r.method = \"throw\", r.arg = new TypeError(\"iterator result is not an object\"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = \"normal\", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: \"root\" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || \"\" === e) { var r = e[a]; if (r) return r.call(e); if (\"function\" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + \" is not iterable\"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, \"constructor\", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, \"constructor\", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, \"GeneratorFunction\"), e.isGeneratorFunction = function (t) { var e = \"function\" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || \"GeneratorFunction\" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, \"GeneratorFunction\")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, \"Generator\"), define(g, a, function () { return this; }), define(g, \"toString\", function () { return \"[object Generator]\"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = \"next\", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) \"t\" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if (\"throw\" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = \"throw\", a.arg = e, r.next = n, o && (r.method = \"next\", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if (\"root\" === i.tryLoc) return handle(\"end\"); if (i.tryLoc <= this.prev) { var c = n.call(i, \"catchLoc\"), u = n.call(i, \"finallyLoc\"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error(\"try statement without catch or finally\"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, \"finallyLoc\") && this.prev < o.finallyLoc) { var i = o; break; } } i && (\"break\" === t || \"continue\" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = \"next\", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if (\"throw\" === t.type) throw t.arg; return \"break\" === t.type || \"continue\" === t.type ? this.next = t.arg : \"return\" === t.type ? (this.rval = this.arg = t.arg, this.method = \"return\", this.next = \"end\") : \"normal\" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, \"catch\": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if (\"throw\" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error(\"illegal catch attempt\"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, \"next\" === this.method && (this.arg = t), y; } }, e; }\nfunction asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }\nfunction _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, \"next\", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, \"throw\", n); } _next(void 0); }); }; }\n\nfunction createSocket(gameType) {\n  var matchMakingSocket = new WebSocket('wss://' + window.location.host + '/ws/game/ranked/' + gameType + '/');\n  console.log('Matchmaking socket connected ' + matchMakingSocket.url);\n  var checkUserIdInterval = setInterval(function () {\n    if (userId && matchMakingSocket.readyState === WebSocket.OPEN) {\n      matchMakingSocket.send(JSON.stringify({\n        action: 'join',\n        player_id: \"\".concat(userId),\n        game_type: gameType\n      }));\n      clearInterval(checkUserIdInterval); // Stop checking once the message is sent\n    }\n    updateLoadingText();\n  }, 100); // Check every 100 milliseconds\n  matchMakingSocket.onclose = function (e) {\n    console.log('Matchmaking socket closed');\n    // setTimeout(connectWebSocket, 1000);\n  };\n  var loadingText = setInterval(updateLoadingText, 500);\n  matchMakingSocket.onmessage = /*#__PURE__*/function () {\n    var _ref = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(e) {\n      var data, divWaiting, divOpponentDisconnected, timer, timerText, reconnect, cancel, gamelink;\n      return _regeneratorRuntime().wrap(function _callee$(_context) {\n        while (1) switch (_context.prev = _context.next) {\n          case 0:\n            console.log(\"on message trigger\");\n            data = JSON.parse(e.data);\n            console.log(data);\n            _context.t0 = data.type;\n            _context.next = _context.t0 === 'matchFound' ? 6 : _context.t0 === 'gameStateUpdate' ? 8 : _context.t0 === 'matchmakingStatus' ? 10 : _context.t0 === 'alreadyInQueue' ? 12 : _context.t0 === 'opponentDisconnected' ? 17 : 28;\n            break;\n          case 6:\n            (0,_matchFound_js__WEBPACK_IMPORTED_MODULE_0__.matchFound)(data);\n            return _context.abrupt(\"break\", 29);\n          case 8:\n            console.log('New game state:', data.state);\n            return _context.abrupt(\"break\", 29);\n          case 10:\n            console.log('Matchmaking status:', data.status);\n            return _context.abrupt(\"break\", 29);\n          case 12:\n            console.log('Already in queue');\n            clearInterval(loadingText);\n            divWaiting = document.getElementById(\"loadingText\");\n            countdownText(divWaiting.textContent);\n            return _context.abrupt(\"break\", 29);\n          case 17:\n            console.log('Opponent disconnected');\n            divOpponentDisconnected = document.getElementById(\"overlay\");\n            timer = document.getElementById(\"timer\");\n            timerText = document.getElementById(\"timer-text\");\n            reconnect = document.getElementById(\"reconnect\");\n            cancel = document.getElementById(\"cancel\");\n            gamelink = document.getElementById(\"game-link\");\n            [timer, timerText].forEach(function (el) {\n              return el.style.display = \"none\";\n            });\n            [reconnect, cancel, divOpponentDisconnected, gamelink].forEach(function (el) {\n              return el.style.display = \"flex\";\n            });\n            gamelink.addEventListener(\"click\", function () {\n              htmx.ajax('GET', '/game/' + data.game_type + '?id=' + data.game_id, {\n                target: '#main-content',\n                // The target element to update\n                swap: 'innerHTML' // How to swap the content\n              }).then(function (response) {\n                history.pushState({}, '', '/game/' + data.game_type + '?id=' + data.game_id);\n              });\n            });\n            return _context.abrupt(\"break\", 29);\n          case 28:\n            console.log('Unknown message type:', data.type);\n          case 29:\n          case \"end\":\n            return _context.stop();\n        }\n      }, _callee);\n    }));\n    return function (_x) {\n      return _ref.apply(this, arguments);\n    };\n  }();\n  function countdownText() {\n    var count = 5;\n    var countdown = setInterval(function () {\n      if (count === 0) {\n        clearInterval(countdown);\n        console.log(\"Redirecting to game page\");\n        htmx.ajax('GET', '/game/', {\n          target: '#main-content',\n          // The target element to update\n          swap: 'innerHTML' // How to swap the content\n        }).then(function (response) {\n          history.pushState({}, '', '/game/');\n        });\n      } else {\n        var divWaiting = document.getElementById(\"loadingText\");\n        divWaiting.textContent = \"Already in queue. Redirecting in \" + count + \" seconds\";\n        count--;\n      }\n    }, 1000);\n  }\n  matchMakingSocket.onerror = function (error) {\n    console.error('WebSocket error:', error);\n  };\n  var heartbeat = setInterval(function () {\n    if (matchMakingSocket.readyState === WebSocket.OPEN) {\n      console.log(\"send message\");\n      try {\n        matchMakingSocket.send(JSON.stringify({\n          action: 'heartbeat',\n          player_id: \"\".concat(userId)\n        }));\n      } catch (e) {\n        console.error(\"Error while sending heartbeat\");\n      }\n    }\n  }, 3000);\n  document.getElementById(\"reconnect\").addEventListener(\"click\", function () {\n    console.log(\"reconnect clicked\");\n    createSocket(gameType);\n    var playerDiv = document.getElementById(\"player-btn\");\n    var opponentDiv = document.getElementById(\"opps-btn\");\n    var gameDiv = document.getElementById(\"game-type\");\n    var vsDiv = document.getElementById(\"vs-text\");\n    var waitingDiv = document.getElementById(\"waiting-btn\");\n    var divOpponentDisconnected = document.getElementById(\"overlay\");\n    var divConnect4 = document.getElementById(\"wrap\");\n    [playerDiv, opponentDiv, gameDiv, vsDiv, divOpponentDisconnected].forEach(function (el) {\n      return el.style.display = \"none\";\n    });\n    [divConnect4, waitingDiv].forEach(function (el) {\n      return el.style.display = \"flex\";\n    });\n  });\n  document.getElementById(\"cancel\").addEventListener(\"click\", function () {\n    console.log(\"cancel clicked\");\n    var divWaiting = document.getElementById(\"game-chooser\");\n    divWaiting.style.display = \"flex\";\n    var divConnect4 = document.getElementById(\"wrap\");\n    divConnect4.style.display = \"none\";\n    var divOpponentDisconnected = document.getElementById(\"overlay\");\n    divOpponentDisconnected.style.display = \"none\";\n  });\n  function updateLoadingText() {\n    var loadingElement = document.getElementById('loadingText');\n    var loadingText = loadingElement.textContent;\n    var dotCount = (loadingText.match(/\\./g) || []).length;\n    if (dotCount < 3) {\n      loadingElement.textContent = 'Waiting for players' + '.'.repeat(dotCount + 1);\n    } else {\n      loadingElement.textContent = 'Waiting for players.';\n    }\n  }\n  document.addEventListener('htmx:beforeSwap', function (event) {\n    /* TODO remove all event listeners here*/\n    matchMakingSocket.close();\n    console.log(\"htmx:beforeSwap event listener matchMakingSocket close\");\n    heartbeat = clearInterval(heartbeat);\n    clearInterval(loadingText);\n  }, {\n    once: true\n  });\n}\ndocument.addEventListener('DOMContentLoaded', function () {\n  console.log(\"pathname \" + window.location.pathname);\n  if (window.location.pathname !== '/game/ranked/') {\n    return;\n  }\n  htmx.ajax('GET', '/game/', {\n    target: '#main-content',\n    // The target element to update\n    swap: 'innerHTML' // How to swap the content\n  }).then(function (response) {\n    history.pushState({}, '', '/game/');\n  });\n});\n\n\n//# sourceURL=webpack:///./socket.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./socket.js");
/******/ 	
/******/ })()
;