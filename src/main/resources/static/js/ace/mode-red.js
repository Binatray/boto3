define("ace/mode/red_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var RedHighlightRules = function() {

    var compoundKeywords = "";        

    this.$rules = {
        "start" : [
            {token : "keyword.operator", 
                regex: /\s([\-+%/=<>*]|(?:\*\*\|\/\/|==|>>>?|<>|<<|=>|<=|=\?))(\s|(?=:))/},
            {token : "string.email", regex : /\w[-\w._]*\@\w[-\w._]*/},
            {token : "value.time", regex : /\b\d+:\d+(:\d+)?/},
            {token : "string