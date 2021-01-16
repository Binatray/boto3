define("ace/mode/io_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var IoHighlightRules = function() {

    this.$rules = { start: 
       [ { token: [ 'text', 'meta.empty-parenthesis.io' ],
           regex: '(\\()(\\))',
           comment: 'we match this to overload return inside () --Allan; scoping rules for what gets the scope have changed, so we now group the ) instead of the ( -- Rob' },
         { token: [ 'text', 'meta.comma-parenthesis.io' ],
           regex: '(\\,)(\\))',
           comment: 'We want to do the same for ,) -- Seckar; same as above -- Rob' },
         { token: 'keyword.control.io',
           regex: '\\b(?:if|ifTrue|ifFalse|ifTrueIfFalse|for|loop|reverseForeach|foreach|map|continue|break|while|do|return)\\b' },
         { token: 'punctuation.definition.comment.io',
           regex: '/\\*',
           push: 
            [ { tok