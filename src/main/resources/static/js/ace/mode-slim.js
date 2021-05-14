define("ace/mode/slim_highlight_rules",["require","exports","module","ace/config","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var modes = require("../config").$modes;

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
var SlimHighlightRules = function() {

    this.$rules = {
        "start": [
            {
                token: "keyword",
                regex: /^(\s*)(\w+):\s*/,
                onMatch: function(value, state, stack, line) {
                    var indent = /^\s*/.exec(line)[0];
                    var m = value.match(/^(\s*)(\w+):/);
                    var language = m[2];
                    if (!/^(javascript|ruby|coffee|markdown|css|scss|sass|less)$/.test(language))
                        language = "";
                    stack.unshift("language-embed", [], [indent, language], state);
                    return this.token;
                },
                stateName: "language-embed",
                next: [{
                    token: "string",
                    regex: /^(\s*)/,
                    onMatch: function(value, state, stack, line) {
                        var indent = stack[2][0];
                        if (indent.length >= value.length) {
                            stack.splice(0, 3);
                            this.next = stack.shift();
                            return this.token;
                        }
                        this.next = "";
                        return [{type: "text", value: indent}];
                    },
                    next: ""
                }, {
                    token: "string",
                    regex: /.+/,
                    onMatch: function(value, state, stack, line) {
                        var indent = stack[2][0];
                        var language = stack[2][1];
                        var embedState = stack[1];
                        
                        if (modes[language]) {
                            var data = modes[language].getTokenizer().getLineTokens(line.slice(indent.length), embedState.slice(0));
                            stack[1] = data.state;
                            return data.tokens;
                        }
                        return this.token;
                    }
                }]
            },
            {
                token: 'constant.begin.javascript.filter.slim',
                regex: '^(\\s*)():$'
            }, {
                token: 'constant.begin..filter.slim',
                regex: '^(\\s*)(ruby):$'
            }, {
                token: 'constant.begin.coffeescript.filter.slim',
                regex: '^(\\s*)():$'
            }, {
                token: 'constant.begin..filter.slim',
                regex: '^(\\s*)(markdown):$'
            }, {
                token: 'constant.begin.css.filter.slim',
                regex: '^(\\s*)():$'
            }, {
                token: 'constant.begin.scss.filter.slim',
                regex: '^(\\s*)():$'
            }, {
                token: 'constant.begin..filter.slim',
                regex: '^(\\s*)(sass):$'
            }, {
                token: 'constant.begin..filter.slim',
                regex: '^(\\s*)(less):$'
            }, {
                token: 'constant.begin..filter.slim',
                regex: '^(\\s*)(erb):$'
            }, {
                token: 'keyword.html.tags.slim',
                regex: '^(\\s*)((:?\\*(\\w)+)|doctype html|abbr|acronym|address|applet|area|article|aside|audio|base|basefont|bdo|big|blockquote|