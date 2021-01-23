define("ace/mode/kotlin_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var KotlinHighlightRules = function() {

    this.$rules = {
        start: [{
            include: "#comments"
        }, {
            token: [
                "text",
                "keyword.other.kotlin",
                "text",
                "entity.name.package.kotlin",
                "text"
            ],
            regex: /^(\s*)(package)\b(?:(\s*)([^ ;$]+)(\s*))?/
        }, {
            include: "#imports"
        }, {
            include: "#statements"
        }],
        "#classes": [{
            token: "text",
            regex: /(?=\s*(?:companion|class|object|interface))/,
            push: [{
                token: "text",
                regex: /}|(?=$)/,
                next: "pop"
            }, {
                token: ["keyword.other.kotlin", "text"],
                regex: /\b((?:companion\s*)?)(class|object|interface)\b/,
                push: [{
                    token: "text",
                    regex: /(?=<|{|\(|:)/,
                    next: "pop"
                }, {
                    token: "keyword.other.kotlin",
                    regex: /\bobject\b/
                }, {
                    token: "entity.name.type.class.kotlin",
                    regex: /\w+/
                }]
            }, {
                token: "text",
                regex: /</,
                push: [{
                    token: "text",
                    regex: />/,
                    next: "pop"
                }, {
                    include: "#generics"
                }]
            }, {
                token: "text",
                regex: /\(/,
                push: [{
                    token: "text",
                    regex: /\)/,
                    next: "pop"
                }, {
                    include: "#parameters"
                }]
            }, {
                token: "keyword.operator.declaration.kotlin",
                regex: /:/,
                push: [{
                    token: "text",
                    regex: /(?={|$)/,
                    next: "pop"
                }, {
                    token: "entity.other.inherited-class.kotlin",
                    regex: /\w+/
                }, {
                    token: "text",
                    regex: /\(/,
                    push: [{
                        token: "text",
                        regex: /\)/,
                        next: "pop"
                    }, {
                        include: "#expressions"
                    }]
                }]
            }, {
                token: "text",
                regex: /\{/,
                push: [{
                    token: "text",
                    regex: /\}/,
                    next: "pop"
                }, {
                    include: "#statements"
                }]
            }]
        }],
        "#comments": [{
            token: "punctuation.definition.comment.kotlin",
            regex: /\/\*/,
            push: [{
                token: "punctuation.definition.comment.kotlin",
                regex: /\*\//,
                next: "pop"
            }, {
                defaultToken: "comment.block.kotlin"
            }]
        }, {
            token: [
                "text",
                "punctuation.definition.comment.kotlin",
                "comment.line.double-slash.kotlin"
            ],
            regex: /(\s*)(\/\/)(.*$)/
        }],
        "#constants": [{
            token: "constant.language.kotlin",
            regex: /\b(?:true|false|null|this|super)\b/
        }, {
            token: "constant.numeric.kotlin",
            regex: /\b(?:0(?:x|X)[0-9a-fA-F]*|(?:[0-9]+\.?[0-9]*|\.[0-9]+)(?:(?:e|E)(?:\+|-)?[0-9]+)?)(?:[LlFfUuDd]|UL|ul)?\b/
        }, {
            token: "constant.other.kotlin",
            regex: /\b[A-Z][A-Z0-9_]+\b/
        }],
        "#expressions": [{
            token: "text",
            regex: /\(/,
            push: [{
                token: "text",
                regex: /\)/,
                next: "pop"
            }, {
                include: "#expressions"
            }]
        }, {
            include: "#types"
        }, {
            include: "#strings"
        }, {
            include: "#constants"
        }, {
            include: "#comments"
        }, {
            include: "#keywords"
        }],
        "#functions": [{
            token: "text",
            regex: /(?=\s*fun)/,
            push: [{
                token: "text",
                regex: /}|(?=$)/,
                next: "pop"
            }, {
                token: "keyword.other.kotlin",
                regex: /\bfun\b/,
                push: [{
                    token: "text",
                    regex: /(?=\()/,
                    next: "pop"
                }, {
                    token: "text",
                    regex: /</,
                    push: [{
                        token: "text",
                        regex: />/,
                        next: "pop"
                    }, {
                        include: "#generics"
                    }]
                }, {
                    token: ["text", "entity.name.function.kotlin"],
                    regex: /((?:[\.<\?>\w]+\.)?)(\w+)/
                }]
            }, {
                token: "text",
                regex: /\(/,
                push: [{
                    token: "text",
                    regex: /\)/,
                    next: "pop"
                }, {
                    include: "#parameters"
                }]
            }, {
                token: "keyword.operator.declaration.kotlin",
                regex: /:/,
                push: [{
                    token: "text",
                    regex: /(?={|=|$)/,
                    next: "pop"
                }, {
                    include: "#types"
                }]
            }, {
                token: "text",
                regex: /\{/,
                push: [{
                    token: "text",
                    regex: /(?=\})/,
                    next: "pop"
                }, {
                    include: "#statements"
                }]
            }, {
                token: "keyword.operator.assignment.kotlin",
                regex: /=/,
                push: [{
                    token: "text",
                    regex: /(?=$)/,
                    next: "pop"
                }, {
                    include: "#expressions"
                }]
            }]
        }],
        "#generics": [{
            token: "keyword.operator.declaration.kotlin",
            regex: /:/,
            push: [{
                token: "text",
                regex: /(?=,|>)/,
                next: "pop"
            }, {
                include: "#types"
            }]
        }, {
            include: "#keywords"
        }, {
            token: "storage.type.generic.kotlin",
            regex: /\w+/
        }],
        "#getters-and-setters": [{
            token: ["entity.name.function.kotlin", "text"],
            regex: /\b(get)\b(\s*\(\s*\))/,
            push: [{
                token: "text",
                regex: /\}|(?=\bset\b)|$/,
                next: "pop"
            }, {
                token: "keyword.operator.assignment.kotlin",
                regex: /=/,
                push: [{
                    token: "text",
                    regex: /(?=$|\bset\b)/,
                    next: "pop"
                }, {
                    include: "#expressions"
                }]
            }, {
                token: "text",
                regex: /\{/,
                push: [{
                    token: "text",
                    regex: /\}/,
                    next: "pop"
                }, {
                    include: "#expressions"
                }]
            }]
        }, {
            token: ["entity.name.function.kotlin", "text"],
            regex: /\b(set)\b(\s*)(?=\()/,
            push: [{
                token: "text",
                regex: /\}|(?=\bget\b)|$/,
                next: "pop"
            }, {
                token: "text",
                regex: /\(/,
                push: [{
                    token: "text",
                    regex: /\)/,
                    next: "pop"
                }, {
                    include: "#parameters"
                }]
            }, {
                token: "keyword.operator.assignment.kotlin",
                regex: /=/,
                push: [{
                    token: "text",
                    regex: /(?=$|\bset\b)/,
                    next: "pop"
                }, {
                    include: "#expressions"
                }]
            }, {
                token: "text",
                regex: /\{/,
                push: [{
                    token: "text",
                    regex: /\}/,
                    next: "pop"
                }, {
                    include: "#expressions"
                }]
            }]
        }],
        "#imports": [{
            token: [
                "text",
               