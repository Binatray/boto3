
"no use strict";
!(function(window) {
if (typeof window.window != "undefined" && window.document)
    return;
if (window.require && window.define)
    return;

if (!window.console) {
    window.console = function() {
        var msgs = Array.prototype.slice.call(arguments, 0);
        postMessage({type: "log", data: msgs});
    };
    window.console.error =
    window.console.warn = 
    window.console.log =
    window.console.trace = window.console;
}
window.window = window;
window.ace = window;

window.onerror = function(message, file, line, col, err) {
    postMessage({type: "error", data: {
        message: message,
        data: err.data,
        file: file,
        line: line, 
        col: col,
        stack: err.stack
    }});
};

window.normalizeModule = function(parentId, moduleName) {
    // normalize plugin requires
    if (moduleName.indexOf("!") !== -1) {
        var chunks = moduleName.split("!");
        return window.normalizeModule(parentId, chunks[0]) + "!" + window.normalizeModule(parentId, chunks[1]);
    }
    // normalize relative requires
    if (moduleName.charAt(0) == ".") {
        var base = parentId.split("/").slice(0, -1).join("/");
        moduleName = (base ? base + "/" : "") + moduleName;
        
        while (moduleName.indexOf(".") !== -1 && previous != moduleName) {
            var previous = moduleName;
            moduleName = moduleName.replace(/^\.\//, "").replace(/\/\.\//, "/").replace(/[^\/]+\/\.\.\//, "");
        }
    }
    
    return moduleName;
};

window.require = function require(parentId, id) {
    if (!id) {
        id = parentId;
        parentId = null;
    }
    if (!id.charAt)
        throw new Error("worker.js require() accepts only (parentId, id) as arguments");

    id = window.normalizeModule(parentId, id);

    var module = window.require.modules[id];
    if (module) {
        if (!module.initialized) {
            module.initialized = true;
            module.exports = module.factory().exports;
        }
        return module.exports;
    }
   
    if (!window.require.tlns)
        return console.log("unable to load " + id);
    
    var path = resolveModuleId(id, window.require.tlns);
    if (path.slice(-3) != ".js") path += ".js";
    
    window.require.id = id;
    window.require.modules[id] = {}; // prevent infinite loop on broken modules
    importScripts(path);
    return window.require(parentId, id);
};
function resolveModuleId(id, paths) {
    var testPath = id, tail = "";
    while (testPath) {
        var alias = paths[testPath];
        if (typeof alias == "string") {
            return alias + tail;
        } else if (alias) {
            return  alias.location.replace(/\/*$/, "/") + (tail || alias.main || alias.name);
        } else if (alias === false) {
            return "";
        }
        var i = testPath.lastIndexOf("/");
        if (i === -1) break;
        tail = testPath.substr(i) + tail;
        testPath = testPath.slice(0, i);
    }
    return id;
}
window.require.modules = {};
window.require.tlns = {};

window.define = function(id, deps, factory) {
    if (arguments.length == 2) {
        factory = deps;
        if (typeof id != "string") {
            deps = id;
            id = window.require.id;
        }
    } else if (arguments.length == 1) {
        factory = id;
        deps = [];
        id = window.require.id;
    }
    
    if (typeof factory != "function") {
        window.require.modules[id] = {
            exports: factory,
            initialized: true
        };
        return;
    }

    if (!deps.length)
        // If there is no dependencies, we inject "require", "exports" and
        // "module" as dependencies, to provide CommonJS compatibility.
        deps = ["require", "exports", "module"];

    var req = function(childId) {
        return window.require(id, childId);
    };

    window.require.modules[id] = {
        exports: {},
        factory: function() {
            var module = this;
            var returnExports = factory.apply(this, deps.slice(0, factory.length).map(function(dep) {
                switch (dep) {
                    // Because "require", "exports" and "module" aren't actual
                    // dependencies, we must handle them seperately.
                    case "require": return req;
                    case "exports": return module.exports;
                    case "module":  return module;
                    // But for all other dependencies, we can just go ahead and
                    // require them.
                    default:        return req(dep);
                }
            }));
            if (returnExports)
                module.exports = returnExports;
            return module;
        }
    };
};
window.define.amd = {};
require.tlns = {};
window.initBaseUrls  = function initBaseUrls(topLevelNamespaces) {
    for (var i in topLevelNamespaces)
        require.tlns[i] = topLevelNamespaces[i];
};

window.initSender = function initSender() {

    var EventEmitter = window.require("ace/lib/event_emitter").EventEmitter;
    var oop = window.require("ace/lib/oop");
    
    var Sender = function() {};
    
    (function() {
        
        oop.implement(this, EventEmitter);
                
        this.callback = function(data, callbackId) {
            postMessage({
                type: "call",
                id: callbackId,
                data: data
            });
        };
    
        this.emit = function(name, data) {
            postMessage({
                type: "event",
                name: name,
                data: data
            });
        };
        
    }).call(Sender.prototype);
    
    return new Sender();
};

var main = window.main = null;
var sender = window.sender = null;

window.onmessage = function(e) {
    var msg = e.data;
    if (msg.event && sender) {
        sender._signal(msg.event, msg.data);
    }
    else if (msg.command) {
        if (main[msg.command])
            main[msg.command].apply(main, msg.args);
        else if (window[msg.command])
            window[msg.command].apply(window, msg.args);
        else
            throw new Error("Unknown command:" + msg.command);
    }
    else if (msg.init) {
        window.initBaseUrls(msg.tlns);
        require("ace/lib/es5-shim");
        sender = window.sender = window.initSender();
        var clazz = require(msg.module)[msg.classname];
        main = window.main = new clazz(sender);
    }
};
})(this);

define("ace/lib/oop",[], function(require, exports, module) {
"use strict";

exports.inherits = function(ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
};

exports.mixin = function(obj, mixin) {
    for (var key in mixin) {
        obj[key] = mixin[key];
    }
    return obj;
};

exports.implement = function(proto, mixin) {
    exports.mixin(proto, mixin);
};

});

define("ace/lib/lang",[], function(require, exports, module) {
"use strict";

exports.last = function(a) {
    return a[a.length - 1];
};

exports.stringReverse = function(string) {
    return string.split("").reverse().join("");
};

exports.stringRepeat = function (string, count) {
    var result = '';
    while (count > 0) {
        if (count & 1)
            result += string;

        if (count >>= 1)
            string += string;
    }
    return result;
};

var trimBeginRegexp = /^\s\s*/;
var trimEndRegexp = /\s\s*$/;

exports.stringTrimLeft = function (string) {
    return string.replace(trimBeginRegexp, '');
};

exports.stringTrimRight = function (string) {
    return string.replace(trimEndRegexp, '');
};

exports.copyObject = function(obj) {
    var copy = {};
    for (var key in obj) {
        copy[key] = obj[key];
    }
    return copy;
};

exports.copyArray = function(array){
    var copy = [];
    for (var i=0, l=array.length; i<l; i++) {
        if (array[i] && typeof array[i] == "object")
            copy[i] = this.copyObject(array[i]);
        else 
            copy[i] = array[i];
    }
    return copy;
};

exports.deepCopy = function deepCopy(obj) {
    if (typeof obj !== "object" || !obj)
        return obj;
    var copy;
    if (Array.isArray(obj)) {
        copy = [];
        for (var key = 0; key < obj.length; key++) {
            copy[key] = deepCopy(obj[key]);
        }
        return copy;
    }
    if (Object.prototype.toString.call(obj) !== "[object Object]")
        return obj;
    
    copy = {};
    for (var key in obj)
        copy[key] = deepCopy(obj[key]);
    return copy;
};

exports.arrayToMap = function(arr) {
    var map = {};
    for (var i=0; i<arr.length; i++) {
        map[arr[i]] = 1;
    }
    return map;

};

exports.createMap = function(props) {
    var map = Object.create(null);
    for (var i in props) {
        map[i] = props[i];
    }
    return map;
};
exports.arrayRemove = function(array, value) {
  for (var i = 0; i <= array.length; i++) {
    if (value === array[i]) {
      array.splice(i, 1);
    }
  }
};

exports.escapeRegExp = function(str) {
    return str.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1');
};

exports.escapeHTML = function(str) {
    return ("" + str).replace(/&/g, "&#38;").replace(/"/g, "&#34;").replace(/'/g, "&#39;").replace(/</g, "&#60;");
};

exports.getMatchOffsets = function(string, regExp) {
    var matches = [];

    string.replace(regExp, function(str) {
        matches.push({
            offset: arguments[arguments.length-2],
            length: str.length
        });
    });

    return matches;
};
exports.deferredCall = function(fcn) {
    var timer = null;
    var callback = function() {
        timer = null;
        fcn();
    };

    var deferred = function(timeout) {
        deferred.cancel();
        timer = setTimeout(callback, timeout || 0);
        return deferred;
    };

    deferred.schedule = deferred;

    deferred.call = function() {
        this.cancel();
        fcn();
        return deferred;
    };

    deferred.cancel = function() {
        clearTimeout(timer);
        timer = null;
        return deferred;
    };
    
    deferred.isPending = function() {
        return timer;
    };

    return deferred;
};


exports.delayedCall = function(fcn, defaultTimeout) {
    var timer = null;
    var callback = function() {
        timer = null;
        fcn();
    };

    var _self = function(timeout) {
        if (timer == null)
            timer = setTimeout(callback, timeout || defaultTimeout);
    };

    _self.delay = function(timeout) {
        timer && clearTimeout(timer);
        timer = setTimeout(callback, timeout || defaultTimeout);
    };
    _self.schedule = _self;

    _self.call = function() {
        this.cancel();
        fcn();
    };

    _self.cancel = function() {
        timer && clearTimeout(timer);
        timer = null;
    };

    _self.isPending = function() {
        return timer;
    };

    return _self;
};
});

define("ace/range",[], function(require, exports, module) {
"use strict";
var comparePoints = function(p1, p2) {
    return p1.row - p2.row || p1.column - p2.column;
};
var Range = function(startRow, startColumn, endRow, endColumn) {
    this.start = {
        row: startRow,
        column: startColumn
    };

    this.end = {
        row: endRow,
        column: endColumn
    };
};

(function() {
    this.isEqual = function(range) {
        return this.start.row === range.start.row &&
            this.end.row === range.end.row &&
            this.start.column === range.start.column &&
            this.end.column === range.end.column;
    };
    this.toString = function() {
        return ("Range: [" + this.start.row + "/" + this.start.column +
            "] -> [" + this.end.row + "/" + this.end.column + "]");
    };

    this.contains = function(row, column) {
        return this.compare(row, column) == 0;
    };
    this.compareRange = function(range) {
        var cmp,
            end = range.end,
            start = range.start;

        cmp = this.compare(end.row, end.column);
        if (cmp == 1) {
            cmp = this.compare(start.row, start.column);
            if (cmp == 1) {
                return 2;
            } else if (cmp == 0) {
                return 1;
            } else {
                return 0;
            }
        } else if (cmp == -1) {
            return -2;
        } else {
            cmp = this.compare(start.row, start.column);
            if (cmp == -1) {
                return -1;
            } else if (cmp == 1) {
                return 42;
            } else {
                return 0;
            }
        }
    };
    this.comparePoint = function(p) {
        return this.compare(p.row, p.column);
    };
    this.containsRange = function(range) {
        return this.comparePoint(range.start) == 0 && this.comparePoint(range.end) == 0;
    };
    this.intersects = function(range) {
        var cmp = this.compareRange(range);
        return (cmp == -1 || cmp == 0 || cmp == 1);
    };
    this.isEnd = function(row, column) {
        return this.end.row == row && this.end.column == column;
    };
    this.isStart = function(row, column) {
        return this.start.row == row && this.start.column == column;
    };
    this.setStart = function(row, column) {
        if (typeof row == "object") {
            this.start.column = row.column;
            this.start.row = row.row;
        } else {
            this.start.row = row;
            this.start.column = column;
        }
    };
    this.setEnd = function(row, column) {
        if (typeof row == "object") {
            this.end.column = row.column;
            this.end.row = row.row;
        } else {
            this.end.row = row;
            this.end.column = column;
        }
    };
    this.inside = function(row, column) {
        if (this.compare(row, column) == 0) {
            if (this.isEnd(row, column) || this.isStart(row, column)) {
                return false;
            } else {
                return true;
            }
        }
        return false;
    };
    this.insideStart = function(row, column) {
        if (this.compare(row, column) == 0) {
            if (this.isEnd(row, column)) {
                return false;
            } else {
                return true;
            }
        }
        return false;
    };
    this.insideEnd = function(row, column) {
        if (this.compare(row, column) == 0) {
            if (this.isStart(row, column)) {
                return false;
            } else {
                return true;
            }
        }
        return false;
    };
    this.compare = function(row, column) {
        if (!this.isMultiLine()) {
            if (row === this.start.row) {
                return column < this.start.column ? -1 : (column > this.end.column ? 1 : 0);
            }
        }

        if (row < this.start.row)
            return -1;

        if (row > this.end.row)
            return 1;

        if (this.start.row === row)
            return column >= this.start.column ? 0 : -1;

        if (this.end.row === row)
            return column <= this.end.column ? 0 : 1;

        return 0;
    };
    this.compareStart = function(row, column) {
        if (this.start.row == row && this.start.column == column) {
            return -1;
        } else {
            return this.compare(row, column);
        }
    };
    this.compareEnd = function(row, column) {
        if (this.end.row == row && this.end.column == column) {
            return 1;
        } else {
            return this.compare(row, column);
        }
    };
    this.compareInside = function(row, column) {
        if (this.end.row == row && this.end.column == column) {
            return 1;
        } else if (this.start.row == row && this.start.column == column) {
            return -1;
        } else {
            return this.compare(row, column);
        }
    };
    this.clipRows = function(firstRow, lastRow) {
        if (this.end.row > lastRow)
            var end = {row: lastRow + 1, column: 0};
        else if (this.end.row < firstRow)
            var end = {row: firstRow, column: 0};

        if (this.start.row > lastRow)
            var start = {row: lastRow + 1, column: 0};
        else if (this.start.row < firstRow)
            var start = {row: firstRow, column: 0};

        return Range.fromPoints(start || this.start, end || this.end);
    };
    this.extend = function(row, column) {
        var cmp = this.compare(row, column);

        if (cmp == 0)
            return this;
        else if (cmp == -1)
            var start = {row: row, column: column};
        else
            var end = {row: row, column: column};

        return Range.fromPoints(start || this.start, end || this.end);
    };

    this.isEmpty = function() {
        return (this.start.row === this.end.row && this.start.column === this.end.column);
    };
    this.isMultiLine = function() {
        return (this.start.row !== this.end.row);
    };
    this.clone = function() {
        return Range.fromPoints(this.start, this.end);
    };
    this.collapseRows = function() {
        if (this.end.column == 0)
            return new Range(this.start.row, 0, Math.max(this.start.row, this.end.row-1), 0);
        else
            return new Range(this.start.row, 0, this.end.row, 0);
    };
    this.toScreenRange = function(session) {
        var screenPosStart = session.documentToScreenPosition(this.start);
        var screenPosEnd = session.documentToScreenPosition(this.end);

        return new Range(
            screenPosStart.row, screenPosStart.column,
            screenPosEnd.row, screenPosEnd.column
        );
    };
    this.moveBy = function(row, column) {
        this.start.row += row;
        this.start.column += column;
        this.end.row += row;
        this.end.column += column;
    };

}).call(Range.prototype);
Range.fromPoints = function(start, end) {
    return new Range(start.row, start.column, end.row, end.column);
};
Range.comparePoints = comparePoints;

Range.comparePoints = function(p1, p2) {
    return p1.row - p2.row || p1.column - p2.column;
};


exports.Range = Range;
});

define("ace/apply_delta",[], function(require, exports, module) {
"use strict";

function throwDeltaError(delta, errorText){
    console.log("Invalid Delta:", delta);
    throw "Invalid Delta: " + errorText;
}

function positionInDocument(docLines, position) {
    return position.row    >= 0 && position.row    <  docLines.length &&
           position.column >= 0 && position.column <= docLines[position.row].length;
}

function validateDelta(docLines, delta) {
    if (delta.action != "insert" && delta.action != "remove")
        throwDeltaError(delta, "delta.action must be 'insert' or 'remove'");
    if (!(delta.lines instanceof Array))
        throwDeltaError(delta, "delta.lines must be an Array");
    if (!delta.start || !delta.end)
       throwDeltaError(delta, "delta.start/end must be an present");
    var start = delta.start;
    if (!positionInDocument(docLines, delta.start))
        throwDeltaError(delta, "delta.start must be contained in document");
    var end = delta.end;
    if (delta.action == "remove" && !positionInDocument(docLines, end))
        throwDeltaError(delta, "delta.end must contained in document for 'remove' actions");
    var numRangeRows = end.row - start.row;
    var numRangeLastLineChars = (end.column - (numRangeRows == 0 ? start.column : 0));
    if (numRangeRows != delta.lines.length - 1 || delta.lines[numRangeRows].length != numRangeLastLineChars)
        throwDeltaError(delta, "delta.range must match delta lines");
}

exports.applyDelta = function(docLines, delta, doNotValidate) {
    
    var row = delta.start.row;
    var startColumn = delta.start.column;
    var line = docLines[row] || "";
    switch (delta.action) {
        case "insert":
            var lines = delta.lines;
            if (lines.length === 1) {
                docLines[row] = line.substring(0, startColumn) + delta.lines[0] + line.substring(startColumn);
            } else {
                var args = [row, 1].concat(delta.lines);
                docLines.splice.apply(docLines, args);
                docLines[row] = line.substring(0, startColumn) + docLines[row];
                docLines[row + delta.lines.length - 1] += line.substring(startColumn);
            }
            break;
        case "remove":
            var endColumn = delta.end.column;
            var endRow = delta.end.row;
            if (row === endRow) {
                docLines[row] = line.substring(0, startColumn) + line.substring(endColumn);
            } else {
                docLines.splice(
                    row, endRow - row + 1,
                    line.substring(0, startColumn) + docLines[endRow].substring(endColumn)
                );
            }
            break;
    }
};
});

define("ace/lib/event_emitter",[], function(require, exports, module) {
"use strict";

var EventEmitter = {};
var stopPropagation = function() { this.propagationStopped = true; };
var preventDefault = function() { this.defaultPrevented = true; };

EventEmitter._emit =
EventEmitter._dispatchEvent = function(eventName, e) {
    this._eventRegistry || (this._eventRegistry = {});
    this._defaultHandlers || (this._defaultHandlers = {});

    var listeners = this._eventRegistry[eventName] || [];
    var defaultHandler = this._defaultHandlers[eventName];
    if (!listeners.length && !defaultHandler)
        return;

    if (typeof e != "object" || !e)
        e = {};

    if (!e.type)
        e.type = eventName;
    if (!e.stopPropagation)
        e.stopPropagation = stopPropagation;
    if (!e.preventDefault)
        e.preventDefault = preventDefault;

    listeners = listeners.slice();
    for (var i=0; i<listeners.length; i++) {
        listeners[i](e, this);
        if (e.propagationStopped)
            break;
    }
    
    if (defaultHandler && !e.defaultPrevented)
        return defaultHandler(e, this);
};


EventEmitter._signal = function(eventName, e) {
    var listeners = (this._eventRegistry || {})[eventName];
    if (!listeners)
        return;
    listeners = listeners.slice();
    for (var i=0; i<listeners.length; i++)
        listeners[i](e, this);
};

EventEmitter.once = function(eventName, callback) {
    var _self = this;
    this.addEventListener(eventName, function newCallback() {
        _self.removeEventListener(eventName, newCallback);
        callback.apply(null, arguments);
    });
    if (!callback) {
        return new Promise(function(resolve) {
            callback = resolve;
        });
    }
};


EventEmitter.setDefaultHandler = function(eventName, callback) {
    var handlers = this._defaultHandlers;
    if (!handlers)
        handlers = this._defaultHandlers = {_disabled_: {}};
    
    if (handlers[eventName]) {
        var old = handlers[eventName];
        var disabled = handlers._disabled_[eventName];
        if (!disabled)
            handlers._disabled_[eventName] = disabled = [];
        disabled.push(old);
        var i = disabled.indexOf(callback);
        if (i != -1) 
            disabled.splice(i, 1);
    }
    handlers[eventName] = callback;
};
EventEmitter.removeDefaultHandler = function(eventName, callback) {
    var handlers = this._defaultHandlers;
    if (!handlers)
        return;
    var disabled = handlers._disabled_[eventName];
    
    if (handlers[eventName] == callback) {
        if (disabled)
            this.setDefaultHandler(eventName, disabled.pop());
    } else if (disabled) {
        var i = disabled.indexOf(callback);
        if (i != -1)
            disabled.splice(i, 1);
    }
};

EventEmitter.on =
EventEmitter.addEventListener = function(eventName, callback, capturing) {
    this._eventRegistry = this._eventRegistry || {};

    var listeners = this._eventRegistry[eventName];
    if (!listeners)
        listeners = this._eventRegistry[eventName] = [];

    if (listeners.indexOf(callback) == -1)
        listeners[capturing ? "unshift" : "push"](callback);
    return callback;
};

EventEmitter.off =
EventEmitter.removeListener =
EventEmitter.removeEventListener = function(eventName, callback) {
    this._eventRegistry = this._eventRegistry || {};

    var listeners = this._eventRegistry[eventName];
    if (!listeners)
        return;

    var index = listeners.indexOf(callback);
    if (index !== -1)
        listeners.splice(index, 1);
};

EventEmitter.removeAllListeners = function(eventName) {
    if (this._eventRegistry) this._eventRegistry[eventName] = [];
};

exports.EventEmitter = EventEmitter;

});

define("ace/anchor",[], function(require, exports, module) {
"use strict";

var oop = require("./lib/oop");
var EventEmitter = require("./lib/event_emitter").EventEmitter;

var Anchor = exports.Anchor = function(doc, row, column) {
    this.$onChange = this.onChange.bind(this);
    this.attach(doc);
    
    if (typeof column == "undefined")
        this.setPosition(row.row, row.column);
    else
        this.setPosition(row, column);
};

(function() {

    oop.implement(this, EventEmitter);
    this.getPosition = function() {
        return this.$clipPositionToDocument(this.row, this.column);
    };
    this.getDocument = function() {
        return this.document;
    };
    this.$insertRight = false;
    this.onChange = function(delta) {
        if (delta.start.row == delta.end.row && delta.start.row != this.row)
            return;

        if (delta.start.row > this.row)
            return;
            
        var point = $getTransformedPoint(delta, {row: this.row, column: this.column}, this.$insertRight);
        this.setPosition(point.row, point.column, true);
    };
    
    function $pointsInOrder(point1, point2, equalPointsInOrder) {
        var bColIsAfter = equalPointsInOrder ? point1.column <= point2.column : point1.column < point2.column;
        return (point1.row < point2.row) || (point1.row == point2.row && bColIsAfter);
    }
            
    function $getTransformedPoint(delta, point, moveIfEqual) {
        var deltaIsInsert = delta.action == "insert";
        var deltaRowShift = (deltaIsInsert ? 1 : -1) * (delta.end.row    - delta.start.row);
        var deltaColShift = (deltaIsInsert ? 1 : -1) * (delta.end.column - delta.start.column);
        var deltaStart = delta.start;
        var deltaEnd = deltaIsInsert ? deltaStart : delta.end; // Collapse insert range.
        if ($pointsInOrder(point, deltaStart, moveIfEqual)) {
            return {
                row: point.row,
                column: point.column
            };
        }
        if ($pointsInOrder(deltaEnd, point, !moveIfEqual)) {
            return {
                row: point.row + deltaRowShift,
                column: point.column + (point.row == deltaEnd.row ? deltaColShift : 0)
            };
        }
        
        return {
            row: deltaStart.row,
            column: deltaStart.column
        };
    }
    this.setPosition = function(row, column, noClip) {
        var pos;
        if (noClip) {
            pos = {
                row: row,
                column: column
            };
        } else {
            pos = this.$clipPositionToDocument(row, column);
        }

        if (this.row == pos.row && this.column == pos.column)
            return;

        var old = {
            row: this.row,
            column: this.column
        };

        this.row = pos.row;
        this.column = pos.column;
        this._signal("change", {
            old: old,
            value: pos
        });
    };
    this.detach = function() {
        this.document.removeEventListener("change", this.$onChange);
    };
    this.attach = function(doc) {
        this.document = doc || this.document;
        this.document.on("change", this.$onChange);
    };
    this.$clipPositionToDocument = function(row, column) {
        var pos = {};

        if (row >= this.document.getLength()) {
            pos.row = Math.max(0, this.document.getLength() - 1);
            pos.column = this.document.getLine(pos.row).length;
        }
        else if (row < 0) {
            pos.row = 0;
            pos.column = 0;
        }
        else {
            pos.row = row;
            pos.column = Math.min(this.document.getLine(pos.row).length, Math.max(0, column));
        }

        if (column < 0)
            pos.column = 0;

        return pos;
    };

}).call(Anchor.prototype);

});

define("ace/document",[], function(require, exports, module) {
"use strict";

var oop = require("./lib/oop");
var applyDelta = require("./apply_delta").applyDelta;
var EventEmitter = require("./lib/event_emitter").EventEmitter;
var Range = require("./range").Range;
var Anchor = require("./anchor").Anchor;

var Document = function(textOrLines) {
    this.$lines = [""];
    if (textOrLines.length === 0) {
        this.$lines = [""];
    } else if (Array.isArray(textOrLines)) {
        this.insertMergedLines({row: 0, column: 0}, textOrLines);
    } else {
        this.insert({row: 0, column:0}, textOrLines);
    }
};

(function() {

    oop.implement(this, EventEmitter);
    this.setValue = function(text) {
        var len = this.getLength() - 1;
        this.remove(new Range(0, 0, len, this.getLine(len).length));
        this.insert({row: 0, column: 0}, text);
    };
    this.getValue = function() {
        return this.getAllLines().join(this.getNewLineCharacter());
    };
    this.createAnchor = function(row, column) {
        return new Anchor(this, row, column);
    };
    if ("aaa".split(/a/).length === 0) {
        this.$split = function(text) {
            return text.replace(/\r\n|\r/g, "\n").split("\n");
        };
    } else {
        this.$split = function(text) {
            return text.split(/\r\n|\r|\n/);
        };
    }


    this.$detectNewLine = function(text) {
        var match = text.match(/^.*?(\r\n|\r|\n)/m);
        this.$autoNewLine = match ? match[1] : "\n";
        this._signal("changeNewLineMode");
    };
    this.getNewLineCharacter = function() {
        switch (this.$newLineMode) {
          case "windows":
            return "\r\n";
          case "unix":
            return "\n";
          default:
            return this.$autoNewLine || "\n";
        }
    };

    this.$autoNewLine = "";
    this.$newLineMode = "auto";
    this.setNewLineMode = function(newLineMode) {
        if (this.$newLineMode === newLineMode)
            return;

        this.$newLineMode = newLineMode;
        this._signal("changeNewLineMode");
    };
    this.getNewLineMode = function() {
        return this.$newLineMode;
    };
    this.isNewLine = function(text) {
        return (text == "\r\n" || text == "\r" || text == "\n");
    };
    this.getLine = function(row) {
        return this.$lines[row] || "";
    };
    this.getLines = function(firstRow, lastRow) {
        return this.$lines.slice(firstRow, lastRow + 1);
    };
    this.getAllLines = function() {
        return this.getLines(0, this.getLength());
    };
    this.getLength = function() {
        return this.$lines.length;
    };
    this.getTextRange = function(range) {
        return this.getLinesForRange(range).join(this.getNewLineCharacter());
    };
    this.getLinesForRange = function(range) {
        var lines;
        if (range.start.row === range.end.row) {
            lines = [this.getLine(range.start.row).substring(range.start.column, range.end.column)];
        } else {
            lines = this.getLines(range.start.row, range.end.row);
            lines[0] = (lines[0] || "").substring(range.start.column);
            var l = lines.length - 1;
            if (range.end.row - range.start.row == l)
                lines[l] = lines[l].substring(0, range.end.column);
        }
        return lines;
    };
    this.insertLines = function(row, lines) {
        console.warn("Use of document.insertLines is deprecated. Use the insertFullLines method instead.");
        return this.insertFullLines(row, lines);
    };
    this.removeLines = function(firstRow, lastRow) {
        console.warn("Use of document.removeLines is deprecated. Use the removeFullLines method instead.");
        return this.removeFullLines(firstRow, lastRow);
    };
    this.insertNewLine = function(position) {
        console.warn("Use of document.insertNewLine is deprecated. Use insertMergedLines(position, ['', '']) instead.");
        return this.insertMergedLines(position, ["", ""]);
    };
    this.insert = function(position, text) {
        if (this.getLength() <= 1)
            this.$detectNewLine(text);
        
        return this.insertMergedLines(position, this.$split(text));
    };
    this.insertInLine = function(position, text) {
        var start = this.clippedPos(position.row, position.column);
        var end = this.pos(position.row, position.column + text.length);
        
        this.applyDelta({
            start: start,
            end: end,
            action: "insert",
            lines: [text]
        }, true);
        
        return this.clonePos(end);
    };
    
    this.clippedPos = function(row, column) {
        var length = this.getLength();
        if (row === undefined) {
            row = length;
        } else if (row < 0) {
            row = 0;
        } else if (row >= length) {
            row = length - 1;
            column = undefined;
        }
        var line = this.getLine(row);
        if (column == undefined)
            column = line.length;
        column = Math.min(Math.max(column, 0), line.length);
        return {row: row, column: column};
    };
    
    this.clonePos = function(pos) {
        return {row: pos.row, column: pos.column};
    };
    
    this.pos = function(row, column) {
        return {row: row, column: column};
    };
    
    this.$clipPosition = function(position) {
        var length = this.getLength();
        if (position.row >= length) {
            position.row = Math.max(0, length - 1);
            position.column = this.getLine(length - 1).length;
        } else {
            position.row = Math.max(0, position.row);
            position.column = Math.min(Math.max(position.column, 0), this.getLine(position.row).length);
        }
        return position;
    };
    this.insertFullLines = function(row, lines) {
        row = Math.min(Math.max(row, 0), this.getLength());
        var column = 0;
        if (row < this.getLength()) {
            lines = lines.concat([""]);
            column = 0;
        } else {
            lines = [""].concat(lines);
            row--;
            column = this.$lines[row].length;
        }
        this.insertMergedLines({row: row, column: column}, lines);
    };    
    this.insertMergedLines = function(position, lines) {
        var start = this.clippedPos(position.row, position.column);
        var end = {
            row: start.row + lines.length - 1,
            column: (lines.length == 1 ? start.column : 0) + lines[lines.length - 1].length
        };
        
        this.applyDelta({
            start: start,
            end: end,
            action: "insert",
            lines: lines
        });
        
        return this.clonePos(end);
    };
    this.remove = function(range) {
        var start = this.clippedPos(range.start.row, range.start.column);
        var end = this.clippedPos(range.end.row, range.end.column);
        this.applyDelta({
            start: start,
            end: end,
            action: "remove",
            lines: this.getLinesForRange({start: start, end: end})
        });
        return this.clonePos(start);
    };
    this.removeInLine = function(row, startColumn, endColumn) {
        var start = this.clippedPos(row, startColumn);
        var end = this.clippedPos(row, endColumn);
        
        this.applyDelta({
            start: start,
            end: end,
            action: "remove",
            lines: this.getLinesForRange({start: start, end: end})
        }, true);
        
        return this.clonePos(start);
    };
    this.removeFullLines = function(firstRow, lastRow) {
        firstRow = Math.min(Math.max(0, firstRow), this.getLength() - 1);
        lastRow  = Math.min(Math.max(0, lastRow ), this.getLength() - 1);
        var deleteFirstNewLine = lastRow == this.getLength() - 1 && firstRow > 0;
        var deleteLastNewLine  = lastRow  < this.getLength() - 1;
        var startRow = ( deleteFirstNewLine ? firstRow - 1                  : firstRow                    );
        var startCol = ( deleteFirstNewLine ? this.getLine(startRow).length : 0                           );
        var endRow   = ( deleteLastNewLine  ? lastRow + 1                   : lastRow                     );
        var endCol   = ( deleteLastNewLine  ? 0                             : this.getLine(endRow).length ); 
        var range = new Range(startRow, startCol, endRow, endCol);
        var deletedLines = this.$lines.slice(firstRow, lastRow + 1);
        
        this.applyDelta({
            start: range.start,
            end: range.end,
            action: "remove",
            lines: this.getLinesForRange(range)
        });
        return deletedLines;
    };
    this.removeNewLine = function(row) {
        if (row < this.getLength() - 1 && row >= 0) {
            this.applyDelta({
                start: this.pos(row, this.getLine(row).length),
                end: this.pos(row + 1, 0),
                action: "remove",
                lines: ["", ""]
            });
        }
    };
    this.replace = function(range, text) {
        if (!(range instanceof Range))
            range = Range.fromPoints(range.start, range.end);
        if (text.length === 0 && range.isEmpty())
            return range.start;
        if (text == this.getTextRange(range))
            return range.end;

        this.remove(range);
        var end;
        if (text) {
            end = this.insert(range.start, text);
        }
        else {
            end = range.start;
        }
        
        return end;
    };
    this.applyDeltas = function(deltas) {
        for (var i=0; i<deltas.length; i++) {
            this.applyDelta(deltas[i]);
        }
    };
    this.revertDeltas = function(deltas) {
        for (var i=deltas.length-1; i>=0; i--) {
            this.revertDelta(deltas[i]);
        }
    };
    this.applyDelta = function(delta, doNotValidate) {
        var isInsert = delta.action == "insert";
        if (isInsert ? delta.lines.length <= 1 && !delta.lines[0]
            : !Range.comparePoints(delta.start, delta.end)) {
            return;
        }
        
        if (isInsert && delta.lines.length > 20000) {
            this.$splitAndapplyLargeDelta(delta, 20000);
        }
        else {
            applyDelta(this.$lines, delta, doNotValidate);
            this._signal("change", delta);
        }
    };
    
    this.$splitAndapplyLargeDelta = function(delta, MAX) {
        var lines = delta.lines;
        var l = lines.length - MAX + 1;
        var row = delta.start.row; 
        var column = delta.start.column;
        for (var from = 0, to = 0; from < l; from = to) {
            to += MAX - 1;
            var chunk = lines.slice(from, to);
            chunk.push("");
            this.applyDelta({
                start: this.pos(row + from, column),
                end: this.pos(row + to, column = 0),
                action: delta.action,
                lines: chunk
            }, true);
        }
        delta.lines = lines.slice(from);
        delta.start.row = row + from;
        delta.start.column = column;
        this.applyDelta(delta, true);
    };
    this.revertDelta = function(delta) {
        this.applyDelta({
            start: this.clonePos(delta.start),
            end: this.clonePos(delta.end),
            action: (delta.action == "insert" ? "remove" : "insert"),
            lines: delta.lines.slice()
        });
    };
    this.indexToPosition = function(index, startRow) {
        var lines = this.$lines || this.getAllLines();
        var newlineLength = this.getNewLineCharacter().length;
        for (var i = startRow || 0, l = lines.length; i < l; i++) {
            index -= lines[i].length + newlineLength;
            if (index < 0)
                return {row: i, column: index + lines[i].length + newlineLength};
        }
        return {row: l-1, column: index + lines[l-1].length + newlineLength};
    };
    this.positionToIndex = function(pos, startRow) {
        var lines = this.$lines || this.getAllLines();
        var newlineLength = this.getNewLineCharacter().length;
        var index = 0;
        var row = Math.min(pos.row, lines.length);
        for (var i = startRow || 0; i < row; ++i)
            index += lines[i].length + newlineLength;

        return index + pos.column;
    };

}).call(Document.prototype);

exports.Document = Document;
});

define("ace/worker/mirror",[], function(require, exports, module) {
"use strict";

var Range = require("../range").Range;
var Document = require("../document").Document;
var lang = require("../lib/lang");
    
var Mirror = exports.Mirror = function(sender) {
    this.sender = sender;
    var doc = this.doc = new Document("");
    
    var deferredUpdate = this.deferredUpdate = lang.delayedCall(this.onUpdate.bind(this));
    
    var _self = this;
    sender.on("change", function(e) {
        var data = e.data;
        if (data[0].start) {
            doc.applyDeltas(data);
        } else {
            for (var i = 0; i < data.length; i += 2) {
                if (Array.isArray(data[i+1])) {
                    var d = {action: "insert", start: data[i], lines: data[i+1]};
                } else {
                    var d = {action: "remove", start: data[i], end: data[i+1]};
                }
                doc.applyDelta(d, true);
            }
        }
        if (_self.$timeout)
            return deferredUpdate.schedule(_self.$timeout);
        _self.onUpdate();
    });
};

(function() {
    
    this.$timeout = 500;
    
    this.setTimeout = function(timeout) {
        this.$timeout = timeout;
    };
    
    this.setValue = function(value) {
        this.doc.setValue(value);
        this.deferredUpdate.schedule(this.$timeout);
    };
    
    this.getValue = function(callbackId) {
        this.sender.callback(this.doc.getValue(), callbackId);
    };
    
    this.onUpdate = function() {
    };
    
    this.isPending = function() {
        return this.deferredUpdate.isPending();
    };
    
}).call(Mirror.prototype);

});

define("ace/mode/html/saxparser",[], function(require, exports, module) {
module.exports = (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({
1:[function(_dereq_,module,exports){
function isScopeMarker(node) {
	if (node.namespaceURI === "http://www.w3.org/1999/xhtml") {
		return node.localName === "applet"
			|| node.localName === "caption"
			|| node.localName === "marquee"
			|| node.localName === "object"
			|| node.localName === "table"
			|| node.localName === "td"
			|| node.localName === "th";
	}
	if (node.namespaceURI === "http://www.w3.org/1998/Math/MathML") {
		return node.localName === "mi"
			|| node.localName === "mo"
			|| node.localName === "mn"
			|| node.localName === "ms"
			|| node.localName === "mtext"
			|| node.localName === "annotation-xml";
	}
	if (node.namespaceURI === "http://www.w3.org/2000/svg") {
		return node.localName === "foreignObject"
			|| node.localName === "desc"
			|| node.localName === "title";
	}
}

function isListItemScopeMarker(node) {
	return isScopeMarker(node)
		|| (node.namespaceURI === "http://www.w3.org/1999/xhtml" && node.localName === 'ol')
		|| (node.namespaceURI === "http://www.w3.org/1999/xhtml" && node.localName === 'ul');
}

function isTableScopeMarker(node) {
	return (node.namespaceURI === "http://www.w3.org/1999/xhtml" && node.localName === 'table')
		|| (node.namespaceURI === "http://www.w3.org/1999/xhtml" && node.localName === 'html');
}

function isTableBodyScopeMarker(node) {
	return (node.namespaceURI === "http://www.w3.org/1999/xhtml" && node.localName === 'tbody')
		|| (node.namespaceURI === "http://www.w3.org/1999/xhtml" && node.localName === 'tfoot')
		|| (node.namespaceURI === "http://www.w3.org/1999/xhtml" && node.localName === 'thead')
		|| (node.namespaceURI === "http://www.w3.org/1999/xhtml" && node.localName === 'html');
}

function isTableRowScopeMarker(node) {
	return (node.namespaceURI === "http://www.w3.org/1999/xhtml" && node.localName === 'tr')
		|| (node.namespaceURI === "http://www.w3.org/1999/xhtml" && node.localName === 'html');
}

function isButtonScopeMarker(node) {
	return isScopeMarker(node)
		|| (node.namespaceURI === "http://www.w3.org/1999/xhtml" && node.localName === 'button');
}

function isSelectScopeMarker(node) {
	return !(node.namespaceURI === "http://www.w3.org/1999/xhtml" && node.localName === 'optgroup')
		&& !(node.namespaceURI === "http://www.w3.org/1999/xhtml" && node.localName === 'option');
}
function ElementStack() {
	this.elements = [];
	this.rootNode = null;
	this.headElement = null;
	this.bodyElement = null;
}
ElementStack.prototype._inScope = function(localName, isMarker) {
	for (var i = this.elements.length - 1; i >= 0; i--) {
		var node = this.elements[i];
		if (node.localName === localName)
			return true;
		if (isMarker(node))
			return false;
	}
};
ElementStack.prototype.push = function(item) {
	this.elements.push(item);
};
ElementStack.prototype.pushHtmlElement = function(item) {
	this.rootNode = item.node;
	this.push(item);
};
ElementStack.prototype.pushHeadElement = function(item) {
	this.headElement = item.node;
	this.push(item);
};
ElementStack.prototype.pushBodyElement = function(item) {
	this.bodyElement = item.node;
	this.push(item);
};
ElementStack.prototype.pop = function() {
	return this.elements.pop();
};
ElementStack.prototype.remove = function(item) {
	this.elements.splice(this.elements.indexOf(item), 1);
};
ElementStack.prototype.popUntilPopped = function(localName) {
	var element;
	do {
		element = this.pop();
	} while (element.localName != localName);
};

ElementStack.prototype.popUntilTableScopeMarker = function() {
	while (!isTableScopeMarker(this.top))
		this.pop();
};

ElementStack.prototype.popUntilTableBodyScopeMarker = function() {
	while (!isTableBodyScopeMarker(this.top))
		this.pop();
};

ElementStack.prototype.popUntilTableRowScopeMarker = function() {
	while (!isTableRowScopeMarker(this.top))
		this.pop();
};
ElementStack.prototype.item = function(index) {
	return this.elements[index];
};
ElementStack.prototype.contains = function(element) {
	return this.elements.indexOf(element) !== -1;
};
ElementStack.prototype.inScope = function(localName) {
	return this._inScope(localName, isScopeMarker);
};
ElementStack.prototype.inListItemScope = function(localName) {
	return this._inScope(localName, isListItemScopeMarker);
};
ElementStack.prototype.inTableScope = function(localName) {
	return this._inScope(localName, isTableScopeMarker);
};
ElementStack.prototype.inButtonScope = function(localName) {
	return this._inScope(localName, isButtonScopeMarker);
};
ElementStack.prototype.inSelectScope = function(localName) {
	return this._inScope(localName, isSelectScopeMarker);
};
ElementStack.prototype.hasNumberedHeaderElementInScope = function() {
	for (var i = this.elements.length - 1; i >= 0; i--) {
		var node = this.elements[i];
		if (node.isNumberedHeader())
			return true;
		if (isScopeMarker(node))
			return false;
	}
};
ElementStack.prototype.furthestBlockForFormattingElement = function(element) {
	var furthestBlock = null;
	for (var i = this.elements.length - 1; i >= 0; i--) {
		var node = this.elements[i];
		if (node.node === element)
			break;
		if (node.isSpecial())
			furthestBlock = node;
	}
    return furthestBlock;
};
ElementStack.prototype.findIndex = function(localName) {
	for (var i = this.elements.length - 1; i >= 0; i--) {
		if (this.elements[i].localName == localName)
			return i;
	}
    return -1;
};

ElementStack.prototype.remove_openElements_until = function(callback) {
	var finished = false;
	var element;
	while (!finished) {
		element = this.elements.pop();
		finished = callback(element);
	}
	return element;
};

Object.defineProperty(ElementStack.prototype, 'top', {
	get: function() {
		return this.elements[this.elements.length - 1];
	}
});

Object.defineProperty(ElementStack.prototype, 'length', {
	get: function() {
		return this.elements.length;
	}
});

exports.ElementStack = ElementStack;

},
{}],
2:[function(_dereq_,module,exports){
var entities  = _dereq_('html5-entities');
var InputStream = _dereq_('./InputStream').InputStream;

var namedEntityPrefixes = {};
Object.keys(entities).forEach(function (entityKey) {
	for (var i = 0; i < entityKey.length; i++) {
		namedEntityPrefixes[entityKey.substring(0, i + 1)] = true;
	}
});

function isAlphaNumeric(c) {
	return (c >= '0' && c <= '9') || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
}

function isHexDigit(c) {
	return (c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F');
}

function isDecimalDigit(c) {
	return (c >= '0' && c <= '9');
}

var EntityParser = {};

EntityParser.consumeEntity = function(buffer, tokenizer, additionalAllowedCharacter) {
	var decodedCharacter = '';
	var consumedCharacters = '';
	var ch = buffer.char();
	if (ch === InputStream.EOF)
		return false;
	consumedCharacters += ch;
	if (ch == '\t' || ch == '\n' || ch == '\v' || ch == ' ' || ch == '<' || ch == '&') {
		buffer.unget(consumedCharacters);
		return false;
	}
	if (additionalAllowedCharacter === ch) {
		buffer.unget(consumedCharacters);
		return false;
	}
	if (ch == '#') {
		ch = buffer.shift(1);
		if (ch === InputStream.EOF) {
			tokenizer._parseError("expected-numeric-entity-but-got-eof");
			buffer.unget(consumedCharacters);
			return false;
		}
		consumedCharacters += ch;
		var radix = 10;
		var isDigit = isDecimalDigit;
		if (ch == 'x' || ch == 'X') {
			radix = 16;
			isDigit = isHexDigit;
			ch = buffer.shift(1);
			if (ch === InputStream.EOF) {
				tokenizer._parseError("expected-numeric-entity-but-got-eof");
				buffer.unget(consumedCharacters);
				return false;
			}
			consumedCharacters += ch;
		}
		if (isDigit(ch)) {
			var code = '';
			while (ch !== InputStream.EOF && isDigit(ch)) {
				code += ch;
				ch = buffer.char();
			}
			code = parseInt(code, radix);
			var replacement = this.replaceEntityNumbers(code);
			if (replacement) {
				tokenizer._parseError("invalid-numeric-entity-replaced");
				code = replacement;
			}
			if (code > 0xFFFF && code <= 0x10FFFF) {
		        code -= 0x10000;
		        var first = ((0xffc00 & code) >> 10) + 0xD800;
		        var second = (0x3ff & code) + 0xDC00;
				decodedCharacter = String.fromCharCode(first, second);
			} else
				decodedCharacter = String.fromCharCode(code);
			if (ch !== ';') {
				tokenizer._parseError("numeric-entity-without-semicolon");
				buffer.unget(ch);
			}
			return decodedCharacter;
		}
		buffer.unget(consumedCharacters);
		tokenizer._parseError("expected-numeric-entity");
		return false;
	}
	if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z')) {
		var mostRecentMatch = '';
		while (namedEntityPrefixes[consumedCharacters]) {
			if (entities[consumedCharacters]) {
				mostRecentMatch = consumedCharacters;
			}
			if (ch == ';')
				break;
			ch = buffer.char();
			if (ch === InputStream.EOF)
				break;
			consumedCharacters += ch;
		}
		if (!mostRecentMatch) {
			tokenizer._parseError("expected-named-entity");
			buffer.unget(consumedCharacters);
			return false;
		}
		decodedCharacter = entities[mostRecentMatch];
		if (ch === ';' || !additionalAllowedCharacter || !(isAlphaNumeric(ch) || ch === '=')) {
			if (consumedCharacters.length > mostRecentMatch.length) {
				buffer.unget(consumedCharacters.substring(mostRecentMatch.length));
			}
			if (ch !== ';') {
				tokenizer._parseError("named-entity-without-semicolon");
			}
			return decodedCharacter;
		}
		buffer.unget(consumedCharacters);
		return false;
	}
};

EntityParser.replaceEntityNumbers = function(c) {
	switch(c) {
		case 0x00: return 0xFFFD; // REPLACEMENT CHARACTER
		case 0x13: return 0x0010; // Carriage return
		case 0x80: return 0x20AC; // EURO SIGN
		case 0x81: return 0x0081; // <control>
		case 0x82: return 0x201A; // SINGLE LOW-9 QUOTATION MARK
		case 0x83: return 0x0192; // LATIN SMALL LETTER F WITH HOOK
		case 0x84: return 0x201E; // DOUBLE LOW-9 QUOTATION MARK
		case 0x85: return 0x2026; // HORIZONTAL ELLIPSIS
		case 0x86: return 0x2020; // DAGGER
		case 0x87: return 0x2021; // DOUBLE DAGGER
		case 0x88: return 0x02C6; // MODIFIER LETTER CIRCUMFLEX ACCENT
		case 0x89: return 0x2030; // PER MILLE SIGN
		case 0x8A: return 0x0160; // LATIN CAPITAL LETTER S WITH CARON
		case 0x8B: return 0x2039; // SINGLE LEFT-POINTING ANGLE QUOTATION MARK
		case 0x8C: return 0x0152; // LATIN CAPITAL LIGATURE OE
		case 0x8D: return 0x008D; // <control>
		case 0x8E: return 0x017D; // LATIN CAPITAL LETTER Z WITH CARON
		case 0x8F: return 0x008F; // <control>
		case 0x90: return 0x0090; // <control>
		case 0x91: return 0x2018; // LEFT SINGLE QUOTATION MARK
		case 0x92: return 0x2019; // RIGHT SINGLE QUOTATION MARK
		case 0x93: return 0x201C; // LEFT DOUBLE QUOTATION MARK
		case 0x94: return 0x201D; // RIGHT DOUBLE QUOTATION MARK
		case 0x95: return 0x2022; // BULLET
		case 0x96: return 0x2013; // EN DASH
		case 0x97: return 0x2014; // EM DASH
		case 0x98: return 0x02DC; // SMALL TILDE
		case 0x99: return 0x2122; // TRADE MARK SIGN
		case 0x9A: return 0x0161; // LATIN SMALL LETTER S WITH CARON
		case 0x9B: return 0x203A; // SINGLE RIGHT-POINTING ANGLE QUOTATION MARK
		case 0x9C: return 0x0153; // LATIN SMALL LIGATURE OE
		case 0x9D: return 0x009D; // <control>
		case 0x9E: return 0x017E; // LATIN SMALL LETTER Z WITH CARON
		case 0x9F: return 0x0178; // LATIN CAPITAL LETTER Y WITH DIAERESIS
		default:
			if ((c >= 0xD800 && c <= 0xDFFF) || c > 0x10FFFF) {
				return 0xFFFD;
			} else if ((c >= 0x0001 && c <= 0x0008) || (c >= 0x000E && c <= 0x001F) ||
				(c >= 0x007F && c <= 0x009F) || (c >= 0xFDD0 && c <= 0xFDEF) ||
				c == 0x000B || c == 0xFFFE || c == 0x1FFFE || c == 0x2FFFFE ||
				c == 0x2FFFF || c == 0x3FFFE || c == 0x3FFFF || c == 0x4FFFE ||
				c == 0x4FFFF || c == 0x5FFFE || c == 0x5FFFF || c == 0x6FFFE ||
				c == 0x6FFFF || c == 0x7FFFE || c == 0x7FFFF || c == 0x8FFFE ||
				c == 0x8FFFF || c == 0x9FFFE || c == 0x9FFFF || c == 0xAFFFE ||
				c == 0xAFFFF || c == 0xBFFFE || c == 0xBFFFF || c == 0xCFFFE ||
				c == 0xCFFFF || c == 0xDFFFE || c == 0xDFFFF || c == 0xEFFFE ||
				c == 0xEFFFF || c == 0xFFFFE || c == 0xFFFFF || c == 0x10FFFE ||
				c == 0x10FFFF) {
				return c;
			}
	}
};

exports.EntityParser = EntityParser;

},
{"./InputStream":3,"html5-entities":12}],
3:[function(_dereq_,module,exports){
function InputStream() {
	this.data = '';
	this.start = 0;
	this.committed = 0;
	this.eof = false;
	this.lastLocation = {line: 0, column: 0};
}

InputStream.EOF = -1;

InputStream.DRAIN = -2;

InputStream.prototype = {
	slice: function() {
		if(this.start >= this.data.length) {
			if(!this.eof) throw InputStream.DRAIN;
			return InputStream.EOF;
		}
		return this.data.slice(this.start, this.data.length);
	},
	char: function() {
		if(!this.eof && this.start >= this.data.length - 1) throw InputStream.DRAIN;
		if(this.start >= this.data.length) {
			return InputStream.EOF;
		}
		var ch = this.data[this.start++];
		if (ch === '\r')
			ch = '\n';
		return ch;
	},
	advance: function(amount) {
		this.start += amount;
		if(this.start >= this.data.length) {
			if(!this.eof) throw InputStream.DRAIN;
			return InputStream.EOF;
		} else {
			if(this.committed > this.data.length / 2) {
				this.lastLocation = this.location();
				this.data = this.data.slice(this.committed);
				this.start = this.start - this.committed;
				this.committed = 0;
			}
		}
	},
	matchWhile: function(re) {
		if(this.eof && this.start >= this.data.length ) return '';
		var r = new RegExp("^"+re+"+");
		var m = r.exec(this.slice());
		if(m) {
			if(!this.eof && m[0].length == this.data.length - this.start) throw InputStream.DRAIN;
			this.advance(m[0].length);
			return m[0];
		} else {
			return '';
		}
	},
	matchUntil: function(re) {
		var m, s;
		s = this.slice();
		if(s === InputStream.EOF) {
			return '';
		} else if(m = new RegExp(re + (this.eof ? "|$" : "")).exec(s)) {
			var t = this.data.slice(this.start, this.start + m.index);
			this.advance(m.index);
			return t.replace(/\r/g, '\n').replace(/\n{2,}/g, '\n');
		} else {
			throw InputStream.DRAIN;
		}
	},
	append: function(data) {
		this.data += data;
	},
	shift: function(n) {
		if(!this.eof && this.start + n >= this.data.length) throw InputStream.DRAIN;
		if(this.eof && this.start >= this.data.length) return InputStream.EOF;
		var d = this.data.slice(this.start, this.start + n).toString();
		this.advance(Math.min(n, this.data.length - this.start));
		return d;
	},
	peek: function(n) {
		if(!this.eof && this.start + n >= this.data.length) throw InputStream.DRAIN;
		if(this.eof && this.start >= this.data.length) return InputStream.EOF;
		return this.data.slice(this.start, Math.min(this.start + n, this.data.length)).toString();
	},
	length: function() {
		return this.data.length - this.start - 1;
	},
	unget: function(d) {
		if(d === InputStream.EOF) return;
		this.start -= (d.length);
	},
	undo: function() {
		this.start = this.committed;
	},
	commit: function() {
		this.committed = this.start;
	},
	location: function() {
		var lastLine = this.lastLocation.line;
		var lastColumn = this.lastLocation.column;
		var read = this.data.slice(0, this.committed);
		var newlines = read.match(/\n/g);
		var line = newlines ? lastLine + newlines.length : lastLine;
		var column = newlines ? read.length - read.lastIndexOf('\n') - 1 : lastColumn + read.length;
		return {line: line, column: column};
	}
};

exports.InputStream = InputStream;

},
{}],
4:[function(_dereq_,module,exports){
var SpecialElements = {
	"http://www.w3.org/1999/xhtml": [
		'address',
		'applet',
		'area',
		'article',
		'aside',
		'base',
		'basefont',
		'bgsound',
		'blockquote',
		'body',
		'br',
		'button',
		'caption',
		'center',
		'col',
		'colgroup',
		'dd',
		'details',
		'dir',
		'div',
		'dl',
		'dt',
		'embed',
		'fieldset',
		'figcaption',
		'figure',
		'footer',
		'form',
		'frame',
		'frameset',
		'h1',
		'h2',
		'h3',
		'h4',
		'h5',
		'h6',
		'head',
		'header',
		'hgroup',
		'hr',
		'html',
		'iframe',
		'img',
		'input',
		'isindex',
		'li',
		'link',
		'listing',
		'main',
		'marquee',
		'menu',
		'menuitem',
		'meta',
		'nav',
		'noembed',
		'noframes',
		'noscript',
		'object',
		'ol',
		'p',
		'param',
		'plaintext',
		'pre',
		'script',
		'section',
		'select',
		'source',
		'style',
		'summary',
		'table',
		'tbody',
		'td',
		'textarea',
		'tfoot',
		'th',
		'thead',
		'title',
		'tr',
		'track',
		'ul',
		'wbr',
		'xmp'
	],
	"http://www.w3.org/1998/Math/MathML": [
		'mi',
		'mo',
		'mn',
		'ms',
		'mtext',
		'annotation-xml'
	],
	"http://www.w3.org/2000/svg": [
		'foreignObject',
		'desc',
		'title'
	]
};


function StackItem(namespaceURI, localName, attributes, node) {
	this.localName = localName;
	this.namespaceURI = namespaceURI;
	this.attributes = attributes;
	this.node = node;
}
StackItem.prototype.isSpecial = function() {
	return this.namespaceURI in SpecialElements &&
		SpecialElements[this.namespaceURI].indexOf(this.localName) > -1;
};

StackItem.prototype.isFosterParenting = function() {
	if (this.namespaceURI === "http://www.w3.org/1999/xhtml") {
		return this.localName === 'table' ||
			this.localName === 'tbody' ||
			this.localName === 'tfoot' ||
			this.localName === 'thead' ||
			this.localName === 'tr';
	}
	return false;
};

StackItem.prototype.isNumberedHeader = function() {
	if (this.namespaceURI === "http://www.w3.org/1999/xhtml") {
		return this.localName === 'h1' ||
			this.localName === 'h2' ||
			this.localName === 'h3' ||
			this.localName === 'h4' ||
			this.localName === 'h5' ||
			this.localName === 'h6';
	}
	return false;
};

StackItem.prototype.isForeign = function() {
	return this.namespaceURI != "http://www.w3.org/1999/xhtml";
};

function getAttribute(item, name) {
	for (var i = 0; i < item.attributes.length; i++) {
		if (item.attributes[i].nodeName == name)
			return item.attributes[i].nodeValue;
	}
	return null;
}

StackItem.prototype.isHtmlIntegrationPoint = function() {
	if (this.namespaceURI === "http://www.w3.org/1998/Math/MathML") {
		if (this.localName !== "annotation-xml")
			return false;
		var encoding = getAttribute(this, 'encoding');
		if (!encoding)
			return false;
		encoding = encoding.toLowerCase();
		return encoding === "text/html" || encoding === "application/xhtml+xml";
	}
	if (this.namespaceURI === "http://www.w3.org/2000/svg") {
		return this.localName === "foreignObject"
			|| this.localName === "desc"
			|| this.localName === "title";
	}
	return false;
};

StackItem.prototype.isMathMLTextIntegrationPoint = function() {
	if (this.namespaceURI === "http://www.w3.org/1998/Math/MathML") {
		return this.localName === "mi"
			|| this.localName === "mo"
			|| this.localName === "mn"
			|| this.localName === "ms"
			|| this.localName === "mtext";
	}
	return false;
};

exports.StackItem = StackItem;

},
{}],
5:[function(_dereq_,module,exports){
var InputStream = _dereq_('./InputStream').InputStream;
var EntityParser = _dereq_('./EntityParser').EntityParser;

function isWhitespace(c){
	return c === " " || c === "\n" || c === "\t" || c === "\r" || c === "\f";
}

function isAlpha(c) {
	return (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z');
}
function Tokenizer(tokenHandler) {
	this._tokenHandler = tokenHandler;
	this._state = Tokenizer.DATA;
	this._inputStream = new InputStream();
	this._currentToken = null;
	this._temporaryBuffer = '';
	this._additionalAllowedCharacter = '';
}

Tokenizer.prototype._parseError = function(code, args) {
	this._tokenHandler.parseError(code, args);
};

Tokenizer.prototype._emitToken = function(token) {
	if (token.type === 'StartTag') {
		for (var i = 1; i < token.data.length; i++) {
			if (!token.data[i].nodeName)
				token.data.splice(i--, 1);
		}
	} else if (token.type === 'EndTag') {
		if (token.selfClosing) {
			this._parseError('self-closing-flag-on-end-tag');
		}
		if (token.data.length !== 0) {
			this._parseError('attributes-in-end-tag');
		}
	}
	this._tokenHandler.processToken(token);
	if (token.type === 'StartTag' && token.selfClosing && !this._tokenHandler.isSelfClosingFlagAcknowledged()) {
		this._parseError('non-void-element-with-trailing-solidus', {name: token.name});
	}
};

Tokenizer.prototype._emitCurrentToken = function() {
	this._state = Tokenizer.DATA;
	this._emitToken(this._currentToken);
};

Tokenizer.prototype._currentAttribute = function() {
	return this._currentToken.data[this._currentToken.data.length - 1];
};

Tokenizer.prototype.setState = function(state) {
	this._state = state;
};

Tokenizer.prototype.tokenize = function(source) {
	Tokenizer.DATA = data_state;
	Tokenizer.RCDATA = rcdata_state;
	Tokenizer.RAWTEXT = rawtext_state;
	Tokenizer.SCRIPT_DATA = script_data_state;
	Tokenizer.PLAINTEXT = plaintext_state;


	this._state = Tokenizer.DATA;

	this._inputStream.append(source);

	this._tokenHandler.startTokenization(this);

	this._inputStream.eof = true;

	var tokenizer = this;

	while (this._state.call(this, this._inputStream));


	function data_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._emitToken({type: 'EOF', data: null});
			return false;
		} else if (data === '&') {
			tokenizer.setState(character_reference_in_data_state);
		} else if (data === '<') {
			tokenizer.setState(tag_open_state);
		} else if (data === '\u0000') {
			tokenizer._emitToken({type: 'Characters', data: data});
			buffer.commit();
		} else {
			var chars = buffer.matchUntil("&|<|\u0000");
			tokenizer._emitToken({type: 'Characters', data: data + chars});
			buffer.commit();
		}
		return true;
	}

	function character_reference_in_data_state(buffer) {
		var character = EntityParser.consumeEntity(buffer, tokenizer);
		tokenizer.setState(data_state);
		tokenizer._emitToken({type: 'Characters', data: character || '&'});
		return true;
	}

	function rcdata_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._emitToken({type: 'EOF', data: null});
			return false;
		} else if (data === '&') {
			tokenizer.setState(character_reference_in_rcdata_state);
		} else if (data === '<') {
			tokenizer.setState(rcdata_less_than_sign_state);
		} else if (data === "\u0000") {
			tokenizer._parseError("invalid-codepoint");
			tokenizer._emitToken({type: 'Characters', data: '\uFFFD'});
			buffer.commit();
		} else {
			var chars = buffer.matchUntil("&|<|\u0000");
			tokenizer._emitToken({type: 'Characters', data: data + chars});
			buffer.commit();
		}
		return true;
	}

	function character_reference_in_rcdata_state(buffer) {
		var character = EntityParser.consumeEntity(buffer, tokenizer);
		tokenizer.setState(rcdata_state);
		tokenizer._emitToken({type: 'Characters', data: character || '&'});
		return true;
	}

	function rawtext_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._emitToken({type: 'EOF', data: null});
			return false;
		} else if (data === '<') {
			tokenizer.setState(rawtext_less_than_sign_state);
		} else if (data === "\u0000") {
			tokenizer._parseError("invalid-codepoint");
			tokenizer._emitToken({type: 'Characters', data: '\uFFFD'});
			buffer.commit();
		} else {
			var chars = buffer.matchUntil("<|\u0000");
			tokenizer._emitToken({type: 'Characters', data: data + chars});
		}
		return true;
	}

	function plaintext_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._emitToken({type: 'EOF', data: null});
			return false;
		} else if (data === "\u0000") {
			tokenizer._parseError("invalid-codepoint");
			tokenizer._emitToken({type: 'Characters', data: '\uFFFD'});
			buffer.commit();
		} else {
			var chars = buffer.matchUntil("\u0000");
			tokenizer._emitToken({type: 'Characters', data: data + chars});
		}
		return true;
	}


	function script_data_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._emitToken({type: 'EOF', data: null});
			return false;
		} else if (data === '<') {
			tokenizer.setState(script_data_less_than_sign_state);
		} else if (data === '\u0000') {
			tokenizer._parseError("invalid-codepoint");
			tokenizer._emitToken({type: 'Characters', data: '\uFFFD'});
			buffer.commit();
		} else {
			var chars = buffer.matchUntil("<|\u0000");
			tokenizer._emitToken({type: 'Characters', data: data + chars});
		}
		return true;
	}

	function rcdata_less_than_sign_state(buffer) {
		var data = buffer.char();
		if (data === "/") {
			this._temporaryBuffer = '';
			tokenizer.setState(rcdata_end_tag_open_state);
		} else {
			tokenizer._emitToken({type: 'Characters', data: '<'});
			buffer.unget(data);
			tokenizer.setState(rcdata_state);
		}
		return true;
	}

	function rcdata_end_tag_open_state(buffer) {
		var data = buffer.char();
		if (isAlpha(data)) {
			this._temporaryBuffer += data;
			tokenizer.setState(rcdata_end_tag_name_state);
		} else {
			tokenizer._emitToken({type: 'Characters', data: '</'});
			buffer.unget(data);
			tokenizer.setState(rcdata_state);
		}
		return true;
	}

	function rcdata_end_tag_name_state(buffer) {
		var appropriate = tokenizer._currentToken && (tokenizer._currentToken.name === this._temporaryBuffer.toLowerCase());
		var data = buffer.char();
		if (isWhitespace(data) && appropriate) {
			tokenizer._currentToken = {type: 'EndTag', name: this._temporaryBuffer, data: [], selfClosing: false};
			tokenizer.setState(before_attribute_name_state);
		} else if (data === '/' && appropriate) {
			tokenizer._currentToken = {type: 'EndTag', name: this._temporaryBuffer, data: [], selfClosing: false};
			tokenizer.setState(self_closing_tag_state);
		} else if (data === '>' && appropriate) {
			tokenizer._currentToken = {type: 'EndTag', name: this._temporaryBuffer, data: [], selfClosing: false};
			tokenizer._emitCurrentToken();
			tokenizer.setState(data_state);
		} else if (isAlpha(data)) {
			this._temporaryBuffer += data;
			buffer.commit();
		} else {
			tokenizer._emitToken({type: 'Characters', data: '</' + this._temporaryBuffer});
			buffer.unget(data);
			tokenizer.setState(rcdata_state);
		}
		return true;
	}

	function rawtext_less_than_sign_state(buffer) {
		var data = buffer.char();
		if (data === "/") {
			this._temporaryBuffer = '';
			tokenizer.setState(rawtext_end_tag_open_state);
		} else {
			tokenizer._emitToken({type: 'Characters', data: '<'});
			buffer.unget(data);
			tokenizer.setState(rawtext_state);
		}
		return true;
	}

	function rawtext_end_tag_open_state(buffer) {
		var data = buffer.char();
		if (isAlpha(data)) {
			this._temporaryBuffer += data;
			tokenizer.setState(rawtext_end_tag_name_state);
		} else {
			tokenizer._emitToken({type: 'Characters', data: '</'});
			buffer.unget(data);
			tokenizer.setState(rawtext_state);
		}
		return true;
	}

	function rawtext_end_tag_name_state(buffer) {
		var appropriate = tokenizer._currentToken && (tokenizer._currentToken.name === this._temporaryBuffer.toLowerCase());
		var data = buffer.char();
		if (isWhitespace(data) && appropriate) {
			tokenizer._currentToken = {type: 'EndTag', name: this._temporaryBuffer, data: [], selfClosing: false};
			tokenizer.setState(before_attribute_name_state);
		} else if (data === '/' && appropriate) {
			tokenizer._currentToken = {type: 'EndTag', name: this._temporaryBuffer, data: [], selfClosing: false};
			tokenizer.setState(self_closing_tag_state);
		} else if (data === '>' && appropriate) {
			tokenizer._currentToken = {type: 'EndTag', name: this._temporaryBuffer, data: [], selfClosing: false};
			tokenizer._emitCurrentToken();
			tokenizer.setState(data_state);
		} else if (isAlpha(data)) {
			this._temporaryBuffer += data;
			buffer.commit();
		} else {
			tokenizer._emitToken({type: 'Characters', data: '</' + this._temporaryBuffer});
			buffer.unget(data);
			tokenizer.setState(rawtext_state);
		}
		return true;
	}

	function script_data_less_than_sign_state(buffer) {
		var data = buffer.char();
		if (data === "/") {
			this._temporaryBuffer = '';
			tokenizer.setState(script_data_end_tag_open_state);
		} else if (data === '!') {
			tokenizer._emitToken({type: 'Characters', data: '<!'});
			tokenizer.setState(script_data_escape_start_state);
		} else {
			tokenizer._emitToken({type: 'Characters', data: '<'});
			buffer.unget(data);
			tokenizer.setState(script_data_state);
		}
		return true;
	}

	function script_data_end_tag_open_state(buffer) {
		var data = buffer.char();
		if (isAlpha(data)) {
			this._temporaryBuffer += data;
			tokenizer.setState(script_data_end_tag_name_state);
		} else {
			tokenizer._emitToken({type: 'Characters', data: '</'});
			buffer.unget(data);
			tokenizer.setState(script_data_state);
		}
		return true;
	}

	function script_data_end_tag_name_state(buffer) {
		var appropriate = tokenizer._currentToken && (tokenizer._currentToken.name === this._temporaryBuffer.toLowerCase());
		var data = buffer.char();
		if (isWhitespace(data) && appropriate) {
			tokenizer._currentToken = {type: 'EndTag', name: 'script', data: [], selfClosing: false};
			tokenizer.setState(before_attribute_name_state);
		} else if (data === '/' && appropriate) {
			tokenizer._currentToken = {type: 'EndTag', name: 'script', data: [], selfClosing: false};
			tokenizer.setState(self_closing_tag_state);
		} else if (data === '>' && appropriate) {
			tokenizer._currentToken = {type: 'EndTag', name: 'script', data: [], selfClosing: false};
			tokenizer._emitCurrentToken();
		} else if (isAlpha(data)) {
			this._temporaryBuffer += data;
			buffer.commit();
		} else {
			tokenizer._emitToken({type: 'Characters', data: '</' + this._temporaryBuffer});
			buffer.unget(data);
			tokenizer.setState(script_data_state);
		}
		return true;
	}

	function script_data_escape_start_state(buffer) {
		var data = buffer.char();
		if (data === '-') {
			tokenizer._emitToken({type: 'Characters', data: '-'});
			tokenizer.setState(script_data_escape_start_dash_state);
		} else {
			buffer.unget(data);
			tokenizer.setState(script_data_state);
		}
		return true;
	}

	function script_data_escape_start_dash_state(buffer) {
		var data = buffer.char();
		if (data === '-') {
			tokenizer._emitToken({type: 'Characters', data: '-'});
			tokenizer.setState(script_data_escaped_dash_dash_state);
		} else {
			buffer.unget(data);
			tokenizer.setState(script_data_state);
		}
		return true;
	}

	function script_data_escaped_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (data === '-') {
			tokenizer._emitToken({type: 'Characters', data: '-'});
			tokenizer.setState(script_data_escaped_dash_state);
		} else if (data === '<') {
			tokenizer.setState(script_data_escaped_less_then_sign_state);
		} else if (data === '\u0000') {
			tokenizer._parseError("invalid-codepoint");
			tokenizer._emitToken({type: 'Characters', data: '\uFFFD'});
			buffer.commit();
		} else {
			var chars = buffer.matchUntil('<|-|\u0000');
			tokenizer._emitToken({type: 'Characters', data: data + chars});
		}
		return true;
	}

	function script_data_escaped_dash_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (data === '-') {
			tokenizer._emitToken({type: 'Characters', data: '-'});
			tokenizer.setState(script_data_escaped_dash_dash_state);
		} else if (data === '<') {
			tokenizer.setState(script_data_escaped_less_then_sign_state);
		} else if (data === '\u0000') {
			tokenizer._parseError("invalid-codepoint");
			tokenizer._emitToken({type: 'Characters', data: '\uFFFD'});
			tokenizer.setState(script_data_escaped_state);
		} else {
			tokenizer._emitToken({type: 'Characters', data: data});
			tokenizer.setState(script_data_escaped_state);
		}
		return true;
	}

	function script_data_escaped_dash_dash_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError('eof-in-script');
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (data === '<') {
			tokenizer.setState(script_data_escaped_less_then_sign_state);
		} else if (data === '>') {
			tokenizer._emitToken({type: 'Characters', data: '>'});
			tokenizer.setState(script_data_state);
		} else if (data === '\u0000') {
			tokenizer._parseError("invalid-codepoint");
			tokenizer._emitToken({type: 'Characters', data: '\uFFFD'});
			tokenizer.setState(script_data_escaped_state);
		} else {
			tokenizer._emitToken({type: 'Characters', data: data});
			tokenizer.setState(script_data_escaped_state);
		}
		return true;
	}

	function script_data_escaped_less_then_sign_state(buffer) {
		var data = buffer.char();
		if (data === '/') {
			this._temporaryBuffer = '';
			tokenizer.setState(script_data_escaped_end_tag_open_state);
		} else if (isAlpha(data)) {
			tokenizer._emitToken({type: 'Characters', data: '<' + data});
			this._temporaryBuffer = data;
			tokenizer.setState(script_data_double_escape_start_state);
		} else {
			tokenizer._emitToken({type: 'Characters', data: '<'});
			buffer.unget(data);
			tokenizer.setState(script_data_escaped_state);
		}
		return true;
	}

	function script_data_escaped_end_tag_open_state(buffer) {
		var data = buffer.char();
		if (isAlpha(data)) {
			this._temporaryBuffer = data;
			tokenizer.setState(script_data_escaped_end_tag_name_state);
		} else {
			tokenizer._emitToken({type: 'Characters', data: '</'});
			buffer.unget(data);
			tokenizer.setState(script_data_escaped_state);
		}
		return true;
	}

	function script_data_escaped_end_tag_name_state(buffer) {
		var appropriate = tokenizer._currentToken && (tokenizer._currentToken.name === this._temporaryBuffer.toLowerCase());
		var data = buffer.char();
		if (isWhitespace(data) && appropriate) {
			tokenizer._currentToken = {type: 'EndTag', name: 'script', data: [], selfClosing: false};
			tokenizer.setState(before_attribute_name_state);
		} else if (data === '/' && appropriate) {
			tokenizer._currentToken = {type: 'EndTag', name: 'script', data: [], selfClosing: false};
			tokenizer.setState(self_closing_tag_state);
		} else if (data === '>' &&  appropriate) {
			tokenizer._currentToken = {type: 'EndTag', name: 'script', data: [], selfClosing: false};
			tokenizer.setState(data_state);
			tokenizer._emitCurrentToken();
		} else if (isAlpha(data)) {
			this._temporaryBuffer += data;
			buffer.commit();
		} else {
			tokenizer._emitToken({type: 'Characters', data: '</' + this._temporaryBuffer});
			buffer.unget(data);
			tokenizer.setState(script_data_escaped_state);
		}
		return true;
	}

	function script_data_double_escape_start_state(buffer) {
		var data = buffer.char();
		if (isWhitespace(data) || data === '/' || data === '>') {
			tokenizer._emitToken({type: 'Characters', data: data});
			if (this._temporaryBuffer.toLowerCase() === 'script')
				tokenizer.setState(script_data_double_escaped_state);
			else
				tokenizer.setState(script_data_escaped_state);
		} else if (isAlpha(data)) {
			tokenizer._emitToken({type: 'Characters', data: data});
			this._temporaryBuffer += data;
			buffer.commit();
		} else {
			buffer.unget(data);
			tokenizer.setState(script_data_escaped_state);
		}
		return true;
	}

	function script_data_double_escaped_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError('eof-in-script');
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (data === '-') {
			tokenizer._emitToken({type: 'Characters', data: '-'});
			tokenizer.setState(script_data_double_escaped_dash_state);
		} else if (data === '<') {
			tokenizer._emitToken({type: 'Characters', data: '<'});
			tokenizer.setState(script_data_double_escaped_less_than_sign_state);
		} else if (data === '\u0000') {
			tokenizer._parseError('invalid-codepoint');
			tokenizer._emitToken({type: 'Characters', data: '\uFFFD'});
			buffer.commit();
		} else {
			tokenizer._emitToken({type: 'Characters', data: data});
			buffer.commit();
		}
		return true;
	}

	function script_data_double_escaped_dash_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError('eof-in-script');
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (data === '-') {
			tokenizer._emitToken({type: 'Characters', data: '-'});
			tokenizer.setState(script_data_double_escaped_dash_dash_state);
		} else if (data === '<') {
			tokenizer._emitToken({type: 'Characters', data: '<'});
			tokenizer.setState(script_data_double_escaped_less_than_sign_state);
		} else if (data === '\u0000') {
			tokenizer._parseError('invalid-codepoint');
			tokenizer._emitToken({type: 'Characters', data: '\uFFFD'});
			tokenizer.setState(script_data_double_escaped_state);
		} else {
			tokenizer._emitToken({type: 'Characters', data: data});
			tokenizer.setState(script_data_double_escaped_state);
		}
		return true;
	}

	function script_data_double_escaped_dash_dash_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError('eof-in-script');
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (data === '-') {
			tokenizer._emitToken({type: 'Characters', data: '-'});
			buffer.commit();
		} else if (data === '<') {
			tokenizer._emitToken({type: 'Characters', data: '<'});
			tokenizer.setState(script_data_double_escaped_less_than_sign_state);
		} else if (data === '>') {
			tokenizer._emitToken({type: 'Characters', data: '>'});
			tokenizer.setState(script_data_state);
		} else if (data === '\u0000') {
			tokenizer._parseError('invalid-codepoint');
			tokenizer._emitToken({type: 'Characters', data: '\uFFFD'});
			tokenizer.setState(script_data_double_escaped_state);
		} else {
			tokenizer._emitToken({type: 'Characters', data: data});
			tokenizer.setState(script_data_double_escaped_state);
		}
		return true;
	}

	function script_data_double_escaped_less_than_sign_state(buffer) {
		var data = buffer.char();
		if (data === '/') {
			tokenizer._emitToken({type: 'Characters', data: '/'});
			this._temporaryBuffer = '';
			tokenizer.setState(script_data_double_escape_end_state);
		} else {
			buffer.unget(data);
			tokenizer.setState(script_data_double_escaped_state);
		}
		return true;
	}

	function script_data_double_escape_end_state(buffer) {
		var data = buffer.char();
		if (isWhitespace(data) || data === '/' || data === '>') {
			tokenizer._emitToken({type: 'Characters', data: data});
			if (this._temporaryBuffer.toLowerCase() === 'script')
				tokenizer.setState(script_data_escaped_state);
			else
				tokenizer.setState(script_data_double_escaped_state);
		} else if (isAlpha(data)) {
			tokenizer._emitToken({type: 'Characters', data: data});
			this._temporaryBuffer += data;
			buffer.commit();
		} else {
			buffer.unget(data);
			tokenizer.setState(script_data_double_escaped_state);
		}
		return true;
	}

	function tag_open_state(buffer) {
		var data = buffer.char();
		if (data === InputStream.EOF) {
			tokenizer._parseError("bare-less-than-sign-at-eof");
			tokenizer._emitToken({type: 'Characters', data: '<'});
			buffer.unget(data);
			tokenizer.setState(data_state);
		} else if (isAlpha(data)) {