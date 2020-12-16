define("ace/mode/c9search_highlight_rules",["require","exports","module","ace/lib/oop","ace/lib/lang","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var lang = require("../lib/lang");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

function safeCreateRegexp(source, flag) {
    try {
        return new RegExp(source, flag);
    } catch(e) {}
}

var C9SearchHighlightRules = function() {
    this.$rules = {
        "start" : [
            {
                tokenNames : ["c9searchresults.constant.numeric", "c9searchresults.text", "c9searchresults.text", "c9searchresults.keyword"],
                regex : /(^\s+[0-9]+)(:)(\d*\s?)([^\r\n]+)/,
                onMatch : function(val, state, stack) {
                    var values = this.splitRegex.exec(val);
                    var types = this.tokenNames;
                    var tokens = [{
                        type: types[0],
                        value: values[1]
                    }, {
                        type: types[1],
                        value: values[2]
                    }];
                    
                    if (values[3]) {
                        if (values[3] == " ")
                            tokens[1] = { type: types[1], value: values[2] + " " };
                        else
                            tokens.push({ type: types[1], value: values[3] });
                    }
                    var regex = stack[1];
                    var str = values[4];
                    
                    var m;
                    var last = 0;
                    if (regex && regex.exec) {
                        regex.lastIndex = 0;
                        while (m = regex.exec(str)) {
                            var skipped = str.substring(last, m.index);
                            last = regex.lastIndex;
                            if (skipped)
                                tokens.push({type: types[2], value: skipped});
                            if (m[0])
                                tokens.push({type: types[3], value: m[0]});
                            else if (!skipped)
                                break;
                        }
                    }
                    if (last < str.length)
                        tokens.push({type: types[2], value: str.substr(last)});
                    return tokens;
                }
            },
            {
                regex : "^Searching for [^\\r\\n]*$",
                onMatch: function(val, state, stack) {
                    v