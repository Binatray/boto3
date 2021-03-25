define("ace/mode/doc_comment_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var DocCommentHighlightRules = function() {
    this.$rules = {
        "start" : [ {
            token : "comment.doc.tag",
            regex : "@[\\w\\d_]+" // TODO: fix email addresses
        }, 
        DocCommentHighlightRules.getTagRule(),
        {
            defaultToken : "comment.doc",
            caseInsensitive: true
        }]
    };
};

oop.inherits(DocCommentHighlightRules, TextHighlightRules);

DocCommentHighlightRules.getTagRule = function(start) {
    return {
        token : "comment.doc.tag.storage.type",
        regex : "\\b(?:TODO|FIXME|XXX|HACK)\\b"
    };
};

DocCommentHighlightRules.getStartRule = function(start) {
    return {
        token : "comment.doc", // doc comment
        regex : "\\/\\*(?=\\*)",
        next  : start
    };
};

DocCommentHighlightRules.getEndRule = function (start) {
    return {
        token : "comment.doc", // closing comment
        regex : "\\*\\/",
        next  : start
    };
};


exports.DocCommentHighlightRules = DocCommentHighlightRules;

});

define("ace/mode/css_highlight_rules",["require","exports","module","ace/lib/oop","ace/lib/lang","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var lang = require("../lib/lang");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
var supportType = exports.supportType = "align-content|align-items|align-self|all|animation|animation-delay|animation-direction|animation-duration|animation-fill-mode|animation-iteration-count|animation-name|animation-play-state|animation-timing-function|backface-visibility|background|background-attachment|background-blend-mode|background-clip|background-color|background-image|background-origin|background-position|background-repeat|background-size|border|border-bottom|border-bottom-color|border-bottom-left-radius|border-bottom-right-radius|border-bottom-style|border-bottom-width|border-collapse|border-color|border-image|border-image-outset|border-image-repeat|border-image-slice|border-image-source|border-image-width|border-left|border-left-color|border-left-style|border-left-width|border-radius|border-right|border-right-color|border-right-style|border-right-width|border-spacing|border-style|border-top|border-top-color|border-top-left-radius|border-top-right-radius|border-top-style|border-top-width|border-width|bottom|box-shadow|box-sizing|caption-side|clear|clip|color|column-count|column-fill|column-gap|column-rule|column-rule-color|column-rule-style|column-rule-width|column-span|column-width|columns|content|counter-increment|counter-reset|cursor|direction|display|empty-cells|filter|flex|flex-basis|flex-direction|flex-flow|flex-grow|flex-shrink|flex-wrap|float|font|font-family|font-size|font-size-adjust|font-stretch|font-style|font-variant|font-weight|hanging-punctuation|height|justify-content|left|letter-spacing|line-height|list-style|list-style-image|list-style-position|list-style-type|margin|margin-bottom|margin-left|margin-right|margin-top|max-height|max-width|max-zoom|min-height|min-width|min-zoom|nav-down|nav-index|nav-left|nav-right|nav-up|opacity|order|outline|outline-color|outline-offset|outline-style|outline-width|overflow|overflow-x|overflow-y|padding|padding-bottom|padding-left|padding-right|padding-top|page-break-after|page-break-before|page-break-inside|perspective|perspective-origin|position|quotes|resize|right|tab-size|table-layout|text-align|text-align-last|text-decoration|text-decoration-color|text-decoration-line|text-decoration-style|text-indent|text-justify|text-overflow|text-shadow|text-transform|top|transform|transform-origin|transform-style|transition|transition-delay|transition-duration|transition-property|transition-timing-function|unicode-bidi|user-select|user-zoom|vertical-align|visibility|white-space|width|word-break|word-spacing|word-wrap|z-index";
var supportFunction = exports.supportFunction = "rgb|rgba|url|attr|counter|counters";
var supportConstant = exports.supportConstant = "absolute|after-edge|after|all-scroll|all|alphabetic|always|antialiased|armenian|auto|avoid-column|avoid-page|avoid|balance|baseline|before-edge|before|below|bidi-override|block-line-height|block|bold|bolder|border-box|both|bottom|box|break-all|break-word|capitalize|caps-height|caption|center|central|char|circle|cjk-ideographic|clone|close-quote|col-resize|collapse|column|consider-shifts|contain|content-box|cover|crosshair|cubic-bezier|dashed|decimal-leading-zero|decimal|default|disabled|disc|disregard-shifts|distribute-all-lines|distribute-letter|distribute-space|distribute|dotted|double|e-resize|ease-in|ease-in-out|ease-out|ease|ellipsis|end|exclude-ruby|fill|fixed|georgian|glyphs|grid-height|groove|hand|hanging|hebrew|help|hidden|hiragana-iroha|hiragana|horizontal|icon|ideograph-alpha|ideograph-numeric|ideograph-parenthesis|ideograph-space|ideographic|inactive|include-ruby|inherit|initial|inline-block|inline-box|inline-line-height|inline-table|inline|inset|inside|inter-ideograph|inter-word|invert|italic|justify|katakana-iroha|katakana|keep-all|last|left|lighter|line-edge|line-through|line|linear|list-item|local|loose|lower-alpha|lower-greek|lower-latin|lower-roman|lowercase|lr-tb|ltr|mathematical|max-height|max-size|medium|menu|message-box|middle|move|n-resize|ne-resize|newspaper|no-change|no-close-quote|no-drop|no-open-quote|no-repeat|none|normal|not-allowed|nowrap|nw-resize|oblique|open-quote|outset|outside|overline|padding-box|page|pointer|pre-line|pre-wrap|pre|preserve-3d|progress|relative|repeat-x|repeat-y|repeat|replaced|reset-size|ridge|right|round|row-resize|rtl|s-resize|scroll|se-resize|separate|slice|small-caps|small-caption|solid|space|square|start|static|status-bar|step-end|step-start|steps|stretch|strict|sub|super|sw-resize|table-caption|table-cell|table-column-group|table-column|table-footer-group|table-header-group|table-row-group|table-row|table|tb-rl|text-after-edge|text-before-edge|text-bottom|text-size|text-top|text|thick|thin|transparent|underline|upper-alpha|upper-latin|upper-roman|uppercase|use-script|vertical-ideographic|vertical-text|visible|w-resize|wait|whitespace|z-index|zero|zoom";
var supportConstantColor = exports.supportConstantColor = "aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkgrey|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|green|greenyellow|grey|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|rebeccapurple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen";
var supportConstantFonts = exports.supportConstantFonts = "arial|century|comic|courier|cursive|fantasy|garamond|georgia|helvetica|impact|lucida|symbol|system|tahoma|times|trebuchet|utopia|verdana|webdings|sans-serif|serif|monospace";

var numRe = exports.numRe = "\\-?(?:(?:[0-9]+(?:\\.[0-9]+)?)|(?:\\.[0-9]+))";
var pseudoElements = exports.pseudoElements = "(\\:+)\\b(after|before|first-letter|first-line|moz-selection|selection)\\b";
var pseudoClasses  = exports.pseudoClasses =  "(:)\\b(active|checked|disabled|empty|enabled|first-child|first-of-type|focus|hover|indeterminate|invalid|last-child|last-of-type|link|not|nth-child|nth-last-child|nth-last-of-type|nth-of-type|only-child|only-of-type|required|root|target|valid|visited)\\b";

var CssHighlightRules = function() {

    var keywordMapper = this.createKeywordMapper({
        "support.function": supportFunction,
        "support.constant": supportConstant,
        "support.type": supportType,
        "support.constant.color": supportConstantColor,
        "support.constant.fonts": supportConstantFonts
    }, "text", true);

    this.$rules = {
        "start" : [{
            include : ["strings", "url", "comments"]
        }, {
            token: "paren.lparen",
            regex: "\\{",
            next:  "ruleset"
        }, {
            token: "paren.rparen",
            regex: "\\}"
        }, {
            token: "string",
            regex: "@(?!viewport)",
            next:  "media"
        }, {
            token: "keyword",
            regex: "#[a-z0-9-_]+"
        }, {
            token: "keyword",
            regex: "%"
        }, {
            token: "variable",
            regex: "\\.[a-z0-9-_]+"
        }, {
            token: "string",
            regex: ":[a-z0-9-_]+"
        }, {
            token : "constant.numeric",
            regex : numRe
        }, {
            token: "constant",
            regex: "[a-z0-9-_]+"
        }, {
            caseInsensitive: true
        }],

        "media": [{
            include : ["strings", "url", "comments"]
        }, {
            token: "paren.lparen",
            regex: "\\{",
            next:  "start"
        }, {
            token: "paren.rparen",
            regex: "\\}",
            next:  "start"
        }, {
            token: "string",
            regex: ";",
            next:  "start"
        }, {
            token: "keyword",
            regex: "(?:media|supports|document|charset|import|namespace|media|supports|document"
                + "|page|font|keyframes|viewport|counter-style|font-feature-values"
                + "|swash|ornaments|annotation|stylistic|styleset|character-variant)"
        }],

        "comments" : [{
            token: "comment", // multi line comment
            regex: "\\/\\*",
            push: [{
                token : "comment",
                regex : "\\*\\/",
                next : "pop"
            }, {
                defaultToken : "comment"
            }]
        }],

        "ruleset" : [{
            regex : "-(webkit|ms|moz|o)-",
            token : "text"
        }, {
            token : "punctuation.operator",
            regex : "[:;]"
        }, {
            token : "paren.rparen",
            regex : "\\}",
            next : "start"
        }, {
            include : ["strings", "url", "comments"]
        }, {
            token : ["constant.numeric", "keyword"],
            regex : "(" + numRe + ")(ch|cm|deg|em|ex|fr|gd|grad|Hz|in|kHz|mm|ms|pc|pt|px|rad|rem|s|turn|vh|vmax|vmin|vm|vw|%)"
        }, {
            token : "constant.numeric",
            regex : numRe
        }, {
            token : "constant.numeric",  // hex6 color
            regex : "#[a-f0-9]{6}"
        }, {
            token : "constant.numeric", // hex3 color
            regex : "#[a-f0-9]{3}"
        }, {
            token : ["punctuation", "entity.other.attribute-name.pseudo-element.css"],
            regex : pseudoElements
        }, {
            token : ["punctuation", "entity.other.attribute-name.pseudo-class.css"],
            regex : pseudoClasses
        }, {
            include: "url"
        }, {
            token : keywordMapper,
            regex : "\\-?[a-zA-Z_][a-zA-Z0-9_\\-]*"
        }, {
            caseInsensitive: true
        }],

        url: [{
            token : "support.function",
            regex : "(?:url(:?-prefix)?|domain|regexp)\\(",
            push: [{
                token : "support.function",
                regex : "\\)",
                next : "pop"
            }, {
                defaultToken: "string"
            }]
        }],

        strings: [{
            token : "string.start",
            regex : "'",
            push : [{
                token : "string.end",
                regex : "'|$",
                next: "pop"
            }, {
                include : "escapes"
            }, {
                token : "constant.language.escape",
                regex : /\\$/,
                consumeLineEnd: true
            }, {
                defaultToken: "string"
            }]
        }, {
            token : "string.start",
            regex : '"',
            push : [{
                token : "string.end",
                regex : '"|$',
                next: "pop"
            }, {
                include : "escapes"
            }, {
                token : "constant.language.escape",
                regex : /\\$/,
                consumeLineEnd: true
            }, {
                defaultToken: "string"
            }]
        }],
        escapes: [{
            token : "constant.language.escape",
            regex : /\\([a-fA-F\d]{1,6}|[^a-fA-F\d])/
        }]

    };

    this.normalizeRules();
};

oop.inherits(CssHighlightRules, TextHighlightRules);

exports.CssHighlightRules = CssHighlightRules;

});

define("ace/mode/javascript_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/doc_comment_highlight_rules","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var DocCommentHighlightRules = require("./doc_comment_highlight_rules").DocCommentHighlightRules;
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
var identifierRe = "[a-zA-Z\\$_\u00a1-\uffff][a-zA-Z\\d\\$_\u00a1-\uffff]*";

var JavaScriptHighlightRules = function(options) {
    var keywordMapper = this.createKeywordMapper({
        "variable.language":
            "Array|Boolean|Date|Function|Iterator|Number|Object|RegExp|String|Proxy|"  + // Constructors
            "Namespace|QName|XML|XMLList|"                                             + // E4X
            "ArrayBuffer|Float32Array|Float64Array|Int16Array|Int32Array|Int8Array|"   +
            "Uint16Array|Uint32Array|Uint8Array|Uint8ClampedArray|"                    +
            "Error|EvalError|InternalError|RangeError|ReferenceError|StopIteration|"   + // Errors
            "SyntaxError|TypeError|URIError|"                                          +
            "decodeURI|decodeURIComponent|encodeURI|encodeURIComponent|eval|isFinite|" + // Non-constructor functions
            "isNaN|parseFloat|parseInt|"                                               +
            "JSON|Math|"                                                               + // Other
            "this|arguments|prototype|window|document"                                 , // Pseudo
        "keyword":
            "const|yield|import|get|set|async|await|" +
            "break|case|catch|continue|default|delete|do|else|finally|for|function|" +
            "if|in|of|instanceof|new|return|switch|throw|try|typeof|let|var|while|with|debugger|" +
            "__parent__|__count__|escape|unescape|with|__proto__|" +
            "class|enum|extends|super|export|implements|private|public|interface|package|protected|static",
        "storage.type":
            "const|let|var|function",
        "constant.language":
            "null|Infinity|NaN|undefined",
        "support.function":
            "alert",
        "constant.language.boolean": "true|false"
    }, "identifier");
    var kwBeforeRe = "case|do|else|finally|in|instanceof|return|throw|try|typeof|yield|void";

    var escapedRe = "\\\\(?:x[0-9a-fA-F]{2}|" + // hex
        "u[0-9a-fA-F]{4}|" + // unicode
        "u{[0-9a-fA-F]{1,6}}|" + // es6 unicode
        "[0-2][0-7]{0,2}|" + // oct
        "3[0-7][0-7]?|" + // oct
        "[4-7][0-7]?|" + //oct
        ".)";

    this.$rules = {
        "no_regex" : [
            DocCommentHighlightRules.getStartRule("doc-start"),
            comments("no_regex"),
            {
                token : "string",
                regex : "'(?=.)",
                next  : "qstring"
            }, {
                token : "string",
                regex : '"(?=.)',
                next  : "qqstring"
            }, {
                token : "constant.numeric", // hexadecimal, octal and binary
                regex : /0(?:[xX][0-9a-fA-F]+|[oO][0-7]+|[bB][01]+)\b/
            }, {
                token : "constant.numeric", // decimal integers and floats
                regex : /(?:\d\d*(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+\b)?/
            }, {
                token : [
                    "storage.type", "punctuation.operator", "support.function",
                    "punctuation.operator", "entity.name.function", "text","keyword.operator"
                ],
                regex : "(" + identifierRe + ")(\\.)(prototype)(\\.)(" + identifierRe +")(\\s*)(=)",
                next: "function_arguments"
            }, {
                token : [
                    "storage.type", "punctuation.operator", "entity.name.function", "text",
                    "keyword.operator", "text", "storage.type", "text", "paren.lparen"
                ],
                regex : "(" + identifierRe + ")(\\.)(" + identifierRe +")(\\s*)(=)(\\s*)(function)(\\s*)(\\()",
                next: "function_arguments"
            }, {
                token : [
                    "entity.name.function", "text", "keyword.operator", "text", "storage.type",
                    "text", "paren.lparen"
                ],
                regex : "(" + identifierRe +")(\\s*)(=)(\\s*)(function)(\\s*)(\\()",
                next: "function_arguments"
            }, {
                token : [
                    "storage.type", "punctuation.operator", "entity.name.function", "text",
                    "keyword.operator", "text",
                    "storage.type", "text", "entity.name.function", "text", "paren.lparen"
                ],
                regex : "(" + identifierRe + ")(\\.)(" + identifierRe +")(\\s*)(=)(\\s*)(function)(\\s+)(\\w+)(\\s*)(\\()",
                next: "function_arguments"
            }, {
                token : [
                    "storage.type", "text", "entity.name.function", "text", "paren.lparen"
                ],
                regex : "(function)(\\s+)(" + identifierRe + ")(\\s*)(\\()",
                next: "function_arguments"
            }, {
                token : [
                    "entity.name.function", "text", "punctuation.operator",
                    "text", "storage.type", "text", "paren.lparen"
                ],
                regex : "(" + identifierRe + ")(\\s*)(:)(\\s*)(function)(\\s*)(\\()",
                next: "function_arguments"
            }, {
                token : [
                    "text", "text", "storage.type", "text", "paren.lparen"
                ],
                regex : "(:)(\\s*)(function)(\\s*)(\\()",
                next: "function_arguments"
            }, {
                token : "keyword",
                regex : "from(?=\\s*('|\"))"
            }, {
                token : "keyword",
                regex : "(?:" + kwBeforeRe + ")\\b",
                next : "start"
            }, {
                token : ["support.constant"],
                regex : /that\b/
            }, {
                token : ["storage.type", "punctuation.operator", "support.function.firebug"],
                regex : /(console)(\.)(warn|info|log|error|time|trace|timeEnd|assert)\b/
            }, {
                token : keywordMapper,
                regex : identifierRe
            }, {
                token : "punctuation.operator",
                regex : /[.](?![.])/,
                next  : "property"
            }, {
                token : "storage.type",
                regex : /=>/,
                next  : "start"
            }, {
                token : "keyword.operator",
                regex : /--|\+\+|\.{3}|===|==|=|!=|!==|<+=?|>+=?|!|&&|\|\||\?:|[!$%&*+\-~\/^]=?/,
                next  : "start"
            }, {
                token : "punctuation.operator",
                regex : /[?:,;.]/,
                next  : "start"
            }, {
                token : "paren.lparen",
                regex : /[\[({]/,
                next  : "start"
            }, {
                token : "paren.rparen",
                regex : /[\])}]/
            }, {
                token: "comment",
                regex: /^#!.*$/
            }
        ],
        property: [{
                token : "text",
                regex : "\\s+"
            }, {
                token : [
                    "storage.type", "punctuation.operator", "entity.name.function", "text",
                    "keyword.operator", "text",
                    "storage.type", "text", "entity.name.function", "text", "paren.lparen"
                ],
                regex : "(" + identifierRe + ")(\\.)(" + identifierRe +")(\\s*)(=)(\\s*)(function)(?:(\\s+)(\\w+))?(\\s*)(\\()",
                next: "function_arguments"
            }, {
                token : "punctuation.operator",
                regex : /[.](?![.])/
            }, {
                token : "support.function",
                regex : /(s(?:h(?:ift|ow(?:Mod(?:elessDialog|alDialog)|Help))|croll(?:X|By(?:Pages|Lines)?|Y|To)?|t(?:op|rike)|i(?:n|zeToContent|debar|gnText)|ort|u(?:p|b(?:str(?:ing)?)?)|pli(?:ce|t)|e(?:nd|t(?:Re(?:sizable|questHeader)|M(?:i(?:nutes|lliseconds)|onth)|Seconds|Ho(?:tKeys|urs)|Year|Cursor|Time(?:out)?|Interval|ZOptions|Date|UTC(?:M(?:i(?:nutes|lliseconds)|onth)|Seconds|Hours|Date|FullYear)|FullYear|Active)|arch)|qrt|lice|avePreferences|mall)|h(?:ome|andleEvent)|navigate|c(?:har(?:CodeAt|At)|o(?:s|n(?:cat|textual|firm)|mpile)|eil|lear(?:Timeout|Interval)?|a(?:ptureEvents|ll)|reate(?:StyleSheet|Popup|EventObject))|t(?:o(?:GMTString|S(?:tring|ource)|U(?:TCString|pperCase)|Lo(?:caleString|werCase))|est|a(?:n|int(?:Enabled)?))|i(?:s(?:NaN|Finite)|ndexOf|talics)|d(?:isableExternalCapture|ump|etachEvent)|u(?:n(?:shift|taint|escape|watch)|pdateCommands)|j(?:oin|avaEnabled)|p(?:o(?:p|w)|ush|lugins.refresh|a(?:ddings|rse(?:Int|Float)?)|r(?:int|ompt|eference))|e(?:scape|nableExternalCapture|val|lementFromPoint|x(?:p|ec(?:Script|Command)?))|valueOf|UTC|queryCommand(?:State|Indeterm|Enabled|Value)|f(?:i(?:nd|le(?:ModifiedDate|Size|CreatedDate|UpdatedDate)|xed)|o(?:nt(?:size|color)|rward)|loor|romCharCode)|watch|l(?:ink|o(?:ad|g)|astIndexOf)|a(?:sin|nchor|cos|t(?:tachEvent|ob|an(?:2)?)|pply|lert|b(?:s|ort))|r(?:ou(?:nd|teEvents)|e(?:size(?:By|To)|calc|turnValue|place|verse|l(?:oad|ease(?:Capture|Events)))|andom)|g(?:o|et(?:ResponseHeader|M(?:i(?:nutes|lliseconds)|onth)|Se(?:conds|lection)|Hours|Year|Time(?:zoneOffset)?|Da(?:y|te)|UTC(?:M(?:i(?:nutes|lliseconds)|onth)|Seconds|Hours|Da(?:y|te)|FullYear)|FullYear|A(?:ttention|llResponseHeaders)))|m(?:in|ove(?:B(?:y|elow)|To(?:Absolute)?|Above)|ergeAttributes|a(?:tch|rgins|x))|b(?:toa|ig|o(?:ld|rderWidths)|link|ack))\b(?=\()/
            }, {
                token : "support.function.dom",
                regex : /(s(?:ub(?:stringData|mit)|plitText|e(?:t(?:NamedItem|Attribute(?:Node)?)|lect))|has(?:ChildNodes|Feature)|namedItem|c(?:l(?:ick|o(?:se|neNode))|reate(?:C(?:omment|DATASection|aption)|T(?:Head|extNode|Foot)|DocumentFragment|ProcessingInstruction|E(?:ntityReference|lement)|Attribute))|tabIndex|i(?:nsert(?:Row|Before|Cell|Data)|tem)|open|delete(?:Row|C(?:ell|aption)|T(?:Head|Foot)|Data)|focus|write(?:ln)?|a(?:dd|ppend(?:Child|Data))|re(?:set|place(?:Child|Data)|move(?:NamedItem|Child|Attribute(?:Node)?)?)|get(?:NamedItem|Element(?:sBy(?:Name|TagName|ClassName)|ById)|Attribute(?:Node)?)|blur)\b(?=\()/
            }, {
                token :  "support.constant",
                regex : /(s(?:ystemLanguage|cr(?:ipts|ollbars|een(?:X|Y|Top|Left))|t(?:yle(?:Sheets)?|atus(?:Text|bar)?)|ibling(?:Below|Above)|ource|uffixes|e(?:curity(?:Policy)?|l(?:ection|f)))|h(?:istory|ost(?:name)?|as(?:h|Focus))|y|X(?:MLDocument|SLDocument)|n(?:ext|ame(?:space(?:s|URI)|Prop))|M(?:IN_VALUE|AX_VALUE)|c(?:haracterSet|o(?:n(?:structor|trollers)|okieEnabled|lorDepth|mp(?:onents|lete))|urrent|puClass|l(?:i(?:p(?:boardData)?|entInformation)|osed|asses)|alle(?:e|r)|rypto)|t(?:o(?:olbar|p)|ext(?:Transform|Indent|Decoration|Align)|ags)|SQRT(?:1_2|2)|i(?:n(?:ner(?:Height|Width)|put)|ds|gnoreCase)|zIndex|o(?:scpu|n(?:readystatechange|Line)|uter(?:Height|Width)|p(?:sProfile|ener)|ffscreenBuffering)|NEGATIVE_INFINITY|d(?:i(?:splay|alog(?:Height|Top|Width|Left|Arguments)|rectories)|e(?:scription|fault(?:Status|Ch(?:ecked|arset)|View)))|u(?:ser(?:Profile|Language|Agent)|n(?:iqueID|defined)|pdateInterval)|_content|p(?:ixelDepth|ort|ersonalbar|kcs11|l(?:ugins|atform)|a(?:thname|dding(?:Right|Bottom|Top|Left)|rent(?:Window|Layer)?|ge(?:X(?:Offset)?|Y(?:Offset)?))|r(?:o(?:to(?:col|type)|duct(?:Sub)?|mpter)|e(?:vious|fix)))|e(?:n(?:coding|abledPlugin)|x(?:ternal|pando)|mbeds)|v(?:isibility|endor(?:Sub)?|Linkcolor)|URLUnencoded|P(?:I|OSITIVE_INFINITY)|f(?:ilename|o(?:nt(?:Size|Family|Weight)|rmName)|rame(?:s|Element)|gColor)|E|whiteSpace|l(?:i(?:stStyleType|n(?:eHeight|kColor))|o(?:ca(?:tion(?:bar)?|lName)|wsrc)|e(?:ngth|ft(?:Context)?)|a(?:st(?:M(?:odified|atch)|Index|Paren)|yer(?:s|X)|nguage))|a(?:pp(?:MinorVersion|Name|Co(?:deName|re)|Version)|vail(?:Height|Top|Width|Left)|ll|r(?:ity|guments)|Linkcolor|bove)|r(?:ight(?:Context)?|e(?:sponse(?:XML|Text)|adyState))|global|x|m(?:imeTypes|ultiline|enubar|argin(?:Right|Bottom|Top|Left))|L(?:N(?:10|2)|OG(?:10E|2E))|b(?:o(?:ttom|rder(?:Width|RightWidth|BottomWidth|Style|Color|TopWidth|LeftWidth))|ufferDepth|elow|ackground(?:Color|Image)))\b/
            }, {
                token : "identifier",
                regex : identifierRe
            }, {
                regex: "",
                token: "empty",
                next: "no_regex"
            }
        ],
        "start": [
            DocCommentHighlightRules.getStartRule("doc-start"),
            comments("start"),
            {
                token: "string.regexp",
                regex: "\\/",
                next: "regex"
            }, {
                token : "text",
                regex : "\\s+|^$",
                next : "start"
            }, {
                token: "empty",
                regex: "",
                next: "no_regex"
            }
        ],
        "regex": [
            {
                token: "regexp.keyword.operator",
                regex: "\\\\(?:u[\\da-fA-F]{4}|x[\\da-fA-F]{2}|.)"
            }, {
                token: "string.regexp",
                regex: "/[sxngimy]*",
                next: "no_regex"
            }, {
                token : "invalid",
                regex: /\{\d+\b,?\d*\}[+*]|[+*$^?][+*]|[$^][?]|\?{3,}/
            }, {
                token : "constant.language.escape",
                regex: /\(\?[:=!]|\)|\{\d+\b,?\d*\}|[+*]\?|[()$^+*?.]/
            }, {
                token : "constant.language.delimiter",
                regex: /\|/
            }, {
                token: "constant.language.escape",
                regex: /\[\^?/,
                next: "regex_character_class"
            }, {
                token: "empty",
                regex: "$",
                next: "no_regex"
            }, {
                defaultToken: "string.regexp"
            }
        ],
        "regex_character_class": [
            {
                token: "regexp.charclass.keyword.operator",
                regex: "\\\\(?:u[\\da-fA-F]{4}|x[\\da-fA-F]{2}|.)"
            }, {
                token: "constant.language.escape",
                regex: "]",
                next: "regex"
            }, {
                token: "constant.language.escape",
                regex: "-"
            }, {
                token: "empty",
                regex: "$",
                next: "no_regex"
            }, {
                defaultToken: "string.regexp.charachterclass"
            }
        ],
        "function_arguments": [
            {
                token: "variable.parameter",
                regex: identifierRe
            }, {
                token: "punctuation.operator",
                regex: "[, ]+"
            }, {
                token: "punctuation.operator",
                regex: "$"
            }, {
                token: "empty",
                regex: "",
                next: "no_regex"
            }
        ],
        "qqstring" : [
            {
                token : "constant.language.escape",
                regex : escapedRe
            }, {
                token : "string",
                regex : "\\\\$",
                consumeLineEnd  : true
            }, {
                token : "string",
                regex : '"|$',
                next  : "no_regex"
            }, {
                defaultToken: "string"
            }
        ],
        "qstring" : [
            {
                token : "constant.language.escape",
                regex : escapedRe
            }, {
                token : "string",
                regex : "\\\\$",
                consumeLineEnd  : true
            }, {
                token : "string",
                regex : "'|$",
                next  : "no_regex"
            }, {
                defaultToken: "string"
            }
        ]
    };


    if (!options || !options.noES6) {
        this.$rules.no_regex.unshift({
            regex: "[{}]", onMatch: function(val, state, stack) {
                this.next = val == "{" ? this.nextState : "";
                if (val == "{" && stack.length) {
                    stack.unshift("start", state);
                }
                else if (val == "}" && stack.length) {
                    stack.shift();
                    this.next = stack.shift();
                    if (this.next.indexOf("string") != -1 || this.next.indexOf("jsx") != -1)
                        return "paren.quasi.end";
                }
                return val == "{" ? "paren.lparen" : "paren.rparen";
            },
            nextState: "start"
        }, {
            token : "string.quasi.start",
            regex : /`/,
            push  : [{
                token : "constant.language.escape",
                regex : escapedRe
            }, {
                token : "paren.quasi.start",
                regex : /\${/,
                push  : "start"
            }, {
                token : "string.quasi.end",
                regex : /`/,
                next  : "pop"
            }, {
                defaultToken: "string.quasi"
            }]
        });

        if (!options || options.jsx != false)
            JSX.call(this);
    }

    this.embedRules(DocCommentHighlightRules, "doc-",
        [ DocCommentHighlightRules.getEndRule("no_regex") ]);

    this.normalizeRules();
};

oop.inherits(JavaScriptHighlightRules, TextHighlightRules);

function JSX() {
    var tagRegex = identifierRe.replace("\\d", "\\d\\-");
    var jsxTag = {
        onMatch : function(val, state, stack) {
            var offset = val.charAt(1) == "/" ? 2 : 1;
            if (offset == 1) {
                if (state != this.nextState)
                    stack.unshift(this.next, this.nextState, 0);
                else
                    stack.unshift(this.next);
                stack[2]++;
            } else if (offset == 2) {
                if (state == this.nextState) {
                    stack[1]--;
                    if (!stack[1] || stack[1] < 0) {
                        stack.shift();
                        stack.shift();
                    }
                }
            }
            return [{
                type: "meta.tag.punctuation." + (offset == 1 ? "" : "end-") + "tag-open.xml",
                value: val.slice(0, offset)
            }, {
                type: "meta.tag.tag-name.xml",
                value: val.substr(offset)
            }];
        },
        regex : "</?" + tagRegex + "",
        next: "jsxAttributes",
        nextState: "jsx"
    };
    this.$rules.start.unshift(jsxTag);
    var jsxJsRule = {
        regex: "{",
        token: "paren.quasi.start",
        push: "start"
    };
    this.$rules.jsx = [
        jsxJsRule,
        jsxTag,
        {include : "reference"},
        {defaultToken: "string"}
    ];
    this.$rules.jsxAttributes = [{
        token : "meta.tag.punctuation.tag-close.xml",
        regex : "/?>",
        onMatch : function(value, currentState, stack) {
            if (currentState == stack[0])
                stack.shift();
            if (value.length == 2) {
                if (stack[0] == this.nextState)
                    stack[1]--;
                if (!stack[1] || stack[1] < 0) {
                    stack.splice(0, 2);
                }
            }
            this.next = stack[0] || "start";
            return [{type: this.token, value: value}];
        },
        nextState: "jsx"
    },
    jsxJsRule,
    comments("jsxAttributes"),
    {
        token : "entity.other.attribute-name.xml",
        regex : tagRegex
    }, {
        token : "keyword.operator.attribute-equals.xml",
        regex : "="
    }, {
        token : "text.tag-whitespace.xml",
        regex : "\\s+"
    }, {
        token : "string.attribute-value.xml",
        regex : "'",
        stateName : "jsx_attr_q",
        push : [
            {token : "string.attribute-value.xml", regex: "'", next: "pop"},
            {include : "reference"},
            {defaultToken : "string.attribute-value.xml"}
        ]
    }, {
        token : "string.attribute-value.xml",
        regex : '"',
        stateName : "jsx_attr_qq",
        push : [
            {token : "string.attribute-value.xml", regex: '"', next: "pop"},
            {include : "reference"},
            {defaultToken : "string.attribute-value.xml"}
        ]
    },
    jsxTag
    ];
    this.$rules.reference = [{
        token : "constant.language.escape.reference.xml",
        regex : "(?:&#[0-9]+;)|(?:&#x[0-9a-fA-F]+;)|(?:&[a-zA-Z0-9_:\\.-]+;)"
    }];
}

function comments(next) {
    return [
        {
            token : "comment", // multi line comment
            regex : /\/\*/,
            next: [
                DocCommentHighlightRules.getTagRule(),
                {token : "comment", regex : "\\*\\/", next : next || "pop"},
                {defaultToken : "comment", caseInsensitive: true}
            ]
        }, {
            token : "comment",
            regex : "\\/\\/",
            next: [
                DocCommentHighlightRules.getTagRule(),
                {token : "comment", regex : "$|^", next : next || "pop"},
                {defaultToken : "comment", caseInsensitive: true}
            ]
        }
    ];
}
exports.JavaScriptHighlightRules = JavaScriptHighlightRules;
});

define("ace/mode/xml_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var XmlHighlightRules = function(normalize) {
    var tagRegex = "[_:a-zA-Z\xc0-\uffff][-_:.a-zA-Z0-9\xc0-\uffff]*";

    this.$rules = {
        start : [
            {token : "string.cdata.xml", regex : "<\\!\\[CDATA\\[", next : "cdata"},
            {
                token : ["punctuation.instruction.xml", "keyword.instruction.xml"],
                regex : "(<\\?)(" + tagRegex + ")", next : "processing_instruction"
            },
            {token : "comment.start.xml", regex : "<\\!--", next : "comment"},
            {
                token : ["xml-pe.doctype.xml", "xml-pe.doctype.xml"],
                regex : "(<\\!)(DOCTYPE)(?=[\\s])", next : "doctype", caseInsensitive: true
            },
            {include : "tag"},
            {token : "text.end-tag-open.xml", regex: "</"},
            {token : "text.tag-open.xml", regex: "<"},
            {include : "reference"},
            {defaultToken : "text.xml"}
        ],

        processing_instruction : [{
            token : "entity.other.attribute-name.decl-attribute-name.xml",
            regex : tagRegex
        }, {
            token : "keyword.operator.decl-attribute-equals.xml",
            regex : "="
        }, {
            include: "whitespace"
        }, {
            include: "string"
        }, {
            token : "punctuation.xml-decl.xml",
            regex : "\\?>",
            next : "start"
        }],

        doctype : [
            {include : "whitespace"},
            {include : "string"},
            {token : "xml-pe.doctype.xml", regex : ">", next : "start"},
            {token : "xml-pe.xml", regex : "[-_a-zA-Z0-9:]+"},
            {token : "punctuation.int-subset", regex : "\\[", push : "int_subset"}
        ],

        int_subset : [{
            token : "text.xml",
            regex : "\\s+"
        }, {
            token: "punctuation.int-subset.xml",
            regex: "]",
            next: "pop"
        }, {
            token : ["punctuation.markup-decl.xml", "keyword.markup-decl.xml"],
            regex : "(<\\!)(" + tagRegex + ")",
            push : [{
                token : "text",
                regex : "\\s+"
            },
            {
                token : "punctuation.markup-decl.xml",
                regex : ">",
                next : "pop"
            },
            {include : "string"}]
        }],

        cdata : [
            {token : "string.cdata.xml", regex : "\\]\\]>", next : "start"},
            {token : "text.xml", regex : "\\s+"},
            {token : "text.xml", regex : "(?:[^\\]]|\\](?!\\]>))+"}
        ],

        comment : [
            {token : "comment.end.xml", regex : "-->", next : "start"},
            {defaultToken : "comment.xml"}
        ],

        reference : [{
            token : "constant.language.escape.reference.xml",
            regex : "(?:&#[0-9]+;)|(?:&#x[0-9a-fA-F]+;)|(?:&[a-zA-Z0-9_:\\.-]+;)"
        }],

        attr_reference : [{
            token : "constant.language.escape.reference.attribute-value.xml",
            regex : "(?:&#[0-9]+;)|(?:&#x[0-9a-fA-F]+;)|(?:&[a-zA-Z0-9_:\\.-]+;)"
        }],

        tag : [{
            token : ["meta.tag.punctuation.tag-open.xml", "meta.tag.punctuation.end-tag-open.xml", "meta.tag.tag-name.xml"],
            regex : "(?:(<)|(</))((?:" + tagRegex + ":)?" + tagRegex + ")",
            next: [
                {include : "attributes"},
                {token : "meta.tag.punctuation.tag-close.xml", regex : "/?>", next : "start"}
            ]
        }],

        tag_whitespace : [
            {token : "text.tag-whitespace.xml", regex : "\\s+"}
        ],
        whitespace : [
            {token : "text.whitespace.xml", regex : "\\s+"}
        ],
        string: [{
            token : "string.xml",
            regex : "'",
            push : [
                {token : "string.xml", regex: "'", next: "pop"},
                {defaultToken : "string.xml"}
            ]
        }, {
            token : "string.xml",
            regex : '"',
            push : [
                {token : "string.xml", regex: '"', next: "pop"},
                {defaultToken : "string.xml"}
            ]
        }],

        attributes: [{
            token : "entity.other.attribute-name.xml",
            regex : tagRegex
        }, {
            token : "keyword.operator.attribute-equals.xml",
            regex : "="
        }, {
            include: "tag_whitespace"
        }, {
            include: "attribute_value"
        }],

        attribute_value: [{
            token : "string.attribute-value.xml",
            regex : "'",
            push : [
                {token : "string.attribute-value.xml", regex: "'", next: "pop"},
                {include : "attr_reference"},
                {defaultToken : "string.attribute-value.xml"}
            ]
        }, {
            token : "string.attribute-value.xml",
            regex : '"',
            push : [
                {token : "string.attribute-value.xml", regex: '"', next: "pop"},
                {include : "attr_reference"},
                {defaultToken : "string.attribute-value.xml"}
            ]
        }]
    };

    if (this.constructor === XmlHighlightRules)
        this.normalizeRules();
};


(function() {

    this.embedTagRules = function(HighlightRules, prefix, tag){
        this.$rules.tag.unshift({
            token : ["meta.tag.punctuation.tag-open.xml", "meta.tag." + tag + ".tag-name.xml"],
            regex : "(<)(" + tag + "(?=\\s|>|$))",
            next: [
                {include : "attributes"},
                {token : "meta.tag.punctuation.tag-close.xml", regex : "/?>", next : prefix + "start"}
            ]
        });

        this.$rules[tag + "-end"] = [
            {include : "attributes"},
            {token : "meta.tag.punctuation.tag-close.xml", regex : "/?>",  next: "start",
                onMatch : function(value, currentState, stack) {
                    stack.splice(0);
                    return this.token;
            }}
        ];

        this.embedRules(HighlightRules, prefix, [{
            token: ["meta.tag.punctuation.end-tag-open.xml", "meta.tag." + tag + ".tag-name.xml"],
            regex : "(</)(" + tag + "(?=\\s|>|$))",
            next: tag + "-end"
        }, {
            token: "string.cdata.xml",
            regex : "<\\!\\[CDATA\\["
        }, {
            token: "string.cdata.xml",
            regex : "\\]\\]>"
        }]);
    };

}).call(TextHighlightRules.prototype);

oop.inherits(XmlHighlightRules, TextHighlightRules);

exports.XmlHighlightRules = XmlHighlightRules;
});

define("ace/mode/html_highlight_rules",["require","exports","module","ace/lib/oop","ace/lib/lang","ace/mode/css_highlight_rules","ace/mode/javascript_highlight_rules","ace/mode/xml_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var lang = require("../lib/lang");
var CssHighlightRules = require("./css_highlight_rules").CssHighlightRules;
var JavaScriptHighlightRules = require("./javascript_highlight_rules").JavaScriptHighlightRules;
var XmlHighlightRules = require("./xml_highlight_rules").XmlHighlightRules;

var tagMap = lang.createMap({
    a           : 'anchor',
    button 	    : 'form',
    form        : 'form',
    img         : 'image',
    input       : 'form',
    label       : 'form',
    option      : 'form',
    script      : 'script',
    select      : 'form',
    textarea    : 'form',
    style       : 'style',
    table       : 'table',
    tbody       : 'table',
    td          : 'table',
    tfoot       : 'table',
    th          : 'table',
    tr          : 'table'
});

var HtmlHighlightRules = function() {
    XmlHighlightRules.call(this);

    this.addRules({
        attributes: [{
            include : "tag_whitespace"
        }, {
            token : "entity.other.attribute-name.xml",
            regex : "[-_a-zA-Z0-9:.]+"
        }, {
            token : "keyword.operator.attribute-equals.xml",
            regex : "=",
            push : [{
                include: "tag_whitespace"
            }, {
                token : "string.unquoted.attribute-value.html",
                regex : "[^<>='\"`\\s]+",
                next : "pop"
            }, {
                token : "empty",
                regex : "",
                next : "pop"
            }]
        }, {
            include : "attribute_value"
        }],
        tag: [{
            token : function(start, tag) {
                var group = tagMap[tag];
                return ["meta.tag.punctuation." + (start == "<" ? "" : "end-") + "tag-open.xml",
                    "meta.tag" + (group ? "." + group : "") + ".tag-name.xml"];
            },
            regex : "(</?)([-_a-zA-Z0-9:.]+)",
            next: "tag_stuff"
        }],
        tag_stuff: [
            {include : "attributes"},
            {token : "meta.tag.punctuation.tag-close.xml", regex : "/?>", next : "start"}
        ]
    });

    this.embedTagRules(CssHighlightRules, "css-", "style");
    this.embedTagRules(new JavaScriptHighlightRules({jsx: false}).getRules(), "js-", "script");

    if (this.constructor === HtmlHighlightRules)
        this.normalizeRules();
};

oop.inherits(HtmlHighlightRules, XmlHighlightRules);

exports.HtmlHighlightRules = HtmlHighlightRules;
});

define("ace/mode/php_highlight_rules",["require","exports","module","ace/lib/oop","ace/lib/lang","ace/mode/doc_comment_highlight_rules","ace/mode/text_highlight_rules","ace/mode/html_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var lang = require("../lib/lang");
var DocCommentHighlightRules = require("./doc_comment_highlight_rules").DocCommentHighlightRules;
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
var HtmlHighlightRules = require("./html_highlight_rules").HtmlHighlightRules;

var PhpLangHighlightRules = function() {
    var docComment = DocCommentHighlightRules;
    var builtinFunctions = lang.arrayToMap(
'abs|acos|acosh|addcslashes|addslashes|aggregate|aggregate_info|aggregate_methods|aggregate_methods_by_list|aggregate_methods_by_regexp|\
aggregate_properties|aggregate_properties_by_list|aggregate_properties_by_regexp|aggregation_info|amqpconnection|amqpexchange|amqpqueue|\
apache_child_terminate|apache_get_modules|apache_get_version|apache_getenv|apache_lookup_uri|apache_note|apache_request_headers|\
apache_reset_timeout|apache_response_headers|apache_setenv|apc_add|apc_bin_dump|apc_bin_dumpfile|apc_bin_load|apc_bin_loadfile|\
apc_cache_info|apc_cas|apc_clear_cache|apc_compile_file|apc_dec|apc_define_constants|apc_delete|apc_delete_file|apc_exists|apc_fetch|\
apc_inc|apc_load_constants|apc_sma_info|apc_store|apciterator|apd_breakpoint|apd_callstack|apd_clunk|apd_continue|apd_croak|\
apd_dump_function_table|apd_dump_persistent_resources|apd_dump_regular_resources|apd_echo|apd_get_active_symbols|apd_set_pprof_trace|\
apd_set_session|apd_set_session_trace|apd_set_session_trace_socket|appenditerator|array|array_change_key_case|array_chunk|array_combine|\
array_count_values|array_diff|array_diff_assoc|array_diff_key|array_diff_uassoc|array_diff_ukey|array_fill|array_fill_keys|array_filter|\
array_flip|array_intersect|array_intersect_assoc|array_intersect_key|array_intersect_uassoc|array_intersect_ukey|array_key_exists|\
array_keys|array_map|array_merge|array_merge_recursive|array_multisort|array_pad|array_pop|array_product|array_push|array_rand|\
array_reduce|array_replace|array_replace_recursive|array_reverse|array_search|array_shift|array_slice|array_splice|array_sum|array_udiff|\
array_udiff_assoc|array_udiff_uassoc|array_uintersect|array_uintersect_assoc|array_uintersect_uassoc|array_unique|array_unshift|\
array_values|array_walk|array_walk_recursive|arrayaccess|arrayiterator|arrayobject|arsort|asin|asinh|asort|assert|assert_options|atan|\
atan2|atanh|audioproperties|badfunctioncallexception|badmethodcallexception|base64_decode|base64_encode|base_convert|basename|\
bbcode_add_element|bbcode_add_smiley|bbcode_create|bbcode_destroy|bbcode_parse|bbcode_set_arg_parser|bbcode_set_flags|bcadd|bccomp|bcdiv|\
bcmod|bcmul|bcompiler_load|bcompiler_load_exe|bcompiler_parse_class|bcompiler_read|bcompiler_write_class|bcompiler_write_constant|\
bcompiler_write_exe_footer|bcompiler_write_file|bcompiler_write_footer|bcompiler_write_function|bcompiler_write_functions_from_file|\
bcompiler_write_header|bcompiler_write_included_filename|bcpow|bcpowmod|bcscale|bcsqrt|bcsub|bin2hex|bind_textdomain_codeset|bindec|\
bindtextdomain|bson_decode|bson_encode|bumpValue|bzclose|bzcompress|bzdecompress|bzerrno|bzerror|bzerrstr|bzflush|bzopen|bzread|bzwrite|\
cachingiterator|cairo|cairo_create|cairo_font_face_get_type|cairo_font_face_status|cairo_font_options_create|cairo_font_options_equal|\
cairo_font_options_get_antialias|cairo_font_options_get_hint_metrics|cairo_font_options_get_hint_style|\
cairo_font_options_get_subpixel_order|cairo_font_options_hash|cairo_font_options_merge|cairo_font_options_set_antialias|\
cairo_font_options_set_hint_metrics|cairo_font_options_set_hint_style|cairo_font_options_set_subpixel_order|cairo_font_options_status|\
cairo_format_stride_for_width|cairo_image_surface_create|cairo_image_surface_create_for_data|cairo_image_surface_create_from_png|\
cairo_image_surface_get_data|cairo_image_surface_get_format|cairo_image_surface_get_height|cairo_image_surface_get_stride|\
cairo_image_surface_get_width|cairo_matrix_create_scale|cairo_matrix_create_translate|cairo_matrix_invert|cairo_matrix_multiply|\
cairo_matrix_rotate|cairo_matrix_transform_distance|cairo_matrix_transform_point|cairo_matrix_translate|cairo_pattern_add_color_stop_rgb|\
cairo_pattern_add_color_stop_rgba|cairo_pattern_create_for_surface|cairo_pattern_create_linear|cairo_pattern_create_radial|\
cairo_pattern_create_rgb|cairo_pattern_create_rgba|cairo_pattern_get_color_stop_count|cairo_pattern_get_color_stop_rgba|\
cairo_pattern_get_extend|cairo_pattern_get_filter|cairo_pattern_get_linear_points|cairo_pattern_get_matrix|\
cairo_pattern_get_radial_circles|cairo_pattern_get_rgba|cairo_pattern_get_surface|cairo_pattern_get_type|cairo_pattern_set_extend|\
cairo_pattern_set_filter|cairo_pattern_set_matrix|cairo_pattern_status|cairo_pdf_surface_create|cairo_pdf_surface_set_size|\
cairo_ps_get_levels|cairo_ps_level_to_string|cairo_ps_surface_create|cairo_ps_surface_dsc_begin_page_setup|\
cairo_ps_surface_dsc_begin_setup|cairo_ps_surface_dsc_comment|cairo_ps_surface_get_eps|cairo_ps_surface_restrict_to_level|\
cairo_ps_surface_set_eps|cairo_ps_surface_set_size|cairo_scaled_font_create|cairo_scaled_font_extents|cairo_scaled_font_get_ctm|\
cairo_scaled_font_get_font_face|cairo_scaled_font_get_font_matrix|cairo_scaled_font_get_font_options|cairo_scaled_font_get_scale_matrix|\
cairo_scaled_font_get_type|cairo_scaled_font_glyph_extents|cairo_scaled_font_status|cairo_scaled_font_text_extents|\
cairo_surface_copy_page|cairo_surface_create_similar|cairo_surface_finish|cairo_surface_flush|cairo_surface_get_content|\
cairo_surface_get_device_offset|cairo_surface_get_font_options|cairo_surface_get_type|cairo_surface_mark_dirty|\
cairo_surface_mark_dirty_rectangle|cairo_surface_set_device_offset|cairo_surface_set_fallback_resolution|cairo_surface_show_page|\
cairo_surface_status|cairo_surface_write_to_png|cairo_svg_surface_create|cairo_svg_surface_restrict_to_version|\
cairo_svg_version_to_string|cairoantialias|cairocontent|cairocontext|cairoexception|cairoextend|cairofillrule|cairofilter|cairofontface|\
cairofontoptions|cairofontslant|cairofonttype|cairofontweight|cairoformat|cairogradientpattern|cairohintmetrics|cairohintstyle|\
cairoimagesurface|cairolineargradient|cairolinecap|cairolinejoin|cairomatrix|cairooperator|cairopath|cairopattern|cairopatterntype|\
cairopdfsurface|cairopslevel|cairopssurface|cairoradialgradient|cairoscaledfont|cairosolidpattern|cairostatus|cairosubpixelorder|\
cairosurface|cairosurfacepattern|cairosurfacetype|cairosvgsurface|cairosvgversion|cairotoyfontface|cal_days_in_month|cal_from_jd|cal_info|\
cal_to_jd|calcul_hmac|calculhmac|call_user_func|call_user_func_array|call_user_method|call_user_method_array|callbackfilteriterator|ceil|\
chdb|chdb_create|chdir|checkdate|checkdnsrr|chgrp|chmod|chop|chown|chr|chroot|chunk_split|class_alias|class_exists|class_implements|\
class_parents|class_uses|classkit_import|classkit_method_add|classkit_method_copy|classkit_method_redefine|classkit_method_remove|\
classkit_method_rename|clearstatcache|clone|closedir|closelog|collator|com|com_addref|com_create_guid|com_event_sink|com_get|\
com_get_active_object|com_invoke|com_isenum|com_load|com_load_typelib|com_message_pump|com_print_typeinfo|com_propget|com_propput|\
com_propset|com_release|com_set|compact|connection_aborted|connection_status|connection_timeout|constant|construct|construct|construct|\
convert_cyr_string|convert_uudecode|convert_uuencode|copy|cos|cosh|count|count_chars|countable|counter_bump|counter_bump_value|\
counter_create|counter_get|counter_get_meta|counter_get_named|counter_get_value|counter_reset|counter_reset_value|crack_check|\
crack_closedict|crack_getlastmessage|crack_opendict|crc32|create_function|crypt|ctype_alnum|ctype_alpha|ctype_cntrl|ctype_digit|\
ctype_graph|ctype_lower|ctype_print|ctype_punct|ctype_space|ctype_upper|ctype_xdigit|cubrid_affected_rows|cubrid_bind|\
cubrid_client_encoding|cubrid_close|cubrid_close_prepare|cubrid_close_request|cubrid_col_get|cubrid_col_size|cubrid_column_names|\
cubrid_column_types|cubrid_commit|cubrid_connect|cubrid_connect_with_url|cubrid_current_oid|cubrid_data_seek|cubrid_db_name|\
cubrid_disconnect|cubrid_drop|cubrid_errno|cubrid_error|cubrid_error_code|cubrid_error_code_facility|cubrid_error_msg|cubrid_execute|\
cubrid_fetch|cubrid_fetch_array|cubrid_fetch_assoc|cubrid_fetch_field|cubrid_fetch_lengths|cubrid_fetch_object|cubrid_fetch_row|\
cubrid_field_flags|cubrid_field_len|cubrid_field_name|cubrid_field_seek|cubrid_field_table|cubrid_field_type|cubrid_free_result|\
cubrid_get|cubrid_get_autocommit|cubrid_get_charset|cubrid_get_class_name|cubrid_get_client_info|cubrid_get_db_parameter|\
cubrid_get_server_info|cubrid_insert_id|cubrid_is_instance|cubrid_list_dbs|cubrid_load_from_glo|cubrid_lob_close|cubrid_lob_export|\
cubrid_lob_get|cubrid_lob_send|cubrid_lob_size|cubrid_lock_read|cubrid_lock_write|cubrid_move_cursor|cubrid_new_glo|cubrid_next_result|\
cubrid_num_cols|cubrid_num_fields|cubrid_num_rows|cubrid_ping|cubrid_prepare|cubrid_put|cubrid_query|cubrid_real_escape_string|\
cubrid_result|cubrid_rollback|cubrid_save_to_glo|cubrid_schema|cubrid_send_glo|cubrid_seq_drop|cubrid_seq_insert|cubrid_seq_put|\
cubrid_set_add|cubrid_set_autocommit|cubrid_set_db_parameter|cubrid_set_drop|cubrid_unbuffered_query|cubrid_version|curl_close|\
curl_copy_handle|curl_errno|curl_error|curl_exec|curl_getinfo|curl_init|curl_multi_add_handle|curl_multi_close|curl_multi_exec|\
curl_multi_getcontent|curl_multi_info_read|curl_multi_init|curl_multi_remove_handle|curl_multi_select|curl_setopt|curl_setopt_array|\
curl_version|current|cyrus_authenticate|cyrus_bind|cyrus_close|cyrus_connect|cyrus_query|cyrus_unbind|date|date_add|date_create|\
date_create_from_format|date_date_set|date_default_timezone_get|date_default_timezone_set|date_diff|date_format|date_get_last_errors|\
date_interval_create_from_date_string|date_interval_format|date_isodate_set|date_modify|date_offset_get|date_parse|date_parse_from_format|\
date_sub|date_sun_info|date_sunrise|date_sunset|date_time_set|date_timestamp_get|date_timestamp_set|date_timezone_get|date_timezone_set|\
dateinterval|dateperiod|datetime|datetimezone|db2_autocommit|db2_bind_param|db2_client_info|db2_close|db2_column_privileges|db2_columns|\
db2_commit|db2_conn_error|db2_conn_errormsg|db2_connect|db2_cursor_type|db2_escape_string|db2_exec|db2_execute|db2_fetch_array|\
db2_fetch_assoc|db2_fetch_both|db2_fetch_object|db2_fetch_row|db2_field_display_size|db2_field_name|db2_field_num|db2_field_precision|\
db2_field_scale|db2_field_type|db2_field_width|db2_foreign_keys|db2_free_result|db2_free_stmt|db2_get_option|db2_last_insert_id|\
db2_lob_read|db2_next_result|db2_num_fields|db2_num_rows|db2_pclose|db2_pconnect|db2_prepare|db2_primary_keys|db2_procedure_columns|\
db2_procedures|db2_result|db2_rollback|db2_server_info|db2_set_option|db2_special_columns|db2_statistics|db2_stmt_error|db2_stmt_errormsg|\
db2_table_privileges|db2_tables|dba_close|dba_delete|dba_exists|dba_fetch|dba_firstkey|dba_handlers|dba_insert|dba_key_split|dba_list|\
dba_nextkey|dba_open|dba_optimize|dba_popen|dba_replace|dba_sync|dbase_add_record|dbase_close|dbase_create|dbase_delete_record|\
dbase_get_header_info|dbase_get_record|dbase_get_record_with_names|dbase_numfields|dbase_numrecords|dbase_open|dbase_pack|\
dbase_replace_record|dbplus_add|dbplus_aql|dbplus_chdir|dbplus_close|dbplus_curr|dbplus_errcode|dbplus_errno|dbplus_find|dbplus_first|\
dbplus_flush|dbplus_freealllocks|dbplus_freelock|dbplus_freerlocks|dbplus_getlock|dbplus_getunique|dbplus_info|dbplus_last|dbplus_lockrel|\
dbplus_next|dbplus_open|dbplus_prev|dbplus_rchperm|dbplus_rcreate|dbplus_rcrtexact|dbplus_rcrtlike|dbplus_resolve|dbplus_restorepos|\
dbplus_rkeys|dbplus_ropen|dbplus_rquery|dbplus_rrename|dbplus_rsecindex|dbplus_runlink|dbplus_rzap|dbplus_savepos|dbplus_setindex|\
dbplus_setindexbynumber|dbplus_sql|dbplus_tcl|dbplus_tremove|dbplus_undo|dbplus_undoprepare|dbplus_unlockrel|dbplus_unselect|\
dbplus_update|dbplus_xlockrel|dbplus_xunlockrel|dbx_close|dbx_compare|dbx_connect|dbx_error|dbx_escape_string|dbx_fetch_row|dbx_query|\
dbx_sort|dcgettext|dcngettext|deaggregate|debug_backtrace|debug_print_backtrace|debug_zval_dump|decbin|dechex|decoct|define|\
define_syslog_variables|defined|deg2rad|delete|dgettext|die|dio_close|dio_fcntl|dio_open|dio_read|dio_seek|dio_stat|dio_tcsetattr|\
dio_truncate|dio_write|dir|directoryiterator|dirname|disk_free_space|disk_total_space|diskfreespace|dl|dngettext|dns_check_record|\
dns_get_mx|dns_get_record|dom_import_simplexml|domainexception|domattr|domattribute_name|domattribute_set_value|domattribute_specified|\
domattribute_value|domcharacterdata|domcomment|domdocument|domdocument_add_root|domdocument_create_attribute|\
domdocument_create_cdata_section|domdocument_create_comment|domdocument_create_element|domdocument_create_element_ns|\
domdocument_create_entity_reference|domdocument_create_processing_instruction|domdocument_create_text_node|domdocument_doctype|\
domdocument_document_element|domdocument_dump_file|domdocument_dump_mem|domdocument_get_element_by_id|domdocument_get_elements_by_tagname|\
domdocument_html_dump_mem|domdocument_xinclude|domdocumentfragment|domdocumenttype|domdocumenttype_entities|\
domdocumenttype_internal_subset|domdocumenttype_name|domdocumenttype_notations|domdocumenttype_public_id|domdocumenttype_system_id|\
domelement|domelement_get_attribute|domelement_get_attribute_node|domelement_get_elements_by_tagname|domelement_has_attribute|\
domelement_remove_attribute|domelement_set_attribute|domelement_set_attribute_node|domelement_tagname|domentity|domentityreference|\
domexception|domimplementation|domnamednodemap|domnode|domnode_add_namespace|domnode_append_child|domnode_append_sibling|\
domnode_attributes|domnode_child_nodes|domnode_clone_node|domnode_dump_node|domnode_first_child|domnode_get_content|\
domnode_has_attributes|domnode_has_child_nodes|domnode_insert_before|domnode_is_blank_node|domnode_last_child|domnode_next_sibling|\
domnode_node_name|domnode_node_type|domnode_node_value|domnode_owner_document|domnode_parent_node|domnode_prefix|domnode_previous_sibling|\
domnode_remove_child|domnode_replace_child|domnode_replace_node|domnode_set_content|domnode_set_name|domnode_set_namespace|\
domnode_unlink_node|domnodelist|domnotation|domprocessinginstruction|domprocessinginstruction_data|domprocessinginstruction_target|\
domtext|domxml_new_doc|domxml_open_file|domxml_open_mem|domxml_version|domxml_xmltree|domxml_xslt_stylesheet|domxml_xslt_stylesheet_doc|\
domxml_xslt_stylesheet_file|domxml_xslt_version|domxpath|domxsltstylesheet_process|domxsltstylesheet_result_dump_file|\
domxsltstylesheet_result_dump_mem|dotnet|dotnet_load|doubleval|each|easter_date|easter_days|echo|empty|emptyiterator|\
enchant_broker_describe|enchant_broker_dict_exists|enchant_broker_free|enchant_broker_free_dict|enchant_broker_get_error|\
enchant_broker_init|enchant_broker_list_dicts|enchant_broker_request_dict|enchant_broker_request_pwl_dict|enchant_broker_set_ordering|\
enchant_dict_add_to_personal|enchant_dict_add_to_session|enchant_dict_check|enchant_dict_describe|enchant_dict_get_error|\
enchant_dict_is_in_session|enchant_dict_quick_check|enchant_dict_store_replacement|enchant_dict_suggest|end|ereg|ereg_replace|eregi|\
eregi_replace|error_get_last|error_log|error_reporting|errorexception|escapeshellarg|escapeshellcmd|eval|event_add|event_base_free|\
event_base_loop|event_base_loopbreak|event_base_loopexit|event_base_new|event_base_priority_init|event_base_set|event_buffer_base_set|\
event_buffer_disable|event_buffer_enable|event_buffer_fd_set|event_buffer_free|event_buffer_new|event_buffer_priority_set|\
event_buffer_read|event_buffer_set_callback|event_buffer_timeout_set|event_buffer_watermark_set|event_buffer_write|event_del|event_free|\
event_new|event_set|exception|exec|exif_imagetype|exif_read_data|exif_tagname|exif_thumbnail|exit|exp|expect_expectl|expect_popen|explode|\
expm1|export|export|extension_loaded|extract|ezmlm_hash|fam_cancel_monitor|fam_close|fam_monitor_collection|fam_monitor_directory|\
fam_monitor_file|fam_next_event|fam_open|fam_pending|fam_resume_monitor|fam_suspend_monitor|fbsql_affected_rows|fbsql_autocommit|\
fbsql_blob_size|fbsql_change_user|fbsql_clob_size|fbsql_close|fbsql_commit|fbsql_connect|fbsql_create_blob|fbsql_create_clob|\
fbsql_create_db|fbsql_data_seek|fbsql_database|fbsql_database_password|fbsql_db_query|fbsql_db_status|fbsql_drop_db|fbsql_errno|\
fbsql_error|fbsql_fetch_array|fbsql_fetch_assoc|fbsql_fetch_field|fbsql_fetch_lengths|fbsql_fetch_object|fbsql_fetch_row|\
fbsql_field_flags|fbsql_field_len|fbsql_field_name|fbsql_field_seek|fbsql_field_table|fbsql_field_type|fbsql_free_result|\
fbsql_get_autostart_info|fbsql_hostname|fbsql_insert_id|fbsql_list_dbs|fbsql_list_fields|fbsql_list_tables|fbsql_next_result|\
fbsql_num_fields|fbsql_num_rows|fbsql_password|fbsql_pconnect|fbsql_query|fbsql_read_blob|fbsql_read_clob|fbsql_result|fbsql_rollback|\
fbsql_rows_fetched|fbsql_select_db|fbsql_set_characterset|fbsql_set_lob_mode|fbsql_set_password|fbsql_set_transaction|fbsql_start_db|\
fbsql_stop_db|fbsql_table_name|fbsql_tablename|fbsql_username|fbsql_warnings|fclose|fdf_add_doc_javascript|fdf_add_template|fdf_close|\
fdf_create|fdf_enum_values|fdf_errno|fdf_error|fdf_get_ap|fdf_get_attachment|fdf_get_encoding|fdf_get_file|fdf_get_flags|fdf_get_opt|\
fdf_get_status|fdf_get_value|fdf_get_version|fdf_header|fdf_next_field_name|fdf_open|fdf_open_string|fdf_remove_item|fdf_save|\
fdf_save_string|fdf_set_ap|fdf_set_encoding|fdf_set_file|fdf_set_flags|fdf_set_javascript_action|fdf_set_on_import_javascript|fdf_set_opt|\
fdf_set_status|fdf_set_submit_form_action|fdf_set_target_frame|fdf_set_value|fdf_set_version|feof|fflush|fgetc|fgetcsv|fgets|fgetss|file|\
file_exists|file_get_contents|file_put_contents|fileatime|filectime|filegroup|fileinode|filemtime|fileowner|fileperms|filepro|\
filepro_fieldcount|filepro_fieldname|filepro_fieldtype|filepro_fieldwidth|filepro_retrieve|filepro_rowcount|filesize|filesystemiterator|\
filetype|filter_has_var|filter_id|filter_input|filter_input_array|filter_list|filter_var|filter_var_array|filteriterator|finfo_buffer|\
finfo_close|finfo_file|finfo_open|finfo_set_flags|floatval|flock|floor|flush|fmod|fnmatch|fopen|forward_static_call|\
forward_static_call_array|fpassthru|fprintf|fputcsv|fputs|fread|frenchtojd|fribidi_log2vis|fscanf|fseek|fsockopen|fstat|ftell|ftok|\
ftp_alloc|ftp_cdup|ftp_chdir|ftp_chmod|ftp_close|ftp_connect|ftp_delete|ftp_exec|ftp_fget|ftp_fput|ftp_get|ftp_get_option|ftp_login|\
ftp_mdtm|ftp_mkdir|ftp_nb_continue|ftp_nb_fget|ftp_nb_fput|ftp_nb_get|ftp_nb_put|ftp_nlist|ftp_pasv|ftp_put|ftp_pwd|ftp_quit|ftp_raw|\
ftp_rawlist|ftp_rename|ftp_rmdir|ftp_set_option|ftp_site|ftp_size|ftp_ssl_connect|ftp_systype|ftruncate|func_get_arg|func_get_args|\
func_num_args|function_exists|fwrite|gc_collect_cycles|gc_disable|gc_enable|gc_enabled|gd_info|gearmanclient|gearmanjob|gearmantask|\
gearmanworker|geoip_continent_code_by_name|geoip_country_code3_by_name|geoip_country_code_by_name|geoip_country_name_by_name|\
geoip_database_info|geoip_db_avail|geoip_db_filename|geoip_db_get_all_info|geoip_id_by_name|geoip_isp_by_name|geoip_org_by_name|\
geoip_record_by_name|geoip_region_by_name|geoip_region_name_by_code|geoip_time_zone_by_country_and_region|getMeta|getNamed|getValue|\
get_browser|get_called_class|get_cfg_var|get_class|get_class_methods|get_class_vars|get_current_user|get_declared_classes|\
get_declared_interfaces|get_declared_traits|get_defined_constants|get_defined_functions|get_defined_vars|get_extension_funcs|get_headers|\
get_html_translation_table|get_include_path|get_included_files|get_loaded_extensions|get_magic_quotes_gpc|get_magic_quotes_runtime|\
get_meta_tags|get_object_vars|get_parent_class|get_required_files|get_resource_type|getallheaders|getconstant|getconstants|getconstructor|\
getcwd|getdate|getdefaultproperties|getdoccomment|getendline|getenv|getextension|getextensionname|getfilename|gethostbyaddr|gethostbyname|\
gethostbynamel|gethostname|getimagesize|getinterfacenames|getinterfaces|getlastmod|getmethod|getmethods|getmodifiers|getmxrr|getmygid|\
getmyinode|getmypid|getmyuid|getname|getnamespacename|getopt|getparentclass|getproperties|getproperty|getprotobyname|getprotobynumber|\
getrandmax|getrusage|getservbyname|getservbyport|getshortname|getstartline|getstaticproperties|getstaticpropertyvalue|gettext|\
gettimeofday|gettype|glob|globiterator|gmagick|gmagickdraw|gmagickpixel|gmdate|gmmktime|gmp_abs|gmp_add|gmp_and|gmp_clrbit|gmp_cmp|\
gmp_com|gmp_div|gmp_div_q|gmp_div_qr|gmp_div_r|gmp_divexact|gmp_fact|gmp_gcd|gmp_gcdext|gmp_hamdist|gmp_init|gmp_intval|gmp_invert|\
gmp_jacobi|gmp_legendre|gmp_mod|gmp_mul|gmp_neg|gmp_nextprime|gmp_or|gmp_perfect_square|gmp_popcount|gmp_pow|gmp_powm|gmp_prob_prime|\
gmp_random|gmp_scan0|gmp_scan1|gmp_setbit|gmp_sign|gmp_sqrt|gmp_sqrtrem|gmp_strval|gmp_sub|gmp_testbit|gmp_xor|gmstrftime|\
gnupg_adddecryptkey|gnupg_addencryptkey|gnupg_addsignkey|gnupg_cleardecryptkeys|gnupg_clearencryptkeys|gnupg_clearsignkeys|gnupg_decrypt|\
gnupg_decryptverify|gnupg_encrypt|gnupg_encryptsign|gnupg_export|gnupg_geterror|gnupg_getprotocol|gnupg_import|gnupg_init|gnupg_keyinfo|\
gnupg_setarmor|gnupg_seterrormode|gnupg_setsignmode|gnupg_sign|gnupg_verify|gopher_parsedir|grapheme_extract|grapheme_stripos|\
grapheme_stristr|grapheme_strlen|grapheme_strpos|grapheme_strripos|grapheme_strrpos|grapheme_strstr|grapheme_substr|gregoriantojd|\
gupnp_context_get_host_ip|gupnp_context_get_port|gupnp_context_get_subscription_timeout|gupnp_context_host_path|gupnp_context_new|\
gupnp_context_set_subscription_timeout|gupnp_context_timeout_add|gupnp_context_unhost_path|gupnp_control_point_browse_start|\
gupnp_control_point_browse_stop|gupnp_control_point_callback_set|gupnp_control_point_new|gupnp_device_action_callback_set|\
gupnp_device_info_get|gupnp_device_info_get_service|gupnp_root_device_get_available|gupnp_root_device_get_relative_location|\
gupnp_root_device_new|gupnp_root_device_set_available|gupnp_root_device_start|gupnp_root_device_stop|gupnp_service_action_get|\
gupnp_service_action_return|gupnp_service_action_return_error|gupnp_service_action_set|gupnp_service_freeze_notify|gupnp_service_info_get|\
gupnp_service_info_get_introspection|gupnp_service_introspection_get_state_variable|gupnp_service_notify|gupnp_service_proxy_action_get|\
gupnp_service_proxy_action_set|gupnp_service_proxy_add_notify|gupnp_service_proxy_callback_set|gupnp_service_proxy_get_subscribed|\
gupnp_service_proxy_remove_notify|gupnp_service_proxy_set_subscribed|gupnp_service_thaw_notify|gzclose|gzcompress|gzdecode|gzdeflate|\
gzencode|gzeof|gzfile|gzgetc|gzgets|gzgetss|gzinflate|gzopen|gzpassthru|gzputs|gzread|gzrewind|gzseek|gztell|gzuncompress|gzwrite|\
halt_compiler|haruannotation|haruannotation_setborderstyle|haruannotation_sethighlightmode|haruannotation_seticon|\
haruannotation_setopened|harudestination|harudestination_setfit|harudestination_setfitb|harudestination_setfitbh|harudestination_setfitbv|\
harudestination_setfith|harudestination_setfitr|harudestination_setfitv|harudestination_setxyz|harudoc|harudoc_addpage|\
harudoc_addpagelabel|harudoc_construct|harudoc_createoutline|harudoc_getcurrentencoder|harudoc_getcurrentpage|harudoc_getencoder|\
harudoc_getfont|harudoc_getinfoattr|harudoc_getpagelayout|harudoc_getpagemode|harudoc_getstreamsize|harudoc_insertpage|harudoc_loadjpeg|\
harudoc_loadpng|harudoc_loadraw|harudoc_loadttc|harudoc_loadttf|harudoc_loadtype1|harudoc_output|harudoc_readfromstream|\
harudoc_reseterror|harudoc_resetstream|harudoc_save|harudoc_savetostream|harudoc_setcompressionmode|harudoc_setcurrentencoder|\
harudoc_setencryptionmode|harudoc_setinfoattr|harudoc_setinfodateattr|harudoc_setopenaction|harudoc_setpagelayout|harudoc_setpagemode|\
harudoc_setpagesconfiguration|harudoc_setpassword|harudoc_setpermission|harudoc_usecnsencodings|harudoc_usecnsfonts|\
harudoc_usecntencodings|harudoc_usecntfonts|harudoc_usejpencodings|harudoc_usejpfonts|harudoc_usekrencodings|harudoc_usekrfonts|\
haruencoder|haruencoder_getbytetype|haruencoder_gettype|haruencoder_getunicode|haruencoder_getwritingmode|haruexception|harufont|\
harufont_getascent|harufont_getcapheight|harufont_getdescent|harufont_getencodingname|harufont_getfontname|harufont_gettextwidth|\
harufont_getunicodewidth|harufont_getxheight|harufont_measuretext|haruimage|haruimage_getbitspercomponent|haruimage_getcolorspace|\
haruimage_getheight|haruimage_getsize|haruimage_getwidth|haruimage_setcolormask|haruimage_setmaskimage|haruoutline|\
haruoutline_setdestination|haruoutline_setopened|harupage|harupage_arc|harupage_begintext|harupage_circle|harupage_closepath|\
harupage_concat|harupage_createdestination|harupage_createlinkannotation|harupage_createtextannotation|harupage_createurlannotation|\
harupage_curveto|harupage_curveto2|harupage_curveto3|harupage_drawimage|harupage_ellipse|harupage_endpath|harupage_endtext|\
harupage_eofill|harupage_eofillstroke|harupage_fill|harupage_fillstroke|harupage_getcharspace|harupage_getcmykfill|harupage_getcmykstroke|\
harupage_getcurrentfont|harupage_getcurrentfontsize|harupage_getcurrentpos|harupage_getcurrenttextpos|harupage_getdash|\
harupage_getfillingcolorspace|harupage_getflatness|harupage_getgmode|harupage_getgrayfill|harupage_getgraystroke|harupage_getheight|\
harupage_gethorizontalscaling|harupage_getlinecap|harupage_getlinejoin|harupage_getlinewidth|harupage_getmiterlimit|harupage_getrgbfill|\
harupage_getrgbstroke|harupage_getstrokingcolorspace|harupage_gettextleading|harupage_gettextmatrix|harupage_gettextrenderingmode|\
harupage_gettextrise|harupage_gettextwidth|harupage_gettransmatrix|harupage_getwidth|harupage_getwordspace|harupage_lineto|\
harupage_measuretext|harupage_movetextpos|harupage_moveto|harupage_movetonextline|harupage_rectangle|harupage_setcharspace|\
harupage_setcmykfill|harupage_setcmykstroke|harupage_setdash|harupage_setflatness|harupage_setfontandsize|harupage_setgrayfill|\
harupage_setgraystroke|harupage_setheight|harupage_sethorizontalscaling|harupage_setlinecap|harupage_setlinejoin|harupage_setlinewidth|\
harupage_setmiterlimit|harupage_setrgbfill|harupage_setrgbstroke|harupage_setrotate|harupage_setsize|harupage_setslideshow|\
harupage_settextleading|harupage_settextmatrix|harupage_settextrenderingmode|harupage_settextrise|harupage_setwidth|harupage_setwordspace|\
harupage_showtext|harupage_showtextnextline|harupage_stroke|harupage_textout|harupage_textrect|hasconstant|hash|hash_algos|hash_copy|\
hash_file|hash_final|hash_hmac|hash_hmac_file|hash_init|hash_update|hash_update_file|hash_update_stream|hasmethod|hasproperty|header|\
header_register_callback|header_remove|headers_list|headers_sent|hebrev|hebrevc|hex2bin|hexdec|highlight_file|highlight_string|\
html_entity_decode|htmlentities|htmlspecialchars|htmlspecialchars_decode|http_build_cookie|http_build_query|http_build_str|http_build_url|\
http_cache_etag|http_cache_last_modified|http_chunked_decode|http_date|http_deflate|http_get|http_get_request_body|\
http_get_request_body_stream|http_get_request_headers|http_head|http_inflate|http_match_etag|http_match_modified|\
http_match_request_header|http_negotiate_charset|http_negotiate_content_type|http_negotiate_language|http_parse_cookie|http_parse_headers|\
http_parse_message|http_parse_params|http_persistent_handles_clean|http_persistent_handles_count|http_persistent_handles_ident|\
http_post_data|http_post_fields|http_put_data|http_put_file|http_put_stream|http_redirect|http_request|http_request_body_encode|\
http_request_method_exists|http_request_method_name|http_request_method_register|http_request_method_unregister|http_response_code|\
http_send_content_disposition|http_send_content_type|http_send_data|http_send_file|http_send_last_modified|http_send_status|\
http_send_stream|http_support|http_throttle|httpdeflatestream|httpdeflatestream_construct|httpdeflatestream_factory|\
httpdeflatestream_finish|httpdeflatestream_flush|httpdeflatestream_update|httpinflatestream|httpinflatestream_construct|\
httpinflatestream_factory|httpinflatestream_finish|httpinflatestream_flush|httpinflatestream_update|httpmessage|httpmessage_addheaders|\
httpmessage_construct|httpmessage_detach|httpmessage_factory|httpmessage_fromenv|httpmessage_fromstring|httpmessage_getbody|\
httpmessage_getheader|httpmessage_getheaders|httpmessage_gethttpversion|httpmessage_getparentmessage|httpmessage_getrequestmethod|\
httpmessage_getrequesturl|httpmessage_getresponsecode|httpmessage_getresponsestatus|httpmessage_gettype|httpmessage_guesscontenttype|\
httpmessage_prepend|httpmessage_reverse|httpmessage_send|httpmessage_setbody|httpmessage_setheaders|httpmessage_sethttpversion|\
httpmessage_setrequestmethod|httpmessage_setrequesturl|httpmessage_setresponsecode|httpmessage_setresponsestatus|httpmessage_settype|\
httpmessage_tomessagetypeobject|httpmessage_tostring|httpquerystring|httpquerystring_construct|httpquerystring_get|httpquerystring_mod|\
httpquerystring_set|httpquerystring_singleton|httpquerystring_toarray|httpquerystring_tostring|httpquerystring_xlate|httprequest|\
httprequest_addcookies|httprequest_addheaders|httprequest_addpostfields|httprequest_addpostfile|httprequest_addputdata|\
httprequest_addquerydata|httprequest_addrawpostdata|httprequest_addssloptions|httprequest_clearhistory|httprequest_construct|\
httprequest_enablecookies|httprequest_getcontenttype|httprequest_getcookies|httprequest_getheaders|httprequest_gethistory|\
httprequest_getmethod|httprequest_getoptions|httprequest_getpostfields|httprequest_getpostfiles|httprequest_getputdata|\
httprequest_getputfile|httprequest_getquerydata|httprequest_getrawpostdata|httprequest_getrawrequestmessage|\
httprequest_getrawresponsemessage|httprequest_getrequestmessage|httprequest_getresponsebody|httprequest_getresponsecode|\
httprequest_getresponsecookies|httprequest_getresponsedata|httprequest_getresponseheader|httprequest_getresponseinfo|\
httprequest_getresponsemessage|httprequest_getresponsestatus|httprequest_getssloptions|httprequest_geturl|httprequest_resetcookies|\
httprequest_send|httprequest_setcontenttype|httprequest_setcookies|httprequest_setheaders|httprequest_setmethod|httprequest_setoptions|\
httprequest_setpostfields|httprequest_setpostfiles|httprequest_setputdata|httprequest_setputfile|httprequest_setquerydata|\
httprequest_setrawpostdata|httprequest_setssloptions|httprequest_seturl|httprequestpool|httprequestpool_attach|httprequestpool_construct|\
httprequestpool_destruct|httprequestpool_detach|httprequestpool_getattachedrequests|httprequestpool_getfinishedrequests|\
httprequestpool_reset|httprequestpool_send|httprequestpool_socketperform|httprequestpool_socketselect|httpresponse|httpresponse_capture|\
httpresponse_getbuffersize|httpresponse_getcache|httpresponse_getcachecontrol|httpresponse_getcontentdisposition|\
httpresponse_getcontenttype|httpresponse_getdata|httpresponse_getetag|httpresponse_getfile|httpresponse_getgzip|httpresponse_getheader|\
httpresponse_getlastmodified|httpresponse_getrequestbody|httpresponse_getrequestbodystream|httpresponse_getrequestheaders|\
httpresponse_getstream|httpresponse_getthrottledelay|httpresponse_guesscontenttype|httpresponse_redirect|httpresponse_send|\
httpresponse_setbuffersize|httpresponse_setcache|httpresponse_setcachecontrol|httpresponse_setcontentdisposition|\
httpresponse_setcontenttype|httpresponse_setdata|httpresponse_setetag|httpresponse_setfile|httpresponse_setgzip|httpresponse_setheader|\
httpresponse_setlastmodified|httpresponse_setstream|httpresponse_setthrottledelay|httpresponse_status|hw_array2objrec|hw_changeobject|\
hw_children|hw_childrenobj|hw_close|hw_connect|hw_connection_info|hw_cp|hw_deleteobject|hw_docbyanchor|hw_docbyanchorobj|\
hw_document_attributes|hw_document_bodytag|hw_document_content|hw_document_setcontent|hw_document_size|hw_dummy|hw_edittext|hw_error|\
hw_errormsg|hw_free_document|hw_getanchors|hw_getanchorsobj|hw_getandlock|hw_getchildcoll|hw_getchildcollobj|hw_getchilddoccoll|\
hw_getchilddoccollobj|hw_getobject|hw_getobjectbyquery|hw_getobjectbyquerycoll|hw_getobjectbyquerycollobj|hw_getobjectbyqueryobj|\
hw_getparents|hw_getparentsobj|hw_getrellink|hw_getremote|hw_getremotechildren|hw_getsrcbydestobj|hw_gettext|hw_getusername|hw_identify|\
hw_incollections|hw_info|hw_inscoll|hw_insdoc|hw_insertanchors|hw_insertdocument|hw_insertobject|hw_mapid|hw_modifyobject|hw_mv|\
hw_new_document|hw_objrec2array|hw_output_document|hw_pconnect|hw_pipedocument|hw_root|hw_setlinkroot|hw_stat|hw_unlock|hw_who|\
hwapi_attribute|hwapi_attribute_key|hwapi_attribute_langdepvalue|hwapi_attribute_value|hwapi_attribute_values|hwapi_checkin|\
hwapi_checkout|hwapi_children|hwapi_content|hwapi_content_mimetype|hwapi_content_read|hwapi_copy|hwapi_dbstat|hwapi_dcstat|\
hwapi_dstanchors|hwapi_dstofsrcanchor|hwapi_error_count|hwapi_error_reason|hwapi_find|hwapi_ftstat|hwapi_hgcsp|hwapi_hwstat|\
hwapi_identify|hwapi_info|hwapi_insert|hwapi_insertanchor|hwapi_insertcollection|hwapi_insertdocument|hwapi_link|hwapi_lock|hwapi_move|\
hwapi_new_content|hwapi_object|hwapi_object_assign|hwapi_object_attreditable|hwapi_object_count|hwapi_object_insert|hwapi_object_new|\
hwapi_object_remove|hwapi_object_title|hwapi_object_value|hwapi_objectbyanchor|hwapi_parents|hwapi_reason_description|hwapi_reason_type|\
hwapi_remove|hwapi_replace|hwapi_setcommittedversion|hwapi_srcanchors|hwapi_srcsofdst|hwapi_unlock|hwapi_user|hwapi_userlist|hypot|\
ibase_add_user|ibase_affected_rows|ibase_backup|ibase_blob_add|ibase_blob_cancel|ibase_blob_close|ibase_blob_create|ibase_blob_echo|\
ibase_blob_get|ibase_blob_import|ibase_blob_info|ibase_blob_open|ibase_close|ibase_commit|ibase_commit_ret|ibase_connect|ibase_db_info|\
ibase_delete_user|ibase_drop_db|ibase_errcode|ibase_errmsg|ibase_execute|ibase_fetch_assoc|ibase_fetch_object|ibase_fetch_row|\
ibase_field_info|ibase_free_event_handler|ibase_free_query|ibase_free_result|ibase_gen_id|ibase_maintain_db|ibase_modify_user|\
ibase_name_result|ibase_num_fields|ibase_num_params|ibase_param_info|ibase_pconnect|ibase_prepare|ibase_query|ibase_restore|\
ibase_rollback|ibase_rollback_ret|ibase_server_info|ibase_service_attach|ibase_service_detach|ibase_set_event_handler|ibase_timefmt|\
ibase_trans|ibase_wait_event|iconv|iconv_get_encoding|iconv_mime_decode|iconv_mime_decode_headers|iconv_mime_encode|iconv_set_encoding|\
iconv_strlen|iconv_strpos|iconv_strrpos|iconv_substr|id3_get_frame_long_name|id3_get_frame_short_name|id3_get_genre_id|id3_get_genre_list|\
id3_get_genre_name|id3_get_tag|id3_get_version|id3_remove_tag|id3_set_tag|id3v2attachedpictureframe|id3v2frame|id3v2tag|idate|\
idn_to_ascii|idn_to_unicode|idn_to_utf8|ifx_affected_rows|ifx_blobinfile_mode|ifx_byteasvarchar|ifx_close|ifx_connect|ifx_copy_blob|\
ifx_create_blob|ifx_create_char|ifx_do|ifx_error|ifx_errormsg|ifx_fetch_row|ifx_fieldproperties|ifx_fieldtypes|ifx_free_blob|\
ifx_free_char|ifx_free_result|ifx_get_blob|ifx_get_char|ifx_getsqlca|ifx_htmltbl_result|ifx_nullformat|ifx_num_fields|ifx_num_rows|\
ifx_pconnect|ifx_prepare|ifx_query|ifx_textasvarchar|ifx_update_blob|ifx_update_char|ifxus_close_slob|ifxus_create_slob|ifxus_free_slob|\
ifxus_open_slob|ifxus_read_slob|ifxus_seek_slob|ifxus_tell_slob|ifxus_write_slob|ignore_user_abort|iis_add_server|iis_get_dir_security|\
iis_get_script_map|iis_get_server_by_comment|iis_get_server_by_path|iis_get_server_rights|iis_get_service_state|iis_remove_server|\
iis_set_app_settings|iis_set_dir_security|iis_set_script_map|iis_set_server_rights|iis_start_server|iis_start_service|iis_stop_server|\
iis_stop_service|image2wbmp|image_type_to_extension|image_type_to_mime_type|imagealphablending|imageantialias|imagearc|imagechar|\
imagecharup|imagecolorallocate|imagecolorallocatealpha|imagecolorat|imagecolorclosest|imagecolorclosestalpha|imagecolorclosesthwb|\
imagecolordeallocate|imagecolorexact|imagecolorexactalpha|imagecolormatch|imagecolorresolve|imagecolorresolvealpha|imagecolorset|\
imagecolorsforindex|imagecolorstotal|imagecolortransparent|imageconvolution|imagecopy|imagecopymerge|imagecopymergegray|\
imagecopyresampled|imagecopyresized|imagecreate|imagecreatefromgd|imagecreatefromgd2|imagecreatefromgd2part|imagecreatefromgif|\
imagecreatefromjpeg|imagecreatefrompng|imagecreatefromstring|imagecreatefromwbmp|imagecreatefromxbm|imagecreatefromxpm|\
imagecreatetruecolor|imagedashedline|imagedestroy|imageellipse|imagefill|imagefilledarc|imagefilledellipse|imagefilledpolygon|\
imagefilledrectangle|imagefilltoborder|imagefilter|imagefontheight|imagefontwidth|imageftbbox|imagefttext|imagegammacorrect|imagegd|\
imagegd2|imagegif|imagegrabscreen|imagegrabwindow|imageinterlace|imageistruecolor|imagejpeg|imagelayereffect|imageline|imageloadfont|\
imagepalettecopy|imagepng|imagepolygon|imagepsbbox|imagepsencodefont|imagepsextendfont|imagepsfreefont|imagepsloadfont|imagepsslantfont|\
imagepstext|imagerectangle|imagerotate|imagesavealpha|imagesetbrush|imagesetpixel|imagesetstyle|imagesetthickness|imagesettile|\
imagestring|imagestringup|imagesx|imagesy|imagetruecolortopalette|imagettfbbox|imagettftext|imagetypes|imagewbmp|imagexbm|imagick|\
imagick_adaptiveblurimage|imagick_adaptiveresizeimage|imagick_adaptivesharpenimage|imagick_adaptivethresholdimage|imagick_addimage|\
imagick_addnoiseimage|imagick_affinetransformimage|imagick_animateimages|imagick_annotateimage|imagick_appendimages|imagick_averageimages|\
imagick_blackthresholdimage|imagick_blurimage|imagick_borderimage|imagick_charcoalimage|imagick_chopimage|imagick_clear|imagick_clipimage|\
imagick_clippathimage|imagick_clone|imagick_clutimage|imagick_coalesceimages|imagick_colorfloodfillimage|imagick_colorizeimage|\
imagick_combineimages|imagick_commentimage|imagick_compareimagechannels|imagick_compareimagelayers|imagick_compareimages|\
imagick_compositeimage|imagick_construct|imagick_contrastimage|imagick_contraststretchimage|imagick_convolveimage|imagick_cropimage|\
imagick_cropthumbnailimage|imagick_current|imagick_cyclecolormapimage|imagick_decipherimage|imagick_deconstructimages|\
imagick_deleteimageartifact|imagick_despeckleimage|imagick_destroy|imagick_displayimage|imagick_displayimages|imagick_distortimage|\
imagick_drawimage|imagick_edgeimage|imagick_embossimage|imagick_encipherimage|imagick_enhanceimage|imagick_equalizeimage|\
imagick_evaluateimage|imagick_extentimage|imagick_flattenimages|imagick_flipimage|imagick_floodfillpaintimage|imagick_flopimage|\
imagick_frameimage|imagick_fximage|imagick_gammaimage|imagick_gaussianblurimage|imagick_getcolorspace|imagick_getcompression|\
imagick_getcompressionquality|imagick_getcopyright|imagick_getfilename|imagick_getfont|imagick_getformat|imagick_getgravity|\
imagick_gethomeurl|imagick_getimage|imagick_getimagealphachannel|imagick_getimageartifact|imagick_getimagebackgroundcolor|\
imagick_getimageblob|imagick_getimageblueprimary|imagick_getimagebordercolor|imagick_getimagechanneldepth|\
imagick_getimagechanneldistortion|imagick_getimagechanneldistortions|imagick_getimagechannelextrema|imagick_getimagechannelmean|\
imagick_getimagechannelrange|imagick_getimagechannelstatistics|imagick_getimageclipmask|imagick_getimagecolormapcolor|\
imagick_getimagecolors|imagick_getimagecolorspace|imagick_getimagecompose|imagick_getimagecompression|imagick_getimagecompressionquality|\
imagick_getimagedelay|imagick_getimagedepth|imagick_getimagedispose|imagick_getimagedistortion|imagick_getimageextrema|\
imagick_getimagefilename|imagick_getimageformat|imagick_getimagegamma|imagick_getimagegeometry|imagick_getimagegravity|\
imagick_getimagegreenprimary|imagick_getimageheight|imagick_getimagehistogram|imagick_getimageindex|imagick_getimageinterlacescheme|\
imagick_getimageinterpolatemethod|imagick_getimageiterations|imagick_getimagelength|imagick_getimagemagicklicense|imagick_getimagematte|\
imagick_getimagemattecolor|imagick_getimageorientation|imagick_getimagepage|imagick_getimagepixelcolor|imagick_getimageprofile|\
imagick_getimageprofiles|imagick_getimageproperties|imagick_getimageproperty|imagick_getimageredprimary|imagick_getimageregion|\
imagick_getimagerenderingintent|imagick_getimageresolution|imagick_getimagesblob|imagick_getimagescene|imagick_getimagesignature|\
imagick_getimagesize|imagick_getimagetickspersecond|imagick_getimagetotalinkdensity|imagick_getimagetype|imagick_getimageunits|\
imagick_getimagevirtualpixelmethod|imagick_getimagewhitepoint|imagick_getimagewidth|imagick_getinterlacescheme|imagick_getiteratorindex|\
imagick_getnumberimages|imagick_getoption|imagick_getpackagename|imagick_getpage|imagick_getpixeliterator|imagick_getpixelregioniterator|\
imagick_getpointsize|imagick_getquantumdepth|imagick_getquantumrange|imagick_getreleasedate|imagick_getresource|imagick_getresourcelimit|\
imagick_getsamplingfactors|imagick_getsize|imagick_getsizeoffset|imagick_getversion|imagick_hasnextimage|imagick_haspreviousimage|\
imagick_identifyimage|imagick_implodeimage|imagick_labelimage|imagick_levelimage|imagick_linearstretchimage|imagick_liquidrescaleimage|\
imagick_magnifyimage|imagick_mapimage|imagick_mattefloodfillimage|imagick_medianfilterimage|imagick_mergeimagelayers|imagick_minifyimage|\
imagick_modulateimage|imagick_montageimage|imagick_morphimages|imagick_mosaicimages|imagick_motionblurimage|imagick_negateimage|\
imagick_newimage|imagick_newpseudoimage|imagick_nextimage|imagick_normalizeimage|imagick_oilpaintimage|imagick_opaquepaintimage|\
imagick_optimizeimagelayers|imagick_orderedposterizeimage|imagick_paintfloodfillimage|imagick_paintopaqueimage|\
imagick_painttransparentimage|imagick_pingimage|imagick_pingimageblob|imagick_pingimagefile|imagick_polaroidimage|imagick_posterizeimage|\
imagick_previewimages|imagick_previousimage|imagick_profileimage|imagick_quantizeimage|imagick_quantizeimages|imagick_queryfontmetrics|\
imagick_queryfonts|imagick_queryformats|imagick_radialblurimage|imagick_raiseimage|imagick_randomthresholdimage|imagick_readimage|\
imagick_readimageblob|imagick_readimagefile|imagick_recolorimage|imagick_reducenoiseimage|imagick_removeimage|imagick_removeimageprofile|\
imagick_render|imagick_resampleimage|imagick_resetimagepage|imagick_resizeimage|imagick_rollimage|imagick_rotateimage|\
imagick_roundcorners|imagick_sampleimage|imagick_scaleimage|imagick_separateimagechannel|imagick_sepiatoneimage|\
imagick_setbackgroundcolor|imagick_setcolorspace|imagick_setcompression|imagick_setcompressionquality|imagick_setfilename|\
imagick_setfirstiterator|imagick_setfont|imagick_setformat|imagick_setgravity|imagick_setimage|imagick_setimagealphachannel|\
imagick_setimageartifact|imagick_setimagebackgroundcolor|imagick_setimagebias|imagick_setimageblueprimary|imagick_setimagebordercolor|\
imagick_setimagechanneldepth|imagick_setimageclipmask|imagick_setimagecolormapcolor|imagick_setimagecolorspace|imagick_setimagecompose|\
imagick_setimagecompression|imagick_setimagecompressionquality|imagick_setimagedelay|imagick_setimagedepth|imagick_setimagedispose|\
imagick_setimageextent|imagick_setimagefilename|imagick_setimageformat|imagick_setimagegamma|imagick_setimagegravity|\
imagick_setimagegreenprimary|imagick_setimageindex|imagick_setimageinterlacescheme|imagick_setimageinterpolatemethod|\
imagick_setimageiterations|imagick_setimagematte|imagick_setimagemattecolor|imagick_setimageopacity|imagick_setimageorientation|\
imagick_setimagepage|imagick_setimageprofile|imagick_setimageproperty|imagick_setimageredprimary|imagick_setimagerenderingintent|\
imagick_setimageresolution|imagick_setimagescene|imagick_setimagetickspersecond|imagick_setimagetype|imagick_setimageunits|\
imagick_setimagevirtualpixelmethod|imagick_setimagewhitepoint|imagick_setinterlacescheme|imagick_setiteratorindex|imagick_setlastiterator|\
imagick_setoption|imagick_setpage|imagick_setpointsize|imagick_setresolution|imagick_setresourcelimit|imagick_setsamplingfactors|\
imagick_setsize|imagick_setsizeoffset|imagick_settype|imagick_shadeimage|imagick_shadowimage|imagick_sharpenimage|imagick_shaveimage|\
imagick_shearimage|imagick_sigmoidalcontrastimage|imagick_sketchimage|imagick_solarizeimage|imagick_spliceimage|imagick_spreadimage|\
imagick_steganoimage|imagick_stereoimage|imagick_stripimage|imagick_swirlimage|imagick_textureimage|imagick_thresholdimage|\
imagick_thumbnailimage|imagick_tintimage|imagick_transformimage|imagick_transparentpaintimage|imagick_transposeimage|\
imagick_transverseimage|imagick_trimimage|imagick_uniqueimagecolors|imagick_unsharpmaskimage|imagick_valid|imagick_vignetteimage|\
imagick_waveimage|imagick_whitethresholdimage|imagick_writeimage|imagick_writeimagefile|imagick_writeimages|imagick_writeimagesfile|\
imagickdraw|imagickdraw_affine|imagickdraw_annotation|imagickdraw_arc|imagickdraw_bezier|imagickdraw_circle|imagickdraw_clear|\
imagickdraw_clone|imagickdraw_color|imagickdraw_comment|imagickdraw_composite|imagickdraw_construct|imagickdraw_destroy|\
imagickdraw_ellipse|imagickdraw_getclippath|imagickdraw_getcliprule|imagickdraw_getclipunits|imagickdraw_getfillcolor|\
imagickdraw_getfillopacity|imagickdraw_getfillrule|imagickdraw_getfont|imagickdraw_getfontfamily|imagickdraw_getfontsize|\
imagickdraw_getfontstyle|imagickdraw_getfontweight|imagickdraw_getgravity|imagickdraw_getstrokeantialias|imagickdraw_getstrokecolor|\
imagickdraw_getstrokedasharray|imagickdraw_getstrokedashoffset|imagickdraw_getstrokelinecap|imagickdraw_getstrokelinejoin|\
imagickdraw_getstrokemiterlimit|imagickdraw_getstrokeopacity|imagickdraw_getstrokewidth|imagickdraw_gettextalignment|\
imagickdraw_gettextantialias|imagickdraw_gettextdecoration|imagickdraw_gettextencoding|imagickdraw_gettextundercolor|\
imagickdraw_getvectorgraphics|imagickdraw_line|imagickdraw_matte|imagickdraw_pathclose|imagickdraw_pathcurvetoabsolute|\
imagickdraw_pathcurvetoquadraticbezierabsolute|imagickdraw_pathcurvetoquadraticbezierrelative|\
imagickdraw_pathcurvetoquadraticbeziersmoothabsolute|imagickdraw_pathcurvetoquadraticbeziersmoothrelative|imagickdraw_pathcurvetorelative|\
imagickdraw_pathcurvetosmoothabsolute|imagickdraw_pathcurvetosmoothrelative|imagickdraw_pathellipticarcabsolute|\
imagickdraw_pathellipticarcrelative|imagickdraw_pathfinish|imagickdraw_pathlinetoabsolute|imagickdraw_pathlinetohorizontalabsolute|\
imagickdraw_pathlinetohorizontalrelative|imagickdraw_pathlinetorelative|imagickdraw_pathlinetoverticalabsolute|\
imagickdraw_pathlinetoverticalrelative|imagickdraw_pathmovetoabsolute|imagickdraw_pathmovetorelative|imagickdraw_pathstart|\
imagickdraw_point|imagickdraw_polygon|imagickdraw_polyline|imagickdraw_pop|imagickdraw_popclippath|imagickdraw_popdefs|\
imagickdraw_poppattern|imagickdraw_push|imagickdraw_pushclippath|imagickdraw_pushdefs|imagickdraw_pushpattern|imagickdraw_rectangle|\
imagickdraw_render|imagickdraw_rotate|imagickdraw_roundrectangle|imagickdraw_scale|imagickdraw_setclippath|imagickdraw_setcliprule|\
imagickdraw_setclipunits|imagickdraw_setfillalpha|imagickdraw_setfillcolor|imagickdraw_setfillopacity|imagickdraw_setfillpatternurl|\
imagickdraw_setfillrule|imagickdraw_setfont|imagickdraw_setfontfamily|imagickdraw_setfontsize|imagickdraw_setfontstretch|\
imagickdraw_setfontstyle|imagickdraw_setfontweight|imagickdraw_setgravity|imagickdraw_setstrokealpha|imagickdraw_setstrokeantialias|\
imagickdraw_setstrokecolor|imagickdraw_setstrokedasharray|imagickdraw_setstrokedashoffset|imagickdraw_setstrokelinecap|\
imagickdraw_setstrokelinejoin|imagickdraw_setstrokemiterlimit|imagickdraw_setstrokeopacity|imagickdraw_setstrokepatternurl|\
imagickdraw_setstrokewidth|imagickdraw_settextalignment|imagickdraw_settextantialias|imagickdraw_settextdecoration|\
imagickdraw_settextencoding|imagickdraw_settextundercolor|imagickdraw_setvectorgraphics|imagickdraw_setviewbox|imagickdraw_skewx|\
imagickdraw_skewy|imagickdraw_translate|imagickpixel|imagickpixel_clear|imagickpixel_construct|imagickpixel_destroy|imagickpixel_getcolor|\
imagickpixel_getcolorasstring|imagickpixel_getcolorcount|imagickpixel_getcolorvalue|imagickpixel_gethsl|imagickpixel_issimilar|\
imagickpixel_setcolor|imagickpixel_setcolorvalue|imagickpixel_sethsl|imagickpixeliterator|imagickpixeliterator_clear|\
imagickpixeliterator_construct|imagickpixeliterator_destroy|imagickpixeliterator_getcurrentiteratorrow|\
imagickpixeliterator_getiteratorrow|imagickpixeliterator_getnextiteratorrow|imagickpixeliterator_getpreviousiteratorrow|\
imagickpixeliterator_newpixeliterator|imagickpixeliterator_newpixelregioniterator|imagickpixeliterator_resetiterator|\
imagickpixeliterator_setiteratorfirstrow|imagickpixeliterator_setiteratorlastrow|imagickpixeliterator_setiteratorrow|\
imagickpixeliterator_synciterator|imap_8bit|imap_alerts|imap_append|imap_base64|imap_binary|imap_body|imap_bodystruct|imap_check|\
imap_clearflag_full|imap_close|imap_create|imap_createmailbox|imap_delete|imap_deletemailbox|imap_errors|imap_expunge|imap_fetch_overview|\
imap_fetchbody|imap_fetchheader|imap_fetchmime|imap_fetchstructure|imap_fetchtext|imap_gc|imap_get_quota|imap_get_quotaroot|imap_getacl|\
imap_getmailboxes|imap_getsubscribed|imap_header|imap_headerinfo|imap_headers|imap_last_error|imap_list|imap_listmailbox|imap_listscan|\
imap_listsubscribed|imap_lsub|imap_mail|imap_mail_compose|imap_mail_copy|imap_mail_move|imap_mailboxmsginfo|imap_mime_header_decode|\
imap_msgno|imap_num_msg|imap_num_recent|imap_open|imap_ping|imap_qprint|imap_rename|imap_renamemailbox|imap_reopen|\
imap_rfc822_parse_adrlist|imap_rfc822_parse_headers|imap_rfc822_write_address|imap_savebody|imap_scan|imap_scanmailbox|imap_search|\
imap_set_quota|imap_setacl|imap_setflag_full|imap_sort|imap_status|imap_subscribe|imap_thread|imap_timeout|imap_uid|imap_undelete|\
imap_unsubscribe|imap_utf7_decode|imap_utf7_encode|imap_utf8|implementsinterface|implode|import_request_variables|in_array|include|\
include_once|inclued_get_data|inet_ntop|inet_pton|infiniteiterator|ingres_autocommit|ingres_autocommit_state|ingres_charset|ingres_close|\
ingres_commit|ingres_connect|ingres_cursor|ingres_errno|ingres_error|ingres_errsqlstate|ingres_escape_string|ingres_execute|\
ingres_fetch_array|ingres_fetch_assoc|ingres_fetch_object|ingres_fetch_proc_return|ingres_fetch_row|ingres_field_length|ingres_field_name|\
ingres_field_nullable|ingres_field_precision|ingres_field_scale|ingres_field_type|ingres_free_result|ingres_next_error|ingres_num_fields|\
ingres_num_rows|ingres_pconnect|ingres_prepare|ingres_query|ingres_result_seek|ingres_rollback|ingres_set_environment|\
ingres_unbuffered_query|ini_alter|ini_get|ini_get_all|ini_restore|ini_set|innamespace|inotify_add_watch|inotify_init|inotify_queue_len|\
inotify_read|inotify_rm_watch|interface_exists|intl_error_name|intl_get_error_code|intl_get_error_message|intl_is_failure|\
intldateformatter|intval|invalidargumentexception|invoke|invokeargs|ip2long|iptcembed|iptcparse|is_a|is_array|is_bool|is_callable|is_dir|\
is_double|is_executable|is_file|is_finite|is_float|is_infinite|is_int|is_integer|is_link|is_long|is_nan|is_null|is_numeric|is_object|\
is_readable|is_real|is_resource|is_scalar|is_soap_fault|is_string|is_subclass_of|is_uploaded_file|is_writable|is_writeable|isabstract|\
iscloneable|isdisabled|isfinal|isinstance|isinstantiable|isinterface|isinternal|isiterateable|isset|issubclassof|isuserdefined|iterator|\
iterator_apply|iterator_count|iterator_to_array|iteratoraggregate|iteratoriterator|java_last_exception_clear|java_last_exception_get|\
jddayofweek|jdmonthname|jdtofrench|jdtogregorian|jdtojewish|jdtojulian|jdtounix|jewishtojd|join|jpeg2wbmp|json_decode|json_encode|\
json_last_error|jsonserializable|judy|judy_type|judy_version|juliantojd|kadm5_chpass_principal|kadm5_create_principal|\
kadm5_delete_principal|kadm5_destroy|kadm5_flush|kadm5_get_policies|kadm5_get_principal|kadm5_get_principals|kadm5_init_with_password|\
kadm5_modify_principal|key|krsort|ksort|lcfirst|lcg_value|lchgrp|lchown|ldap_8859_to_t61|ldap_add|ldap_bind|ldap_close|ldap_compare|\
ldap_connect|ldap_count_entries|ldap_delete|ldap_dn2ufn|ldap_err2str|ldap_errno|ldap_error|ldap_explode_dn|ldap_first_attribute|\
ldap_first_entry|ldap_first_reference|ldap_free_result|ldap_get_attributes|ldap_get_dn|ldap_get_entries|ldap_get_option|ldap_get_values|\
ldap_get_values_len|ldap_list|ldap_mod_add|ldap_mod_del|ldap_mod_replace|ldap_modify|ldap_next_attribute|ldap_next_entry|\
ldap_next_reference|ldap_parse_reference|ldap_parse_result|ldap_read|ldap_rename|ldap_sasl_bind|ldap_search|ldap_set_option|\
ldap_set_rebind_proc|ldap_sort|ldap_start_tls|ldap_t61_to_8859|ldap_unbind|lengthexception|levenshtein|libxml_clear_errors|\
libxml_disable_entity_loader|libxml_get_errors|libxml_get_last_error|libxml_set_streams_context|libxml_use_internal_errors|libxmlerror|\
limititerator|link|linkinfo|list|locale|localeconv|localtime|log|log10|log1p|logicexception|long2ip|lstat|ltrim|lzf_compress|\
lzf_decompress|lzf_optimized_for|m_checkstatus|m_completeauthorizations|m_connect|m_connectionerror|m_deletetrans|m_destroyconn|\
m_destroyengine|m_getcell|m_getcellbynum|m_getcommadelimited|m_getheader|m_initconn|m_initengine|m_iscommadelimited|m_maxconntimeout|\
m_monitor|m_numcolumns|m_numrows|m_parsecommadelimited|m_responsekeys|m_responseparam|m_returnstatus|m_setblocking|m_setdropfile|m_setip|\
m_setssl|m_setssl_cafile|m_setssl_files|m_settimeout|m_sslcert_gen_hash|m_transactionssent|m_transinqueue|m_transkeyval|m_transnew|\
m_transsend|m_uwait|m_validateidentifier|m_verifyconnection|m_verifysslcert|magic_quotes_runtime|mail|\
mailparse_determine_best_xfer_encoding|mailparse_msg_create|mailparse_msg_extract_part|mailparse_msg_extract_part_file|\
mailparse_msg_extract_whole_part_file|mailparse_msg_free|mailparse_msg_get_part|mailparse_msg_get_part_data|mailparse_msg_get_structure|\
mailparse_msg_parse|mailparse_msg_parse_file|mailparse_rfc822_parse_addresses|mailparse_stream_encode|mailparse_uudecode_all|main|max|\
maxdb_affected_rows|maxdb_autocommit|maxdb_bind_param|maxdb_bind_result|maxdb_change_user|maxdb_character_set_name|maxdb_client_encoding|\
maxdb_close|maxdb_close_long_data|maxdb_commit|maxdb_connect|maxdb_connect_errno|maxdb_connect_error|maxdb_data_seek|maxdb_debug|\
maxdb_disable_reads_from_master|maxdb_disable_rpl_parse|maxdb_dump_debug_info|maxdb_embedded_connect|maxdb_enable_reads_from_master|\
maxdb_enable_rpl_parse|maxdb_errno|maxdb_error|maxdb_escape_string|maxdb_execute|maxdb_fetch|maxdb_fetch_array|maxdb_fetch_assoc|\
maxdb_fetch_field|maxdb_fetch_field_direct|maxdb_fetch_fields|maxdb_fetch_lengths|maxdb_fetch_object|maxdb_fetch_row|maxdb_field_count|\
maxdb_field_seek|maxdb_field_tell|maxdb_free_result|maxdb_get_client_info|maxdb_get_client_version|maxdb_get_host_info|maxdb_get_metadata|\
maxdb_get_proto_info|maxdb_get_server_info|maxdb_get_server_version|maxdb_info|maxdb_init|maxdb_insert_id|maxdb_kill|maxdb_master_query|\
maxdb_more_results|maxdb_multi_query|maxdb_next_result|maxdb_num_fields|maxdb_num_rows|maxdb_options|maxdb_param_count|maxdb_ping|\
maxdb_prepare|maxdb_query|maxdb_real_connect|maxdb_real_escape_string|maxdb_real_query|maxdb_report|maxdb_rollback|\
maxdb_rpl_parse_enabled|maxdb_rpl_probe|maxdb_rpl_query_type|maxdb_select_db|maxdb_send_long_data|maxdb_send_query|maxdb_server_end|\
maxdb_server_init|maxdb_set_opt|maxdb_sqlstate|maxdb_ssl_set|maxdb_stat|maxdb_stmt_affected_rows|maxdb_stmt_bind_param|\
maxdb_stmt_bind_result|maxdb_stmt_close|maxdb_stmt_close_long_data|maxdb_stmt_data_seek|maxdb_stmt_errno|maxdb_stmt_error|\
maxdb_stmt_execute|maxdb_stmt_fetch|maxdb_stmt_free_result|maxdb_stmt_init|maxdb_stmt_num_rows|maxdb_stmt_param_count|maxdb_stmt_prepare|\
maxdb_stmt_reset|maxdb_stmt_result_metadata|maxdb_stmt_send_long_data|maxdb_stmt_sqlstate|maxdb_stmt_store_result|maxdb_store_result|\
maxdb_thread_id|maxdb_thread_safe|maxdb_use_result|maxdb_warning_count|mb_check_encoding|mb_convert_case|mb_convert_encoding|\
mb_convert_kana|mb_convert_variables|mb_decode_mimeheader|mb_decode_numericentity|mb_detect_encoding|mb_detect_order|mb_encode_mimeheader|\
mb_encode_numericentity|mb_encoding_aliases|mb_ereg|mb_ereg_match|mb_ereg_replace|mb_ereg_search|mb_ereg_search_getpos|\
mb_ereg_search_getregs|mb_ereg_search_init|mb_ereg_search_pos|mb_ereg_search_regs|mb_ereg_search_setpos|mb_eregi|mb_eregi_replace|\
mb_get_info|mb_http_input|mb_http_output|mb_internal_encoding|mb_language|mb_list_encodings|mb_output_handler|mb_parse_str|\
mb_preferred_mime_name|mb_regex_encoding|mb_regex_set_options|mb_send_mail|mb_split|mb_strcut|mb_strimwidth|mb_stripos|mb_stristr|\
mb_strlen|mb_strpos|mb_strrchr|mb_strrichr|mb_strripos|mb_strrpos|mb_strstr|mb_strtolower|mb_strtoupper|mb_strwidth|\
mb_substitute_character|mb_substr|mb_substr_count|mcrypt_cbc|mcrypt_cfb|mcrypt_create_iv|mcrypt_decrypt|mcrypt_ecb|\
mcrypt_enc_get_algorithms_name|mcrypt_enc_get_block_size|mcrypt_enc_get_iv_size|mcrypt_enc_get_key_size|mcrypt_enc_get_modes_name|\
mcrypt_enc_get_supported_key_sizes|mcrypt_enc_is_block_algorithm|mcrypt_enc_is_block_algorithm_mode|mcrypt_enc_is_block_mode|\
mcrypt_enc_self_test|mcrypt_encrypt|mcrypt_generic|mcrypt_generic_deinit|mcrypt_generic_end|mcrypt_generic_init|mcrypt_get_block_size|\
mcrypt_get_cipher_name|mcrypt_get_iv_size|mcrypt_get_key_size|mcrypt_list_algorithms|mcrypt_list_modes|mcrypt_module_close|\
mcrypt_module_get_algo_block_size|mcrypt_module_get_algo_key_size|mcrypt_module_get_supported_key_sizes|mcrypt_module_is_block_algorithm|\
mcrypt_module_is_block_algorithm_mode|mcrypt_module_is_block_mode|mcrypt_module_open|mcrypt_module_self_test|mcrypt_ofb|md5|md5_file|\
mdecrypt_generic|memcache|memcache_debug|memcached|memory_get_peak_usage|memory_get_usage|messageformatter|metaphone|method_exists|mhash|\
mhash_count|mhash_get_block_size|mhash_get_hash_name|mhash_keygen_s2k|microtime|mime_content_type|min|ming_keypress|\
ming_setcubicthreshold|ming_setscale|ming_setswfcompression|ming_useconstants|ming_useswfversion|mkdir|mktime|money_format|mongo|\
mongobindata|mongocode|mongocollection|mongoconnectionexception|mongocursor|mongocursorexception|mongocursortimeoutexception|mongodate|\
mongodb|mongodbref|mongoexception|mongogridfs|mongogridfscursor|mongogridfsexception|mongogridfsfile|mongoid|mongoint32|mongoint64|\
mongomaxkey|mongominkey|mongoregex|mongotimestamp|move_uploaded_file|mpegfile|mqseries_back|mqseries_begin|mqseries_close|mqseries_cmit|\
mqseries_conn|mqseries_connx|mqseries_disc|mqseries_get|mqseries_inq|mqseries_open|mqseries_put|mqseries_put1|mqseries_set|\
mqseries_strerror|msession_connect|msession_count|msession_create|msession_destroy|msession_disconnect|msession_find|msession_get|\
msession_get_array|msession_get_data|msession_inc|msession_list|msession_listvar|msession_lock|msession_plugin|msession_randstr|\
msession_set|msession_set_array|msession_set_data|msession_timeout|msession_uniq|msession_unlock|msg_get_queue|msg_queue_exists|\
msg_receive|msg_remove_queue|msg_send|msg_set_queue|msg_stat_queue|msql|msql_affected_rows|msql_close|msql_connect|msql_create_db|\
msql_createdb|msql_data_seek|msql_db_query|msql_dbname|msql_drop_db|msql_error|msql_fetch_array|msql_fetch_field|msql_fetch_object|\
msql_fetch_row|msql_field_flags|msql_field_len|msql_field_name|msql_field_seek|msql_field_table|msql_field_type|msql_fieldflags|\
msql_fieldlen|msql_fieldname|msql_fieldtable|msql_fieldtype|msql_free_result|msql_list_dbs|msql_list_fields|msql_list_tables|\
msql_num_fields|msql_num_rows|msql_numfields|msql_numrows|msql_pconnect|msql_query|msql_regcase|msql_result|msql_select_db|msql_tablename|\
mssql_bind|mssql_close|mssql_connect|mssql_data_seek|mssql_execute|mssql_fetch_array|mssql_fetch_assoc|mssql_fetch_batch|\
mssql_fetch_field|mssql_fetch_object|mssql_fetch_row|mssql_field_length|mssql_field_name|mssql_field_seek|mssql_field_type|\
mssql_free_result|mssql_free_statement|mssql_get_last_message|mssql_guid_string|mssql_init|mssql_min_error_severity|\
mssql_min_message_severity|mssql_next_result|mssql_num_fields|mssql_num_rows|mssql_pconnect|mssql_query|mssql_result|mssql_rows_affected|\
mssql_select_db|mt_getrandmax|mt_rand|mt_srand|multipleiterator|mysql_affected_rows|mysql_client_encoding|mysql_close|mysql_connect|\
mysql_create_db|mysql_data_seek|mysql_db_name|mysql_db_query|mysql_drop_db|mysql_errno|mysql_error|mysql_escape_string|mysql_fetch_array|\
mysql_fetch_assoc|mysql_fetch_field|mysql_fetch_lengths|mysql_fetch_object|mysql_fetch_row|mysql_field_flags|mysql_field_len|\
mysql_field_name|mysql_field_seek|mysql_field_table|mysql_field_type|mysql_free_result|mysql_get_client_info|mysql_get_host_info|\
mysql_get_proto_info|mysql_get_server_info|mysql_info|mysql_insert_id|mysql_list_dbs|mysql_list_fields|mysql_list_processes|\
mysql_list_tables|mysql_num_fields|mysql_num_rows|mysql_pconnect|mysql_ping|mysql_query|mysql_real_escape_string|mysql_result|\
mysql_select_db|mysql_set_charset|mysql_stat|mysql_tablename|mysql_thread_id|mysql_unbuffered_query|mysqli|mysqli_affected_rows|\
mysqli_autocommit|mysqli_bind_param|mysqli_bind_result|mysqli_cache_stats|mysqli_change_user|mysqli_character_set_name|\
mysqli_client_encoding|mysqli_close|mysqli_commit|mysqli_connect|mysqli_connect_errno|mysqli_connect_error|mysqli_data_seek|\
mysqli_debug|mysqli_disable_reads_from_master|mysqli_disable_rpl_parse|mysqli_driver|mysqli_dump_debug_info|mysqli_embedded_server_end|\
mysqli_embedded_server_start|mysqli_enable_reads_from_master|mysqli_enable_rpl_parse|mysqli_errno|mysqli_error|mysqli_escape_string|\
mysqli_execute|mysqli_fetch|mysqli_fetch_all|mysqli_fetch_array|mysqli_fetch_assoc|mysqli_fetch_field|mysqli_fetch_field_direct|\
mysqli_fetch_fields|mysqli_fetch_lengths|mysqli_fetch_object|mysqli_fetch_row|mysqli_field_count|mysqli_field_seek|mysqli_field_tell|\
mysqli_free_result|mysqli_get_charset|mysqli_get_client_info|mysqli_get_client_stats|mysqli_get_client_version|mysqli_get_connection_stats|\
mysqli_get_host_info|mysqli_get_metadata|mysqli_get_proto_info|mysqli_get_server_info|mysqli_get_server_version|mysqli_get_warnings|\
mysqli_info|mysqli_init|mysqli_insert_id|mysqli_kill|mysqli_link_construct|mysqli_master_query|mysqli_more_results|mysqli_multi_query|\
mysqli_next_result|mysqli_num_fields|mysqli_num_rows|mysqli_options|mysqli_param_count|mysqli_ping|mysqli_poll|mysqli_prepare|\
mysqli_query|mysqli_real_connect|mysqli_real_escape_string|mysqli_real_query|mysqli_reap_async_query|mysqli_refresh|mysqli_report|\
mysqli_result|mysqli_rollback|mysqli_rpl_parse_enabled|mysqli_rpl_probe|mysqli_rpl_query_type|mysqli_select_db|mysqli_send_long_data|\
mysqli_send_query|mysqli_set_charset|mysqli_set_local_infile_default|mysqli_set_local_infile_handler|mysqli_set_opt|mysqli_slave_query|\
mysqli_sqlstate|mysqli_ssl_set|mysqli_stat|mysqli_stmt|mysqli_stmt_affected_rows|mysqli_stmt_attr_get|mysqli_stmt_attr_set|\
mysqli_stmt_bind_param|mysqli_stmt_bind_result|mysqli_stmt_close|mysqli_stmt_data_seek|mysqli_stmt_errno|mysqli_stmt_error|\
mysqli_stmt_execute|mysqli_stmt_fetch|mysqli_stmt_field_count|mysqli_stmt_free_result|mysqli_stmt_get_result|mysqli_stmt_get_warnings|\
mysqli_stmt_init|mysqli_stmt_insert_id|mysqli_stmt_next_result|mysqli_stmt_num_rows|mysqli_stmt_param_count|mysqli_stmt_prepare|\
mysqli_stmt_reset|mysqli_stmt_result_metadata|mysqli_stmt_send_long_data|mysqli_stmt_sqlstate|mysqli_stmt_store_result|mysqli_store_result|\
mysqli_thread_id|mysqli_thread_safe|mysqli_use_result|mysqli_warning|mysqli_warning_count|mysqlnd_ms_get_stats|\
mysqlnd_ms_query_is_select|mysqlnd_ms_set_user_pick_server|mysqlnd_qc_change_handler|mysqlnd_qc_clear_cache|mysqlnd_qc_get_cache_info|\
mysqlnd_qc_get_core_stats|mysqlnd_qc_get_handler|mysqlnd_qc_get_query_trace_log|mysqlnd_qc_set_user_handlers|natcasesort|natsort|\
ncurses_addch|ncurses_addchnstr|ncurses_addchstr|ncurses_addnstr|ncurses_addstr|ncurses_assume_default_colors|ncurses_attroff|\
ncurses_attron|ncurses_attrset|ncurses_baudrate|ncurses_beep|ncurses_bkgd|ncurses_bkgdset|ncurses_border|ncurses_bottom_panel|\
ncurses_can_change_color|ncurses_cbreak|ncurses_clear|ncurses_clrtobot|ncurses_clrtoeol|ncurses_color_content|ncurses_color_set|\
ncurses_curs_set|ncurses_def_prog_mode|ncurses_def_shell_mode|ncurses_define_key|ncurses_del_panel|ncurses_delay_output|ncurses_delch|\
ncurses_deleteln|ncurses_delwin|ncurses_doupdate|ncurses_echo|ncurses_echochar|ncurses_end|ncurses_erase|ncurses_erasechar|ncurses_filter|\
ncurses_flash|ncurses_flushinp|ncurses_getch|ncurses_getmaxyx|ncurses_getmouse|ncurses_getyx|ncurses_halfdelay|ncurses_has_colors|\
ncurses_has_ic|ncurses_has_il|ncurses_has_key|ncurses_hide_panel|ncurses_hline|ncurses_inch|ncurses_init|ncurses_init_color|\
ncurses_init_pair|ncurses_insch|ncurses_insdelln|ncurses_insertln|ncurses_insstr|ncurses_instr|ncurses_isendwin|ncurses_keyok|\
ncurses_keypad|ncurses_killchar|ncurses_longname|ncurses_meta|ncurses_mouse_trafo|ncurses_mouseinterval|ncurses_mousemask|ncurses_move|\
ncurses_move_panel|ncurses_mvaddch|ncurses_mvaddchnstr|ncurses_mvaddchstr|ncurses_mvaddnstr|ncurses_mvaddstr|ncurses_mvcur|\
ncurses_mvdelch|ncurses_mvgetch|ncurses_mvhline|ncurses_mvinch|ncurses_mvvline|ncurses_mvwaddstr|ncurses_napms|ncurses_new_panel|\
ncurses_newpad|ncurses_newwin|ncurses_nl|ncurses_nocbreak|ncurses_noecho|ncurses_nonl|ncurses_noqiflush|ncurses_noraw|\
ncurses_pair_content|ncurses_panel_above|ncurses_panel_below|ncurses_panel_window|ncurses_pnoutrefresh|ncurses_prefresh|ncurses_putp|\
ncurses_qiflush|ncurses_raw|ncurses_refresh|ncurses_replace_panel|ncurses_reset_prog_mode|ncurses_reset_shell_mode|ncurses_resetty|\
ncurses_savetty|ncurses_scr_dump|ncurses_scr_init|ncurses_scr_restore|ncurses_scr_set|ncurses_scrl|ncurses_show_panel|ncurses_slk_attr|\
ncurses_slk_attroff|ncurses_slk_attron|ncurses_slk_attrset|ncurses_slk_clear|ncurses_slk_color|ncurses_slk_init|ncurses_slk_noutrefresh|\
ncurses_slk_refresh|ncurses_slk_restore|ncurses_slk_set|ncurses_slk_touch|ncurses_standend|ncurses_standout|ncurses_start_color|\
ncurses_termattrs|ncurses_termname|ncurses_timeout|ncurses_top_panel|ncurses_typeahead|ncurses_ungetch|ncurses_ungetmouse|\
ncurses_update_panels|ncurses_use_default_colors|ncurses_use_env|ncurses_use_extended_names|ncurses_vidattr|ncurses_vline|ncurses_waddch|\
ncurses_waddstr|ncurses_wattroff|ncurses_wattron|ncurses_wattrset|ncurses_wborder|ncurses_wclear|ncurses_wcolor_set|ncurses_werase|\
ncurses_wgetch|ncurses_whline|ncurses_wmouse_trafo|ncurses_wmove|ncurses_wnoutrefresh|ncurses_wrefresh|ncurses_wstandend|\
ncurses_wstandout|ncurses_wvline|newinstance|newinstanceargs|newt_bell|newt_button|newt_button_bar|newt_centered_window|newt_checkbox|\
newt_checkbox_get_value|newt_checkbox_set_flags|newt_checkbox_set_value|newt_checkbox_tree|newt_checkbox_tree_add_item|\
newt_checkbox_tree_find_item|newt_checkbox_tree_get_current|newt_checkbox_tree_get_entry_value|newt_checkbox_tree_get_multi_selection|\
newt_checkbox_tree_get_selection|newt_checkbox_tree_multi|newt_checkbox_tree_set_current|newt_checkbox_tree_set_entry|\
newt_checkbox_tree_set_entry_value|newt_checkbox_tree_set_width|newt_clear_key_buffer|newt_cls|newt_compact_button|\
newt_component_add_callback|newt_component_takes_focus|newt_create_grid|newt_cursor_off|newt_cursor_on|newt_delay|newt_draw_form|\
newt_draw_root_text|newt_entry|newt_entry_get_value|newt_entry_set|newt_entry_set_filter|newt_entry_set_flags|newt_finished|newt_form|\
newt_form_add_component|newt_form_add_components|newt_form_add_hot_key|newt_form_destroy|newt_form_get_current|newt_form_run|\
newt_form_set_background|newt_form_set_height|newt_form_set_size|newt_form_set_timer|newt_form_set_width|newt_form_watch_fd|\
newt_get_screen_size|newt_grid_add_components_to_form|newt_grid_basic_window|newt_grid_free|newt_grid_get_size|newt_grid_h_close_stacked|\
newt_grid_h_stacked|newt_grid_place|newt_grid_set_field|newt_grid_simple_window|newt_grid_v_close_stacked|newt_grid_v_stacked|\
newt_grid_wrapped_window|newt_grid_wrapped_window_at|newt_init|newt_label|newt_label_set_text|newt_listbox|newt_listbox_append_entry|\
newt_listbox_clear|newt_listbox_clear_selection|newt_listbox_delete_entry|newt_listbox_get_current|newt_listbox_get_selection|\
newt_listbox_insert_entry|newt_listbox_item_count|newt_listbox_select_item|newt_listbox_set_current|newt_listbox_set_current_by_key|\
newt_listbox_set_data|newt_listbox_set_entry|newt_listbox_set_width|newt_listitem|newt_listitem_get_data|newt_listitem_set|\
newt_open_window|newt_pop_help_line|newt_pop_window|newt_push_help_line|newt_radio_get_current|newt_radiobutton|newt_redraw_help_line|\
newt_reflow_text|newt_refresh|newt_resize_screen|newt_resume|newt_run_form|newt_scale|newt_scale_set|newt_scrollbar_set|\
newt_set_help_callback|newt_set_suspend_callback|newt_suspend|newt_textbox|newt_textbox_get_num_lines|newt_textbox_reflowed|\
newt_textbox_set_height|newt_textbox_set_text|newt_vertical_scrollbar|newt_wait_for_key|newt_win_choice|newt_win_entries|newt_win_menu|\
newt_win_message|newt_win_messagev|newt_win_ternary|next|ngettext|nl2br|nl_langinfo|norewinditerator|normalizer|notes_body|notes_copy_db|\
notes_create_db|notes_create_note|notes_drop_db|notes_find_note|notes_header_info|notes_list_msgs|notes_mark_read|notes_mark_unread|\
notes_nav_create|notes_search|notes_unread|notes_version|nsapi_request_headers|nsapi_response_headers|nsapi_virtual|nthmac|number_format|\
numberformatter|oauth|oauth_get_sbs|oauth_urlencode|oauthexception|oauthprovider|ob_clean|ob_deflatehandler|ob_end_clean|ob_end_flush|\
ob_etaghandler|ob_flush|ob_get_clean|ob_get_contents|ob_get_flush|ob_get_length|ob_get_level|ob_get_status|ob_gzhandler|ob_iconv_handler|\
ob_implicit_flush|ob_inflatehandler|ob_list_handlers|ob_start|ob_tidyhandler|oci_bind_array_by_name|oci_bind_by_name|oci_cancel|\
oci_client_version|oci_close|oci_collection_append|oci_collection_assign|oci_collection_element_assign|oci_collection_element_get|\
oci_collection_free|oci_collection_max|oci_collection_size|oci_collection_trim|oci_commit|oci_connect|oci_define_by_name|oci_error|\
oci_execute|oci_fetch|oci_fetch_all|oci_fetch_array|oci_fetch_assoc|oci_fetch_object|oci_fetch_row|oci_field_is_null|oci_field_name|\
oci_field_precision|oci_field_scale|oci_field_size|oci_field_type|oci_field_type_raw|oci_free_statement|oci_internal_debug|oci_lob_append|\
oci_lob_close|oci_lob_copy|oci_lob_eof|oci_lob_erase|oci_lob_export|oci_lob_flush|oci_lob_free|oci_lob_getbuffering|oci_lob_import|\
oci_lob_is_equal|oci_lob_load|oci_lob_read|oci_lob_rewind|oci_lob_save|oci_lob_savefile|oci_lob_seek|oci_lob_setbuffering|oci_lob_size|\
oci_lob_tell|oci_lob_truncate|oci_lob_write|oci_lob_writetemporary|oci_lob_writetofile|oci_new_collection|oci_new_connect|oci_new_cursor|\
oci_new_descriptor|oci_num_fields|oci_num_rows|oci_parse|oci_password_change|oci_pconnect|oci_result|oci_rollback|oci_server_version|\
oci_set_action|oci_set_client_identifier|oci_set_client_info|oci_set_edition|oci_set_module_name|oci_set_prefetch|oci_statement_type|\
ocibindbyname|ocicancel|ocicloselob|ocicollappend|ocicollassign|ocicollassignelem|ocicollgetelem|ocicollmax|ocicollsize|ocicolltrim|\
ocicolumnisnull|ocicolumnname|ocicolumnprecision|ocicolumnscale|ocicolumnsize|ocicolumntype|ocicolumntyperaw|ocicommit|ocidefinebyname|\
ocierror|ociexecute|ocifetch|ocifetchinto|ocifetchstatement|ocifreecollection|ocifreecursor|ocifreedesc|ocifreestatement|ociinternaldebug|\
ociloadlob|ocilogoff|ocilogon|ocinewcollection|ocinewcursor|ocinewdescriptor|ocinlogon|ocinumcols|ociparse|ociplogon|ociresult|\
ocirollback|ocirowcount|ocisavelob|ocisavelobfile|ociserverversion|ocisetprefetch|ocistatementtype|ociwritelobtofile|ociwritetemporarylob|\
octdec|odbc_autocommit|odbc_binmode|odbc_close|odbc_close_all|odbc_columnprivileges|odbc_columns|odbc_commit|odbc_connect|odbc_cursor|\
odbc_data_source|odbc_do|odbc_error|odbc_errormsg|odbc_exec|odbc_execute|odbc_fetch_array|odbc_fetch_into|odbc_fetch_object|\
odbc_fetch_row|odbc_field_len|odbc_field_name|odbc_field_num|odbc_field_precision|odbc_field_scale|odbc_field_type|odbc_foreignkeys|\
odbc_free_result|odbc_gettypeinfo|odbc_longreadlen|odbc_next_result|odbc_num_fields|odbc_num_rows|odbc_pconnect|odbc_prepare|\
odbc_primarykeys|odbc_procedurecolumns|odbc_procedures|odbc_result|odbc_result_all|odbc_rollback|odbc_setoption|odbc_specialcolumns|\
odbc_statistics|odbc_tableprivileges|odbc_tables|openal_buffer_create|openal_buffer_data|openal_buffer_destroy|openal_buffer_get|\
openal_buffer_loadwav|openal_context_create|openal_context_current|openal_context_destroy|openal_context_process|openal_context_suspend|\
openal_device_close|openal_device_open|openal_listener_get|openal_listener_set|openal_source_create|openal_source_destroy|\
openal_source_get|openal_source_pause|openal_source_play|openal_source_rewind|openal_source_set|openal_source_stop|openal_stream|opendir|\
openlog|openssl_cipher_iv_length|openssl_csr_export|openssl_csr_export_to_file|openssl_csr_get_public_key|openssl_csr_get_subject|\
openssl_csr_new|openssl_csr_sign|openssl_decrypt|openssl_dh_compute_key|openssl_digest|openssl_encrypt|openssl_error_string|\
openssl_free_key|openssl_get_cipher_methods|openssl_get_md_methods|openssl_get_privatekey|openssl_get_publickey|openssl_open|\
openssl_pkcs12_export|openssl_pkcs12_export_to_file|openssl_pkcs12_read|openssl_pkcs7_decrypt|openssl_pkcs7_encrypt|openssl_pkcs7_sign|\
openssl_pkcs7_verify|openssl_pkey_export|openssl_pkey_export_to_file|openssl_pkey_free|openssl_pkey_get_details|openssl_pkey_get_private|\
openssl_pkey_get_public|openssl_pkey_new|openssl_private_decrypt|openssl_private_encrypt|openssl_public_decrypt|openssl_public_encrypt|\
openssl_random_pseudo_bytes|openssl_seal|openssl_sign|openssl_verify|openssl_x509_check_private_key|openssl_x509_checkpurpose|\
openssl_x509_export|openssl_x509_export_to_file|openssl_x509_free|openssl_x509_parse|openssl_x509_read|ord|outeriterator|\
outofboundsexception|outofrangeexception|output_add_rewrite_var|output_reset_rewrite_vars|overflowexception|overload|override_function|\
ovrimos_close|ovrimos_commit|ovrimos_connect|ovrimos_cursor|ovrimos_exec|ovrimos_execute|ovrimos_fetch_into|ovrimos_fetch_row|\
ovrimos_field_len|ovrimos_field_name|ovrimos_field_num|ovrimos_field_type|ovrimos_free_result|ovrimos_longreadlen|ovrimos_num_fields|\
ovrimos_num_rows|ovrimos_prepare|ovrimos_result|ovrimos_result_all|ovrimos_rollback|pack|parentiterator|parse_ini_file|parse_ini_string|\
parse_str|parse_url|parsekit_compile_file|parsekit_compile_string|parsekit_func_arginfo|passthru|pathinfo|pclose|pcntl_alarm|pcntl_exec|\
pcntl_fork|pcntl_getpriority|pcntl_setpriority|pcntl_signal|pcntl_signal_dispatch|pcntl_sigprocmask|pcntl_sigtimedwait|pcntl_sigwaitinfo|\
pcntl_wait|pcntl_waitpid|pcntl_wexitstatus|pcntl_wifexited|pcntl_wifsignaled|pcntl_wifstopped|pcntl_wstopsig|pcntl_wtermsig|\
pdf_activate_item|pdf_add_annotation|pdf_add_bookmark|pdf_add_launchlink|pdf_add_locallink|pdf_add_nameddest|pdf_add_note|pdf_add_outline|\
pdf_add_pdflink|pdf_add_table_cell|pdf_add_textflow|pdf_add_thumbnail|pdf_add_weblink|pdf_arc|pdf_arcn|pdf_attach_file|pdf_begin_document|\
pdf_begin_font|pdf_begin_glyph|pdf_begin_item|pdf_begin_layer|pdf_begin_page|pdf_begin_page_ext|pdf_begin_pattern|pdf_begin_template|\
pdf_begin_template_ext|pdf_circle|pdf_clip|pdf_close|pdf_close_image|pdf_close_pdi|pdf_close_pdi_page|pdf_closepath|\
pdf_closepath_fill_stroke|pdf_closepath_stroke|pdf_concat|pdf_continue_text|pdf_create_3dview|pdf_create_action|pdf_create_annotation|\
pdf_create_bookmark|pdf_create_field|pdf_create_fieldgroup|pdf_create_gstate|pdf_create_pvf|pdf_create_textflow|pdf_curveto|\
pdf_define_layer|pdf_delete|pdf_delete_pvf|pdf_delete_table|pdf_delete_textflow|pdf_encoding_set_char|pdf_end_document|pdf_end_font|\
pdf_end_glyph|pdf_end_item|pdf_end_layer|pdf_end_page|pdf_end_page_ext|pdf_end_pattern|pdf_end_template|pdf_endpath|pdf_fill|\
pdf_fill_imageblock|pdf_fill_pdfblock|pdf_fill_stroke|pdf_fill_textblock|pdf_findfont|pdf_fit_image|pdf_fit_pdi_page|pdf_fit_table|\
pdf_fit_textflow|pdf_fit_textline|pdf_get_apiname|pdf_get_buffer|pdf_get_errmsg|pdf_get_errnum|pdf_get_font|pdf_get_fontname|\
pdf_get_fontsize|pdf_get_image_height|pdf_get_image_width|pdf_get_majorversion|pdf_get_minorversion|pdf_get_parameter|\
pdf_get_pdi_parameter|pdf_get_pdi_value|pdf_get_value|pdf_info_font|pdf_info_matchbox|pdf_info_table|pdf_info_textflow|pdf_info_textline|\
pdf_initgraphics|pdf_lineto|pdf_load_3ddata|pdf_load_font|pdf_load_iccprofile|pdf_load_image|pdf_makespotcolor|pdf_moveto|pdf_new|\
pdf_open_ccitt|pdf_open_file|pdf_open_gif|pdf_open_image|pdf_open_image_file|pdf_open_jpeg|pdf_open_memory_image|pdf_open_pdi|\
pdf_open_pdi_document|pdf_open_pdi_page|pdf_open_tiff|pdf_pcos_get_number|pdf_pcos_get_stream|pdf_pcos_get_string|pdf_place_image|\
pdf_place_pdi_page|pdf_process_pdi|pdf_rect|pdf_restore|pdf_resume_page|pdf_rotate|pdf_save|pdf_scale|pdf_set_border_color|\
pdf_set_border_dash|pdf_set_border_style|pdf_set_char_spacing|pdf_set_duration|pdf_set_gstate|pdf_set_horiz_scaling|pdf_set_info|\
pdf_set_info_author|pdf_set_info_creator|pdf_set_info_keywords|pdf_set_info_subject|pdf_set_info_title|pdf_set_layer_dependency|\
pdf_set_leading|pdf_set_parameter|pdf_set_text_matrix|pdf_set_text_pos|pdf_set_text_rendering|pdf_set_text_rise|pdf_set_value|\
pdf_set_word_spacing|pdf_setcolor|pdf_setdash|pdf_setdashpattern|pdf_setflat|pdf_setfont|pdf_setgray|pdf_setgray_fill|pdf_setgray_stroke|\
pdf_setlinecap|pdf_setlinejoin|pdf_setlinewidth|pdf_setmatrix|pdf_setmiterlimit|pdf_setpolydash|pdf_setrgbcolor|pdf_setrgbcolor_fill|\
pdf_setrgbcolor_stroke|pdf_shading|pdf_shading_pattern|pdf_shfill|pdf_show|pdf_show_boxed|pdf_show_xy|pdf_skew|pdf_stringwidth|pdf_stroke|\
pdf_suspend_page|pdf_translate|pdf_utf16_to_utf8|pdf_utf32_to_utf16|pdf_utf8_to_utf16|pdo|pdo_cubrid_schema|pdo_pgsqllobcreate|\
pdo_pgsqllobopen|pdo_pgsqllobunlink|pdo_sqlitecreateaggregate|pdo_sqlitecreatefunction|pdoexception|pdostatement|pfsockopen|\
pg_affected_rows|pg_cancel_query|pg_client_encoding|pg_close|pg_connect|pg_connection_busy|pg_connection_reset|pg_connection_status|\
pg_convert|pg_copy_from|pg_copy_to|pg_dbname|pg_delete|pg_end_copy|pg_escape_bytea|pg_escape_string|pg_execute|pg_fetch_all|\
pg_fetch_all_columns|pg_fetch_array|pg_fetch_assoc|pg_fetch_object|pg_fetch_result|pg_fetch_row|pg_field_is_null|pg_field_name|\
pg_field_num|pg_field_prtlen|pg_field_size|pg_field_table|pg_field_type|pg_field_type_oid|pg_free_result|pg_get_notify|pg_get_pid|\
pg_get_result|pg_host|pg_insert|pg_last_error|pg_last_notice|pg_last_oid|pg_lo_close|pg_lo_create|pg_lo_export|pg_lo_import|pg_lo_open|\
pg_lo_read|pg_lo_read_all|pg_lo_seek|pg_lo_tell|pg_lo_unlink|pg_lo_write|pg_meta_data|pg_num_fields|pg_num_rows|pg_options|\
pg_parameter_status|pg_pconnect|pg_ping|pg_port|pg_prepare|pg_put_line|pg_query|pg_query_params|pg_result_error|pg_result_error_field|\
pg_result_seek|pg_result_status|pg_select|pg_send_execute|pg_send_prepare|pg_send_query|pg_send_query_params|pg_set_client_encoding|\
pg_set_error_verbosity|pg_trace|pg_transaction_status|pg_tty|pg_unescape_bytea|pg_untrace|pg_update|pg_version|php_check_syntax|\
php_ini_loaded_file|php_ini_scanned_files|php_logo_guid|php_sapi_name|php_strip_whitespace|php_uname|phpcredits|phpinfo|phpversion|pi|\
png2wbmp|popen|pos|posix_access|posix_ctermid|posix_errno|posix_get_last_error|posix_getcwd|posix_getegid|posix_geteuid|posix_getgid|\
posix_getgrgid|posix_getgrnam|posix_getgroups|posix_getlogin|posix_getpgid|posix_getpgrp|posix_getpid|posix_getppid|posix_getpwnam|\
posix_getpwuid|posix_getrlimit|posix_getsid|posix_getuid|posix_initgroups|posix_isatty|posix_kill|posix_mkfifo|posix_mknod|posix_setegid|\
posix_seteuid|posix_setgid|posix_setpgid|posix_setsid|posix_setuid|posix_strerror|posix_times|posix_ttyname|posix_uname|pow|preg_filter|\
preg_grep|preg_last_error|preg_match|preg_match_all|preg_quote|preg_replace|preg_replace_callback|preg_split|prev|print|print_r|\
printer_abort|printer_close|printer_create_brush|printer_create_dc|printer_create_font|printer_create_pen|printer_delete_brush|\
printer_delete_dc|printer_delete_font|printer_delete_pen|printer_draw_bmp|printer_draw_chord|printer_draw_elipse|printer_draw_line|\
printer_draw_pie|printer_draw_rectangle|printer_draw_roundrect|printer_draw_text|printer_end_doc|printer_end_page|printer_get_option|\
printer_list|printer_logical_fontheight|printer_open|printer_select_brush|printer_select_font|printer_select_pen|printer_set_option|\
printer_start_doc|printer_start_page|printer_write|printf|proc_close|proc_get_status|proc_nice|proc_open|proc_terminate|property_exists|\
ps_add_bookmark|ps_add_launchlink|ps_add_locallink|ps_add_note|ps_add_pdflink|ps_add_weblink|ps_arc|ps_arcn|ps_begin_page|\
ps_begin_pattern|ps_begin_template|ps_circle|ps_clip|ps_close|ps_close_image|ps_closepath|ps_closepath_stroke|ps_continue_text|ps_curveto|\
ps_delete|ps_end_page|ps_end_pattern|ps_end_template|ps_fill|ps_fill_stroke|ps_findfont|ps_get_buffer|ps_get_parameter|ps_get_value|\
ps_hyphenate|ps_include_file|ps_lineto|ps_makespotcolor|ps_moveto|ps_new|ps_open_file|ps_open_image|ps_open_image_file|\
ps_open_memory_image|ps_place_image|ps_rect|ps_restore|ps_rotate|ps_save|ps_scale|ps_set_border_color|ps_set_border_dash|\
ps_set_border_style|ps_set_info|ps_set_parameter|ps_set_text_pos|ps_set_value|ps_setcolor|ps_setdash|ps_setflat|ps_setfont|ps_setgray|\
ps_setlinecap|ps_setlinejoin|ps_setlinewidth|ps_setmiterlimit|ps_setoverprintmode|ps_setpolydash|ps_shading|ps_shading_pattern|ps_shfill|\
ps_show|ps_show2|ps_show_boxed|ps_show_xy|ps_show_xy2|ps_string_geometry|ps_stringwidth|ps_stroke|ps_symbol|ps_symbol_name|\
ps_symbol_width|ps_translate|pspell_add_to_personal|pspell_add_to_session|pspell_check|pspell_clear_session|pspell_config_create|\
pspell_config_data_dir|pspell_config_dict_dir|pspell_config_ignore|pspell_config_mode|pspell_config_personal|pspell_config_repl|\
pspell_config_runtogether|pspell_config_save_repl|pspell_new|pspell_new_config|pspell_new_personal|pspell_save_wordlist|\
pspell_store_replacement|pspell_suggest|putenv|px_close|px_create_fp|px_date2string|px_delete|px_delete_record|px_get_field|px_get_info|\
px_get_parameter|px_get_record|px_get_schema|px_get_value|px_insert_record|px_new|px_numfields|px_numrecords|px_open_fp|px_put_record|\
px_retrieve_record|px_set_blob_file|px_set_parameter|px_set_tablename|px_set_targetencoding|px_set_value|px_timestamp2string|\
px_update_record|qdom_error|qdom_tree|quoted_printable_decode|quoted_printable_encode|quotemeta|rad2deg|radius_acct_open|\
radius_add_server|radius_auth_open|radius_close|radius_config|radius_create_request|radius_cvt_addr|radius_cvt_int|radius_cvt_string|\
radius_demangle|radius_demangle_mppe_key|radius_get_attr|radius_get_vendor_attr|radius_put_addr|radius_put_attr|radius_put_int|\
radius_put_string|radius_put_vendor_addr|radius_put_vendor_attr|radius_put_vendor_int|radius_put_vendor_string|\
radius_request_authenticator|radius_send_request|radius_server_secret|radius_strerror|rand|range|rangeexception|rar_wrapper_cache_stats|\
rararchive|rarentry|rarexception|rawurldecode|rawurlencode|read_exif_data|readdir|readfile|readgzfile|readline|readline_add_history|\
readline_callback_handler_install|readline_callback_handler_remove|readline_callback_read_char|readline_clear_history|\
readline_completion_function|readline_info|readline_list_history|readline_on_new_line|readline_read_history|readline_redisplay|\
readline_write_history|readlink|realpath|realpath_cache_get|realpath_cache_size|recode|recode_file|recode_string|recursivearrayiterator|\
recursivecachingiterator|recursivecallbackfilteriterator|recursivedirectoryiterator|recursivefilteriterator|recursiveiterator|\
recursiveiteratoriterator|recursiveregexiterator|recursivetreeiterator|reflection|reflectionclass|reflectionexception|reflectionextension|\
reflectionfunction|reflectionfunctionabstract|reflectionmethod|reflectionobject|reflectionparameter|reflectionproperty|reflector|\
regexiterator|register_shutdown_function|register_tick_function|rename|rename_function|require|require_once|reset|resetValue|\
resourcebundle|restore_error_handler|restore_exception_handler|restore_include_path|return|rewind|rewinddir|rmdir|round|rpm_close|\
rpm_get_tag|rpm_is_valid|rpm_open|rpm_version|rrd_create|rrd_error|rrd_fetch|rrd_first|rrd_graph|rrd_info|rrd_last|rrd_lastupdate|\
rrd_restore|rrd_tune|rrd_update|rrd_xport|rrdcreator|rrdgraph|rrdupdater|rsort|rtrim|runkit_class_adopt|runkit_class_emancipate|\
runkit_constant_add|runkit_constant_redefine|runkit_constant_remove|runkit_function_add|runkit_function_copy|runkit_function_redefine|\
runkit_function_remove|runkit_function_rename|runkit_import|runkit_lint|runkit_lint_file|runkit_method_add|runkit_method_copy|\
runkit_method_redefine|runkit_method_remove|runkit_method_rename|runkit_return_value_used|runkit_sandbox_output_handler|\
runkit_superglobals|runtimeexception|samconnection_commit|samconnection_connect|samconnection_constructor|samconnection_disconnect|\
samconnection_errno|samconnection_error|samconnection_isconnected|samconnection_peek|samconnection_peekall|samconnection_receive|\
samconnection_remove|samconnection_rollback|samconnection_send|samconnection_setDebug|samconnection_subscribe|samconnection_unsubscribe|\
sammessage_body|sammessage_constructor|sammessage_header|sca_createdataobject|sca_getservice|sca_localproxy_createdataobject|\
sca_soapproxy_createdataobject|scandir|sdo_das_changesummary_beginlogging|sdo_das_changesummary_endlogging|\
sdo_das_changesummary_getchangeddataobjects|sdo_das_changesummary_getchangetype|sdo_das_changesummary_getoldcontainer|\
sdo_das_changesummary_getoldvalues|sdo_das_changesummary_islogging|sdo_das_datafactory_addpropertytotype|sdo_das_datafactory_addtype|\
sdo_das_datafactory_getdatafactory|sdo_das_dataobject_getchangesummary|sdo_das_relational_applychanges|sdo_das_relational_construct|\
sdo_das_relational_createrootdataobject|sdo_das_relational_executepreparedquery|sdo_das_relational_executequery|\
sdo_das_setting_getlistindex|sdo_das_setting_getpropertyindex|sdo_das_setting_getpropertyname|sdo_das_setting_getvalue|\
sdo_das_setting_isset|sdo_das_xml_addtypes|sdo_das_xml_create|sdo_das_xml_createdataobject|sdo_das_xml_createdocument|\
sdo_das_xml_document_getrootdataobject|sdo_das_xml_document_getrootelementname|sdo_das_xml_document_getrootelementuri|\
sdo_das_xml_document_setencoding|sdo_das_xml_document_setxmldeclaration|sdo_das_xml_document_setxmlversion|sdo_das_xml_loadfile|\
sdo_das_xml_loadstring|sdo_das_xml_savefile|sdo_das_xml_savestring|sdo_datafactory_create|sdo_dataobject_clear|\
sdo_dataobject_createdataobject|sdo_dataobject_getcontainer|sdo_dataobject_getsequence|sdo_dataobject_gettypename|\
sdo_dataobject_gettypenamespaceuri|sdo_exception_getcause|sdo_list_insert|sdo_model_property_getcontainingtype|\
sdo_model_property_getdefault|sdo_model_property_getname|sdo_model_property_gettype|sdo_model_property_iscontainment|\
sdo_model_property_ismany|sdo_model_reflectiondataobject_construct|sdo_model_reflectiondataobject_export|\
sdo_model_reflectiondataobject_getcontainmentproperty|sdo_model_reflectiondataobject_getinstanceproperties|\
sdo_model_reflectiondataobject_gettype|sdo_model_type_getbasetype|sdo_model_type_getname|sdo_model_type_getnamespaceuri|\
sdo_model_type_getproperties|sdo_model_type_getproperty|sdo_model_type_isabstracttype|sdo_model_type_isdatatype|sdo_model_type_isinstance|\
sdo_model_type_isopentype|sdo_model_type_issequencedtype|sdo_sequence_getproperty|sdo_sequence_insert|sdo_sequence_move|seekableiterator|\
sem_acquire|sem_get|sem_release|sem_remove|serializable|serialize|session_cache_expire|session_cache_limiter|session_commit|\
session_decode|session_destroy|session_encode|session_get_cookie_params|session_id|session_is_registered|session_module_name|session_name|\
session_pgsql_add_error|session_pgsql_get_error|session_pgsql_get_field|session_pgsql_reset|session_pgsql_set_field|session_pgsql_status|\
session_regenerate_id|session_register|session_save_path|session_set_cookie_params|session_set_save_handler|session_start|\
session_unregister|session_unset|session_write_close|setCounterClass|set_error_handler|set_exception_handler|set_file_buffer|\
set_include_path|set_magic_quotes_runtime|set_socket_blocking|set_time_limit|setcookie|setlocale|setproctitle|setrawcookie|\
setstaticpropertyvalue|setthreadtitle|settype|sha1|sha1_file|shell_exec|shm_attach|shm_detach|shm_get_var|shm_has_var|shm_put_var|\
shm_remove|shm_remove_var|shmop_close|shmop_delete|shmop_open|shmop_read|shmop_size|shmop_write|show_source|shuffle|signeurlpaiement|\
similar_text|simplexml_import_dom|simplexml_load_file|simplexml_load_string|simplexmlelement|simplexmliterator|sin|sinh|sizeof|sleep|snmp|\
snmp2_get|snmp2_getnext|snmp2_real_walk|snmp2_set|snmp2_walk|snmp3_get|snmp3_getnext|snmp3_real_walk|snmp3_set|snmp3_walk|\
snmp_get_quick_print|snmp_get_valueretrieval|snmp_read_mib|snmp_set_enum_print|snmp_set_oid_numeric_print|snmp_set_oid_output_format|\
snmp_set_quick_print|snmp_set_valueretrieval|snmpget|snmpgetnext|snmprealwalk|snmpset|snmpwalk|snmpwalkoid|soapclient|soapfault|\
soapheader|soapparam|soapserver|soapvar|socket_accept|socket_bind|socket_clear_error|socket_close|socket_connect|socket_create|\
socket_create_listen|socket_create_pair|socket_get_option|socket_get_status|socket_getpeername|socket_getsockname|socket_last_error|\
socket_listen|socket_read|socket_recv|socket_recvfrom|socket_select|socket_send|socket_sendto|socket_set_block|socket_set_blocking|\
socket_set_nonblock|socket_set_option|socket_set_timeout|socket_shutdown|socket_strerror|socket_write|solr_get_version|solrclient|\
solrclientexception|solrdocument|solrdocumentfield|solrexception|solrgenericresponse|solrillegalargumentexception|\
solrillegaloperationexception|solrinputdocument|solrmodifiableparams|solrobject|solrparams|solrpingresponse|solrquery|solrqueryresponse|\
solrresponse|solrupdateresponse|solrutils|sort|soundex|sphinxclient|spl_autoload|spl_autoload_call|spl_autoload_extensions|\
spl_autoload_functions|spl_autoload_register|spl_autoload_unregister|spl_classes|spl_object_hash|splbool|spldoublylinkedlist|splenum|\
splfileinfo|splfileobject|splfixedarray|splfloat|splheap|splint|split|spliti|splmaxheap|splminheap|splobjectstorage|splobserver|\
splpriorityqueue|splqueue|splstack|splstring|splsubject|spltempfileobject|spoofchecker|sprintf|sql_regcase|sqlite3|sqlite3result|\
sqlite3stmt|sqlite_array_query|sqlite_busy_timeout|sqlite_changes|sqlite_close|sqlite_column|sqlite_create_aggregate|\
sqlite_create_function|sqlite_current|sqlite_error_string|sqlite_escape_string|sqlite_exec|sqlite_factory|sqlite_fetch_all|\
sqlite_fetch_array|sqlite_fetch_column_types|sqlite_fetch_object|sqlite_fetch_single|sqlite_fetch_string|sqlite_field_name|\
sqlite_has_more|sqlite_has_prev|sqlite_key|sqlite_last_error|sqlite_last_insert_rowid|sqlite_libencoding|sqlite_libversion|sqlite_next|\
sqlite_num_fields|sqlite_num_rows|sqlite_open|sqlite_popen|sqlite_prev|sqlite_query|sqlite_rewind|sqlite_seek|sqlite_single_query|\
sqlite_udf_decode_binary|sqlite_udf_encode_binary|sqlite_unbuffered_query|sqlite_valid|sqrt|srand|sscanf|ssdeep_fuzzy_compare|\
ssdeep_fuzzy_hash|ssdeep_fuzzy_hash_filename|ssh2_auth_hostbased_file|ssh2_auth_none|ssh2_auth_password|ssh2_auth_pubkey_file|\
ssh2_connect|ssh2_exec|ssh2_fetch_stream|ssh2_fingerprint|ssh2_methods_negotiated|ssh2_publickey_add|ssh2_publickey_init|\
ssh2_publickey_list|ssh2_publickey_remove|ssh2_scp_recv|ssh2_scp_send|ssh2_sftp|ssh2_sftp_lstat|ssh2_sftp_mkdir|ssh2_sftp_readlink|\
ssh2_sftp_realpath|ssh2_sftp_rename|ssh2_sftp_rmdir|ssh2_sftp_stat|ssh2_sftp_symlink|ssh2_sftp_unlink|ssh2_shell|ssh2_tunnel|stat|\
stats_absolute_deviation|stats_cdf_beta|stats_cdf_binomial|stats_cdf_cauchy|stats_cdf_chisquare|stats_cdf_exponential|stats_cdf_f|\
stats_cdf_gamma|stats_cdf_laplace|stats_cdf_logistic|stats_cdf_negative_binomial|stats_cdf_noncentral_chisquare|stats_cdf_noncentral_f|\
stats_cdf_poisson|stats_cdf_t|stats_cdf_uniform|stats_cdf_weibull|stats_covariance|stats_den_uniform|stats_dens_beta|stats_dens_cauchy|\
stats_dens_chisquare|stats_dens_exponential|stats_dens_f|stats_dens_gamma|stats_dens_laplace|stats_dens_logistic|\
stats_dens_negative_binomial|stats_dens_normal|stats_dens_pmf_binomial|stats_dens_pmf_hypergeometric|stats_dens_pmf_poisson|stats_dens_t|\
stats_dens_weibull|stats_harmonic_mean|stats_kurtosis|stats_rand_gen_beta|stats_rand_gen_chisquare|stats_rand_gen_exponential|\
stats_rand_gen_f|stats_rand_gen_funiform|stats_rand_gen_gamma|stats_rand_gen_ibinomial|stats_rand_gen_ibinomial_negative|\
stats_rand_gen_int|stats_rand_gen_ipoisson|stats_rand_gen_iuniform|stats_rand_gen_noncenral_chisquare|stats_rand_gen_noncentral_f|\
stats_rand_gen_noncentral_t|stats_rand_gen_normal|stats_rand_gen_t|stats_rand_get_seeds|stats_rand_phrase_to_seeds|stats_rand_ranf|\
stats_rand_setall|stats_skew|stats_standard_deviation|stats_stat_binomial_coef|stats_stat_correlation|stats_stat_gennch|\
stats_stat_independent_t|stats_stat_innerproduct|stats_stat_noncentral_t|stats_stat_paired_t|stats_stat_percentile|stats_stat_powersum|\
stats_variance|stomp|stomp_connect_error|stomp_version|stompexception|stompframe|str_getcsv|str_ireplace|str_pad|str_repeat|str_replace|\
str_rot13|str_shuffle|str_split|str_word_count|strcasecmp|strchr|strcmp|strcoll|strcspn|stream_bucket_append|stream_bucket_make_writeable|\
stream_bucket_new|stream_bucket_prepend|stream_context_create|stream_context_get_default|stream_context_get_options|\
stream_context_get_params|stream_context_set_default|stream_context_set_option|stream_context_set_params|stream_copy_to_stream|\
stream_encoding|stream_filter_append|stream_filter_prepend|stream_filter_register|stream_filter_remove|stream_get_contents|\
stream_get_filters|stream_get_line|stream_get_meta_data|stream_get_transports|stream_get_wrappers|stream_is_local|\
stream_notification_callback|stream_register_wrapper|stream_resolve_include_path|stream_select|stream_set_blocking|stream_set_read_buffer|\
stream_set_timeout|stream_set_write_buffer|stream_socket_accept|stream_socket_client|stream_socket_enable_crypto|stream_socket_get_name|\
stream_socket_pair|stream_socket_recvfrom|stream_socket_sendto|stream_socket_server|stream_socket_shutdown|stream_supports_lock|\
stream_wrapper_register|stream_wrapper_restore|stream_wrapper_unregister|streamwrapper|strftime|strip_tags|stripcslashes|stripos|\
stripslashes|stristr|strlen|strnatcasecmp|strnatcmp|strncasecmp|strncmp|strpbrk|strpos|strptime|strrchr|strrev|strripos|strrpos|strspn|\
strstr|strtok|strtolower|strtotime|strtoupper|strtr|strval|substr|substr_compare|substr_count|substr_replace|svm|svmmodel|svn_add|\
svn_auth_get_parameter|svn_auth_set_parameter|svn_blame|svn_cat|svn_checkout|svn_cleanup|svn_client_version|svn_commit|svn_delete|\
svn_diff|svn_export|svn_fs_abort_txn|svn_fs_apply_text|svn_fs_begin_txn2|svn_fs_change_node_prop|svn_fs_check_path|\
svn_fs_contents_changed|svn_fs_copy|svn_fs_delete|svn_fs_dir_entries|svn_fs_file_contents|svn_fs_file_length|svn_fs_is_dir|svn_fs_is_file|\
svn_fs_make_dir|svn_fs_make_file|svn_fs_node_created_rev|svn_fs_node_prop|svn_fs_props_changed|svn_fs_revision_prop|svn_fs_revision_root|\
svn_fs_txn_root|svn_fs_youngest_rev|svn_import|svn_log|svn_ls|svn_mkdir|svn_repos_create|svn_repos_fs|svn_repos_fs_begin_txn_for_commit|\
svn_repos_fs_commit_txn|svn_repos_hotcopy|svn_repos_open|svn_repos_recover|svn_revert|svn_status|svn_update|swf_actiongeturl|\
swf_actiongotoframe|swf_actiongotolabel|swf_actionnextframe|swf_actionplay|swf_actionprevframe|swf_actionsettarget|swf_actionstop|\
swf_actiontogglequality|swf_actionwaitforframe|swf_addbuttonrecord|swf_addcolor|swf_closefile|swf_definebitmap|swf_definefont|\
swf_defineline|swf_definepoly|swf_definerect|swf_definetext|swf_endbutton|swf_enddoaction|swf_endshape|swf_endsymbol|swf_fontsize|\
swf_fontslant|swf_fonttracking|swf_getbitmapinfo|swf_getfontinfo|swf_getframe|swf_labelframe|swf_lookat|swf_modifyobject|swf_mulcolor|\
swf_nextid|swf_oncondition|swf_openfile|swf_ortho|swf_ortho2|swf_perspective|swf_placeobject|swf_polarview|swf_popmatrix|swf_posround|\
swf_pushmatrix|swf_removeobject|swf_rotate|swf_scale|swf_setfont|swf_setframe|swf_shapearc|swf_shapecurveto|swf_shapecurveto3|\
swf_shapefillbitmapclip|swf_shapefillbitmaptile|swf_shapefilloff|swf_shapefillsolid|swf_shapelinesolid|swf_shapelineto|swf_shapemoveto|\
swf_showframe|swf_startbutton|swf_startdoaction|swf_startshape|swf_startsymbol|swf_textwidth|swf_translate|swf_viewport|swfaction|\
swfbitmap|swfbutton|swfdisplayitem|swffill|swffont|swffontchar|swfgradient|swfmorph|swfmovie|swfprebuiltclip|swfshape|swfsound|\
swfsoundinstance|swfsprite|swftext|swftextfield|swfvideostream|swish_construct|swish_getmetalist|swish_getpropertylist|swish_prepare|\
swish_query|swishresult_getmetalist|swishresult_stem|swishresults_getparsedwords|swishresults_getremovedstopwords|swishresults_nextresult|\
swishresults_seekresult|swishsearch_execute|swishsearch_resetlimit|swishsearch_setlimit|swishsearch_setphrasedelimiter|\
swishsearch_setsort|swishsearch_setstructure|sybase_affected_rows|sybase_close|sybase_connect|sybase_data_seek|\
sybase_deadlock_retry_count|sybase_fetch_array|sybase_fetch_assoc|sybase_fetch_field|sybase_fetch_object|sybase_fetch_row|\
sybase_field_seek|sybase_free_result|sybase_get_last_message|sybase_min_client_severity|sybase_min_error_severity|\
sybase_min_message_severity|sybase_min_server_severity|sybase_num_fields|sybase_num_rows|sybase_pconnect|sybase_query|sybase_result|\
sybase_select_db|sybase_set_message_handler|sybase_unbuffered_query|symlink|sys_get_temp_dir|sys_getloadavg|syslog|system|tag|tan|tanh|\
tcpwrap_check|tempnam|textdomain|tidy|tidy_access_count|tidy_config_count|tidy_diagnose|tidy_error_count|tidy_get_error_buffer|\
tidy_get_output|tidy_load_config|tidy_reset_config|tidy_save_config|tidy_set_encoding|tidy_setopt|tidy_warning_count|tidynode|time|\
time_nanosleep|time_sleep_until|timezone_abbreviations_list|timezone_identifiers_list|timezone_location_get|timezone_name_from_abbr|\
timezone_name_get|timezone_offset_get|timezone_open|timezone_transitions_get|timezone_version_get|tmpfile|token_get_all|token_name|\
tokyotyrant|tokyotyrantquery|tokyotyranttable|tostring|tostring|touch|trait_exists|transliterator|traversable|trigger_error|trim|uasort|ucfirst|\
ucwords|udm_add_search_limit|udm_alloc_agent|udm_alloc_agent_array|udm_api_version|udm_cat_list|udm_cat_path|udm_check_charset|\
udm_check_stored|udm_clear_search_limits|udm_close_stored|udm_crc32|udm_errno|udm_error|udm_find|udm_free_agent|udm_free_ispell_data|\
udm_free_res|udm_get_doc_count|udm_get_res_field|udm_get_res_param|udm_hash32|udm_load_ispell_data|udm_open_stored|udm_set_agent_param|\
uksort|umask|underflowexception|unexpectedvalueexception|uniqid|unixtojd|unlink|unpack|unregister_tick_function|unserialize|unset|\
urldecode|urlencode|use_soap_error_handler|user_error|usleep|usort|utf8_decode|utf8_encode|v8js|v8jsexception|var_dump|var_export|variant|\
variant_abs|variant_add|variant_and|variant_cast|variant_cat|variant_cmp|variant_date_from_timestamp|variant_date_to_timestamp|\
variant_div|variant_eqv|variant_fix|variant_get_type|variant_idiv|variant_imp|variant_int|variant_mod|variant_mul|variant_neg|variant_not|\
variant_or|variant_pow|variant_round|variant_set|variant_set_type|variant_sub|variant_xor|version_compare|vfprintf|virtual|\
vpopmail_add_alias_domain|vpopmail_add_alias_domain_ex|vpopmail_add_domain|vpopmail_add_domain_ex|vpopmail_add_user|vpopmail_alias_add|\
vpopmail_alias_del|vpopmail_alias_del_domain|vpopmail_alias_get|vpopmail_alias_get_all|vpopmail_auth_user|vpopmail_del_domain|\
vpopmail_del_domain_ex|vpopmail_del_user|vpopmail_error|vpopmail_passwd|vpopmail_set_user_quota|vprintf|vsprintf|w32api_deftype|\
w32api_init_dtype|w32api_invoke_function|w32api_register_function|w32api_set_call_method|wddx_add_vars|wddx_deserialize|wddx_packet_end|\
wddx_packet_start|wddx_serialize_value|wddx_serialize_vars|win32_continue_service|win32_create_service|win32_delete_service|\
win32_get_last_control_message|win32_pause_service|win32_ps_list_procs|win32_ps_stat_mem|win32_ps_stat_proc|win32_query_service_status|\
win32_set_service_status|win32_start_service|win32_start_service_ctrl_dispatcher|win32_stop_service|wincache_fcache_fileinfo|\
wincache_fcache_meminfo|wincache_lock|wincache_ocache_fileinfo|wincache_ocache_meminfo|wincache_refresh_if_changed|\
wincache_rplist_fileinfo|wincache_rplist_meminfo|wincache_scache_info|wincache_scache_meminfo|wincache_ucache_add|wincache_ucache_cas|\
wincache_ucache_clear|wincache_ucache_dec|wincache_ucache_delete|wincache_ucache_exists|wincache_ucache_get|wincache_ucache_inc|\
wincache_ucache_info|wincache_ucache_meminfo|wincache_ucache_set|wincache_unlock|wordwrap|xattr_get|xattr_list|xattr_remove|xattr_set|\
xattr_supported|xdiff_file_bdiff|xdiff_file_bdiff_size|xdiff_file_bpatch|xdiff_file_diff|xdiff_file_diff_binary|xdiff_file_merge3|\
xdiff_file_patch|xdiff_file_patch_binary|xdiff_file_rabdiff|xdiff_string_bdiff|xdiff_string_bdiff_size|xdiff_string_bpatch|\
xdiff_string_diff|xdiff_string_diff_binary|xdiff_string_merge3|xdiff_string_patch|xdiff_string_patch_binary|xdiff_string_rabdiff|\
xhprof_disable|xhprof_enable|xhprof_sample_disable|xhprof_sample_enable|xml_error_string|xml_get_current_byte_index|\
xml_get_current_column_number|xml_get_current_line_number|xml_get_error_code|xml_parse|xml_parse_into_struct|xml_parser_create|\
xml_parser_create_ns|xml_parser_free|xml_parser_get_option|xml_parser_set_option|xml_set_character_data_handler|xml_set_default_handler|\
xml_set_element_handler|xml_set_end_namespace_decl_handler|xml_set_external_entity_ref_handler|xml_set_notation_decl_handler|\
xml_set_object|xml_set_processing_instruction_handler|xml_set_start_namespace_decl_handler|xml_set_unparsed_entity_decl_handler|xmlreader|\
xmlrpc_decode|xmlrpc_decode_request|xmlrpc_encode|xmlrpc_encode_request|xmlrpc_get_type|xmlrpc_is_fault|xmlrpc_parse_method_descriptions|\
xmlrpc_server_add_introspection_data|xmlrpc_server_call_method|xmlrpc_server_create|xmlrpc_server_destroy|\
xmlrpc_server_register_introspection_callback|xmlrpc_server_register_method|xmlrpc_set_type|xmlwriter_end_attribute|xmlwriter_end_cdata|\
xmlwriter_end_comment|xmlwriter_end_document|xmlwriter_end_dtd|xmlwriter_end_dtd_attlist|xmlwriter_end_dtd_element|\
xmlwriter_end_dtd_entity|xmlwriter_end_element|xmlwriter_end_pi|xmlwriter_flush|xmlwriter_full_end_element|xmlwriter_open_memory|\
xmlwriter_open_uri|xmlwriter_output_memory|xmlwriter_set_indent|xmlwriter_set_indent_string|xmlwriter_start_attribute|\
xmlwriter_start_attribute_ns|xmlwriter_start_cdata|xmlwriter_start_comment|xmlwriter_start_document|xmlwriter_start_dtd|\
xmlwriter_start_dtd_attlist|xmlwriter_start_dtd_element|xmlwriter_start_dtd_entity|xmlwriter_start_element|xmlwriter_start_element_ns|\
xmlwriter_start_pi|xmlwriter_text|xmlwriter_write_attribute|xmlwriter_write_attribute_ns|xmlwriter_write_cdata|xmlwriter_write_comment|\
xmlwriter_write_dtd|xmlwriter_write_dtd_attlist|xmlwriter_write_dtd_element|xmlwriter_write_dtd_entity|xmlwriter_write_element|\
xmlwriter_write_element_ns|xmlwriter_write_pi|xmlwriter_write_raw|xpath_eval|xpath_eval_expression|xpath_new_context|xpath_register_ns|\
xpath_register_ns_auto|xptr_eval|xptr_new_context|xslt_backend_info|xslt_backend_name|xslt_backend_version|xslt_create|xslt_errno|\
xslt_error|xslt_free|xslt_getopt|xslt_process|xslt_set_base|xslt_set_encoding|xslt_set_error_handler|xslt_set_log|xslt_set_object|\
xslt_set_sax_handler|xslt_set_sax_handlers|xslt_set_scheme_handler|xslt_set_scheme_handlers|xslt_setopt|xsltprocessor|yaml_emit|\
yaml_emit_file|yaml_parse|yaml_parse_file|yaml_parse_url|yaz_addinfo|yaz_ccl_conf|yaz_ccl_parse|yaz_close|yaz_connect|yaz_database|\
yaz_element|yaz_errno|yaz_error|yaz_es|yaz_es_result|yaz_get_option|yaz_hits|yaz_itemorder|yaz_present|yaz_range|yaz_record|yaz_scan|\
yaz_scan_result|yaz_schema|yaz_search|yaz_set_option|yaz_sort|yaz_syntax|yaz_wait|yp_all|yp_cat|yp_err_string|yp_errno|yp_first|\
yp_get_default_domain|yp_master|yp_match|yp_next|yp_order|zend_logo_guid|zend_thread_id|zend_version|zip_close|zip_entry_close|\
zip_entry_compressedsize|zip_entry_compressionmethod|zip_entry_filesize|zip_entry_name|zip_entry_open|zip_entry_read|zip_open|zip_read|\
ziparchive|ziparchive_addemptydir|ziparchive_addfile|ziparchive_addfromstring|ziparchive_close|ziparchive_deleteindex|\
ziparchive_deletename|ziparchive_extractto|ziparchive_getarchivecomment|ziparchive_getcommentindex|ziparchive_getcommentname|\
ziparchive_getfromindex|ziparchive_getfromname|ziparchive_getnameindex|ziparchive_getstatusstring|ziparchive_getstream|\
ziparchive_locatename|ziparchive_open|ziparchive_renameindex|ziparchive_renamename|ziparchive_setCommentName|ziparchive_setarchivecomment|\
ziparchive_setcommentindex|ziparchive_statindex|ziparchive_statname|ziparchive_unchangeall|ziparchive_unchangearchive|\
ziparchive_unchangeindex|ziparchive_unchangename|zlib_get_coding_type'.split('|')
    );
    var keywords = lang.arrayToMap(
'abstract|and|array|as|break|case|catch|class|clone|const|continue|declare|default|do|else|elseif|enddeclare|endfor|endforeach|endif|\
endswitch|endwhile|extends|final|for|foreach|function|global|goto|if|implements|interface|instanceof|namespace|new|or|private|protected|\
public|static|switch|throw|trait|try|use|var|while|xor'.split('|')
    );
    var languageConstructs = lang.arrayToMap(
        ('die|echo|empty|exit|eval|include|include_once|isset|list|require|require_once|return|print|unset').split('|')
    );

    var builtinConstants = lang.arrayToMap(
        ('true|TRUE|false|FALSE|null|NULL|__CLASS__|__DIR__|__FILE__|__LINE__|__METHOD__|__FUNCTION__|__NAMESPACE__').split('|')
    );

    var builtinVariables = lang.arrayToMap(
'$GLOBALS|$_SERVER|$_GET|$_POST|$_FILES|$_REQUEST|$_SESSION|$_ENV|$_COOKIE|$php_errormsg|$HTTP_RAW_POST_DATA|\
$http_response_header|$argc|$argv'.split('|')
    );
    var builtinFunctionsDeprecated = lang.arrayToMap(
'key_exists|cairo_matrix_create_scale|cairo_matrix_create_translate|call_user_method|call_user_method_array|com_addref|com_get|\
com_invoke|com_isenum|com_load|com_release|com_set|connection_timeout|cubrid_load_from_glo|cubrid_new_glo|cubrid_save_to_glo|\
cubrid_send_glo|define_syslog_variables|dl|ereg|ereg_replace|eregi|eregi_replace|hw_documentattributes|hw_documentbodytag|\
hw_documentsize|hw_outputdocument|imagedashedline|maxdb_bind_param|maxdb_bind_result|maxdb_client_encoding|maxdb_close_long_data|\
maxdb_execute|maxdb_fetch|maxdb_get_metadata|maxdb_param_count|maxdb_send_long_data|mcrypt_ecb|mcrypt_generic_end|mime_content_type|\
mysql_createdb|mysql_dbname|mysql_db_query|mysql_drop_db|mysql_dropdb|mysql_escape_string|mysql_fieldflags|mysql_fieldflags|\
mysql_fieldname|mysql_fieldtable|mysql_fieldtype|mysql_freeresult|mysql_listdbs|mysql_list_fields|mysql_listfields|mysql_list_tables|\
mysql_listtables|mysql_numfields|mysql_numrows|mysql_selectdb|mysql_tablename|mysqli_bind_param|mysqli_bind_result|\
mysqli_disable_reads_from_master|mysqli_disable_rpl_parse|mysqli_enable_reads_from_master|mysqli_enable_rpl_parse|mysqli_execute|\
mysqli_fetch|mysqli_get_metadata|mysqli_master_query|mysqli_param_count|mysqli_rpl_parse_enabled|mysqli_rpl_probe|mysqli_rpl_query_type|\
mysqli_send_long_data|mysqli_send_query|mysqli_slave_query|ocibindbyname|ocicancel|ocicloselob|ocicollappend|ocicollassign|\
ocicollassignelem|ocicollgetelem|ocicollmax|ocicollsize|ocicolltrim|ocicolumnisnull|ocicolumnname|ocicolumnprecision|ocicolumnscale|\
ocicolumnsize|ocicolumntype|ocicolumntyperaw|ocicommit|ocidefinebyname|ocierror|ociexecute|ocifetch|ocifetchinto|ocifetchstatement|\
ocifreecollection|ocifreecursor|ocifreedesc|ocifreestatement|ociinternaldebug|ociloadlob|ocilogoff|ocilogon|ocinewcollection|\
ocinewcursor|ocinewdescriptor|ocinlogon|ocinumcols|ociparse|ociplogon|ociresult|ocirollback|ocirowcount|ocisavelob|ocisavelobfile|\
ociserverversion|ocisetprefetch|ocistatementtype|ociwritelobtofile|ociwritetemporarylob|PDF_add_annotation|PDF_add_bookmark|\
PDF_add_launchlink|PDF_add_locallink|PDF_add_note|PDF_add_outline|PDF_add_pdflink|PDF_add_weblink|PDF_attach_file|PDF_begin_page|\
PDF_begin_template|PDF_close_pdi|PDF_close|PDF_findfont|PDF_get_font|PDF_get_fontname|PDF_get_fontsize|PDF_get_image_height|\
PDF_get_image_width|PDF_get_majorversion|PDF_get_minorversion|PDF_get_pdi_parameter|PDF_get_pdi_value|PDF_open_ccitt|PDF_open_file|\
PDF_open_gif|PDF_open_image_file|PDF_open_image|PDF_open_jpeg|PDF_open_pdi|PDF_open_tiff|PDF_place_image|PDF_place_pdi_page|\
PDF_set_border_color|PDF_set_border_dash|PDF_set_border_style|PDF_set_char_spacing|PDF_set_duration|PDF_set_horiz_scaling|\
PDF_set_info_author|PDF_set_info_creator|PDF_set_info_keywords|PDF_set_info_subject|PDF_set_info_title|PDF_set_leading|\
PDF_set_text_matrix|PDF_set_text_rendering|PDF_set_text_rise|PDF_set_word_spacing|PDF_setgray_fill|PDF_setgray_stroke|PDF_setgray|\
PDF_setpolydash|PDF_setrgbcolor_fill|PDF_setrgbcolor_stroke|PDF_setrgbcolor|PDF_show_boxed|php_check_syntax|px_set_tablename|\
px_set_targetencoding|runkit_sandbox_output_handler|session_is_registered|session_register|session_unregister\
set_magic_quotes_runtime|magic_quotes_runtime|set_socket_blocking|socket_set_blocking|set_socket_timeout|socket_set_timeout|split|spliti|\
sql_regcase'.split('|')
    );

    var keywordsDeprecated = lang.arrayToMap(
        ('cfunction|old_function').split('|')
    );

    var futureReserved = lang.arrayToMap([]);

    this.$rules = {
        "start" : [
            {
                token : "comment",
                regex : /(?:#|\/\/)(?:[^?]|\?[^>])*/
            },
            docComment.getStartRule("doc-start"),
            {
                token : "comment", // multi line comment
                regex : "\\/\\*",
                next : "comment"
            }, {
                token : "string.regexp",
                regex : "[/](?:(?:\\[(?:\\\\]|[^\\]])+\\])|(?:\\\\/|[^\\]/]))*[/][gimy]*\\s*(?=[).,;]|$)"
            }, {
                token : "string", // " string start
                regex : '"',
                next : "qqstring"
            }, {
                token : "string", // ' string start
                regex : "'",
                next : "qstring"
            }, {
                token : "constant.numeric", // hex
                regex : "0[xX][0-9a-fA-F]+\\b"
            }, {
                token : "constant.numeric", // float
                regex : "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
            }, {
                token : "constant.language", // constants
                regex : "\\b(?:DEFAULT_INCLUDE_PATH|E_(?:ALL|CO(?:MPILE_(?:ERROR|WARNING)|RE_(?:ERROR|WARNING))|" +
                        "ERROR|NOTICE|PARSE|STRICT|USER_(?:ERROR|NOTICE|WARNING)|WARNING)|P(?:EAR_(?:EXTENSION_DIR|INSTALL_DIR)|" +
                        "HP_(?:BINDIR|CONFIG_FILE_(?:PATH|SCAN_DIR)|DATADIR|E(?:OL|XTENSION_DIR)|INT_(?:MAX|SIZE)|" +
                        "L(?:IBDIR|OCALSTATEDIR)|O(?:S|UTPUT_HANDLER_(?:CONT|END|START))|PREFIX|S(?:API|HLIB_SUFFIX|YSCONFDIR)|" +
                        "VERSION))|__COMPILER_HALT_OFFSET__)\\b"
            }, {
                token : ["keyword", "text", "support.class"],
                regex : "\\b(new)(\\s+)(\\w+)"
            }, {
                token : ["support.class", "keyword.operator"],
                regex : "\\b(\\w+)(::)"
            }, {
                token : "constant.language", // constants
                regex : "\\b(?:A(?:B(?:DAY_(?:1|2|3|4|5|6|7)|MON_(?:1(?:0|1|2|)|2|3|4|5|6|7|8|9))|LT_DIGITS|M_STR|" +
                        "SSERT_(?:ACTIVE|BAIL|CALLBACK|QUIET_EVAL|WARNING))|C(?:ASE_(?:LOWER|UPPER)|HAR_MAX|" +
                        "O(?:DESET|NNECTION_(?:ABORTED|NORMAL|TIMEOUT)|UNT_(?:NORMAL|RECURSIVE))|" +
                        "R(?:EDITS_(?:ALL|DOCS|FULLPAGE|G(?:ENERAL|ROUP)|MODULES|QA|SAPI)|NCYSTR|" +
                        "YPT_(?:BLOWFISH|EXT_DES|MD5|S(?:ALT_LENGTH|TD_DES)))|URRENCY_SYMBOL)|D(?:AY_(?:1|2|3|4|5|6|7)|" +
                        "ECIMAL_POINT|IRECTORY_SEPARATOR|_(?:FMT|T_FMT))|E(?:NT_(?:COMPAT|NOQUOTES|QUOTES)|RA(?:_(?:D_(?:FMT|T_FMT)|" +
                        "T_FMT|YEAR)|)|XTR_(?:IF_EXISTS|OVERWRITE|PREFIX_(?:ALL|I(?:F_EXISTS|NVALID)|SAME)|SKIP))|FRAC_DIGITS|GROUPING|" +
                        "HTML_(?:ENTITIES|SPECIALCHARS)|IN(?:FO_(?:ALL|C(?:ONFIGURATION|REDITS)|ENVIRONMENT|GENERAL|LICENSE|MODULES|VARIABLES)|" +
                        "I_(?:ALL|PERDIR|SYSTEM|USER)|T_(?:CURR_SYMBOL|FRAC_DIGITS))|L(?:C_(?:ALL|C(?:OLLATE|TYPE)|M(?:ESSAGES|ONETARY)|NUMERIC|TIME)|" +
                        "O(?:CK_(?:EX|NB|SH|UN)|G_(?:A(?:LERT|UTH(?:PRIV|))|C(?:ONS|R(?:IT|ON))|D(?:AEMON|EBUG)|E(?:MERG|RR)|INFO|KERN|" +
                        "L(?:OCAL(?:0|1|2|3|4|5|6|7)|PR)|MAIL|N(?:DELAY|EWS|O(?:TICE|WAIT))|ODELAY|P(?:ERROR|ID)|SYSLOG|U(?:SER|UCP)|WARNING)))|" +
                        "M(?:ON_(?:1(?:0|1|2|)|2|3|4|5|6|7|8|9|DECIMAL_POINT|GROUPING|THOUSANDS_SEP)|_(?:1_PI|2_(?:PI|SQRTPI)|E|L(?:N(?:10|2)|" +
                        "OG(?:10E|2E))|PI(?:_(?:2|4)|)|SQRT(?:1_2|2)))|N(?:EGATIVE_SIGN|O(?:EXPR|STR)|_(?:CS_PRECEDES|S(?:EP_BY_SPACE|IGN_POSN)))|" +
                        "P(?:ATH(?:INFO_(?:BASENAME|DIRNAME|EXTENSION)|_SEPARATOR)|M_STR|OSITIVE_SIGN|_(?:CS_PRECEDES|S(?:EP_BY_SPACE|IGN_POSN)))|" +
                        "RADIXCHAR|S(?:EEK_(?:CUR|END|SET)|ORT_(?:ASC|DESC|NUMERIC|REGULAR|STRING)|TR_PAD_(?:BOTH|LEFT|RIGHT))|" +
                        "T(?:HOUS(?:ANDS_SEP|EP)|_FMT(?:_AMPM|))|YES(?:EXPR|STR)|STD(?:IN|OUT|ERR))\\b"
            }, {
                token : function(value) {
                    if (keywords.hasOwnProperty(value))
                        return "keyword";
                    else if (builtinConstants.hasOwnProperty(value))
                        return "constant.language";
                    else if (builtinVariables.hasOwnProperty(value))
                        return "variable.language";
                    else if (futureReserved.hasOwnProperty(value))
                        return "invalid.illegal";
                    else if (builtinFunctions.hasOwnProperty(value))
                        return "support.function";
                    else if (value == "debugger")
                        return "invalid.deprecated";
                    else
                        if(value.match(/^(\$[a-zA-Z_\x7f-\uffff][a-zA-Z0-9_\x7f-\uffff]*|self|parent)$/))
                            return "variable";
                        return "identifier";
                },
                regex : /[a-zA-Z_$\x7f-\uffff][a-zA-Z0-9_\x7f-\uffff]*/
            }, {
                onMatch : function(value, currentSate, state) {
                    value = value.substr(3);
                    if (value[0] == "'" || value[0] == '"')
                        value = value.slice(1, -1);
                    state.unshift(this.next, value);
                    return "markup.list";
                },
                regex : /<<<(?:\w+|'\w+'|"\w+")$/,
                next: "heredoc"
            }, {
                token : "keyword.operator",
                regex : "::|!|\\$|%|&|\\*|\\-\\-|\\-|\\+\\+|\\+|~|===|==|!=|!==|<=|>=|=>|<<=|>>=|>>>=|<>|<|>|\\.=|=|!|&&|\\|\\||\\?\\:|\\*=|/=|%=|\\+=|\\-=|&=|\\^=|\\b(?:in|instanceof|new|delete|typeof|void)"
            }, {
                token : "punctuation.operator",
                regex : /[,;]/
            }, {
                token : "paren.lparen",
                regex : "[[({]"
            }, {
                token : "paren.rparen",
                regex : "[\\])}]"
            }, {
                token : "text",
                regex : "\\s+"
            }
        ],
        "heredoc" : [
            {
                onMatch : function(value, currentSate, stack) {
                    if (stack[1] != value)
                        return "string";
                    stack.shift();
                    stack.shift();
                    return "markup.list";
                },
                regex : "^\\w+(?=;?$)",
                next: "start"
            }, {
                token: "string",
                regex : ".*"
            }
        ],
        "comment" : [
            {
                token : "comment",
                regex : "\\*\\/",
                next : "start"
            }, {
                defaultToken : "comment"
            }
        ],
        "qqstring" : [
            {
                token : "constant.language.escape",
                regex : '\\\\(?:[nrtvef\\\\"$]|[0-7]{1,3}|x[0-9A-Fa-f]{1,2})'
            }, {
                token : "variable",
                regex : /\$[\w]+(?:\[[\w\]+]|[=\-]>\w+)?/
            }, {
                token : "variable",
                regex : /\$\{[^"\}]+\}?/           // this is wrong but ok for now
            },
            {token : "string", regex : '"', next : "start"},
            {defaultToken : "string"}
        ],
        "qstring" : [
            {token : "constant.language.escape", regex : /\\['\\]/},
            {token : "string", regex : "'", next : "start"},
            {defaultToken : "string"}
        ]
    };

    this.embedRules(DocCommentHighlightRules, "doc-",
        [ DocCommentHighlightRules.getEndRule("start") ]);
};

oop.inherits(PhpLangHighlightRules, TextHighlightRules);


var PhpHighlightRules = function() {
    HtmlHighlightRules.call(this);

    var startRules = [
        {
            token : "support.php_tag", // php open tag
            regex : "<\\?(?:php|=)?",
            push  : "php-start"
        }
    ];

    var endRules = [
        {
            token : "support.php_tag", // php close tag
            regex : "\\?>",
            next  : "pop"
        }
    ];

    for (var key in this.$rules)
        this.$rules[key].unshift.apply(this.$rules[key], startRules);

    this.embedRules(PhpLangHighlightRules, "php-", endRules, ["start"]);

    this.normalizeRules();
};

oop.inherits(PhpHighlightRules, HtmlHighlightRules);

exports.PhpHighlightRules = PhpHighlightRules;
exports.PhpLangHighlightRules = PhpLangHighlightRules;
});

define("ace/mode/matching_brace_outdent",["require","exports","module","ace/range"], function(require, exports, module) {
"use strict";

var Range = require("../range").Range;

var MatchingBraceOutdent = function() {};

(function() {

    this.checkOutdent = function(line, input) {
        if (! /^\s+$/.test(line))
            return false;

        return /^\s*\}/.test(input);
    };

    this.autoOutdent = function(doc, row) {
        var line = doc.getLine(row);
        var match = line.match(/^(\s*\})/);

        if (!match) return 0;

        var column = match[1].length;
        var openBracePos = doc.findMatchingBracket({row: row, column: column});

        if (!openBracePos || openBracePos.row == row) return 0;

        var indent = this.$getIndent(doc.getLine(openBracePos.row));
        doc.replace(new Range(row, 0, row, column-1), indent);
    };

    this.$getIndent = function(line) {
        return line.match(/^\s*/)[0];
    };

}).call(MatchingBraceOutdent.prototype);

exports.MatchingBraceOutdent = MatchingBraceOutdent;
});

define("ace/mode/php_completions",["require","exports","module"], function(require, exports, module) {
"use strict";

var functionMap = {
    "abs": [
        "int abs(int number)",
        "Return the absolute value of the number"
    ],
    "acos": [
        "float acos(float number)",
        "Return the arc cosine of the number in radians"
    ],
    "acosh": [
        "float acosh(float number)",
        "Returns the inverse hyperbolic cosine of the number, i.e. the value whose hyperbolic cosine is number"
    ],
    "addGlob": [
        "bool addGlob(string pattern[,int flags [, array options]])",
        "Add files matching the glob pattern. See php's glob for the pattern syntax."
    ],
    "addPattern": [
        "bool addPattern(string pattern[, string path [, array options]])",
        "Add files matching the pcre pattern. See php's pcre for the pattern syntax."
    ],
    "addcslashes": [
        "string addcslashes(string str, string charlist)",
        "Escapes all chars mentioned in charlist with backslash. It creates octal representations if asked to backslash characters with 8th bit set or with ASCII<32 (except '\\n', '\\r', '\\t' etc...)"
    ],
    "addslashes": [
        "string addslashes(string str)",
        "Escapes single quote, double quotes and backslash characters in a string with backslashes"
    ],
    "apache_child_terminate": [
        "bool apache_child_terminate(void)",
        "Terminate apache process after this request"
    ],
    "apache_get_modules": [
        "array apache_get_modules(void)",
        "Get a list of loaded Apache modules"
    ],
    "apache_get_version": [
        "string apache_get_version(void)",
        "Fetch Apache version"
    ],
    "apache_getenv": [
        "bool apache_getenv(string variable [, bool walk_to_top])",
        "Get an Apache subprocess_env variable"
    ],
    "apache_lookup_uri": [
        "object apache_lookup_uri(string URI)",
        "Perform a partial request of the given URI to obtain information about it"
    ],
    "apache_note": [
        "string apache_note(string note_name [, string note_value])",
        "Get and set Apache request notes"
    ],
    "apache_request_auth_name": [
        "string apache_request_auth_name()",
        ""
    ],
    "apache_request_auth_type": [
        "string apache_request_auth_type()",
        ""
    ],
    "apache_request_discard_request_body": [
        "long apache_request_discard_request_body()",
        ""
    ],
    "apache_request_err_headers_out": [
        "array apache_request_err_headers_out([{string name|array list} [, string value [, bool replace = false]]])",
        "* fetch all headers that go out in case of an error or a subrequest"
    ],
    "apache_request_headers": [
        "array apache_request_headers(void)",
        "Fetch all HTTP request headers"
    ],
    "apache_request_headers_in": [
        "array apache_request_headers_in()",
        "* fetch all incoming request headers"
    ],
    "apache_request_headers_out": [
        "array apache_request_headers_out([{string name|array list} [, string value [, bool replace = false]]])",
        "* fetch all outgoing request headers"
    ],
    "apache_request_is_initial_req": [
        "bool apache_request_is_initial_req()",
        ""
    ],
    "apache_request_log_error": [
        "boolean apache_request_log_error(string message, [long facility])",
        ""
    ],
    "apache_request_meets_conditions": [
        "long apache_request_meets_conditions()",
        ""
    ],
    "apache_request_remote_host": [
        "int apache_request_remote_host([int type])",
        ""
    ],
    "apache_request_run": [
        "long apache_request_run()",
        "This is a wrapper for ap_sub_run_req and ap_destory_sub_req.  It takes      sub_request, runs it, destroys it, and returns it's status."
    ],
    "apache_request_satisfies": [
        "long apache_request_satisfies()",
        ""
    ],
    "apache_request_server_port": [
        "int apache_request_server_port()",
        ""
    ],
    "apache_request_set_etag": [
        "void apache_request_set_etag()",
        ""
    ],
    "apache_request_set_last_modified": [
        "void apache_request_set_last_modified()",
        ""
    ],
    "apache_request_some_auth_required": [
        "bool apache_request_some_auth_required()",
        ""
    ],
    "apache_request_sub_req_lookup_file": [
        "object apache_request_sub_req_lookup_file(string file)",
        "Returns sub-request for the specified file.  You would     need to run it yourself with run()."
    ],
    "apache_request_sub_req_lookup_uri": [
        "object apache_request_sub_req_lookup_uri(string uri)",
        "Returns sub-request for the specified uri.  You would     need to run it yourself with run()"
    ],
    "apache_request_sub_req_method_uri": [
        "object apache_request_sub_req_method_uri(string method, string uri)",
        "Returns sub-request for the specified file.  You would     need to run it yourself with run()."
    ],
    "apache_request_update_mtime": [
        "long apache_request_update_mtime([int dependency_mtime])",
        ""
    ],
    "apache_reset_timeout": [
        "bool apache_reset_timeout(void)",
        "Reset the Apache write timer"
    ],
    "apache_response_headers": [
        "array apache_response_headers(void)",
        "Fetch all HTTP response headers"
    ],
    "apache_setenv": [
        "bool apache_setenv(string variable, string value [, bool walk_to_top])",
        "Set an Apache subprocess_env variable"
    ],
    "array_change_key_case": [
        "array array_change_key_case(array input [, int case=CASE_LOWER])",
        "Retuns an array with all string keys lowercased [or uppercased]"
    ],
    "array_chunk": [
        "array array_chunk(array input, int size [, bool preserve_keys])",
        "Split array into chunks"
    ],
    "array_combine": [
        "array array_combine(array keys, array values)",
        "Creates an array by using the elements of the first parameter as keys and the elements of the second as the corresponding values"
    ],
    "array_count_values": [
        "array array_count_values(array input)",
        "Return the value as key and the frequency of that value in input as value"
    ],
    "array_diff": [
        "array array_diff(array arr1, array arr2 [, array ...])",
        "Returns the entries of arr1 that have values which are not present in any of the others arguments."
    ],
    "array_diff_assoc": [
        "array array_diff_assoc(array arr1, array arr2 [, array ...])",
        "Returns the entries of arr1 that have values which are not present in any of the others arguments but do additional checks whether the keys are equal"
    ],
    "array_diff_key": [
        "array array_diff_key(array arr1, array arr2 [, array ...])",
        "Returns the entries of arr1 that have keys which are not present in any of the others arguments. This function is like array_diff() but works on the keys instead of the values. The associativity is preserved."
    ],
    "array_diff_uassoc": [
        "array array_diff_uassoc(array arr1, array arr2 [, array ...], callback data_comp_func)",
        "Returns the entries of arr1 that have values which are not present in any of the others arguments but do additional checks whether the keys are equal. Elements are compared by user supplied function."
    ],
    "array_diff_ukey": [
        "array array_diff_ukey(array arr1, array arr2 [, array ...], callback key_comp_func)",
        "Returns the entries of arr1 that have keys which are not present in any of the others arguments. User supplied function is used for comparing the keys. This function is like array_udiff() but works on the keys instead of the values. The associativity is preserved."
    ],
    "array_fill": [
        "array array_fill(int start_key, int num, mixed val)",
        "Create an array containing num elements starting with index start_key each initialized to val"
    ],
    "array_fill_keys": [
        "array array_fill_keys(array keys, mixed val)",
        "Create an array using the elements of the first parameter as keys each initialized to val"
    ],
    "array_filter": [
        "array array_filter(array input [, mixed callback])",
        "Filters elements from the array via the callback."
    ],
    "array_flip": [
        "array array_flip(array input)",
        "Return array with key <-> value flipped"
    ],
    "array_intersect": [
        "array array_intersect(array arr1, array arr2 [, array ...])",
        "Returns the entries of arr1 that have values which are present in all the other arguments"
    ],
    "array_intersect_assoc": [
        "array array_intersect_assoc(array arr1, array arr2 [, array ...])",
        "Returns the entries of arr1 that have values which are present in all the other arguments. Keys are used to do more restrictive check"
    ],
    "array_intersect_key": [
        "array array_intersect_key(array arr1, array arr2 [, array ...])",
        "Returns the entries of arr1 that have keys which are present in all the other arguments. Kind of equivalent to array_diff(array_keys($arr1), array_keys($arr2)[,array_keys(...)]). Equivalent of array_intersect_assoc() but does not do compare of the data."
    ],
    "array_intersect_uassoc": [
        "array array_intersect_uassoc(array arr1, array arr2 [, array ...], callback key_compare_func)",
        "Returns the entries of arr1 that have values which are present in all the other arguments. Keys are used to do more restrictive check and they are compared by using an user-supplied callback."
    ],
    "array_intersect_ukey": [
        "array array_intersect_ukey(array arr1, array arr2 [, array ...], callback key_compare_func)",
        "Returns the entries of arr1 that have keys which are present in all the other arguments. Kind of equivalent to array_diff(array_keys($arr1), array_keys($arr2)[,array_keys(...)]). The comparison of the keys is performed by a user supplied function. Equivalent of array_intersect_uassoc() but does not do compare of the data."
    ],
    "array_key_exists": [
        "bool array_key_exists(mixed key, array search)",
        "Checks if the given key or index exists in the array"
    ],
    "array_keys": [
        "array array_keys(array input [, mixed search_value[, bool strict]])",
        "Return just the keys from the input array, optionally only for the specified search_value"
    ],
    "array_map": [
        "array array_map(mixed callback, array input1 [, array input2 ,...])",
        "Applies the callback to the elements in given arrays."
    ],
    "array_merge": [
        "array array_merge(array arr1, array arr2 [, array ...])",
        "Merges elements from passed arrays into one array"
    ],
    "array_merge_recursive": [
        "array array_merge_recursive(array arr1, array arr2 [, array ...])",
        "Recursively merges elements from passed arrays into one array"
    ],
    "array_multisort": [
        "bool array_multisort(array ar1 [, SORT_ASC|SORT_DESC [, SORT_REGULAR|SORT_NUMERIC|SORT_STRING]] [, array ar2 [, SORT_ASC|SORT_DESC [, SORT_REGULAR|SORT_NUMERIC|SORT_STRING]], ...])",
        "Sort multiple arrays at once similar to how ORDER BY clause works in SQL"
    ],
    "array_pad": [
        "array array_pad(array input, int pad_size, mixed pad_value)",
        "Returns a copy of input array padded with pad_value to size pad_size"
    ],
    "array_pop": [
        "mixed array_pop(array stack)",
        "Pops an element off the end of the array"
    ],
    "array_product": [
        "mixed array_product(array input)",
        "Returns the product of the array entries"
    ],
    "array_push": [
        "int array_push(array stack, mixed var [, mixed ...])",
        "Pushes elements onto the end of the array"
    ],
    "array_rand": [
        "mixed array_rand(array input [, int num_req])",
        "Return key/keys for random entry/entries in the array"
    ],
    "array_reduce": [
        "mixed array_reduce(array input, mixed callback [, mixed initial])",
        "Iteratively reduce the array to a single value via the callback."
    ],
    "array_replace": [
        "array array_replace(array arr1, array arr2 [, array ...])",
        "Replaces elements from passed arrays into one array"
    ],
    "array_replace_recursive": [
        "array array_replace_recursive(array arr1, array arr2 [, array ...])",
        "Recursively replaces elements from passed arrays into one array"
    ],
    "array_reverse": [
        "array array_reverse(array input [, bool preserve keys])",
        "Return input as a new array with the order of the entries reversed"
    ],
    "array_search": [
        "mixed array_search(mixed needle, array haystack [, bool strict])",
        "Searches the array for a given value and returns the corresponding key if successful"
    ],
    "array_shift": [
        "mixed array_shift(array stack)",
        "Pops an element off the beginning of the array"
    ],
    "array_slice": [
        "array array_slice(array input, int offset [, int length [, bool preserve_keys]])",
        "Returns elements specified by offset and length"
    ],
    "array_splice": [
        "array array_splice(array input, int offset [, int length [, array replacement]])",
        "Removes the elements designated by offset and length and replace them with supplied array"
    ],
    "array_sum": [
        "mixed array_sum(array input)",
        "Returns the sum of the array entries"
    ],
    "array_udiff": [
        "array array_udiff(array arr1, array arr2 [, array ...], callback data_comp_func)",
        "Returns the entries of arr1 that have values which are not present in any of the others arguments. Elements are compared by user supplied function."
    ],
    "array_udiff_assoc": [
        "array array_udiff_assoc(array arr1, array arr2 [, array ...], callback key_comp_func)",
        "Returns the entries of arr1 that have values which are not present in any of the others arguments but do additional checks whether the keys are equal. Keys are compared by user supplied function."
    ],
    "array_udiff_uassoc": [
        "array array_udiff_uassoc(array arr1, array arr2 [, array ...], callback data_comp_func, callback key_comp_func)",
        "Returns the entries of arr1 that have values which are not present in any of the others arguments but do additional checks whether the keys are equal. Keys and elements are compared by user supplied functions."
    ],
    "array_uintersect": [
        "array array_uintersect(array arr1, array arr2 [, array ...], callback data_compare_func)",
        "Returns the entries of arr1 that have values which are present in all the other arguments. Data is compared by using an user-supplied callback."
    ],
    "array_uintersect_assoc": [
        "array array_uintersect_assoc(array arr1, array arr2 [, array ...], callback data_compare_func)",
        "Returns the entries of arr1 that have values which are present in all the other arguments. Keys are used to do more restrictive check. Data is compared by using an user-supplied callback."
    ],
    "array_uintersect_uassoc": [
        "array array_uintersect_uassoc(array arr1, array arr2 [, array ...], callback data_compare_func, callback key_compare_func)",
        "Returns the entries of arr1 that have values which are present in all the other arguments. Keys are used to do more restrictive check. Both data and keys are compared by using user-supplied callbacks."
    ],
    "array_unique": [
        "array array_unique(array input [, int sort_flags])",
        "Removes duplicate values from array"
    ],
    "array_unshift": [
        "int array_unshift(array stack, mixed var [, mixed ...])",
        "Pushes elements onto the beginning of the array"
    ],
    "array_values": [
        "array array_values(array input)",
        "Return just the values from the input array"
    ],
    "array_walk": [
        "bool array_walk(array input, string funcname [, mixed userdata])",
        "Apply a user function to every member of an array"
    ],
    "array_walk_recursive": [
        "bool array_walk_recursive(array input, string funcname [, mixed userdata])",
        "Apply a user function recursively to every member of an array"
    ],
    "arsort": [
        "bool arsort(array &array_arg [, int sort_flags])",
        "Sort an array in reverse order and maintain index association"
    ],
    "asin": [
        "float asin(float number)",
        "Returns the arc sine of the number in radians"
    ],
    "asinh": [
        "float asinh(float number)",
        "Returns the inverse hyperbolic sine of the number, i.e. the value whose hyperbolic sine is number"
    ],
    "asort": [
        "bool asort(array &array_arg [, int sort_flags])",
        "Sort an array and maintain index association"
    ],
    "assert": [
        "int assert(string|bool assertion)",
        "Checks if assertion is false"
    ],
    "assert_options": [
        "mixed assert_options(int what [, mixed value])",
        "Set/get the various assert flags"
    ],
    "atan": [
        "float atan(float number)",
        "Returns the arc tangent of the number in radians"
    ],
    "atan2": [
        "float atan2(float y, float x)",
        "Returns the arc tangent of y/x, with the resulting quadrant determined by the signs of y and x"
    ],
    "atanh": [
        "float atanh(float number)",
        "Returns the inverse hyperbolic tangent of the number, i.e. the value whose hyperbolic tangent is number"
    ],
    "attachIterator": [
        "void attachIterator(Iterator iterator[, mixed info])",
        "Attach a new iterator"
    ],
    "base64_decode": [
        "string base64_decode(string str[, bool strict])",
        "Decodes string using MIME base64 algorithm"
    ],
    "base64_encode": [
        "string base64_encode(string str)",
        "Encodes string using MIME base64 algorithm"
    ],
    "base_convert": [
        "string base_convert(string number, int frombase, int tobase)",
        "Converts a number in a string from any base <= 36 to any base <= 36"
    ],
    "basename": [
        "string basename(string path [, string suffix])",
        "Returns the filename component of the path"
    ],
    "bcadd": [
        "string bcadd(string left_operand, string right_operand [, int scale])",
        "Returns the sum of two arbitrary precision numbers"
    ],
    "bccomp": [
        "int bccomp(string left_operand, string right_operand [, int scale])",
        "Compares two arbitrary precision numbers"
    ],
    "bcdiv": [
        "string bcdiv(string left_operand, string right_operand [, int scale])",
        "Returns the quotient of two arbitrary precision numbers (division)"
    ],
    "bcmod": [
        "string bcmod(string left_operand, string right_operand)",
        "Returns the modulus of the two arbitrary precision operands"
    ],
    "bcmul": [
        "string bcmul(string left_operand, string right_operand [, int scale])",
        "Returns the multiplication of two arbitrary precision numbers"
    ],
    "bcpow": [
        "string bcpow(string x, string y [, int scale])",
        "Returns the value of an arbitrary precision number raised to the power of another"
    ],
    "bcpowmod": [
        "string bcpowmod(string x, string y, string mod [, int scale])",
        "Returns the value of an arbitrary precision number raised to the power of another reduced by a modulous"
    ],
    "bcscale": [
        "bool bcscale(int scale)",
        "Sets default scale parameter for all bc math functions"
    ],
    "bcsqrt": [
        "string bcsqrt(string operand [, int scale])",
        "Returns the square root of an arbitray precision number"
    ],
    "bcsub": [
        "string bcsub(string left_operand, string right_operand [, int scale])",
        "Returns the difference between two arbitrary precision numbers"
    ],
    "bin2hex": [
        "string bin2hex(string data)",
        "Converts the binary representation of data to hex"
    ],
    "bind_textdomain_codeset": [
        "string bind_textdomain_codeset (string domain, string codeset)",
        "Specify the character encoding in which the messages from the DOMAIN message catalog will be returned."
    ],
    "bindec": [
        "int bindec(string binary_number)",
        "Returns the decimal equivalent of the binary number"
    ],
    "bindtextdomain": [
        "string bindtextdomain(string domain_name, string dir)",
        "Bind to the text domain domain_name, looking for translations in dir. Returns the current domain"
    ],
    "birdstep_autocommit": [
        "bool birdstep_autocommit(int index)",
        ""
    ],
    "birdstep_close": [
        "bool birdstep_close(int id)",
        ""
    ],
    "birdstep_commit": [
        "bool birdstep_commit(int index)",
        ""
    ],
    "birdstep_connect": [
        "int birdstep_connect(string server, string user, string pass)",
        ""
    ],
    "birdstep_exec": [
        "int birdstep_exec(int index, string exec_str)",
        ""
    ],
    "birdstep_fetch": [
        "bool birdstep_fetch(int index)",
        ""
    ],
    "birdstep_fieldname": [
        "string birdstep_fieldname(int index, int col)",
        ""
    ],
    "birdstep_fieldnum": [
        "int birdstep_fieldnum(int index)",
        ""
    ],
    "birdstep_freeresult": [
        "bool birdstep_freeresult(int index)",
        ""
    ],
    "birdstep_off_autocommit": [
        "bool birdstep_off_autocommit(int index)",
        ""
    ],
    "birdstep_result": [
        "mixed birdstep_result(int index, mixed col)",
        ""
    ],
    "birdstep_rollback": [
        "bool birdstep_rollback(int index)",
        ""
    ],
    "bzcompress": [
        "string bzcompress(string source [, int blocksize100k [, int workfactor]])",
        "Compresses a string into BZip2 encoded data"
    ],
    "bzdecompress": [
        "string bzdecompress(string source [, int small])",
        "Decompresses BZip2 compressed data"
    ],
    "bzerrno": [
        "int bzerrno(resource bz)",
        "Returns the error number"
    ],
    "bzerror": [
        "array bzerror(resource bz)",
        "Returns the error number and error string in an associative array"
    ],
    "bzerrstr": [
        "string bzerrstr(resource bz)",
        "Returns the error string"
    ],
    "bzopen": [
        "resource bzopen(string|int file|fp, string mode)",
        "Opens a new BZip2 stream"
    ],
    "bzread": [
        "string bzread(resource bz[, int length])",
        "Reads up to length bytes from a BZip2 stream, or 1024 bytes if length is not specified"
    ],
    "cal_days_in_month": [
        "int cal_days_in_month(int calendar, int month, int year)",
        "Returns the number of days in a month for a given year and calendar"
    ],
    "cal_from_jd": [
        "array cal_from_jd(int jd, int calendar)",
        "Converts from Julian Day Count to a supported calendar and return extended information"
    ],
    "cal_info": [
        "array cal_info([int calendar])",
        "Returns information about a particular calendar"
    ],
    "cal_to_jd": [
        "int cal_to_jd(int calendar, int month, int day, int year)",
        "Converts from a supported calendar to Julian Day Count"
    ],
    "call_user_func": [
        "mixed call_user_func(mixed function_name [, mixed parmeter] [, mixed ...])",
        "Call a user function which is the first parameter"
    ],
    "call_user_func_array": [
        "mixed call_user_func_array(string function_name, array parameters)",
        "Call a user function which is the first parameter with the arguments contained in array"
    ],
    "call_user_method": [
        "mixed call_user_method(string method_name, mixed object [, mixed parameter] [, mixed ...])",
        "Call a user method on a specific object or class"
    ],
    "call_user_method_array": [
        "mixed call_user_method_array(string method_name, mixed object, array params)",
        "Call a user method on a specific object or class using a parameter array"
    ],
    "ceil": [
        "float ceil(float number)",
        "Returns the next highest integer value of the number"
    ],
    "chdir": [
        "bool chdir(string directory)",
        "Change the current directory"
    ],
    "checkdate": [
        "bool checkdate(int month, int day, int year)",
        "Returns true(1) if it is a valid date in gregorian calendar"
    ],
    "chgrp": [
        "bool chgrp(string filename, mixed group)",
        "Change file group"
    ],
    "chmod": [
        "bool chmod(string filename, int mode)",
        "Change file mode"
    ],
    "chown": [
        "bool chown (string filename, mixed user)",
        "Change file owner"
    ],
    "chr": [
        "string chr(int ascii)",
        "Converts ASCII code to a character"
    ],
    "chroot": [
        "bool chroot(string directory)",
        "Change root directory"
    ],
    "chunk_split": [
        "string chunk_split(string str [, int chunklen [, string ending]])",
        "Returns split line"
    ],
    "class_alias": [
        "bool class_alias(string user_class_name , string alias_name [, bool autoload])",
        "Creates an alias for user defined class"
    ],
    "class_exists": [
        "bool class_exists(string classname [, bool autoload])",
        "Checks if the class exists"
    ],
    "class_implements": [
        "array class_implements(mixed what [, bool autoload ])",
        "Return all classes and interfaces implemented by SPL"
    ],
    "class_parents": [
        "array class_parents(object instance [, boolean autoload = true])",
        "Return an array containing the names of all parent classes"
    ],
    "clearstatcache": [
        "void clearstatcache([bool clear_realpath_cache[, string filename]])",
        "Clear file stat cache"
    ],
    "closedir": [
        "void closedir([resource dir_handle])",
        "Close directory connection identified by the dir_handle"
    ],
    "closelog": [
        "bool closelog(void)",
        "Close connection to system logger"
    ],
    "collator_asort": [
        "bool collator_asort( Collator $coll, array(string) $arr )",
        "* Sort array using specified collator, maintaining index association."
    ],
    "collator_compare": [
        "int collator_compare( Collator $coll, string $str1, string $str2 )",
        "* Compare two strings."
    ],
    "collator_create": [
        "Collator collator_create( string $locale )",
        "* Create collator."
    ],
    "collator_get_attribute": [
        "int collator_get_attribute( Collator $coll, int $attr )",
        "* Get collation attribute value."
    ],
    "collator_get_error_code": [
        "int collator_get_error_code( Collator $coll )",
        "* Get collator's last error code."
    ],
    "collator_get_error_message": [
        "string collator_get_error_message( Collator $coll )",
        "* Get text description for collator's last error code."
    ],
    "collator_get_locale": [
        "string collator_get_locale( Collator $coll, int $type )",
        "* Gets the locale name of the collator."
    ],
    "collator_get_sort_key": [
        "bool collator_get_sort_key( Collator $coll, string $str )",
        "* Get a sort key for a string from a Collator. }}}"
    ],
    "collator_get_strength": [
        "int collator_get_strength(Collator coll)",
        "* Returns the current collation strength."
    ],
    "collator_set_attribute": [
        "bool collator_set_attribute( Collator $coll, int $attr, int $val )",
        "* Set collation attribute."
    ],
    "collator_set_strength": [
        "bool collator_set_strength(Collator coll, int strength)",
        "* Set the collation strength."
    ],
    "collator_sort": [
        "bool collator_sort(  Collator $coll, array(string) $arr [, int $sort_flags] )",
        "* Sort array using specified collator."
    ],
    "collator_sort_with_sort_keys": [
        "bool collator_sort_with_sort_keys( Collator $coll, array(string) $arr )",
        "* Equivalent to standard PHP sort using Collator.  * Uses ICU ucol_getSortKey for performance."
    ],
    "com_create_guid": [
        "string com_create_guid()",
        "Generate a globally unique identifier (GUID)"
    ],
    "com_event_sink": [
        "bool com_event_sink(object comobject, object sinkobject [, mixed sinkinterface])",
        "Connect events from a COM object to a PHP object"
    ],
    "com_get_active_object": [
        "object com_get_active_object(string progid [, int code_page ])",
        "Returns a handle to an already running instance of a COM object"
    ],
    "com_load_typelib": [
        "bool com_load_typelib(string typelib_name [, int case_insensitive])",
        "Loads a Typelibrary and registers its constants"
    ],
    "com_message_pump": [
        "bool com_message_pump([int timeoutms])",
        "Process COM messages, sleeping for up to timeoutms milliseconds"
    ],
    "com_print_typeinfo": [
        "bool com_print_typeinfo(object comobject | string typelib, string dispinterface, bool wantsink)",
        "Print out a PHP class definition for a dispatchable interface"
    ],
    "compact": [
        "array compact(mixed var_names [, mixed ...])",
        "Creates a hash containing variables and their values"
    ],
    "compose_locale": [
        "static string compose_locale($array)",
        "* Creates a locale by combining the parts of locale-ID passed  * }}}"
    ],
    "confirm_extname_compiled": [
        "string confirm_extname_compiled(string arg)",
        "Return a string to confirm that the module is compiled in"
    ],
    "connection_aborted": [
        "int connection_aborted(void)",
        "Returns true if client disconnected"
    ],
    "connection_status": [
        "int connection_status(void)",
        "Returns the connection status bitfield"
    ],
    "constant": [
        "mixed constant(string const_name)",
        "Given the name of a constant this function will return the constant's associated value"
    ],
    "convert_cyr_string": [
        "string convert_cyr_string(string str, string from, string to)",
        "Convert from one Cyrillic character set to another"
    ],
    "convert_uudecode": [
        "string convert_uudecode(string data)",
        "decode a uuencoded string"
    ],
    "convert_uuencode": [
        "string convert_uuencode(string data)",
        "uuencode a string"
    ],
    "copy": [
        "bool copy(string source_file, string destination_file [, resource context])",
        "Copy a file"
    ],
    "cos": [
        "float cos(float number)",
        "Returns the cosine of the number in radians"
    ],
    "cosh": [
        "float cosh(float number)",
        "Returns the hyperbolic cosine of the number, defined as (exp(number) + exp(-number))/2"
    ],
    "count": [
        "int count(mixed var [, int mode])",
        "Count the number of elements in a variable (usually an array)"
    ],
    "count_chars": [
        "mixed count_chars(string input [, int mode])",
        "Returns info about what characters are used in input"
    ],
    "crc32": [
        "string crc32(string str)",
        "Calculate the crc32 polynomial of a string"
    ],
    "create_function": [
        "string create_function(string args, string code)",
        "Creates an anonymous function, and returns its name (funny, eh?)"
    ],
    "crypt": [
        "string crypt(string str [, string salt])",
        "Hash a string"
    ],
    "ctype_alnum": [
        "bool ctype_alnum(mixed c)",
        "Checks for alphanumeric character(s)"
    ],
    "ctype_alpha": [
        "bool ctype_alpha(mixed c)",
        "Checks for alphabetic character(s)"
    ],
    "ctype_cntrl": [
        "bool ctype_cntrl(mixed c)",
        "Checks for control character(s)"
    ],
    "ctype_digit": [
        "bool ctype_digit(mixed c)",
        "Checks for numeric character(s)"
    ],
    "ctype_graph": [
        "bool ctype_graph(mixed c)",
        "Checks for any printable character(s) except space"
    ],
    "ctype_lower": [
        "bool ctype_lower(mixed c)",
        "Checks for lowercase character(s)"
    ],
    "ctype_print": [
        "bool ctype_print(mixed c)",
        "Checks for printable character(s)"
    ],
    "ctype_punct": [
        "bool ctype_punct(mixed c)",
        "Checks for any printable character which is not whitespace or an alphanumeric character"
    ],
    "ctype_space": [
        "bool ctype_space(mixed c)",
        "Checks for whitespace character(s)"
    ],
    "ctype_upper": [
        "bool ctype_upper(mixed c)",
        "Checks for uppercase character(s)"
    ],
    "ctype_xdigit": [
        "bool ctype_xdigit(mixed c)",
        "Checks for character(s) representing a hexadecimal digit"
    ],
    "curl_close": [
        "void curl_close(resource ch)",
        "Close a cURL session"
    ],
    "curl_copy_handle": [
        "resource curl_copy_handle(resource ch)",
        "Copy a cURL handle along with all of it's preferences"
    ],
    "curl_errno": [
        "int curl_errno(resource ch)",
        "Return an integer containing the last error number"
    ],
    "curl_error": [
        "string curl_error(resource ch)",
        "Return a string contain the last error for the current session"
    ],
    "curl_exec": [
        "bool curl_exec(resource ch)",
        "Perform a cURL session"
    ],
    "curl_getinfo": [
        "mixed curl_getinfo(resource ch [, int option])",
        "Get information regarding a specific transfer"
    ],
    "curl_init": [
        "resource curl_init([string url])",
        "Initialize a cURL session"
    ],
    "curl_multi_add_handle": [
        "int curl_multi_add_handle(resource mh, resource ch)",
        "Add a normal cURL handle to a cURL multi handle"
    ],
    "curl_multi_close": [
        "void curl_multi_close(resource mh)",
        "Close a set of cURL handles"
    ],
    "curl_multi_exec": [
        "int curl_multi_exec(resource mh, int &still_running)",
        "Run the sub-connections of the current cURL handle"
    ],
    "curl_multi_getcontent": [
        "string curl_multi_getcontent(resource ch)",
        "Return the content of a cURL handle if CURLOPT_RETURNTRANSFER is set"
    ],
    "curl_multi_info_read": [
        "array curl_multi_info_read(resource mh [, long msgs_in_queue])",
        "Get information about the current transfers"
    ],
    "curl_multi_init": [
        "resource curl_multi_init(void)",
        "Returns a new cURL multi handle"
    ],
    "curl_multi_remove_handle": [
        "int curl_multi_remove_handle(resource mh, resource ch)",
        "Remove a multi handle from a set of cURL handles"
    ],
    "curl_multi_select": [
        "int curl_multi_select(resource mh[, double timeout])",
        "Get all the sockets associated with the cURL extension, which can then be \"selected\""
    ],
    "curl_setopt": [
        "bool curl_setopt(resource ch, int option, mixed value)",
        "Set an option for a cURL transfer"
    ],
    "curl_setopt_array": [
        "bool curl_setopt_array(resource ch, array options)",
        "Set an array of option for a cURL transfer"
    ],
    "curl_version": [
        "array curl_version([int version])",
        "Return cURL version information."
    ],
    "current": [
        "mixed current(array array_arg)",
        "Return the element currently pointed to by the internal array pointer"
    ],
    "date": [
        "string date(string format [, long timestamp])",
        "Format a local date/time"
    ],
    "date_add": [
        "DateTime date_add(DateTime object, DateInterval interval)",
        "Adds an interval to the current date in object."
    ],
    "date_create": [
        "DateTime date_create([string time[, DateTimeZone object]])",
        "Returns new DateTime object"
    ],
    "date_create_from_format": [
        "DateTime date_create_from_format(string format, string time[, DateTimeZone object])",
        "Returns new DateTime object formatted according to the specified format"
    ],
    "date_date_set": [
        "DateTime date_date_set(DateTime object, long year, long month, long day)",
        "Sets the date."
    ],
    "date_default_timezone_get": [
        "string date_default_timezone_get()",
        "Gets the default timezone used by all date/time functions in a script"
    ],
    "date_default_timezone_set": [
        "bool date_default_timezone_set(string timezone_identifier)",
        "Sets the default timezone used by all date/time functions in a script"
    ],
    "date_diff": [
        "DateInterval date_diff(DateTime object [, bool absolute])",
        "Returns the difference between two DateTime objects."
    ],
    "date_format": [
        "string date_format(DateTime object, string format)",
        "Returns date formatted according to given format"
    ],
    "date_get_last_errors": [
        "array date_get_last_errors()",
        "Returns the warnings and errors found while parsing a date/time string."
    ],
    "date_interval_create_from_date_string": [
        "DateInterval date_interval_create_from_date_string(string time)",
        "Uses the normal date parsers and sets up a DateInterval from the relative parts of the parsed string"
    ],
    "date_interval_format": [
        "string date_interval_format(DateInterval object, string format)",
        "Formats the interval."
    ],
    "date_isodate_set": [
        "DateTime date_isodate_set(DateTime object, long year, long week[, long day])",
        "Sets the ISO date."
    ],
    "date_modify": [
        "DateTime date_modify(DateTime object, string modify)",
        "Alters the timestamp."
    ],
    "date_offset_get": [
        "long date_offset_get(DateTime object)",
        "Returns the DST offset."
    ],
    "date_parse": [
        "array date_parse(string date)",
        "Returns associative array with detailed info about given date"
    ],
    "date_parse_from_format": [
        "array date_parse_from_format(string format, string date)",
        "Returns associative array with detailed info about given date"
    ],
    "date_sub": [
        "DateTime date_sub(DateTime object, DateInterval interval)",
        "Subtracts an interval to the current date in object."
    ],
    "date_sun_info": [
        "array date_sun_info(long time, float latitude, float longitude)",
        "Returns an array with information about sun set/rise and twilight begin/end"
    ],
    "date_sunrise": [
        "mixed date_sunrise(mixed time [, int format [, float latitude [, float longitude [, float zenith [, float gmt_offset]]]]])",
        "Returns time of sunrise for a given day and location"
    ],
    "date_sunset": [
        "mixed date_sunset(mixed time [, int format [, float latitude [, float longitude [, float zenith [, float gmt_offset]]]]])",
        "Returns time of sunset for a given day and location"
    ],
    "date_time_set": [
        "DateTime date_time_set(DateTime object, long hour, long minute[, long second])",
        "Sets the time."
    ],
    "date_timestamp_get": [
        "long date_timestamp_get(DateTime object)",
        "Gets the Unix timestamp."
    ],
    "date_timestamp_set": [
        "DateTime date_timestamp_set(DateTime object, long unixTimestamp)",
        "Sets the date and time based on an Unix timestamp."
    ],
    "date_timezone_get": [
        "DateTimeZone date_timezone_get(DateTime object)",
        "Return new DateTimeZone object relative to give DateTime"
    ],
    "date_timezone_set": [
        "DateTime date_timezone_set(DateTime object, DateTimeZone object)",
        "Sets the timezone for the DateTime object."
    ],
    "datefmt_create": [
        "IntlDateFormatter datefmt_create(string $locale, long date_type, long time_type[, string $timezone_str, long $calendar, string $pattern] )",
        "* Create formatter."
    ],
    "datefmt_format": [
        "string datefmt_format( [mixed]int $args or array $args )",
        "* Format the time value as a string. }}}"
    ],
    "datefmt_get_calendar": [
        "string datefmt_get_calendar( IntlDateFormatter $mf )",
        "* Get formatter calendar."
    ],
    "datefmt_get_datetype": [
        "string datefmt_get_datetype( IntlDateFormatter $mf )",
        "* Get formatter datetype."
    ],
    "datefmt_get_error_code": [
        "int datefmt_get_error_code( IntlDateFormatter $nf )",
        "* Get formatter's last error code."
    ],
    "datefmt_get_error_message": [
        "string datefmt_get_error_message( IntlDateFormatter $coll )",
        "* Get text description for formatter's last error code."
    ],
    "datefmt_get_locale": [
        "string datefmt_get_locale(IntlDateFormatter $mf)",
        "* Get formatter locale."
    ],
    "datefmt_get_pattern": [
        "string datefmt_get_pattern( IntlDateFormatter $mf )",
        "* Get formatter pattern."
    ],
    "datefmt_get_timetype": [
        "string datefmt_get_timetype( IntlDateFormatter $mf )",
        "* Get formatter timetype."
    ],
    "datefmt_get_timezone_id": [
        "string datefmt_get_timezone_id( IntlDateFormatter $mf )",
        "* Get formatter timezone_id."
    ],
    "datefmt_isLenient": [
        "string datefmt_isLenient(IntlDateFormatter $mf)",
        "* Get formatter locale."
    ],
    "datefmt_localtime": [
        "integer datefmt_localtime( IntlDateFormatter $fmt, string $text_to_parse[, int $parse_pos ])",
        "* Parse the string $value to a localtime array  }}}"
    ],
    "datefmt_parse": [
        "integer datefmt_parse( IntlDateFormatter $fmt, string $text_to_parse [, int $parse_pos] )",
        "* Parse the string $value starting at parse_pos to a Unix timestamp -int }}}"
    ],
    "datefmt_setLenient": [
        "string datefmt_setLenient(IntlDateFormatter $mf)",
        "* Set formatter lenient."
    ],
    "datefmt_set_calendar": [
        "bool datefmt_set_calendar( IntlDateFormatter $mf, int $calendar )",
        "* Set formatter calendar."
    ],
    "datefmt_set_pattern": [
        "bool datefmt_set_pattern( IntlDateFormatter $mf, string $pattern )",
        "* Set formatter pattern."
    ],
    "datefmt_set_timezone_id": [
        "boolean datefmt_set_timezone_id( IntlDateFormatter $mf,$timezone_id)",
        "* Set formatter timezone_id."
    ],
    "dba_close": [
        "void dba_close(resource handle)",
        "Closes database"
    ],
    "dba_delete": [
        "bool dba_delete(string key, resource handle)",
        "Deletes the entry associated with key    If inifile: remove all other key lines"
    ],
    "dba_exists": [
        "bool dba_exists(string key, resource handle)",
        "Checks, if the specified key exists"
    ],
    "dba_fetch": [
        "string dba_fetch(string key, [int skip ,] resource handle)",
        "Fetches the data associated with key"
    ],
    "dba_firstkey": [
        "string dba_firstkey(resource handle)",
        "Resets the internal key pointer and returns the first key"
    ],
    "dba_handlers": [
        "array dba_handlers([bool full_info])",
        "List configured database handlers"
    ],
    "dba_insert": [
        "bool dba_insert(string key, string value, resource handle)",
        "If not inifile: Insert value as key, return false, if key exists already     If inifile: Add vakue as key (next instance of key)"
    ],
    "dba_key_split": [
        "array|false dba_key_split(string key)",
        "Splits an inifile key into an array of the form array(0=>group,1=>value_name) but returns false if input is false or null"
    ],
    "dba_list": [
        "array dba_list()",
        "List opened databases"
    ],
    "dba_nextkey": [
        "string dba_nextkey(resource handle)",
        "Returns the next key"
    ],
    "dba_open": [
        "resource dba_open(string path, string mode [, string handlername, string ...])",
        "Opens path using the specified handler in mode"
    ],
    "dba_optimize": [
        "bool dba_optimize(resource handle)",
        "Optimizes (e.g. clean up, vacuum) database"
    ],
    "dba_popen": [
        "resource dba_popen(string path, string mode [, string handlername, string ...])",
        "Opens path using the specified handler in mode persistently"
    ],
    "dba_replace": [
        "bool dba_replace(string key, string value, resource handle)",
        "Inserts value as key, replaces key, if key exists already    If inifile: remove all other key lines"
    ],
    "dba_sync": [
        "bool dba_sync(resource handle)",
        "Synchronizes database"
    ],
    "dcgettext": [
        "string dcgettext(string domain_name, string msgid, long category)",
        "Return the translation of msgid for domain_name and category, or msgid unaltered if a translation does not exist"
    ],
    "dcngettext": [
        "string dcngettext (string domain, string msgid1, string msgid2, int n, int category)",
        "Plural version of dcgettext()"
    ],
    "debug_backtrace": [
        "array debug_backtrace([bool provide_object])",
        "Return backtrace as array"
    ],
    "debug_print_backtrace": [
        "void debug_print_backtrace(void) */",
        "ZEND_FUNCTION(debug_print_backtrace) {  zend_execute_data *ptr, *skip;  int lineno;  char *function_name;  char *filename;  char *class_name = NULL;  char *call_type;  char *include_filename = NULL;  zval *arg_array = NULL;  int indent = 0;   if (zend_parse_parameters_none() == FAILURE) {   return;  }   ptr = EG(current_execute_data);",
        "PHP_FUNCTION(dom_document_relaxNG_validate_file) {  _dom_document_relaxNG_validate(INTERNAL_FUNCTION_PARAM_PASSTHRU, DOM_LOAD_FILE); } /* }}} end dom_document_relaxNG_validate_file"
    ],
    "dom_document_relaxNG_validate_xml": [
        "boolean dom_document_relaxNG_validate_xml(string source); */",
        "PHP_FUNCTION(dom_document_relaxNG_validate_xml) {  _dom_document_relaxNG_validate(INTERNAL_FUNCTION_PARAM_PASSTHRU, DOM_LOAD_STRING); } /* }}} end dom_document_relaxNG_validate_xml"
    ],
    "dom_document_rename_node": [
        "DOMNode dom_document_rename_node(node n, string namespaceURI, string qualifiedName);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-Document3-renameNode Since: DOM Level 3"
    ],
    "dom_document_save": [
        "int dom_document_save(string file);",
        "Convenience method to save to file"
    ],
    "dom_document_save_html": [
        "string dom_document_save_html();",
        "Convenience method to output as html"
    ],
    "dom_document_save_html_file": [
        "int dom_document_save_html_file(string file);",
        "Convenience method to save to file as html"
    ],
    "dom_document_savexml": [
        "string dom_document_savexml([node n]);",
        "URL: http://www.w3.org/TR/DOM-Level-3-LS/load-save.html#LS-DocumentLS-saveXML Since: DOM Level 3"
    ],
    "dom_document_schema_validate": [
        "boolean dom_document_schema_validate(string source); */",
        "PHP_FUNCTION(dom_document_schema_validate_xml) {  _dom_document_schema_validate(INTERNAL_FUNCTION_PARAM_PASSTHRU, DOM_LOAD_STRING); } /* }}} end dom_document_schema_validate"
    ],
    "dom_document_schema_validate_file": [
        "boolean dom_document_schema_validate_file(string filename); */",
        "PHP_FUNCTION(dom_document_schema_validate_file) {  _dom_document_schema_validate(INTERNAL_FUNCTION_PARAM_PASSTHRU, DOM_LOAD_FILE); } /* }}} end dom_document_schema_validate_file"
    ],
    "dom_document_validate": [
        "boolean dom_document_validate();",
        "Since: DOM extended"
    ],
    "dom_document_xinclude": [
        "int dom_document_xinclude([int options])",
        "Substitutues xincludes in a DomDocument"
    ],
    "dom_domconfiguration_can_set_parameter": [
        "boolean dom_domconfiguration_can_set_parameter(string name, domuserdata value);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#DOMConfiguration-canSetParameter Since:"
    ],
    "dom_domconfiguration_get_parameter": [
        "domdomuserdata dom_domconfiguration_get_parameter(string name);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#DOMConfiguration-getParameter Since:"
    ],
    "dom_domconfiguration_set_parameter": [
        "dom_void dom_domconfiguration_set_parameter(string name, domuserdata value);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#DOMConfiguration-property Since:"
    ],
    "dom_domerrorhandler_handle_error": [
        "dom_boolean dom_domerrorhandler_handle_error(domerror error);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#ID-ERRORS-DOMErrorHandler-handleError Since:"
    ],
    "dom_domimplementation_create_document": [
        "DOMDocument dom_domimplementation_create_document(string namespaceURI, string qualifiedName, DOMDocumentType doctype);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#Level-2-Core-DOM-createDocument Since: DOM Level 2"
    ],
    "dom_domimplementation_create_document_type": [
        "DOMDocumentType dom_domimplementation_create_document_type(string qualifiedName, string publicId, string systemId);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#Level-2-Core-DOM-createDocType Since: DOM Level 2"
    ],
    "dom_domimplementation_get_feature": [
        "DOMNode dom_domimplementation_get_feature(string feature, string version);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#DOMImplementation3-getFeature Since: DOM Level 3"
    ],
    "dom_domimplementation_has_feature": [
        "boolean dom_domimplementation_has_feature(string feature, string version);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#ID-5CED94D7 Since:"
    ],
    "dom_domimplementationlist_item": [
        "domdomimplementation dom_domimplementationlist_item(int index);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#DOMImplementationList-item Since:"
    ],
    "dom_domimplementationsource_get_domimplementation": [
        "domdomimplementation dom_domimplementationsource_get_domimplementation(string features);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#ID-getDOMImpl Since:"
    ],
    "dom_domimplementationsource_get_domimplementations": [
        "domimplementationlist dom_domimplementationsource_get_domimplementations(string features);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#ID-getDOMImpls Since:"
    ],
    "dom_domstringlist_item": [
        "domstring dom_domstringlist_item(int index);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#DOMStringList-item Since:"
    ],
    "dom_element_get_attribute": [
        "string dom_element_get_attribute(string name);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-ID-666EE0F9 Since:"
    ],
    "dom_element_get_attribute_node": [
        "DOMAttr dom_element_get_attribute_node(string name);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-ID-217A91B8 Since:"
    ],
    "dom_element_get_attribute_node_ns": [
        "DOMAttr dom_element_get_attribute_node_ns(string namespaceURI, string localName);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-ID-ElGetAtNodeNS Since: DOM Level 2"
    ],
    "dom_element_get_attribute_ns": [
        "string dom_element_get_attribute_ns(string namespaceURI, string localName);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-ID-ElGetAttrNS Since: DOM Level 2"
    ],
    "dom_element_get_elements_by_tag_name": [
        "DOMNodeList dom_element_get_elements_by_tag_name(string name);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-ID-1938918D Since:"
    ],
    "dom_element_get_elements_by_tag_name_ns": [
        "DOMNodeList dom_element_get_elements_by_tag_name_ns(string namespaceURI, string localName);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-ID-A6C90942 Since: DOM Level 2"
    ],
    "dom_element_has_attribute": [
        "boolean dom_element_has_attribute(string name);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-ID-ElHasAttr Since: DOM Level 2"
    ],
    "dom_element_has_attribute_ns": [
        "boolean dom_element_has_attribute_ns(string namespaceURI, string localName);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-ID-ElHasAttrNS Since: DOM Level 2"
    ],
    "dom_element_remove_attribute": [
        "void dom_element_remove_attribute(string name);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-ID-6D6AC0F9 Since:"
    ],
    "dom_element_remove_attribute_node": [
        "DOMAttr dom_element_remove_attribute_node(DOMAttr oldAttr);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-ID-D589198 Since:"
    ],
    "dom_element_remove_attribute_ns": [
        "void dom_element_remove_attribute_ns(string namespaceURI, string localName);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-ID-ElRemAtNS Since: DOM Level 2"
    ],
    "dom_element_set_attribute": [
        "void dom_element_set_attribute(string name, string value);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-ID-F68F082 Since:"
    ],
    "dom_element_set_attribute_node": [
        "DOMAttr dom_element_set_attribute_node(DOMAttr newAttr);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-ID-887236154 Since:"
    ],
    "dom_element_set_attribute_node_ns": [
        "DOMAttr dom_element_set_attribute_node_ns(DOMAttr newAttr);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-ID-ElSetAtNodeNS Since: DOM Level 2"
    ],
    "dom_element_set_attribute_ns": [
        "void dom_element_set_attribute_ns(string namespaceURI, string qualifiedName, string value);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-ID-ElSetAttrNS Since: DOM Level 2"
    ],
    "dom_element_set_id_attribute": [
        "void dom_element_set_id_attribute(string name, boolean isId);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-ID-ElSetIdAttr Since: DOM Level 3"
    ],
    "dom_element_set_id_attribute_node": [
        "void dom_element_set_id_attribute_node(attr idAttr, boolean isId);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-ID-ElSetIdAttrNode Since: DOM Level 3"
    ],
    "dom_element_set_id_attribute_ns": [
        "void dom_element_set_id_attribute_ns(string namespaceURI, string localName, boolean isId);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-ID-ElSetIdAttrNS Since: DOM Level 3"
    ],
    "dom_import_simplexml": [
        "somNode dom_import_simplexml(sxeobject node)",
        "Get a simplexml_element object from dom to allow for processing"
    ],
    "dom_namednodemap_get_named_item": [
        "DOMNode dom_namednodemap_get_named_item(string name);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-ID-1074577549 Since:"
    ],
    "dom_namednodemap_get_named_item_ns": [
        "DOMNode dom_namednodemap_get_named_item_ns(string namespaceURI, string localName);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-ID-getNamedItemNS Since: DOM Level 2"
    ],
    "dom_namednodemap_item": [
        "DOMNode dom_namednodemap_item(int index);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-ID-349467F9 Since:"
    ],
    "dom_namednodemap_remove_named_item": [
        "DOMNode dom_namednodemap_remove_named_item(string name);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-ID-D58B193 Since:"
    ],
    "dom_namednodemap_remove_named_item_ns": [
        "DOMNode dom_namednodemap_remove_named_item_ns(string namespaceURI, string localName);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-ID-removeNamedItemNS Since: DOM Level 2"
    ],
    "dom_namednodemap_set_named_item": [
        "DOMNode dom_namednodemap_set_named_item(DOMNode arg);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-ID-1025163788 Since:"
    ],
    "dom_namednodemap_set_named_item_ns": [
        "DOMNode dom_namednodemap_set_named_item_ns(DOMNode arg);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-ID-setNamedItemNS Since: DOM Level 2"
    ],
    "dom_namelist_get_name": [
        "string dom_namelist_get_name(int index);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#NameList-getName Since:"
    ],
    "dom_namelist_get_namespace_uri": [
        "string dom_namelist_get_namespace_uri(int index);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#NameList-getNamespaceURI Since:"
    ],
    "dom_node_append_child": [
        "DomNode dom_node_append_child(DomNode newChild);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-ID-184E7107 Since:"
    ],
    "dom_node_clone_node": [
        "DomNode dom_node_clone_node(boolean deep);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-ID-3A0ED0A4 Since:"
    ],
    "dom_node_compare_document_position": [
        "short dom_node_compare_document_position(DomNode other);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#Node3-compareDocumentPosition Since: DOM Level 3"
    ],
    "dom_node_get_feature": [
        "DomNode dom_node_get_feature(string feature, string version);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#Node3-getFeature Since: DOM Level 3"
    ],
    "dom_node_get_user_data": [
        "mixed dom_node_get_user_data(string key);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#Node3-getUserData Since: DOM Level 3"
    ],
    "dom_node_has_attributes": [
        "boolean dom_node_has_attributes();",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-ID-NodeHasAttrs Since: DOM Level 2"
    ],
    "dom_node_has_child_nodes": [
        "boolean dom_node_has_child_nodes();",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-ID-810594187 Since:"
    ],
    "dom_node_insert_before": [
        "domnode dom_node_insert_before(DomNode newChild, DomNode refChild);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-ID-952280727 Since:"
    ],
    "dom_node_is_default_namespace": [
        "boolean dom_node_is_default_namespace(string namespaceURI);",
        "URL: http://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-isDefaultNamespace Since: DOM Level 3"
    ],
    "dom_node_is_equal_node": [
        "boolean dom_node_is_equal_node(DomNode arg);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#Node3-isEqualNode Since: DOM Level 3"
    ],
    "dom_node_is_same_node": [
        "boolean dom_node_is_same_node(DomNode other);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#Node3-isSameNode Since: DOM Level 3"
    ],
    "dom_node_is_supported": [
        "boolean dom_node_is_supported(string feature, string version);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-Level-2-Core-Node-supports Since: DOM Level 2"
    ],
    "dom_node_lookup_namespace_uri": [
        "string dom_node_lookup_namespace_uri(string prefix);",
        "URL: http://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-lookupNamespaceURI Since: DOM Level 3"
    ],
    "dom_node_lookup_prefix": [
        "string dom_node_lookup_prefix(string namespaceURI);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#Node3-lookupNamespacePrefix Since: DOM Level 3"
    ],
    "dom_node_normalize": [
        "void dom_node_normalize();",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-ID-normalize Since:"
    ],
    "dom_node_remove_child": [
        "DomNode dom_node_remove_child(DomNode oldChild);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-ID-1734834066 Since:"
    ],
    "dom_node_replace_child": [
        "DomNode dom_node_replace_child(DomNode newChild, DomNode oldChild);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-ID-785887307 Since:"
    ],
    "dom_node_set_user_data": [
        "mixed dom_node_set_user_data(string key, mixed data, userdatahandler handler);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#Node3-setUserData Since: DOM Level 3"
    ],
    "dom_nodelist_item": [
        "DOMNode dom_nodelist_item(int index);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#ID-844377136 Since:"
    ],
    "dom_string_extend_find_offset16": [
        "int dom_string_extend_find_offset16(int offset32);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#i18n-methods-StringExtend-findOffset16 Since:"
    ],
    "dom_string_extend_find_offset32": [
        "int dom_string_extend_find_offset32(int offset16);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#i18n-methods-StringExtend-findOffset32 Since:"
    ],
    "dom_text_is_whitespace_in_element_content": [
        "boolean dom_text_is_whitespace_in_element_content();",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-Text3-isWhitespaceInElementContent Since: DOM Level 3"
    ],
    "dom_text_replace_whole_text": [
        "DOMText dom_text_replace_whole_text(string content);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-Text3-replaceWholeText Since: DOM Level 3"
    ],
    "dom_text_split_text": [
        "DOMText dom_text_split_text(int offset);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#core-ID-38853C1D Since:"
    ],
    "dom_userdatahandler_handle": [
        "dom_void dom_userdatahandler_handle(short operation, string key, domobject data, node src, node dst);",
        "URL: http://www.w3.org/TR/2003/WD-DOM-Level-3-Core-20030226/DOM3-Core.html#ID-handleUserDataEvent Since:"
    ],
    "dom_xpath_evaluate": [
        "mixed dom_xpath_evaluate(string expr [,DOMNode context]); */",
        "PHP_FUNCTION(dom_xpath_evaluate) {  php_xpath_eval(INTERNAL_FUNCTION_PARAM_PASSTHRU, PHP_DOM_XPATH_EVALUATE); } /* }}} end dom_xpath_evaluate"
    ],
    "dom_xpath_query": [
        "DOMNodeList dom_xpath_query(string expr [,DOMNode context]); */",
        "PHP_FUNCTION(dom_xpath_query) {  php_xpath_eval(INTERNAL_FUNCTION_PARAM_PASSTHRU, PHP_DOM_XPATH_QUERY); } /* }}} end dom_xpath_query"
    ],
    "dom_xpath_register_ns": [
        "boolean dom_xpath_register_ns(string prefix, string uri); */",
        "PHP_FUNCTION(dom_xpath_register_ns) {  zval *id;  xmlXPathContextPtr ctxp;  int prefix_len, ns_uri_len;  dom_xpath_object *intern;  unsigned char *prefix, *ns_uri;   if (zend_parse_method_parameters(ZEND_NUM_ARGS() TSRMLS_CC, getThis(), \"Oss\", &id, dom_xpath_class_entry, &prefix, &prefix_len, &ns_uri, &ns_uri_len) == FAILURE) {   return;  }   intern = (dom_xpath_object *)zend_object_store_get_object(id TSRMLS_CC);   ctxp = (xmlXPathContextPtr) intern->ptr;  if (ctxp == NULL) {   php_error_docref(NULL TSRMLS_CC, E_WARNING, \"Invalid XPath Context\");   RETURN_FALSE;  }   if (xmlXPathRegisterNs(ctxp, prefix, ns_uri) != 0) {   RETURN_FALSE  }  RETURN_TRUE; } /* }}}"
    ],
    "dom_xpath_register_php_functions": [
        "void dom_xpath_register_php_functions() */",
        "PHP_FUNCTION(dom_xpath_register_php_functions) {  zval *id;  dom_xpath_object *intern;  zval *array_value, **entry, *new_string;  int  name_len = 0;  char *name;   DOM_GET_THIS(id);    if (zend_parse_parameters_ex(ZEND_PARSE_PARAMS_QUIET, ZEND_NUM_ARGS() TSRMLS_CC, \"a\",  &array_value) == SUCCESS) {   intern = (dom_xpath_object *)zend_object_store_get_object(id TSRMLS_CC);   zend_hash_internal_pointer_reset(Z_ARRVAL_P(array_value));    while (zend_hash_get_current_data(Z_ARRVAL_P(array_value), (void **)&entry) == SUCCESS) {    SEPARATE_ZVAL(entry);    convert_to_string_ex(entry);     MAKE_STD_ZVAL(new_string);    ZVAL_LONG(new_string,1);       zend_hash_update(intern->registered_phpfunctions, Z_STRVAL_PP(entry), Z_STRLEN_PP(entry) + 1, &new_string, sizeof(zval*), NULL);    zend_hash_move_forward(Z_ARRVAL_P(array_value));   }   intern->registerPhpFunctions = 2;   RETURN_TRUE;   } else if (zend_parse_parameters_ex(ZEND_PARSE_PARAMS_QUIET, ZEND_NUM_ARGS() TSRMLS_CC, \"s\",  &name, &name_len) == SUCCESS) {   intern = (dom_xpath_object *)zend_object_store_get_object(id TSRMLS_CC);      MAKE_STD_ZVAL(new_string);   ZVAL_LONG(new_string,1);   zend_hash_update(intern->registered_phpfunctions, name, name_len + 1, &new_string, sizeof(zval*), NULL);   intern->registerPhpFunctions = 2;     } else {   intern = (dom_xpath_object *)zend_object_store_get_object(id TSRMLS_CC);   intern->registerPhpFunctions = 1;  }   } /* }}} end dom_xpath_register_php_functions"
    ],
    "each": [
        "array each(array arr)",
        "Return the currently pointed key..value pair in the passed array, and advance the pointer to the next element"
    ],
    "easter_date": [
        "int easter_date([int year])",
        "Return the timestamp of midnight on Easter of a given year (defaults to current year)"
    ],
    "easter_days": [
        "int easter_days([int year, [int method]])",
        "Return the number of days after March 21 that Easter falls on for a given year (defaults to current year)"
    ],
    "echo": [
        "void echo(string arg1 [, string ...])",
        "Output one or more strings"
    ],
    "empty": [
        "bool empty( mixed var )",
        "Determine whether a variable is empty"
    ],
    "enchant_broker_describe": [
        "array enchant_broker_describe(resource broker)",
        "Enumerates the Enchant providers and tells you some rudimentary information about them. The same info is provided through phpinfo()"
    ],
    "enchant_broker_dict_exists": [
        "bool enchant_broker_dict_exists(resource broker, string tag)",
        "Whether a dictionary exists or not. Using non-empty tag"
    ],
    "enchant_broker_free": [
        "boolean enchant_broker_free(resource broker)",
        "Destroys the broker object and its dictionnaries"
    ],
    "enchant_broker_free_dict": [
        "resource enchant_broker_free_dict(resource dict)",
        "Free the dictionary resource"
    ],
    "enchant_broker_get_dict_path": [
        "string enchant_broker_get_dict_path(resource broker, int dict_type)",
        "Get the directory path for a given backend, works with ispell and myspell"
    ],
    "enchant_broker_get_error": [
        "string enchant_broker_get_error(resource broker)",
        "Returns the last error of the broker"
    ],
    "enchant_broker_init": [
        "resource enchant_broker_init()",
        "create a new broker object capable of requesting"
    ],
    "enchant_broker_list_dicts": [
        "string enchant_broker_list_dicts(resource broker)",
        "Lists the dictionaries available for the given broker"
    ],
    "enchant_broker_request_dict": [
        "resource enchant_broker_request_dict(resource broker, string tag)",
        "create a new dictionary using tag, the non-empty language tag you wish to request  a dictionary for (\"en_US\", \"de_DE\", ...)"
    ],
    "enchant_broker_request_pwl_dict": [
        "resource enchant_broker_request_pwl_dict(resource broker, string filename)",
        "creates a dictionary using a PWL file. A PWL file is personal word file one word per line. It must exist before the call."
    ],
    "enchant_broker_set_dict_path": [
        "bool enchant_broker_set_dict_path(resource broker, int dict_type, string value)",
        "Set the directory path for a given backend, works with ispell and myspell"
    ],
    "enchant_broker_set_ordering": [
        "bool enchant_broker_set_ordering(resource broker, string tag, string ordering)",
        "Declares a preference of dictionaries to use for the language  described/referred to by 'tag'. The ordering is a comma delimited  list of provider names. As a special exception, the \"*\" tag can  be used as a language tag to declare a default ordering for any  language that does not explictly declare an ordering."
    ],
    "enchant_dict_add_to_personal": [
        "void enchant_dict_add_to_personal(resource dict, string word)",
        "add 'word' to personal word list"
    ],
    "enchant_dict_add_to_session": [
        "void enchant_dict_add_to_session(resource dict, string word)",
        "add 'word' to this spell-checking session"
    ],
    "enchant_dict_check": [
        "bool enchant_dict_check(resource dict, string word)",
        "If the word is correctly spelled return true, otherwise return false"
    ],
    "enchant_dict_describe": [
        "array enchant_dict_describe(resource dict)",
        "Describes an individual dictionary 'dict'"
    ],
    "enchant_dict_get_error": [
        "string enchant_dict_get_error(resource dict)",
        "Returns the last error of the current spelling-session"
    ],
    "enchant_dict_is_in_session": [
        "bool enchant_dict_is_in_session(resource dict, string word)",
        "whether or not 'word' exists in this spelling-session"
    ],
    "enchant_dict_quick_check": [
        "bool enchant_dict_quick_check(resource dict, string word [, array &suggestions])",
        "If the word is correctly spelled return true, otherwise return false, if suggestions variable     is provided, fill it with spelling alternatives."
    ],
    "enchant_dict_store_replacement": [
        "void enchant_dict_store_replacement(resource dict, string mis, string cor)",
        "add a correction for 'mis' using 'cor'.  Notes that you replaced @mis with @cor, so it's possibly more likely  that future occurrences of @mis will be replaced with @cor. So it might  bump @cor up in the suggestion list."
    ],
    "enchant_dict_suggest": [
        "array enchant_dict_suggest(resource dict, string word)",
        "Will return a list of values if any of those pre-conditions are not met."
    ],
    "end": [
        "mixed end(array array_arg)",
        "Advances array argument's internal pointer to the last element and return it"
    ],
    "ereg": [
        "int ereg(string pattern, string string [, array registers])",
        "Regular expression match"
    ],
    "ereg_replace": [
        "string ereg_replace(string pattern, string replacement, string string)",
        "Replace regular expression"
    ],
    "eregi": [
        "int eregi(string pattern, string string [, array registers])",
        "Case-insensitive regular expression match"
    ],
    "eregi_replace": [
        "string eregi_replace(string pattern, string replacement, string string)",
        "Case insensitive replace regular expression"
    ],
    "error_get_last": [
        "array error_get_last()",
        "Get the last occurred error as associative array. Returns NULL if there hasn't been an error yet."
    ],
    "error_log": [
        "bool error_log(string message [, int message_type [, string destination [, string extra_headers]]])",
        "Send an error message somewhere"
    ],
    "error_reporting": [
        "int error_reporting([int new_error_level])",
        "Return the current error_reporting level, and if an argument was passed - change to the new level"
    ],
    "escapeshellarg": [
        "string escapeshellarg(string arg)",
        "Quote and escape an argument for use in a shell command"
    ],
    "escapeshellcmd": [
        "string escapeshellcmd(string command)",
        "Escape shell metacharacters"
    ],
    "exec": [
        "string exec(string command [, array &output [, int &return_value]])",
        "Execute an external program"
    ],
    "exif_imagetype": [
        "int exif_imagetype(string imagefile)",
        "Get the type of an image"
    ],
    "exif_read_data": [
        "array exif_read_data(string filename [, sections_needed [, sub_arrays[, read_thumbnail]]])",
        "Reads header data from the JPEG/TIFF image filename and optionally reads the internal thumbnails"
    ],
    "exif_tagname": [
        "string exif_tagname(index)",
        "Get headername for index or false if not defined"
    ],
    "exif_thumbnail": [
        "string exif_thumbnail(string filename [, &width, &height [, &imagetype]])",
        "Reads the embedded thumbnail"
    ],
    "exit": [
        "void exit([mixed status])",
        "Output a message and terminate the current script"
    ],
    "exp": [
        "float exp(float number)",
        "Returns e raised to the power of the number"
    ],
    "explode": [
        "array explode(string separator, string str [, int limit])",
        "Splits a string on string separator and return array of components. If limit is positive only limit number of components is returned. If limit is negative all components except the last abs(limit) are returned."
    ],
    "expm1": [
        "float expm1(float number)",
        "Returns exp(number) - 1, computed in a way that accurate even when the value of number is close to zero"
    ],
    "extension_loaded": [
        "bool extension_loaded(string extension_name)",
        "Returns true if the named extension is loaded"
    ],
    "extract": [
        "int extract(array var_array [, int extract_type [, string prefix]])",
        "Imports variables into symbol table from an array"
    ],
    "ezmlm_hash": [
        "int ezmlm_hash(string addr)",
        "Calculate EZMLM list hash value."
    ],
    "fclose": [
        "bool fclose(resource fp)",
        "Close an open file pointer"
    ],
    "feof": [
        "bool feof(resource fp)",
        "Test for end-of-file on a file pointer"
    ],
    "fflush": [
        "bool fflush(resource fp)",
        "Flushes output"
    ],
    "fgetc": [
        "string fgetc(resource fp)",
        "Get a character from file pointer"
    ],
    "fgetcsv": [
        "array fgetcsv(resource fp [,int length [, string delimiter [, string enclosure [, string escape]]]])",
        "Get line from file pointer and parse for CSV fields"
    ],
    "fgets": [
        "string fgets(resource fp[, int length])",
        "Get a line from file pointer"
    ],
    "fgetss": [
        "string fgetss(resource fp [, int length [, string allowable_tags]])",
        "Get a line from file pointer and strip HTML tags"
    ],
    "file": [
        "array file(string filename [, int flags[, resource context]])",
        "Read entire file into an array"
    ],
    "file_exists": [
        "bool file_exists(string filename)",
        "Returns true if filename exists"
    ],
    "file_get_contents": [
        "string file_get_contents(string filename [, bool use_include_path [, resource context [, long offset [, long maxlen]]]])",
        "Read the entire file into a string"
    ],
    "file_put_contents": [
        "int file_put_contents(string file, mixed data [, int flags [, resource context]])",
        "Write/Create a file with contents data and return the number of bytes written"
    ],
    "fileatime": [
        "int fileatime(string filename)",
        "Get last access time of file"
    ],
    "filectime": [
        "int filectime(string filename)",
        "Get inode modification time of file"
    ],
    "filegroup": [
        "int filegroup(string filename)",
        "Get file group"
    ],
    "fileinode": [
        "int fileinode(string filename)",
        "Get file inode"
    ],
    "filemtime": [
        "int filemtime(string filename)",
        "Get last modification time of file"
    ],
    "fileowner": [
        "int fileowner(string filename)",
        "Get file owner"
    ],
    "fileperms": [
        "int fileperms(string filename)",
        "Get file permissions"
    ],
    "filesize": [
        "int filesize(string filename)",
        "Get file size"
    ],
    "filetype": [
        "string filetype(string filename)",
        "Get file type"
    ],
    "filter_has_var": [
        "mixed filter_has_var(constant type, string variable_name)",
        "* Returns true if the variable with the name 'name' exists in source."
    ],
    "filter_input": [
        "mixed filter_input(constant type, string variable_name [, long filter [, mixed options]])",
        "* Returns the filtered variable 'name'* from source `type`."
    ],
    "filter_input_array": [
        "mixed filter_input_array(constant type, [, mixed options]])",
        "* Returns an array with all arguments defined in 'definition'."
    ],
    "filter_var": [
        "mixed filter_var(mixed variable [, long filter [, mixed options]])",
        "* Returns the filtered version of the vriable."
    ],
    "filter_var_array": [
        "mixed filter_var_array(array data, [, mixed options]])",
        "* Returns an array with all arguments defined in 'definition'."
    ],
    "finfo_buffer": [
        "string finfo_buffer(resource finfo, char *string [, int options [, resource context]])",
        "Return infromation about a string buffer."
    ],
    "finfo_close": [
        "resource finfo_close(resource finfo)",
        "Close fileinfo resource."
    ],
    "finfo_file": [
        "string finfo_file(resource finfo, char *file_name [, int options [, resource context]])",
        "Return information about a file."
    ],
    "finfo_open": [
        "resource finfo_open([int options [, string arg]])",
        "Create a new fileinfo resource."
    ],
    "finfo_set_flags": [
        "bool finfo_set_flags(resource finfo, int options)",
        "Set libmagic configuration options."
    ],
    "floatval": [
        "float floatval(mixed var)",
        "Get the float value of a variable"
    ],
    "flock": [
        "bool flock(resource fp, int operation [, int &wouldblock])",
        "Portable file locking"
    ],
    "floor": [
        "float floor(float number)",
        "Returns the next lowest integer value from the number"
    ],
    "flush": [
        "void flush(void)",
        "Flush the output buffer"
    ],
    "fmod": [
        "float fmod(float x, float y)",
        "Returns the remainder of dividing x by y as a float"
    ],
    "fnmatch": [
        "bool fnmatch(string pattern, string filename [, int flags])",
        "Match filename against pattern"
    ],
    "fopen": [
        "resource fopen(string filename, string mode [, bool use_include_path [, resource context]])",
        "Open a file or a URL and return a file pointer"
    ],
    "forward_static_call": [
        "mixed forward_static_call(mixed function_name [, mixed parmeter] [, mixed ...])",
        "Call a user function which is the first parameter"
    ],
    "fpassthru": [
        "int fpassthru(resource fp)",
        "Output all remaining data from a file pointer"
    ],
    "fprintf": [
        "int fprintf(resource stream, string format [, mixed arg1 [, mixed ...]])",
        "Output a formatted string into a stream"
    ],
    "fputcsv": [
        "int fputcsv(resource fp, array fields [, string delimiter [, string enclosure]])",
        "Format line as CSV and write to file pointer"
    ],
    "fread": [
        "string fread(resource fp, int length)",
        "Binary-safe file read"
    ],
    "frenchtojd": [
        "int frenchtojd(int month, int day, int year)",
        "Converts a french republic calendar date to julian day count"
    ],
    "fscanf": [
        "mixed fscanf(resource stream, string format [, string ...])",
        "Implements a mostly ANSI compatible fscanf()"
    ],
    "fseek": [
        "int fseek(resource fp, int offset [, int whence])",
        "Seek on a file pointer"
    ],
    "fsockopen": [
        "resource fsockopen(string hostname, int port [, int errno [, string errstr [, float timeout]]])",
        "Open Internet or Unix domain socket connection"
    ],
    "fstat": [
        "array fstat(resource fp)",
        "Stat() on a filehandle"
    ],
    "ftell": [
        "int ftell(resource fp)",
        "Get file pointer's read/write position"
    ],
    "ftok": [
        "int ftok(string pathname, string proj)",
        "Convert a pathname and a project identifier to a System V IPC key"
    ],
    "ftp_alloc": [
        "bool ftp_alloc(resource stream, int size[, &response])",
        "Attempt to allocate space on the remote FTP server"
    ],
    "ftp_cdup": [
        "bool ftp_cdup(resource stream)",
        "Changes to the parent directory"
    ],
    "ftp_chdir": [
        "bool ftp_chdir(resource stream, string directory)",
        "Changes directories"
    ],
    "ftp_chmod": [
        "int ftp_chmod(resource stream, int mode, string filename)",
        "Sets permissions on a file"
    ],
    "ftp_close": [
        "bool ftp_close(resource stream)",
        "Closes the FTP stream"
    ],
    "ftp_connect": [
        "resource ftp_connect(string host [, int port [, int timeout]])",
        "Opens a FTP stream"
    ],
    "ftp_delete": [
        "bool ftp_delete(resource stream, string file)",
        "Deletes a file"
    ],
    "ftp_exec": [
        "bool ftp_exec(resource stream, string command)",
        "Requests execution of a program on the FTP server"
    ],
    "ftp_fget": [
        "bool ftp_fget(resource stream, resource fp, string remote_file, int mode[, int resumepos])",
        "Retrieves a file from the FTP server and writes it to an open file"
    ],
    "ftp_fput": [
        "bool ftp_fput(resource stream, string remote_file, resource fp, int mode[, int startpos])",
        "Stores a file from an open file to the FTP server"
    ],
    "ftp_get": [
        "bool ftp_get(resource stream, string local_file, string remote_file, int mode[, int resume_pos])",
        "Retrieves a file from the FTP server and writes it to a local file"
    ],
    "ftp_get_option": [
        "mixed ftp_get_option(resource stream, int option)",
        "Gets an FTP option"
    ],
    "ftp_login": [
        "bool ftp_login(resource stream, string username, string password)",
        "Logs into the FTP server"
    ],
    "ftp_mdtm": [
        "int ftp_mdtm(resource stream, string filename)",
        "Returns the last modification time of the file, or -1 on error"
    ],
    "ftp_mkdir": [
        "string ftp_mkdir(resource stream, string directory)",
        "Creates a directory and returns the absolute path for the new directory or false on error"
    ],
    "ftp_nb_continue": [
        "int ftp_nb_continue(resource stream)",
        "Continues retrieving/sending a file nbronously"
    ],
    "ftp_nb_fget": [
        "int ftp_nb_fget(resource stream, resource fp, string remote_file, int mode[, int resumepos])",
        "Retrieves a file from the FTP server asynchronly and writes it to an open file"
    ],
    "ftp_nb_fput": [
        "int ftp_nb_fput(resource stream, string remote_file, resource fp, int mode[, int startpos])",
        "Stores a file from an open file to the FTP server nbronly"
    ],
    "ftp_nb_get": [
        "int ftp_nb_get(resource stream, string local_file, string remote_file, int mode[, int resume_pos])",
        "Retrieves a file from the FTP server nbhronly and writes it to a local file"
    ],
    "ftp_nb_put": [
        "int ftp_nb_put(resource stream, string remote_file, string local_file, int mode[, int startpos])",
        "Stores a file on the FTP server"
    ],
    "ftp_nlist": [
        "array ftp_nlist(resource stream, string directory)",
        "Returns an array of filenames in the given directory"
    ],
    "ftp_pasv": [
        "bool ftp_pasv(resource stream, bool pasv)",
        "Turns passive mode on or off"
    ],
    "ftp_put": [
        "bool ftp_put(resource stream, string remote_file, string local_file, int mode[, int startpos])",
        "Stores a file on the FTP server"
    ],
    "ftp_pwd": [
        "string ftp_pwd(resource stream)",
        "Returns the present working directory"
    ],
    "ftp_raw": [
        "array ftp_raw(resource stream, string command)",
        "Sends a literal command to the FTP server"
    ],
    "ftp_rawlist": [
        "array ftp_rawlist(resource stream, string directory [, bool recursive])",
        "Returns a detailed listing of a directory as an array of output lines"
    ],
    "ftp_rename": [
        "bool ftp_rename(resource stream, string src, string dest)",
        "Renames the given file to a new path"
    ],
    "ftp_rmdir": [
        "bool ftp_rmdir(resource stream, string directory)",
        "Removes a directory"
    ],
    "ftp_set_option": [
        "bool ftp_set_option(resource stream, int option, mixed value)",
        "Sets an FTP option"
    ],
    "ftp_site": [
        "bool ftp_site(resource stream, string cmd)",
        "Sends a SITE command to the server"
    ],
    "ftp_size": [
        "int ftp_size(resource stream, string filename)",
        "Returns the size of the file, or -1 on error"
    ],
    "ftp_ssl_connect": [
        "resource ftp_ssl_connect(string host [, int port [, int timeout]])",
        "Opens a FTP-SSL stream"
    ],
    "ftp_systype": [
        "string ftp_systype(resource stream)",
        "Returns the system type identifier"
    ],
    "ftruncate": [
        "bool ftruncate(resource fp, int size)",
        "Truncate file to 'size' length"
    ],
    "func_get_arg": [
        "mixed func_get_arg(int arg_num)",
        "Get the $arg_num'th argument that was passed to the function"
    ],
    "func_get_args": [
        "array func_get_args()",
        "Get an array of the arguments that were passed to the function"
    ],
    "func_num_args": [
        "int func_num_args(void)",
        "Get the number of arguments that were passed to the function"
    ],
    "function ": ["", ""],
    "foreach ": ["", ""],
    "function_exists": [
        "bool function_exists(string function_name)",
        "Checks if the function exists"
    ],
    "fwrite": [
        "int fwrite(resource fp, string str [, int length])",
        "Binary-safe file write"
    ],
    "gc_collect_cycles": [
        "int gc_collect_cycles(void)",
        "Forces collection of any existing garbage cycles.    Returns number of freed zvals"
    ],
    "gc_disable": [
        "void gc_disable(void)",
        "Deactivates the circular reference collector"
    ],
    "gc_enable": [
        "void gc_enable(void)",
        "Activates the circular reference collector"
    ],
    "gc_enabled": [
        "void gc_enabled(void)",
        "Returns status of the circular reference collector"
    ],
    "gd_info": [
        "array gd_info()",
        ""
    ],
    "getKeywords": [
        "static array getKeywords(string $locale) {",
        "* return an associative array containing keyword-value  * pairs for this locale. The keys are keys to the array (doh!)  * }}}"
    ],
    "get_browser": [
        "mixed get_browser([string browser_name [, bool return_array]])",
        "Get information about the capabilities of a browser. If browser_name is omitted or null, HTTP_USER_AGENT is used. Returns an object by default; if return_array is true, returns an array."
    ],
    "get_called_class": [
        "string get_called_class()",
        "Retrieves the \"Late Static Binding\" class name"
    ],
    "get_cfg_var": [
        "mixed get_cfg_var(string option_name)",
        "Get the value of a PHP configuration option"
    ],
    "get_class": [
        "string get_class([object object])",
        "Retrieves the class name"
    ],
    "get_class_methods": [
        "array get_class_methods(mixed class)",
        "Returns an array of method names for class or class instance."
    ],
    "get_class_vars": [
        "array get_class_vars(string class_name)",
        "Returns an array of default properties of the class."
    ],
    "get_current_user": [
        "string get_current_user(void)",
        "Get the name of the owner of the current PHP script"
    ],
    "get_declared_classes": [
        "array get_declared_classes()",
        "Returns an array of all declared classes."
    ],
    "get_declared_interfaces": [
        "array get_declared_interfaces()",
        "Returns an array of all declared interfaces."
    ],
    "get_defined_constants": [
        "array get_defined_constants([bool categorize])",
        "Return an array containing the names and values of all defined constants"
    ],
    "get_defined_functions": [
        "array get_defined_functions(void)",
        "Returns an array of all defined functions"
    ],
    "get_defined_vars": [
        "array get_defined_vars(void)",
        "Returns an associative array of names and values of all currently defined variable names (variables in the current scope)"
    ],
    "get_display_language": [
        "static string get_display_language($locale[, $in_locale = null])",
        "* gets the language for the $locale in $in_locale or default_locale"
    ],
    "get_display_name": [
        "static string get_display_name($locale[, $in_locale = null])",
        "* gets the name for the $locale in $in_locale or default_locale"
    ],
    "get_display_region": [
        "static string get_display_region($locale, $in_locale = null)",
        "* gets the region for the $locale in $in_locale or default_locale"
    ],
    "get_display_script": [
        "static string get_display_script($locale, $in_locale = null)",
        "* gets the script for the $locale in $in_locale or default_locale"
    ],
    "get_extension_funcs": [
        "array get_extension_funcs(string extension_name)",
        "Returns an array with the names of functions belonging to the named extension"
    ],
    "get_headers": [
        "array get_headers(string url[, int format])",
        "fetches all the headers sent by the server in response to a HTTP request"
    ],
    "get_html_translation_table": [
        "array get_html_translation_table([int table [, int quote_style]])",
        "Returns the internal translation table used by htmlspecialchars and htmlentities"
    ],
    "get_include_path": [
        "string get_include_path()",
        "Get the current include_path configuration option"
    ],
    "get_included_files": [
        "array get_included_files(void)",
        "Returns an array with the file names that were include_once()'d"
    ],
    "get_loaded_extensions": [
        "array get_loaded_extensions([bool zend_extensions])",
        "Return an array containing names of loaded extensions"
    ],
    "get_magic_quotes_gpc": [
        "int get_magic_quotes_gpc(void)",
        "Get the current active configuration setting of magic_quotes_gpc"
    ],
    "get_magic_quotes_runtime": [
        "int get_magic_quotes_runtime(void)",
        "Get the current active configuration setting of magic_quotes_runtime"
    ],
    "get_meta_tags": [
        "array get_meta_tags(string filename [, bool use_include_path])",
        "Extracts all meta tag content attributes from a file and returns an array"
    ],
    "get_object_vars": [
        "array get_object_vars(object obj)",
        "Returns an array of object properties"
    ],
    "get_parent_class": [
        "string get_parent_class([mixed object])",
        "Retrieves the parent class name for object or class or current scope."
    ],
    "get_resource_type": [
        "string get_resource_type(resource res)",
        "Get the resource type name for a given resource"
    ],
    "getallheaders": [
        "array getallheaders(void)",
        ""
    ],
    "getcwd": [
        "mixed getcwd(void)",
        "Gets the current directory"
    ],
    "getdate": [
        "array getdate([int timestamp])",
        "Get date/time information"
    ],
    "getenv": [
        "string getenv(string varname)",
        "Get the value of an environment variable"
    ],
    "gethostbyaddr": [
        "string gethostbyaddr(string ip_address)",
        "Get the Internet host name corresponding to a given IP address"
    ],
    "gethostbyname": [
        "string gethostbyname(string hostname)",
        "Get the IP address corresponding to a given Internet host name"
    ],
    "gethostbynamel": [
        "array gethostbynamel(string hostname)",
        "Return a list of IP addresses that a given hostname resolves to."
    ],
    "gethostname": [
        "string gethostname()",
        "Get the host name of the current machine"
    ],
    "getimagesize": [
        "array getimagesize(string imagefile [, array info])",
        "Get the size of an image as 4-element array"
    ],
    "getlastmod": [
        "int getlastmod(void)",
        "Get time of last page modification"
    ],
    "getmygid": [
        "int getmygid(void)",
        "Get PHP script owner's GID"
    ],
    "getmyinode": [
        "int getmyinode(void)",
        "Get the inode of the current script being parsed"
    ],
    "getmypid": [
        "int getmypid(void)",
        "Get current process ID"
    ],
    "getmyuid": [
        "int getmyuid(void)",
        "Get PHP script owner's UID"
    ],
    "getopt": [
        "array getopt(string options [, array longopts])",
        "Get options from the command line argument list"
    ],
    "getprotobyname": [
        "int getprotobyname(string name)",
        "Returns protocol number associated with name as per /etc/protocols"
    ],
    "getprotobynumber": [
        "string getprotobynumber(int proto)",
        "Returns protocol name associated with protocol number proto"
    ],
    "getrandmax": [
        "int getrandmax(void)",
        "Returns the maximum value a random number can have"
    ],
    "getrusage": [
        "array getrusage([int who])",
        "Returns an array of usage statistics"
    ],
    "getservbyname": [
        "int getservbyname(string service, string protocol)",
        "Returns port associated with service. Protocol must be \"tcp\" or \"udp\""
    ],
    "getservbyport": [
        "string getservbyport(int port, string protocol)",
        "Returns service name associated with port. Protocol must be \"tcp\" or \"udp\""
    ],
    "gettext": [
        "string gettext(string msgid)",
        "Return the translation of msgid for the current domain, or msgid unaltered if a translation does not exist"
    ],
    "gettimeofday": [
        "array gettimeofday([bool get_as_float])",
        "Returns the current time as array"
    ],
    "gettype": [
        "string gettype(mixed var)",
        "Returns the type of the variable"
    ],
    "glob": [
        "array glob(string pattern [, int flags])",
        "Find pathnames matching a pattern"
    ],
    "gmdate": [
        "string gmdate(string format [, long timestamp])",
        "Format a GMT date/time"
    ],
    "gmmktime": [
        "int gmmktime([int hour [, int min [, int sec [, int mon [, int day [, int year]]]]]])",
        "Get UNIX timestamp for a GMT date"
    ],
    "gmp_abs": [
        "resource gmp_abs(resource a)",
        "Calculates absolute value"
    ],
    "gmp_add": [
        "resource gmp_add(resource a, resource b)",
        "Add a and b"
    ],
    "gmp_and": [
        "resource gmp_and(resource a, resource b)",
        "Calculates logical AND of a and b"
    ],
    "gmp_clrbit": [
        "void gmp_clrbit(resource &a, int index)",
        "Clears bit in a"
    ],
    "gmp_cmp": [
        "int gmp_cmp(resource a, resource b)",
        "Compares two numbers"
    ],
    "gmp_com": [
        "resource gmp_com(resource a)",
        "Calculates one's complement of a"
    ],
    "gmp_div_q": [
        "resource gmp_div_q(resource a, resource b [, int round])",
        "Divide a by b, returns quotient only"
    ],
    "gmp_div_qr": [
        "array gmp_div_qr(resource a, resource b [, int round])",
        "Divide a by b, returns quotient and reminder"
    ],
    "gmp_div_r": [
        "resource gmp_div_r(resource a, resource b [, int round])",
        "Divide a by b, returns reminder only"
    ],
    "gmp_divexact": [
        "resource gmp_divexact(resource a, resource b)",
        "Divide a by b using exact division algorithm"
    ],
    "gmp_fact": [
        "resource gmp_fact(int a)",
        "Calculates factorial function"
    ],
    "gmp_gcd": [
        "resource gmp_gcd(resource a, resource b)",
        "Computes greatest common denominator (gcd) of a and b"
    ],
    "gmp_gcdext": [
        "array gmp_gcdext(resource a, resource b)",
        "Computes G, S, and T, such that AS + BT = G = `gcd' (A, B)"
    ],
    "gmp_hamdist": [
        "int gmp_hamdist(resource a, resource b)",
        "Calculates hamming distance between a and b"
    ],
    "gmp_init": [
        "resource gmp_init(mixed number [, int base])",
        "Initializes GMP number"
    ],
    "gmp_intval": [
        "int gmp_intval(resource gmpnumber)",
        "Gets signed long value of GMP number"
    ],
    "gmp_invert": [
        "resource gmp_invert(resource a, resource b)",
        "Computes the inverse of a modulo b"
    ],
    "gmp_jacobi": [
        "int gmp_jacobi(resource a, resource b)",
        "Computes Jacobi symbol"
    ],
    "gmp_legendre": [
        "int gmp_legendre(resource a, resource b)",
        "Computes Legendre symbol"
    ],
    "gmp_mod": [
        "resource gmp_mod(resource a, resource b)",
        "Computes a modulo b"
    ],
    "gmp_mul": [
        "resource gmp_mul(resource a, resource b)",
        "Multiply a and b"
    ],
    "gmp_neg": [
        "resource gmp_neg(resource a)",
        "Negates a number"
    ],
    "gmp_nextprime": [
        "resource gmp_nextprime(resource a)",
        "Finds next prime of a"
    ],
    "gmp_or": [
        "resource gmp_or(resource a, resource b)",
        "Calculates logical OR of a and b"
    ],
    "gmp_perfect_square": [
        "bool gmp_perfect_square(resource a)",
        "Checks if a is an exact square"
    ],
    "gmp_popcount": [
        "int gmp_popcount(resource a)",
        "Calculates the population count of a"
    ],
    "gmp_pow": [
        "resource gmp_pow(resource base, int exp)",
        "Raise base to power exp"
    ],
    "gmp_powm": [
        "resource gmp_powm(resource base, resource exp, resource mod)",
        "Raise base to power exp and take result modulo mod"
    ],
    "gmp_prob_prime": [
        "int gmp_prob_prime(resource a[, int reps])",
        "Checks if a is \"probably prime\""
    ],
    "gmp_random": [
        "resource gmp_random([int limiter])",
        "Gets random number"
    ],
    "gmp_scan0": [
        "int gmp_scan0(resource a, int start)",
        "Finds first zero bit"
    ],
    "gmp_scan1": [
        "int gmp_scan1(resource a, int start)",
        "Finds first non-zero bit"
    ],
    "gmp_setbit": [
        "void gmp_setbit(resource &a, int index[, bool set_clear])",
        "Sets or clear bit in a"
    ],
    "gmp_sign": [
        "int gmp_sign(resource a)",
        "Gets the sign of the number"
    ],
    "gmp_sqrt": [
        "resource gmp_sqrt(resource a)",
        "Takes integer part of square root of a"
    ],
    "gmp_sqrtrem": [
        "array gmp_sqrtrem(resource a)",
        "Square root with remainder"
    ],
    "gmp_strval": [
        "string gmp_strval(resource gmpnumber [, int base])",
        "Gets string representation of GMP number"
    ],
    "gmp_sub": [
        "resource gmp_sub(resource a, resource b)",
        "Subtract b from a"
    ],
    "gmp_testbit": [
        "bool gmp_testbit(resource a, int index)",
        "Tests if bit is set in a"
    ],
    "gmp_xor": [
        "resource gmp_xor(resource a, resource b)",
        "Calculates logical exclusive OR of a and b"
    ],
    "gmstrftime": [
        "string gmstrftime(string format [, int timestamp])",
        "Format a GMT/UCT time/date according to locale settings"
    ],
    "grapheme_extract": [
        "string grapheme_extract(string str, int size[, int extract_type[, int start[, int next]]])",
        "Function to extract a sequence of default grapheme clusters"
    ],
    "grapheme_stripos": [
        "int grapheme_stripos(string haystack, string needle [, int offset ])",
        "Find position of first occurrence of a string within another, ignoring case differences"
    ],
    "grapheme_stristr": [
        "string grapheme_stristr(string haystack, string needle[, bool part])",
        "Finds first occurrence of a string within another"
    ],
    "grapheme_strlen": [
        "int grapheme_strlen(string str)",
        "Get number of graphemes in a string"
    ],
    "grapheme_strpos": [
        "int grapheme_strpos(string haystack, string needle [, int offset ])",
        "Find position of first occurrence of a string within another"
    ],
    "grapheme_strripos": [
        "int grapheme_strripos(string haystack, string needle [, int offset])",
        "Find position of last occurrence of a string within another, ignoring case"
    ],
    "grapheme_strrpos": [
        "int grapheme_strrpos(string haystack, string needle [, int offset])",
        "Find position of last occurrence of a string within another"
    ],
    "grapheme_strstr": [
        "string grapheme_strstr(string haystack, string needle[, bool part])",
        "Finds first occurrence of a string within another"
    ],
    "grapheme_substr": [
        "string grapheme_substr(string str, int start [, int length])",
        "Returns part of a string"
    ],
    "gregoriantojd": [
        "int gregoriantojd(int month, int day, int year)",
        "Converts a gregorian calendar date to julian day count"
    ],
    "gzcompress": [
        "string gzcompress(string data [, int level])",
        "Gzip-compress a string"
    ],
    "gzdeflate": [
        "string gzdeflate(string data [, int level])",
        "Gzip-compress a string"
    ],
    "gzencode": [
        "string gzencode(string data [, int level [, int encoding_mode]])",
        "GZ encode a string"
    ],
    "gzfile": [
        "array gzfile(string filename [, int use_include_path])",
        "Read und uncompress entire .gz-file into an array"
    ],
    "gzinflate": [
        "string gzinflate(string data [, int length])",
        "Unzip a gzip-compressed string"
    ],
    "gzopen": [
        "resource gzopen(string filename, string mode [, int use_include_path])",
        "Open a .gz-file and return a .gz-file pointer"
    ],
    "gzuncompress": [
        "string gzuncompress(string data [, int length])",
        "Unzip a gzip-compressed string"
    ],
    "hash": [
        "string hash(string algo, string data[, bool raw_output = false])",
        "Generate a hash of a given input string Returns lowercase hexits by default"
    ],
    "hash_algos": [
        "array hash_algos(void)",
        "Return a list of registered hashing algorithms"
    ],
    "hash_copy": [
        "resource hash_copy(resource context)",
        "Copy hash resource"
    ],
    "hash_file": [
        "string hash_file(string algo, string filename[, bool raw_output = false])",
        "Generate a hash of a given file Returns lowercase hexits by default"
    ],
    "hash_final": [
        "string hash_final(resource context[, bool raw_output=false])",
        "Output resulting digest"
    ],
    "hash_hmac": [
        "string hash_hmac(string algo, string data, string key[, bool raw_output = false])",
        "Generate a hash of a given input string with a key using HMAC Returns lowercase hexits by default"
    ],
    "hash_hmac_file": [
        "string hash_hmac_file(string algo, string filename, string key[, bool raw_output = false])",
        "Generate a hash of a given file with a key using HMAC Returns lowercase hexits by default"
    ],
    "hash_init": [
        "resource hash_init(string algo[, int options, string key])",
        "Initialize a hashing context"
    ],
    "hash_update": [
        "bool hash_update(resource context, string data)",
        "Pump data into the hashing algorithm"
    ],
    "hash_update_file": [
        "bool hash_update_file(resource context, string filename[, resource context])",
        "Pump data into the hashing algorithm from a file"
    ],
    "hash_update_stream": [
        "int hash_update_stream(resource context, resource handle[, integer length])",
        "Pump data into the hashing algorithm from an open stream"
    ],
    "header": [
        "void header(string header [, bool replace, [int http_response_code]])",
        "Sends a raw HTTP header"
    ],
    "header_remove": [
        "void header_remove([string name])",
        "Removes an HTTP header previously set using header()"
    ],
    "headers_list": [
        "array headers_list(void)",
        "Return list of headers to be sent / already sent"
    ],
    "headers_sent": [
        "bool headers_sent([string &$file [, int &$line]])",
        "Returns true if headers have already been sent, false otherwise"
    ],
    "hebrev": [
        "string hebrev(string str [, int max_chars_per_line])",
        "Converts logical Hebrew text to visual text"
    ],
    "hebrevc": [
        "string hebrevc(string str [, int max_chars_per_line])",
        "Converts logical Hebrew text to visual text with newline conversion"
    ],
    "hexdec": [
        "int hexdec(string hexadecimal_number)",
        "Returns the decimal equivalent of the hexadecimal number"
    ],
    "highlight_file": [
        "bool highlight_file(string file_name [, bool return] )",
        "Syntax highlight a source file"
    ],
    "highlight_string": [
        "bool highlight_string(string string [, bool return] )",
        "Syntax highlight a string or optionally return it"
    ],
    "html_entity_decode": [
        "string html_entity_decode(string string [, int quote_style][, string charset])",
        "Convert all HTML entities to their applicable characters"
    ],
    "htmlentities": [
        "string htmlentities(string string [, int quote_style[, string charset[, bool double_encode]]])",
        "Convert all applicable characters to HTML entities"
    ],
    "htmlspecialchars": [
        "string htmlspecialchars(string string [, int quote_style[, string charset[, bool double_encode]]])",
        "Convert special characters to HTML entities"
    ],
    "htmlspecialchars_decode": [
        "string htmlspecialchars_decode(string string [, int quote_style])",
        "Convert special HTML entities back to characters"
    ],
    "http_build_query": [
        "string http_build_query(mixed formdata [, string prefix [, string arg_separator]])",
        "Generates a form-encoded query string from an associative array or object."
    ],
    "hypot": [
        "float hypot(float num1, float num2)",
        "Returns sqrt(num1*num1 + num2*num2)"
    ],
    "ibase_add_user": [
        "bool ibase_add_user(resource service_handle, string user_name, string password [, string first_name [, string middle_name [, string last_name]]])",
        "Add a user to security database"
    ],
    "ibase_affected_rows": [
        "int ibase_affected_rows( [ resource link_identifier ] )",
        "Returns the number of rows affected by the previous INSERT, UPDATE or DELETE statement"
    ],
    "ibase_backup": [
        "mixed ibase_backup(resource service_handle, string source_db, string dest_file [, int options [, bool verbose]])",
        "Initiates a backup task in the service manager and returns immediately"
    ],
    "ibase_blob_add": [
        "bool ibase_blob_add(resource blob_handle, string data)",
        "Add data into created blob"
    ],
    "ibase_blob_cancel": [
        "bool ibase_blob_cancel(resource blob_handle)",
        "Cancel creating blob"
    ],
    "ibase_blob_close": [
        "string ibase_blob_close(resource blob_handle)",
        "Close blob"
    ],
    "ibase_blob_create": [
        "resource ibase_blob_create([resource link_identifier])",
        "Create blob for adding data"
    ],
    "ibase_blob_echo": [
        "bool ibase_blob_echo([ resource link_identifier, ] string blob_id)",
        "Output blob contents to browser"
    ],
    "ibase_blob_get": [
        "string ibase_blob_get(resource blob_handle, int len)",
        "Get len bytes data from open blob"
    ],
    "ibase_blob_import": [
        "string ibase_blob_import([ resource link_identifier, ] resource file)",
        "Create blob, copy file in it, and close it"
    ],
    "ibase_blob_info": [
        "array ibase_blob_info([ resource link_identifier, ] string blob_id)",
        "Return blob length and other useful info"
    ],
    "ibase_blob_open": [
        "resource ibase_blob_open([ resource link_identifier, ] string blob_id)",
        "Open blob for retrieving data parts"
    ],
    "ibase_close": [
        "bool ibase_close([resource link_identifier])",
        "Close an InterBase connection"
    ],
    "ibase_commit": [
        "bool ibase_commit( resource link_identifier )",
        "Commit transaction"
    ],
    "ibase_commit_ret": [
        "bool ibase_commit_ret( resource link_identifier )",
        "Commit transaction and retain the transaction context"
    ],
    "ibase_connect": [
        "resource ibase_connect(string database [, string username [, string password [, string charset [, int buffers [, int dialect [, string role]]]]]])",
        "Open a connection to an InterBase database"
    ],
    "ibase_db_info": [
        "string ibase_db_info(resource service_handle, string db, int action [, int argument])",
        "Request statistics about a database"
    ],
    "ibase_delete_user": [
        "bool ibase_delete_user(resource service_handle, string user_name, string password [, string first_name [, string middle_name [, string last_name]]])",
        "Delete a user from security database"
    ],
    "ibase_drop_db": [
        "bool ibase_drop_db([resource link_identifier])",
        "Drop an InterBase database"
    ],
    "ibase_errcode": [
        "int ibase_errcode(void)",
        "Return error code"
    ],
    "ibase_errmsg": [
        "string ibase_errmsg(void)",
        "Return error message"
    ],
    "ibase_execute": [
        "mixed ibase_execute(resource query [, mixed bind_arg [, mixed bind_arg [, ...]]])",
        "Execute a previously prepared query"
    ],
    "ibase_fetch_assoc": [
        "array ibase_fetch_assoc(resource result [, int fetch_flags])",
        "Fetch a row  from the results of a query"
    ],
    "ibase_fetch_object": [
        "object ibase_fetch_object(resource result [, int fetch_flags])",
        "Fetch a object from the results of a query"
    ],
    "ibase_fetch_row": [
        "array ibase_fetch_row(resource result [, int fetch_flags])",
        "Fetch a row  from the results of a query"
    ],
    "ibase_field_info": [
        "array ibase_field_info(resource query_result, int field_number)",
        "Get information about a field"
    ],
    "ibase_free_event_handler": [
        "bool ibase_free_event_handler(resource event)",
        "Frees the event handler set by ibase_set_event_handler()"
    ],
    "ibase_free_query": [
        "bool ibase_free_query(resource query)",
        "Free memory used by a query"
    ],
    "ibase_free_result": [
        "bool ibase_free_result(resource result)",
        "Free the memory used by a result"
    ],
    "ibase_gen_id": [
        "int ibase_gen_id(string generator [, int increment [, resource link_identifier ]])",
        "Increments the named generator and returns its new value"
    ],
    "ibase_maintain_db": [
        "bool ibase_maintain_db(resource service_handle, string db, int action [, int argument])",
        "Execute a maintenance command on the database server"
    ],
    "ibase_modify_user": [
        "bool ibase_modify_user(resource service_handle, string user_name, string password [, string first_name [, string middle_name [, string last_name]]])",
        "Modify a user in security database"
    ],
    "ibase_name_result": [
        "bool ibase_name_result(resource result, string name)",
        "Assign a name to a result for use with ... WHERE CURRENT OF <name> statements"
    ],
    "ibase_num_fields": [
        "int ibase_num_fields(resource query_result)",
        "Get the number of fields in result"
    ],
    "ibase_num_params": [
        "int ibase_num_params(resource query)",
        "Get the number of params in a prepared query"
    ],
    "ibase_num_rows": [
        "int ibase_num_rows( resource result_identifier )",
        "Return the number of rows that are available in a result"
    ],
    "ibase_param_info": [
        "array ibase_param_info(resource query, int field_number)",
        "Get information about a parameter"
    ],
    "ibase_pconnect": [
        "resource ibase_pconnect(string database [, string username [, string password [, string charset [, int buffers [, int dialect [, string role]]]]]])",
        "Open a persistent connection to an InterBase database"
    ],
    "ibase_prepare": [
        "resource ibase_prepare(resource link_identifier[, string query [, resource trans_identifier ]])",
        "Prepare a query for later execution"
    ],
    "ibase_query": [
        "mixed ibase_query([resource link_identifier, [ resource link_identifier, ]] string query [, mixed bind_arg [, mixed bind_arg [, ...]]])",
        "Execute a query"
    ],
    "ibase_restore": [
        "mixed ibase_restore(resource service_handle, string source_file, string dest_db [, int options [, bool verbose]])",
        "Initiates a restore task in the service manager and returns immediately"
    ],
    "ibase_rollback": [
        "bool ibase_rollback( resource link_identifier )",
        "Rollback transaction"
    ],
    "ibase_rollback_ret": [
        "bool ibase_rollback_ret( resource link_identifier )",
        "Rollback transaction and retain the transaction context"
    ],
    "ibase_server_info": [
        "string ibase_server_info(resource service_handle, int action)",
        "Request information about a database server"
    ],
    "ibase_service_attach": [
        "resource ibase_service_attach(string host, string dba_username, string dba_password)",
        "Connect to the service manager"
    ],
    "ibase_service_detach": [
        "bool ibase_service_detach(resource service_handle)",
        "Disconnect from the service manager"
    ],
    "ibase_set_event_handler": [
        "resource ibase_set_event_handler([resource link_identifier,] callback handler, string event [, string event [, ...]])",
        "Register the callback for handling each of the named events"
    ],
    "ibase_trans": [
        "resource ibase_trans([int trans_args [, resource link_identifier [, ... ], int trans_args [, resource link_identifier [, ... ]] [, ...]]])",
        "Start a transaction over one or several databases"
    ],
    "ibase_wait_event": [
        "string ibase_wait_event([resource link_identifier,] string event [, string event [, ...]])",
        "Waits for any one of the passed Interbase events to be posted by the database, and returns its name"
    ],
    "iconv": [
        "string iconv(string in_charset, string out_charset, string str)",
        "Returns str converted to the out_charset character set"
    ],
    "iconv_get_encoding": [
        "mixed iconv_get_encoding([string type])",
        "Get internal encoding and output encoding for ob_iconv_handler()"
    ],
    "iconv_mime_decode": [
        "string iconv_mime_decode(string encoded_string [, int mode, string charset])",
        "Decodes a mime header field"
    ],
    "iconv_mime_decode_headers": [
        "array iconv_mime_decode_headers(string headers [, int mode, string charset])",
        "Decodes multiple mime header fields"
    ],
    "iconv_mime_encode": [
        "string iconv_mime_encode(string field_name, string field_value [, array preference])",
        "Composes a mime header field with field_name and field_value in a specified scheme"
    ],
    "iconv_set_encoding": [
        "bool iconv_set_encoding(string type, string charset)",
        "Sets internal encoding and output encoding for ob_iconv_handler()"
    ],
    "iconv_strlen": [
        "int iconv_strlen(string str [, string charset])",
        "Returns the character count of str"
    ],
    "iconv_strpos": [
        "int iconv_strpos(string haystack, string needle [, int offset [, string charset]])",
        "Finds position of first occurrence of needle within part of haystack beginning with offset"
    ],
    "iconv_strrpos": [
        "int iconv_strrpos(string haystack, string needle [, string charset])",
        "Finds position of last occurrence of needle within part of haystack beginning with offset"
    ],
    "iconv_substr": [
        "string iconv_substr(string str, int offset, [int length, string charset])",
        "Returns specified part of a string"
    ],
    "idate": [
        "int idate(string format [, int timestamp])",
        "Format a local time/date as integer"
    ],
    "idn_to_ascii": [
        "int idn_to_ascii(string domain[, int options])",
        "Converts an Unicode domain to ASCII representation, as defined in the IDNA RFC"
    ],
    "idn_to_utf8": [
        "int idn_to_utf8(string domain[, int options])",
        "Converts an ASCII representation of the domain to Unicode (UTF-8), as defined in the IDNA RFC"
    ],
    "ignore_user_abort": [
        "int ignore_user_abort([string value])",
        "Set whether we want to ignore a user abort event or not"
    ],
    "image2wbmp": [
        "bool image2wbmp(resource im [, string filename [, int threshold]])",
        "Output WBMP image to browser or file"
    ],
    "image_type_to_extension": [
        "string image_type_to_extension(int imagetype [, bool include_dot])",
        "Get file extension for image-type returned by getimagesize, exif_read_data, exif_thumbnail, exif_imagetype"
    ],
    "image_type_to_mime_type": [
        "string image_type_to_mime_type(int imagetype)",
        "Get Mime-Type for image-type returned by getimagesize, exif_read_data, exif_thumbnail, exif_imagetype"
    ],
    "imagealphablending": [
        "bool imagealphablending(resource im, bool on)",
        "Turn alpha blending mode on or off for the given image"
    ],
    "imageantialias": [
        "bool imageantialias(resource im, bool on)",
        "Should antialiased functions used or not"
    ],
    "imagearc": [
        "bool imagearc(resource im, int cx, int cy, int w, int h, int s, int e, int col)",
        "Draw a partial ellipse"
    ],
    "imagechar": [
        "bool imagechar(resource im, int font, int x, int y, string c, int col)",
        "Draw a character"
    ],
    "imagecharup": [
        "bool imagecharup(resource im, int font, int x, int y, string c, int col)",
        "Draw a character rotated 90 degrees counter-clockwise"
    ],
    "imagecolorallocate": [
        "int imagecolorallocate(resource im, int red, int green, int blue)",
        "Allocate a color for an image"
    ],
    "imagecolorallocatealpha": [
        "int imagecolorallocatealpha(resource im, int red, int green, int blue, int alpha)",
        "Allocate a color with an alpha level.  Works for true color and palette based images"
    ],
    "imagecolorat": [
        "int imagecolorat(resource im, int x, int y)",
        "Get the index of the color of a pixel"
    ],
    "imagecolorclosest": [
        "int imagecolorclosest(resource im, int red, int green, int blue)",
        "Get the index of the closest color to the specified color"
    ],
    "imagecolorclosestalpha": [
        "int imagecolorclosestalpha(resource im, int red, int green, int blue, int alpha)",
        "Find the closest matching colour with alpha transparency"
    ],
    "imagecolorclosesthwb": [
        "int imagecolorclosesthwb(resource im, int red, int green, int blue)",
        "Get the index of the color which has the hue, white and blackness nearest to the given color"
    ],
    "imagecolordeallocate": [
        "bool imagecolordeallocate(resource im, int index)",
        "De-allocate a color for an image"
    ],
    "imagecolorexact": [
        "int imagecolorexact(resource im, int red, int green, int blue)",
        "Get the index of the specified color"
    ],
    "imagecolorexactalpha": [
        "int imagecolorexactalpha(resource im, int red, int green, int blue, int alpha)",
        "Find exact match for colour with transparency"
    ],
    "imagecolormatch": [
        "bool imagecolormatch(resource im1, resource im2)",
        "Makes the colors of the palette version of an image more closely match the true color version"
    ],
    "imagecolorresolve": [
        "int imagecolorresolve(resource im, int red, int green, int blue)",
        "Get the index of the specified color or its closest possible alternative"
    ],
    "imagecolorresolvealpha": [
        "int imagecolorresolvealpha(resource im, int red, int green, int blue, int alpha)",
        "Resolve/Allocate a colour with an alpha level.  Works for true colour and palette based images"
    ],
    "imagecolorset": [
        "void imagecolorset(resource im, int col, int red, int green, int blue)",
        "Set the color for the specified palette index"
    ],
    "imagecolorsforindex": [
        "array imagecolorsforindex(resource im, int col)",
        "Get the colors for an index"
    ],
    "imagecolorstotal": [
        "int imagecolorstotal(resource im)",
        "Find out the number of colors in an image's palette"
    ],
    "imagecolortransparent": [
        "int imagecolortransparent(resource im [, int col])",
        "Define a color as transparent"
    ],
    "imageconvolution": [
        "resource imageconvolution(resource src_im, array matrix3x3, double div, double offset)",
        "Apply a 3x3 convolution matrix, using coefficient div and offset"
    ],
    "imagecopy": [
        "bool imagecopy(resource dst_im, resource src_im, int dst_x, int dst_y, int src_x, int src_y, int src_w, int src_h)",
        "Copy part of an image"
    ],
    "imagecopymerge": [
        "bool imagecopymerge(resource src_im, resource dst_im, int dst_x, int dst_y, int src_x, int src_y, int src_w, int src_h, int pct)",
        "Merge one part of an image with another"
    ],
    "imagecopymergegray": [
        "bool imagecopymergegray(resource src_im, resource dst_im, int dst_x, int dst_y, int src_x, int src_y, int src_w, int src_h, int pct)",
        "Merge one part of an image with another"
    ],
    "imagecopyresampled": [
        "bool imagecopyresampled(resource dst_im, resource src_im, int dst_x, int dst_y, int src_x, int src_y, int dst_w, int dst_h, int src_w, int src_h)",
        "Copy and resize part of an image using resampling to help ensure clarity"
    ],
    "imagecopyresized": [
        "bool imagecopyresized(resource dst_im, resource src_im, int dst_x, int dst_y, int src_x, int src_y, int dst_w, int dst_h, int src_w, int src_h)",
        "Copy and resize part of an image"
    ],
    "imagecreate": [
        "resource imagecreate(int x_size, int y_size)",
        "Create a new image"
    ],
    "imagecreatefromgd": [
        "resource imagecreatefromgd(string filename)",
        "Create a new image from GD file or URL"
    ],
    "imagecreatefromgd2": [
        "resource imagecreatefromgd2(string filename)",
        "Create a new image from GD2 file or URL"
    ],
    "imagecreatefromgd2part": [
        "resource imagecreatefromgd2part(string filename, int srcX, int srcY, int width, int height)",
        "Create a new image from a given part of GD2 file or URL"
    ],
    "imagecreatefromgif": [
        "resource imagecreatefromgif(string filename)",
        "Create a new image from GIF file or URL"
    ],
    "imagecreatefromjpeg": [
        "resource imagecreatefromjpeg(string filename)",
        "Create a new image from JPEG file or URL"
    ],
    "imagecreatefrompng": [
        "resource imagecreatefrompng(string filename)",
        "Create a new image from PNG file or URL"
    ],
    "imagecreatefromstring": [
        "resource imagecreatefromstring(string image)",
        "Create a new image from the image stream in the string"
    ],
    "imagecreatefromwbmp": [
        "resource imagecreatefromwbmp(string filename)",
        "Create a new image from WBMP file or URL"
    ],
    "imagecreatefromxbm": [
        "resource imagecreatefromxbm(string filename)",
        "Create a new image from XBM file or URL"
    ],
    "imagecreatefromxpm": [
        "resource imagecreatefromxpm(string filename)",
        "Create a new image from XPM file or URL"
    ],
    "imagecreatetruecolor": [
        "resource imagecreatetruecolor(int x_size, int y_size)",
        "Create a new true color image"
    ],
    "imagedashedline": [
        "bool imagedashedline(resource im, int x1, int y1, int x2, int y2, int col)",
        "Draw a dashed line"
    ],
    "imagedestroy": [
        "bool imagedestroy(resource im)",
        "Destroy an image"
    ],
    "imageellipse": [
        "bool imageellipse(resource im, int cx, int cy, int w, int h, int color)",
        "Draw an ellipse"
    ],
    "imagefill": [
        "bool imagefill(resource im, int x, int y, int col)",
        "Flood fill"
    ],
    "imagefilledarc": [
        "bool imagefilledarc(resource im, int cx, int cy, int w, int h, int s, int e, int col, int style)",
        "Draw a filled partial ellipse"
    ],
    "imagefilledellipse": [
        "bool imagefilledellipse(resource im, int cx, int cy, int w, int h, int color)",
        "Draw an ellipse"
    ],
    "imagefilledpolygon": [
        "bool imagefilledpolygon(resource im, array point, int num_points, int col)",
        "Draw a filled polygon"
    ],
    "imagefilledrectangle": [
        "bool imagefilledrectangle(resource im, int x1, int y1, int x2, int y2, int col)",
        "Draw a filled rectangle"
    ],
    "imagefilltoborder": [
        "bool imagefilltoborder(resource im, int x, int y, int border, int col)",
        "Flood fill to specific color"
    ],
    "imagefilter": [
        "bool imagefilter(resource src_im, int filtertype, [args] )",
        "Applies Filter an image using a custom angle"
    ],
    "imagefontheight": [
        "int imagefontheight(int font)",
        "Get font height"
    ],
    "imagefontwidth": [
        "int imagefontwidth(int font)",
        "Get font width"
    ],
    "imageftbbox": [
        "array imageftbbox(float size, float angle, string font_file, string text [, array extrainfo])",
        "Give the bounding box of a text using fonts via freetype2"
    ],
    "imagefttext": [
        "array imagefttext(resource im, float size, float angle, int x, int y, int col, string font_file, string text [, array extrainfo])",
        "Write text to the image using fonts via freetype2"
    ],
    "imagegammacorrect": [
        "bool imagegammacorrect(resource im, float inputgamma, float outputgamma)",
        "Apply a gamma correction to a GD image"
    ],
    "imagegd": [
        "bool imagegd(resource im [, string filename])",
        "Output GD image to browser or file"
    ],
    "imagegd2": [
        "bool imagegd2(resource im [, string filename, [, int chunk_size, [, int type]]])",
        "Output GD2 image to browser or file"
    ],
    "imagegif": [
        "bool imagegif(resource im [, string filename])",
        "Output GIF image to browser or file"
    ],
    "imagegrabscreen": [
        "resource imagegrabscreen()",
        "Grab a screenshot"
    ],
    "imagegrabwindow": [
        "resource imagegrabwindow(int window_handle [, int client_area])",
        "Grab a window or its client area using a windows handle (HWND property in COM instance)"
    ],
    "imageinterlace": [
        "int imageinterlace(resource im [, int interlace])",
        "Enable or disable interlace"
    ],
    "imageistruecolor": [
        "bool imageistruecolor(resource im)",
        "return true if the image uses truecolor"
    ],
    "imagejpeg": [
        "bool imagejpeg(resource im [, string filename [, int quality]])",
        "Output JPEG image to browser or file"
    ],
    "imagelayereffect": [
        "bool imagelayereffect(resource im, int effect)",
        "Set the alpha blending flag to use the bundled libgd layering effects"
    ],
    "imageline": [
        "bool imageline(resource im, int x1, int y1, int x2, int y2, int col)",
        "Draw a line"
    ],
    "imageloadfont": [
        "int imageloadfont(string filename)",
        "Load a new font"
    ],
    "imagepalettecopy": [
        "void imagepalettecopy(resource dst, resource src)",
        "Copy the palette from the src image onto the dst image"
    ],
    "imagepng": [
        "bool imagepng(resource im [, string filename])",
        "Output PNG image to browser or file"
    ],
    "imagepolygon": [
        "bool imagepolygon(resource im, array point, int num_points, int col)",
        "Draw a polygon"
    ],
    "imagepsbbox": [
        "array imagepsbbox(string text, resource font, int size [, int space, int tightness, float angle])",
        "Return the bounding box needed by a string if rasterized"
    ],
    "imagepscopyfont": [
        "int imagepscopyfont(int font_index)",
        "Make a copy of a font for purposes like extending or reenconding"
    ],
    "imagepsencodefont": [
        "bool imagepsencodefont(resource font_index, string filename)",
        "To change a fonts character encoding vector"
    ],
    "imagepsextendfont": [
        "bool imagepsextendfont(resource font_index, float extend)",
        "Extend or or condense (if extend < 1) a font"
    ],
    "imagepsfreefont": [
        "bool imagepsfreefont(resource font_index)",
        "Free memory used by a font"
    ],
    "imagepsloadfont": [
        "resource imagepsloadfont(string pathname)",
        "Load a new font from specified file"
    ],
    "imagepsslantfont": [
        "bool imagepsslantfont(resource font_index, float slant)",
        "Slant a font"
    ],
    "imagepstext": [
        "array imagepstext(resource image, string text, resource font, int size, int foreground, int background, int xcoord, int ycoord [, int space [, int tightness [, float angle [, int antialias])",
        "Rasterize a string over an image"
    ],
    "imagerectangle": [
        "bool imagerectangle(resource im, int x1, int y1, int x2, int y2, int col)",
        "Draw a rectangle"
    ],
    "imagerotate": [
        "resource imagerotate(resource src_im, float angle, int bgdcolor [, int ignoretransparent])",
        "Rotate an image using a custom angle"
    ],
    "imagesavealpha": [
        "bool imagesavealpha(resource im, bool on)",
        "Include alpha channel to a saved image"
    ],
    "imagesetbrush": [
        "bool imagesetbrush(resource image, resource brush)",
        "Set the brush image to $brush when filling $image with the \"IMG_COLOR_BRUSHED\" color"
    ],
    "imagesetpixel": [
        "bool imagesetpixel(resource im, int x, int y, int col)",
        "Set a single pixel"
    ],
    "imagesetstyle": [
        "bool imagesetstyle(resource im, array styles)",
        "Set the line drawing styles for use with imageline and IMG_COLOR_STYLED."
    ],
    "imagesetthickness": [
        "bool imagesetthickness(resource im, int thickness)",
        "Set line thickness for drawing lines, ellipses, rectangles, polygons etc."
    ],
    "imagesettile": [
        "bool imagesettile(resource image, resource tile)",
        "Set the tile image to $tile when filling $image with the \"IMG_COLOR_TILED\" color"
    ],
    "imagestring": [
        "bool imagestring(resource im, int font, int x, int y, string str, int col)",
        "Draw a string horizontally"
    ],
    "imagestringup": [
        "bool imagestringup(resource im, int font, int x, int y, string str, int col)",
        "Draw a string vertically - rotated 90 degrees counter-clockwise"
    ],
    "imagesx": [
        "int imagesx(resource im)",
        "Get image width"
    ],
    "imagesy": [
        "int imagesy(resource im)",
        "Get image height"
    ],
    "imagetruecolortopalette": [
        "void imagetruecolortopalette(resource im, bool ditherFlag, int colorsWanted)",
        "Convert a true colour image to a palette based image with a number of colours, optionally using dithering."
    ],
    "imagettfbbox": [
        "array imagettfbbox(float size, float angle, string font_file, string text)",
        "Give the bounding box of a text using TrueType fonts"
    ],
    "imagettftext": [
        "array imagettftext(resource im, float size, float angle, int x, int y, int col, string font_file, string text)",
        "Write text to the image using a TrueType font"
    ],
    "imagetypes": [
        "int imagetypes(void)",
        "Return the types of images supported in a bitfield - 1=GIF, 2=JPEG, 4=PNG, 8=WBMP, 16=XPM"
    ],
    "imagewbmp": [
        "bool imagewbmp(resource im [, string filename, [, int foreground]])",
        "Output WBMP image to browser or file"
    ],
    "imagexbm": [
        "int imagexbm(int im, string filename [, int foreground])",
        "Output XBM image to browser or file"
    ],
    "imap_8bit": [
        "string imap_8bit(string text)",
        "Convert an 8-bit string to a quoted-printable string"
    ],
    "imap_alerts": [
        "array imap_alerts(void)",
        "Returns an array of all IMAP alerts that have been generated since the last page load or since the last imap_alerts() call, whichever came last. The alert stack is cleared after imap_alerts() is called."
    ],
    "imap_append": [
        "bool imap_append(resource stream_id, string folder, string message [, string options [, string internal_date]])",
        "Append a new message to a specified mailbox"
    ],
    "imap_base64": [
        "string imap_base64(string text)",
        "Decode BASE64 encoded text"
    ],
    "imap_binary": [
        "string imap_binary(string text)",
        "Convert an 8bit string to a base64 string"
    ],
    "imap_body": [
        "string imap_body(resource stream_id, int msg_no [, int options])",
        "Read the message body"
    ],
    "imap_bodystruct": [
        "object imap_bodystruct(resource stream_id, int msg_no, string section)",
        "Read the structure of a specified body section of a specific message"
    ],
    "imap_check": [
        "object imap_check(resource stream_id)",
        "Get mailbox properties"
    ],
    "imap_clearflag_full": [
        "bool imap_clearflag_full(resource stream_id, string sequence, string flag [, int options])",
        "Clears flags on messages"
    ],
    "imap_close": [
        "bool imap_close(resource stream_id [, int options])",
        "Close an IMAP stream"
    ],
    "imap_createmailbox": [
        "bool imap_createmailbox(resource stream_id, string mailbox)",
        "Create a new mailbox"
    ],
    "imap_delete": [
        "bool imap_delete(resource stream_id, int msg_no [, int options])",
        "Mark a message for deletion"
    ],
    "imap_deletemailbox": [
        "bool imap_deletemailbox(resource stream_id, string mailbox)",
        "Delete a mailbox"
    ],
    "imap_errors": [
        "array imap_errors(void)",
        "Returns an array of all IMAP errors generated since the last page load, or since the last imap_errors() call, whichever came last. The error stack is cleared after imap_errors() is called."
    ],
    "imap_expunge": [
        "bool imap_expunge(resource stream_id)",
        "Permanently delete all messages marked for deletion"
    ],
    "imap_fetch_overview": [
        "array imap_fetch_overview(resource stream_id, string sequence [, int options])",
        "Read an overview of the information in the headers of the given message sequence"
    ],
    "imap_fetchbody": [
        "string imap_fetchbody(resource stream_id, int msg_no, string section [, int options])",
        "Get a specific body section"
    ],
    "imap_fetchheader": [
        "string imap_fetchheader(resource stream_id, int msg_no [, int options])",
        "Get the full unfiltered header for a message"
    ],
    "imap_fetchstructure": [
        "object imap_fetchstructure(resource stream_id, int msg_no [, int options])",
        "Read the full structure of a message"
    ],
    "imap_gc": [
        "bool imap_gc(resource stream_id, int flags)",
        "This function garbage collects (purges) the cache of entries of a specific type."
    ],
    "imap_get_quota": [
        "array imap_get_quota(resource stream_id, string qroot)",
        "Returns the quota set to the mailbox account qroot"
    ],
    "imap_get_quotaroot": [
        "array imap_get_quotaroot(resource stream_id, string mbox)",
        "Returns the quota set to the mailbox account mbox"
    ],
    "imap_getacl": [
        "array imap_getacl(resource stream_id, string mailbox)",
        "Gets the ACL for a given mailbox"
    ],
    "imap_getmailboxes": [
        "array imap_getmailboxes(resource stream_id, string ref, string pattern)",
        "Reads the list of mailboxes and returns a full array of objects containing name, attributes, and delimiter"
    ],
    "imap_getsubscribed": [
        "array imap_getsubscribed(resource stream_id, string ref, string pattern)",
        "Return a list of subscribed mailboxes, in the same format as imap_getmailboxes()"
    ],
    "imap_headerinfo": [
        "object imap_headerinfo(resource stream_id, int msg_no [, int from_length [, int subject_length [, string default_host]]])",
        "Read the headers of the message"
    ],
    "imap_headers": [
        "array imap_headers(resource stream_id)",
        "Returns headers for all messages in a mailbox"
    ],
    "imap_last_error": [
        "string imap_last_error(void)",
        "Returns the last error that was generated by an IMAP function. The error stack is NOT cleared after this call."
    ],
    "imap_list": [
        "array imap_list(resource stream_id, string ref, string pattern)",
        "Read the list of mailboxes"
    ],
    "imap_listscan": [
        "array imap_listscan(resource stream_id, string ref, string pattern, string content)",
        "Read list of mailboxes containing a certain string"
    ],
    "imap_lsub": [
        "array imap_lsub(resource stream_id, string ref, string pattern)",
        "Return a list of subscribed mailboxes"
    ],
    "imap_mail": [
        "bool imap_mail(string to, string subject, string message [, string additional_headers [, string cc [, string bcc [, string rpath]]]])",
        "Send an email message"
    ],
    "imap_mail_compose": [
        "string imap_mail_compose(array envelope, array body)",
        "Create a MIME message based on given envelope and body sections"
    ],
    "imap_mail_copy": [
        "bool imap_mail_copy(resource stream_id, string msglist, string mailbox [, int options])",
        "Copy specified message to a mailbox"
    ],
    "imap_mail_move": [
        "bool imap_mail_move(resource stream_id, string sequence, string mailbox [, int options])",
        "Move specified message to a mailbox"
    ],
    "imap_mailboxmsginfo": [
        "object imap_mailboxmsginfo(resource stream_id)",
        "Returns info about the current mailbox"
    ],
    "imap_mime_header_decode": [
        "array imap_mime_header_decode(string str)",
        "Decode mime header element in accordance with RFC 2047 and return array of objects containing 'charset' encoding and decoded 'text'"
    ],
    "imap_msgno": [
        "int imap_msgno(resource stream_id, int unique_msg_id)",
        "Get the sequence number associated with a UID"
    ],
    "imap_mutf7_to_utf8": [
        "string imap_mutf7_to_utf8(string in)",
        "Decode a modified UTF-7 string to UTF-8"
    ],
    "imap_num_msg": [
        "int imap_num_msg(resource stream_id)",
        "Gives the number of messages in the current mailbox"
    ],
    "imap_num_recent": [
        "int imap_num_recent(resource stream_id)",
        "Gives the number of recent messages in current mailbox"
    ],
    "imap_open": [
        "resource imap_open(string mailbox, string user, string password [, int options [, int n_retries]])",
        "Open an IMAP stream to a mailbox"
    ],
    "imap_ping": [
        "bool imap_ping(resource stream_id)",
        "Check if the IMAP stream is still active"
    ],
    "imap_qprint": [
        "string imap_qprint(string text)",
        "Convert a quoted-printable string to an 8-bit string"
    ],
    "imap_renamemailbox": [
        "bool imap_renamemailbox(resource stream_id, string old_name, string new_name)",
        "Rename a mailbox"
    ],
    "imap_reopen": [
        "bool imap_reopen(resource stream_id, string mailbox [, int options [, int n_retries]])",
        "Reopen an IMAP stream to a new mailbox"
    ],
    "imap_rfc822_parse_adrlist": [
        "array imap_rfc822_parse_adrlist(string address_string, string default_host)",
        "Parses an address string"
    ],
    "imap_rfc822_parse_headers": [
        "object imap_rfc822_parse_headers(string headers [, string default_host])",
        "Parse a set of mail headers contained in a string, and return an object similar to imap_headerinfo()"
    ],
    "imap_rfc822_write_address": [
        "string imap_rfc822_write_address(string mailbox, string host, string personal)",
        "Returns a properly formatted email address given the mailbox, host, and personal info"
    ],
    "imap_savebody": [
        "bool imap_savebody(resource stream_id, string|resource file, int msg_no[, string section = \"\"[, int options = 0]])",
        "Save a specific body section to a file"
    ],
    "imap_search": [
        "array imap_search(resource stream_id, string criteria [, int options [, string charset]])",
        "Return a list of messages matching the given criteria"
    ],
    "imap_set_quota": [
        "bool imap_set_quota(resource stream_id, string qroot, int mailbox_size)",
        "Will set the quota for qroot mailbox"
    ],
    "imap_setacl": [
        "bool imap_setacl(resource stream_id, string mailbox, string id, string rights)",
        "Sets the ACL for a given mailbox"
    ],
    "imap_setflag_full": [
        "bool imap_setflag_full(resource stream_id, string sequence, string flag [, int options])",
        "Sets flags on messages"
    ],
    "imap_sort": [
        "array imap_sort(resource stream_id, int criteria, int reverse [, int options [, string search_criteria [, string charset]]])",
        "Sort an array of message headers, optionally including only messages that meet specified criteria."
    ],
    "imap_status": [
        "object imap_status(resource stream_id, string mailbox, int options)",
        "Get status info from a mailbox"
    ],
    "imap_subscribe": [
        "bool imap_subscribe(resource stream_id, string mailbox)",
        "Subscribe to a mailbox"
    ],
    "imap_thread": [
        "array imap_thread(resource stream_id [, int options])",
        "Return threaded by REFERENCES tree"
    ],
    "imap_timeout": [
        "mixed imap_timeout(int timeout_type [, int timeout])",
        "Set or fetch imap timeout"
    ],
    "imap_uid": [
        "int imap_uid(resource stream_id, int msg_no)",
        "Get the unique message id associated with a standard sequential message number"
    ],
    "imap_undelete": [
        "bool imap_undelete(resource stream_id, int msg_no [, int flags])",
        "Remove the delete flag from a message"
    ],
    "imap_unsubscribe": [
        "bool imap_unsubscribe(resource stream_id, string mailbox)",
        "Unsubscribe from a mailbox"
    ],
    "imap_utf7_decode": [
        "string imap_utf7_decode(string buf)",
        "Decode a modified UTF-7 string"
    ],
    "imap_utf7_encode": [
        "string imap_utf7_encode(string buf)",
        "Encode a string in modified UTF-7"
    ],
    "imap_utf8": [
        "string imap_utf8(string mime_encoded_text)",
        "Convert a mime-encoded text to UTF-8"
    ],
    "imap_utf8_to_mutf7": [
        "string imap_utf8_to_mutf7(string in)",
        "Encode a UTF-8 string to modified UTF-7"
    ],
    "implode": [
        "string implode([string glue,] array pieces)",
        "Joins array elements placing glue string between items and return one string"
    ],
    "import_request_variables": [
        "bool import_request_variables(string types [, string prefix])",
        "Import GET/POST/Cookie variables into the global scope"
    ],
    "in_array": [
        "bool in_array(mixed needle, array haystack [, bool strict])",
        "Checks if the given value exists in the array"
    ],
    "include": [
        "bool include(string path)",
        "Includes and evaluates the specified file"
    ],
    "include_once": [
        "bool include_once(string path)",
        "Includes and evaluates the specified file"
    ],
    "inet_ntop": [
        "string inet_ntop(string in_addr)",
        "Converts a packed inet address to a human readable IP address string"
    ],
    "inet_pton": [
        "string inet_pton(string ip_address)",
        "Converts a human readable IP address to a packed binary string"
    ],
    "ini_get": [
        "string ini_get(string varname)",
        "Get a configuration option"
    ],
    "ini_get_all": [
        "array ini_get_all([string extension[, bool details = true]])",
        "Get all configuration options"
    ],
    "ini_restore": [
        "void ini_restore(string varname)",
        "Restore the value of a configuration option specified by varname"
    ],
    "ini_set": [
        "string ini_set(string varname, string newvalue)",
        "Set a configuration option, returns false on error and the old value of the configuration option on success"
    ],
    "interface_exists": [
        "bool interface_exists(string classname [, bool autoload])",
        "Checks if the class exists"
    ],
    "intl_error_name": [
        "string intl_error_name()",
        "* Return a string for a given error code.  * The string will be the same as the name of the error code constant."
    ],
    "intl_get_error_code": [
        "int intl_get_error_code()",
        "* Get code of the last occured error."
    ],
    "intl_get_error_message": [
        "string intl_get_error_message()",
        "* Get text description of the last occured error."
    ],
    "intl_is_failure": [
        "bool intl_is_failure()",
        "* Check whether the given error code indicates a failure.  * Returns true if it does, and false if the code  * indicates success or a warning."
    ],
    "intval": [
        "int intval(mixed var [, int base])",
        "Get the integer value of a variable using the optional base for the conversion"
    ],
    "ip2long": [
        "int ip2long(string ip_address)",
        "Converts a string containing an (IPv4) Internet Protocol dotted address into a proper address"
    ],
    "iptcembed": [
        "array iptcembed(string iptcdata, string jpeg_file_name [, int spool])",
        "Embed binary IPTC data into a JPEG image."
    ],
    "iptcparse": [
        "array iptcparse(string iptcdata)",
        "Parse binary IPTC-data into associative array"
    ],
    "is_a": [
        "bool is_a(object object, string class_name)",
        "Returns true if the object is of this class or has this class as one of its parents"
    ],
    "is_array": [
        "bool is_array(mixed var)",
        "Returns true if variable is an array"
    ],
    "is_bool": [
        "bool is_bool(mixed var)",
        "Returns true if variable is a boolean"
    ],
    "is_callable": [
        "bool is_callable(mixed var [, bool syntax_only [, string callable_name]])",
        "Returns true if var is callable."
    ],
    "is_dir": [
        "bool is_dir(string filename)",
        "Returns true if file is directory"
    ],
    "is_executable": [
        "bool is_executable(string filename)",
        "Returns true if file is executable"
    ],
    "is_file": [
        "bool is_file(string filename)",
        "Returns true if file is a regular file"
    ],
    "is_finite": [
        "bool is_finite(float val)",
        "Returns whether argument is finite"
    ],
    "is_float": [
        "bool is_float(mixed var)",
        "Returns true if variable is float point"
    ],
    "is_infinite": [
        "bool is_infinite(float val)",
        "Returns whether argument is infinite"
    ],
    "is_link": [
        "bool is_link(string filename)",
        "Returns true if file is symbolic link"
    ],
    "is_long": [
        "bool is_long(mixed var)",
        "Returns true if variable is a long (integer)"
    ],
    "is_nan": [
        "bool is_nan(float val)",
        "Returns whether argument is not a number"
    ],
    "is_null": [
        "bool is_null(mixed var)",
        "Returns true if variable is null"
    ],
    "is_numeric": [
        "bool is_numeric(mixed value)",
        "Returns true if value is a number or a numeric string"
    ],
    "is_object": [
        "bool is_object(mixed var)",
        "Returns true if variable is an object"
    ],
    "is_readable": [
        "bool is_readable(string filename)",
        "Returns true if file can be read"
    ],
    "is_resource": [
        "bool is_resource(mixed var)",
        "Returns true if variable is a resource"
    ],
    "is_scalar": [
        "bool is_scalar(mixed value)",
        "Returns true if value is a scalar"
    ],
    "is_string": [
        "bool is_string(mixed var)",
        "Returns true if variable is a string"
    ],
    "is_subclass_of": [
        "bool is_subclass_of(object object, string class_name)",
        "Returns true if the object has this class as one of its parents"
    ],
    "is_uploaded_file": [
        "bool is_uploaded_file(string path)",
        "Check if file was created by rfc1867 upload"
    ],
    "is_writable": [
        "bool is_writable(string filename)",
        "Returns true if file can be written"
    ],
    "isset": [
        "bool isset(mixed var [, mixed var])",
        "Determine whether a variable is set"
    ],
    "iterator_apply": [
        "int iterator_apply(Traversable it, mixed function [, mixed params])",
        "Calls a function for every element in an iterator"
    ],
    "iterator_count": [
        "int iterator_count(Traversable it)",
        "Count the elements in an iterator"
    ],
    "iterator_to_array": [
        "array iterator_to_array(Traversable it [, bool use_keys = true])",
        "Copy the iterator into an array"
    ],
    "jddayofweek": [
        "mixed jddayofweek(int juliandaycount [, int mode])",
        "Returns name or number of day of week from julian day count"
    ],
    "jdmonthname": [
        "string jdmonthname(int juliandaycount, int mode)",
        "Returns name of month for julian day count"
    ],
    "jdtofrench": [
        "string jdtofrench(int juliandaycount)",
        "Converts a julian day count to a french republic calendar date"
    ],
    "jdtogregorian": [
        "string jdtogregorian(int juliandaycount)",
        "Converts a julian day count to a gregorian calendar date"
    ],
    "jdtojewish": [
        "string jdtojewish(int juliandaycount [, bool hebrew [, int fl]])",
        "Converts a julian day count to a jewish calendar date"
    ],
    "jdtojulian": [
        "string jdtojulian(int juliandaycount)",
        "Convert a julian day count to a julian calendar date"
    ],
    "jdtounix": [
        "int jdtounix(int jday)",
        "Convert Julian Day to UNIX timestamp"
    ],
    "jewishtojd": [
        "int jewishtojd(int month, int day, int year)",
        "Converts a jewish calendar date to a julian day count"
    ],
    "join": [
        "string join(array src, string glue)",
        "An alias for implode"
    ],
    "jpeg2wbmp": [
        "bool jpeg2wbmp (string f_org, string f_dest, int d_height, int d_width, int threshold)",
        "Convert JPEG image to WBMP image"
    ],
    "json_decode": [
        "mixed json_decode(string json [, bool assoc [, long depth]])",
        "Decodes the JSON representation into a PHP value"
    ],
    "json_encode": [
        "string json_encode(mixed data [, int options])",
        "Returns the JSON representation of a value"
    ],
    "json_last_error": [
        "int json_last_error()",
        "Returns the error code of the last json_decode()."
    ],
    "juliantojd": [
        "int juliantojd(int month, int day, int year)",
        "Converts a julian calendar date to julian day count"
    ],
    "key": [
        "mixed key(array array_arg)",
        "Return the key of the element currently pointed to by the internal array pointer"
    ],
    "krsort": [
        "bool krsort(array &array_arg [, int sort_flags])",
        "Sort an array by key value in reverse order"
    ],
    "ksort": [
        "bool ksort(array &array_arg [, int sort_flags])",
        "Sort an array by key"
    ],
    "lcfirst": [
        "string lcfirst(string str)",
        "Make a string's first character lowercase"
    ],
    "lcg_value": [
        "float lcg_value()",
        "Returns a value from the combined linear congruential generator"
    ],
    "lchgrp": [
        "bool lchgrp(string filename, mixed group)",
        "Change symlink group"
    ],
    "ldap_8859_to_t61": [
        "string ldap_8859_to_t61(string value)",
        "Translate 8859 characters to t61 characters"
    ],
    "ldap_add": [
        "bool ldap_add(resource link, string dn, array entry)",
        "Add entries to LDAP directory"
    ],
    "ldap_bind": [
        "bool ldap_bind(resource link [, string dn [, string password]])",
        "Bind to LDAP directory"
    ],
    "ldap_compare": [
        "bool ldap_compare(resource link, string dn, string attr, string value)",
        "Determine if an entry has a specific value for one of its attributes"
    ],
    "ldap_connect": [
        "resource ldap_connect([string host [, int port [, string wallet [, string wallet_passwd [, int authmode]]]]])",
        "Connect to an LDAP server"
    ],
    "ldap_count_entries": [
        "int ldap_count_entries(resource link, resource result)",
        "Count the number of entries in a search result"
    ],
    "ldap_delete": [
        "bool ldap_delete(resource link, string dn)",
        "Delete an entry from a directory"
    ],
    "ldap_dn2ufn": [
        "string ldap_dn2ufn(string dn)",
        "Convert DN to User Friendly Naming format"
    ],
    "ldap_err2str": [
        "string ldap_err2str(int errno)",
        "Convert error number to error string"
    ],
    "ldap_errno": [
        "int ldap_errno(resource link)",
        "Get the current ldap error number"
    ],
    "ldap_error": [
        "string ldap_error(resource link)",
        "Get the current ldap error string"
    ],
    "ldap_explode_dn": [
        "array ldap_explode_dn(string dn, int with_attrib)",
        "Splits DN into its component parts"
    ],
    "ldap_first_attribute": [
        "string ldap_first_attribute(resource link, resource result_entry)",
        "Return first attribute"
    ],
    "ldap_first_entry": [
        "resource ldap_first_entry(resource link, resource result)",
        "Return first result id"
    ],
    "ldap_first_reference": [
        "resource ldap_first_reference(resource link, resource result)",
        "Return first reference"
    ],
    "ldap_free_result": [
        "bool ldap_free_result(resource result)",
        "Free result memory"
    ],
    "ldap_get_attributes": [
        "array ldap_get_attributes(resource link, resource result_entry)",
        "Get attributes from a search result entry"
    ],
    "ldap_get_dn": [
        "string ldap_get_dn(resource link, resource result_entry)",
        "Get the DN of a result entry"
    ],
    "ldap_get_entries": [
        "array ldap_get_entries(resource link, resource result)",
        "Get all result entries"
    ],
    "ldap_get_option": [
        "bool ldap_get_option(resource link, int option, mixed retval)",
        "Get the current value of various session-wide parameters"
    ],
    "ldap_get_values_len": [
        "array ldap_get_values_len(resource link, resource result_entry, string attribute)",
        "Get all values with lengths from a result entry"
    ],
    "ldap_list": [
        "resource ldap_list(resource|array link, string base_dn, string filter [, array attrs [, int attrsonly [, int sizelimit [, int timelimit [, int deref]]]]])",
        "Single-level search"
    ],
    "ldap_mod_add": [
        "bool ldap_mod_add(resource link, string dn, array entry)",
        "Add attribute values to current"
    ],
    "ldap_mod_del": [
        "bool ldap_mod_del(resource link, string dn, array entry)",
        "Delete attribute values"
    ],
    "ldap_mod_replace": [
        "bool ldap_mod_replace(resource link, string dn, array entry)",
        "Replace attribute values with new ones"
    ],
    "ldap_next_attribute": [
        "string ldap_next_attribute(resource link, resource result_entry)",
        "Get the next attribute in result"
    ],
    "ldap_next_entry": [
        "resource ldap_next_entry(resource link, resource result_entry)",
        "Get next result entry"
    ],
    "ldap_next_reference": [
        "resource ldap_next_reference(resource link, resource reference_entry)",
        "Get next reference"
    ],
    "ldap_parse_reference": [
        "bool ldap_parse_reference(resource link, resource reference_entry, array referrals)",
        "Extract information from reference entry"
    ],
    "ldap_parse_result": [
        "bool ldap_parse_result(resource link, resource result, int errcode, string matcheddn, string errmsg, array referrals)",
        "Extract information from result"
    ],
    "ldap_read": [
        "resource ldap_read(resource|array link, string base_dn, string filter [, array attrs [, int attrsonly [, int sizelimit [, int timelimit [, int deref]]]]])",
        "Read an entry"
    ],
    "ldap_rename": [
        "bool ldap_rename(resource link, string dn, string newrdn, string newparent, bool deleteoldrdn);",
        "Modify the name of an entry"
    ],
    "ldap_sasl_bind": [
        "bool ldap_sasl_bind(resource link [, string binddn [, string password [, string sasl_mech [, string sasl_realm [, string sasl_authc_id [, string sasl_authz_id [, string props]]]]]]])",
        "Bind to LDAP directory using SASL"
    ],
    "ldap_search": [
        "resource ldap_search(resource|array link, string base_dn, string filter [, array attrs [, int attrsonly [, int sizelimit [, int timelimit [, int deref]]]]])",
        "Search LDAP tree under base_dn"
    ],
    "ldap_set_option": [
        "bool ldap_set_option(resource link, int option, mixed newval)",
        "Set the value of various session-wide parameters"
    ],
    "ldap_set_rebind_proc": [
        "bool ldap_set_rebind_proc(resource link, string callback)",
        "Set a callback function to do re-binds on referral chasing."
    ],
    "ldap_sort": [
        "bool ldap_sort(resource link, resource result, string sortfilter)",
        "Sort LDAP result entries"
    ],
    "ldap_start_tls": [
        "bool ldap_start_tls(resource link)",
        "Start TLS"
    ],
    "ldap_t61_to_8859": [
        "string ldap_t61_to_8859(string value)",
        "Translate t61 characters to 8859 characters"
    ],
    "ldap_unbind": [
        "bool ldap_unbind(resource link)",
        "Unbind from LDAP directory"
    ],
    "leak": [
        "void leak(int num_bytes=3)",
        "Cause an intentional memory leak, for testing/debugging purposes"
    ],
    "levenshtein": [
        "int levenshtein(string str1, string str2[, int cost_ins, int cost_rep, int cost_del])",
        "Calculate Levenshtein distance between two strings"
    ],
    "libxml_clear_errors": [
        "void libxml_clear_errors()",
        "Clear last error from libxml"
    ],
    "libxml_disable_entity_loader": [
        "bool libxml_disable_entity_loader([boolean disable])",
        "Disable/Enable ability to load external entities"
    ],
    "libxml_get_errors": [
        "object libxml_get_errors()",
        "Retrieve array of errors"
    ],
    "libxml_get_last_error": [
        "object libxml_get_last_error()",
        "Retrieve last error from libxml"
    ],
    "libxml_set_streams_context": [
        "void libxml_set_streams_context(resource streams_context)",
        "Set the streams context for the next libxml document load or write"
    ],
    "libxml_use_internal_errors": [
        "bool libxml_use_internal_errors([boolean use_errors])",
        "Disable libxml errors and allow user to fetch error information as needed"
    ],
    "link": [
        "int link(string target, string link)",
        "Create a hard link"
    ],
    "linkinfo": [
        "int linkinfo(string filename)",
        "Returns the st_dev field of the UNIX C stat structure describing the link"
    ],
    "litespeed_request_headers": [
        "array litespeed_request_headers(void)",
        "Fetch all HTTP request headers"
    ],
    "litespeed_response_headers": [
        "array litespeed_response_headers(void)",
        "Fetch all HTTP response headers"
    ],
    "locale_accept_from_http": [
        "string locale_accept_from_http(string $http_accept)",
        null
    ],
    "locale_canonicalize": [
        "static string locale_canonicalize(Locale $loc, string $locale)",
        "* @param string $locale The locale string to canonicalize"
    ],
    "locale_filter_matches": [
        "boolean locale_filter_matches(string $langtag, string $locale[, bool $canonicalize])",
        "* Checks if a $langtag filter matches with $locale according to RFC 4647's basic filtering algorithm"
    ],
    "locale_get_all_variants": [
        "static array locale_get_all_variants($locale)",
        "* gets an array containing the list of variants, or null"
    ],
    "locale_get_default": [
        "static string locale_get_default( )",
        "Get default locale"
    ],
    "locale_get_keywords": [
        "static array locale_get_keywords(string $locale) {",
        "* return an associative array containing keyword-value  * pairs for this locale. The keys are keys to the array (doh!)"
    ],
    "locale_get_primary_language": [
        "static string locale_get_primary_language($locale)",
        "* gets the primary language for the $locale"
    ],
    "locale_get_region": [
        "static string locale_get_region($locale)",
        "* gets the region for the $locale"
    ],
    "locale_get_script": [
        "static string locale_get_script($locale)",
        "* gets the script for the $locale"
    ],
    "locale_lookup": [
        "string locale_lookup(array $langtag, string $locale[, bool $canonicalize[, string $default = null]])",
        "* Searchs the items in $langtag for the best match to the language * range"
    ],
    "locale_set_default": [
        "static string locale_set_default( string $locale )",
        "Set default locale"
    ],
    "localeconv": [
        "array localeconv(void)",
        "Returns numeric formatting information based on the current locale"
    ],
    "localtime": [
        "array localtime([int timestamp [, bool associative_array]])",
        "Returns the results of the C system call localtime as an associative array if the associative_array argument is set to 1 other wise it is a regular array"
    ],
    "log": [
        "float log(float number, [float base])",
        "Returns the natural logarithm of the number, or the base log if base is specified"
    ],
    "log10": [
        "float log10(float number)",
        "Returns the base-10 logarithm of the number"
    ],
    "log1p": [
        "float log1p(float number)",
        "Returns log(1 + number), computed in a way that accurate even when the value of number is close to zero"
    ],
    "long2ip": [
        "string long2ip(int proper_address)",
        "Converts an (IPv4) Internet network address into a string in Internet standard dotted format"
    ],
    "lstat": [
        "array lstat(string filename)",
        "Give information about a file or symbolic link"
    ],
    "ltrim": [
        "string ltrim(string str [, string character_mask])",
        "Strips whitespace from the beginning of a string"
    ],
    "mail": [
        "int mail(string to, string subject, string message [, string additional_headers [, string additional_parameters]])",
        "Send an email message"
    ],
    "max": [
        "mixed max(mixed arg1 [, mixed arg2 [, mixed ...]])",
        "Return the highest value in an array or a series of arguments"
    ],
    "mb_check_encoding": [
        "bool mb_check_encoding([string var[, string encoding]])",
        "Check if the string is valid for the specified encoding"
    ],
    "mb_convert_case": [
        "string mb_convert_case(string sourcestring, int mode [, string encoding])",
        "Returns a case-folded version of sourcestring"
    ],
    "mb_convert_encoding": [
        "string mb_convert_encoding(string str, string to-encoding [, mixed from-encoding])",
        "Returns converted string in desired encoding"
    ],
    "mb_convert_kana": [
        "string mb_convert_kana(string str [, string option] [, string encoding])",
        "Conversion between full-width character and half-width character (Japanese)"
    ],
    "mb_convert_variables": [
        "string mb_convert_variables(string to-encoding, mixed from-encoding, mixed vars [, ...])",
        "Converts the string resource in variables to desired encoding"
    ],
    "mb_decode_mimeheader": [
        "string mb_decode_mimeheader(string string)",
        "Decodes the MIME \"encoded-word\" in the string"
    ],
    "mb_decode_numericentity": [
        "string mb_decode_numericentity(string string, array convmap [, string encoding])",
        "Converts HTML numeric entities to character code"
    ],
    "mb_detect_encoding": [
        "string mb_detect_encoding(string str [, mixed encoding_list [, bool strict]])",
        "Encodings of the given string is returned (as a string)"
    ],
    "mb_detect_order": [
        "bool|array mb_detect_order([mixed encoding-list])",
        "Sets the current detect_order or Return the current detect_order as a array"
    ],
    "mb_encode_mimeheader": [
        "string mb_encode_mimeheader(string str [, string charset [, string transfer-encoding [, string linefeed [, int indent]]]])",
        "Converts the string to MIME \"encoded-word\" in the format of =?charset?(B|Q)?encoded_string?="
    ],
    "mb_encode_numericentity": [
        "string mb_encode_numericentity(string string, array convmap [, string encoding])",
        "Converts specified characters to HTML numeric entities"
    ],
    "mb_encoding_aliases": [
        "array mb_encoding_aliases(string encoding)",
        "Returns an array of the aliases of a given encoding name"
    ],
    "mb_ereg": [
        "int mb_ereg(string pattern, string string [, array registers])",
        "Regular expression match for multibyte string"
    ],
    "mb_ereg_match": [
        "bool mb_ereg_match(string pattern, string string [,string option])",
        "Regular expression match for multibyte string"
    ],
    "mb_ereg_replace": [
        "string mb_ereg_replace(string pattern, string replacement, string string [, string option])",
        "Replace regular expression for multibyte string"
    ],
    "mb_ereg_search": [
        "bool mb_ereg_search([string pattern[, string option]])",
        "Regular expression search for multibyte string"
    ],
    "mb_ereg_search_getpos": [
        "int mb_ereg_search_getpos(void)",
        "Get search start position"
    ],
    "mb_ereg_search_getregs": [
        "array mb_ereg_search_getregs(void)",
        "Get matched substring of the last time"
    ],
    "mb_ereg_search_init": [
        "bool mb_ereg_search_init(string string [, string pattern[, string option]])",
        "Initialize string and regular expression for search."
    ],
    "mb_ereg_search_pos": [
        "array mb_ereg_search_pos([string pattern[, string option]])",
        "Regular expression search for multibyte string"
    ],
    "mb_ereg_search_regs": [
        "array mb_ereg_search_regs([string pattern[, string option]])",
        "Regular expression search for multibyte string"
    ],
    "mb_ereg_search_setpos": [
        "bool mb_ereg_search_setpos(int position)",
        "Set search start position"
    ],
    "mb_eregi": [
        "int mb_eregi(string pattern, string string [, array registers])",
        "Case-insensitive regular expression match for multibyte string"
    ],
    "mb_eregi_replace": [
        "string mb_eregi_replace(string pattern, string replacement, string string)",
        "Case insensitive replace regular expression for multibyte string"
    ],
    "mb_get_info": [
        "mixed mb_get_info([string type])",
        "Returns the current settings of mbstring"
    ],
    "mb_http_input": [
        "mixed mb_http_input([string type])",
        "Returns the input encoding"
    ],
    "mb_http_output": [
        "string mb_http_output([string encoding])",
        "Sets the current output_encoding or returns the current output_encoding as a string"
    ],
    "mb_internal_encoding": [
        "string mb_internal_encoding([string encoding])",
        "Sets the current internal encoding or Returns the current internal encoding as a string"
    ],
    "mb_language": [
        "string mb_language([string language])",
        "Sets the current language or Returns the current language as a string"
    ],
    "mb_list_encodings": [
        "mixed mb_list_encodings()",
        "Returns an array of all supported entity encodings"
    ],
    "mb_output_handler": [
        "string mb_output_handler(string contents, int status)",
        "Returns string in output buffer converted to the http_output encoding"
    ],
    "mb_parse_str": [
        "bool mb_parse_str(string encoded_string [, array result])",
        "Parses GET/POST/COOKIE data and sets global variables"
    ],
    "mb_preferred_mime_name": [
        "string mb_preferred_mime_name(string encoding)",
        "Return the preferred MIME name (charset) as a string"
    ],
    "mb_regex_encoding": [
        "string mb_regex_encoding([string encoding])",
        "Returns the current encoding for regex as a string."
    ],
    "mb_regex_set_options": [
        "string mb_regex_set_options([string options])",
        "Set or get the default options for mbregex functions"
    ],
    "mb_send_mail": [
        "int mb_send_mail(string to, string subject, string message [, string additional_headers [, string additional_parameters]])",
        "*  Sends an email message with MIME scheme"
    ],
    "mb_split": [
        "array mb_split(string pattern, string string [, int limit])",
        "split multibyte string into array by regular expression"
    ],
    "mb_strcut": [
        "string mb_strcut(string str, int start [, int length [, string encoding]])",
        "Returns part of a string"
    ],
    "mb_strimwidth": [
        "string mb_strimwidth(string str, int start, int width [, string trimmarker [, string encoding]])",
        "Trim the string in terminal width"
    ],
    "mb_stripos": [
        "int mb_stripos(string haystack, string needle [, int offset [, string encoding]])",
        "Finds position of first occurrence of a string within another, case insensitive"
    ],
    "mb_stristr": [
        "string mb_stristr(string haystack, string needle[, bool part[, string encoding]])",
        "Finds first occurrence of a string within another, case insensitive"
    ],
    "mb_strlen": [
        "int mb_strlen(string str [, string encoding])",
        "Get character numbers of a string"
    ],
    "mb_strpos": [
        "int mb_strpos(string haystack, string needle [, int offset [, string encoding]])",
        "Find position of first occurrence of a string within another"
    ],
    "mb_strrchr": [
        "string mb_strrchr(string haystack, string needle[, bool part[, string encoding]])",
        "Finds the last occurrence of a character in a string within another"
    ],
    "mb_strrichr": [
        "string mb_strrichr(string haystack, string needle[, bool part[, string encoding]])",
        "Finds the last occurrence of a character in a string within another, case insensitive"
    ],
    "mb_strripos": [
        "int mb_strripos(string haystack, string needle [, int offset [, string encoding]])",
        "Finds position of last occurrence of a string within another, case insensitive"
    ],
    "mb_strrpos": [
        "int mb_strrpos(string haystack, string needle [, int offset [, string encoding]])",
        "Find position of last occurrence of a string within another"
    ],
    "mb_strstr": [
        "string mb_strstr(string haystack, string needle[, bool part[, string encoding]])",
        "Finds first occurrence of a string within another"
    ],
    "mb_strtolower": [
        "string mb_strtolower(string sourcestring [, string encoding])",
        "*  Returns a lowercased version of sourcestring"
    ],
    "mb_strtoupper": [
        "string mb_strtoupper(string sourcestring [, string encoding])",
        "*  Returns a uppercased version of sourcestring"
    ],
    "mb_strwidth": [
        "int mb_strwidth(string str [, string encoding])",
        "Gets terminal width of a string"
    ],
    "mb_substitute_character": [
        "mixed mb_substitute_character([mixed substchar])",
        "Sets the current substitute_character or returns the current substitute_character"
    ],
    "mb_substr": [
        "string mb_substr(string str, int start [, int length [, string encoding]])",
        "Returns part of a string"
    ],
    "mb_substr_count": [
        "int mb_substr_count(string haystack, string needle [, string encoding])",
        "Count the number of substring occurrences"
    ],
    "mcrypt_cbc": [
        "string mcrypt_cbc(int cipher, string key, string data, int mode, string iv)",
        "CBC crypt/decrypt data using key key with cipher cipher starting with iv"
    ],
    "mcrypt_cfb": [
        "string mcrypt_cfb(int cipher, string key, string data, int mode, string iv)",
        "CFB crypt/decrypt data using key key with cipher cipher starting with iv"
    ],
    "mcrypt_create_iv": [
        "string mcrypt_create_iv(int size, int source)",
        "Create an initialization vector (IV)"
    ],
    "mcrypt_decrypt": [
        "string mcrypt_decrypt(string cipher, string key, string data, string mode, string iv)",
        "OFB crypt/decrypt data using key key with cipher cipher starting with iv"
    ],
    "mcrypt_ecb": [
        "string mcrypt_ecb(int cipher, string key, string data, int mode, string iv)",
        "ECB crypt/decrypt data using key key with cipher cipher starting with iv"
    ],
    "mcrypt_enc_get_algorithms_name": [
        "string mcrypt_enc_get_algorithms_name(resource td)",
        "Returns the name of the algorithm specified by the descriptor td"
    ],
    "mcrypt_enc_get_block_size": [
        "int mcrypt_enc_get_block_size(resource td)",
        "Returns the block s