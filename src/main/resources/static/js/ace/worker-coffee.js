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

define("ace/mode/coffee/coffee",[], function(require, exports, module) {
function define(f) { module.exports = f() }; define.amd = {};
var _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},_get=function e(a,t,o){null===a&&(a=Function.prototype);var n=Object.getOwnPropertyDescriptor(a,t);if(n===void 0){var r=Object.getPrototypeOf(a);return null===r?void 0:e(r,t,o)}if("value"in n)return n.value;var l=n.get;return void 0===l?void 0:l.call(o)},_slicedToArray=function(){function e(e,a){var t=[],o=!0,n=!1,r=void 0;try{for(var l=e[Symbol.iterator](),s;!(o=(s=l.next()).done)&&(t.push(s.value),!(a&&t.length===a));o=!0);}catch(e){n=!0,r=e}finally{try{!o&&l["return"]&&l["return"]()}finally{if(n)throw r}}return t}return function(a,t){if(Array.isArray(a))return a;if(Symbol.iterator in Object(a))return e(a,t);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),_createClass=function(){function e(e,a){for(var t=0,o;t<a.length;t++)o=a[t],o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}return function(a,t,o){return t&&e(a.prototype,t),o&&e(a,o),a}}();function _toArray(e){return Array.isArray(e)?e:Array.from(e)}function _possibleConstructorReturn(e,a){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return a&&("object"==typeof a||"function"==typeof a)?a:e}function _inherits(e,a){if("function"!=typeof a&&null!==a)throw new TypeError("Super expression must either be null or a function, not "+typeof a);e.prototype=Object.create(a&&a.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),a&&(Object.setPrototypeOf?Object.setPrototypeOf(e,a):e.__proto__=a)}function _classCallCheck(e,a){if(!(e instanceof a))throw new TypeError("Cannot call a class as a function")}function _toConsumableArray(e){if(Array.isArray(e)){for(var a=0,t=Array(e.length);a<e.length;a++)t[a]=e[a];return t}return Array.from(e)}(function(root){var CoffeeScript=function(){function require(e){return require[e]}var _Mathabs=Math.abs,_StringfromCharCode=String.fromCharCode,_Mathfloor=Math.floor;return require["../../package.json"]=function(){return{name:"coffeescript",description:"Unfancy JavaScript",keywords:["javascript","language","coffeescript","compiler"],author:"Jeremy Ashkenas",version:"2.2.1",license:"MIT",engines:{node:">=6"},directories:{lib:"./lib/coffeescript"},main:"./lib/coffeescript/index",browser:"./lib/coffeescript/browser",bin:{coffee:"./bin/coffee",cake:"./bin/cake"},files:["bin","lib","register.js","repl.js"],scripts:{test:"node ./bin/cake test","test-harmony":"node --harmony ./bin/cake test"},homepage:"http://coffeescript.org",bugs:"https://github.com/jashkenas/coffeescript/issues",repository:{type:"git",url:"git://github.com/jashkenas/coffeescript.git"},devDependencies:{"babel-core":"~6.26.0","babel-preset-babili":"~0.1.4","babel-preset-env":"~1.6.1","babel-preset-minify":"^0.3.0",codemirror:"^5.32.0",docco:"~0.8.0","highlight.js":"~9.12.0",jison:">=0.4.18","markdown-it":"~8.4.0",underscore:"~1.8.3",webpack:"~3.10.0"},dependencies:{}}}(),require["./helpers"]=function(){var e={};return function(){var a,t,o,n,r,l,s,i;e.starts=function(e,a,t){return a===e.substr(t,a.length)},e.ends=function(e,a,t){var o;return o=a.length,a===e.substr(e.length-o-(t||0),o)},e.repeat=s=function(e,a){var t;for(t="";0<a;)1&a&&(t+=e),a>>>=1,e+=e;return t},e.compact=function(e){var a,t,o,n;for(n=[],a=0,o=e.length;a<o;a++)t=e[a],t&&n.push(t);return n},e.count=function(e,a){var t,o;if(t=o=0,!a.length)return 1/0;for(;o=1+e.indexOf(a,o);)t++;return t},e.merge=function(e,a){return n(n({},e),a)},n=e.extend=function(e,a){var t,o;for(t in a)o=a[t],e[t]=o;return e},e.flatten=r=function flatten(e){var a,t,o,n;for(t=[],o=0,n=e.length;o<n;o++)a=e[o],"[object Array]"===Object.prototype.toString.call(a)?t=t.concat(r(a)):t.push(a);return t},e.del=function(e,a){var t;return t=e[a],delete e[a],t},e.some=null==(l=Array.prototype.some)?function(a){var t,e,o,n;for(n=this,e=0,o=n.length;e<o;e++)if(t=n[e],a(t))return!0;return!1}:l,e.invertLiterate=function(e){var a,t,o,n,r,l,s,i,d;for(i=[],a=/^\s*$/,o=/^[\t ]/,s=/^(?:\t?| {0,3})(?:[\*\-\+]|[0-9]{1,9}\.)[ \t]/,n=!1,d=e.split("\n"),t=0,r=d.length;t<r;t++)l=d[t],a.test(l)?(n=!1,i.push(l)):n||s.test(l)?(n=!0,i.push("# "+l)):!n&&o.test(l)?i.push(l):(n=!0,i.push("# "+l));return i.join("\n")},t=function(e,a){return a?{first_line:e.first_line,first_column:e.first_column,last_line:a.last_line,last_column:a.last_column}:e},o=function(e){return e.first_line+"x"+e.first_column+"-"+e.last_line+"x"+e.last_column},e.addDataToNode=function(e,n,r){return function(l){var s,i,d,c,p,u;if(null!=(null==l?void 0:l.updateLocationDataIfMissing)&&null!=n&&l.updateLocationDataIfMissing(t(n,r)),!e.tokenComments)for(e.tokenComments={},c=e.parser.tokens,s=0,i=c.length;s<i;s++)if(p=c[s],!!p.comments)if(u=o(p[2]),null==e.tokenComments[u])e.tokenComments[u]=p.comments;else{var m;(m=e.tokenComments[u]).push.apply(m,_toConsumableArray(p.comments))}return null!=l.locationData&&(d=o(l.locationData),null!=e.tokenComments[d]&&a(e.tokenComments[d],l)),l}},e.attachCommentsToNode=a=function(e,a){var t;if(null!=e&&0!==e.length)return null==a.comments&&(a.comments=[]),(t=a.comments).push.apply(t,_toConsumableArray(e))},e.locationDataToString=function(e){var a;return"2"in e&&"first_line"in e[2]?a=e[2]:"first_line"in e&&(a=e),a?a.first_line+1+":"+(a.first_column+1)+"-"+(a.last_line+1+":"+(a.last_column+1)):"No location data"},e.baseFileName=function(e){var a=!!(1<arguments.length&&void 0!==arguments[1])&&arguments[1],t=!!(2<arguments.length&&void 0!==arguments[2])&&arguments[2],o,n;return(n=t?/\\|\//:/\//,o=e.split(n),e=o[o.length-1],!(a&&0<=e.indexOf(".")))?e:(o=e.split("."),o.pop(),"coffee"===o[o.length-1]&&1<o.length&&o.pop(),o.join("."))},e.isCoffee=function(e){return/\.((lit)?coffee|coffee\.md)$/.test(e)},e.isLiterate=function(e){return/\.(litcoffee|coffee\.md)$/.test(e)},e.throwSyntaxError=function(e,a){var t;throw t=new SyntaxError(e),t.location=a,t.toString=i,t.stack=t.toString(),t},e.updateSyntaxError=function(e,a,t){return e.toString===i&&(e.code||(e.code=a),e.filename||(e.filename=t),e.stack=e.toString()),e},i=function(){var e,a,t,o,n,r,l,i,d,c,p,u,m,h;if(!(this.code&&this.location))return Error.prototype.toString.call(this);var g=this.location;return l=g.first_line,r=g.first_column,d=g.last_line,i=g.last_column,null==d&&(d=l),null==i&&(i=r),n=this.filename||"[stdin]",e=this.code.split("\n")[l],h=r,o=l===d?i+1:e.length,c=e.slice(0,h).replace(/[^\s]/g," ")+s("^",o-h),"undefined"!=typeof process&&null!==process&&(t=(null==(p=process.stdout)?void 0:p.isTTY)&&(null==(u=process.env)||!u.NODE_DISABLE_COLORS)),(null==(m=this.colorful)?t:m)&&(a=function(e){return"[1;31m"+e+"[0m"},e=e.slice(0,h)+a(e.slice(h,o))+e.slice(o),c=a(c)),n+":"+(l+1)+":"+(r+1)+": error: "+this.message+"\n"+e+"\n"+c},e.nameWhitespaceCharacter=function(e){return" "===e?"space":"\n"===e?"newline":"\r"===e?"carriage return":"\t"===e?"tab":e}}.call(this),{exports:e}.exports}(),require["./rewriter"]=function(){var e={};return function(){var a=[].indexOf,t=require("./helpers"),o,n,r,l,s,d,c,p,u,m,h,i,g,f,y,T,N,v,k,b,$,_,C;for(C=t.throwSyntaxError,$=function(e,a){var t,o,n,r,l;if(e.comments){if(a.comments&&0!==a.comments.length){for(l=[],r=e.comments,o=0,n=r.length;o<n;o++)t=r[o],t.unshift?l.push(t):a.comments.push(t);a.comments=l.concat(a.comments)}else a.comments=e.comments;return delete e.comments}},N=function(e,a,t,o){var n;return n=[e,a],n.generated=!0,t&&(n.origin=t),o&&$(o,n),n},e.Rewriter=f=function(){var e=function(){function e(){_classCallCheck(this,e)}return _createClass(e,[{key:"rewrite",value:function rewrite(e){var a,o,n;return this.tokens=e,("undefined"!=typeof process&&null!==process?null==(a=process.env)?void 0:a.DEBUG_TOKEN_STREAM:void 0)&&(process.env.DEBUG_REWRITTEN_TOKEN_STREAM&&console.log("Initial token stream:"),console.log(function(){var e,a,t,o;for(t=this.tokens,o=[],e=0,a=t.length;e<a;e++)n=t[e],o.push(n[0]+"/"+n[1]+(n.comments?"*":""));return o}.call(this).join(" "))),this.removeLeadingNewlines(),this.closeOpenCalls(),this.closeOpenIndexes(),this.normalizeLines(),this.tagPostfixConditionals(),this.addImplicitBracesAndParens(),this.addParensToChainedDoIife(),this.rescueStowawayComments(),this.addLocationDataToGeneratedTokens(),this.enforceValidCSXAttributes(),this.fixOutdentLocationData(),("undefined"!=typeof process&&null!==process?null==(o=process.env)?void 0:o.DEBUG_REWRITTEN_TOKEN_STREAM:void 0)&&(process.env.DEBUG_TOKEN_STREAM&&console.log("Rewritten token stream:"),console.log(function(){var e,a,t,o;for(t=this.tokens,o=[],e=0,a=t.length;e<a;e++)n=t[e],o.push(n[0]+"/"+n[1]+(n.comments?"*":""));return o}.call(this).join(" "))),this.tokens}},{key:"scanTokens",value:function scanTokens(e){var a,t,o;for(o=this.tokens,a=0;t=o[a];)a+=e.call(this,t,a,o);return!0}},{key:"detectEnd",value:function detectEnd(e,t,o){var n=3<arguments.length&&void 0!==arguments[3]?arguments[3]:{},r,l,s,i,p;for(p=this.tokens,r=0;i=p[e];){if(0===r&&t.call(this,i,e))return o.call(this,i,e);if((l=i[0],0<=a.call(c,l))?r+=1:(s=i[0],0<=a.call(d,s))&&(r-=1),0>r)return n.returnOnNegativeLevel?void 0:o.call(this,i,e);e+=1}return e-1}},{key:"removeLeadingNewlines",value:function removeLeadingNewlines(){var e,a,t,o,n,r,l,s,i;for(l=this.tokens,e=a=0,n=l.length;a<n;e=++a){var d=_slicedToArray(l[e],1);if(i=d[0],"TERMINATOR"!==i)break}if(0!==e){for(s=this.tokens.slice(0,e),t=0,r=s.length;t<r;t++)o=s[t],$(o,this.tokens[e]);return this.tokens.splice(0,e)}}},{key:"closeOpenCalls",value:function closeOpenCalls(){var e,a;return a=function(e){var a;return")"===(a=e[0])||"CALL_END"===a},e=function(e){return e[0]="CALL_END"},this.scanTokens(function(t,o){return"CALL_START"===t[0]&&this.detectEnd(o+1,a,e),1})}},{key:"closeOpenIndexes",value:function closeOpenIndexes(){var e,a;return a=function(e){var a;return"]"===(a=e[0])||"INDEX_END"===a},e=function(e){return e[0]="INDEX_END"},this.scanTokens(function(t,o){return"INDEX_START"===t[0]&&this.detectEnd(o+1,a,e),1})}},{key:"indexOfTag",value:function indexOfTag(e){var t,o,n,r,l;t=0;for(var s=arguments.length,i=Array(1<s?s-1:0),d=1;d<s;d++)i[d-1]=arguments[d];for(o=n=0,r=i.length;0<=r?0<=n&&n<r:0>=n&&n>r;o=0<=r?++n:--n)if(null!=i[o]&&("string"==typeof i[o]&&(i[o]=[i[o]]),l=this.tag(e+o+t),0>a.call(i[o],l)))return-1;return e+o+t-1}},{key:"looksObjectish",value:function looksObjectish(e){var t,o;return-1!==this.indexOfTag(e,"@",null,":")||-1!==this.indexOfTag(e,null,":")||(o=this.indexOfTag(e,c),!!(-1!==o&&(t=null,this.detectEnd(o+1,function(e){var t;return t=e[0],0<=a.call(d,t)},function(e,a){return t=a}),":"===this.tag(t+1))))}},{key:"findTagsBackwards",value:function findTagsBackwards(e,t){var o,n,r,l,s,i,p;for(o=[];0<=e&&(o.length||(l=this.tag(e),0>a.call(t,l))&&((s=this.tag(e),0>a.call(c,s))||this.tokens[e].generated)&&(i=this.tag(e),0>a.call(g,i)));)(n=this.tag(e),0<=a.call(d,n))&&o.push(this.tag(e)),(r=this.tag(e),0<=a.call(c,r))&&o.length&&o.pop(),e-=1;return p=this.tag(e),0<=a.call(t,p)}},{key:"addImplicitBracesAndParens",value:function addImplicitBracesAndParens(){var e,t;return e=[],t=null,this.scanTokens(function(o,l,f){var i=this,y=_slicedToArray(o,1),T,v,b,$,_,C,D,E,x,I,S,A,R,k,O,L,F,w,P,j,M,U,V,s,B,G,H,W,X,Y,q,z,J;J=y[0];var K=P=0<l?f[l-1]:[],Z=_slicedToArray(K,1);w=Z[0];var Q=L=l<f.length-1?f[l+1]:[],ee=_slicedToArray(Q,1);if(O=ee[0],W=function(){return e[e.length-1]},X=l,b=function(e){return l-X+e},I=function(e){var a;return null==e||null==(a=e[2])?void 0:a.ours},A=function(e){return I(e)&&"{"===(null==e?void 0:e[0])},S=function(e){return I(e)&&"("===(null==e?void 0:e[0])},C=function(){return I(W())},D=function(){return S(W())},x=function(){return A(W())},E=function(){var e;return C()&&"CONTROL"===(null==(e=W())?void 0:e[0])},Y=function(a){return e.push(["(",a,{ours:!0}]),f.splice(a,0,N("CALL_START","(",["","implicit function call",o[2]],P))},T=function(){return e.pop(),f.splice(l,0,N("CALL_END",")",["","end of input",o[2]],P)),l+=1},q=function(a){var t=!(1<arguments.length&&void 0!==arguments[1])||arguments[1],n;return e.push(["{",a,{sameLine:!0,startsLine:t,ours:!0}]),n=new String("{"),n.generated=!0,f.splice(a,0,N("{",n,o,P))},v=function(a){return a=null==a?l:a,e.pop(),f.splice(a,0,N("}","}",o,P)),l+=1},$=function(e){var a;return a=null,i.detectEnd(e,function(e){return"TERMINATOR"===e[0]},function(e,t){return a=t},{returnOnNegativeLevel:!0}),null!=a&&i.looksObjectish(a+1)},(D()||x())&&0<=a.call(r,J)||x()&&":"===w&&"FOR"===J)return e.push(["CONTROL",l,{ours:!0}]),b(1);if("INDENT"===J&&C()){if("=>"!==w&&"->"!==w&&"["!==w&&"("!==w&&","!==w&&"{"!==w&&"ELSE"!==w&&"="!==w)for(;D()||x()&&":"!==w;)D()?T():v();return E()&&e.pop(),e.push([J,l]),b(1)}if(0<=a.call(c,J))return e.push([J,l]),b(1);if(0<=a.call(d,J)){for(;C();)D()?T():x()?v():e.pop();t=e.pop()}if(_=function(){var e,t,n,r;return(n=i.findTagsBackwards(l,["FOR"])&&i.findTagsBackwards(l,["FORIN","FOROF","FORFROM"]),e=n||i.findTagsBackwards(l,["WHILE","UNTIL","LOOP","LEADING_WHEN"]),!!e)&&(t=!1,r=o[2].first_line,i.detectEnd(l,function(e){var t;return t=e[0],0<=a.call(g,t)},function(e,a){var o=f[a-1]||[],n=_slicedToArray(o,3),l;return w=n[0],l=n[2].first_line,t=r===l&&("->"===w||"=>"===w)},{returnOnNegativeLevel:!0}),t)},(0<=a.call(m,J)&&o.spaced||"?"===J&&0<l&&!f[l-1].spaced)&&(0<=a.call(p,O)||"..."===O&&(j=this.tag(l+2),0<=a.call(p,j))&&!this.findTagsBackwards(l,["INDEX_START","["])||0<=a.call(h,O)&&!L.spaced&&!L.newLine)&&!_())return"?"===J&&(J=o[0]="FUNC_EXIST"),Y(l+1),b(2);if(0<=a.call(m,J)&&-1<this.indexOfTag(l+1,"INDENT")&&this.looksObjectish(l+2)&&!this.findTagsBackwards(l,["CLASS","EXTENDS","IF","CATCH","SWITCH","LEADING_WHEN","FOR","WHILE","UNTIL"]))return Y(l+1),e.push(["INDENT",l+2]),b(3);if(":"===J){if(V=function(){var e;switch(!1){case e=this.tag(l-1),0>a.call(d,e):return t[1];case"@"!==this.tag(l-2):return l-2;default:return l-1}}.call(this),z=0>=V||(M=this.tag(V-1),0<=a.call(g,M))||f[V-1].newLine,W()){var ae=W(),te=_slicedToArray(ae,2);if(H=te[0],B=te[1],("{"===H||"INDENT"===H&&"{"===this.tag(B-1))&&(z||","===this.tag(V-1)||"{"===this.tag(V-1)))return b(1)}return q(V,!!z),b(2)}if(0<=a.call(g,J))for(R=e.length-1;0<=R&&(G=e[R],!!I(G));R+=-1)A(G)&&(G[2].sameLine=!1);if(k="OUTDENT"===w||P.newLine,0<=a.call(u,J)||0<=a.call(n,J)&&k||(".."===J||"..."===J)&&this.findTagsBackwards(l,["INDEX_START"]))for(;C();){var oe=W(),ne=_slicedToArray(oe,3);H=ne[0],B=ne[1];var re=ne[2];if(s=re.sameLine,z=re.startsLine,D()&&","!==w||","===w&&"TERMINATOR"===J&&null==O)T();else if(x()&&s&&"TERMINATOR"!==J&&":"!==w&&!(("POST_IF"===J||"FOR"===J||"WHILE"===J||"UNTIL"===J)&&z&&$(l+1)))v();else if(x()&&"TERMINATOR"===J&&","!==w&&!(z&&this.looksObjectish(l+1)))v();else break}if(","===J&&!this.looksObjectish(l+1)&&x()&&"FOROF"!==(U=this.tag(l+2))&&"FORIN"!==U&&("TERMINATOR"!==O||!this.looksObjectish(l+2)))for(F="OUTDENT"===O?1:0;x();)v(l+F);return b(1)})}},{key:"enforceValidCSXAttributes",value:function enforceValidCSXAttributes(){return this.scanTokens(function(e,a,t){var o,n;return e.csxColon&&(o=t[a+1],"STRING_START"!==(n=o[0])&&"STRING"!==n&&"("!==n&&C("expected wrapped or quoted JSX attribute",o[2])),1})}},{key:"rescueStowawayComments",value:function rescueStowawayComments(){var e,t,o;return e=function(e,a,t,o){return"TERMINATOR"!==t[a][0]&&t[o](N("TERMINATOR","\n",t[a])),t[o](N("JS","",t[a],e))},o=function(t,o,n){var r,s,i,d,c,p,u;for(s=o;s!==n.length&&(c=n[s][0],0<=a.call(l,c));)s++;if(!(s===n.length||(p=n[s][0],0<=a.call(l,p)))){for(u=t.comments,i=0,d=u.length;i<d;i++)r=u[i],r.unshift=!0;return $(t,n[s]),1}return s=n.length-1,e(t,s,n,"push"),1},t=function(t,o,n){var r,s,i;for(r=o;-1!==r&&(s=n[r][0],0<=a.call(l,s));)r--;return-1===r||(i=n[r][0],0<=a.call(l,i))?(e(t,0,n,"unshift"),3):($(t,n[r]),1)},this.scanTokens(function(e,n,r){var s,i,d,c,p;if(!e.comments)return 1;if(p=1,d=e[0],0<=a.call(l,d)){for(s={comments:[]},i=e.comments.length-1;-1!==i;)!1===e.comments[i].newLine&&!1===e.comments[i].here&&(s.comments.unshift(e.comments[i]),e.comments.splice(i,1)),i--;0!==s.comments.length&&(p=t(s,n-1,r)),0!==e.comments.length&&o(e,n,r)}else{for(s={comments:[]},i=e.comments.length-1;-1!==i;)!e.comments[i].newLine||e.comments[i].unshift||"JS"===e[0]&&e.generated||(s.comments.unshift(e.comments[i]),e.comments.splice(i,1)),i--;0!==s.comments.length&&(p=o(s,n+1,r))}return 0===(null==(c=e.comments)?void 0:c.length)&&delete e.comments,p})}},{key:"addLocationDataToGeneratedTokens",value:function addLocationDataToGeneratedTokens(){return this.scanTokens(function(e,a,t){var o,n,r,l,s,i;if(e[2])return 1;if(!(e.generated||e.explicit))return 1;if("{"===e[0]&&(r=null==(s=t[a+1])?void 0:s[2])){var d=r;n=d.first_line,o=d.first_column}else if(l=null==(i=t[a-1])?void 0:i[2]){var c=l;n=c.last_line,o=c.last_column}else n=o=0;return e[2]={first_line:n,first_column:o,last_line:n,last_column:o},1})}},{key:"fixOutdentLocationData",value:function fixOutdentLocationData(){return this.scanTokens(function(e,a,t){var o;return"OUTDENT"===e[0]||e.generated&&"CALL_END"===e[0]||e.generated&&"}"===e[0]?(o=t[a-1][2],e[2]={first_line:o.last_line,first_column:o.last_column,last_line:o.last_line,last_column:o.last_column},1):1})}},{key:"addParensToChainedDoIife",value:function addParensToChainedDoIife(){var e,t,o;return t=function(e,a){return"OUTDENT"===this.tag(a-1)},e=function(e,t){var r;if(r=e[0],!(0>a.call(n,r)))return this.tokens.splice(o,0,N("(","(",this.tokens[o])),this.tokens.splice(t+1,0,N(")",")",this.tokens[t]))},o=null,this.scanTokens(function(a,n){var r,l;return"do"===a[1]?(o=n,r=n+1,"PARAM_START"===this.tag(n+1)&&(r=null,this.detectEnd(n+1,function(e,a){return"PARAM_END"===this.tag(a-1)},function(e,a){return r=a})),null==r||"->"!==(l=this.tag(r))&&"=>"!==l||"INDENT"!==this.tag(r+1))?1:(this.detectEnd(r+1,t,e),2):1})}},{key:"normalizeLines",value:function normalizeLines(){var e=this,t,o,r,l,d,c,p,u,m;return m=d=u=null,p=null,c=null,l=[],r=function(e,t){var o,r,l,i;return";"!==e[1]&&(o=e[0],0<=a.call(y,o))&&!("TERMINATOR"===e[0]&&(r=this.tag(t+1),0<=a.call(s,r)))&&!("ELSE"===e[0]&&("THEN"!==m||c||p))&&("CATCH"!==(l=e[0])&&"FINALLY"!==l||"->"!==m&&"=>"!==m)||(i=e[0],0<=a.call(n,i))&&(this.tokens[t-1].newLine||"OUTDENT"===this.tokens[t-1][0])},t=function(e,a){return"ELSE"===e[0]&&"THEN"===m&&l.pop(),this.tokens.splice(","===this.tag(a-1)?a-1:a,0,u)},o=function(a,t){var o,n,r;if(r=l.length,!(0<r))return t;o=l.pop();var s=e.indentation(a[o]),i=_slicedToArray(s,2);return n=i[1],n[1]=2*r,a.splice(t,0,n),n[1]=2,a.splice(t+1,0,n),e.detectEnd(t+2,function(e){var a;return"OUTDENT"===(a=e[0])||"TERMINATOR"===a},function(e,t){if("OUTDENT"===this.tag(t)&&"OUTDENT"===this.tag(t+1))return a.splice(t,2)}),t+2},this.scanTokens(function(e,n,i){var h=_slicedToArray(e,1),g,f,y,k,N,v;if(v=h[0],g=("->"===v||"=>"===v)&&this.findTagsBackwards(n,["IF","WHILE","FOR","UNTIL","SWITCH","WHEN","LEADING_WHEN","[","INDEX_START"])&&!this.findTagsBackwards(n,["THEN","..","..."]),"TERMINATOR"===v){if("ELSE"===this.tag(n+1)&&"OUTDENT"!==this.tag(n-1))return i.splice.apply(i,[n,1].concat(_toConsumableArray(this.indentation()))),1;if(k=this.tag(n+1),0<=a.call(s,k))return i.splice(n,1),0}if("CATCH"===v)for(f=y=1;2>=y;f=++y)if("OUTDENT"===(N=this.tag(n+f))||"TERMINATOR"===N||"FINALLY"===N)return i.splice.apply(i,[n+f,0].concat(_toConsumableArray(this.indentation()))),2+f;if(("->"===v||"=>"===v)&&(","===this.tag(n+1)||"."===this.tag(n+1)&&e.newLine)){var b=this.indentation(i[n]),$=_slicedToArray(b,2);return d=$[0],u=$[1],i.splice(n+1,0,d,u),1}if(0<=a.call(T,v)&&"INDENT"!==this.tag(n+1)&&("ELSE"!==v||"IF"!==this.tag(n+1))&&!g){m=v;var _=this.indentation(i[n]),C=_slicedToArray(_,2);return d=C[0],u=C[1],"THEN"===m&&(d.fromThen=!0),"THEN"===v&&(p=this.findTagsBackwards(n,["LEADING_WHEN"])&&"IF"===this.tag(n+1),c=this.findTagsBackwards(n,["IF"])&&"IF"===this.tag(n+1)),"THEN"===v&&this.findTagsBackwards(n,["IF"])&&l.push(n),"ELSE"===v&&"OUTDENT"!==this.tag(n-1)&&(n=o(i,n)),i.splice(n+1,0,d),this.detectEnd(n+2,r,t),"THEN"===v&&i.splice(n,1),1}return 1})}},{key:"tagPostfixConditionals",value:function tagPostfixConditionals(){var e,t,o;return o=null,t=function(e,t){var o=_slicedToArray(e,1),n,r;r=o[0];var l=_slicedToArray(this.tokens[t-1],1);return n=l[0],"TERMINATOR"===r||"INDENT"===r&&0>a.call(T,n)},e=function(e){if("INDENT"!==e[0]||e.generated&&!e.fromThen)return o[0]="POST_"+o[0]},this.scanTokens(function(a,n){return"IF"===a[0]?(o=a,this.detectEnd(n+1,t,e),1):1})}}