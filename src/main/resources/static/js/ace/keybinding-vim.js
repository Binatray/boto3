define("ace/keyboard/vim",["require","exports","module","ace/range","ace/lib/event_emitter","ace/lib/dom","ace/lib/oop","ace/lib/keys","ace/lib/event","ace/search","ace/lib/useragent","ace/search_highlight","ace/commands/multi_select_commands","ace/mode/text","ace/multi_select"], function(require, exports, module) {
  'use strict';

  function log() {
    var d = "";
    function format(p) {
      if (typeof p != "object")
        return p + "";
      if ("line" in p) {
        return p.line + ":" + p.ch;
      }
      if ("anchor" in p) {
        return format(p.anchor) + "->" + format(p.head);
      }
      if (Array.isArray(p))
        return "[" + p.map(function(x) {
          return format(x);
        }) + "]";
      return JSON.stringify(p);
    }
    for (var i = 0; i < arguments.length; i++) {
      var p = arguments[i];
      var f = format(p);
      d += f + "  ";
    }
    console.log(d);
  }
  var Range = require("../range").Range;
  var EventEmitter = require("../lib/event_emitter").EventEmitter;
  var dom = require("../lib/dom");
  var oop = require("../lib/oop");
  var KEYS = require("../lib/keys");
  var event = require("../lib/event");
  var Search = require("../search").Search;
  var useragent = require("../lib/useragent");
  var SearchHighlight = require("../search_highlight").SearchHighlight;
  var multiSelectCommands = require("../commands/multi_select_commands");
  var TextModeTokenRe = require("../mode/text").Mode.prototype.tokenRe;
  require("../multi_select");

  var CodeMirror = function(ace) {
    this.ace = ace;
    this.state = {};
    this.marks = {};
    this.$uid = 0;
    this.onChange = this.onChange.bind(this);
    this.onSelectionChange = this.onSelectionChange.bind(this);
    this.onBeforeEndOperation = this.onBeforeEndOperation.bind(this);
    this.ace.on('change', this.onChange);
    this.ace.on('changeSelection', this.onSelectionChange);
    this.ace.on('beforeEndOperation', this.onBeforeEndOperation);
  };
  CodeMirror.Pos = function(line, ch) {
    if (!(this instanceof Pos)) return new Pos(line, ch);
    this.line = line; this.ch = ch;
  };
  CodeMirror.defineOption = function(name, val, setter) {};
  CodeMirror.commands = {
    redo: function(cm) { cm.ace.redo(); },
    undo: function(cm) { cm.ace.undo(); },
    newlineAndIndent: function(cm) { cm.ace.insert("\n"); }
  };
  CodeMirror.keyMap = {};
  CodeMirror.addClass = CodeMirror.rmClass = function() {};
  CodeMirror.e_stop = CodeMirror.e_preventDefault = event.stopEvent;
  CodeMirror.keyName = function(e) {
    var key = (KEYS[e.keyCode] || e.key || "");
    if (key.length == 1) key = key.toUpperCase();
    key = event.getModifierString(e).replace(/(^|-)\w/g, function(m) {
      return m.toUpperCase();
    }) + key;
    return key;
  };
  CodeMirror.keyMap['default'] = function(key) {
    return function(cm) {
      var cmd = cm.ace.commands.commandKeyBinding[key.toLowerCase()];
      return cmd && cm.ace.execCommand(cmd) !== false;
    };
  };
  CodeMirror.lookupKey = function lookupKey(key, map, handle) {
    if (typeof map == "string")
      map = CodeMirror.keyMap[map];
    var found = typeof map == "function" ? map(key) : map[key];
    if (found === false) return "nothing";
    if (found === "...") return "multi";
    if (found != null && handle(found)) return "handled";

    if (map.fallthrough) {
      if (!Array.isArray(map.fallthrough))
        return lookupKey(key, map.fallthrough, handle);
      for (var i = 0; i < map.fallthrough.length; i++) {
        var result = lookupKey(key, map.fallthrough[i], handle);
        if (result) return result;
      }
    }
  };

  CodeMirror.signal = function(o, name, e) { return o._signal(name, e) };
  CodeMirror.on = event.addListener;
  CodeMirror.off = event.removeListener;
  CodeMirror.isWordChar = function(ch) {
    if (ch < "\x7f") return /^\w$/.test(ch);
    TextModeTokenRe.lastIndex = 0;
    return TextModeTokenRe.test(ch);
  };
  
(function() {
  oop.implement(CodeMirror.prototype, EventEmitter);
  
  this.destroy = function() {
    this.ace.off('change', this.onChange);
    this.ace.off('changeSelection', this.onSelectionChange);
    this.ace.off('beforeEndOperation', this.onBeforeEndOperation);
    this.removeOverlay();
  };
  this.virtualSelectionMode = function() {
    return this.ace.inVirtualSelectionMode && this.ace.selection.index;
  };
  this.onChange = function(delta) {
    var change = { text: delta.action[0] == 'i' ? delta.lines : [] };
    var curOp = this.curOp = this.curOp || {};
    if (!curOp.changeHandlers)
      curOp.changeHandlers = this._eventRegistry["change"] && this._eventRegistry["change"].slice();
    if (this.virtualSelectionMode()) return;
    if (!curOp.lastChange) {
      curOp.lastChange = curOp.change = change;
    } else {
      curOp.lastChange.next = curOp.lastChange = change;
    }
    this.$updateMarkers(delta);
  };
  this.onSelectionChange = function() {
    var curOp = this.curOp = this.curOp || {};
    if (!curOp.cursorActivityHandlers)
      curOp.cursorActivityHandlers = this._eventRegistry["cursorActivity"] && this._eventRegistry["cursorActivity"].slice();
    this.curOp.cursorActivity = true;
    if (this.ace.inMultiSelectMode) {
      this.ace.keyBinding.removeKeyboardHandler(multiSelectCommands.keyboardHandler);
    }
  };
  this.operation = function(fn, force) {
    if (!force && this.curOp || force && this.curOp && this.curOp.force) {
      return fn();
    }
    if (force || !this.ace.curOp) {
      if (this.curOp)
        this.onBeforeEndOperation();
    }
    if (!this.ace.curOp) {
      var prevOp = this.ace.prevOp;
      this.ace.startOperation({
        command: { name: "vim",  scrollIntoView: "cursor" }
      });
    }
    var curOp = this.curOp = this.curOp || {};
    this.curOp.force = force;
    var result = fn();
    if (this.ace.curOp && this.ace.curOp.command.name == "vim") {
      if (this.state.dialog)
        this.ace.curOp.command.scrollIntoView = false;
      this.ace.endOperation();
      if (!curOp.cursorActivity && !curOp.lastChange && prevOp)
        this.ace.prevOp = prevOp;
    }
    if (force || !this.ace.curOp) {
      if (this.curOp)
        this.onBeforeEndOperation();
    }
    return result;
  };
  this.onBeforeEndOperation = function() {
    var op = this.curOp;
    if (op) {
      if (op.change) { this.signal("change", op.change, op); }
      if (op && op.cursorActivity) { this.signal("cursorActivity", null, op); }
      this.curOp = null;
    }
  };

  this.signal = function(eventName, e, handlers) {
    var listeners = handlers ? handlers[eventName + "Handlers"]
        : (this._eventRegistry || {})[eventName];
    if (!listeners)
        return;
    listeners = listeners.slice();
    for (var i=0; i<listeners.length; i++)
        listeners[i](this, e);
  };
  this.firstLine = function() { return 0; };
  this.lastLine = function() { return this.ace.session.getLength() - 1; };
  this.lineCount = function() { return this.ace.session.getLength(); };
  this.setCursor = function(line, ch) {
    if (typeof line === 'object') {
      ch = line.ch;
      line = line.line;
    }
    if (!this.ace.inVirtualSelectionMode)
      this.ace.exitMultiSelectMode();
    this.ace.session.unfold({row: line, column: ch});
    this.ace.selection.moveTo(line, ch);
  };
  this.getCursor = function(p) {
    var sel = this.ace.selection;
    var pos = p == 'anchor' ? (sel.isEmpty() ? sel.lead : sel.anchor) :
        p == 'head' || !p ? sel.lead : sel.getRange()[p];
    return toCmPos(pos);
  };
  this.listSelections = function(p) {
    var ranges = this.ace.multiSelect.rangeList.ranges;
    if (!ranges.length || this.ace.inVirtualSelectionMode)
      return [{anchor: this.getCursor('anchor'), head: this.getCursor('head')}];
    return ranges.map(function(r) {
      return {
        anchor: this.clipPos(toCmPos(r.cursor == r.end ? r.start : r.end)),
        head: this.clipPos(toCmPos(r.cursor))
      };
    }, this);
  };
  this.setSelections = function(p, primIndex) {
    var sel = this.ace.multiSelect;
    var ranges = p.map(function(x) {
      var anchor = toAcePos(x.anchor);
      var head = toAcePos(x.head);
      var r = Range.comparePoints(anchor, head) < 0
        ? new Range.fromPoints(anchor, head)
        : new Range.fromPoints(head, anchor);
      r.cursor = Range.comparePoints(r.start, head) ? r.end : r.start;
      return r;
    });
    
    if (this.ace.inVirtualSelectionMode) {
      this.ace.selection.fromOrientedRange(ranges[0]);
      return;
    }
    if (!primIndex) {
        ranges = ranges.reverse();
    } else if (ranges[primIndex]) {
       ranges.push(ranges.splice(primIndex, 1)[0]);
    }
    sel.toSingleRange(ranges[0].clone());
    var session = this.ace.session;
    for (var i = 0; i < ranges.length; i++) {
      var range = session.$clipRangeToDocument(ranges[i]); // todo why ace doesn't do this?
      sel.addRange(range);
    }
  };
  this.setSelection = function(a, h, options) {
    var sel = this.ace.selection;
    sel.moveTo(a.line, a.ch);
    sel.selectTo(h.line, h.ch);
    if (options && options.origin == '*mouse') {
      this.onBeforeEndOperation();
    }
  };
  this.somethingSelected = function(p) {
    return !this.ace.selection.isEmpty();
  };
  this.clipPos = function(p) {
    var pos = this.ace.session.$clipPositionToDocument(p.line, p.ch);
    return toCmPos(pos);
  };
  this.markText = function(cursor) {
    return {clear: function() {}, find: function() {}};
  };
  this.$updateMarkers = function(delta) {
    var isInsert = delta.action == "insert";
    var start = delta.start;
    var end = delta.end;
    var rowShift = (end.row - start.row) * (isInsert ? 1 : -1);
    var colShift = (end.column - start.column) * (isInsert ? 1 : -1);
    if (isInsert) end = start;
    
    for (var i in this.marks) {
      var point = this.marks[i];
      var cmp = Range.comparePoints(point, start);
      if (cmp < 0) {
        continue; // delta starts after the range
      }
      if (cmp === 0) {
        if (isInsert) {
          if (point.bias == 1) {
            cmp = 1;
          } else {
            point.bias = -1;
            continue;
          }
        }
      }
      var cmp2 = isInsert ? cmp : Range.comparePoints(point, end);
      if (cmp2 > 0) {
        point.row += rowShift;
        point.column += point.row == end.row ? colShift : 0;
        continue;
      }
      if (!isInsert && cmp2 <= 0) {
        point.row = start.row;
        point.column = start.column;
        if (cmp2 === 0)
          point.bias = 1;
      }
    }
  };
  var Marker = function(cm, id, row, column) {
    this.cm = cm;
    this.id = id;
    this.row = row;
    this.column = column;
    cm.marks[this.id] = this;
  };
  Marker.prototype.clear = function() { delete this.cm.marks[this.id] };
  Marker.prototype.find = function() { return toCmPos(this) };
  this.setBookmark = function(cursor, options) {
    var bm = new Marker(this, this.$uid++, cursor.line, cursor.ch);
    if (!options || !options.insertLeft)
      bm.$insertRight = true;
    this.marks[bm.id] = bm;
    return bm;
  };
  this.moveH = function(increment, unit) {
    if (unit == 'char') {
      var sel = this.ace.selection;
      sel.clearSelection();
      sel.moveCursorBy(0, increment);
    }
  };
  this.findPosV = function(start, amount, unit, goalColumn) {
    if (unit == 'page') {
      var renderer = this.ace.renderer;
      var config = renderer.layerConfig;
      amount = amount * Math.floor(config.height / config.lineHeight);
      unit = 'line';
    }
    if (unit == 'line') {
      var screenPos = this.ace.session.documentToScreenPosition(start.line, start.ch);
      if (goalColumn != null)
        screenPos.column = goalColumn;
      screenPos.row += amount;
      screenPos.row = Math.min(Math.max(0, screenPos.row), this.ace.session.getScreenLength() - 1);
      var pos = this.ace.session.screenToDocumentPosition(screenPos.row, screenPos.column);
      return toCmPos(pos);
    } else {
      debugger;
    }
  };
  this.charCoords = function(pos, mode) {
    if (mode == 'div' || !mode) {
      var sc = this.ace.session.documentToScreenPosition(pos.line, pos.ch);
      return {left: sc.column, top: sc.row};
    }if (mode == 'local') {
      var renderer = this.ace.renderer;
      var sc = this.ace.session.documentToScreenPosition(pos.line, pos.ch);
      var lh = renderer.layerConfig.lineHeight;
      var cw = renderer.layerConfig.characterWidth;
      var top = lh * sc.row;
      return {left: sc.column * cw, top: top, bottom: top + lh};
    }
  };
  this.coordsChar = function(pos, mode) {
    var renderer = this.ace.renderer;
    if (mode == 'local') {
      var row = Math.max(0, Math.floor(pos.top / renderer.lineHeight));
      var col = Math.max(0, Math.floor(pos.left / renderer.characterWidth));
      var ch = renderer.session.screenToDocumentPosition(row, col);
      return toCmPos(ch);
    } else if (mode == 'div') {
      throw "not implemented";
    }
  };
  this.getSearchCursor = function(query, pos, caseFold) {
    var caseSensitive = false;
    var isRegexp = false;
    if (query instanceof RegExp && !query.global) {
      caseSensitive = !query.ignoreCase;
      query = query.source;
      isRegexp = true;
    }
    var search = new Search();
    if (pos.ch == undefined) pos.ch = Number.MAX_VALUE;
    var acePos = {row: pos.line, column: pos.ch};
    var cm = this;
    var last = null;
    return {
      findNext: function() { return this.find(false) },
      findPrevious: function() {return this.find(true) },
      find: function(back) {
        search.setOptions({
          needle: query,
          caseSensitive: caseSensitive,
          wrap: false,
          backwards: back,
          regExp: isRegexp,
          start: last || acePos
        });
        var range = search.find(cm.ace.session);
        if (range && range.isEmpty()) {
          if (cm.getLine(range.start.row).length == range.start.column) {
            search.$options.start = range;
            range = search.find(cm.ace.session);
          }
        }
        last = range;
        return last;
      },
      from: function() { return last && toCmPos(last.start) },
      to: function() { return last && toCmPos(last.end) },
      replace: function(text) {
        if (last) {
          last.end = cm.ace.session.doc.replace(last, text);
        }
      }
    };
  };
  this.scrollTo = function(x, y) {
    var renderer = this.ace.renderer;
    var config = renderer.layerConfig;
    var maxHeight = config.maxHeight;
    maxHeight -= (renderer.$size.scrollerHeight - renderer.lineHeight) * renderer.$scrollPastEnd;
    if (y != null) this.ace.session.setScrollTop(Math.max(0, Math.min(y, maxHeight)));
    if (x != null) this.ace.session.setScrollLeft(Math.max(0, Math.min(x, config.width)));
  };
  this.scrollInfo = function() { return 0; };
  this.scrollIntoView = function(pos, margin) {
    if (pos) {
      var renderer = this.ace.renderer;
      var viewMargin = { "top": 0, "bottom": margin };
      renderer.scrollCursorIntoView(toAcePos(pos),
        (renderer.lineHeight * 2) / renderer.$size.scrollerHeight, viewMargin);
    }
  };
  this.getLine = function(row) { return this.ace.session.getLine(row) };
  this.getRange = function(s, e) {
    return this.ace.session.getTextRange(new Range(s.line, s.ch, e.line, e.ch));
  };
  this.replaceRange = function(text, s, e) {
    if (!e) e = s;
    return this.ace.session.replace(new Range(s.line, s.ch, e.line, e.ch), text);
  };
  this.replaceSelections = function(p) {
    var sel = this.ace.selection;
    if (this.ace.inVirtualSelectionMode) {
      this.ace.session.replace(sel.getRange(), p[0] || "");
      return;
    }
    sel.inVirtualSelectionMode = true;
    var ranges = sel.rangeList.ranges;
    if (!ranges.length) ranges = [this.ace.multiSelect.getRange()];
    for (var i = ranges.length; i--;)
       this.ace.session.replace(ranges[i], p[i] || "");
    sel.inVirtualSelectionMode = false;
  };
  this.getSelection = function() {
    return this.ace.getSelectedText();
  };
  this.getSelections = function() {
    return this.listSelections().map(function(x) {
      return this.getRange(x.anchor, x.head);
    }, this);
  };
  this.getInputField = function() {
    return this.ace.textInput.getElement();
  };
  this.getWrapperElement = function() {
    return this.ace.containter;
  };
  var optMap = {
    indentWithTabs: "useSoftTabs",
    indentUnit: "tabSize",
    tabSize: "tabSize",
    firstLineNumber: "firstLineNumber",
    readOnly: "readOnly"
  };
  this.setOption = function(name, val) {
    this.state[name] = val;
    switch (name) {
      case 'indentWithTabs':
        name = optMap[name];
        val = !val;
      break;
      default:
        name = optMap[name];
    }
    if (name)
      this.ace.setOption(name, val);
  };
  this.getOption = function(name, val) {
    var aceOpt = optMap[name];
    if (aceOpt)
      val = this.ace.getOption(aceOpt);
    switch (name) {
      case 'indentWithTabs':
        name = optMap[name];
        return !val;
    }
    return aceOpt ? val : this.state[name];
  };
  this.toggleOverwrite = function(on) {
    this.state.overwrite = on;
    return this.ace.setOverwrite(on);
  };
  this.addOverlay = function(o) {
    if (!this.$searchHighlight || !this.$searchHighlight.session) {
      var highlight = new SearchHighlight(null, "ace_highlight-marker", "text");
      var marker = this.ace.session.addDynamicMarker(highlight);
      highlight.id = marker.id;
      highlight.session = this.ace.session;
      highlight.destroy = function(o) {
        highlight.session.off("change", highlight.updateOnChange);
        highlight.session.off("changeEditor", highlight.destroy);
        highlight.session.removeMarker(highlight.id);
        highlight.session = null;
      };
      highlight.updateOnChange = function(delta) {
        var row = delta.start.row;
        if (row == delta.end.row) highlight.cache[row] = undefined;
        else highlight.cache.splice(row, highlight.cache.length);
      };
      highlight.session.on("changeEditor", highlight.destroy);
      highlight.session.on("change", highlight.updateOnChange);
    }
    var re = new RegExp(o.query.source, "gmi");
    this.$searchHighlight = o.highlight = highlight;
    this.$searchHighlight.setRegexp(re);
    this.ace.renderer.updateBackMarkers();
  };
  this.removeOverlay = function(o) {
    if (this.$searchHighlight && this.$searchHighlight.session) {
      this.$searchHighlight.destroy();
    }
  };
  this.getScrollInfo = function() {
    var renderer = this.ace.renderer;
    var config = renderer.layerConfig;
    return {
      left: renderer.scrollLeft,
      top: renderer.scrollTop,
      height: config.maxHeight,
      width: config.width,
      clientHeight: config.height,
      clientWidth: config.width
    };
  };
  this.getValue = function() {
    return this.ace.getValue();
  };
  this.setValue = function(v) {
    return this.ace.setValue(v);
  };
  this.getTokenTypeAt = function(pos) {
    var token = this.ace.session.getTokenAt(pos.line, pos.ch);
    return token && /comment|string/.test(token.type) ? "string" : "";
  };
  this.findMatchingBracket = function(pos) {
    var m = this.ace.session.findMatchingBracket(toAcePos(pos));
    return {to: m && toCmPos(m)};
  };
  this.indentLine = function(line, method) {
    if (method === true)
        this.ace.session.indentRows(line, line, "\t");
    else if (method === false)
        this.ace.session.outdentRows(new Range(line, 0, line, 0));
  };
  this.indexFromPos = function(pos) {
    return this.ace.session.doc.positionToIndex(toAcePos(pos));
  };
  this.posFromIndex = function(index) {
    return toCmPos(this.ace.session.doc.indexToPosition(index));
  };
  this.focus = function(index) {
    return this.ace.textInput.focus();
  };
  this.blur = function(index) {
    return this.ace.blur();
  };
  this.defaultTextHeight = function(index) {
    return this.ace.renderer.layerConfig.lineHeight;
  };
  this.scanForBracket = function(pos, dir, _, options) {
    var re = options.bracketRegex.source;
    if (dir == 1) {
      var m = this.ace.session.$findClosingBracket(re.slice(1, 2), toAcePos(pos), /paren|text/);
    } else {
      var m = this.ace.session.$findOpeningBracket(re.slice(-2, -1), {row: pos.line, column: pos.ch + 1}, /paren|text/);
    }
    return m && {pos: toCmPos(m)};
  };
  this.refresh = function() {
    return this.ace.resize(true);
  };
  this.getMode = function() {
    return { name : this.getOption("mode") };
  }
}).call(CodeMirror.prototype);
  function toAcePos(cmPos) {
    return {row: cmPos.line, column: cmPos.ch};
  }
  function toCmPos(acePos) {
    return new Pos(acePos.row, acePos.column);
  }

  var StringStream = CodeMirror.StringStream = function(string, tabSize) {
    this.pos = this.start = 0;
    this.string = string;
    this.tabSize = tabSize || 8;
    this.lastColumnPos = this.lastColumnValue = 0;
    this.lineStart = 0;
  };

  StringStream.prototype = {
    eol: function() {return this.pos >= this.string.length;},
    sol: function() {return this.pos == this.lineStart;},
    peek: function() {return this.string.charAt(this.pos) || undefined;},
    next: function() {
      if (this.pos < this.string.length)
        return this.string.charAt(this.pos++);
    },
    eat: function(match) {
      var ch = this.string.charAt(this.pos);
      if (typeof match == "string") var ok = ch == match;
      else var ok = ch && (match.test ? match.test(ch) : match(ch));
      if (ok) {++this.pos; return ch;}
    },
    eatWhile: function(match) {
      var start = this.pos;
      while (this.eat(match)){}
      return this.pos > start;
    },
    eatSpace: function() {
      var start = this.pos;
      while (/[\s\u00a0]/.test(this.string.charAt(this.pos))) ++this.pos;
      return this.pos > start;
    },
    skipToEnd: function() {this.pos = this.string.length;},
    skipTo: function(ch) {
      var found = this.string.indexOf(ch, this.pos);
      if (found > -1) {this.pos = found; return true;}
    },
    backUp: function(n) {this.pos -= n;},
    column: function() {
      throw "not implemented";
    },
    indentation: function() {
      throw "not implemented";
    },
    match: function(pattern, consume, caseInsensitive) {
      if (typeof pattern == "string") {
        var cased = function(str) {return caseInsensitive ? str.toLowerCase() : str;};
        var substr = this.string.substr(this.pos, pattern.length);
        if (cased(substr) == cased(pattern)) {
          if (consume !== false) this.pos += pattern.length;
          return true;
        }
      } else {
        var match = this.string.slice(this.pos).match(pattern);
        if (match && match.index > 0) return null;
        if (match && consume !== false) this.pos += match[0].length;
        return match;
      }
    },
    current: function(){return this.string.slice(this.start, this.pos);},
    hideFirstChars: function(n, inner) {
      this.lineStart += n;
      try { return inner(); }
      finally { this.lineStart -= n; }
    }
  };
CodeMirror.defineExtension = function(name, fn) {
  CodeMirror.prototype[name] = fn;
};
dom.importCssString(".normal-mode .ace_cursor{\
  border: 1px solid red;\
  background-color: red;\
  opacity: 0.5;\
}\
.normal-mode .ace_hidden-cursors .ace_cursor{\
  background-color: transparent;\
}\
.ace_dialog {\
  position: absolute;\
  left: 0; right: 0;\
  background: inherit;\
  z-index: 15;\
  padding: .1em .8em;\
  overflow: hidden;\
  color: inherit;\
}\
.ace_dialog-top {\
  border-bottom: 1px solid #444;\
  top: 0;\
}\
.ace_dialog-bottom {\
  border-top: 1px solid #444;\
  bottom: 0;\
}\
.ace_dialog input {\
  border: none;\
  outline: none;\
  background: transparent;\
  width: 20em;\
  color: inherit;\
  font-family: monospace;\
}", "vimMode");
(function() {
  function dialogDiv(cm, template, bottom) {
    var wrap = cm.ace.container;
    var dialog;
    dialog = wrap.appendChild(document.createElement("div"));
    if (bottom)
      dialog.className = "ace_dialog ace_dialog-bottom";
    else
      dialog.className = "ace_dialog ace_dialog-top";

    if (typeof template == "string") {
      dialog.innerHTML = template;
    } else { // Assuming it's a detached DOM element.
      dialog.appendChild(template);
    }
    return dialog;
  }

  function closeNotification(cm, newVal) {
    if (cm.state.currentNotificationClose)
      cm.state.currentNotificationClose();
    cm.state.currentNotificationClose = newVal;
  }

  CodeMirror.defineExtension("openDialog", function(template, callback, options) {
    if (this.virtualSelectionMode()) return;
    if (!options) options = {};

    closeNotification(this, null);

    var dialog = dialogDiv(this, template, options.bottom);
    var closed = false, me = this;
    this.state.dialog = dialog;
    function close(newVal) {
      if (typeof newVal == 'string') {
        inp.value = newVal;
      } else {
        if (closed) return;
        
        if (newVal && newVal.type == "blur") {
          if (document.activeElement === inp)
            return;
        }
        
        me.state.dialog = null;
        closed = true;
        dialog.parentNode.removeChild(dialog);
        me.focus();

        if (options.onClose) options.onClose(dialog);
      }
    }

    var inp = dialog.getElementsByTagName("input")[0], button;
    if (inp) {
      if (options.value) {
        inp.value = options.value;
        if (options.selectValueOnOpen !== false) inp.select();
      }

      if (options.onInput)
        CodeMirror.on(inp, "input", function(e) { options.onInput(e, inp.value, close);});
      if (options.onKeyUp)
        CodeMirror.on(inp, "keyup", function(e) {options.onKeyUp(e, inp.value, close);});

      CodeMirror.on(inp, "keydown", function(e) {
        if (options && options.onKeyDown && options.onKeyDown(e, inp.value, close)) { return; }
        if (e.keyCode == 27 || (options.closeOnEnter !== false && e.keyCode == 13)) {
          inp.blur();
          CodeMirror.e_stop(e);
          close();
        }
        if (e.keyCode == 13) callback(inp.value);
      });

      if (options.closeOnBlur !== false) CodeMirror.on(inp, "blur", close);

      inp.focus();
    } else if (button = dialog.getElementsByTagName("button")[0]) {
      CodeMirror.on(button, "click", function() {
        close();
        me.focus();
      });

      if (options.closeOnBlur !== false) CodeMirror.on(button, "blur", close);

      button.focus();
    }
    return close;
  });

  CodeMirror.defineExtension("openNotification", function(template, options) {
    if (this.virtualSelectionMode()) return;
    closeNotification(this, close);
    var dialog = dialogDiv(this, template, options && options.bottom);
    var closed = false, doneTimer;
    var duration = options && typeof options.duration !== "undefined" ? options.duration : 5000;

    function close() {
      if (closed) return;
      closed = true;
      clearTimeout(doneTimer);
      dialog.parentNode.removeChild(dialog);
    }

    CodeMirror.on(dialog, 'click', function(e) {
      CodeMirror.e_preventDefault(e);
      close();
    });

    if (duration)
      doneTimer = setTimeout(close, duration);

    return close;
  });
})();

  
  var defaultKeymap = [
    { keys: '<Left>', type: 'keyToKey', toKeys: 'h' },
    { keys: '<Right>', type: 'keyToKey', toKeys: 'l' },
    { keys: '<Up>', type: 'keyToKey', toKeys: 'k' },
    { keys: '<Down>', type: 'keyToKey', toKeys: 'j' },
    { keys: '<Space>', type: 'keyToKey', toKeys: 'l' },
    { keys: '<BS>', type: 'keyToKey', toKeys: 'h', context: 'normal'},
    { keys: '<C-Space>', type: 'keyToKey', toKeys: 'W' },
    { keys: '<C-BS>', type: 'keyToKey', toKeys: 'B', context: 'normal' },
    { keys: '<S-Space>', type: 'keyToKey', toKeys: 'w' },
    { keys: '<S-BS>', type: 'keyToKey', toKeys: 'b', context: 'normal' },
    { keys: '<C-n>', type: 'keyToKey', toKeys: 'j' },
    { keys: '<C-p>', type: 'keyToKey', toKeys: 'k' },
    { keys: '<C-[>', type: 'keyToKey', toKeys: '<Esc>' },
    { keys: '<C-c>', type: 'keyToKey', toKeys: '<Esc>' },
    { keys: '<C-[>', type: 'keyToKey', toKeys: '<Esc>', context: 'insert' },
    { keys: '<C-c>', type: 'keyToKey