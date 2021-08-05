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
var _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},_get=function e(a,t,o){null===a&&(a=Function.prototype);var n=Object.getOwnPropertyDescriptor(a,t);if(n===void 0){var r=Object.getPrototypeOf(a);return null===r?void 0:e(r,t,o)}if("value"in n)return n.value;var l=n.get;return void 0===l?void 0:l.call(o)},_slicedToArray=function(){function e(e,a){var t=[],o=!0,n=!1,r=void 0;try{for(var l=e[Symbol.iterator](),s;!(o=(s=l.next()).done)&&(t.push(s.value),!(a&&t.length===a));o=!0);}catch(e){n=!0,r=e}finally{try{!o&&l["return"]&&l["return"]()}finally{if(n)throw r}}return t}return function(a,t){if(Array.isArray(a))return a;if(Symbol.iterator in Object(a))return e(a,t);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),_createClass=function(){function e(e,a){for(var t=0,o;t<a.length;t++)o=a[t],o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}return function(a,t,o){return t&&e(a.prototype,t),o&&e(a,o),a}}();function _toArray(e){return Array.isArray(e)?e:Array.from(e)}function _possibleConstructorReturn(e,a){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return a&&("object"==typeof a||"function"==typeof a)?a:e}function _inherits(e,a){if("function"!=typeof a&&null!==a)throw new TypeError("Super expression must either be null or a function, not "+typeof a);e.prototype=Object.create(a&&a.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),a&&(Object.setPrototypeOf?Object.setPrototypeOf(e,a):e.__proto__=a)}function _classCallCheck(e,a){if(!(e instanceof a))throw new TypeError("Cannot call a class as a function")}function _toConsumableArray(e){if(Array.isArray(e)){for(var a=0,t=Array(e.length);a<e.length;a++)t[a]=e[a];return t}return Array.from(e)}(function(root){var CoffeeScript=function(){function require(e){return require[e]}var _Mathabs=Math.abs,_StringfromCharCode=String.fromCharCode,_Mathfloor=Math.floor;return require["../../package.json"]=function(){return{name:"coffeescript",description:"Unfancy JavaScript",keywords:["javascript","language","coffeescript","compiler"],author:"Jeremy Ashkenas",version:"2.2.1",license:"MIT",engines:{node:">=6"},directories:{lib:"./lib/coffeescript"},main:"./lib/coffeescript/index",browser:"./lib/coffeescript/browser",bin:{coffee:"./bin/coffee",cake:"./bin/cake"},files:["bin","lib","register.js","repl.js"],scripts:{test:"node ./bin/cake test","test-harmony":"node --harmony ./bin/cake test"},homepage:"http://coffeescript.org",bugs:"https://github.com/jashkenas/coffeescript/issues",repository:{type:"git",url:"git://github.com/jashkenas/coffeescript.git"},devDependencies:{"babel-core":"~6.26.0","babel-preset-babili":"~0.1.4","babel-preset-env":"~1.6.1","babel-preset-minify":"^0.3.0",codemirror:"^5.32.0",docco:"~0.8.0","highlight.js":"~9.12.0",jison:">=0.4.18","markdown-it":"~8.4.0",underscore:"~1.8.3",webpack:"~3.10.0"},dependencies:{}}}(),require["./helpers"]=function(){var e={};return function(){var a,t,o,n,r,l,s,i;e.starts=function(e,a,t){return a===e.substr(t,a.length)},e.ends=function(e,a,t){var o;return o=a.length,a===e.substr(e.length-o-(t||0),o)},e.repeat=s=function(e,a){var t;for(t="";0<a;)1&a&&(t+=e),a>>>=1,e+=e;return t},e.compact=function(e){var a,t,o,n;for(n=[],a=0,o=e.length;a<o;a++)t=e[a],t&&n.push(t);return n},e.count=function(e,a){var t,o;if(t=o=0,!a.length)return 1/0;for(;o=1+e.indexOf(a,o);)t++;return t},e.merge=function(e,a){return n(n({},e),a)},n=e.extend=function(e,a){var t,o;for(t in a)o=a[t],e[t]=o;return e},e.flatten=r=function flatten(e){var a,t,o,n;for(t=[],o=0,n=e.length;o<n;o++)a=e[o],"[object Array]"===Object.prototype.toString.call(a)?t=t.concat(r(a)):t.push(a);return t},e.del=function(e,a){var t;return t=e[a],delete e[a],t},e.some=null==(l=Array.prototype.some)?function(a){var t,e,o,n;for(n=this,e=0,o=n.length;e<o;e++)if(t=n[e],a(t))return!0;return!1}:l,e.invertLiterate=function(e){var a,t,o,n,r,l,s,i,d;for(i=[],a=/^\s*$/,o=/^[\t ]/,s=/^(?:\t?| {0,3})(?:[\*\-\+]|[0-9]{1,9}\.)[ \t]/,n=!1,d=e.split("\n"),t=0,r=d.length;t<r;t++)l=d[t],a.test(l)?(n=!1,i.push(l)):n||s.test(l)?(n=!0,i.push("# "+l)):!n&&o.test(l)?i.push(l):(n=!0,i.push("# "+l));return i.join("\n")},t=function(e,a){return a?{first_line:e.first_line,first_column:e.first_column,last_line:a.last_line,last_column:a.last_column}:e},o=function(e){return e.first_line+"x"+e.first_column+"-"+e.last_line+"x"+e.last_column},e.addDataToNode=function(e,n,r){return function(l){var s,i,d,c,p,u;if(null!=(null==l?void 0:l.updateLocationDataIfMissing)&&null!=n&&l.updateLocationDataIfMissing(t(n,r)),!e.tokenComments)for(e.tokenComments={},c=e.parser.tokens,s=0,i=c.length;s<i;s++)if(p=c[s],!!p.comments)if(u=o(p[2]),null==e.tokenComments[u])e.tokenComments[u]=p.comments;else{var m;(m=e.tokenComments[u]).push.apply(m,_toConsumableArray(p.comments))}return null!=l.locationData&&(d=o(l.locationData),null!=e.tokenComments[d]&&a(e.tokenComments[d],l)),l}},e.attachCommentsToNode=a=function(e,a){var t;if(null!=e&&0!==e.length)return null==a.comments&&(a.comments=[]),(t=a.comments).push.apply(t,_toConsumableArray(e))},e.locationDataToString=function(e){var a;return"2"in e&&"first_line"in e[2]?a=e[2]:"first_line"in e&&(a=e),a?a.first_line+1+":"+(a.first_column+1)+"-"+(a.last_line+1+":"+(a.last_column+1)):"No location data"},e.baseFileName=function(e){var a=!!(1<arguments.length&&void 0!==arguments[1])&&arguments[1],t=!!(2<arguments.length&&void 0!==arguments[2])&&arguments[2],o,n;return(n=t?/\\|\//:/\//,o=e.split(n),e=o[o.length-1],!(a&&0<=e.indexOf(".")))?e:(o=e.split("."),o.pop(),"coffee"===o[o.length-1]&&1<o.length&&o.pop(),o.join("."))},e.isCoffee=function(e){return/\.((lit)?coffee|coffee\.md)$/.test(e)},e.isLiterate=function(e){return/\.(litcoffee|coffee\.md)$/.test(e)},e.throwSyntaxError=function(e,a){var t;throw t=new SyntaxError(e),t.location=a,t.toString=i,t.stack=t.toString(),t},e.updateSyntaxError=function(e,a,t){return e.toString===i&&(e.code||(e.code=a),e.filename||(e.filename=t),e.stack=e.toString()),e},i=function(){var e,a,t,o,n,r,l,i,d,c,p,u,m,h;if(!(this.code&&this.location))return Error.prototype.toString.call(this);var g=this.location;return l=g.first_line,r=g.first_column,d=g.last_line,i=g.last_column,null==d&&(d=l),null==i&&(i=r),n=this.filename||"[stdin]",e=this.code.split("\n")[l],h=r,o=l===d?i+1:e.length,c=e.slice(0,h).replace(/[^\s]/g," ")+s("^",o-h),"undefined"!=typeof process&&null!==process&&(t=(null==(p=process.stdout)?void 0:p.isTTY)&&(null==(u=process.env)||!u.NODE_DISABLE_COLORS)),(null==(m=this.colorful)?t:m)&&(a=function(e){return"[1;31m"+e+"[0m"},e=e.slice(0,h)+a(e.slice(h,o))+e.slice(o),c=a(c)),n+":"+(l+1)+":"+(r+1)+": error: "+this.message+"\n"+e+"\n"+c},e.nameWhitespaceCharacter=function(e){return" "===e?"space":"\n"===e?"newline":"\r"===e?"carriage return":"\t"===e?"tab":e}}.call(this),{exports:e}.exports}(),require["./rewriter"]=function(){var e={};return function(){var a=[].indexOf,t=require("./helpers"),o,n,r,l,s,d,c,p,u,m,h,i,g,f,y,T,N,v,k,b,$,_,C;for(C=t.throwSyntaxError,$=function(e,a){var t,o,n,r,l;if(e.comments){if(a.comments&&0!==a.comments.length){for(l=[],r=e.comments,o=0,n=r.length;o<n;o++)t=r[o],t.unshift?l.push(t):a.comments.push(t);a.comments=l.concat(a.comments)}else a.comments=e.comments;return delete e.comments}},N=function(e,a,t,o){var n;return n=[e,a],n.generated=!0,t&&(n.origin=t),o&&$(o,n),n},e.Rewriter=f=function(){var e=function(){function e(){_classCallCheck(this,e)}return _createClass(e,[{key:"rewrite",value:function rewrite(e){var a,o,n;return this.tokens=e,("undefined"!=typeof process&&null!==process?null==(a=process.env)?void 0:a.DEBUG_TOKEN_STREAM:void 0)&&(process.env.DEBUG_REWRITTEN_TOKEN_STREAM&&console.log("Initial token stream:"),console.log(function(){var e,a,t,o;for(t=this.tokens,o=[],e=0,a=t.length;e<a;e++)n=t[e],o.push(n[0]+"/"+n[1]+(n.comments?"*":""));return o}.call(this).join(" "))),this.removeLeadingNewlines(),this.closeOpenCalls(),this.closeOpenIndexes(),this.normalizeLines(),this.tagPostfixConditionals(),this.addImplicitBracesAndParens(),this.addParensToChainedDoIife(),this.rescueStowawayComments(),this.addLocationDataToGeneratedTokens(),this.enforceValidCSXAttributes(),this.fixOutdentLocationData(),("undefined"!=typeof process&&null!==process?null==(o=process.env)?void 0:o.DEBUG_REWRITTEN_TOKEN_STREAM:void 0)&&(process.env.DEBUG_TOKEN_STREAM&&console.log("Rewritten token stream:"),console.log(function(){var e,a,t,o;for(t=this.tokens,o=[],e=0,a=t.length;e<a;e++)n=t[e],o.push(n[0]+"/"+n[1]+(n.comments?"*":""));return o}.call(this).join(" "))),this.tokens}},{key:"scanTokens",value:function scanTokens(e){var a,t,o;for(o=this.tokens,a=0;t=o[a];)a+=e.call(this,t,a,o);return!0}},{key:"detectEnd",value:function detectEnd(e,t,o){var n=3<arguments.length&&void 0!==arguments[3]?arguments[3]:{},r,l,s,i,p;for(p=this.tokens,r=0;i=p[e];){if(0===r&&t.call(this,i,e))return o.call(this,i,e);if((l=i[0],0<=a.call(c,l))?r+=1:(s=i[0],0<=a.call(d,s))&&(r-=1),0>r)return n.returnOnNegativeLevel?void 0:o.call(this,i,e);e+=1}return e-1}},{key:"removeLeadingNewlines",value:function removeLeadingNewlines(){var e,a,t,o,n,r,l,s,i;for(l=this.tokens,e=a=0,n=l.length;a<n;e=++a){var d=_slicedToArray(l[e],1);if(i=d[0],"TERMINATOR"!==i)break}if(0!==e){for(s=this.tokens.slice(0,e),t=0,r=s.length;t<r;t++)o=s[t],$(o,this.tokens[e]);return this.tokens.splice(0,e)}}},{key:"closeOpenCalls",value:function closeOpenCalls(){var e,a;return a=function(e){var a;return")"===(a=e[0])||"CALL_END"===a},e=function(e){return e[0]="CALL_END"},this.scanTokens(function(t,o){return"CALL_START"===t[0]&&this.detectEnd(o+1,a,e),1})}},{key:"closeOpenIndexes",value:function closeOpenIndexes(){var e,a;return a=function(e){var a;return"]"===(a=e[0])||"INDEX_END"===a},e=function(e){return e[0]="INDEX_END"},this.scanTokens(function(t,o){return"INDEX_START"===t[0]&&this.detectEnd(o+1,a,e),1})}},{key:"indexOfTag",value:function indexOfTag(e){var t,o,n,r,l;t=0;for(var s=arguments.length,i=Array(1<s?s-1:0),d=1;d<s;d++)i[d-1]=arguments[d];for(o=n=0,r=i.length;0<=r?0<=n&&n<r:0>=n&&n>r;o=0<=r?++n:--n)if(null!=i[o]&&("string"==typeof i[o]&&(i[o]=[i[o]]),l=this.tag(e+o+t),0>a.call(i[o],l)))return-1;return e+o+t-1}},{key:"looksObjectish",value:function looksObjectish(e){var t,o;return-1!==this.indexOfTag(e,"@",null,":")||-1!==this.indexOfTag(e,null,":")||(o=this.indexOfTag(e,c),!!(-1!==o&&(t=null,this.detectEnd(o+1,function(e){var t;return t=e[0],0<=a.call(d,t)},function(e,a){return t=a}),":"===this.tag(t+1))))}},{key:"findTagsBackwards",value:function findTagsBackwards(e,t){var o,n,r,l,s,i,p;for(o=[];0<=e&&(o.length||(l=this.tag(e),0>a.call(t,l))&&((s=this.tag(e),0>a.call(c,s))||this.tokens[e].generated)&&(i=this.tag(e),0>a.call(g,i)));)(n=this.tag(e),0<=a.call(d,n))&&o.push(this.tag(e)),(r=this.tag(e),0<=a.call(c,r))&&o.length&&o.pop(),e-=1;return p=this.tag(e),0<=a.call(t,p)}},{key:"addImplicitBracesAndParens",value:function addImplicitBracesAndParens(){var e,t;return e=[],t=null,this.scanTokens(function(o,l,f){var i=this,y=_slicedToArray(o,1),T,v,b,$,_,C,D,E,x,I,S,A,R,k,O,L,F,w,P,j,M,U,V,s,B,G,H,W,X,Y,q,z,J;J=y[0];var K=P=0<l?f[l-1]:[],Z=_slicedToArray(K,1);w=Z[0];var Q=L=l<f.length-1?f[l+1]:[],ee=_slicedToArray(Q,1);if(O=ee[0],W=function(){return e[e.length-1]},X=l,b=function(e){return l-X+e},I=function(e){var a;return null==e||null==(a=e[2])?void 0:a.ours},A=function(e){return I(e)&&"{"===(null==e?void 0:e[0])},S=function(e){return I(e)&&"("===(null==e?void 0:e[0])},C=function(){return I(W())},D=function(){return S(W())},x=function(){return A(W())},E=function(){var e;return C()&&"CONTROL"===(null==(e=W())?void 0:e[0])},Y=function(a){return e.push(["(",a,{ours:!0}]),f.splice(a,0,N("CALL_START","(",["","implicit function call",o[2]],P))},T=function(){return e.pop(),f.splice(l,0,N("CALL_END",")",["","end of input",o[2]],P)),l+=1},q=function(a){var t=!(1<arguments.length&&void 0!==arguments[1])||arguments[1],n;return e.push(["{",a,{sameLine:!0,startsLine:t,ours:!0}]),n=new String("{"),n.generated=!0,f.splice(a,0,N("{",n,o,P))},v=function(a){return a=null==a?l:a,e.pop(),f.splice(a,0,N("}","}",o,P)),l+=1},$=function(e){var a;return a=null,i.detectEnd(e,function(e){return"TERMINATOR"===e[0]},function(e,t){return a=t},{returnOnNegativeLevel:!0}),null!=a&&i.looksObjectish(a+1)},(D()||x())&&0<=a.call(r,J)||x()&&":"===w&&"FOR"===J)return e.push(["CONTROL",l,{ours:!0}]),b(1);if("INDENT"===J&&C()){if("=>"!==w&&"->"!==w&&"["!==w&&"("!==w&&","!==w&&"{"!==w&&"ELSE"!==w&&"="!==w)for(;D()||x()&&":"!==w;)D()?T():v();return E()&&e.pop(),e.push([J,l]),b(1)}if(0<=a.call(c,J))return e.push([J,l]),b(1);if(0<=a.call(d,J)){for(;C();)D()?T():x()?v():e.pop();t=e.pop()}if(_=function(){var e,t,n,r;return(n=i.findTagsBackwards(l,["FOR"])&&i.findTagsBackwards(l,["FORIN","FOROF","FORFROM"]),e=n||i.findTagsBackwards(l,["WHILE","UNTIL","LOOP","LEADING_WHEN"]),!!e)&&(t=!1,r=o[2].first_line,i.detectEnd(l,function(e){var t;return t=e[0],0<=a.call(g,t)},function(e,a){var o=f[a-1]||[],n=_slicedToArray(o,3),l;return w=n[0],l=n[2].first_line,t=r===l&&("->"===w||"=>"===w)},{returnOnNegativeLevel:!0}),t)},(0<=a.call(m,J)&&o.spaced||"?"===J&&0<l&&!f[l-1].spaced)&&(0<=a.call(p,O)||"..."===O&&(j=this.tag(l+2),0<=a.call(p,j))&&!this.findTagsBackwards(l,["INDEX_START","["])||0<=a.call(h,O)&&!L.spaced&&!L.newLine)&&!_())return"?"===J&&(J=o[0]="FUNC_EXIST"),Y(l+1),b(2);if(0<=a.call(m,J)&&-1<this.indexOfTag(l+1,"INDENT")&&this.looksObjectish(l+2)&&!this.findTagsBackwards(l,["CLASS","EXTENDS","IF","CATCH","SWITCH","LEADING_WHEN","FOR","WHILE","UNTIL"]))return Y(l+1),e.push(["INDENT",l+2]),b(3);if(":"===J){if(V=function(){var e;switch(!1){case e=this.tag(l-1),0>a.call(d,e):return t[1];case"@"!==this.tag(l-2):return l-2;default:return l-1}}.call(this),z=0>=V||(M=this.tag(V-1),0<=a.call(g,M))||f[V-1].newLine,W()){var ae=W(),te=_slicedToArray(ae,2);if(H=te[0],B=te[1],("{"===H||"INDENT"===H&&"{"===this.tag(B-1))&&(z||","===this.tag(V-1)||"{"===this.tag(V-1)))return b(1)}return q(V,!!z),b(2)}if(0<=a.call(g,J))for(R=e.length-1;0<=R&&(G=e[R],!!I(G));R+=-1)A(G)&&(G[2].sameLine=!1);if(k="OUTDENT"===w||P.newLine,0<=a.call(u,J)||0<=a.call(n,J)&&k||(".."===J||"..."===J)&&this.findTagsBackwards(l,["INDEX_START"]))for(;C();){var oe=W(),ne=_slicedToArray(oe,3);H=ne[0],B=ne[1];var re=ne[2];if(s=re.sameLine,z=re.startsLine,D()&&","!==w||","===w&&"TERMINATOR"===J&&null==O)T();else if(x()&&s&&"TERMINATOR"!==J&&":"!==w&&!(("POST_IF"===J||"FOR"===J||"WHILE"===J||"UNTIL"===J)&&z&&$(l+1)))v();else if(x()&&"TERMINATOR"===J&&","!==w&&!(z&&this.looksObjectish(l+1)))v();else break}if(","===J&&!this.looksObjectish(l+1)&&x()&&"FOROF"!==(U=this.tag(l+2))&&"FORIN"!==U&&("TERMINATOR"!==O||!this.looksObjectish(l+2)))for(F="OUTDENT"===O?1:0;x();)v(l+F);return b(1)})}},{key:"enforceValidCSXAttributes",value:function enforceValidCSXAttributes(){return this.scanTokens(function(e,a,t){var o,n;return e.csxColon&&(o=t[a+1],"STRING_START"!==(n=o[0])&&"STRING"!==n&&"("!==n&&C("expected wrapped or quoted JSX attribute",o[2])),1})}},{key:"rescueStowawayComments",value:function rescueStowawayComments(){var e,t,o;return e=function(e,a,t,o){return"TERMINATOR"!==t[a][0]&&t[o](N("TERMINATOR","\n",t[a])),t[o](N("JS","",t[a],e))},o=function(t,o,n){var r,s,i,d,c,p,u;for(s=o;s!==n.length&&(c=n[s][0],0<=a.call(l,c));)s++;if(!(s===n.length||(p=n[s][0],0<=a.call(l,p)))){for(u=t.comments,i=0,d=u.length;i<d;i++)r=u[i],r.unshift=!0;return $(t,n[s]),1}return s=n.length-1,e(t,s,n,"push"),1},t=function(t,o,n){var r,s,i;for(r=o;-1!==r&&(s=n[r][0],0<=a.call(l,s));)r--;return-1===r||(i=n[r][0],0<=a.call(l,i))?(e(t,0,n,"unshift"),3):($(t,n[r]),1)},this.scanTokens(function(e,n,r){var s,i,d,c,p;if(!e.comments)return 1;if(p=1,d=e[0],0<=a.call(l,d)){for(s={comments:[]},i=e.comments.length-1;-1!==i;)!1===e.comments[i].newLine&&!1===e.comments[i].here&&(s.comments.unshift(e.comments[i]),e.comments.splice(i,1)),i--;0!==s.comments.length&&(p=t(s,n-1,r)),0!==e.comments.length&&o(e,n,r)}else{for(s={comments:[]},i=e.comments.length-1;-1!==i;)!e.comments[i].newLine||e.comments[i].unshift||"JS"===e[0]&&e.generated||(s.comments.unshift(e.comments[i]),e.comments.splice(i,1)),i--;0!==s.comments.length&&(p=o(s,n+1,r))}return 0===(null==(c=e.comments)?void 0:c.length)&&delete e.comments,p})}},{key:"addLocationDataToGeneratedTokens",value:function addLocationDataToGeneratedTokens(){return this.scanTokens(function(e,a,t){var o,n,r,l,s,i;if(e[2])return 1;if(!(e.generated||e.explicit))return 1;if("{"===e[0]&&(r=null==(s=t[a+1])?void 0:s[2])){var d=r;n=d.first_line,o=d.first_column}else if(l=null==(i=t[a-1])?void 0:i[2]){var c=l;n=c.last_line,o=c.last_column}else n=o=0;return e[2]={first_line:n,first_column:o,last_line:n,last_column:o},1})}},{key:"fixOutdentLocationData",value:function fixOutdentLocationData(){return this.scanTokens(function(e,a,t){var o;return"OUTDENT"===e[0]||e.generated&&"CALL_END"===e[0]||e.generated&&"}"===e[0]?(o=t[a-1][2],e[2]={first_line:o.last_line,first_column:o.last_column,last_line:o.last_line,last_column:o.last_column},1):1})}},{key:"addParensToChainedDoIife",value:function addParensToChainedDoIife(){var e,t,o;return t=function(e,a){return"OUTDENT"===this.tag(a-1)},e=function(e,t){var r;if(r=e[0],!(0>a.call(n,r)))return this.tokens.splice(o,0,N("(","(",this.tokens[o])),this.tokens.splice(t+1,0,N(")",")",this.tokens[t]))},o=null,this.scanTokens(function(a,n){var r,l;return"do"===a[1]?(o=n,r=n+1,"PARAM_START"===this.tag(n+1)&&(r=null,this.detectEnd(n+1,function(e,a){return"PARAM_END"===this.tag(a-1)},function(e,a){return r=a})),null==r||"->"!==(l=this.tag(r))&&"=>"!==l||"INDENT"!==this.tag(r+1))?1:(this.detectEnd(r+1,t,e),2):1})}},{key:"normalizeLines",value:function normalizeLines(){var e=this,t,o,r,l,d,c,p,u,m;return m=d=u=null,p=null,c=null,l=[],r=function(e,t){var o,r,l,i;return";"!==e[1]&&(o=e[0],0<=a.call(y,o))&&!("TERMINATOR"===e[0]&&(r=this.tag(t+1),0<=a.call(s,r)))&&!("ELSE"===e[0]&&("THEN"!==m||c||p))&&("CATCH"!==(l=e[0])&&"FINALLY"!==l||"->"!==m&&"=>"!==m)||(i=e[0],0<=a.call(n,i))&&(this.tokens[t-1].newLine||"OUTDENT"===this.tokens[t-1][0])},t=function(e,a){return"ELSE"===e[0]&&"THEN"===m&&l.pop(),this.tokens.splice(","===this.tag(a-1)?a-1:a,0,u)},o=function(a,t){var o,n,r;if(r=l.length,!(0<r))return t;o=l.pop();var s=e.indentation(a[o]),i=_slicedToArray(s,2);return n=i[1],n[1]=2*r,a.splice(t,0,n),n[1]=2,a.splice(t+1,0,n),e.detectEnd(t+2,function(e){var a;return"OUTDENT"===(a=e[0])||"TERMINATOR"===a},function(e,t){if("OUTDENT"===this.tag(t)&&"OUTDENT"===this.tag(t+1))return a.splice(t,2)}),t+2},this.scanTokens(function(e,n,i){var h=_slicedToArray(e,1),g,f,y,k,N,v;if(v=h[0],g=("->"===v||"=>"===v)&&this.findTagsBackwards(n,["IF","WHILE","FOR","UNTIL","SWITCH","WHEN","LEADING_WHEN","[","INDEX_START"])&&!this.findTagsBackwards(n,["THEN","..","..."]),"TERMINATOR"===v){if("ELSE"===this.tag(n+1)&&"OUTDENT"!==this.tag(n-1))return i.splice.apply(i,[n,1].concat(_toConsumableArray(this.indentation()))),1;if(k=this.tag(n+1),0<=a.call(s,k))return i.splice(n,1),0}if("CATCH"===v)for(f=y=1;2>=y;f=++y)if("OUTDENT"===(N=this.tag(n+f))||"TERMINATOR"===N||"FINALLY"===N)return i.splice.apply(i,[n+f,0].concat(_toConsumableArray(this.indentation()))),2+f;if(("->"===v||"=>"===v)&&(","===this.tag(n+1)||"."===this.tag(n+1)&&e.newLine)){var b=this.indentation(i[n]),$=_slicedToArray(b,2);return d=$[0],u=$[1],i.splice(n+1,0,d,u),1}if(0<=a.call(T,v)&&"INDENT"!==this.tag(n+1)&&("ELSE"!==v||"IF"!==this.tag(n+1))&&!g){m=v;var _=this.indentation(i[n]),C=_slicedToArray(_,2);return d=C[0],u=C[1],"THEN"===m&&(d.fromThen=!0),"THEN"===v&&(p=this.findTagsBackwards(n,["LEADING_WHEN"])&&"IF"===this.tag(n+1),c=this.findTagsBackwards(n,["IF"])&&"IF"===this.tag(n+1)),"THEN"===v&&this.findTagsBackwards(n,["IF"])&&l.push(n),"ELSE"===v&&"OUTDENT"!==this.tag(n-1)&&(n=o(i,n)),i.splice(n+1,0,d),this.detectEnd(n+2,r,t),"THEN"===v&&i.splice(n,1),1}return 1})}},{key:"tagPostfixConditionals",value:function tagPostfixConditionals(){var e,t,o;return o=null,t=function(e,t){var o=_slicedToArray(e,1),n,r;r=o[0];var l=_slicedToArray(this.tokens[t-1],1);return n=l[0],"TERMINATOR"===r||"INDENT"===r&&0>a.call(T,n)},e=function(e){if("INDENT"!==e[0]||e.generated&&!e.fromThen)return o[0]="POST_"+o[0]},this.scanTokens(function(a,n){return"IF"===a[0]?(o=a,this.detectEnd(n+1,t,e),1):1})}},{key:"indentation",value:function indentation(e){var a,t;return a=["INDENT",2],t=["OUTDENT",2],e?(a.generated=t.generated=!0,a.origin=t.origin=e):a.explicit=t.explicit=!0,[a,t]}},{key:"tag",value:function tag(e){var a;return null==(a=this.tokens[e])?void 0:a[0]}}]),e}();return e.prototype.generate=N,e}.call(this),o=[["(",")"],["[","]"],["{","}"],["INDENT","OUTDENT"],["CALL_START","CALL_END"],["PARAM_START","PARAM_END"],["INDEX_START","INDEX_END"],["STRING_START","STRING_END"],["REGEX_START","REGEX_END"]],e.INVERSES=i={},c=[],d=[],v=0,b=o.length;v<b;v++){var D=_slicedToArray(o[v],2);k=D[0],_=D[1],c.push(i[_]=k),d.push(i[k]=_)}s=["CATCH","THEN","ELSE","FINALLY"].concat(d),m=["IDENTIFIER","PROPERTY","SUPER",")","CALL_END","]","INDEX_END","@","THIS"],p=["IDENTIFIER","CSX_TAG","PROPERTY","NUMBER","INFINITY","NAN","STRING","STRING_START","REGEX","REGEX_START","JS","NEW","PARAM_START","CLASS","IF","TRY","SWITCH","THIS","UNDEFINED","NULL","BOOL","UNARY","YIELD","AWAIT","UNARY_MATH","SUPER","THROW","@","->","=>","[","(","{","--","++"],h=["+","-"],u=["POST_IF","FOR","WHILE","UNTIL","WHEN","BY","LOOP","TERMINATOR"],T=["ELSE","->","=>","TRY","FINALLY","THEN"],y=["TERMINATOR","CATCH","FINALLY","ELSE","OUTDENT","LEADING_WHEN"],g=["TERMINATOR","INDENT","OUTDENT"],n=[".","?.","::","?::"],r=["IF","TRY","FINALLY","CATCH","CLASS","SWITCH"],l=["(",")","[","]","{","}",".","..","...",",","=","++","--","?","AS","AWAIT","CALL_START","CALL_END","DEFAULT","ELSE","EXTENDS","EXPORT","FORIN","FOROF","FORFROM","IMPORT","INDENT","INDEX_SOAK","LEADING_WHEN","OUTDENT","PARAM_END","REGEX_START","REGEX_END","RETURN","STRING_END","THROW","UNARY","YIELD"].concat(h.concat(u.concat(n.concat(r))))}.call(this),{exports:e}.exports}(),require["./lexer"]=function(){var e={};return function(){var a=[].indexOf,t=[].slice,o=require("./rewriter"),n,r,l,s,i,d,c,p,u,m,h,g,f,y,k,T,N,v,b,$,_,C,D,E,x,I,S,A,R,O,L,F,w,P,j,M,U,V,B,G,H,W,X,Y,q,z,J,K,Z,Q,ee,ae,te,oe,ne,re,le,se,ie,de,ce,pe,ue,me,he,ge,fe,ye,ke,Te,Ne,ve,be,$e;z=o.Rewriter,S=o.INVERSES;var _e=require("./helpers");he=_e.count,be=_e.starts,me=_e.compact,ve=_e.repeat,ge=_e.invertLiterate,Ne=_e.merge,ue=_e.attachCommentsToNode,Te=_e.locationDataToString,$e=_e.throwSyntaxError,e.Lexer=w=function(){function e(){_classCallCheck(this,e)}return _createClass(e,[{key:"tokenize",value:function tokenize(e){var a=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{},t,o,n,r;for(this.literate=a.literate,this.indent=0,this.baseIndent=0,this.indebt=0,this.outdebt=0,this.indents=[],this.indentLiteral="",this.ends=[],this.tokens=[],this.seenFor=!1,this.seenImport=!1,this.seenExport=!1,this.importSpecifierList=!1,this.exportSpecifierList=!1,this.csxDepth=0,this.csxObjAttribute={},this.chunkLine=a.line||0,this.chunkColumn=a.column||0,e=this.clean(e),n=0;this.chunk=e.slice(n);){t=this.identifierToken()||this.commentToken()||this.whitespaceToken()||this.lineToken()||this.stringToken()||this.numberToken()||this.csxToken()||this.regexToken()||this.jsToken()||this.literalToken();var l=this.getLineAndColumnFromChunk(t),s=_slicedToArray(l,2);if(this.chunkLine=s[0],this.chunkColumn=s[1],n+=t,a.untilBalanced&&0===this.ends.length)return{tokens:this.tokens,index:n}}return this.closeIndentation(),(o=this.ends.pop())&&this.error("missing "+o.tag,(null==(r=o.origin)?o:r)[2]),!1===a.rewrite?this.tokens:(new z).rewrite(this.tokens)}},{key:"clean",value:function clean(e){return e.charCodeAt(0)===n&&(e=e.slice(1)),e=e.replace(/\r/g,"").replace(re,""),pe.test(e)&&(e="\n"+e,this.chunkLine--),this.literate&&(e=ge(e)),e}},{key:"identifierToken",value:function identifierToken(){var e,t,o,n,r,s,p,u,m,h,f,y,k,T,N,v,b,$,_,C,E,x,I,S,A,O,F,w;if(p=this.atCSXTag(),A=p?g:D,!(m=A.exec(this.chunk)))return 0;var P=m,j=_slicedToArray(P,3);if(u=j[0],r=j[1],t=j[2],s=r.length,h=void 0,"own"===r&&"FOR"===this.tag())return this.token("OWN",r),r.length;if("from"===r&&"YIELD"===this.tag())return this.token("FROM",r),r.length;if("as"===r&&this.seenImport){if("*"===this.value())this.tokens[this.tokens.length-1][0]="IMPORT_ALL";else if(k=this.value(!0),0<=a.call(c,k)){f=this.prev();var M=["IDENTIFIER",this.value(!0)];f[0]=M[0],f[1]=M[1]}if("DEFAULT"===(T=this.tag())||"IMPORT_ALL"===T||"IDENTIFIER"===T)return this.token("AS",r),r.length}if("as"===r&&this.seenExport){if("IDENTIFIER"===(v=this.tag())||"DEFAULT"===v)return this.token("AS",r),r.length;if(b=this.value(!0),0<=a.call(c,b)){f=this.prev();var U=["IDENTIFIER",this.value(!0)];return f[0]=U[0],f[1]=U[1],this.token("AS",r),r.length}}if("default"===r&&this.seenExport&&("EXPORT"===($=this.tag())||"AS"===$))return this.token("DEFAULT",r),r.length;if("do"===r&&(S=/^(\s*super)(?!\(\))/.exec(this.chunk.slice(3)))){this.token("SUPER","super"),this.token("CALL_START","("),this.token("CALL_END",")");var V=S,B=_slicedToArray(V,2);return u=B[0],O=B[1],O.length+3}if(f=this.prev(),F=t||null!=f&&("."===(_=f[0])||"?."===_||"::"===_||"?::"===_||!f.spaced&&"@"===f[0])?"PROPERTY":"IDENTIFIER","IDENTIFIER"===F&&(0<=a.call(R,r)||0<=a.call(c,r))&&!(this.exportSpecifierList&&0<=a.call(c,r))?(F=r.toUpperCase(),"WHEN"===F&&(C=this.tag(),0<=a.call(L,C))?F="LEADING_WHEN":"FOR"===F?this.seenFor=!0:"UNLESS"===F?F="IF":"IMPORT"===F?this.seenImport=!0:"EXPORT"===F?this.seenExport=!0:0<=a.call(le,F)?F="UNARY":0<=a.call(Y,F)&&("INSTANCEOF"!==F&&this.seenFor?(F="FOR"+F,this.seenFor=!1):(F="RELATION","!"===this.value()&&(h=this.tokens.pop(),r="!"+r)))):"IDENTIFIER"===F&&this.seenFor&&"from"===r&&fe(f)?(F="FORFROM",this.seenFor=!1):"PROPERTY"===F&&f&&(f.spaced&&(E=f[0],0<=a.call(l,E))&&/^[gs]et$/.test(f[1])&&1<this.tokens.length&&"."!==(x=this.tokens[this.tokens.length-2][0])&&"?."!==x&&"@"!==x?this.error("'"+f[1]+"' cannot be used as a keyword, or as a function call without parentheses",f[2]):2<this.tokens.length&&(y=this.tokens[this.tokens.length-2],("@"===(I=f[0])||"THIS"===I)&&y&&y.spaced&&/^[gs]et$/.test(y[1])&&"."!==(N=this.tokens[this.tokens.length-3][0])&&"?."!==N&&"@"!==N&&this.error("'"+y[1]+"' cannot be used as a keyword, or as a function call without parentheses",y[2]))),"IDENTIFIER"===F&&0<=a.call(q,r)&&this.error("reserved word '"+r+"'",{length:r.length}),"PROPERTY"===F||this.exportSpecifierList||(0<=a.call(i,r)&&(e=r,r=d[r]),F=function(){return"!"===r?"UNARY":"=="===r||"!="===r?"COMPARE":"true"===r||"false"===r?"BOOL":"break"===r||"continue"===r||"debugger"===r?"STATEMENT":"&&"===r||"||"===r?r:F}()),w=this.token(F,r,0,s),e&&(w.origin=[F,e,w[2]]),h){var G=[h[2].first_line,h[2].first_column];w[2].first_line=G[0],w[2].first_column=G[1]}return t&&(o=u.lastIndexOf(p?"=":":"),n=this.token(":",":",o,t.length),p&&(n.csxColon=!0)),p&&"IDENTIFIER"===F&&":"!==f[0]&&this.token(",",",",0,0,w),u.length}},{key:"numberToken",value:function numberToken(){var e,a,t,o,n,r;if(!(t=U.exec(this.chunk)))return 0;switch(o=t[0],a=o.length,!1){case!/^0[BOX]/.test(o):this.error("radix prefix in '"+o+"' must be lowercase",{offset:1});break;case!/^(?!0x).*E/.test(o):this.error("exponential notation in '"+o+"' must be indicated with a lowercase 'e'",{offset:o.indexOf("E")});break;case!/^0\d*[89]/.test(o):this.error("decimal literal '"+o+"' must not be prefixed with '0'",{length:a});break;case!/^0\d+/.test(o):this.error("octal literal '"+o+"' must be prefixed with '0o'",{length:a})}return e=function(){switch(o.charAt(1)){case"b":return 2;case"o":return 8;case"x":return 16;default:return null}}(),n=null==e?parseFloat(o):parseInt(o.slice(2),e),r=Infinity===n?"INFINITY":"NUMBER",this.token(r,o,0,a),a}},{key:"stringToken",value:function stringToken(){var e=this,a=oe.exec(this.chunk)||[],t=_slicedToArray(a,1),o,n,r,l,s,d,c,i,p,u,m,h,g,f,y,k;if(h=t[0],!h)return 0;m=this.prev(),m&&"from"===this.value()&&(this.seenImport||this.seenExport)&&(m[0]="FROM"),f=function(){return"'"===h?te:'"'===h?Q:"'''"===h?b:'"""'===h?N:void 0}(),d=3===h.length;var T=this.matchWithInterpolations(f,h);if(k=T.tokens,s=T.index,o=k.length-1,r=h.charAt(0),d){for(i=null,l=function(){var e,a,t;for(t=[],c=e=0,a=k.length;e<a;c=++e)y=k[c],"NEOSTRING"===y[0]&&t.push(y[1]);return t}().join("#{}");u=v.exec(l);)n=u[1],(null===i||0<(g=n.length)&&g<i.length)&&(i=n);i&&(p=RegExp("\\n"+i,"g")),this.mergeInterpolationTokens(k,{delimiter:r},function(a,t){return a=e.formatString(a,{delimiter:h}),p&&(a=a.replace(p,"\n")),0===t&&(a=a.replace(O,"")),t===o&&(a=a.replace(ne,"")),a})}else this.mergeInterpolationTokens(k,{delimiter:r},function(a,t){return a=e.formatString(a,{delimiter:h}),a=a.replace(K,function(e,n){return 0===t&&0===n||t===o&&n+e.length===a.length?"":" "}),a});return this.atCSXTag()&&this.token(",",",",0,0,this.prev),s}},{key:"commentToken",value:function commentToken(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:this.chunk,t,o,n,r,l,s,i,d,c,u,m;if(!(i=e.match(p)))return 0;var h=i,g=_slicedToArray(h,2);return t=g[0],l=g[1],r=null,c=/^\s*\n+\s*#/.test(t),l?(d=T.exec(t),d&&this.error("block comments cannot contain "+d[0],{offset:d.index,length:d[0].length}),e=e.replace("###"+l+"###",""),e=e.replace(/^\n+/,""),this.lineToken(e),n=l,0<=a.call(n,"\n")&&(n=n.replace(RegExp("\\n"+ve(" ",this.indent),"g"),"\n")),r=[n]):(n=t.replace(/^(\n*)/,""),n=n.replace(/^([ |\t]*)#/gm,""),r=n.split("\n")),o=function(){var e,a,t;for(t=[],s=e=0,a=r.length;e<a;s=++e)n=r[s],t.push({content:n,here:null!=l,newLine:c||0!==s});return t}(),m=this.prev(),m?ue(o,m):(o[0].newLine=!0,this.lineToken(this.chunk.slice(t.length)),u=this.makeToken("JS",""),u.generated=!0,u.comments=o,this.tokens.push(u),this.newlineToken(0)),t.length}},{key:"jsToken",value:function jsToken(){var e,a;return"`"===this.chunk.charAt(0)&&(e=C.exec(this.chunk)||A.exec(this.chunk))?(a=e[1].replace(/\\+(`|$)/g,function(e){return e.slice(-Math.ceil(e.length/2))}),this.token("JS",a,0,e[0].length),e[0].length):0}},{key:"regexToken",value:function regexToken(){var e=this,t,o,n,r,s,i,d,c,p,u,m,h,g,f,y,k;switch(!1){case!(u=W.exec(this.chunk)):this.error("regular expressions cannot begin with "+u[2],{offset:u.index+u[1].length});break;case!(u=this.matchWithInterpolations($,"///")):var T=u;if(k=T.tokens,d=T.index,r=this.chunk.slice(0,d).match(/\s+(#(?!{).*)/g),r)for(c=0,p=r.length;c<p;c++)n=r[c],this.commentToken(n);break;case!(u=G.exec(this.chunk)):var N=u,v=_slicedToArray(N,3);if(y=v[0],t=v[1],o=v[2],this.validateEscapes(t,{isRegex:!0,offsetInChunk:1}),d=y.length,h=this.prev(),h)if(h.spaced&&(g=h[0],0<=a.call(l,g))){if(!o||B.test(y))return 0}else if(f=h[0],0<=a.call(M,f))return 0;o||this.error("missing / (unclosed regex)");break;default:return 0}var b=H.exec(this.chunk.slice(d)),_=_slicedToArray(b,1);switch(i=_[0],s=d+i.length,m=this.makeToken("REGEX",null,0,s),!1){case!!ce.test(i):this.error("invalid regular expression flags "+i,{offset:d,length:i.length});break;case!(y||1===k.length):t=t?this.formatRegex(t,{flags:i,delimiter:"/"}):this.formatHeregex(k[0][1],{flags:i}),this.token("REGEX",""+this.makeDelimitedLiteral(t,{delimiter:"/"})+i,0,s,m);break;default:this.token("REGEX_START","(",0,0,m),this.token("IDENTIFIER","RegExp",0,0),this.token("CALL_START","(",0,0),this.mergeInterpolationTokens(k,{delimiter:'"',double:!0},function(a){return e.formatHeregex(a,{flags:i})}),i&&(this.token(",",",",d-1,0),this.token("STRING",'"'+i+'"',d-1,i.length)),this.token(")",")",s-1,0),this.token("REGEX_END",")",s-1,0)}return s}},{key:"lineToken",value:function lineToken(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:this.chunk,a,t,o,n,r,l,s,i,d;if(!(n=j.exec(e)))return 0;if(o=n[0],i=this.prev(),a=null!=i&&"\\"===i[0],a&&this.seenFor||(this.seenFor=!1),this.importSpecifierList||(this.seenImport=!1),this.exportSpecifierList||(this.seenExport=!1),d=o.length-1-o.lastIndexOf("\n"),s=this.unfinished(),l=0<d?o.slice(-d):"",!/^(.?)\1*$/.exec(l))return this.error("mixed indentation",{offset:o.length}),o.length;if(r=Math.min(l.length,this.indentLiteral.length),l.slice(0,r)!==this.indentLiteral.slice(0,r))return this.error("indentation mismatch",{offset:o.length}),o.length;if(d-this.indebt===this.indent)return s?this.suppressNewlines():this.newlineToken(0),o.length;if(d>this.indent){if(s)return this.indebt=d-this.indent,this.suppressNewlines(),o.length;if(!this.tokens.length)return this.baseIndent=this.indent=d,this.indentLiteral=l,o.length;t=d-this.indent+this.outdebt,this.token("INDENT",t,o.length-d,d),this.indents.push(t),this.ends.push({tag:"OUTDENT"}),this.outdebt=this.indebt=0,this.indent=d,this.indentLiteral=l}else d<this.baseIndent?this.error("missing indentation",{offset:o.length}):(this.indebt=0,this.outdentToken(this.indent-d,s,o.length));return o.length}},{key:"outdentToken",value:function outdentToken(e,t,o){var n,r,l,s;for(n=this.indent-e;0<e;)l=this.indents[this.indents.length-1],l?this.outdebt&&e<=this.outdebt?(this.outdebt-=e,e=0):(r=this.indents.pop()+this.outdebt,o&&(s=this.chunk[o],0<=a.call(E,s))&&(n-=r-e,e=r),this.outdebt=0,this.pair("OUTDENT"),this.token("OUTDENT",e,0,o),e-=r):this.outdebt=e=0;return r&&(this.outdebt-=e),this.suppressSemicolons(),"TERMINATOR"===this.tag()||t||this.token("TERMINATOR","\n",o,0),this.indent=n,this.indentLiteral=this.indentLiteral.slice(0,n),this}},{key:"whitespaceToken",value:function whitespaceToken(){var e,a,t;return(e=pe.exec(this.chunk))||(a="\n"===this.chunk.charAt(0))?(t=this.prev(),t&&(t[e?"spaced":"newLine"]=!0),e?e[0].length:0):0}},{key:"newlineToken",value:function newlineToken(e){return this.suppressSemicolons(),"TERMINATOR"!==this.tag()&&this.token("TERMINATOR","\n",e,0),this}},{key:"suppressNewlines",value:function suppressNewlines(){var e;return e=this.prev(),"\\"===e[1]&&(e.comments&&1<this.tokens.length&&ue(e.comments,this.tokens[this.tokens.length-2]),this.tokens.pop()),this}},{key:"csxToken",value:function csxToken(){var e=this,t,o,n,r,l,s,i,d,c,p,m,h,g,T;if(l=this.chunk[0],m=0<this.tokens.length?this.tokens[this.tokens.length-1][0]:"","<"===l){if(d=y.exec(this.chunk.slice(1))||f.exec(this.chunk.slice(1)),!(d&&(0<this.csxDepth||!(p=this.prev())||p.spaced||(h=p[0],0>a.call(u,h)))))return 0;var N=d,v=_slicedToArray(N,3);return i=v[0],s=v[1],o=v[2],c=this.token("CSX_TAG",s,1,s.length),this.token("CALL_START","("),this.token("[","["),this.ends.push({tag:"/>",origin:c,name:s}),this.csxDepth++,s.length+1}if(n=this.atCSXTag()){if("/>"===this.chunk.slice(0,2))return this.pair("/>"),this.token("]","]",0,2),this.token("CALL_END",")",0,2),this.csxDepth--,2;if("{"===l)return":"===m?(g=this.token("(","("),this.csxObjAttribute[this.csxDepth]=!1):(g=this.token("{","{"),this.csxObjAttribute[this.csxDepth]=!0),this.ends.push({tag:"}",origin:g}),1;if(">"===l){this.pair("/>"),c=this.token("]","]"),this.token(",",",");var b=this.matchWithInterpolations(I,">","</",k);return T=b.tokens,r=b.index,this.mergeInterpolationTokens(T,{delimiter:'"'},function(a){return e.formatString(a,{delimiter:">"})}),d=y.exec(this.chunk.slice(r))||f.exec(this.chunk.slice(r)),d&&d[1]===n.name||this.error("expected corresponding CSX closing tag for "+n.name,n.origin[2]),t=r+n.name.length,">"!==this.chunk[t]&&this.error("missing closing > after tag name",{offset:t,length:1}),this.token("CALL_END",")",r,n.name.length+1),this.csxDepth--,t+1}return 0}return this.atCSXTag(1)?"}"===l?(this.pair(l),this.csxObjAttribute[this.csxDepth]?(this.token("}","}"),this.csxObjAttribute[this.csxDepth]=!1):this.token(")",")"),this.token(",",","),1):0:0}},{key:"atCSXTag",value:function atCSXTag(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:0,a,t,o;if(0===this.csxDepth)return!1;for(a=this.ends.length-1;"OUTDENT"===(null==(o=this.ends[a])?void 0:o.tag)||0<e--;)a--;return t=this.ends[a],"/>"===(null==t?void 0:t.tag)&&t}},{key:"literalToken",value:function literalToken(){var e,t,o,n,r,i,d,c,p,u,g,f,y;if(e=V.exec(this.chunk)){var k=e,T=_slicedToArray(k,1);y=T[0],s.test(y)&&this.tagParameters()}else y=this.chunk.charAt(0);if(g=y,n=this.prev(),n&&0<=a.call(["="].concat(_toConsumableArray(h)),y)&&(u=!1,"="!==y||"||"!==(r=n[1])&&"&&"!==r||n.spaced||(n[0]="COMPOUND_ASSIGN",n[1]+="=",n=this.tokens[this.tokens.length-2],u=!0),n&&"PROPERTY"!==n[0]&&(o=null==(i=n.origin)?n:i,t=ye(n[1],o[1]),t&&this.error(t,o[2])),u))return y.length;if("{"===y&&this.seenImport?this.importSpecifierList=!0:this.importSpecifierList&&"}"===y?this.importSpecifierList=!1:"{"===y&&"EXPORT"===(null==n?void 0:n[0])?this.exportSpecifierList=!0:this.exportSpecifierList&&"}"===y&&(this.exportSpecifierList=!1),";"===y)(d=null==n?void 0:n[0],0<=a.call(["="].concat(_toConsumableArray(ie)),d))&&this.error("unexpected ;"),this.seenFor=this.seenImport=this.seenExport=!1,g="TERMINATOR";else if("*"===y&&"EXPORT"===(null==n?void 0:n[0]))g="EXPORT_ALL";else if(0<=a.call(P,y))g="MATH";else if(0<=a.call(m,y))g="COMPARE";else if(0<=a.call(h,y))g="COMPOUND_ASSIGN";else if(0<=a.call(le,y))g="UNARY";else if(0<=a.call(se,y))g="UNARY_MATH";else if(0<=a.call(J,y))g="SHIFT";else if("?"===y&&(null==n?void 0:n.spaced))g="BIN?";else if(n)if("("===y&&!n.spaced&&(c=n[0],0<=a.call(l,c)))"?"===n[0]&&(n[0]="FUNC_EXIST"),g="CALL_START";else if("["===y&&((p=n[0],0<=a.call(x,p))&&!n.spaced||"::"===n[0]))switch(g="INDEX_START",n[0]){case"?":n[0]="INDEX_SOAK"}return f=this.makeToken(g,y),"("===y||"{"===y||"["===y?this.ends.push({tag:S[y],origin:f}):")"===y||"}"===y||"]"===y?this.pair(y):void 0,this.tokens.push(this.makeToken(g,y)),y.length}},{key:"tagParameters",value:function tagParameters(){var e,a,t,o,n;if(")"!==this.tag())return this;for(t=[],n=this.tokens,e=n.length,a=n[--e],a[0]="PARAM_END";o=n[--e];)switch(o[0]){case")":t.push(o);break;case"(":case"CALL_START":if(t.length)t.pop();else return"("===o[0]?(o[0]="PARAM_START",this):(a[0]="CALL_END",this)}return this}},{key:"closeIndentation",value:function closeIndentation(){return this.outdentToken(this.indent)}},{key:"matchWithInterpolations",value:function matchWithInterpolations(a,o,n,r){var l,s,i,d,c,p,u,m,h,g,f,y,k,T,N,v,b,$,_,C,D,E;if(null==n&&(n=o),null==r&&(r=/^#\{/),E=[],v=o.length,this.chunk.slice(0,v)!==o)return null;for(C=this.chunk.slice(v);;){var x=a.exec(C),I=_slicedToArray(x,1);if(D=I[0],this.validateEscapes(D,{isRegex:"/"===o.charAt(0),offsetInChunk:v}),E.push(this.makeToken("NEOSTRING",D,v)),C=C.slice(D.length),v+=D.length,!(T=r.exec(C)))break;var S=T,A=_slicedToArray(S,1);f=A[0],g=f.length-1;var R=this.getLineAndColumnFromChunk(v+g),O=_slicedToArray(R,2);k=O[0],u=O[1],_=C.slice(g);var L=(new e).tokenize(_,{line:k,column:u,untilBalanced:!0});if(N=L.tokens,h=L.index,h+=g,c="}"===C[h-1],c){var F,w,P,j;F=N,w=_slicedToArray(F,1),b=w[0],F,P=t.call(N,-1),j=_slicedToArray(P,1),p=j[0],P,b[0]=b[1]="(",p[0]=p[1]=")",p.origin=["","end of interpolation",p[2]]}"TERMINATOR"===(null==($=N[1])?void 0:$[0])&&N.splice(1,1),c||(b=this.makeToken("(","(",v,0),p=this.makeToken(")",")",v+h,0),N=[b].concat(_toConsumableArray(N),[p])),E.push(["TOKENS",N]),C=C.slice(h),v+=h}return C.slice(0,n.length)!==n&&this.error("missing "+n,{length:o.length}),l=E,s=_slicedToArray(l,1),m=s[0],l,i=t.call(E,-1),d=_slicedToArray(i,1),y=d[0],i,m[2].first_column-=o.length,"\n"===y[1].substr(-1)?(y[2].last_line+=1,y[2].last_column=n.length-1):y[2].last_column+=n.length,0===y[1].length&&(y[2].last_column-=1),{tokens:E,index:v+n.length}}},{key:"mergeInterpolationTokens",value:function mergeInterpolationTokens(e,a,o){var n,r,l,s,i,d,c,p,u,m,h,g,f,y,k,T,N,v,b;for(1<e.length&&(h=this.token("STRING_START","(",0,0)),l=this.tokens.length,s=i=0,p=e.length;i<p;s=++i){var $;T=e[s];var _=T,C=_slicedToArray(_,2);switch(k=C[0],b=C[1],k){case"TOKENS":if(2===b.length){if(!(b[0].comments||b[1].comments))continue;for(g=0===this.csxDepth?this.makeToken("STRING","''"):this.makeToken("JS",""),g[2]=b[0][2],d=0,u=b.length;d<u;d++){var D;(v=b[d],!!v.comments)&&(null==g.comments&&(g.comments=[]),(D=g.comments).push.apply(D,_toConsumableArray(v.comments)))}b.splice(1,0,g)}m=b[0],N=b;break;case"NEOSTRING":if(n=o.call(this,T[1],s),0===n.length)if(0===s)r=this.tokens.length;else continue;2===s&&null!=r&&this.tokens.splice(r,2),T[0]="STRING",T[1]=this.makeDelimitedLiteral(n,a),m=T,N=[T]}this.tokens.length>l&&(f=this.token("+","+"),f[2]={first_line:m[2].first_line,first_column:m[2].first_column,last_line:m[2].first_line,last_column:m[2].first_column}),($=this.tokens).push.apply($,_toConsumableArray(N))}if(h){var E=t.call(e,-1),x=_slicedToArray(E,1);return c=x[0],h.origin=["STRING",null,{first_line:h[2].first_line,first_column:h[2].first_column,last_line:c[2].last_line,last_column:c[2].last_column}],h[2]=h.origin[2],y=this.token("STRING_END",")"),y[2]={first_line:c[2].last_line,first_column:c[2].last_column,last_line:c[2].last_line,last_column:c[2].last_column}}}},{key:"pair",value:function pair(e){var a,o,n,r,l,s,i;if(l=this.ends,a=t.call(l,-1),o=_slicedToArray(a,1),r=o[0],a,e!==(i=null==r?void 0:r.tag)){var d,c;return"OUTDENT"!==i&&this.error("unmatched "+e),s=this.indents,d=t.call(s,-1),c=_slicedToArray(d,1),n=c[0],d,this.outdentToken(n,!0),this.pair(e)}return this.ends.pop()}},{key:"getLineAndColumnFromChunk",value:function getLineAndColumnFromChunk(e){var a,o,n,r,l;if(0===e)return[this.chunkLine,this.chunkColumn];if(l=e>=this.chunk.length?this.chunk:this.chunk.slice(0,+(e-1)+1||9e9),n=he(l,"\n"),a=this.chunkColumn,0<n){var s,i;r=l.split("\n"),s=t.call(r,-1),i=_slicedToArray(s,1),o=i[0],s,a=o.length}else a+=l.length;return[this.chunkLine+n,a]}},{key:"makeToken",value:function makeToken(e,a){var t=2<arguments.length&&void 0!==arguments[2]?arguments[2]:0,o=3<arguments.length&&void 0!==arguments[3]?arguments[3]:a.length,n,r,l;r={};var s=this.getLineAndColumnFromChunk(t),i=_slicedToArray(s,2);r.first_line=i[0],r.first_column=i[1],n=0<o?o-1:0;var d=this.getLineAndColumnFromChunk(t+n),c=_slicedToArray(d,2);return r.last_line=c[0],r.last_column=c[1],l=[e,a,r],l}},{key:"token",value:function(e,a,t,o,n){var r;return r=this.makeToken(e,a,t,o),n&&(r.origin=n),this.tokens.push(r),r}},{key:"tag",value:function tag(){var e,a,o,n;return o=this.tokens,e=t.call(o,-1),a=_slicedToArray(e,1),n=a[0],e,null==n?void 0:n[0]}},{key:"value",value:function value(){var e=!!(0<arguments.length&&void 0!==arguments[0])&&arguments[0],a,o,n,r,l;return n=this.tokens,a=t.call(n,-1),o=_slicedToArray(a,1),l=o[0],a,e&&null!=(null==l?void 0:l.origin)?null==(r=l.origin)?void 0:r[1]:null==l?void 0:l[1]}},{key:"prev",value:function prev(){return this.tokens[this.tokens.length-1]}},{key:"unfinished",value:function unfinished(){var e;return F.test(this.chunk)||(e=this.tag(),0<=a.call(ie,e))}},{key:"formatString",value:function formatString(e,a){return this.replaceUnicodeCodePointEscapes(e.replace(ae,"$1"),a)}},{key:"formatHeregex",value:function formatHeregex(e,a){return this.formatRegex(e.replace(_,"$1$2"),Ne(a,{delimiter:"///"}))}},{key:"formatRegex",value:function formatRegex(e,a){return this.replaceUnicodeCodePointEscapes(e,a)}},{key:"unicodeCodePointToUnicodeEscapes",value:function unicodeCodePointToUnicodeEscapes(e){var a,t,o;return(o=function(e){var a;return a=e.toString(16),"\\u"+ve("0",4-a.length)+a},65536>e)?o(e):(a=_Mathfloor((e-65536)/1024)+55296,t=(e-65536)%1024+56320,""+o(a)+o(t))}},{key:"replaceUnicodeCodePointEscapes",value:function replaceUnicodeCodePointEscapes(e,t){var o=this,n;return n=null!=t.flags&&0>a.call(t.flags,"u"),e.replace(de,function(e,a,r,l){var s;return a?a:(s=parseInt(r,16),1114111<s&&o.error("unicode code point escapes greater than \\u{10ffff} are not allowed",{offset:l+t.delimiter.length,length:r.length+4}),n?o.unicodeCodePointToUnicodeEscapes(s):e)})}},{key:"validateEscapes",value:function validateEscapes(e){var a=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{},t,o,n,r,l,s,i,d,c,p;if(r=a.isRegex?X:ee,l=r.exec(e),!!l)return l[0],t=l[1],i=l[2],o=l[3],p=l[4],c=l[5],s=i?"octal escape sequences are not allowed":"invalid escape sequence",n="\\"+(i||o||p||c),this.error(s+" "+n,{offset:(null==(d=a.offsetInChunk)?0:d)+l.index+t.length,length:n.length})}},{key:"makeDelimitedLiteral",value:function makeDelimitedLiteral(e){var a=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{},t;return""===e&&"/"===a.delimiter&&(e="(?:)"),t=RegExp("(\\\\\\\\)|(\\\\0(?=[1-7]))|\\\\?("+a.delimiter+")|\\\\?(?:(\\n)|(\\r)|(\\u2028)|(\\u2029))|(\\\\.)","g"),e=e.replace(t,function(e,t,o,n,r,l,s,i,d){switch(!1){case!t:return a.double?t+t:t;case!o:return"\\x00";case!n:return"\\"+n;case!r:return"\\n";case!l:return"\\r";case!s:return"\\u2028";case!i:return"\\u2029";case!d:return a.double?"\\"+d:d}}),""+a.delimiter+e+a.delimiter}},{key:"suppressSemicolons",value:function suppressSemicolons(){var e,t,o;for(o=[];";"===this.value();)this.tokens.pop(),(e=null==(t=this.prev())?void 0:t[0],0<=a.call(["="].concat(_toConsumableArray(ie)),e))?o.push(this.error("unexpected ;")):o.push(void 0);return o}},{key:"error",value:function error(e){var a=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{},t,o,n,r,l,s,i;return l="first_line"in a?a:(t=this.getLineAndColumnFromChunk(null==(s=a.offset)?0:s),o=_slicedToArray(t,2),r=o[0],n=o[1],t,{first_line:r,first_column:n,last_column:n+(null==(i=a.length)?1:i)-1}),$e(e,l)}}]),e}(),ye=function(e){var t=1<arguments.length&&void 0!==arguments[1]?arguments[1]:e;switch(!1){case 0>a.call([].concat(_toConsumableArray(R),_toConsumableArray(c)),e):return"keyword '"+t+"' can't be assigned";case 0>a.call(Z,e):return"'"+t+"' can't be assigned";case 0>a.call(q,e):return"reserved word '"+t+"' can't be assigned";default:return!1}},e.isUnassignable=ye,fe=function(e){var a;return"IDENTIFIER"===e[0]?("from"===e[1]&&(e[1][0]="IDENTIFIER",!0),!0):"FOR"!==e[0]&&"{"!==(a=e[1])&&"["!==a&&","!==a&&":"!==a},R=["true","false","null","this","new","delete","typeof","in","instanceof","return","throw","break","continue","debugger","yield","await","if","else","switch","for","while","do","try","catch","finally","class","extends","super","import","export","default"],c=["undefined","Infinity","NaN","then","unless","until","loop","of","by","when"],d={and:"&&",or:"||",is:"==",isnt:"!=",not:"!",yes:"true",no:"false",on:"true",off:"false"},i=function(){var e;for(ke in e=[],d)e.push(ke);return e}(),c=c.concat(i),q=["case","function","var","void","with","const","let","enum","native","implements","interface","package","private","protected","public","static"],Z=["arguments","eval"],e.JS_FORBIDDEN=R.concat(q).concat(Z),n=65279,D=/^(?!\d)((?:(?!\s)[$\w\x7f-\uffff])+)([^\n\S]*:(?!:))?/,y=/^(?![\d<])((?:(?!\s)[\.\-$\w\x7f-\uffff])+)/,f=/^()>/,g=/^(?!\d)((?:(?!\s)[\-$\w\x7f-\uffff])+)([^\S]*=(?!=))?/,U=/^0b[01]+|^0o[0-7]+|^0x[\da-f]+|^\d*\.?\d+(?:e[+-]?\d+)?/i,V=/^(?:[-=]>|[-+*\/%<>&|^!?=]=|>>>=?|([-+:])\1|([&|<>*\/%])\2=?|\?(\.|::)|\.{2,3})/,pe=/^[^\n\S]+/,p=/^\s*###([^#][\s\S]*?)(?:###[^\n\S]*|###$)|^(?:\s*#(?!##[^#]).*)+/,s=/^[-=]>/,j=/^(?:\n[^\n\S]*)+/,A=/^`(?!``)((?:[^`\\]|\\[\s\S])*)`/,C=/^```((?:[^`\\]|\\[\s\S]|`(?!``))*)```/,oe=/^(?:'''|"""|'|")/,te=/^(?:[^\\']|\\[\s\S])*/,Q=/^(?:[^\\"#]|\\[\s\S]|\#(?!\{))*/,b=/^(?:[^\\']|\\[\s\S]|'(?!''))*/,N=/^(?:[^\\"#]|\\[\s\S]|"(?!"")|\#(?!\{))*/,I=/^(?:[^\{<])*/,k=/^(?:\{|<(?!\/))/,ae=/((?:\\\\)+)|\\[^\S\n]*\n\s*/g,K=/\s*\n\s*/g,v=/\n+([^\n\S]*)(?=\S)/g,G=/^\/(?!\/)((?:[^[\/\n\\]|\\[^\n]|\[(?:\\[^\n]|[^\]\n\\])*\])*)(\/)?/,H=/^\w*/,ce=/^(?!.*(.).*\1)[imguy]*$/,$=/^(?:[^\\\/#\s]|\\[\s\S]|\/(?!\/\/)|\#(?!\{)|\s+(?:#(?!\{).*)?)*/,_=/((?:\\\\)+)|\\(\s)|\s+(?:#.*)?/g,W=/^(\/|\/{3}\s*)(\*)/,B=/^\/=?\s/,T=/\*\//,F=/^\s*(?:,|\??\.(?![.\d])|::)/,ee=/((?:^|[^\\])(?:\\\\)*)\\(?:(0[0-7]|[1-7])|(x(?![\da-fA-F]{2}).{0,2})|(u\{(?![\da-fA-F]{1,}\})[^}]*\}?)|(u(?!\{|[\da-fA-F]{4}).{0,4}))/,X=/((?:^|[^\\])(?:\\\\)*)\\(?:(0[0-7])|(x(?![\da-fA-F]{2}).{0,2})|(u\{(?![\da-fA-F]{1,}\})[^}]*\}?)|(u(?!\{|[\da-fA-F]{4}).{0,4}))/,de=/(\\\\)|\\u\{([\da-fA-F]+)\}/g,O=/^[^\n\S]*\n/,ne=/\n[^\n\S]*$/,re=/\s+$/,h=["-=","+=","/=","*=","%=","||=","&&=","?=","<<=",">>=",">>>=","&=","^=","|=","**=","//=","%%="],le=["NEW","TYPEOF","DELETE","DO"],se=["!","~"],J=["<<",">>",">>>"],m=["==","!=","<",">","<=",">="],P=["*","/","%","//","%%"],Y=["IN","OF","INSTANCEOF"],r=["TRUE","FALSE"],l=["IDENTIFIER","PROPERTY",")","]","?","@","THIS","SUPER"],x=l.concat(["NUMBER","INFINITY","NAN","STRING","STRING_END","REGEX","REGEX_END","BOOL","NULL","UNDEFINED","}","::"]),u=["IDENTIFIER",")","]","NUMBER"],M=x.concat(["++","--"]),L=["INDENT","OUTDENT","TERMINATOR"],E=[")","}","]"],ie=["\\",".","?.","?::","UNARY","MATH","UNARY_MATH","+","-","**","SHIFT","RELATION","COMPARE","&","^","|","&&","||","BIN?","EXTENDS"]}.call(this),{exports:e}.exports}(),require["./parser"]=function(){var e={},a={exports:e},t=function(){function e(){this.yy={}}var a=function(e,a,t,o){for(t=t||{},o=e.length;o--;t[e[o]]=a);return t},t=[1,24],o=[1,56],n=[1,91],r=[1,92],l=[1,87],s=[1,93],i=[1,94],d=[1,89],c=[1,90],p=[1,64],u=[1,66],m=[1,67],h=[1,68],g=[1,69],f=[1,70],y=[1,72],k=[1,73],T=[1,58],N=[1,42],v=[1,36],b=[1,76],$=[1,77],_=[1,86],C=[1,54],D=[1,59],E=[1,60],x=[1,74],I=[1,75],S=[1,47],A=[1,55],R=[1,71],O=[1,81],L=[1,82],F=[1,83],w=[1,84],P=[1,53],j=[1,80],M=[1,38],U=[1,39],V=[1,40],B=[1,41],G=[1,43],H=[1,44],W=[1,95],X=[1,6,36,47,146],Y=[1,6,35,36,47,69,70,93,127,135,146,149,157],q=[1,113],z=[1,114],J=[1,115],K=[1,110],Z=[1,98],Q=[1,97],ee=[1,96],ae=[1,99],te=[1,100],oe=[1,101],ne=[1,102],re=[1,103],le=[1,104],se=[1,105],ie=[1,106],de=[1,107],ce=[1,108],pe=[1,109],ue=[1,117],me=[1,6,35,36,47,69,70,83,88,93,109,127,135,146,148,149,150,156,157,174,178,179,182,183,184,185,186,187,188,189,190,191,192,193],he=[2,196],ge=[1,123],fe=[1,128],ye=[1,124],ke=[1,125],Te=[1,126],Ne=[1,129],ve=[1,122],be=[1,6,35,36,47,69,70,93,127,135,146,148,149,150,156,157,174],$e=[1,6,35,36,45,46,47,69,70,80,81,83,88,93,101,102,103,105,109,125,126,127,135,146,148,149,150,156,157,174,178,179,182,183,184,185,186,187,188,189,190,191,192,193],_e=[2,122],Ce=[2,126],De=[6,35,88,93],Ee=[2,99],xe=[1,141],Ie=[1,135],Se=[1,140],Ae=[1,144],Re=[1,149],Oe=[1,147],Le=[1,151],Fe=[1,155],we=[1,153],Pe=[1,6,35,36,45,46,47,61,69,70,80,81,83,88,93,101,102,103,105,109,125,126,127,135,146,148,149,150,156,157,174,178,179,182,183,184,185,186,187,188,189,190,191,192,193],je=[2,119],Me=[1,6,36,47,69,70,83,88,93,109,127,135,146,148,149,150,156,157,174,178,179,182,183,184,185,186,187,188,189,190,191,192,193],Ue=[2,31],Ve=[1,183],Be=[2,86],Ge=[1,187],He=[1,193],We=[1,208],Xe=[1,203],Ye=[1,212],qe=[1,209],ze=[1,214],Je=[1,215],Ke=[1,217],Ze=[14,32,35,38,39,43,45,46,49,50,54,55,56,57,58,59,68,77,84,85,86,90,91,107,110,112,120,129,130,140,144,145,148,150,153,156,167,173,176,177,178,179,180,181],Qe=[1,6,35,36,45,46,47,61,69,70,80,81,83,88,93,101,102,103,105,109,111,125,126,127,135,146,148,149,150,156,157,174,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194],ea=[1,228],aa=[2,142],ta=[1,250],oa=[1,245],na=[1,256],ra=[1,6,35,36,45,46,47,65,69,70,80,81,83,88,93,101,102,103,105,109,125,126,127,135,146,148,149,150,156,157,174,178,179,182,183,184,185,186,187,188,189,190,191,192,193],la=[1,6,33,35,36,45,46,47,61,65,69,70,80,81,83,88,93,101,102,103,105,109,111,117,125,126,127,135,146,148,149,150,156,157,164,165,166,174,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194],sa=[1,6,35,36,45,46,47,52,65,69,70,80,81,83,88,93,101,102,103,105,109,125,126,127,135,146,148,149,150,156,157,174,178,179,182,183,184,185,186,187,188,189,190,191,192,193],ia=[1,286],da=[45,46,126],ca=[1,297],pa=[1,296],ua=[6,35],ma=[2,97],ha=[1,303],ga=[6,35,36,88,93],fa=[6,35,36,61,70,88,93],ya=[1,6,35,36,47,69,70,80,81,83,88,93,101,102,103,105,109,127,135,146,148,149,150,156,157,174,178,179,182,183,184,185,186,187,188,189,190,191,192,193],ka=[1,6,35,36,47,69,70,83,88,93,109,127,135,146,148,149,150,156,157,174,178,179,183,184,185,186,187,188,189,190,191,192,193],Ta=[2,347],Na=[1,6,35,36,47,69,70,83,88,93,109,127,135,146,148,149,150,156,157,174,178,179,183,185,186,187,188,189,190,191,192,193],va=[45,46,80,81,101,102,103,105,125,126],ba=[1,330],$a=[1,6,35,36,47,69,70,83,88,93,109,127,135,146,148,149,150,156,157,174],_a=[2,84],Ca=[1,346],Da=[1,348],Ea=[1,353],xa=[1,355],Ia=[6,35,69,93],Sa=[2,221],Aa=[2,222],Ra=[1,6,35,36,45,46,47,61,69,70,80,81,83,88,93,101,102,103,105,109,125,126,127,135,146,148,149,150,156,157,164,165,166,174,178,179,182,183,184,185,186,187,188,189,190,191,192,193],Oa=[1,369],La=[6,14,32,35,36,38,39,43,45,46,49,50,54,55,56,57,58,59,68,69,70,77,84,85,86,90,91,93,107,110,112,120,129,130,140,144,145,148,150,153,156,167,173,176,177,178,179,180,181],Fa=[6,35,36,69,93],wa=[6,35,36,69,93,127],Pa=[1,6,35,36,45,46,47,61,65,69,70,80,81,83,88,93,101,102,103,105,109,111,125,126,127,135,146,148,149,150,156,157,164,165,166,174,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194],ja=[1,6,35,36,47,69,70,83,88,93,109,127,135,146,157,174],Ma=[1,6,35,36,47,69,70,83,88,93,109,127,135,146,149,157,174],Ua=[2,273],Va=[164,165,166],Ba=[93,164,165,166],Ga=[6,35,109],Ha=[1,393],Wa=[6,35,36,93,109],Xa=[6,35,36,65,93,109],Ya=[1,399],qa=[1,400],za=[6,35,36,61,65,70,80,81,93,109,126],Ja=[6,35,36,70,80,81,93,109,126],Ka=[1,6,35,36,47,69,70,83,88,93,109,127,135,146,148,149,150,156,157,174,178,179,185,186,187,188,189,190,191,192,193],Za=[2,339],Qa=[2,338],et=[1,6,35,36,45,46,47,52,69,70,80,81,83,88,93,101,102,103,105,109,125,126,127,135,146,148,149,150,156,157,174,178,179,182,183,184,185,186,187,188,189,190,191,192,193],at=[1,422],tt=[14,32,38,39,43,45,46,49,50,54,55,56,57,58,59,68,77,83,84,85,86,90,91,107,110,112,120,129,130,140,144,145,148,150,153,156,167,173,176,177,178,179,180,181],ot=[2,207],nt=[6,35,36],rt=[2,98],lt=[1,431],st=[1,432],it=[1,6,35,36,47,69,70,80,81,83,88,93,101,102,103,105,109,127,135,142,143,146,148,149,150,156,157,1