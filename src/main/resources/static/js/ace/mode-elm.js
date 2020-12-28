define("ace/mode/elm_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var ElmHighlightRules = function() {
    var keywordMapper = this.createKeywordMapper({
       "keyword": "as|case|class|data|default|deriving|do|else|export|foreign|" +
            "hiding|jsevent|if|import|in|infix|infixl|infixr|instance|let|" +
            "module|newtype|of|open|then|type|where|_|port|\u03BB"
    }, "identifier");
    
    var escapeRe = /\\(\d+|['"\\&trnbvf])/;
    
    var smallRe = /[a-z_]/.source;
    var largeRe = /[A-Z]/.source;
    var idRe = /[a-z_A-Z0-9']/.source;

    this.$rules = {
        start: [{
            token: "string.start",
            regex: '"',
            next: "string"
        }, {
            token: "string.character",
            regex: "'(?:" + escapeRe.source + "|.)'?"
        }, {
            regex: /0(?:[xX][0-9A-Fa-f]+|[oO][0-7]+)|\d+(\.\d+)?([eE][-+]?\d*)?/,
            token: "constant.numeric"
        }, {
            token: "comment",
            regex: "--.*"
        }, {
            token : "keyword",
            regex : /\.\.|\||:|=|\\|"|->|<-|\u2192/
        }, {
            token : "keyword.operator",
            regex : /[-!#$%&*+.\/<=>?@\\^|~:\u03BB\u2192]+/
        }, {
            token : "operator.punctuation",
            regex : /[,;`]/
        }, {
            regex : largeRe + idRe + "+\\.?",
            token : function(value) {
                if (value[value.length - 1] == ".")
                    return "entity.name.function"; 
                return "constant.language"; 
            }
        }, {
            regex : "^" + smallRe  + idRe + "+",
            token : function(value) {
                return "constant.language"; 
            }
        }, {
            token : keywordMapper,
            regex : "[\\w\\xff-\\u218e\\u2455-\\uffff]+\\b"
        }, {
            regex: "{-#?",
            token: "comment.start",
            onMatch: function(value, currentState, stack) {
       