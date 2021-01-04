define("ace/mode/gherkin_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
var stringEscape =  "\\\\(x[0-9A-Fa-f]{2}|[0-7]{3}|[\\\\abfnrtv'\"]|U[0-9A-Fa-f]{8}|u[0-9A-Fa-f]{4})";

var GherkinHighlightRules = function() {
    var languages = [{
        name: "en",
        labels: "Feature|Background|Scenario(?: Outline)?|Examples",
        keywords: "Given|When|Then|And|But"
    }];
    
    var labels 