
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

define("ace/mode/javascript/jshint",[], function(require, exports, module) {
module.exports = (function outer (modules, cache, entry) {
    var previousRequire = typeof require == "function" && require;
    function newRequire(name, jumped){
        if(!cache[name]) {
            if(!modules[name]) {
                var currentRequire = typeof require == "function" && require;
                if (!jumped && currentRequire) return currentRequire(name, true);
                if (previousRequire) return previousRequire(name, true);
                var err = new Error('Cannot find module \'' + name + '\'');
                err.code = 'MODULE_NOT_FOUND';
                throw err;
            }
            var m = cache[name] = {exports:{}};
            modules[name][0].call(m.exports, function(x){
                var id = modules[name][1][x];
                return newRequire(id ? id : x);
            },m,m.exports,outer,modules,cache,entry);
        }
        return cache[name].exports;
    }
    for(var i=0;i<entry.length;i++) newRequire(entry[i]);
    return newRequire(entry[0]);
})
({"/node_modules/browserify/node_modules/events/events.js":[function(_dereq_,module,exports){

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;
EventEmitter.defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    this._events[type].push(listener);
  else
    this._events[type] = [this._events[type], listener];
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],"/node_modules/jshint/data/ascii-identifier-data.js":[function(_dereq_,module,exports){
var identifierStartTable = [];

for (var i = 0; i < 128; i++) {
  identifierStartTable[i] =
    i === 36 ||           // $
    i >= 65 && i <= 90 || // A-Z
    i === 95 ||           // _
    i >= 97 && i <= 122;  // a-z
}

var identifierPartTable = [];

for (var i = 0; i < 128; i++) {
  identifierPartTable[i] =
    identifierStartTable[i] || // $, _, A-Z, a-z
    i >= 48 && i <= 57;        // 0-9
}

module.exports = {
  asciiIdentifierStartTable: identifierStartTable,
  asciiIdentifierPartTable: identifierPartTable
};

},{}],"/node_modules/jshint/lodash.js":[function(_dereq_,module,exports){
(function (global){
;(function() {

  var undefined;

  var VERSION = '3.7.0';

  var FUNC_ERROR_TEXT = 'Expected a function';

  var argsTag = '[object Arguments]',
      arrayTag = '[object Array]',
      boolTag = '[object Boolean]',
      dateTag = '[object Date]',
      errorTag = '[object Error]',
      funcTag = '[object Function]',
      mapTag = '[object Map]',
      numberTag = '[object Number]',
      objectTag = '[object Object]',
      regexpTag = '[object RegExp]',
      setTag = '[object Set]',
      stringTag = '[object String]',
      weakMapTag = '[object WeakMap]';

  var arrayBufferTag = '[object ArrayBuffer]',
      float32Tag = '[object Float32Array]',
      float64Tag = '[object Float64Array]',
      int8Tag = '[object Int8Array]',
      int16Tag = '[object Int16Array]',
      int32Tag = '[object Int32Array]',
      uint8Tag = '[object Uint8Array]',
      uint8ClampedTag = '[object Uint8ClampedArray]',
      uint16Tag = '[object Uint16Array]',
      uint32Tag = '[object Uint32Array]';

  var reIsDeepProp = /\.|\[(?:[^[\]]+|(["'])(?:(?!\1)[^\n\\]|\\.)*?)\1\]/,
      reIsPlainProp = /^\w*$/,
      rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g;

  var reRegExpChars = /[.*+?^${}()|[\]\/\\]/g,
      reHasRegExpChars = RegExp(reRegExpChars.source);

  var reEscapeChar = /\\(\\)?/g;

  var reFlags = /\w*$/;

  var reIsHostCtor = /^\[object .+?Constructor\]$/;

  var typedArrayTags = {};
  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
  typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
  typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
  typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
  typedArrayTags[uint32Tag] = true;
  typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
  typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
  typedArrayTags[dateTag] = typedArrayTags[errorTag] =
  typedArrayTags[funcTag] = typedArrayTags[mapTag] =
  typedArrayTags[numberTag] = typedArrayTags[objectTag] =
  typedArrayTags[regexpTag] = typedArrayTags[setTag] =
  typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;

  var cloneableTags = {};
  cloneableTags[argsTag] = cloneableTags[arrayTag] =
  cloneableTags[arrayBufferTag] = cloneableTags[boolTag] =
  cloneableTags[dateTag] = cloneableTags[float32Tag] =
  cloneableTags[float64Tag] = cloneableTags[int8Tag] =
  cloneableTags[int16Tag] = cloneableTags[int32Tag] =
  cloneableTags[numberTag] = cloneableTags[objectTag] =
  cloneableTags[regexpTag] = cloneableTags[stringTag] =
  cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
  cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
  cloneableTags[errorTag] = cloneableTags[funcTag] =
  cloneableTags[mapTag] = cloneableTags[setTag] =
  cloneableTags[weakMapTag] = false;

  var objectTypes = {
    'function': true,
    'object': true
  };

  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  var freeGlobal = freeExports && freeModule && typeof global == 'object' && global && global.Object && global;

  var freeSelf = objectTypes[typeof self] && self && self.Object && self;

  var freeWindow = objectTypes[typeof window] && window && window.Object && window;

  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

  var root = freeGlobal || ((freeWindow !== (this && this.window)) && freeWindow) || freeSelf || this;

  function baseFindIndex(array, predicate, fromRight) {
    var length = array.length,
        index = fromRight ? length : -1;

    while ((fromRight ? index-- : ++index < length)) {
      if (predicate(array[index], index, array)) {
        return index;
      }
    }
    return -1;
  }

  function baseIndexOf(array, value, fromIndex) {
    if (value !== value) {
      return indexOfNaN(array, fromIndex);
    }
    var index = fromIndex - 1,
        length = array.length;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }

  function baseIsFunction(value) {
    return typeof value == 'function' || false;
  }

  function baseToString(value) {
    if (typeof value == 'string') {
      return value;
    }
    return value == null ? '' : (value + '');
  }

  function indexOfNaN(array, fromIndex, fromRight) {
    var length = array.length,
        index = fromIndex + (fromRight ? 0 : -1);

    while ((fromRight ? index-- : ++index < length)) {
      var other = array[index];
      if (other !== other) {
        return index;
      }
    }
    return -1;
  }

  function isObjectLike(value) {
    return !!value && typeof value == 'object';
  }

  var arrayProto = Array.prototype,
      objectProto = Object.prototype;

  var fnToString = Function.prototype.toString;

  var hasOwnProperty = objectProto.hasOwnProperty;

  var objToString = objectProto.toString;

  var reIsNative = RegExp('^' +
    escapeRegExp(objToString)
    .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
  );

  var ArrayBuffer = isNative(ArrayBuffer = root.ArrayBuffer) && ArrayBuffer,
      bufferSlice = isNative(bufferSlice = ArrayBuffer && new ArrayBuffer(0).slice) && bufferSlice,
      floor = Math.floor,
      getOwnPropertySymbols = isNative(getOwnPropertySymbols = Object.getOwnPropertySymbols) && getOwnPropertySymbols,
      getPrototypeOf = isNative(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf,
      push = arrayProto.push,
      preventExtensions = isNative(Object.preventExtensions = Object.preventExtensions) && preventExtensions,
      propertyIsEnumerable = objectProto.propertyIsEnumerable,
      Uint8Array = isNative(Uint8Array = root.Uint8Array) && Uint8Array;

  var Float64Array = (function() {
    try {
      var func = isNative(func = root.Float64Array) && func,
          result = new func(new ArrayBuffer(10), 0, 1) && func;
    } catch(e) {}
    return result;
  }());

  var nativeAssign = (function() {
    var object = { '1': 0 },
        func = preventExtensions && isNative(func = Object.assign) && func;

    try { func(preventExtensions(object), 'xo'); } catch(e) {}
    return !object[1] && func;
  }());

  var nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray,
      nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys,
      nativeMax = Math.max,
      nativeMin = Math.min;

  var NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;

  var MAX_ARRAY_LENGTH = Math.pow(2, 32) - 1,
      MAX_ARRAY_INDEX =  MAX_ARRAY_LENGTH - 1,
      HALF_MAX_ARRAY_LENGTH = MAX_ARRAY_LENGTH >>> 1;

  var FLOAT64_BYTES_PER_ELEMENT = Float64Array ? Float64Array.BYTES_PER_ELEMENT : 0;

  var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;

  function lodash() {
  }

  var support = lodash.support = {};

  (function(x) {
    var Ctor = function() { this.x = x; },
        object = { '0': x, 'length': x },
        props = [];

    Ctor.prototype = { 'valueOf': x, 'y': x };
    for (var key in new Ctor) { props.push(key); }

    support.funcDecomp = /\bthis\b/.test(function() { return this; });

    support.funcNames = typeof Function.name == 'string';

    try {
      support.nonEnumArgs = !propertyIsEnumerable.call(arguments, 1);
    } catch(e) {
      support.nonEnumArgs = true;
    }
  }(1, 0));

  function arrayCopy(source, array) {
    var index = -1,
        length = source.length;

    array || (array = Array(length));
    while (++index < length) {
      array[index] = source[index];
    }
    return array;
  }

  function arrayEach(array, iteratee) {
    var index = -1,
        length = array.length;

    while (++index < length) {
      if (iteratee(array[index], index, array) === false) {
        break;
      }
    }
    return array;
  }

  function arrayFilter(array, predicate) {
    var index = -1,
        length = array.length,
        resIndex = -1,
        result = [];

    while (++index < length) {
      var value = array[index];
      if (predicate(value, index, array)) {
        result[++resIndex] = value;
      }
    }
    return result;
  }

  function arrayMap(array, iteratee) {
    var index = -1,
        length = array.length,
        result = Array(length);

    while (++index < length) {
      result[index] = iteratee(array[index], index, array);
    }
    return result;
  }

  function arrayMax(array) {
    var index = -1,
        length = array.length,
        result = NEGATIVE_INFINITY;

    while (++index < length) {
      var value = array[index];
      if (value > result) {
        result = value;
      }
    }
    return result;
  }

  function arraySome(array, predicate) {
    var index = -1,
        length = array.length;

    while (++index < length) {
      if (predicate(array[index], index, array)) {
        return true;
      }
    }
    return false;
  }

  function assignWith(object, source, customizer) {
    var props = keys(source);
    push.apply(props, getSymbols(source));

    var index = -1,
        length = props.length;

    while (++index < length) {
      var key = props[index],
          value = object[key],
          result = customizer(value, source[key], key, object, source);

      if ((result === result ? (result !== value) : (value === value)) ||
          (value === undefined && !(key in object))) {
        object[key] = result;
      }
    }
    return object;
  }

  var baseAssign = nativeAssign || function(object, source) {
    return source == null
      ? object
      : baseCopy(source, getSymbols(source), baseCopy(source, keys(source), object));
  };

  function baseCopy(source, props, object) {
    object || (object = {});

    var index = -1,
        length = props.length;

    while (++index < length) {
      var key = props[index];
      object[key] = source[key];
    }
    return object;
  }

  function baseCallback(func, thisArg, argCount) {
    var type = typeof func;
    if (type == 'function') {
      return thisArg === undefined
        ? func
        : bindCallback(func, thisArg, argCount);
    }
    if (func == null) {
      return identity;
    }
    if (type == 'object') {
      return baseMatches(func);
    }
    return thisArg === undefined
      ? property(func)
      : baseMatchesProperty(func, thisArg);
  }

  function baseClone(value, isDeep, customizer, key, object, stackA, stackB) {
    var result;
    if (customizer) {
      result = object ? customizer(value, key, object) : customizer(value);
    }
    if (result !== undefined) {
      return result;
    }
    if (!isObject(value)) {
      return value;
    }
    var isArr = isArray(value);
    if (isArr) {
      result = initCloneArray(value);
      if (!isDeep) {
        return arrayCopy(value, result);
      }
    } else {
      var tag = objToString.call(value),
          isFunc = tag == funcTag;

      if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
        result = initCloneObject(isFunc ? {} : value);
        if (!isDeep) {
          return baseAssign(result, value);
        }
      } else {
        return cloneableTags[tag]
          ? initCloneByTag(value, tag, isDeep)
          : (object ? value : {});
      }
    }
    stackA || (stackA = []);
    stackB || (stackB = []);

    var length = stackA.length;
    while (length--) {
      if (stackA[length] == value) {
        return stackB[length];
      }
    }
    stackA.push(value);
    stackB.push(result);

    (isArr ? arrayEach : baseForOwn)(value, function(subValue, key) {
      result[key] = baseClone(subValue, isDeep, customizer, key, value, stackA, stackB);
    });
    return result;
  }

  var baseEach = createBaseEach(baseForOwn);

  function baseFilter(collection, predicate) {
    var result = [];
    baseEach(collection, function(value, index, collection) {
      if (predicate(value, index, collection)) {
        result.push(value);
      }
    });
    return result;
  }

  var baseFor = createBaseFor();

  function baseForIn(object, iteratee) {
    return baseFor(object, iteratee, keysIn);
  }

  function baseForOwn(object, iteratee) {
    return baseFor(object, iteratee, keys);
  }

  function baseGet(object, path, pathKey) {
    if (object == null) {
      return;
    }
    if (pathKey !== undefined && pathKey in toObject(object)) {
      path = [pathKey];
    }
    var index = -1,
        length = path.length;

    while (object != null && ++index < length) {
      var result = object = object[path[index]];
    }
    return result;
  }

  function baseIsEqual(value, other, customizer, isLoose, stackA, stackB) {
    if (value === other) {
      return value !== 0 || (1 / value == 1 / other);
    }
    var valType = typeof value,
        othType = typeof other;

    if ((valType != 'function' && valType != 'object' && othType != 'function' && othType != 'object') ||
        value == null || other == null) {
      return value !== value && other !== other;
    }
    return baseIsEqualDeep(value, other, baseIsEqual, customizer, isLoose, stackA, stackB);
  }

  function baseIsEqualDeep(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
    var objIsArr = isArray(object),
        othIsArr = isArray(other),
        objTag = arrayTag,
        othTag = arrayTag;

    if (!objIsArr) {
      objTag = objToString.call(object);
      if (objTag == argsTag) {
        objTag = objectTag;
      } else if (objTag != objectTag) {
        objIsArr = isTypedArray(object);
      }
    }
    if (!othIsArr) {
      othTag = objToString.call(other);
      if (othTag == argsTag) {
        othTag = objectTag;
      } else if (othTag != objectTag) {
        othIsArr = isTypedArray(other);
      }
    }
    var objIsObj = objTag == objectTag,
        othIsObj = othTag == objectTag,
        isSameTag = objTag == othTag;

    if (isSameTag && !(objIsArr || objIsObj)) {
      return equalByTag(object, other, objTag);
    }
    if (!isLoose) {
      var valWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
          othWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

      if (valWrapped || othWrapped) {
        return equalFunc(valWrapped ? object.value() : object, othWrapped ? other.value() : other, customizer, isLoose, stackA, stackB);
      }
    }
    if (!isSameTag) {
      return false;
    }
    stackA || (stackA = []);
    stackB || (stackB = []);

    var length = stackA.length;
    while (length--) {
      if (stackA[length] == object) {
        return stackB[length] == other;
      }
    }
    stackA.push(object);
    stackB.push(other);

    var result = (objIsArr ? equalArrays : equalObjects)(object, other, equalFunc, customizer, isLoose, stackA, stackB);

    stackA.pop();
    stackB.pop();

    return result;
  }

  function baseIsMatch(object, props, values, strictCompareFlags, customizer) {
    var index = -1,
        length = props.length,
        noCustomizer = !customizer;

    while (++index < length) {
      if ((noCustomizer && strictCompareFlags[index])
            ? values[index] !== object[props[index]]
            : !(props[index] in object)
          ) {
        return false;
      }
    }
    index = -1;
    while (++index < length) {
      var key = props[index],
          objValue = object[key],
          srcValue = values[index];

      if (noCustomizer && strictCompareFlags[index]) {
        var result = objValue !== undefined || (key in object);
      } else {
        result = customizer ? customizer(objValue, srcValue, key) : undefined;
        if (result === undefined) {
          result = baseIsEqual(srcValue, objValue, customizer, true);
        }
      }
      if (!result) {
        return false;
      }
    }
    return true;
  }

  function baseMatches(source) {
    var props = keys(source),
        length = props.length;

    if (!length) {
      return constant(true);
    }
    if (length == 1) {
      var key = props[0],
          value = source[key];

      if (isStrictComparable(value)) {
        return function(object) {
          if (object == null) {
            return false;
          }
          return object[key] === value && (value !== undefined || (key in toObject(object)));
        };
      }
    }
    var values = Array(length),
        strictCompareFlags = Array(length);

    while (length--) {
      value = source[props[length]];
      values[length] = value;
      strictCompareFlags[length] = isStrictComparable(value);
    }
    return function(object) {
      return object != null && baseIsMatch(toObject(object), props, values, strictCompareFlags);
    };
  }

  function baseMatchesProperty(path, value) {
    var isArr = isArray(path),
        isCommon = isKey(path) && isStrictComparable(value),
        pathKey = (path + '');

    path = toPath(path);
    return function(object) {
      if (object == null) {
        return false;
      }
      var key = pathKey;
      object = toObject(object);
      if ((isArr || !isCommon) && !(key in object)) {
        object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
        if (object == null) {
          return false;
        }
        key = last(path);
        object = toObject(object);
      }
      return object[key] === value
        ? (value !== undefined || (key in object))
        : baseIsEqual(value, object[key], null, true);
    };
  }

  function baseMerge(object, source, customizer, stackA, stackB) {
    if (!isObject(object)) {
      return object;
    }
    var isSrcArr = isLength(source.length) && (isArray(source) || isTypedArray(source));
    if (!isSrcArr) {
      var props = keys(source);
      push.apply(props, getSymbols(source));
    }
    arrayEach(props || source, function(srcValue, key) {
      if (props) {
        key = srcValue;
        srcValue = source[key];
      }
      if (isObjectLike(srcValue)) {
        stackA || (stackA = []);
        stackB || (stackB = []);
        baseMergeDeep(object, source, key, baseMerge, customizer, stackA, stackB);
      }
      else {
        var value = object[key],
            result = customizer ? customizer(value, srcValue, key, object, source) : undefined,
            isCommon = result === undefined;

        if (isCommon) {
          result = srcValue;
        }
        if ((isSrcArr || result !== undefined) &&
            (isCommon || (result === result ? (result !== value) : (value === value)))) {
          object[key] = result;
        }
      }
    });
    return object;
  }

  function baseMergeDeep(object, source, key, mergeFunc, customizer, stackA, stackB) {
    var length = stackA.length,
        srcValue = source[key];

    while (length--) {
      if (stackA[length] == srcValue) {
        object[key] = stackB[length];
        return;
      }
    }
    var value = object[key],
        result = customizer ? customizer(value, srcValue, key, object, source) : undefined,
        isCommon = result === undefined;

    if (isCommon) {
      result = srcValue;
      if (isLength(srcValue.length) && (isArray(srcValue) || isTypedArray(srcValue))) {
        result = isArray(value)
          ? value
          : (getLength(value) ? arrayCopy(value) : []);
      }
      else if (isPlainObject(srcValue) || isArguments(srcValue)) {
        result = isArguments(value)
          ? toPlainObject(value)
          : (isPlainObject(value) ? value : {});
      }
      else {
        isCommon = false;
      }
    }
    stackA.push(srcValue);
    stackB.push(result);

    if (isCommon) {
      object[key] = mergeFunc(result, srcValue, customizer, stackA, stackB);
    } else if (result === result ? (result !== value) : (value === value)) {
      object[key] = result;
    }
  }

  function baseProperty(key) {
    return function(object) {
      return object == null ? undefined : object[key];
    };
  }

  function basePropertyDeep(path) {
    var pathKey = (path + '');
    path = toPath(path);
    return function(object) {
      return baseGet(object, path, pathKey);
    };
  }

  function baseSlice(array, start, end) {
    var index = -1,
        length = array.length;

    start = start == null ? 0 : (+start || 0);
    if (start < 0) {
      start = -start > length ? 0 : (length + start);
    }
    end = (end === undefined || end > length) ? length : (+end || 0);
    if (end < 0) {
      end += length;
    }
    length = start > end ? 0 : ((end - start) >>> 0);
    start >>>= 0;

    var result = Array(length);
    while (++index < length) {
      result[index] = array[index + start];
    }
    return result;
  }

  function baseSome(collection, predicate) {
    var result;

    baseEach(collection, function(value, index, collection) {
      result = predicate(value, index, collection);
      return !result;
    });
    return !!result;
  }

  function baseValues(object, props) {
    var index = -1,
        length = props.length,
        result = Array(length);

    while (++index < length) {
      result[index] = object[props[index]];
    }
    return result;
  }

  function binaryIndex(array, value, retHighest) {
    var low = 0,
        high = array ? array.length : low;

    if (typeof value == 'number' && value === value && high <= HALF_MAX_ARRAY_LENGTH) {
      while (low < high) {
        var mid = (low + high) >>> 1,
            computed = array[mid];

        if (retHighest ? (computed <= value) : (computed < value)) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }
      return high;
    }
    return binaryIndexBy(array, value, identity, retHighest);
  }

  function binaryIndexBy(array, value, iteratee, retHighest) {
    value = iteratee(value);

    var low = 0,
        high = array ? array.length : 0,
        valIsNaN = value !== value,
        valIsUndef = value === undefined;

    while (low < high) {
      var mid = floor((low + high) / 2),
          computed = iteratee(array[mid]),
          isReflexive = computed === computed;

      if (valIsNaN) {
        var setLow = isReflexive || retHighest;
      } else if (valIsUndef) {
        setLow = isReflexive && (retHighest || computed !== undefined);
      } else {
        setLow = retHighest ? (computed <= value) : (computed < value);
      }
      if (setLow) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return nativeMin(high, MAX_ARRAY_INDEX);
  }

  function bindCallback(func, thisArg, argCount) {
    if (typeof func != 'function') {
      return identity;
    }
    if (thisArg === undefined) {
      return func;
    }
    switch (argCount) {
      case 1: return function(value) {
        return func.call(thisArg, value);
      };
      case 3: return function(value, index, collection) {
        return func.call(thisArg, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(thisArg, accumulator, value, index, collection);
      };
      case 5: return function(value, other, key, object, source) {
        return func.call(thisArg, value, other, key, object, source);
      };
    }
    return function() {
      return func.apply(thisArg, arguments);
    };
  }

  function bufferClone(buffer) {
    return bufferSlice.call(buffer, 0);
  }
  if (!bufferSlice) {
    bufferClone = !(ArrayBuffer && Uint8Array) ? constant(null) : function(buffer) {
      var byteLength = buffer.byteLength,
          floatLength = Float64Array ? floor(byteLength / FLOAT64_BYTES_PER_ELEMENT) : 0,
          offset = floatLength * FLOAT64_BYTES_PER_ELEMENT,
          result = new ArrayBuffer(byteLength);

      if (floatLength) {
        var view = new Float64Array(result, 0, floatLength);
        view.set(new Float64Array(buffer, 0, floatLength));
      }
      if (byteLength != offset) {
        view = new Uint8Array(result, offset);
        view.set(new Uint8Array(buffer, offset));
      }
      return result;
    };
  }

  function createAssigner(assigner) {
    return restParam(function(object, sources) {
      var index = -1,
          length = object == null ? 0 : sources.length,
          customizer = length > 2 && sources[length - 2],
          guard = length > 2 && sources[2],
          thisArg = length > 1 && sources[length - 1];

      if (typeof customizer == 'function') {
        customizer = bindCallback(customizer, thisArg, 5);
        length -= 2;
      } else {
        customizer = typeof thisArg == 'function' ? thisArg : null;
        length -= (customizer ? 1 : 0);
      }
      if (guard && isIterateeCall(sources[0], sources[1], guard)) {
        customizer = length < 3 ? null : customizer;
        length = 1;
      }
      while (++index < length) {
        var source = sources[index];
        if (source) {
          assigner(object, source, customizer);
        }
      }
      return object;
    });
  }

  function createBaseEach(eachFunc, fromRight) {
    return function(collection, iteratee) {
      var length = collection ? getLength(collection) : 0;
      if (!isLength(length)) {
        return eachFunc(collection, iteratee);
      }
      var index = fromRight ? length : -1,
          iterable = toObject(collection);

      while ((fromRight ? index-- : ++index < length)) {
        if (iteratee(iterable[index], index, iterable) === false) {
          break;
        }
      }
      return collection;
    };
  }

  function createBaseFor(fromRight) {
    return function(object, iteratee, keysFunc) {
      var iterable = toObject(object),
          props = keysFunc(object),
          length = props.length,
          index = fromRight ? length : -1;

      while ((fromRight ? index-- : ++index < length)) {
        var key = props[index];
        if (iteratee(iterable[key], key, iterable) === false) {
          break;
        }
      }
      return object;
    };
  }

  function createFindIndex(fromRight) {
    return function(array, predicate, thisArg) {
      if (!(array && array.length)) {
        return -1;
      }
      predicate = getCallback(predicate, thisArg, 3);
      return baseFindIndex(array, predicate, fromRight);
    };
  }

  function createForEach(arrayFunc, eachFunc) {
    return function(collection, iteratee, thisArg) {
      return (typeof iteratee == 'function' && thisArg === undefined && isArray(collection))
        ? arrayFunc(collection, iteratee)
        : eachFunc(collection, bindCallback(iteratee, thisArg, 3));
    };
  }

  function equalArrays(array, other, equalFunc, customizer, isLoose, stackA, stackB) {
    var index = -1,
        arrLength = array.length,
        othLength = other.length,
        result = true;

    if (arrLength != othLength && !(isLoose && othLength > arrLength)) {
      return false;
    }
    while (result && ++index < arrLength) {
      var arrValue = array[index],
          othValue = other[index];

      result = undefined;
      if (customizer) {
        result = isLoose
          ? customizer(othValue, arrValue, index)
          : customizer(arrValue, othValue, index);
      }
      if (result === undefined) {
        if (isLoose) {
          var othIndex = othLength;
          while (othIndex--) {
            othValue = other[othIndex];
            result = (arrValue && arrValue === othValue) || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB);
            if (result) {
              break;
            }
          }
        } else {
          result = (arrValue && arrValue === othValue) || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB);
        }
      }
    }
    return !!result;
  }

  function equalByTag(object, other, tag) {
    switch (tag) {
      case boolTag:
      case dateTag:
        return +object == +other;

      case errorTag:
        return object.name == other.name && object.message == other.message;

      case numberTag:
        return (object != +object)
          ? other != +other
          : (object == 0 ? ((1 / object) == (1 / other)) : object == +other);

      case regexpTag:
      case stringTag:
        return object == (other + '');
    }
    return false;
  }

  function equalObjects(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
    var objProps = keys(object),
        objLength = objProps.length,
        othProps = keys(other),
        othLength = othProps.length;

    if (objLength != othLength && !isLoose) {
      return false;
    }
    var skipCtor = isLoose,
        index = -1;

    while (++index < objLength) {
      var key = objProps[index],
          result = isLoose ? key in other : hasOwnProperty.call(other, key);

      if (result) {
        var objValue = object[key],
            othValue = other[key];

        result = undefined;
        if (customizer) {
          result = isLoose
            ? customizer(othValue, objValue, key)
            : customizer(objValue, othValue, key);
        }
        if (result === undefined) {
          result = (objValue && objValue === othValue) || equalFunc(objValue, othValue, customizer, isLoose, stackA, stackB);
        }
      }
      if (!result) {
        return false;
      }
      skipCtor || (skipCtor = key == 'constructor');
    }
    if (!skipCtor) {
      var objCtor = object.constructor,
          othCtor = other.constructor;

      if (objCtor != othCtor &&
          ('constructor' in object && 'constructor' in other) &&
          !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
            typeof othCtor == 'function' && othCtor instanceof othCtor)) {
        return false;
      }
    }
    return true;
  }

  function getCallback(func, thisArg, argCount) {
    var result = lodash.callback || callback;
    result = result === callback ? baseCallback : result;
    return argCount ? result(func, thisArg, argCount) : result;
  }

  function getIndexOf(collection, target, fromIndex) {
    var result = lodash.indexOf || indexOf;
    result = result === indexOf ? baseIndexOf : result;
    return collection ? result(collection, target, fromIndex) : result;
  }

  var getLength = baseProperty('length');

  var getSymbols = !getOwnPropertySymbols ? constant([]) : function(object) {
    return getOwnPropertySymbols(toObject(object));
  };

  function initCloneArray(array) {
    var length = array.length,
        result = new array.constructor(length);

    if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
      result.index = array.index;
      result.input = array.input;
    }
    return result;
  }

  function initCloneObject(object) {
    var Ctor = object.constructor;
    if (!(typeof Ctor == 'function' && Ctor instanceof Ctor)) {
      Ctor = Object;
    }
    return new Ctor;
  }

  function initCloneByTag(object, tag, isDeep) {
    var Ctor = object.constructor;
    switch (tag) {
      case arrayBufferTag:
        return bufferClone(object);

      case boolTag:
      case dateTag:
        return new Ctor(+object);

      case float32Tag: case float64Tag:
      case int8Tag: case int16Tag: case int32Tag:
      case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
        var buffer = object.buffer;
        return new Ctor(isDeep ? bufferClone(buffer) : buffer, object.byteOffset, object.length);

      case numberTag:
      case stringTag:
        return new Ctor(object);

      case regexpTag:
        var result = new Ctor(object.source, reFlags.exec(object));
        result.lastIndex = object.lastIndex;
    }
    return result;
  }

  function isIndex(value, length) {
    value = +value;
    length = length == null ? MAX_SAFE_INTEGER : length;
    return value > -1 && value % 1 == 0 && value < length;
  }

  function isIterateeCall(value, index, object) {
    if (!isObject(object)) {
      return false;
    }
    var type = typeof index;
    if (type == 'number') {
      var length = getLength(object),
          prereq = isLength(length) && isIndex(index, length);
    } else {
      prereq = type == 'string' && index in object;
    }
    if (prereq) {
      var other = object[index];
      return value === value ? (value === other) : (other !== other);
    }
    return false;
  }

  function isKey(value, object) {
    var type = typeof value;
    if ((type == 'string' && reIsPlainProp.test(value)) || type == 'number') {
      return true;
    }
    if (isArray(value)) {
      return false;
    }
    var result = !reIsDeepProp.test(value);
    return result || (object != null && value in toObject(object));
  }

  function isLength(value) {
    return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
  }

  function isStrictComparable(value) {
    return value === value && (value === 0 ? ((1 / value) > 0) : !isObject(value));
  }

  function shimIsPlainObject(value) {
    var Ctor,
        support = lodash.support;

    if (!(isObjectLike(value) && objToString.call(value) == objectTag) ||
        (!hasOwnProperty.call(value, 'constructor') &&
          (Ctor = value.constructor, typeof Ctor == 'function' && !(Ctor instanceof Ctor)))) {
      return false;
    }
    var result;
    baseForIn(value, function(subValue, key) {
      result = key;
    });
    return result === undefined || hasOwnProperty.call(value, result);
  }

  function shimKeys(object) {
    var props = keysIn(object),
        propsLength = props.length,
        length = propsLength && object.length,
        support = lodash.support;

    var allowIndexes = length && isLength(length) &&
      (isArray(object) || (support.nonEnumArgs && isArguments(object)));

    var index = -1,
        result = [];

    while (++index < propsLength) {
      var key = props[index];
      if ((allowIndexes && isIndex(key, length)) || hasOwnProperty.call(object, key)) {
        result.push(key);
      }
    }
    return result;
  }

  function toObject(value) {
    return isObject(value) ? value : Object(value);
  }

  function toPath(value) {
    if (isArray(value)) {
      return value;
    }
    var result = [];
    baseToString(value).replace(rePropName, function(match, number, quote, string) {
      result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
    });
    return result;
  }

  var findLastIndex = createFindIndex(true);

  function indexOf(array, value, fromIndex) {
    var length = array ? array.length : 0;
    if (!length) {
      return -1;
    }
    if (typeof fromIndex == 'number') {
      fromIndex = fromIndex < 0 ? nativeMax(length + fromIndex, 0) : fromIndex;
    } else if (fromIndex) {
      var index = binaryIndex(array, value),
          other = array[index];

      if (value === value ? (value === other) : (other !== other)) {
        return index;
      }
      return -1;
    }
    return baseIndexOf(array, value, fromIndex || 0);
  }

  function last(array) {
    var length = array ? array.length : 0;
    return length ? array[length - 1] : undefined;
  }

  function slice(array, start, end) {
    var length = array ? array.length : 0;
    if (!length) {
      return [];
    }
    if (end && typeof end != 'number' && isIterateeCall(array, start, end)) {
      start = 0;
      end = length;
    }
    return baseSlice(array, start, end);
  }

  function unzip(array) {
    var index = -1,
        length = (array && array.length && arrayMax(arrayMap(array, getLength))) >>> 0,
        result = Array(length);

    while (++index < length) {
      result[index] = arrayMap(array, baseProperty(index));
    }
    return result;
  }

  var zip = restParam(unzip);

  var forEach = createForEach(arrayEach, baseEach);

  function includes(collection, target, fromIndex, guard) {
    var length = collection ? getLength(collection) : 0;
    if (!isLength(length)) {
      collection = values(collection);
      length = collection.length;
    }
    if (!length) {
      return false;
    }
    if (typeof fromIndex != 'number' || (guard && isIterateeCall(target, fromIndex, guard))) {
      fromIndex = 0;
    } else {
      fromIndex = fromIndex < 0 ? nativeMax(length + fromIndex, 0) : (fromIndex || 0);
    }
    return (typeof collection == 'string' || !isArray(collection) && isString(collection))
      ? (fromIndex < length && collection.indexOf(target, fromIndex) > -1)
      : (getIndexOf(collection, target, fromIndex) > -1);
  }

  function reject(collection, predicate, thisArg) {
    var func = isArray(collection) ? arrayFilter : baseFilter;
    predicate = getCallback(predicate, thisArg, 3);
    return func(collection, function(value, index, collection) {
      return !predicate(value, index, collection);
    });
  }

  function some(collection, predicate, thisArg) {
    var func = isArray(collection) ? arraySome : baseSome;
    if (thisArg && isIterateeCall(collection, predicate, thisArg)) {
      predicate = null;
    }
    if (typeof predicate != 'function' || thisArg !== undefined) {
      predicate = getCallback(predicate, thisArg, 3);
    }
    return func(collection, predicate);
  }

  function restParam(func, start) {
    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    start = nativeMax(start === undefined ? (func.length - 1) : (+start || 0), 0);
    return function() {
      var args = arguments,
          index = -1,
          length = nativeMax(args.length - start, 0),
          rest = Array(length);

      while (++index < length) {
        rest[index] = args[start + index];
      }
      switch (start) {
        case 0: return func.call(this, rest);
        case 1: return func.call(this, args[0], rest);
        case 2: return func.call(this, args[0], args[1], rest);
      }
      var otherArgs = Array(start + 1);
      index = -1;
      while (++index < start) {
        otherArgs[index] = args[index];
      }
      otherArgs[start] = rest;
      return func.apply(this, otherArgs);
    };
  }

  function clone(value, isDeep, customizer, thisArg) {
    if (isDeep && typeof isDeep != 'boolean' && isIterateeCall(value, isDeep, customizer)) {
      isDeep = false;
    }
    else if (typeof isDeep == 'function') {
      thisArg = customizer;
      customizer = isDeep;
      isDeep = false;
    }
    customizer = typeof customizer == 'function' && bindCallback(customizer, thisArg, 1);
    return baseClone(value, isDeep, customizer);
  }

  function isArguments(value) {
    var length = isObjectLike(value) ? value.length : undefined;
    return isLength(length) && objToString.call(value) == argsTag;
  }

  var isArray = nativeIsArray || function(value) {
    return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
  };

  function isEmpty(value) {
    if (value == null) {
      return true;
    }
    var length = getLength(value);
    if (isLength(length) && (isArray(value) || isString(value) || isArguments(value) ||
        (isObjectLike(value) && isFunction(value.splice)))) {
      return !length;
    }
    return !keys(value).length;
  }

  var isFunction = !(baseIsFunction(/x/) || (Uint8Array && !baseIsFunction(Uint8Array))) ? baseIsFunction : function(value) {
    return objToString.call(value) == funcTag;
  };

  function isObject(value) {
    var type = typeof value;
    return type == 'function' || (!!value && type == 'object');
  }

  function isNative(value) {
    if (value == null) {
      return false;
    }
    if (objToString.call(value) == funcTag) {
      return reIsNative.test(fnToString.call(value));
    }
    return isObjectLike(value) && reIsHostCtor.test(value);
  }

  function isNumber(value) {
    return typeof value == 'number' || (isObjectLike(value) && objToString.call(value) == numberTag);
  }

  var isPlainObject = !getPrototypeOf ? shimIsPlainObject : function(value) {
    if (!(value && objToString.call(value) == objectTag)) {
      return false;
    }
    var valueOf = value.valueOf,
        objProto = isNative(valueOf) && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);

    return objProto
      ? (value == objProto || getPrototypeOf(value) == objProto)
      : shimIsPlainObject(value);
  };

  function isString(value) {
    return typeof value == 'string' || (isObjectLike(value) && objToString.call(value) == stringTag);
  }

  function isTypedArray(value) {
    return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[objToString.call(value)];
  }

  function toPlainObject(value) {
    return baseCopy(value, keysIn(value));
  }

  var assign = createAssigner(function(object, source, customizer) {
    return customizer
      ? assignWith(object, source, customizer)
      : baseAssign(object, source);
  });

  function has(object, path) {
    if (object == null) {
      return false;
    }
    var result = hasOwnProperty.call(object, path);
    if (!result && !isKey(path)) {
      path = toPath(path);
      object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
      path = last(path);
      result = object != null && hasOwnProperty.call(object, path);
    }
    return result;
  }

  var keys = !nativeKeys ? shimKeys : function(object) {
    if (object) {
      var Ctor = object.constructor,
          length = object.length;
    }
    if ((typeof Ctor == 'function' && Ctor.prototype === object) ||
        (typeof object != 'function' && isLength(length))) {
      return shimKeys(object);
    }
    return isObject(object) ? nativeKeys(object) : [];
  };

  function keysIn(object) {
    if (object == null) {
      return [];
    }
    if (!isObject(object)) {
      object = Object(object);
    }
    var length = object.length;
    length = (length && isLength(length) &&
      (isArray(object) || (support.nonEnumArgs && isArguments(object))) && length) || 0;

    var Ctor = object.constructor,
        index = -1,
        isProto = typeof Ctor == 'function' && Ctor.prototype === object,
        result = Array(length),
        skipIndexes = length > 0;

    while (++index < length) {
      result[index] = (index + '');
    }
    for (var key in object) {
      if (!(skipIndexes && isIndex(key, length)) &&
          !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
        result.push(key);
      }
    }
    return result;
  }

  var merge = createAssigner(baseMerge);

  function values(object) {
    return baseValues(object, keys(object));
  }

  function escapeRegExp(string) {
    string = baseToString(string);
    return (string && reHasRegExpChars.test(string))
      ? string.replace(reRegExpChars, '\\$&')
      : string;
  }

  function callback(func, thisArg, guard) {
    if (guard && isIterateeCall(func, thisArg, guard)) {
      thisArg = null;
    }
    return baseCallback(func, thisArg);
  }

  function constant(value) {
    return function() {
      return value;
    };
  }

  function identity(value) {
    return value;
  }

  function property(path) {
    return isKey(path) ? baseProperty(path) : basePropertyDeep(path);
  }
  lodash.assign = assign;
  lodash.callback = callback;
  lodash.constant = constant;
  lodash.forEach = forEach;
  lodash.keys = keys;
  lodash.keysIn = keysIn;
  lodash.merge = merge;
  lodash.property = property;
  lodash.reject = reject;
  lodash.restParam = restParam;
  lodash.slice = slice;
  lodash.toPlainObject = toPlainObject;
  lodash.unzip = unzip;
  lodash.values = values;
  lodash.zip = zip;

  lodash.each = forEach;
  lodash.extend = assign;
  lodash.iteratee = callback;
  lodash.clone = clone;
  lodash.escapeRegExp = escapeRegExp;
  lodash.findLastIndex = findLastIndex;
  lodash.has = has;
  lodash.identity = identity;
  lodash.includes = includes;
  lodash.indexOf = indexOf;
  lodash.isArguments = isArguments;
  lodash.isArray = isArray;
  lodash.isEmpty = isEmpty;
  lodash.isFunction = isFunction;
  lodash.isNative = isNative;
  lodash.isNumber = isNumber;
  lodash.isObject = isObject;
  lodash.isPlainObject = isPlainObject;
  lodash.isString = isString;
  lodash.isTypedArray = isTypedArray;
  lodash.last = last;
  lodash.some = some;

  lodash.any = some;
  lodash.contains = includes;
  lodash.include = includes;

  lodash.VERSION = VERSION;
  if (freeExports && freeModule) {
    if (moduleExports) {
      (freeModule.exports = lodash)._ = lodash;
    }
    else {
      freeExports._ = lodash;
    }
  }
  else {
    root._ = lodash;
  }
}.call(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"/node_modules/jshint/src/jshint.js":[function(_dereq_,module,exports){

var _            = _dereq_("../lodash");
var events       = _dereq_("events");
var vars         = _dereq_("./vars.js");
var messages     = _dereq_("./messages.js");
var Lexer        = _dereq_("./lex.js").Lexer;
var reg          = _dereq_("./reg.js");
var state        = _dereq_("./state.js").state;
var style        = _dereq_("./style.js");
var options      = _dereq_("./options.js");
var scopeManager = _dereq_("./scope-manager.js");

var JSHINT = (function() {
  "use strict";

  var api, // Extension API
    bang = {
      "<"  : true,
      "<=" : true,
      "==" : true,
      "===": true,
      "!==": true,
      "!=" : true,
      ">"  : true,
      ">=" : true,
      "+"  : true,
      "-"  : true,
      "*"  : true,
      "/"  : true,
      "%"  : true
    },

    declared, // Globals that were declared using /*global ... */ syntax.

    functionicity = [
      "closure", "exception", "global", "label",
      "outer", "unused", "var"
    ],

    functions, // All of the functions

    inblock,
    indent,
    lookahead,
    lex,
    member,
    membersOnly,
    predefined,    // Global variables defined by option

    stack,
    urls,

    extraModules = [],
    emitter = new events.EventEmitter();

  function checkOption(name, t) {
    name = name.trim();

    if (/^[+-]W\d{3}$/g.test(name)) {
      return true;
    }

    if (options.validNames.indexOf(name) === -1) {
      if (t.type !== "jslint" && !_.has(options.removed, name)) {
        error("E001", t, name);
        return false;
      }
    }

    return true;
  }

  function isString(obj) {
    return Object.prototype.toString.call(obj) === "[object String]";
  }

  function isIdentifier(tkn, value) {
    if (!tkn)
      return false;

    if (!tkn.identifier || tkn.value !== value)
      return false;

    return true;
  }

  function isReserved(token) {
    if (!token.reserved) {
      return false;
    }
    var meta = token.meta;

    if (meta && meta.isFutureReservedWord && state.inES5()) {
      if (!meta.es5) {
        return false;
      }
      if (meta.strictOnly) {
        if (!state.option.strict && !state.isStrict()) {
          return false;
        }
      }

      if (token.isProperty) {
        return false;
      }
    }

    return true;
  }

  function supplant(str, data) {
    return str.replace(/\{([^{}]*)\}/g, function(a, b) {
      var r = data[b];
      return typeof r === "string" || typeof r === "number" ? r : a;
    });
  }

  function combine(dest, src) {
    Object.keys(src).forEach(function(name) {
      if (_.has(JSHINT.blacklist, name)) return;
      dest[name] = src[name];
    });
  }

  function processenforceall() {
    if (state.option.enforceall) {
      for (var enforceopt in options.bool.enforcing) {
        if (state.option[enforceopt] === undefined &&
            !options.noenforceall[enforceopt]) {
          state.option[enforceopt] = true;
        }
      }
      for (var relaxopt in options.bool.relaxing) {
        if (state.option[relaxopt] === undefined) {
          state.option[relaxopt] = false;
        }
      }
    }
  }

  function assume() {
    processenforceall();
    if (!state.option.esversion && !state.option.moz) {
      if (state.option.es3) {
        state.option.esversion = 3;
      } else if (state.option.esnext) {
        state.option.esversion = 6;
      } else {
        state.option.esversion = 5;
      }
    }

    if (state.inES5()) {
      combine(predefined, vars.ecmaIdentifiers[5]);
    }

    if (state.inES6()) {
      combine(predefined, vars.ecmaIdentifiers[6]);
    }

    if (state.option.module) {
      if (state.option.strict === true) {
        state.option.strict = "global";
      }
      if (!state.inES6()) {
        warning("W134", state.tokens.next, "module", 6);
      }
    }

    if (state.option.couch) {
      combine(predefined, vars.couch);
    }

    if (state.option.qunit) {
      combine(predefined, vars.qunit);
    }

    if (state.option.rhino) {
      combine(predefined, vars.rhino);
    }

    if (state.option.shelljs) {
      combine(predefined, vars.shelljs);
      combine(predefined, vars.node);
    }
    if (state.option.typed) {
      combine(predefined, vars.typed);
    }

    if (state.option.phantom) {
      combine(predefined, vars.phantom);
      if (state.option.strict === true) {
        state.option.strict = "global";
      }
    }

    if (state.option.prototypejs) {
      combine(predefined, vars.prototypejs);
    }

    if (state.option.node) {
      combine(predefined, vars.node);
      combine(predefined, vars.typed);
      if (state.option.strict === true) {
        state.option.strict = "global";
      }
    }

    if (state.option.devel) {
      combine(predefined, vars.devel);
    }

    if (state.option.dojo) {
      combine(predefined, vars.dojo);
    }

    if (state.option.browser) {
      combine(predefined, vars.browser);
      combine(predefined, vars.typed);
    }

    if (state.option.browserify) {
      combine(predefined, vars.browser);
      combine(predefined, vars.typed);
      combine(predefined, vars.browserify);
      if (state.option.strict === true) {
        state.option.strict = "global";
      }
    }

    if (state.option.nonstandard) {
      combine(predefined, vars.nonstandard);
    }

    if (state.option.jasmine) {
      combine(predefined, vars.jasmine);
    }

    if (state.option.jquery) {
      combine(predefined, vars.jquery);
    }

    if (state.option.mootools) {
      combine(predefined, vars.mootools);
    }

    if (state.option.worker) {
      combine(predefined, vars.worker);
    }

    if (state.option.wsh) {
      combine(predefined, vars.wsh);
    }

    if (state.option.globalstrict && state.option.strict !== false) {
      state.option.strict = "global";
    }

    if (state.option.yui) {
      combine(predefined, vars.yui);
    }

    if (state.option.mocha) {
      combine(predefined, vars.mocha);
    }
  }
  function quit(code, line, chr) {
    var percentage = Math.floor((line / state.lines.length) * 100);
    var message = messages.errors[code].desc;

    throw {
      name: "JSHintError",
      line: line,
      character: chr,
      message: message + " (" + percentage + "% scanned).",
      raw: message,
      code: code
    };
  }

  function removeIgnoredMessages() {
    var ignored = state.ignoredLines;

    if (_.isEmpty(ignored)) return;
    JSHINT.errors = _.reject(JSHINT.errors, function(err) { return ignored[err.line] });
  }

  function warning(code, t, a, b, c, d) {
    var ch, l, w, msg;

    if (/^W\d{3}$/.test(code)) {
      if (state.ignored[code])
        return;

      msg = messages.warnings[code];
    } else if (/E\d{3}/.test(code)) {
      msg = messages.errors[code];
    } else if (/I\d{3}/.test(code)) {
      msg = messages.info[code];
    }

    t = t || state.tokens.next || {};
    if (t.id === "(end)") {  // `~
      t = state.tokens.curr;
    }

    l = t.line || 0;
    ch = t.from || 0;

    w = {
      id: "(error)",
      raw: msg.desc,
      code: msg.code,
      evidence: state.lines[l - 1] || "",
      line: l,
      character: ch,
      scope: JSHINT.scope,
      a: a,
      b: b,
      c: c,
      d: d
    };

    w.reason = supplant(msg.desc, w);
    JSHINT.errors.push(w);

    removeIgnoredMessages();

    if (JSHINT.errors.length >= state.option.maxerr)
      quit("E043", l, ch);

    return w;
  }

  function warningAt(m, l, ch, a, b, c, d) {
    return warning(m, {
      line: l,
      from: ch
    }, a, b, c, d);
  }

  function error(m, t, a, b, c, d) {
    warning(m, t, a, b, c, d);
  }

  function errorAt(m, l, ch, a, b, c, d) {
    return error(m, {
      line: l,
      from: ch
    }, a, b, c, d);
  }
  function addInternalSrc(elem, src) {
    var i;
    i = {
      id: "(internal)",
      elem: elem,
      value: src
    };
    JSHINT.internals.push(i);
    return i;
  }

  function doOption() {
    var nt = state.tokens.next;
    var body = nt.body.match(/(-\s+)?[^\s,:]+(?:\s*:\s*(-\s+)?[^\s,]+)?/g) || [];

    var predef = {};
    if (nt.type === "globals") {
      body.forEach(function(g, idx) {
        g = g.split(":");
        var key = (g[0] || "").trim();
        var val = (g[1] || "").trim();

        if (key === "-" || !key.length) {
          if (idx > 0 && idx === body.length - 1) {
            return;
          }
          error("E002", nt);
          return;
        }

        if (key.charAt(0) === "-") {
          key = key.slice(1);
          val = false;

          JSHINT.blacklist[key] = key;
          delete predefined[key];
        } else {
          predef[key] = (val === "true");
        }
      });

      combine(predefined, predef);

      for (var key in predef) {
        if (_.has(predef, key)) {
          declared[key] = nt;
        }
      }
    }

    if (nt.type === "exported") {
      body.forEach(function(e, idx) {
        if (!e.length) {
          if (idx > 0 && idx === body.length - 1) {
            return;
          }
          error("E002", nt);
          return;
        }

        state.funct["(scope)"].addExported(e);
      });
    }

    if (nt.type === "members") {
      membersOnly = membersOnly || {};

      body.forEach(function(m) {
        var ch1 = m.charAt(0);
        var ch2 = m.charAt(m.length - 1);

        if (ch1 === ch2 && (ch1 === "\"" || ch1 === "'")) {
          m = m
            .substr(1, m.length - 2)
            .replace("\\\"", "\"");
        }

        membersOnly[m] = false;
      });
    }

    var numvals = [
      "maxstatements",
      "maxparams",
      "maxdepth",
      "maxcomplexity",
      "maxerr",
      "maxlen",
      "indent"
    ];

    if (nt.type === "jshint" || nt.type === "jslint") {
      body.forEach(function(g) {
        g = g.split(":");
        var key = (g[0] || "").trim();
        var val = (g[1] || "").trim();

        if (!checkOption(key, nt)) {
          return;
        }

        if (numvals.indexOf(key) >= 0) {
          if (val !== "false") {
            val = +val;

            if (typeof val !== "number" || !isFinite(val) || val <= 0 || Math.floor(val) !== val) {
              error("E032", nt, g[1].trim());
              return;
            }

            state.option[key] = val;
          } else {
            state.option[key] = key === "indent" ? 4 : false;
          }

          return;
        }

        if (key === "validthis") {

          if (state.funct["(global)"])
            return void error("E009");

          if (val !== "true" && val !== "false")
            return void error("E002", nt);

          state.option.validthis = (val === "true");
          return;
        }

        if (key === "quotmark") {
          switch (val) {
          case "true":
          case "false":
            state.option.quotmark = (val === "true");
            break;
          case "double":
          case "single":
            state.option.quotmark = val;
            break;
          default:
            error("E002", nt);
          }
          return;
        }

        if (key === "shadow") {
          switch (val) {
          case "true":
            state.option.shadow = true;
            break;
          case "outer":
            state.option.shadow = "outer";
            break;
          case "false":
          case "inner":
            state.option.shadow = "inner";
            break;
          default:
            error("E002", nt);
          }
          return;
        }

        if (key === "unused") {
          switch (val) {
          case "true":
            state.option.unused = true;
            break;
          case "false":
            state.option.unused = false;
            break;
          case "vars":
          case "strict":
            state.option.unused = val;
            break;
          default:
            error("E002", nt);
          }
          return;
        }

        if (key === "latedef") {
          switch (val) {
          case "true":
            state.option.latedef = true;
            break;
          case "false":
            state.option.latedef = false;
            break;
          case "nofunc":
            state.option.latedef = "nofunc";
            break;
          default:
            error("E002", nt);
          }
          return;
        }

        if (key === "ignore") {
          switch (val) {
          case "line":
            state.ignoredLines[nt.line] = true;
            removeIgnoredMessages();
            break;
          default:
            error("E002", nt);
          }
          return;
        }

        if (key === "strict") {
          switch (val) {
          case "true":
            state.option.strict = true;
            break;
          case "false":
            state.option.strict = false;
            break;
          case "func":
          case "global":
          case "implied":
            state.option.strict = val;
            break;
          default:
            error("E002", nt);
          }
          return;
        }

        if (key === "module") {
          if (!hasParsedCode(state.funct)) {
            error("E055", state.tokens.next, "module");
          }
        }
        var esversions = {
          es3   : 3,
          es5   : 5,
          esnext: 6
        };
        if (_.has(esversions, key)) {
          switch (val) {
          case "true":
            state.option.moz = false;
            state.option.esversion = esversions[key];
            break;
          case "false":
            if (!state.option.moz) {
              state.option.esversion = 5;
            }
            break;
          default:
            error("E002", nt);
          }
          return;
        }

        if (key === "esversion") {
          switch (val) {
          case "5":
            if (state.inES5(true)) {
              warning("I003");
            }
          case "3":
          case "6":
            state.option.moz = false;
            state.option.esversion = +val;
            break;
          case "2015":
            state.option.moz = false;
            state.option.esversion = 6;
            break;
          default:
            error("E002", nt);
          }
          if (!hasParsedCode(state.funct)) {
            error("E055", state.tokens.next, "esversion");
          }
          return;
        }

        var match = /^([+-])(W\d{3})$/g.exec(key);
        if (match) {
          state.ignored[match[2]] = (match[1] === "-");
          return;
        }

        var tn;
        if (val === "true" || val === "false") {
          if (nt.type === "jslint") {
            tn = options.renamed[key] || key;
            state.option[tn] = (val === "true");

            if (options.inverted[tn] !== undefined) {
              state.option[tn] = !state.option[tn];
            }
          } else {
            state.option[key] = (val === "true");
          }

          if (key === "newcap") {
            state.option["(explicitNewcap)"] = true;
          }
          return;
        }

        error("E002", nt);
      });

      assume();
    }
  }

  function peek(p) {
    var i = p || 0, j = lookahead.length, t;

    if (i < j) {
      return lookahead[i];
    }

    while (j <= i) {
      t = lookahead[j];
      if (!t) {
        t = lookahead[j] = lex.token();
      }
      j += 1;
    }
    if (!t && state.tokens.next.id === "(end)") {
      return state.tokens.next;
    }

    return t;
  }

  function peekIgnoreEOL() {
    var i = 0;
    var t;
    do {
      t = peek(i++);
    } while (t.id === "(endline)");
    return t;
  }

  function advance(id, t) {

    switch (state.tokens.curr.id) {
    case "(number)":
      if (state.tokens.next.id === ".") {
        warning("W005", state.tokens.curr);
      }
      break;
    case "-":
      if (state.tokens.next.id === "-" || state.tokens.next.id === "--") {
        warning("W006");
      }
      break;
    case "+":
      if (state.tokens.next.id === "+" || state.tokens.next.id === "++") {
        warning("W007");
      }
      break;
    }

    if (id && state.tokens.next.id !== id) {
      if (t) {
        if (state.tokens.next.id === "(end)") {
          error("E019", t, t.id);
        } else {
          error("E020", state.tokens.next, id, t.id, t.line, state.tokens.next.value);
        }
      } else if (state.tokens.next.type !== "(identifier)" || state.tokens.next.value !== id) {
        warning("W116", state.tokens.next, id, state.tokens.next.value);
      }
    }

    state.tokens.prev = state.tokens.curr;
    state.tokens.curr = state.tokens.next;
    for (;;) {
      state.tokens.next = lookahead.shift() || lex.token();

      if (!state.tokens.next) { // No more tokens left, give up
        quit("E041", state.tokens.curr.line);
      }

      if (state.tokens.next.id === "(end)" || state.tokens.next.id === "(error)") {
        return;
      }

      if (state.tokens.next.check) {
        state.tokens.next.check();
      }

      if (state.tokens.next.isSpecial) {
        if (state.tokens.next.type === "falls through") {
          state.tokens.curr.caseFallsThrough = true;
        } else {
          doOption();
        }
      } else {
        if (state.tokens.next.id !== "(endline)") {
          break;
        }
      }
    }
  }

  function isInfix(token) {
    return token.infix || (!token.identifier && !token.template && !!token.led);
  }

  function isEndOfExpr() {
    var curr = state.tokens.curr;
    var next = state.tokens.next;
    if (next.id === ";" || next.id === "}" || next.id === ":") {
      return true;
    }
    if (isInfix(next) === isInfix(curr) || (curr.id === "yield" && state.inMoz())) {
      return curr.line !== startLine(next);
    }
    return false;
  }

  function isBeginOfExpr(prev) {
    return !prev.left && prev.arity !== "unary";
  }

  function expression(rbp, initial) {
    var left, isArray = false, isObject = false, isLetExpr = false;

    state.nameStack.push();
    if (!initial && state.tokens.next.value === "let" && peek(0).value === "(") {
      if (!state.inMoz()) {
        warning("W118", state.tokens.next, "let expressions");
      }
      isLetExpr = true;
      state.funct["(scope)"].stack();
      advance("let");
      advance("(");
      state.tokens.prev.fud();
      advance(")");
    }

    if (state.tokens.next.id === "(end)")
      error("E006", state.tokens.curr);

    var isDangerous =
      state.option.asi &&
      state.tokens.prev.line !== startLine(state.tokens.curr) &&
      _.contains(["]", ")"], state.tokens.prev.id) &&
      _.contains(["[", "("], state.tokens.curr.id);

    if (isDangerous)
      warning("W014", state.tokens.curr, state.tokens.curr.id);

    advance();

    if (initial) {
      state.funct["(verb)"] = state.tokens.curr.value;
      state.tokens.curr.beginsStmt = true;
    }

    if (initial === true && state.tokens.curr.fud) {
      left = state.tokens.curr.fud();
    } else {
      if (state.tokens.curr.nud) {
        left = state.tokens.curr.nud();
      } else {
        error("E030", state.tokens.curr, state.tokens.curr.id);
      }
      while ((rbp < state.tokens.next.lbp || state.tokens.next.type === "(template)") &&
              !isEndOfExpr()) {
        isArray = state.tokens.curr.value === "Array";
        isObject = state.tokens.curr.value === "Object";
        if (left && (left.value || (left.first && left.first.value))) {
          if (left.value !== "new" ||
            (left.first && left.first.value && left.first.value === ".")) {
            isArray = false;
            if (left.value !== state.tokens.curr.value) {
              isObject = false;
            }
          }
        }

        advance();

        if (isArray && state.tokens.curr.id === "(" && state.tokens.next.id === ")") {
          warning("W009", state.tokens.curr);
        }

        if (isObject && state.tokens.curr.id === "(" && state.tokens.next.id === ")") {
          warning("W010", state.tokens.curr);
        }

        if (left && state.tokens.curr.led) {
          left = state.tokens.curr.led(left);
        } else {
          error("E033", state.tokens.curr, state.tokens.curr.id);
        }
      }
    }
    if (isLetExpr) {
      state.funct["(scope)"].unstack();
    }

    state.nameStack.pop();

    return left;
  }

  function startLine(token) {
    return token.startLine || token.line;
  }

  function nobreaknonadjacent(left, right) {
    left = left || state.tokens.curr;
    right = right || state.tokens.next;
    if (!state.option.laxbreak && left.line !== startLine(right)) {
      warning("W014", right, right.value);
    }
  }

  function nolinebreak(t) {
    t = t || state.tokens.curr;
    if (t.line !== startLine(state.tokens.next)) {
      warning("E022", t, t.value);
    }
  }

  function nobreakcomma(left, right) {
    if (left.line !== startLine(right)) {
      if (!state.option.laxcomma) {
        if (comma.first) {
          warning("I001");
          comma.first = false;
        }
        warning("W014", left, right.value);
      }
    }
  }

  function comma(opts) {
    opts = opts || {};

    if (!opts.peek) {
      nobreakcomma(state.tokens.curr, state.tokens.next);
      advance(",");
    } else {
      nobreakcomma(state.tokens.prev, state.tokens.curr);
    }

    if (state.tokens.next.identifier && !(opts.property && state.inES5())) {
      switch (state.tokens.next.value) {
      case "break":
      case "case":
      case "catch":
      case "continue":
      case "default":
      case "do":
      case "else":
      case "finally":
      case "for":
      case "if":
      case "in":
      case "instanceof":
      case "return":
      case "switch":
      case "throw":
      case "try":
      case "var":
      case "let":
      case "while":
      case "with":
        error("E024", state.tokens.next, state.tokens.next.value);
        return false;
      }
    }

    if (state.tokens.next.type === "(punctuator)") {
      switch (state.tokens.next.value) {
      case "}":
      case "]":
      case ",":
        if (opts.allowTrailing) {
          return true;
        }
      case ")":
        error("E024", state.tokens.next, state.tokens.next.value);
        return false;
      }
    }
    return true;
  }

  function symbol(s, p) {
    var x = state.syntax[s];
    if (!x || typeof x !== "object") {
      state.syntax[s] = x = {
        id: s,
        lbp: p,
        value: s
      };
    }
    return x;
  }

  function delim(s) {
    var x = symbol(s, 0);
    x.delim = true;
    return x;
  }

  function stmt(s, f) {
    var x = delim(s);
    x.identifier = x.reserved = true;
    x.fud = f;
    return x;
  }

  function blockstmt(s, f) {
    var x = stmt(s, f);
    x.block = true;
    return x;
  }

  function reserveName(x) {
    var c = x.id.charAt(0);
    if ((c >= "a" && c <= "z") || (c >= "A" && c <= "Z")) {
      x.identifier = x.reserved = true;
    }
    return x;
  }

  function prefix(s, f) {
    var x = symbol(s, 150);
    reserveName(x);

    x.nud = (typeof f === "function") ? f : function() {
      this.arity = "unary";
      this.right = expression(150);

      if (this.id === "++" || this.id === "--") {
        if (state.option.plusplus) {
          warning("W016", this, this.id);
        } else if (this.right && (!this.right.identifier || isReserved(this.right)) &&
            this.right.id !== "." && this.right.id !== "[") {
          warning("W017", this);
        }

        if (this.right && this.right.isMetaProperty) {
          error("E031", this);
        } else if (this.right && this.right.identifier) {
          state.funct["(scope)"].block.modify(this.right.value, this);
        }
      }

      return this;
    };

    return x;
  }

  function type(s, f) {
    var x = delim(s);
    x.type = s;
    x.nud = f;
    return x;
  }

  function reserve(name, func) {
    var x = type(name, func);
    x.identifier = true;
    x.reserved = true;
    return x;
  }

  function FutureReservedWord(name, meta) {
    var x = type(name, (meta && meta.nud) || function() {
      return this;
    });

    meta = meta || {};
    meta.isFutureReservedWord = true;

    x.value = name;
    x.identifier = true;
    x.reserved = true;
    x.meta = meta;

    return x;
  }

  function reservevar(s, v) {
    return reserve(s, function() {
      if (typeof v === "function") {
        v(this);
      }
      return this;
    });
  }

  function infix(s, f, p, w) {
    var x = symbol(s, p);
    reserveName(x);
    x.infix = true;
    x.led = function(left) {
      if (!w) {
        nobreaknonadjacent(state.tokens.prev, state.tokens.curr);
      }
      if ((s === "in" || s === "instanceof") && left.id === "!") {
        warning("W018", left, "!");
      }
      if (typeof f === "function") {
        return f(left, this);
      } else {
        this.left = left;
        this.right = expression(p);
        return this;
      }
    };
    return x;
  }

  function application(s) {
    var x = symbol(s, 42);

    x.led = function(left) {
      nobreaknonadjacent(state.tokens.prev, state.tokens.curr);

      this.left = left;
      this.right = doFunction({ type: "arrow", loneArg: left });
      return this;
    };
    return x;
  }

  function relation(s, f) {
    var x = symbol(s, 100);

    x.led = function(left) {
      nobreaknonadjacent(state.tokens.prev, state.tokens.curr);
      this.left = left;
      var right = this.right = expression(100);

      if (isIdentifier(left, "NaN") || isIdentifier(right, "NaN")) {
        warning("W019", this);
      } else if (f) {
        f.apply(this, [left, right]);
      }

      if (!left || !right) {
        quit("E041", state.tokens.curr.line);
      }

      if (left.id === "!") {
        warning("W018", left, "!");
      }

      if (right.id === "!") {
        warning("W018", right, "!");
      }

      return this;
    };
    return x;
  }

  function isPoorRelation(node) {
    return node &&
        ((node.type === "(number)" && +node.value === 0) ||
         (node.type === "(string)" && node.value === "") ||
         (node.type === "null" && !state.option.eqnull) ||
        node.type === "true" ||
        node.type === "false" ||
        node.type === "undefined");
  }

  var typeofValues = {};
  typeofValues.legacy = [
    "xml",
    "unknown"
  ];
  typeofValues.es3 = [
    "undefined", "boolean", "number", "string", "function", "object",
  ];
  typeofValues.es3 = typeofValues.es3.concat(typeofValues.legacy);
  typeofValues.es6 = typeofValues.es3.concat("symbol");
  function isTypoTypeof(left, right, state) {
    var values;

    if (state.option.notypeof)
      return false;

    if (!left || !right)
      return false;

    values = state.inES6() ? typeofValues.es6 : typeofValues.es3;

    if (right.type === "(identifier)" && right.value === "typeof" && left.type === "(string)")
      return !_.contains(values, left.value);

    return false;
  }

  function isGlobalEval(left, state) {
    var isGlobal = false;
    if (left.type === "this" && state.funct["(context)"] === null) {
      isGlobal = true;
    }
    else if (left.type === "(identifier)") {
      if (state.option.node && left.value === "global") {
        isGlobal = true;
      }

      else if (state.option.browser && (left.value === "window" || left.value === "document")) {
        isGlobal = true;
      }
    }

    return isGlobal;
  }

  function findNativePrototype(left) {
    var natives = [
      "Array", "ArrayBuffer", "Boolean", "Collator", "DataView", "Date",
      "DateTimeFormat", "Error", "EvalError", "Float32Array", "Float64Array",
      "Function", "Infinity", "Intl", "Int16Array", "Int32Array", "Int8Array",
      "Iterator", "Number", "NumberFormat", "Object", "RangeError",
      "ReferenceError", "RegExp", "StopIteration", "String", "SyntaxError",
      "TypeError", "Uint16Array", "Uint32Array", "Uint8Array", "Uint8ClampedArray",
      "URIError"
    ];

    function walkPrototype(obj) {
      if (typeof obj !== "object") return;
      return obj.right === "prototype" ? obj : walkPrototype(obj.left);
    }

    function walkNative(obj) {
      while (!obj.identifier && typeof obj.left === "object")
        obj = obj.left;

      if (obj.identifier && natives.indexOf(obj.value) >= 0)
        return obj.value;
    }

    var prototype = walkPrototype(left);
    if (prototype) return walkNative(prototype);
  }
  function checkLeftSideAssign(left, assignToken, options) {

    var allowDestructuring = options && options.allowDestructuring;

    assignToken = assignToken || left;

    if (state.option.freeze) {
      var nativeObject = findNativePrototype(left);
      if (nativeObject)
        warning("W121", left, nativeObject);
    }

    if (left.identifier && !left.isMetaProperty) {
      state.funct["(scope)"].block.reassign(left.value, left);
    }

    if (left.id === ".") {
      if (!left.left || left.left.value === "arguments" && !state.isStrict()) {
        warning("E031", assignToken);
      }

      state.nameStack.set(state.tokens.prev);
      return true;
    } else if (left.id === "{" || left.id === "[") {
      if (allowDestructuring && state.tokens.curr.left.destructAssign) {
        state.tokens.curr.left.destructAssign.forEach(function(t) {
          if (t.id) {
            state.funct["(scope)"].block.modify(t.id, t.token);
          }
        });
      } else {
        if (left.id === "{" || !left.left) {
          warning("E031", assignToken);
        } else if (left.left.value === "arguments" && !state.isStrict()) {
          warning("E031", assignToken);
        }
      }

      if (left.id === "[") {
        state.nameStack.set(left.right);
      }

      return true;
    } else if (left.isMetaProperty) {
      error("E031", assignToken);
      return true;
    } else if (left.identifier && !isReserved(left)) {
      if (state.funct["(scope)"].labeltype(left.value) === "exception") {
        warning("W022", left);
      }
      state.nameStack.set(left);
      return true;
    }

    if (left === state.syntax["function"]) {
      warning("W023", state.tokens.curr);
    }

    return false;
  }

  function assignop(s, f, p) {
    var x = infix(s, typeof f === "function" ? f : function(left, that) {
      that.left = left;

      if (left && checkLeftSideAssign(left, that, { allowDestructuring: true })) {
        that.right = expression(10);
        return that;
      }

      error("E031", that);
    }, p);

    x.exps = true;
    x.assign = true;
    return x;
  }


  function bitwise(s, f, p) {
    var x = symbol(s, p);
    reserveName(x);
    x.led = (typeof f === "function") ? f : function(left) {
      if (state.option.bitwise) {
        warning("W016", this, this.id);
      }
      this.left = left;
      this.right = expression(p);
      return this;
    };
    return x;
  }

  function bitwiseassignop(s) {
    return assignop(s, function(left, that) {
      if (state.option.bitwise) {
        warning("W016", that, that.id);
      }

      if (left && checkLeftSideAssign(left, that)) {
        that.right = expression(10);
        return that;
      }
      error("E031", that);
    }, 20);
  }

  function suffix(s) {
    var x = symbol(s, 150);

    x.led = function(left) {
      if (state.option.plusplus) {
        warning("W016", this, this.id);
      } else if ((!left.identifier || isReserved(left)) && left.id !== "." && left.id !== "[") {
        warning("W017", this);
      }

      if (left.isMetaProperty) {
        error("E031", this);
      } else if (left && left.identifier) {
        state.funct["(scope)"].block.modify(left.value, left);
      }

      this.left = left;
      return this;
    };
    return x;
  }

  function optionalidentifier(fnparam, prop, preserve) {
    if (!state.tokens.next.identifier) {
      return;
    }

    if (!preserve) {
      advance();
    }

    var curr = state.tokens.curr;
    var val  = state.tokens.curr.value;

    if (!isReserved(curr)) {
      return val;
    }

    if (prop) {
      if (state.inES5()) {
        return val;
      }
    }

    if (fnparam && val === "undefined") {
      return val;
    }

    warning("W024", state.tokens.curr, state.tokens.curr.id);
    return val;
  }
  function identifier(fnparam, prop) {
    var i = optionalidentifier(fnparam, prop, false);
    if (i) {
      return i;
    }
    if (state.tokens.next.value === "...") {
      if (!state.inES6(true)) {
        warning("W119", state.tokens.next, "spread/rest operator", "6");
      }
      advance();

      if (checkPunctuator(state.tokens.next, "...")) {
        warning("E024", state.tokens.next, "...");
        while (checkPunctuator(state.tokens.next, "...")) {
          advance();
        }
      }

      if (!state.tokens.next.identifier) {
        warning("E024", state.tokens.curr, "...");
        return;
      }

      return identifier(fnparam, prop);
    } else {
      error("E030", state.tokens.next, state.tokens.next.value);
      if (state.tokens.next.id !== ";") {
        advance();
      }
    }
  }


  function reachable(controlToken) {
    var i = 0, t;
    if (state.tokens.next.id !== ";" || controlToken.inBracelessBlock) {
      return;
    }
    for (;;) {
      do {
        t = peek(i);
        i += 1;
      } while (t.id !== "(end)" && t.id === "(comment)");

      if (t.reach) {
        return;
      }
      if (t.id !== "(endline)") {
        if (t.id === "function") {
          if (state.option.latedef === true) {
            warning("W026", t);
          }
          break;
        }

        warning("W027", t, t.value, controlToken.value);
        break;
      }
    }
  }

  function parseFinalSemicolon() {
    if (state.tokens.next.id !== ";") {
      if (state.tokens.next.isUnclosed) return advance();

      var sameLine = startLine(state.tokens.next) === state.tokens.curr.line &&
                     state.tokens.next.id !== "(end)";
      var blockEnd = checkPunctuator(state.tokens.next, "}");

      if (sameLine && !blockEnd) {
        errorAt("E058", state.tokens.curr.line, state.tokens.curr.character);
      } else if (!state.option.asi) {
        if ((blockEnd && !state.option.lastsemic) || !sameLine) {
          warningAt("W033", state.tokens.curr.line, state.tokens.curr.character);
        }
      }
    } else {
      advance(";");
    }
  }

  function statement() {
    var i = indent, r, t = state.tokens.next, hasOwnScope = false;

    if (t.id === ";") {
      advance(";");
      return;
    }
    var res = isReserved(t);

    if (res && t.meta && t.meta.isFutureReservedWord && peek().id === ":") {
      warning("W024", t, t.id);
      res = false;
    }

    if (t.identifier && !res && peek().id === ":") {
      advance();
      advance(":");

      hasOwnScope = true;
      state.funct["(scope)"].stack();
      state.funct["(scope)"].block.addBreakLabel(t.value, { token: state.tokens.curr });

      if (!state.tokens.next.labelled && state.tokens.next.value !== "{") {
        warning("W028", state.tokens.next, t.value, state.tokens.next.value);
      }

      state.tokens.next.label = t.value;
      t = state.tokens.next;
    }

    if (t.id === "{") {
      var iscase = (state.funct["(verb)"] === "case" && state.tokens.curr.value === ":");
      block(true, true, false, false, iscase);
      return;
    }

    r = expression(0, true);

    if (r && !(r.identifier && r.value === "function") &&
        !(r.type === "(punctuator)" && r.left &&
          r.left.identifier && r.left.value === "function")) {
      if (!state.isStrict() &&
          state.option.strict === "global") {
        warning("E007");
      }
    }

    if (!t.block) {
      if (!state.option.expr && (!r || !r.exps)) {
        warning("W030", state.tokens.curr);
      } else if (state.option.nonew && r && r.left && r.id === "(" && r.left.id === "new") {
        warning("W031", t);
      }
      parseFinalSemicolon();
    }

    indent = i;
    if (hasOwnScope) {
      state.funct["(scope)"].unstack();
    }
    return r;
  }


  function statements() {
    var a = [], p;

    while (!state.tokens.next.reach && state.tokens.next.id !== "(end)") {
      if (state.tokens.next.id === ";") {
        p = peek();

        if (!p || (p.id !== "(" && p.id !== "[")) {
          warning("W032");
        }

        advance(";");
      } else {
        a.push(statement());
      }
    }
    return a;
  }
  function directives() {
    var i, p, pn;

    while (state.tokens.next.id === "(string)") {
      p = peek(0);
      if (p.id === "(endline)") {
        i = 1;
        do {
          pn = peek(i++);
        } while (pn.id === "(endline)");
        if (pn.id === ";") {
          p = pn;
        } else if (pn.value === "[" || pn.value === ".") {
          break;
        } else if (!state.option.asi || pn.value === "(") {
          warning("W033", state.tokens.next);
        }
      } else if (p.id === "." || p.id === "[") {
        break;
      } else if (p.id !== ";") {
        warning("W033", p);
      }

      advance();
      var directive = state.tokens.curr.value;
      if (state.directive[directive] ||
          (directive === "use strict" && state.option.strict === "implied")) {
        warning("W034", state.tokens.curr, directive);
      }
      state.directive[directive] = true;

      if (p.id === ";") {
        advance(";");
      }
    }

    if (state.isStrict()) {
      if (!state.option["(explicitNewcap)"]) {
        state.option.newcap = true;
      }
      state.option.undef = true;
    }
  }
  function block(ordinary, stmt, isfunc, isfatarrow, iscase) {
    var a,
      b = inblock,
      old_indent = indent,
      m,
      t,
      line,
      d;

    inblock = ordinary;

    t = state.tokens.next;

    var metrics = state.funct["(metrics)"];
    metrics.nestedBlockDepth += 1;
    metrics.verifyMaxNestedBlockDepthPerFunction();

    if (state.tokens.next.id === "{") {
      advance("{");
      state.funct["(scope)"].stack();

      line = state.tokens.curr.line;
      if (state.tokens.next.id !== "}") {
        indent += state.option.indent;
        while (!ordinary && state.tokens.next.from > indent) {
          indent += state.option.indent;
        }

        if (isfunc) {
          m = {};
          for (d in state.directive) {
            if (_.has(state.directive, d)) {
              m[d] = state.directive[d];
            }
          }
          directives();

          if (state.option.strict && state.funct["(context)"]["(global)"]) {
            if (!m["use strict"] && !state.isStrict()) {
              warning("E007");
            }
          }
        }

        a = statements();

        metrics.statementCount += a.length;

        indent -= state.option.indent;
      }

      advance("}", t);

      if (isfunc) {
        state.funct["(scope)"].validateParams();
        if (m) {
          state.directive = m;
        }
      }

      state.funct["(scope)"].unstack();

      indent = old_indent;
    } else if (!ordinary) {
      if (isfunc) {
        state.funct["(scope)"].stack();

        m = {};
        if (stmt && !isfatarrow && !state.inMoz()) {
          error("W118", state.tokens.curr, "function closure expressions");
        }

        if (!stmt) {
          for (d in state.directive) {
            if (_.has(state.directive, d)) {
              m[d] = state.directive[d];
            }
          }
        }
        expression(10);

        if (state.option.strict && state.funct["(context)"]["(global)"]) {
          if (!m["use strict"] && !state.isStrict()) {
            warning("E007");
          }
        }

        state.funct["(scope)"].unstack();
      } else {
        error("E021", state.tokens.next, "{", state.tokens.next.value);
      }
    } else {
      state.funct["(noblockscopedvar)"] = state.tokens.next.id !== "for";
      state.funct["(scope)"].stack();

      if (!stmt || state.option.curly) {
        warning("W116", state.tokens.next, "{", state.tokens.next.value);
      }

      state.tokens.next.inBracelessBlock = true;
      indent += state.option.indent;
      a = [statement()];
      indent -= state.option.indent;

      state.funct["(scope)"].unstack();
      delete state.funct["(noblockscopedvar)"];
    }
    switch (state.funct["(verb)"]) {
    case "break":
    case "continue":
    case "return":
    case "throw":
      if (iscase) {
        break;
      }
    default:
      state.funct["(verb)"] = null;
    }

    inblock = b;
    if (ordinary && state.option.noempty && (!a || a.length === 0)) {
      warning("W035", state.tokens.prev);
    }
    metrics.nestedBlockDepth -= 1;
    return a;
  }


  function countMember(m) {
    if (membersOnly && typeof membersOnly[m] !== "boolean") {
      warning("W036", state.tokens.curr, m);
    }
    if (typeof member[m] === "number") {
      member[m] += 1;
    } else {
      member[m] = 1;
    }
  }

  type("(number)", function() {
    return this;
  });

  type("(string)", function() {
    return this;
  });

  state.syntax["(identifier)"] = {
    type: "(identifier)",
    lbp: 0,
    identifier: true,

    nud: function() {
      var v = this.value;
      if (state.tokens.next.id === "=>") {
        return this;
      }

      if (!state.funct["(comparray)"].check(v)) {
        state.funct["(scope)"].block.use(v, state.tokens.curr);
      }
      return this;
    },

    led: function() {
      error("E033", state.tokens.next, state.tokens.next.value);
    }
  };

  var baseTemplateSyntax = {
    lbp: 0,
    identifier: false,
    template: true,
  };
  state.syntax["(template)"] = _.extend({
    type: "(template)",
    nud: doTemplateLiteral,
    led: doTemplateLiteral,
    noSubst: false
  }, baseTemplateSyntax);

  state.syntax["(template middle)"] = _.extend({
    type: "(template middle)",
    middle: true,
    noSubst: false
  }, baseTemplateSyntax);

  state.syntax["(template tail)"] = _.extend({
    type: "(template tail)",
    tail: true,
    noSubst: false
  }, baseTemplateSyntax);

  state.syntax["(no subst template)"] = _.extend({
    type: "(template)",
    nud: doTemplateLiteral,
    led: doTemplateLiteral,
    noSubst: true,
    tail: true // mark as tail, since it's always the last component
  }, baseTemplateSyntax);

  type("(regexp)", function() {
    return this;
  });

  delim("(endline)");
  delim("(begin)");
  delim("(end)").reach = true;
  delim("(error)").reach = true;
  delim("}").reach = true;
  delim(")");
  delim("]");
  delim("\"").reach = true;
  delim("'").reach = true;
  delim(";");
  delim(":").reach = true;
  delim("#");

  reserve("else");
  reserve("case").reach = true;
  reserve("catch");
  reserve("default").reach = true;
  reserve("finally");
  reservevar("arguments", function(x) {
    if (state.isStrict() && state.funct["(global)"]) {
      warning("E008", x);
    }
  });
  reservevar("eval");
  reservevar("false");
  reservevar("Infinity");
  reservevar("null");
  reservevar("this", function(x) {
    if (state.isStrict() && !isMethod() &&
        !state.option.validthis && ((state.funct["(statement)"] &&
        state.funct["(name)"].charAt(0) > "Z") || state.funct["(global)"])) {
      warning("W040", x);
    }
  });
  reservevar("true");
  reservevar("undefined");

  assignop("=", "assign", 20);
  assignop("+=", "assignadd", 20);
  assignop("-=", "assignsub", 20);
  assignop("*=", "assignmult", 20);
  assignop("/=", "assigndiv", 20).nud = function() {
    error("E014");
  };
  assignop("%=", "assignmod", 20);

  bitwiseassignop("&=");
  bitwiseassignop("|=");
  bitwiseassignop("^=");
  bitwiseassignop("<<=");
  bitwiseassignop(">>=");
  bitwiseassignop(">>>=");
  infix(",", function(left, that) {
    var expr;
    that.exprs = [left];

    if (state.option.nocomma) {
      warning("W127");
    }

    if (!comma({ peek: true })) {
      return that;
    }
    while (true) {
      if (!(expr = expression(10))) {
        break;
      }
      that.exprs.push(expr);
      if (state.tokens.next.value !== "," || !comma()) {
        break;
      }
    }
    return that;
  }, 10, true);

  infix("?", function(left, that) {
    increaseComplexityCount();
    that.left = left;
    that.right = expression(10);
    advance(":");
    that["else"] = expression(10);
    return that;
  }, 30);

  var orPrecendence = 40;
  infix("||", function(left, that) {
    increaseComplexityCount();
    that.left = left;
    that.right = expression(orPrecendence);
    return that;
  }, orPrecendence);
  infix("&&", "and", 50);
  bitwise("|", "bitor", 70);
  bitwise("^", "bitxor", 80);
  bitwise("&", "bitand", 90);
  relation("==", function(left, right) {
    var eqnull = state.option.eqnull &&
      ((left && left.value) === "null" || (right && right.value) === "null");

    switch (true) {
      case !eqnull && state.option.eqeqeq:
        this.from = this.character;
        warning("W116", this, "===", "==");
        break;
      case isPoorRelation(left):
        warning("W041", this, "===", left.value);
        break;
      case isPoorRelation(right):
        warning("W041", this, "===", right.value);
        break;
      case isTypoTypeof(right, left, state):
        warning("W122", this, right.value);
        break;
      case isTypoTypeof(left, right, state):
        warning("W122", this, left.value);
        break;
    }

    return this;
  });
  relation("===", function(left, right) {
    if (isTypoTypeof(right, left, state)) {
      warning("W122", this, right.value);
    } else if (isTypoTypeof(left, right, state)) {
      warning("W122", this, left.value);
    }
    return this;
  });
  relation("!=", function(left, right) {
    var eqnull = state.option.eqnull &&
        ((left && left.value) === "null" || (right && right.value) === "null");

    if (!eqnull && state.option.eqeqeq) {
      this.from = this.character;
      warning("W116", this, "!==", "!=");
    } else if (isPoorRelation(left)) {
      warning("W041", this, "!==", left.value);
    } else if (isPoorRelation(right)) {
      warning("W041", this, "!==", right.value);
    } else if (isTypoTypeof(right, left, state)) {
      warning("W122", this, right.value);
    } else if (isTypoTypeof(left, right, state)) {
      warning("W122", this, left.value);
    }
    return this;
  });
  relation("!==", function(left, right) {
    if (isTypoTypeof(right, left, state)) {
      warning("W122", this, right.value);
    } else if (isTypoTypeof(left, right, state)) {
      warning("W122", this, left.value);
    }
    return this;
  });
  relation("<");
  relation(">");
  relation("<=");
  relation(">=");
  bitwise("<<", "shiftleft", 120);
  bitwise(">>", "shiftright", 120);
  bitwise(">>>", "shiftrightunsigned", 120);
  infix("in", "in", 120);
  infix("instanceof", "instanceof", 120);
  infix("+", function(left, that) {
    var right;
    that.left = left;
    that.right = right = expression(130);

    if (left && right && left.id === "(string)" && right.id === "(string)") {
      left.value += right.value;
      left.character = right.character;
      if (!state.option.scripturl && reg.javascriptURL.test(left.value)) {
        warning("W050", left);
      }
      return left;
    }

    return that;
  }, 130);
  prefix("+", "num");
  prefix("+++", function() {
    warning("W007");
    this.arity = "unary";
    this.right = expression(150);
    return this;
  });
  infix("+++", function(left) {
    warning("W007");
    this.left = left;
    this.right = expression(130);
    return this;
  }, 130);
  infix("-", "sub", 130);
  prefix("-", "neg");
  prefix("---", function() {
    warning("W006");
    this.arity = "unary";
    this.right = expression(150);
    return this;
  });
  infix("---", function(left) {
    warning("W006");
    this.left = left;
    this.right = expression(130);
    return this;
  }, 130);
  infix("*", "mult", 140);
  infix("/", "div", 140);
  infix("%", "mod", 140);

  suffix("++");
  prefix("++", "preinc");
  state.syntax["++"].exps = true;

  suffix("--");
  prefix("--", "predec");
  state.syntax["--"].exps = true;
  prefix("delete", function() {
    var p = expression(10);
    if (!p) {
      return this;
    }

    if (p.id !== "." && p.id !== "[") {
      warning("W051");
    }
    this.first = p;
    if (p.identifier && !state.isStrict()) {
      p.forgiveUndef = true;
    }
    return this;
  }).exps = true;

  prefix("~", function() {
    if (state.option.bitwise) {
      warning("W016", this, "~");
    }
    this.arity = "unary";
    this.right = expression(150);
    return this;
  });

  prefix("...", function() {
    if (!state.inES6(true)) {
      warning("W119", this, "spread/rest operator", "6");
    }
    if (!state.tokens.next.identifier &&
        state.tokens.next.type !== "(string)" &&
          !checkPunctuators(state.tokens.next, ["[", "("])) {

      error("E030", state.tokens.next, state.tokens.next.value);
    }
    expression(150);
    return this;
  });

  prefix("!", function() {
    this.arity = "unary";
    this.right = expression(150);

    if (!this.right) { // '!' followed by nothing? Give up.
      quit("E041", this.line || 0);
    }

    if (bang[this.right.id] === true) {
      warning("W018", this, "!");
    }
    return this;
  });

  prefix("typeof", (function() {
    var p = expression(150);
    this.first = this.right = p;

    if (!p) { // 'typeof' followed by nothing? Give up.
      quit("E041", this.line || 0, this.character || 0);
    }
    if (p.identifier) {
      p.forgiveUndef = true;
    }
    return this;
  }));
  prefix("new", function() {
    var mp = metaProperty("target", function() {
      if (!state.inES6(true)) {
        warning("W119", state.tokens.prev, "new.target", "6");
      }
      var inFunction, c = state.funct;
      while (c) {
        inFunction = !c["(global)"];
        if (!c["(arrow)"]) { break; }
        c = c["(context)"];
      }
      if (!inFunction) {
        warning("W136", state.tokens.prev, "new.target");
      }
    });
    if (mp) { return mp; }

    var c = expression(155), i;
    if (c && c.id !== "function") {
      if (c.identifier) {
        c["new"] = true;
        switch (c.value) {
        case "Number":
        case "String":
        case "Boolean":
        case "Math":
        case "JSON":
          warning("W053", state.tokens.prev, c.value);
          break;
        case "Symbol":
          if (state.inES6()) {
            warning("W053", state.tokens.prev, c.value);
          }
          break;
        case "Function":
          if (!state.option.evil) {
            warning("W054");
          }
          break;
        case "Date":
        case "RegExp":
        case "this":
          break;
        default:
          if (c.id !== "function") {
            i = c.value.substr(0, 1);
            if (state.option.newcap && (i < "A" || i > "Z") &&
              !state.funct["(scope)"].isPredefined(c.value)) {
              warning("W055", state.tokens.curr);
            }
          }
        }
      } else {
        if (c.id !== "." && c.id !== "[" && c.id !== "(") {
          warning("W056", state.tokens.curr);
        }
      }
    } else {
      if (!state.option.supernew)
        warning("W057", this);
    }
    if (state.tokens.next.id !== "(" && !state.option.supernew) {
      warning("W058", state.tokens.curr, state.tokens.curr.value);
    }
    this.first = this.right = c;
    return this;
  });
  state.syntax["new"].exps = true;

  prefix("void").exps = true;

  infix(".", function(left, that) {
    var m = identifier(false, true);

    if (typeof m === "string") {
      countMember(m);
    }

    that.left = left;
    that.right = m;

    if (m && m === "hasOwnProperty" && state.tokens.next.value === "=") {
      warning("W001");
    }

    if (left && left.value === "arguments" && (m === "callee" || m === "caller")) {
      if (state.option.noarg)
        warning("W059", left, m);
      else if (state.isStrict())
        error("E008");
    } else if (!state.option.evil && left && left.value === "document" &&
        (m === "write" || m === "writeln")) {
      warning("W060", left);
    }

    if (!state.option.evil && (m === "eval" || m === "execScript")) {
      if (isGlobalEval(left, state)) {
        warning("W061");
      }
    }

    return that;
  }, 160, true);

  infix("(", function(left, that) {
    if (state.option.immed && left && !left.immed && left.id === "function") {
      warning("W062");
    }

    var n = 0;
    var p = [];

    if (left) {
      if (left.type === "(identifier)") {
        if (left.value.match(/^[A-Z]([A-Z0-9_$]*[a-z][A-Za-z0-9_$]*)?$/)) {
          if ("Array Number String Boolean Date Object Error Symbol".indexOf(left.value) === -1) {
            if (left.value === "Math") {
              warning("W063", left);
            } else if (state.option.newcap) {
              warning("W064", left);
            }
          }
        }
      }
    }

    if (state.tokens.next.id !== ")") {
      for (;;) {
        p[p.length] = expression(10);
        n += 1;
        if (state.tokens.next.id !== ",") {
          break;
        }
        comma();
      }
    }

    advance(")");

    if (typeof left === "object") {
      if (!state.inES5() && left.value === "parseInt" && n === 1) {
        warning("W065", state.tokens.curr);
      }
      if (!state.option.evil) {
        if (left.value === "eval" || left.value === "Function" ||
            left.value === "execScript") {
          warning("W061", left);

          if (p[0] && [0].id === "(string)") {
            addInternalSrc(left, p[0].value);
          }
        } else if (p[0] && p[0].id === "(string)" &&
             (left.value === "setTimeout" ||
            left.value === "setInterval")) {
          warning("W066", left);
          addInternalSrc(left, p[0].value);
        } else if (p[0] && p[0].id === "(string)" &&
             left.value === "." &&
             left.left.value === "window" &&
             (left.right === "setTimeout" ||
            left.right === "setInterval")) {
          warning("W066", left);
          addInternalSrc(left, p[0].value);
        }
      }
      if (!left.identifier && left.id !== "." && left.id !== "[" && left.id !== "=>" &&
          left.id !== "(" && left.id !== "&&" && left.id !== "||" && left.id !== "?" &&
          !(state.inES6() && left["(name)"])) {
        warning("W067", that);
      }
    }

    that.left = left;
    return that;
  }, 155, true).exps = true;

  prefix("(", function() {
    var pn = state.tokens.next, pn1, i = -1;
    var ret, triggerFnExpr, first, last;
    var parens = 1;
    var opening = state.tokens.curr;
    var preceeding = state.tokens.prev;
    var isNecessary = !state.option.singleGroups;

    do {
      if (pn.value === "(") {
        parens += 1;
      } else if (pn.value === ")") {
        parens -= 1;
      }

      i += 1;
      pn1 = pn;
      pn = peek(i);
    } while (!(parens === 0 && pn1.value === ")") && pn.value !== ";" && pn.type !== "(end)");

    if (state.tokens.next.id === "function") {
      triggerFnExpr = state.tokens.next.immed = true;
    }
    if (pn.value === "=>") {
      return doFunction({ type: "arrow", parsedOpening: true });
    }

    var exprs = [];

    if (state.tokens.next.id !== ")") {
      for (;;) {
        exprs.push(expression(10));

        if (state.tokens.next.id !== ",") {
          break;
        }

        if (state.option.nocomma) {
          warning("W127");
        }

        comma();
      }
    }

    advance(")", this);
    if (state.option.immed && exprs[0] && exprs[0].id === "function") {
      if (state.tokens.next.id !== "(" &&
        state.tokens.next.id !== "." && state.tokens.next.id !== "[") {
        warning("W068", this);
      }
    }

    if (!exprs.length) {
      return;
    }
    if (exprs.length > 1) {
      ret = Object.create(state.syntax[","]);
      ret.exprs = exprs;

      first = exprs[0];
      last = exprs[exprs.length - 1];

      if (!isNecessary) {
        isNecessary = preceeding.assign || preceeding.delim;
      }
    } else {
      ret = first = last = exprs[0];

      if (!isNecessary) {
        isNecessary =
          (opening.beginsStmt && (ret.id === "{" || triggerFnExpr || isFunctor(ret))) ||
          (triggerFnExpr &&
            (!isEndOfExpr() || state.tokens.prev.id !== "}")) ||
          (isFunctor(ret) && !isEndOfExpr()) ||
          (ret.id === "{" && preceeding.id === "=>") ||
          (ret.type === "(number)" &&
            checkPunctuator(pn, ".") && /^\d+$/.test(ret.value));
      }
    }

    if (ret) {
      if (!isNecessary && (first.left || first.right || ret.exprs)) {
        isNecessary =
          (!isBeginOfExpr(preceeding) && first.lbp <= preceeding.lbp) ||
          (!isEndOfExpr() && last.lbp < state.tokens.next.lbp);
      }

      if (!isNecessary) {
        warning("W126", opening);
      }

      ret.paren = true;
    }

    return ret;
  });

  application("=>");

  infix("[", function(left, that) {
    var e = expression(10), s;
    if (e && e.type === "(string)") {
      if (!state.option.evil && (e.value === "eval" || e.value === "execScript")) {
        if (isGlobalEval(left, state)) {
          warning("W061");
        }
      }

      countMember(e.value);
      if (!state.option.sub && reg.identifier.test(e.value)) {
        s = state.syntax[e.value];
        if (!s || !isReserved(s)) {
          warning("W069", state.tokens.prev, e.value);
        }
      }
    }
    advance("]", that);

    if (e && e.value === "hasOwnProperty" && state.tokens.next.value === "=") {
      warning("W001");
    }

    that.left = left;
    that.right = e;
    return that;
  }, 160, true);

  function comprehensiveArrayExpression() {
    var res = {};
    res.exps = true;
    state.funct["(comparray)"].stack();
    var reversed = false;
    if (state.tokens.next.value !== "for") {
      reversed = true;
      if (!state.inMoz()) {
        warning("W116", state.tokens.next, "for", state.tokens.next.value);
      }
      state.funct["(comparray)"].setState("use");
      res.right = expression(10);
    }

    advance("for");
    if (state.tokens.next.value === "each") {
      advance("each");
      if (!state.inMoz()) {
        warning("W118", state.tokens.curr, "for each");
      }
    }
    advance("(");
    state.funct["(comparray)"].setState("define");
    res.left = expression(130);
    if (_.contains(["in", "of"], state.tokens.next.value)) {
      advance();
    } else {
      error("E045", state.tokens.curr);
    }
    state.funct["(comparray)"].setState("generate");
    expression(10);

    advance(")");
    if (state.tokens.next.value === "if") {
      advance("if");
      advance("(");
      state.funct["(comparray)"].setState("filter");
      res.filter = expression(10);
      advance(")");
    }

    if (!reversed) {
      state.funct["(comparray)"].setState("use");
      res.right = expression(10);
    }

    advance("]");
    state.funct["(comparray)"].unstack();
    return res;
  }

  prefix("[", function() {
    var blocktype = lookupBlockType();
    if (blocktype.isCompArray) {
      if (!state.option.esnext && !state.inMoz()) {
        warning("W118", state.tokens.curr, "array comprehension");
      }
      return comprehensiveArrayExpression();
    } else if (blocktype.isDestAssign) {
      this.destructAssign = destructuringPattern({ openingParsed: true, assignment: true });
      return this;
    }
    var b = state.tokens.curr.line !== startLine(state.tokens.next);
    this.first = [];
    if (b) {
      indent += state.option.indent;
      if (state.tokens.next.from === indent + state.option.indent) {
        indent += state.option.indent;
      }
    }
    while (state.tokens.next.id !== "(end)") {
      while (state.tokens.next.id === ",") {
        if (!state.option.elision) {
          if (!state.inES5()) {
            warning("W070");
          } else {
            warning("W128");
            do {
              advance(",");
            } while (state.tokens.next.id === ",");
            continue;
          }
        }
        advance(",");
      }

      if (state.tokens.next.id === "]") {
        break;
      }

      this.first.push(expression(10));
      if (state.tokens.next.id === ",") {
        comma({ allowTrailing: true });
        if (state.tokens.next.id === "]" && !state.inES5()) {
          warning("W070", state.tokens.curr);
          break;
        }
      } else {
        break;
      }
    }
    if (b) {
      indent -= state.option.indent;
    }
    advance("]", this);
    return this;
  });


  function isMethod() {
    return state.funct["(statement)"] && state.funct["(statement)"].type === "class" ||
           state.funct["(context)"] && state.funct["(context)"]["(verb)"] === "class";
  }


  function isPropertyName(token) {
    return token.identifier || token.id === "(string)" || token.id === "(number)";
  }


  function propertyName(preserveOrToken) {
    var id;
    var preserve = true;
    if (typeof preserveOrToken === "object") {
      id = preserveOrToken;
    } else {
      preserve = preserveOrToken;
      id = optionalidentifier(false, true, preserve);
    }

    if (!id) {
      if (state.tokens.next.id === "(string)") {
        id = state.tokens.next.value;
        if (!preserve) {
          advance();
        }
      } else if (state.tokens.next.id === "(number)") {
        id = state.tokens.next.value.toString();
        if (!preserve) {
          advance();
        }
      }
    } else if (typeof id === "object") {
      if (id.id === "(string)" || id.id === "(identifier)") id = id.value;
      else if (id.id === "(number)") id = id.value.toString();
    }

    if (id === "hasOwnProperty") {
      warning("W001");
    }

    return id;
  }
  function functionparams(options) {
    var next;
    var paramsIds = [];
    var ident;
    var tokens = [];
    var t;
    var pastDefault = false;
    var pastRest = false;
    var arity = 0;
    var loneArg = options && options.loneArg;

    if (loneArg && loneArg.identifier === true) {
      state.funct["(scope)"].addParam(loneArg.value, loneArg);
      return { arity: 1, params: [ loneArg.value ] };
    }

    next = state.tokens.next;

    if (!options || !options.parsedOpening) {
      advance("(");
    }

    if (state.tokens.next.id === ")") {
      advance(")");
      return;
    }

    function addParam(addParamArgs) {
      state.funct["(scope)"].addParam.apply(state.funct["(scope)"], addParamArgs);
    }

    for (;;) {
      arity++;
      var currentParams = [];

      if (_.contains(["{", "["], state.tokens.next.id)) {
        tokens = destructuringPattern();
        for (t in tokens) {
          t = tokens[t];
          if (t.id) {
            paramsIds.push(t.id);
            currentParams.push([t.id, t.token]);
          }
        }
      } else {
        if (checkPunctuator(state.tokens.next, "...")) pastRest = true;
        ident = identifier(true);
        if (ident) {
          paramsIds.push(ident);
          currentParams.push([ident, state.tokens.curr]);
        } else {
          while (!checkPunctuators(state.tokens.next, [",", ")"])) advance();
        }
      }
      if (pastDefault) {
        if (state.tokens.next.id !== "=") {
          error("W138", state.tokens.current);
        }
      }
      if (state.tokens.next.id === "=") {
        if (!state.inES6()) {
          warning("W119", state.tokens.next, "default parameters", "6");
        }
        advance("=");
        pastDefault = true;
        expression(10);
      }
      currentParams.forEach(addParam);

      if (state.tokens.next.id === ",") {
        if (pastRest) {
          warning("W131", state.tokens.next);
        }
        comma();
      } else {
        advance(")", next);
        return { arity: arity, params: paramsIds };
      }
    }
  }

  function functor(name, token, overwrites) {
    var funct = {
      "(name)"      : name,
      "(breakage)"  : 0,
      "(loopage)"   : 0,
      "(tokens)"    : {},
      "(properties)": {},

      "(catch)"     : false,
      "(global)"    : false,

      "(line)"      : null,
      "(character)" : null,
      "(metrics)"   : null,
      "(statement)" : null,
      "(context)"   : null,
      "(scope)"     : null,
      "(comparray)" : null,
      "(generator)" : null,
      "(arrow)"     : null,
      "(params)"    : null
    };

    if (token) {
      _.extend(funct, {
        "(line)"     : token.line,
        "(character)": token.character,
        "(metrics)"  : createMetrics(token)
      });
    }

    _.extend(funct, overwrites);

    if (funct["(context)"]) {
      funct["(scope)"] = funct["(context)"]["(scope)"];
      funct["(comparray)"]  = funct["(context)"]["(comparray)"];
    }

    return funct;
  }

  function isFunctor(token) {
    return "(scope)" in token;
  }
  function hasParsedCode(funct) {
    return funct["(global)"] && !funct["(verb)"];
  }

  function doTemplateLiteral(left) {
    var ctx = this.context;
    var noSubst = this.noSubst;
    var depth = this.depth;

    if (!noSubst) {
      while (!end()) {
        if (!state.tokens.next.template || state.tokens.next.depth > depth) {
          expression(0); // should probably have different rbp?
        } else {
          advance();
        }
      }
    }

    return {
      id: "(template)",
      type: "(template)",
      tag: left
    };

    function end() {
      if (state.tokens.curr.template && state.tokens.curr.tail &&
          state.tokens.curr.context === ctx) return true;
      var complete = (state.tokens.next.template && state.tokens.next.tail &&
                      state.tokens.next.context === ctx);
      if (complete) advance();
      return complete || state.tokens.next.isUnclosed;
    }
  }
  function doFunction(options) {
    var f, token, name, statement, classExprBinding, isGenerator, isArrow, ignoreLoopFunc;
    var oldOption = state.option;
    var oldIgnored = state.ignored;

    if (options) {
      name = options.name;
      statement = options.statement;
      classExprBinding = options.classExprBinding;
      isGenerator = options.type === "generator";
      isArrow = options.type === "arrow";
      ignoreLoopFunc = options.ignoreLoopFunc;
    }

    state.option = Object.create(state.option);
    state.ignored = Object.create(state.ignored);

    state.funct = functor(name || state.nameStack.infer(), state.tokens.next, {
      "(statement)": statement,
      "(context)":   state.funct,
      "(arrow)":     isArrow,
      "(generator)": isGenerator
    });

    f = state.funct;
    token = state.tokens.curr;
    token.funct = state.funct;

    functions.push(state.funct);
    state.funct["(scope)"].stack("functionouter");
    var internallyAccessibleName = name || classExprBinding;
    if (internallyAccessibleName) {
      state.funct["(scope)"].block.add(internallyAccessibleName,
        classExprBinding ? "class" : "function", state.tokens.curr, false);
    }
    state.funct["(scope)"].stack("functionparams");

    var paramsInfo = functionparams(options);

    if (paramsInfo) {
      state.funct["(params)"] = paramsInfo.params;
      state.funct["(metrics)"].arity = paramsInfo.arity;
      state.funct["(metrics)"].verifyMaxParametersPerFunction();
    } else {
      state.funct["(metrics)"].arity = 0;
    }

    if (isArrow) {
      if (!state.inES6(true)) {
        warning("W119", state.tokens.curr, "arrow function syntax (=>)", "6");
      }

      if (!options.loneArg) {
        advance("=>");
      }
    }

    block(false, true, true, isArrow);

    if (!state.option.noyield && isGenerator &&
        state.funct["(generator)"] !== "yielded") {
      warning("W124", state.tokens.curr);
    }

    state.funct["(metrics)"].verifyMaxStatementsPerFunction();
    state.funct["(metrics)"].verifyMaxComplexityPerFunction();
    state.funct["(unusedOption)"] = state.option.unused;
    state.option = oldOption;
    state.ignored = oldIgnored;
    state.funct["(last)"] = state.tokens.curr.line;
    state.funct["(lastcharacter)"] = state.tokens.curr.character;
    state.funct["(scope)"].unstack(); // also does usage and label checks
    state.funct["(scope)"].unstack();

    state.funct = state.funct["(context)"];

    if (!ignoreLoopFunc && !state.option.loopfunc && state.funct["(loopage)"]) {
      if (f["(isCapturing)"]) {
        warning("W083", token);
      }
    }

    return f;
  }

  function createMetrics(functionStartToken) {
    return {
      statementCount: 0,
      nestedBlockDepth: -1,
      ComplexityCount: 1,
      arity: 0,

      verifyMaxStatementsPerFunction: function() {
        if (state.option.maxstatements &&
          this.statementCount > state.option.maxstatements) {
          warning("W071", functionStartToken, this.statementCount);
        }
      },

      verifyMaxParametersPerFunction: function() {
        if (_.isNumber(state.option.maxparams) &&
          this.arity > state.option.maxparams) {
          warning("W072", functionStartToken, this.arity);
        }
      },

      verifyMaxNestedBlockDepthPerFunction: function() {
        if (state.option.maxdepth &&
          this.nestedBlockDepth > 0 &&
          this.nestedBlockDepth === state.option.maxdepth + 1) {
          warning("W073", null, this.nestedBlockDepth);
        }
      },

      verifyMaxComplexityPerFunction: function() {
        var max = state.option.maxcomplexity;
        var cc = this.ComplexityCount;
        if (max && cc > max) {
          warning("W074", functionStartToken, cc);
        }
      }
    };
  }

  function increaseComplexityCount() {
    state.funct["(metrics)"].ComplexityCount += 1;
  }

  function checkCondAssignment(expr) {
    var id, paren;
    if (expr) {
      id = expr.id;
      paren = expr.paren;
      if (id === "," && (expr = expr.exprs[expr.exprs.length - 1])) {
        id = expr.id;
        paren = paren || expr.paren;
      }
    }
    switch (id) {
    case "=":
    case "+=":
    case "-=":
    case "*=":
    case "%=":
    case "&=":
    case "|=":
    case "^=":
    case "/=":
      if (!paren && !state.option.boss) {
        warning("W084");
      }
    }
  }
  function checkProperties(props) {
    if (state.inES5()) {
      for (var name in props) {
        if (props[name] && props[name].setterToken && !props[name].getterToken) {
          warning("W078", props[name].setterToken);
        }
      }
    }
  }

  function metaProperty(name, c) {
    if (checkPunctuator(state.tokens.next, ".")) {
      var left = state.tokens.curr.id;
      advance(".");
      var id = identifier();
      state.tokens.curr.isMetaProperty = true;
      if (name !== id) {
        error("E057", state.tokens.prev, left, id);
      } else {
        c();
      }
      return state.tokens.curr;
    }
  }

  (function(x) {
    x.nud = function() {
      var b, f, i, p, t, isGeneratorMethod = false, nextVal;
      var props = Object.create(null); // All properties, including accessors

      b = state.tokens.curr.line !== startLine(state.tokens.next);
      if (b) {
        indent += state.option.indent;
        if (state.tokens.next.from === indent + state.option.indent) {
          indent += state.option.indent;
        }
      }

      var blocktype = lookupBlockType();
      if (blocktype.isDestAssign) {
        this.destructAssign = destructuringPattern({ openingParsed: true, assignment: true });
        return this;
      }

      for (;;) {
        if (state.tokens.next.id === "}") {
          break;
        }

        nextVal = state.tokens.next.value;
        if (state.tokens.next.identifier &&
            (peekIgnoreEOL().id === "," || peekIgnoreEOL().id === "}")) {
          if (!state.inES6()) {
            warning("W104", state.tokens.next, "object short notation", "6");
          }
          i = propertyName(true);
          saveProperty(props, i, state.tokens.next);

          expression(10);

        } else if (peek().id !== ":" && (nextVal === "get" || nextVal === "set")) {
          advance(nextVal);

          if (!state.inES5()) {
            error("E034");
          }

          i = propertyName();
          if (!i && !state.inES6()) {
            error("E035");
          }
          if (i) {
            saveAccessor(nextVal, props, i, state.tokens.curr);
          }

          t = state.tokens.next;
          f = doFunction();
          p = f["(params)"];
          if (nextVal === "get" && i && p) {
            warning("W076", t, p[0], i);
          } else if (nextVal === "set" && i && (!p || p.length !== 1)) {
            warning("W077", t, i);
          }
        } else {
          if (state.tokens.next.value === "*" && state.tokens.next.type === "(punctuator)") {
            if (!state.inES6()) {
              warning("W104", state.tokens.next, "generator functions", "6");
            }
            advance("*");
            isGeneratorMethod = true;
          } else {
            isGeneratorMethod = false;
          }

          if (state.tokens.next.id === "[") {
            i = computedPropertyName();
            state.nameStack.set(i);
          } else {
            state.nameStack.set(state.tokens.next);
            i = propertyName();
            saveProperty(props, i, state.tokens.next);

            if (typeof i !== "string") {
              break;
            }
          }

          if (state.tokens.next.value === "(") {
            if (!state.inES6()) {
              warning("W104", state.tokens.curr, "concise methods", "6");
            }
            doFunction({ type: isGeneratorMethod ? "generator" : null });
          } else {
            advance(":");
            expression(10);
          }
        }

        countMember(i);

        if (state.tokens.next.id === ",") {
          comma({ allowTrailing: true, property: true });
          if (state.tokens.next.id === ",") {
            warning("W070", state.tokens.curr);
          } else if (state.tokens.next.id === "}" && !state.inES5()) {
            warning("W070", state.tokens.curr);
          }
        } else {
          break;
        }
      }
      if (b) {
        indent -= state.option.indent;
      }
      advance("}", this);

      checkProperties(props);

      return this;
    };
    x.fud = function() {
      error("E036", state.tokens.curr);
    };
  }(delim("{")));

  function destructuringPattern(options) {
    var isAssignment = options && options.assignment;

    if (!state.inES6()) {
      warning("W104", state.tokens.curr,
        isAssignment ? "destructuring assignment" : "destructuring binding", "6");
    }

    return destructuringPatternRecursive(options);
  }

  function destructuringPatternRecursive(options) {
    var ids;
    var identifiers = [];
    var openingParsed = options && options.openingParsed;
    var isAssignment = options && options.assignment;
    var recursiveOptions = isAssignment ? { assignment: isAssignment } : null;
    var firstToken = openingParsed ? state.tokens.curr : state.tokens.next;

    var nextInnerDE = function() {
      var ident;
      if (checkPunctuators(state.tokens.next, ["[", "{"])) {
        ids = destructuringPatternRecursive(recursiveOptions);
        for (var id in ids) {
          id = ids[id];
          identifiers.push({ id: id.id, token: id.token });
        }
      } else if (checkPunctuator(state.tokens.next, ",")) {
        identifiers.push({ id: null, token: state.tokens.curr });
      } else if (checkPunctuator(state.tokens.next, "(")) {
        advance("(");
        nextInnerDE();
        advance(")");
      } else {
        var is_rest = checkPunctuator(state.tokens.next, "...");

        if (isAssignment) {
          var identifierToken = is_rest ? peek(0) : state.tokens.next;
          if (!identifierToken.identifier) {
            warning("E030", identifierToken, identifierToken.value);
          }
          var assignTarget = expression(155);
          if (assignTarget) {
            checkLeftSideAssign(assignTarget);
            if (assignTarget.identifier) {
              ident = assignTarget.value;
            }
          }
        } else {
          ident = identifier();
        }
        if (ident) {
          identifiers.push({ id: ident, token: state.tokens.curr });
        }
        return is_rest;
      }
      return false;
    };
    var assignmentProperty = function() {
      var id;
      if (checkPunctuator(state.tokens.next, "[")) {
        advance("[");
        expression(10);
        advance("]");
        advance(":");
        nextInnerDE();
      } else if (state.tokens.next.id === "(string)" ||
                 state.tokens.next.id === "(number)") {
        advance();
        advance(":");
        nextInnerDE();
      } else {
        id = identifier();
        if (checkPunctuator(state.tokens.next, ":")) {
          advance(":");
          nextInnerDE();
        } else if (id) {
          if (isAssignment) {
            checkLeftSideAssign(state.tokens.curr);
          }
          identifiers.push({ id: id, token: state.tokens.curr });
        }
      }
    };
    if (checkPunctuator(firstToken, "[")) {
      if (!openingParsed) {
        advance("[");
      }
      if (checkPunctuator(state.tokens.next, "]")) {
        warning("W137", state.tokens.curr);
      }
      var element_after_rest = false;
      while (!checkPunctuator(state.tokens.next, "]")) {
        if (nextInnerDE() && !element_after_rest &&
            checkPunctuator(state.tokens.next, ",")) {
          warning("W130", state.tokens.next);
          element_after_rest = true;
        }
        if (checkPunctuator(state.tokens.next, "=")) {
          if (checkPunctuator(state.tokens.prev, "...")) {
            advance("]");
          } else {
            advance("=");
          }
          if (state.tokens.next.id === "undefined") {
            warning("W080", state.tokens.prev, state.tokens.prev.value);
          }
          expression(10);
        }
        if (!checkPunctuator(state.tokens.next, "]")) {
          advance(",");
        }
      }
      advance("]");
    } else if (checkPunctuator(firstToken, "{")) {

      if (!openingParsed) {
        advance("{");
      }
      if (checkPunctuator(state.tokens.next, "}")) {
        warning("W137", state.tokens.curr);
      }
      while (!checkPunctuator(state.tokens.next, "}")) {
        assignmentProperty();
        if (checkPunctuator(state.tokens.next, "=")) {
          advance("=");
          if (state.tokens.next.id === "undefined") {
            warning("W080", state.tokens.prev, state.tokens.prev.value);
          }
          expression(10);
        }
        if (!checkPunctuator(state.tokens.next, "}")) {
          advance(",");
          if (checkPunctuator(state.tokens.next, "}")) {
            break;
          }
        }
      }
      advance("}");
    }
    return identifiers;
  }

  function destructuringPatternMatch(tokens, value) {
    var first = value.first;

    if (!first)
      return;

    _.zip(tokens, Array.isArray(first) ? first : [ first ]).forEach(function(val) {
      var token = val[0];
      var value = val[1];

      if (token && value)
        token.first = value;
      else if (token && token.first && !value)
        warning("W080", token.first, token.first.value);
    });
  }

  function blockVariableStatement(type, statement, context) {

    var prefix = context && context.prefix;
    var inexport = context && context.inexport;
    var isLet = type === "let";
    var isConst = type === "const";
    var tokens, lone, value, letblock;

    if (!state.inES6()) {
      warning("W104", state.tokens.curr, type, "6");
    }

    if (isLet && state.tokens.next.value === "(") {
      if (!state.inMoz()) {
        warning("W118", state.tokens.next, "let block");
      }
      advance("(");
      state.funct["(scope)"].stack();
      letblock = true;
    } else if (state.funct["(noblockscopedvar)"]) {
      error("E048", state.tokens.curr, isConst ? "Const" : "Let");
    }

    statement.first = [];
    for (;;) {
      var names = [];
      if (_.contains(["{", "["], state.tokens.next.value)) {
        tokens = destructuringPattern();
        lone = false;
      } else {
        tokens = [ { id: identifier(), token: state.tokens.curr } ];
        lone = true;
      }

      if (!prefix && isConst && state.tokens.next.id !== "=") {
        warning("E012", state.tokens.curr, state.tokens.curr.value);
      }

      for (var t in tokens) {
        if (tokens.hasOwnProperty(t)) {
          t = tokens[t];
          if (state.funct["(scope)"].block.isGlobal()) {
            if (predefined[t.id] === false) {
              warning("W079", t.token, t.id);
            }
          }
          if (t.id && !state.funct["(noblockscopedvar)"]) {
            state.funct["(scope)"].addlabel(t.id, {
              type: type,
              token: t.token });
            names.push(t.token);

            if (lone && inexport) {
              state.funct["(scope)"].setExported(t.token.value, t.token);
            }
          }
        }
      }

      if (state.tokens.next.id === "=") {
        advance("=");
        if (!prefix && state.tokens.next.id === "undefined") {
          warning("W080", state.tokens.prev, state.tokens.prev.value);
        }
        if (!prefix && peek(0).id === "=" && state.tokens.next.identifier) {
          warning("W120", state.tokens.next, state.tokens.next.value);
        }
        value = expression(prefix ? 120 : 10);
        if (lone) {
          tokens[0].first = value;
        } else {
          destructuringPatternMatch(names, value);
        }
      }

      statement.first = statement.first.concat(names);

      if (state.tokens.next.id !== ",") {
        break;
      }
      comma();
    }
    if (letblock) {
      advance(")");
      block(true, true);
      statement.block = true;
      state.funct["(scope)"].unstack();
    }

    return statement;
  }

  var conststatement = stmt("const", function(context) {
    return blockVariableStatement("const", this, context);
  });
  conststatement.exps = true;

  var letstatement = stmt("let", function(context) {
    return blockVariableStatement("let", this, context);
  });
  letstatement.exps = true;

  var varstatement = stmt("var", function(context) {
    var prefix = context && context.prefix;
    var inexport = context && context.inexport;
    var tokens, lone, value;
    var implied = context && context.implied;
    var report = !(context && context.ignore);

    this.first = [];
    for (;;) {
      var names = [];
      if (_.contains(["{", "["], state.tokens.next.value)) {
        tokens = destructuringPattern();
        lone = false;
      } else {
        tokens = [ { id: identifier(), token: state.tokens.curr } ];
        lone = true;
      }

      if (!(prefix && implied) && report && state.option.varstmt) {
        warning("W132", this);
      }

      this.first = this.first.concat(names);

      for (var t in tokens) {
        if (tokens.hasOwnProperty(t)) {
          t = tokens[t];
          if (!implied && state.funct["(global)"]) {
            if (predefined[t.id] === false) {
              warning("W079", t.token, t.id);
            } else if (state.option.futurehostile === false) {
              if ((!state.inES5() && vars.ecmaIdentifiers[5][t.id] === false) ||
                (!state.inES6() && vars.ecmaIdentifiers[6][t.id] === false)) {
                warning("W129", t.token, t.id);
              }
            }
          }
          if (t.id) {
            if (implied === "for") {

              if (!state.funct["(scope)"].has(t.id)) {
                if (report) warning("W088", t.token, t.id);
              }
              state.funct["(scope)"].block.use(t.id, t.token);
            } else {
              state.funct["(scope)"].addlabel(t.id, {
                type: "var",
                token: t.token });

              if (lone && inexport) {
                state.funct["(scope)"].setExported(t.id, t.token);
              }
            }
            names.push(t.token);
          }
        }
      }

      if (state.tokens.next.id === "=") {
        state.nameStack.set(state.tokens.curr);

        advance("=");
        if (!prefix && report && !state.funct["(loopage)"] &&
          state.tokens.next.id === "undefined") {
          warning("W080", state.tokens.prev, state.tokens.prev.value);
        }
        if (peek(0).id === "=" && state.tokens.next.identifier) {
          if (!prefix && report &&
              !state.funct["(params)"] ||
              state.funct["(params)"].indexOf(state.tokens.next.value) === -1) {
            warning("W120", state.tokens.next, state.tokens.next.value);
          }
        }
        value = expression(prefix ? 120 : 10);
        if (lone) {
          tokens[0].first = value;
        } else {
          destructuringPatternMatch(names, value);
        }
      }

      if (state.tokens.next.id !== ",") {
        break;
      }
      comma();
    }

    return this;
  });
  varstatement.exps = true;

  blockstmt("class", function() {
    return classdef.call(this, true);
  });

  function classdef(isStatement) {
    if (!state.inES6()) {
      warning("W104", state.tokens.curr, "class", "6");
    }
    if (isStatement) {
      this.name = identifier();

      state.funct["(scope)"].addlabel(this.name, {
        type: "class",
        token: state.tokens.curr });
    } else if (state.tokens.next.identifier && state.tokens.next.value !== "extends") {
      this.name = identifier();
      this.namedExpr = true;
    } else {
      this.name = state.nameStack.infer();
    }
    classtail(this);
    return this;
  }

  function classtail(c) {
    var wasInClassBody = state.inClassBody;
    if (state.tokens.next.value === "extends") {
      advance("extends");
      c.heritage = expression(10);
    }

    state.inClassBody = true;
    advance("{");
    c.body = classbody(c);
    advance("}");
    state.inClassBody = wasInClassBody;
  }

  function classbody(c) {
    var name;
    var isStatic;
    var isGenerator;
    var getset;
    var props = Object.create(null);
    var staticProps = Object.create(null);
    var computed;
    for (var i = 0; state.tokens.next.id !== "}"; ++i) {
      name = state.tokens.next;
      isStatic = false;
      isGenerator = false;
      getset = null;
      if (name.id === ";") {
        warning("W032");
        advance(";");
        continue;
      }

      if (name.id === "*") {
        isGenerator = true;
        advance("*");
        name = state.tokens.next;
      }
      if (name.id === "[") {
        name = computedPropertyName();
        computed = true;
      } else if (isPropertyName(name)) {
        advance();
        computed = false;
        if (name.identifier && name.value === "static") {
          if (checkPunctuator(state.tokens.next, "*")) {
            isGenerator = true;
            advance("*");
          }
          if (isPropertyName(state.tokens.next) || state.tokens.next.id === "[") {
            computed = state.tokens.next.id === "[";
            isStatic = true;
            name = state.tokens.next;
            if (state.tokens.next.id === "[") {
              name = computedPropertyName();
            } else advance();
          }
        }

        if (name.identifier && (name.value === "get" || name.value === "set")) {
          if (isPropertyName(state.tokens.next) || state.tokens.next.id === "[") {
            computed = state.tokens.next.id === "[";
            getset = name;
            name = state.tokens.next;
            if (state.tokens.next.id === "[") {
              name = computedPropertyName();
            } else advance();
          }
        }
      } else {
        warning("W052", state.tokens.next, state.tokens.next.value || state.tokens.next.type);
        advance();
        continue;
      }

      if (!checkPunctuator(state.tokens.next, "(")) {
        error("E054", state.tokens.next, state.tokens.next.value);
        while (state.tokens.next.id !== "}" &&
               !checkPunctuator(state.tokens.next, "(")) {
          advance();
        }
        if (state.tokens.next.value !== "(") {
          doFunction({ statement: c });
        }
      }

      if (!computed) {
        if (getset) {
          saveAccessor(
            getset.value, isStatic ? staticProps : props, name.value, name, true, isStatic);
        } else {
          if (name.value === "constructor") {
            state.nameStack.set(c);
          } else {
            state.nameStack.set(name);
          }
          saveProperty(isStatic ? staticProps : props, name.value, name, true, isStatic);
        }
      }

      if (getset && name.value === "constructor") {
        var propDesc = getset.value === "get" ? "class getter method" : "class setter method";
        error("E049", name, propDesc, "constructor");
      } else if (name.value === "prototype") {
        error("E049", name, "class method", "prototype");
      }

      propertyName(name);

      doFunction({
        statement: c,
        type: isGenerator ? "generator" : null,
        classExprBinding: c.namedExpr ? c.name : null
      });
    }

    checkProperties(props);
  }

  blockstmt("function", function(context) {
    var inexport = context && context.inexport;
    var generator = false;
    if (state.tokens.next.value === "*") {
      advance("*");
      if (state.inES6({ strict: true })) {
        generator = true;
      } else {
        warning("W119", state.tokens.curr, "function*", "6");
      }
    }
    if (inblock) {
      warning("W082", state.tokens.curr);
    }
    var i = optionalidentifier();

    state.funct["(scope)"].addlabel(i, {
      type: "function",
      token: state.tokens.curr });

    if (i === undefined) {
      warning("W025");
    } else if (inexport) {
      state.funct["(scope)"].setExported(i, state.tokens.prev);
    }

    doFunction({
      name: i,
      statement: this,
      type: generator ? "generator" : null,
      ignoreLoopFunc: inblock // a declaration may already have warned
    });
    if (state.tokens.next.id === "(" && state.tokens.next.line === state.tokens.curr.line) {
      error("E039");
    }
    return this;
  });

  prefix("function", function() {
    var generator = false;

    if (state.tokens.next.value === "*") {
      if (!state.inES6()) {
        warning("W119", state.tokens.curr, "function*", "6");
      }
      advance("*");
      generator = true;
    }

    var i = optionalidentifier();
    doFunction({ name: i, type: generator ? "generator" : null });
    return this;
  });

  blockstmt("if", function() {
    var t = state.tokens.next;
    increaseComplexityCount();
    state.condition = true;
    advance("(");
    var expr = expression(0);
    checkCondAssignment(expr);
    var forinifcheck = null;
    if (state.option.forin && state.forinifcheckneeded) {
      state.forinifcheckneeded = false; // We only need to analyze the first if inside the loop
      forinifcheck = state.forinifchecks[state.forinifchecks.length - 1];
      if (expr.type === "(punctuator)" && expr.value === "!") {
        forinifcheck.type = "(negative)";
      } else {
        forinifcheck.type = "(positive)";
      }
    }

    advance(")", t);
    state.condition = false;
    var s = block(true, true);
    if (forinifcheck && forinifcheck.type === "(negative)") {
      if (s && s[0] && s[0].type === "(identifier)" && s[0].value === "continue") {
        forinifcheck.type = "(negative-with-continue)";
      }
    }

    if (state.tokens.next.id === "else") {
      advance("else");
      if (state.tokens.next.id === "if" || state.tokens.next.id === "switch") {
        statement();
      } else {
        block(true, true);
      }
    }
    return this;
  });

  blockstmt("try", function() {
    var b;

    function doCatch() {
      advance("catch");
      advance("(");

      state.funct["(scope)"].stack("catchparams");

      if (checkPunctuators(state.tokens.next, ["[", "{"])) {
        var tokens = destructuringPattern();
        _.each(tokens, function(token) {
          if (token.id) {
            state.funct["(scope)"].addParam(token.id, token, "exception");
          }
        });
      } else if (state.tokens.next.type !== "(identifier)") {
        warning("E030", state.tokens.next, state.tokens.next.value);
      } else {
        state.funct["(scope)"].addParam(identifier(), state.tokens.curr, "exception");
      }

      if (state.tokens.next.value === "if") {
        if (!state.inMoz()) {
          warning("W118", state.tokens.curr, "catch filter");
        }
        advance("if");
        expression(0);
      }

      advance(")");

      block(false);

      state.funct["(scope)"].unstack();
    }

    block(true);

    while (state.tokens.next.id === "catch") {
      increaseComplexityCount();
      if (b && (!state.inMoz())) {
        warning("W118", state.tokens.next, "multiple catch blocks");
      }
      doCatch();
      b = true;
    }

    if (state.tokens.next.id === "finally") {
      advance("finally");
      block(true);
      return;
    }

    if (!b) {
      error("E021", state.tokens.next, "catch", state.tokens.next.value);
    }

    return this;
  });

  blockstmt("while", function() {
    var t = state.tokens.next;
    state.funct["(breakage)"] += 1;
    state.funct["(loopage)"] += 1;
    increaseComplexityCount();
    advance("(");
    checkCondAssignment(expression(0));
    advance(")", t);
    block(true, true);
    state.funct["(breakage)"] -= 1;
    state.funct["(loopage)"] -= 1;
    return this;
  }).labelled = true;

  blockstmt("with", function() {
    var t = state.tokens.next;
    if (state.isStrict()) {
      error("E010", state.tokens.curr);
    } else if (!state.option.withstmt) {
      warning("W085", state.tokens.curr);
    }

    advance("(");
    expression(0);
    advance(")", t);
    block(true, true);

    return this;
  });

  blockstmt("switch", function() {
    var t = state.tokens.next;
    var g = false;
    var noindent = false;

    state.funct["(breakage)"] += 1;
    advance("(");
    checkCondAssignment(expression(0));
    advance(")", t);
    t = state.tokens.next;
    advance("{");

    if (state.tokens.next.from === indent)
      noindent = true;

    if (!noindent)
      indent += state.option.indent;

    this.cases = [];

    for (;;) {
      switch (state.tokens.next.id) {
      case "case":
        switch (state.funct["(verb)"]) {
        case "yield":
        case "break":
        case "case":
        case "continue":
        case "return":
        case "switch":
        case "throw":
          break;
        default:
          if (!state.tokens.curr.caseFallsThrough) {
            warning("W086", state.tokens.curr, "case");
          }
        }

        advance("case");
        this.cases.push(expression(0));
        increaseComplexityCount();
        g = true;
        advance(":");
        state.funct["(verb)"] = "case";
        break;
      case "default":
        switch (state.funct["(verb)"]) {
        case "yield":
        case "break":
        case "continue":
        case "return":
        case "throw":
          break;
        default:
          if (this.cases.length) {
            if (!state.tokens.curr.caseFallsThrough) {
              warning("W086", state.tokens.curr, "default");
            }
          }
        }

        advance("default");
        g = true;
        advance(":");
        break;
      case "}":
        if (!noindent)
          indent -= state.option.indent;

        advance("}", t);
        state.funct["(breakage)"] -= 1;
        state.funct["(verb)"] = undefined;
        return;
      case "(end)":
        error("E023", state.tokens.next, "}");
        return;
      default:
        indent += state.option.indent;
        if (g) {
          switch (state.tokens.curr.id) {
          case ",":
            error("E040");
            return;
          case ":":
            g = false;
            statements();
            break;
          default:
            error("E025", state.tokens.curr);
            return;
          }
        } else {
          if (state.tokens.curr.id === ":") {
            advance(":");
            error("E024", state.tokens.curr, ":");
            statements();
          } else {
            error("E021", state.tokens.next, "case", state.tokens.next.value);
            return;
          }
        }
        indent -= state.option.indent;
      }
    }
    return this;
  }).labelled = true;

  stmt("debugger", function() {
    if (!state.option.debug) {
      warning("W087", this);
    }
    return this;
  }).exps = true;

  (function() {
    var x = stmt("do", function() {
      state.funct["(breakage)"] += 1;
      state.funct["(loopage)"] += 1;
      increaseComplexityCount();

      this.first = block(true, true);
      advance("while");
      var t = state.tokens.next;
      advance("(");
      checkCondAssignment(expression(0));
      advance(")", t);
      state.funct["(breakage)"] -= 1;
      state.funct["(loopage)"] -= 1;
      return this;
    });
    x.labelled = true;
    x.exps = true;
  }());

  blockstmt("for", function() {
    var s, t = state.tokens.next;
    var letscope = false;
    var foreachtok = null;

    if (t.value === "each") {
      foreachtok = t;
      advance("each");
      if (!state.inMoz()) {
        warning("W118", state.tokens.curr, "for each");
      }
    }

    increaseComplexityCount();
    advance("(");
    var nextop; // contains the token of the "in" or "of" operator
    var i = 0;
    var inof = ["in", "of"];
    var level = 0; // BindingPattern "level" --- level 0 === no BindingPattern
    var comma; // First comma punctuator at level 0
    var initializer; // First initializer at level 0
    if (checkPunctuators(state.tokens.next, ["{", "["])) ++level;
    do {
      nextop = peek(i);
      ++i;
      if (checkPunctuators(nextop, ["{", "["])) ++level;
      else if (checkPunctuators(nextop, ["}", "]"])) --level;
      if (level < 0) break;
      if (level === 0) {
        if (!comma && checkPunctuator(nextop, ",")) comma = nextop;
        else if (!initializer && checkPunctuator(nextop, "=")) initializer = nextop;
      }
    } while (level > 0 || !_.contains(inof, nextop.value) && nextop.value !== ";" &&
    nextop.type !== "(end)"); // Is this a JSCS bug? This looks really weird.
    if (_.contains(inof, nextop.value)) {
      if (!state.inES6() && nextop.value === "of") {
        warning("W104", nextop, "for of", "6");
      }

      var ok = !(initializer || comma);
      if (initializer) {
        error("W133", comma, nextop.value, "initializer is forbidden");
      }

      if (comma) {
        error("W133", comma, nextop.value, "more than one ForBinding");
      }

      if (state.tokens.next.id === "var") {
        advance("var");
        state.tokens.curr.fud({ prefix: true });
      } else if (state.tokens.next.id === "let" || state.tokens.next.id === "const") {
        advance(state.tokens.next.id);
        letscope = true;
        state.funct["(scope)"].stack();
        state.tokens.curr.fud({ prefix: true });
      } else {
        Object.create(varstatement).fud({ prefix: true, implied: "for", ignore: !ok });
      }
      advance(nextop.value);
      expression(20);
      advance(")", t);

      if (nextop.value === "in" && state.option.forin) {
        state.forinifcheckneeded = true;

        if (state.forinifchecks === undefined) {
          state.forinifchecks = [];
        }
        state.forinifchecks.push({
          type: "(none)"
        });
      }

      state.funct["(breakage)"] += 1;
      state.funct["(loopage)"] += 1;

      s = block(true, true);

      if (nextop.value === "in" && state.option.forin) {
        if (state.forinifchecks && state.forinifchecks.length > 0) {
          var check = state.forinifchecks.pop();

          if (// No if statement or not the first statement in loop body
              s && s.length > 0 && (typeof s[0] !== "object" || s[0].value !== "if") ||
              check.type === "(positive)" && s.length > 1 ||
              check.type === "(negative)") {
            warning("W089", this);
          }
        }
        state.forinifcheckneeded = false;
      }

      state.funct["(breakage)"] -= 1;
      state.funct["(loopage)"] -= 1;
    } else {
      if (foreachtok) {
        error("E045", foreachtok);
      }
      if (state.tokens.next.id !== ";") {
        if (state.tokens.next.id === "var") {
          advance("var");
          state.tokens.curr.fud();
        } else if (state.tokens.next.id === "let") {
          advance("let");
          letscope = true;
          state.funct["(scope)"].stack();
          state.tokens.curr.fud();
        } else {
          for (;;) {
            expression(0, "for");
            if (state.tokens.next.id !== ",") {
              break;
            }
            comma();
          }
        }
      }
      nolinebreak(state.tokens.curr);
      advance(";");
      state.funct["(loopage)"] += 1;
      if (state.tokens.next.id !== ";") {
        checkCondAssignment(expression(0));
      }
      nolinebreak(state.tokens.curr);
      advance(";");
      if (state.tokens.next.id === ";") {
        error("E021", state.tokens.next, ")", ";");
      }
      if (state.tokens.next.id !== ")") {
        for (;;) {
          expression(0, "for");
          if (state.tokens.next.id !== ",") {
            break;
          }
          comma();
        }
      }
      advance(")", t);
      state.funct["(breakage)"] += 1;
      block(true, true);
      state.funct["(breakage)"] -= 1;
      state.funct["(loopage)"] -= 1;

    }
    if (letscope) {
      state.funct["(scope)"].unstack();
    }
    return this;
  }).labelled = true;


  stmt("break", function() {
    var v = state.tokens.next.value;

    if (!state.option.asi)
      nolinebreak(this);

    if (state.tokens.next.id !== ";" && !state.tokens.next.reach &&
        state.tokens.curr.line === startLine(state.tokens.next)) {
      if (!state.funct["(scope)"].funct.hasBreakLabel(v)) {
        warning("W090", state.tokens.next, v);
      }
      this.first = state.tokens.next;
      advance();
    } else {
      if (state.funct["(breakage)"] === 0)
        warning("W052", state.tokens.next, this.value);
    }

    reachable(this);

    return this;
  }).exps = true;


  stmt("continue", function() {
    var v = state.tokens.next.value;

    if (state.funct["(breakage)"] === 0)
      warning("W052", state.tokens.next, this.value);
    if (!state.funct["(loopage)"])
      warning("W052", state.tokens.next, this.value);

    if (!state.option.asi)
      nolinebreak(this);

    if (state.tokens.next.id !== ";" && !state.tokens.next.reach) {
      if (state.tokens.curr.line === startLine(state.tokens.next)) {
        if (!state.funct["(scope)"].funct.hasBreakLabel(v)) {
          warning("W090", state.tokens.next, v);
        }
        this.first = state.tokens.next;
        advance();
      }
    }

    reachable(this);

    return this;
  }).exps = true;


  stmt("return", function() {
    if (this.line === startLine(state.tokens.next)) {
      if (state.tokens.next.id !== ";" && !state.tokens.next.reach) {
        this.first = expression(0);

        if (this.first &&
            this.first.type === "(punctuator)" && this.first.value === "=" &&
            !this.first.paren && !state.option.boss) {
          warningAt("W093", this.first.line, this.first.character);
        }
      }
    } else {
      if (state.tokens.next.type === "(punctuator)" &&
        ["[", "{", "+", "-"].indexOf(state.tokens.next.value) > -1) {
        nolinebreak(this); // always warn (Line breaking error)
      }
    }

    reachable(this);

    return this;
  }).exps = true;

  (function(x) {
    x.exps = true;
    x.lbp = 25;
  }(prefix("yield", function() {
    var prev = state.tokens.prev;
    if (state.inES6(true) && !state.funct["(generator)"]) {
      if (!("(catch)" === state.funct["(name)"] && state.funct["(context)"]["(generator)"])) {
        error("E046", state.tokens.curr, "yield");
      }
    } else if (!state.inES6()) {
      warning("W104", state.tokens.curr, "yield", "6");
    }
    state.funct["(generator)"] = "yielded";
    var delegatingYield = false;

    if (state.tokens.next.value === "*") {
      delegatingYield = true;
      advance("*");
    }

    if (this.line === startLine(state.tokens.next) || !state.inMoz()) {
      if (delegatingYield ||
          (state.tokens.next.id !== ";" && !state.option.asi &&
           !state.tokens.next.reach && state.tokens.next.nud)) {

        nobreaknonadjacent(state.tokens.curr, state.tokens.next);
        this.first = expression(10);

        if (this.first.type === "(punctuator)" && this.first.value === "=" &&
            !this.first.paren && !state.option.boss) {
          warningAt("W093", this.first.line, this.first.character);
        }
      }

      if (state.inMoz() && state.tokens.next.id !== ")" &&
          (prev.lbp > 30 || (!prev.assign && !isEndOfExpr()) || prev.id === "yield")) {
        error("E050", this);
      }
    } else if (!state.option.asi) {
      nolinebreak(this); // always warn (Line breaking error)
    }
    return this;
  })));


  stmt("throw", function() {
    nolinebreak(this);
    this.first = expression(20);

    reachable(this);

    return this;
  }).exps = true;

  stmt("import", function() {
    if (!state.inES6()) {
      warning("W119", state.tokens.curr, "import", "6");
    }

    if (state.tokens.next.type === "(string)") {
      advance("(string)");
      return this;
    }

    if (state.tokens.next.identifier) {
      this.name = identifier();
      state.funct["(scope)"].addlabel(this.name, {
        type: "const",
        token: state.tokens.curr });

      if (state.tokens.next.value === ",") {
        advance(",");
      } else {
        advance("from");
        advance("(string)");
        return this;
      }
    }

    if (state.tokens.next.id === "*") {
      advance("*");
      advance("as");
      if (state.tokens.next.identifier) {
        this.name = identifier();
        state.funct["(scope)"].addlabel(this.name, {
          type: "const",
          token: state.tokens.curr });
      }
    } else {
      advance("{");
      for (;;) {
        if (state.tokens.next.value === "}") {
          advance("}");
          break;
        }
        var importName;
        if (state.tokens.next.type === "default") {
          importName = "default";
          advance("default");
        } else {
          importName = identifier();
        }
        if (state.tokens.next.value === "as") {
          advance("as");
          importName = identifier();
        }
        state.funct["(scope)"].addlabel(importName, {
          type: "const",
          token: state.tokens.curr });

        if (state.tokens.next.value === ",") {
          advance(",");
        } else if (state.tokens.next.value === "}") {
          advance("}");
          break;
        } else {
          error("E024", state.tokens.next, state.tokens.next.value);
          break;
        }
      }
    }
    advance("from");
    advance("(string)");
    return this;
  }).exps = true;

  stmt("export", function() {
    var ok = true;
    var token;
    var identifier;

    if (!state.inES6()) {
      warning("W119", state.tokens.curr, "export", "6");
      ok = false;
    }

    if (!state.funct["(scope)"].block.isGlobal()) {
      error("E053", state.tokens.curr);
      ok = false;
    }

    if (state.tokens.next.value === "*") {
      advance("*");
      advance("from");
      advance("(string)");
      return this;
    }

    if (state.tokens.next.type === "default") {
      state.nameStack.set(state.tokens.next);
      advance("default");
      var exportType = state.tokens.next.id;
      if (exportType === "function" || exportType === "class") {
        this.block = true;
      }

      token = peek();

      expression(10);

      identifier = token.value;

      if (this.block) {
        state.funct["(scope)"].addlabel(identifier, {
          type: exportType,
          token: token });

        state.funct["(scope)"].setExported(identifier, token);
      }

      return this;
    }

    if (state.tokens.next.value === "{") {
      advance("{");
      var exportedTokens = [];
      for (;;) {
        if (!state.tokens.next.identifier) {
          error("E030", state.tokens.next, state.tokens.next.value);
        }
        advance();

        exportedTokens.push(state.tokens.curr);

        if (state.tokens.next.value === "as") {
          advance("as");
          if (!state.tokens.next.identifier) {
            error("E030", state.tokens.next, state.tokens.next.value);
          }
          advance();
        }

        if (state.tokens.next.value === ",") {
          advance(",");
        } else if (state.tokens.next.value === "}") {
          advance("}");
          break;
        } else {
          error("E024", state.tokens.next, state.tokens.next.value);
          break;
        }
      }
      if (state.tokens.next.value === "from") {
        advance("from");
        advance("(string)");
      } else if (ok) {
        exportedTokens.forEach(function(token) {
          state.funct["(scope)"].setExported(token.value, token);
        });
      }
      return this;
    }

    if (state.tokens.next.id === "var") {
      advance("var");
      state.tokens.curr.fud({ inexport:true });
    } else if (state.tokens.next.id === "let") {
      advance("let");
      state.tokens.curr.fud({ inexport:true });
    } else if (state.tokens.next.id === "const") {
      advance("const");
      state.tokens.curr.fud({ inexport:true });
    } else if (state.tokens.next.id === "function") {
      this.block = true;
      advance("function");
      state.syntax["function"].fud({ inexport:true });
    } else if (state.tokens.next.id === "class") {
      this.block = true;
      advance("class");
      var classNameToken = state.tokens.next;
      state.syntax["class"].fud();
      state.funct["(scope)"].setExported(classNameToken.value, classNameToken);
    } else {
      error("E024", state.tokens.next, state.tokens.next.value);
    }

    return this;
  }).exps = true;

  FutureReservedWord("abstract");
  FutureReservedWord("boolean");
  FutureReservedWord("byte");
  FutureReservedWord("char");
  FutureReservedWord("class", { es5: true, nud: classdef });
  FutureReservedWord("double");
  FutureReservedWord("enum", { es5: true });
  FutureReservedWord("export", { es5: true });
  FutureReservedWord("extends", { es5: true });
  FutureReservedWord("final");
  FutureReservedWord("float");
  FutureReservedWord("goto");
  FutureReservedWord("implements", { es5: true, strictOnly: true });
  FutureReservedWord("import", { es5: true });
  FutureReservedWord("int");
  FutureReservedWord("interface", { es5: true, strictOnly: true });
  FutureReservedWord("long");
  FutureReservedWord("native");
  FutureReservedWord("package", { es5: true, strictOnly: true });
  FutureReservedWord("private", { es5: true, strictOnly: true });
  FutureReservedWord("protected", { es5: true, strictOnly: true });
  FutureReservedWord("public", { es5: true, strictOnly: true });
  FutureReservedWord("short");
  FutureReservedWord("static", { es5: true, strictOnly: true });
  FutureReservedWord("super", { es5: true });
  FutureReservedWord("synchronized");
  FutureReservedWord("transient");
  FutureReservedWord("volatile");

  var lookupBlockType = function() {
    var pn, pn1, prev;
    var i = -1;
    var bracketStack = 0;
    var ret = {};
    if (checkPunctuators(state.tokens.curr, ["[", "{"])) {
      bracketStack += 1;
    }
    do {
      prev = i === -1 ? state.tokens.curr : pn;
      pn = i === -1 ? state.tokens.next : peek(i);
      pn1 = peek(i + 1);
      i = i + 1;
      if (checkPunctuators(pn, ["[", "{"])) {
        bracketStack += 1;
      } else if (checkPunctuators(pn, ["]", "}"])) {
        bracketStack -= 1;
      }
      if (bracketStack === 1 && pn.identifier && pn.value === "for" &&
          !checkPunctuator(prev, ".")) {
        ret.isCompArray = true;
        ret.notJson = true;
        break;
      }
      if (bracketStack === 0 && checkPunctuators(pn, ["}", "]"])) {
        if (pn1.value === "=") {