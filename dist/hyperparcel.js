// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
require = (function (modules, cache, entry) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof require === "function" && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof require === "function" && require;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }
      
      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module;

      modules[name][0].call(module.exports, localRequire, module, module.exports);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module() {
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  // Override the current require with this new one
  return newRequire;
})({15:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (prevState, action, nextState) {
  console.group("%c action", "color: gray; font-weight: lighter;", action.name);
  console.log("%c prev state", "color: #9E9E9E; font-weight: bold;", prevState);
  console.log("%c data", "color: #03A9F4; font-weight: bold;", action.data);
  console.log("%c next state", "color: #4CAF50; font-weight: bold;", nextState);
  console.groupEnd();
};
},{}],7:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (options) {
  options = options || {};
  options.log = typeof options.log === "function" ? options.log : _defaultLog2.default;

  return function (app) {
    return function (initialState, actionsTemplate, view, container) {
      function enhanceActions(actions, prefix) {
        var namespace = prefix ? prefix + "." : "";
        return Object.keys(actions || {}).reduce(function (otherActions, name) {
          var namedspacedName = namespace + name;
          var action = actions[name];
          otherActions[name] = typeof action === "function" ? function (data) {
            return function (state, actions) {
              var result = action(data);
              result = typeof result === "function" ? result(state, actions) : result;
              options.log(state, { name: namedspacedName, data: data }, result);
              return result;
            };
          } : enhanceActions(action, namedspacedName);
          return otherActions;
        }, {});
      }

      var enhancedActions = enhanceActions(actionsTemplate);

      var appActions = app(initialState, enhancedActions, view, container);
      return appActions;
    };
  };
};

var _defaultLog = require("./defaultLog");

var _defaultLog2 = _interopRequireDefault(_defaultLog);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
},{"./defaultLog":15}],3:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.h = h;
exports.app = app;
function h(name, props) {
  var node;
  var rest = [];
  var children = [];
  var length = arguments.length;

  while (length-- > 2) {
    rest.push(arguments[length]);
  }while (rest.length) {
    if (Array.isArray(node = rest.pop())) {
      for (length = node.length; length--;) {
        rest.push(node[length]);
      }
    } else if (node != null && node !== true && node !== false) {
      children.push(node);
    }
  }

  return typeof name === "function" ? name(props || {}, children) : {
    name: name,
    props: props || {},
    children: children
  };
}

function app(state, actions, view, container) {
  var renderLock;
  var invokeLaterStack = [];
  var rootElement = container && container.children[0] || null;
  var lastNode = rootElement && toVNode(rootElement, [].map);
  var globalState = copy(state);
  var wiredActions = copy(actions);

  scheduleRender(wireStateToActions([], globalState, wiredActions));

  return wiredActions;

  function toVNode(element, map) {
    return {
      name: element.nodeName.toLowerCase(),
      props: {},
      children: map.call(element.childNodes, function (element) {
        return element.nodeType === 3 ? element.nodeValue : toVNode(element, map);
      })
    };
  }

  function render() {
    renderLock = !renderLock;

    var next = view(globalState, wiredActions);
    if (container && !renderLock) {
      rootElement = patch(container, rootElement, lastNode, lastNode = next);
    }

    while (next = invokeLaterStack.pop()) {
      next();
    }
  }

  function scheduleRender() {
    if (!renderLock) {
      renderLock = !renderLock;
      setTimeout(render);
    }
  }

  function copy(target, source) {
    var obj = {};

    for (var i in target) {
      obj[i] = target[i];
    }for (var i in source) {
      obj[i] = source[i];
    }return obj;
  }

  function set(path, value, source) {
    var target = {};
    if (path.length) {
      target[path[0]] = path.length > 1 ? set(path.slice(1), value, source[path[0]]) : value;
      return copy(source, target);
    }
    return value;
  }

  function get(path, source) {
    for (var i = 0; i < path.length; i++) {
      source = source[path[i]];
    }
    return source;
  }

  function wireStateToActions(path, state, actions) {
    for (var key in actions) {
      typeof actions[key] === "function" ? function (key, action) {
        actions[key] = function (data) {
          if (typeof (data = action(data)) === "function") {
            data = data(get(path, globalState), actions);
          }

          if (data && data !== (state = get(path, globalState)) && !data.then // Promise
          ) {
              scheduleRender(globalState = set(path, copy(state, data), globalState));
            }

          return data;
        };
      }(key, actions[key]) : wireStateToActions(path.concat(key), state[key] = state[key] || {}, actions[key] = copy(actions[key]));
    }
  }

  function getKey(node) {
    return node && node.props ? node.props.key : null;
  }

  function setElementProp(element, name, value, isSVG, oldValue) {
    if (name === "key") {} else if (name === "style") {
      for (var i in copy(oldValue, value)) {
        element[name][i] = value == null || value[i] == null ? "" : value[i];
      }
    } else {
      if (typeof value === "function" || name in element && !isSVG) {
        element[name] = value == null ? "" : value;
      } else if (value != null && value !== false) {
        element.setAttribute(name, value);
      }

      if (value == null || value === false) {
        element.removeAttribute(name);
      }
    }
  }

  function createElement(node, isSVG) {
    var element = typeof node === "string" || typeof node === "number" ? document.createTextNode(node) : (isSVG = isSVG || node.name === "svg") ? document.createElementNS("http://www.w3.org/2000/svg", node.name) : document.createElement(node.name);

    if (node.props) {
      if (node.props.oncreate) {
        invokeLaterStack.push(function () {
          node.props.oncreate(element);
        });
      }

      for (var i = 0; i < node.children.length; i++) {
        element.appendChild(createElement(node.children[i], isSVG));
      }

      for (var name in node.props) {
        setElementProp(element, name, node.props[name], isSVG);
      }
    }

    return element;
  }

  function updateElement(element, oldProps, props, isSVG) {
    for (var name in copy(oldProps, props)) {
      if (props[name] !== (name === "value" || name === "checked" ? element[name] : oldProps[name])) {
        setElementProp(element, name, props[name], isSVG, oldProps[name]);
      }
    }

    if (props.onupdate) {
      invokeLaterStack.push(function () {
        props.onupdate(element, oldProps);
      });
    }
  }

  function removeChildren(element, node, props) {
    if (props = node.props) {
      for (var i = 0; i < node.children.length; i++) {
        removeChildren(element.childNodes[i], node.children[i]);
      }

      if (props.ondestroy) {
        props.ondestroy(element);
      }
    }
    return element;
  }

  function removeElement(parent, element, node, cb) {
    function done() {
      parent.removeChild(removeChildren(element, node));
    }

    if (node.props && (cb = node.props.onremove)) {
      cb(element, done);
    } else {
      done();
    }
  }

  function patch(parent, element, oldNode, node, isSVG, nextSibling) {
    if (node === oldNode) {} else if (oldNode == null) {
      element = parent.insertBefore(createElement(node, isSVG), element);
    } else if (node.name && node.name === oldNode.name) {
      updateElement(element, oldNode.props, node.props, isSVG = isSVG || node.name === "svg");

      var oldElements = [];
      var oldKeyed = {};
      var newKeyed = {};

      for (var i = 0; i < oldNode.children.length; i++) {
        oldElements[i] = element.childNodes[i];

        var oldChild = oldNode.children[i];
        var oldKey = getKey(oldChild);

        if (null != oldKey) {
          oldKeyed[oldKey] = [oldElements[i], oldChild];
        }
      }

      var i = 0;
      var j = 0;

      while (j < node.children.length) {
        var oldChild = oldNode.children[i];
        var newChild = node.children[j];

        var oldKey = getKey(oldChild);
        var newKey = getKey(newChild);

        if (newKeyed[oldKey]) {
          i++;
          continue;
        }

        if (newKey == null) {
          if (oldKey == null) {
            patch(element, oldElements[i], oldChild, newChild, isSVG);
            j++;
          }
          i++;
        } else {
          var recyledNode = oldKeyed[newKey] || [];

          if (oldKey === newKey) {
            patch(element, recyledNode[0], recyledNode[1], newChild, isSVG);
            i++;
          } else if (recyledNode[0]) {
            patch(element, element.insertBefore(recyledNode[0], oldElements[i]), recyledNode[1], newChild, isSVG);
          } else {
            patch(element, oldElements[i], null, newChild, isSVG);
          }

          j++;
          newKeyed[newKey] = newChild;
        }
      }

      while (i < oldNode.children.length) {
        var oldChild = oldNode.children[i];
        if (getKey(oldChild) == null) {
          removeElement(element, oldElements[i], oldChild);
        }
        i++;
      }

      for (var i in oldKeyed) {
        if (!newKeyed[oldKeyed[i][1].props.key]) {
          removeElement(element, oldKeyed[i][0], oldKeyed[i][1]);
        }
      }
    } else if (node.name === oldNode.name) {
      element.nodeValue = node;
    } else {
      element = parent.insertBefore(createElement(node, isSVG), nextSibling = element);
      removeElement(parent, nextSibling, oldNode);
    }
    return element;
  }
}
},{}],13:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var counter = exports.counter = {
    count: 0
};
},{}],14:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var git = exports.git = {
    username: 'lockykeaney',
    noOfRepos: 0,
    returned: {}
};
},{}],6:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.state = undefined;

var _counter = require('./counter.js');

var _git = require('./git.js');

var state = exports.state = {
    string: 'Hello World',
    counter: _counter.counter,
    git: _git.git
};
},{"./counter.js":13,"./git.js":14}],8:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var counter = exports.counter = {
    down: function down(value) {
        return function (state) {
            return { count: state.count - value };
        };
    },
    up: function up(value) {
        return function (state) {
            return { count: state.count + value };
        };
    }
};
},{}],10:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var git = exports.git = {
    searchValue: function searchValue(value) {
        return function (state) {
            return { username: value };
        };
    },
    updateRepos: function updateRepos(value) {
        return function (state) {
            return { returned: value };
        };
    },
    submitSearch: function submitSearch(value) {
        return function (state) {
            return fetch("https://api.github.com/users/" + value).then(function (response) {
                return response.json();
            }).then(function (response) {
                return console.log(response.public_repos);
            }).then(function (response) {
                return git.updateRepos(response);
            });
        };
    }
};
},{}],5:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.actions = undefined;

var _counter = require('./counter.js');

var _git = require('./git.js');

var actions = exports.actions = {
    updateString: function updateString(value) {
        return function (state) {
            return { string: value };
        };
    },
    counter: _counter.counter,
    git: _git.git
};
},{"./counter.js":8,"./git.js":10}],16:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = function (h) {
  return function (type) {
    var cache = {};
    return function (decls) {
      var isDeclsFunction = typeof decls === "function";

      return function (props, children) {
        props = props || {};
        var key = serialize(props);
        cache[key] || (cache[key] = isDeclsFunction && parse(decls(props)) || parse(decls));
        var node = h(type, props, children);
        node.props.class = [props.class, cache[key]].filter(Boolean).join(" ");
        return node;
      };
    };
  };
};

var _id = 0;
var sheet = document.head.appendChild(document.createElement("style")).sheet;
var serialize = JSON.stringify.bind(null);

function hyphenate(str) {
  return str.replace(/[A-Z]/g, "-$&").toLowerCase();
}

function insert(rule) {
  sheet.insertRule(rule, 0);
}

function createRule(className, decls, media) {
  var newDecls = [];
  for (var property in decls) {
    _typeof(decls[property]) !== "object" && newDecls.push(hyphenate(property) + ":" + decls[property] + ";");
  }
  var rule = "." + className + "{" + newDecls.join("") + "}";
  return media ? media + "{" + rule + "}" : rule;
}

function concat(str1, str2) {
  return str1 + (/^\w/.test(str2) ? " " : "") + str2;
}

function parse(decls, child, media, className) {
  child = child || "";
  className = className || "p" + (_id++).toString(36);

  for (var property in decls) {
    var value = decls[property];
    if ((typeof value === "undefined" ? "undefined" : _typeof(value)) === "object") {
      var nextMedia = /^@/.test(property) ? property : null;
      var nextChild = nextMedia ? child : concat(child, property);
      parse(value, nextChild, nextMedia, className);
    }
  }

  insert(createRule(concat(className, child), decls, media));
  return className;
}
},{}],9:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Counter = undefined;

var _hyperapp = require('hyperapp');

var _picostyle = require('picostyle');

var _picostyle2 = _interopRequireDefault(_picostyle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var style = (0, _picostyle2.default)(_hyperapp.h);

var Wrapper = style('div')({
    height: 'auto',
    width: '50px',
    textAlign: 'center',
    backgroundColor: 'plum',
    margin: '0 auto'
});

var Button = style('button')({
    backgroundColor: 'blue'
});

var actions = {
    down: function down(value) {
        return function (state) {
            return { count: state.count - value };
        };
    },
    up: function up(value) {
        return function (state) {
            return { count: state.count + value };
        };
    }
};

var Counter = exports.Counter = function Counter(_ref) {
    var count = _ref.count;
    return (0, _hyperapp.h)(
        Wrapper,
        null,
        (0, _hyperapp.h)(
            'h1',
            null,
            count
        ),
        (0, _hyperapp.h)(
            Button,
            { onclick: function onclick() {
                    return actions.down(1);
                } },
            '-'
        ),
        (0, _hyperapp.h)(
            Button,
            { onclick: function onclick() {
                    return actions.up(1);
                } },
            '+'
        )
    );
};
},{"hyperapp":3,"picostyle":16}],11:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.String = undefined;

var _hyperapp = require('hyperapp');

var String = exports.String = function String(_ref) {
    var state = _ref.state,
        actions = _ref.actions;
    return (0, _hyperapp.h)(
        'div',
        null,
        (0, _hyperapp.h)(
            'h1',
            null,
            state
        ),
        (0, _hyperapp.h)(
            'button',
            {
                onclick: function onclick() {
                    return actions.updateString('Goodbye World');
                } },
            'Button'
        )
    );
};
},{"hyperapp":3}],12:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Git = undefined;

var _hyperapp = require("hyperapp");

var Git = exports.Git = function Git(_ref) {
    var gitUser = _ref.gitUser,
        gitActions = _ref.gitActions;
    return (0, _hyperapp.h)(
        "div",
        null,
        "Enter a github username to find the number of repos",
        (0, _hyperapp.h)(
            "p",
            null,
            gitUser.username
        ),
        (0, _hyperapp.h)(
            "p",
            null,
            gitUser.returned
        ),
        (0, _hyperapp.h)("input", {
            type: "text",
            placeholder: "username",
            oninput: function oninput(e) {
                return gitActions.searchValue(e.target.value);
            }
        }),
        (0, _hyperapp.h)(
            "button",
            {
                onclick: function onclick() {
                    return gitActions.submitSearch(gitUser.username);
                } },
            "Search"
        )
    );
};
},{"hyperapp":3}],4:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.view = undefined;

var _hyperapp = require('hyperapp');

var _Counter = require('./components/Counter');

var _String = require('./components/String');

var _Git = require('./components/Git');

var view = exports.view = function view(state, actions) {
    return (0, _hyperapp.h)(
        'div',
        null,
        (0, _hyperapp.h)(_Counter.Counter, {
            count: state.counter.count
            // counter={actions.counter}
        })
    );
};
},{"hyperapp":3,"./components/Counter":9,"./components/String":11,"./components/Git":12}],2:[function(require,module,exports) {
'use strict';

var _logger = require('@hyperapp/logger');

var _logger2 = _interopRequireDefault(_logger);

var _hyperapp = require('hyperapp');

var _state = require('./state');

var _actions = require('./actions');

var _views = require('./views');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log(_state.state);

(0, _logger2.default)()(_hyperapp.app)(_state.state, _actions.actions, _views.view, document.getElementById('app'));
},{"@hyperapp/logger":7,"hyperapp":3,"./state":6,"./actions":5,"./views":4}],17:[function(require,module,exports) {

var global = (1, eval)('this');
var OldModule = module.bundle.Module;
function Module() {
  OldModule.call(this);
  this.hot = {
    accept: function (fn) {
      this._acceptCallback = fn || function () {};
    },
    dispose: function (fn) {
      this._disposeCallback = fn;
    }
  };
}

module.bundle.Module = Module;

if (!module.bundle.parent && typeof WebSocket !== 'undefined') {
  var hostname = '' || location.hostname;
  var ws = new WebSocket('ws://' + hostname + ':' + '50044' + '/');
  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      data.assets.forEach(function (asset) {
        hmrApply(global.require, asset);
      });

      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.require, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + 'data.error.stack');
    }
  };
}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(+k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  if (cached && cached.hot._disposeCallback) {
    cached.hot._disposeCallback();
  }

  delete bundle.cache[id];
  bundle(id);

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallback) {
    cached.hot._acceptCallback();
    return true;
  }

  return getParents(global.require, id).some(function (id) {
    return hmrAccept(global.require, id);
  });
}
},{}]},{},[17,2])
//# sourceMappingURL=/dist/hyperparcel.map