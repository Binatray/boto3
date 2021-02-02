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

define("ace/mode/c_cpp_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/doc_comment_highlight_rules","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var DocCommentHighlightRules = require("./doc_comment_highlight_rules").DocCommentHighlightRules;
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
var cFunctions = exports.cFunctions = "\\b(?:hypot(?:f|l)?|s(?:scanf|ystem|nprintf|ca(?:nf|lb(?:n(?:f|l)?|ln(?:f|l)?))|i(?:n(?:h(?:f|l)?|f|l)?|gn(?:al|bit))|tr(?:s(?:tr|pn)|nc(?:py|at|mp)|c(?:spn|hr|oll|py|at|mp)|to(?:imax|d|u(?:l(?:l)?|max)|k|f|l(?:d|l)?)|error|pbrk|ftime|len|rchr|xfrm)|printf|et(?:jmp|vbuf|locale|buf)|qrt(?:f|l)?|w(?:scanf|printf)|rand)|n(?:e(?:arbyint(?:f|l)?|xt(?:toward(?:f|l)?|after(?:f|l)?))|an(?:f|l)?)|c(?:s(?:in(?:h(?:f|l)?|f|l)?|qrt(?:f|l)?)|cos(?:h(?:f)?|f|l)?|imag(?:f|l)?|t(?:ime|an(?:h(?:f|l)?|f|l)?)|o(?:s(?:h(?:f|l)?|f|l)?|nj(?:f|l)?|pysign(?:f|l)?)|p(?:ow(?:f|l)?|roj(?:f|l)?)|e(?:il(?:f|l)?|xp(?:f|l)?)|l(?:o(?:ck|g(?:f|l)?)|earerr)|a(?:sin(?:h(?:f|l)?|f|l)?|cos(?:h(?:f|l)?|f|l)?|tan(?:h(?:f|l)?|f|l)?|lloc|rg(?:f|l)?|bs(?:f|l)?)|real(?:f|l)?|brt(?:f|l)?)|t(?:ime|o(?:upper|lower)|an(?:h(?:f|l)?|f|l)?|runc(?:f|l)?|gamma(?:f|l)?|mp(?:nam|file))|i(?:s(?:space|n(?:ormal|an)|cntrl|inf|digit|u(?:nordered|pper)|p(?:unct|rint)|finite|w(?:space|c(?:ntrl|type)|digit|upper|p(?:unct|rint)|lower|al(?:num|pha)|graph|xdigit|blank)|l(?:ower|ess(?:equal|greater)?)|al(?:num|pha)|gr(?:eater(?:equal)?|aph)|xdigit|blank)|logb(?:f|l)?|max(?:div|abs))|di(?:v|fftime)|_Exit|unget(?:c|wc)|p(?:ow(?:f|l)?|ut(?:s|c(?:har)?|wc(?:har)?)|error|rintf)|e(?:rf(?:c(?:f|l)?|f|l)?|x(?:it|p(?:2(?:f|l)?|f|l|m1(?:f|l)?)?))|v(?:s(?:scanf|nprintf|canf|printf|w(?:scanf|printf))|printf|f(?:scanf|printf|w(?:scanf|printf))|w(?:scanf|printf)|a_(?:start|copy|end|arg))|qsort|f(?:s(?:canf|e(?:tpos|ek))|close|tell|open|dim(?:f|l)?|p(?:classify|ut(?:s|c|w(?:s|c))|rintf)|e(?:holdexcept|set(?:e(?:nv|xceptflag)|round)|clearexcept|testexcept|of|updateenv|r(?:aiseexcept|ror)|get(?:e(?:nv|xceptflag)|round))|flush|w(?:scanf|ide|printf|rite)|loor(?:f|l)?|abs(?:f|l)?|get(?:s|c|pos|w(?:s|c))|re(?:open|e|ad|xp(?:f|l)?)|m(?:in(?:f|l)?|od(?:f|l)?|a(?:f|l|x(?:f|l)?)?))|l(?:d(?:iv|exp(?:f|l)?)|o(?:ngjmp|cal(?:time|econv)|g(?:1(?:p(?:f|l)?|0(?:f|l)?)|2(?:f|l)?|f|l|b(?:f|l)?)?)|abs|l(?:div|abs|r(?:int(?:f|l)?|ound(?:f|l)?))|r(?:int(?:f|l)?|ound(?:f|l)?)|gamma(?:f|l)?)|w(?:scanf|c(?:s(?:s(?:tr|pn)|nc(?:py|at|mp)|c(?:spn|hr|oll|py|at|mp)|to(?:imax|d|u(?:l(?:l)?|max)|k|f|l(?:d|l)?|mbs)|pbrk|ftime|len|r(?:chr|tombs)|xfrm)|to(?:b|mb)|rtomb)|printf|mem(?:set|c(?:hr|py|mp)|move))|a(?:s(?:sert|ctime|in(?:h(?:f|l)?|f|l)?)|cos(?:h(?:f|l)?|f|l)?|t(?:o(?:i|f|l(?:l)?)|exit|an(?:h(?:f|l)?|2(?:f|l)?|f|l)?)|b(?:s|ort))|g(?:et(?:s|c(?:har)?|env|wc(?:har)?)|mtime)|r(?:int(?:f|l)?|ound(?:f|l)?|e(?:name|alloc|wind|m(?:ove|quo(?:f|l)?|ainder(?:f|l)?))|a(?:nd|ise))|b(?:search|towc)|m(?:odf(?:f|l)?|em(?:set|c(?:hr|py|mp)|move)|ktime|alloc|b(?:s(?:init|towcs|rtowcs)|towc|len|r(?:towc|len))))\\b";

var c_cppHighlightRules = function() {

    var keywordControls = (
        "break|case|continue|default|do|else|for|goto|if|_Pragma|" +
        "return|switch|while|catch|operator|try|throw|using"
    );
    
    var storageType = (
        "asm|__asm__|auto|bool|_Bool|char|_Complex|double|enum|float|" +
        "_Imaginary|int|long|short|signed|struct|typedef|union|unsigned|void|" +
        "class|wchar_t|template|char16_t|char32_t"
    );

    var storageModifiers = (
        "const|extern|register|restrict|static|volatile|inline|private|" +
        "protected|public|friend|explicit|virtual|export|mutable|typename|" +
        "constexpr|new|delete|alignas|alignof|decltype|noexcept|thread_local"
    );

    var keywordOperators = (
        "and|and_eq|bitand|bitor|compl|not|not_eq|or|or_eq|typeid|xor|xor_eq|" +
        "const_cast|dynamic_cast|reinterpret_cast|static_cast|sizeof|namespace"
    );

    var builtinConstants = (
        "NULL|true|false|TRUE|FALSE|nullptr"
    );

    var keywordMapper = this.$keywords = this.createKeywordMapper({
        "keyword.control" : keywordControls,
        "storage.type" : storageType,
        "storage.modifier" : storageModifiers,
        "keyword.operator" : keywordOperators,
        "variable.language": "this",
        "constant.language": builtinConstants
    }, "identifier");

    var identifierRe = "[a-zA-Z\\$_\u00a1-\uffff][a-zA-Z\\d\\$_\u00a1-\uffff]*\\b";
    var escapeRe = /\\(?:['"?\\abfnrtv]|[0-7]{1,3}|x[a-fA-F\d]{2}|u[a-fA-F\d]{4}U[a-fA-F\d]{8}|.)/.source;
    var formatRe = "%"
          + /(\d+\$)?/.source // field (argument #)
          + /[#0\- +']*/.source // flags
          + /[,;:_]?/.source // separator character (AltiVec)
          + /((-?\d+)|\*(-?\d+\$)?)?/.source // minimum field width
          + /(\.((-?\d+)|\*(-?\d+\$)?)?)?/.source // precision
          + /(hh|h|ll|l|j|t|z|q|L|vh|vl|v|hv|hl)?/.source // length modifier
          + /(\[[^"\]]+\]|[diouxXDOUeEfFgGaACcSspn%])/.source; // conversion type

    this.$rules = { 
        "start" : [
            {
                token : "comment",
                regex : "//$",
                next : "start"
            }, {
                token : "comment",
                regex : "//",
                next : "singleLineComment"
            },
            DocCommentHighlightRules.getStartRule("doc-start"),
            {
                token : "comment", // multi line comment
                regex : "\\/\\*",
                next : "comment"
            }, {
                token : "string", // character
                regex : "'(?:" + escapeRe + "|.)?'"
            }, {
                token : "string.start",
                regex : '"', 
                stateName: "qqstring",
                next: [
                    { token: "string", regex: /\\\s*$/, next: "qqstring" },
                    { token: "constant.language.escape", regex: escapeRe },
                    { token: "constant.language.escape", regex: formatRe },
                    { token: "string.end", regex: '"|$', next: "start" },
                    { defaultToken: "string"}
                ]
            }, {
                token : "string.start",
                regex : 'R"\\(', 
                stateName: "rawString",
                next: [
                    { token: "string.end", regex: '\\)"', next: "start" },
                    { defaultToken: "string"}
                ]
            }, {
                token : "constant.numeric", // hex
                regex : "0[xX][0-9a-fA-F]+(L|l|UL|ul|u|U|F|f|ll|LL|ull|ULL)?\\b"
            }, {
                token : "constant.numeric", // float
                regex : "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?(L|l|UL|ul|u|U|F|f|ll|LL|ull|ULL)?\\b"
            }, {
                token : "keyword", // pre-compiler directives
                regex : "#\\s*(?:include|import|pragma|line|define|undef)\\b",
                next  : "directive"
            }, {
                token : "keyword", // special case pre-compiler directive
                regex : "#\\s*(?:endif|if|ifdef|else|elif|ifndef)\\b"
            }, {
                token : "support.function.C99.c",
                regex : cFunctions
            }, {
                token : keywordMapper,
                regex : "[a-zA-Z_$][a-zA-Z0-9_$]*"
            }, {
                token : "keyword.operator",
                regex : /--|\+\+|<<=|>>=|>>>=|<>|&&|\|\||\?:|[*%\/+\-&\^|~!<>=]=?/
            }, {
              token : "punctuation.operator",
              regex : "\\?|\\:|\\,|\\;|\\."
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
        "comment" : [
            {
                token : "comment", // closing comment
                regex : "\\*\\/",
                next : "start"
            }, {
                defaultToken : "comment"
            }
        ],
        "singleLineComment" : [
            {
                token : "comment",
                regex : /\\$/,
                next : "singleLineComment"
            }, {
                token : "comment",
                regex : /$/,
                next : "start"
            }, {
                defaultToken: "comment"
            }
        ],
        "directive" : [
            {
                token : "constant.other.multiline",
                regex : /\\/
            },
            {
                token : "constant.other.multiline",
                regex : /.*\\/
            },
            {
                token : "constant.other",
                regex : "\\s*<.+?>",
                next : "start"
            },
            {
                token : "constant.other", // single line
                regex : '\\s*["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]',
                next : "start"
            }, 
            {
                token : "constant.other", // single line
                regex : "\\s*['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']",
                next : "start"
            },
            {
                token : "constant.other",
                regex : /[^\\\/]+/,
                next : "start"
            }
        ]
    };

    this.embedRules(DocCommentHighlightRules, "doc-",
        [ DocCommentHighlightRules.getEndRule("start") ]);
    this.normalizeRules();
};

oop.inherits(c_cppHighlightRules, TextHighlightRules);

exports.c_cppHighlightRules = c_cppHighlightRules;
});

define("ace/mode/objectivec_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/doc_comment_highlight_rules","ace/mode/c_cpp_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var DocCommentHighlightRules = require("./doc_comment_highlight_rules").DocCommentHighlightRules;
var C_Highlight_File = require("./c_cpp_highlight_rules");
var CHighlightRules = C_Highlight_File.c_cppHighlightRules;

var ObjectiveCHighlightRules = function() {

    var escapedConstRe = "\\\\(?:[abefnrtv'\"?\\\\]|" + 
                         "[0-3]\\d{1,2}|" +
                         "[4-7]\\d?|" +
                         "222|" +
                         "x[a-zA-Z0-9]+)";

    var specialVariables = [{
            regex: "\\b_cmd\\b",
            token: "variable.other.selector.objc"
        }, {
            regex: "\\b(?:self|super)\\b",
            token: "variable.language.objc"
        }
    ];

    var cObj = new CHighlightRules();
    var cRules = cObj.getRules();

    this.$rules = {
    "start": [ 
        {
            token : "comment",
            regex : "\\/\\/.*$"
        },
        DocCommentHighlightRules.getStartRule("doc-start"),
        {
            token : "comment", // multi line comment
            regex : "\\/\\*",
            next : "comment"
        }, 
        {
            token: [ "storage.type.objc", "punctuation.definition.storage.type.objc", 
                       "entity.name.type.objc", "text", "entity.other.inherited-class.objc"
                     ],
            regex: "(@)(interface|protocol)(?!.+;)(\\s+[A-Za-z_][A-Za-z0-9_]*)(\\s*:\\s*)([A-Za-z]+)"
        },
        {
            token: [ "storage.type.objc" ],
            regex: "(@end)"
        },
        {
            token: [ "storage.type.objc", "entity.name.type.objc", 
                        "entity.other.inherited-class.objc"
                     ],
            regex: "(@implementation)(\\s+[A-Za-z_][A-Za-z0-9_]*)(\\s*?::\\s*(?:[A-Za-z][A-Za-z0-9]*))?"
        },
        {
            token: "string.begin.objc",
            regex: '@"',
            next: "constant_NSString"
        },
        {
            token: "storage.type.objc",
            regex: "\\bid\\s*<",
            next: "protocol_list"
        },
        {
            token: "keyword.control.macro.objc",
            regex: "\\bNS_DURING|NS_HANDLER|NS_ENDHANDLER\\b"
        },
        {
            token: ["punctuation.definition.keyword.objc", "keyword.control.exception.objc"],
            regex: "(@)(try|catch|finally|throw)\\b"
        },
        {
            token: ["punctuation.definition.keyword.objc", "keyword.other.objc"],
            regex: "(@)(defs|encode)\\b"
        },
        {
            token: ["storage.type.id.objc", "text"],
            regex: "(\\bid\\b)(\\s|\\n)?"
        },
        {
            token: "storage.type.objc",
            regex: "\\bIBOutlet|IBAction|BOOL|SEL|id|unichar|IMP|Class\\b"
        },
        {
            token: [ "punctuation.definition.storage.type.objc", "storage.type.objc"],
            regex: "(@)(class|protocol)\\b"
        },
        {
            token: [ "punctuation.definition.storage.type.objc", "punctuation"],
            regex: "(@selector)(\\s*\\()",
            next: "selectors"
        },
        {
            token: [ "punctuation.definition.storage.modifier.objc", "storage.modifier.objc"],
            regex: "(@)(synchronized|public|private|protected|package)\\b"
        },
        {
            token: "constant.language.objc",
            regex: "\\bYES|NO|Nil|nil\\b"
        },
        {
            token:  "support.variable.foundation",
            regex: "\\bNSApp\\b"
        },
        {
            token: [ "support.function.cocoa.leopard"],
            regex: "(?:\\b)(NS(?:Rect(?:ToCGRect|FromCGRect)|MakeCollectable|S(?:tringFromProtocol|ize(?:ToCGSize|FromCGSize))|Draw(?:NinePartImage|ThreePartImage)|P(?:oint(?:ToCGPoint|FromCGPoint)|rotocolFromString)|EventMaskFromType|Value))(?:\\b)"
        },
        {
            token: ["support.function.cocoa"],
            regex: "(?:\\b)(NS(?:R(?:ound(?:DownToMultipleOfPageSize|UpToMultipleOfPageSize)|un(?:CriticalAlertPanel(?:RelativeToWindow)?|InformationalAlertPanel(?:RelativeToWindow)?|AlertPanel(?:RelativeToWindow)?)|e(?:set(?:MapTable|HashTable)|c(?:ycleZone|t(?:Clip(?:List)?|F(?:ill(?:UsingOperation|List(?:UsingOperation|With(?:Grays|Colors(?:UsingOperation)?))?)?|romString))|ordAllocationEvent)|turnAddress|leaseAlertPanel|a(?:dPixel|l(?:MemoryAvailable|locateCollectable))|gisterServicesProvider)|angeFromString)|Get(?:SizeAndAlignment|CriticalAlertPanel|InformationalAlertPanel|UncaughtExceptionHandler|FileType(?:s)?|WindowServerMemory|AlertPanel)|M(?:i(?:n(?:X|Y)|d(?:X|Y))|ouseInRect|a(?:p(?:Remove|Get|Member|Insert(?:IfAbsent|KnownAbsent)?)|ke(?:R(?:ect|ange)|Size|Point)|x(?:Range|X|Y)))|B(?:itsPer(?:SampleFromDepth|PixelFromDepth)|e(?:stDepth|ep|gin(?:CriticalAlertSheet|InformationalAlertSheet|AlertSheet)))|S(?:ho(?:uldRetainWithZone|w(?:sServicesMenuItem|AnimationEffect))|tringFrom(?:R(?:ect|ange)|MapTable|S(?:ize|elector)|HashTable|Class|Point)|izeFromString|e(?:t(?:ShowsServicesMenuItem|ZoneName|UncaughtExceptionHandler|FocusRingStyle)|lectorFromString|archPathForDirectoriesInDomains)|wap(?:Big(?:ShortToHost|IntToHost|DoubleToHost|FloatToHost|Long(?:ToHost|LongToHost))|Short|Host(?:ShortTo(?:Big|Little)|IntTo(?:Big|Little)|DoubleTo(?:Big|Little)|FloatTo(?:Big|Little)|Long(?:To(?:Big|Little)|LongTo(?:Big|Little)))|Int|Double|Float|L(?:ittle(?:ShortToHost|IntToHost|DoubleToHost|FloatToHost|Long(?:ToHost|LongToHost))|ong(?:Long)?)))|H(?:ighlightRect|o(?:stByteOrder|meDirectory(?:ForUser)?)|eight|ash(?:Remove|Get|Insert(?:IfAbsent|KnownAbsent)?)|FSType(?:CodeFromFileType|OfFile))|N(?:umberOfColorComponents|ext(?:MapEnumeratorPair|HashEnumeratorItem))|C(?:o(?:n(?:tainsRect|vert(?:GlyphsToPackedGlyphs|Swapped(?:DoubleToHost|FloatToHost)|Host(?:DoubleToSwapped|FloatToSwapped)))|unt(?:MapTable|HashTable|Frames|Windows(?:ForContext)?)|py(?:M(?:emoryPages|apTableWithZone)|Bits|HashTableWithZone|Object)|lorSpaceFromDepth|mpare(?:MapTables|HashTables))|lassFromString|reate(?:MapTable(?:WithZone)?|HashTable(?:WithZone)?|Zone|File(?:namePboardType|ContentsPboardType)))|TemporaryDirectory|I(?:s(?:ControllerMarker|EmptyRect|FreedObject)|n(?:setRect|crementExtraRefCount|te(?:r(?:sect(?:sRect|ionR(?:ect|ange))|faceStyleForKey)|gralRect)))|Zone(?:Realloc|Malloc|Name|Calloc|Fr(?:omPointer|ee))|O(?:penStepRootDirectory|ffsetRect)|D(?:i(?:sableScreenUpdates|videRect)|ottedFrameRect|e(?:c(?:imal(?:Round|Multiply|S(?:tring|ubtract)|Normalize|Co(?:py|mpa(?:ct|re))|IsNotANumber|Divide|Power|Add)|rementExtraRefCountWasZero)|faultMallocZone|allocate(?:MemoryPages|Object))|raw(?:Gr(?:oove|ayBezel)|B(?:itmap|utton)|ColorTiledRects|TiledRects|DarkBezel|W(?:hiteBezel|indowBackground)|LightBezel))|U(?:serName|n(?:ionR(?:ect|ange)|registerServicesProvider)|pdateDynamicServices)|Java(?:Bundle(?:Setup|Cleanup)|Setup(?:VirtualMachine)?|Needs(?:ToLoadClasses|VirtualMachine)|ClassesF(?:orBundle|romPath)|ObjectNamedInPath|ProvidesClasses)|P(?:oint(?:InRect|FromString)|erformService|lanarFromDepth|ageSize)|E(?:n(?:d(?:MapTableEnumeration|HashTableEnumeration)|umerate(?:MapTable|HashTable)|ableScreenUpdates)|qual(?:R(?:ects|anges)|Sizes|Points)|raseRect|xtraRefCount)|F(?:ileTypeForHFSTypeCode|ullUserName|r(?:ee(?:MapTable|HashTable)|ame(?:Rect(?:WithWidth(?:UsingOperation)?)?|Address)))|Wi(?:ndowList(?:ForContext)?|dth)|Lo(?:cationInRange|g(?:v|PageSize)?)|A(?:ccessibility(?:R(?:oleDescription(?:ForUIElement)?|aiseBadArgumentException)|Unignored(?:Children(?:ForOnlyChild)?|Descendant|Ancestor)|PostNotification|ActionDescription)|pplication(?:Main|Load)|vailableWindowDepths|ll(?:MapTable(?:Values|Keys)|HashTableObjects|ocate(?:MemoryPages|Collectable|Object)))))(?:\\b)"
        },
        {
            token: ["support.class.cocoa.leopard"],
            regex: "(?:\\b)(NS(?:RuleEditor|G(?:arbageCollector|radient)|MapTable|HashTable|Co(?:ndition|llectionView(?:Item)?)|T(?:oolbarItemGroup|extInputClient|r(?:eeNode|ackingArea))|InvocationOperation|Operation(?:Queue)?|D(?:ictionaryController|ockTile)|P(?:ointer(?:Functions|Array)|athC(?:o(?:ntrol(?:Delegate)?|mponentCell)|ell(?:Delegate)?)|r(?:intPanelAccessorizing|edicateEditor(?:RowTemplate)?))|ViewController|FastEnumeration|Animat(?:ionContext|ablePropertyContainer)))(?:\\b)"
        },
        {
            token: ["support.class.cocoa"],
            regex: "(?:\\b)(NS(?:R(?:u(?:nLoop|ler(?:Marker|View))|e(?:sponder|cursiveLock|lativeSpecifier)|an(?:domSpecifier|geSpecifier))|G(?:etCommand|lyph(?:Generator|Storage|Info)|raphicsContext)|XML(?:Node|D(?:ocument|TD(?:Node)?)|Parser|Element)|M(?:iddleSpecifier|ov(?:ie(?:View)?|eCommand)|utable(?:S(?:tring|et)|C(?:haracterSet|opying)|IndexSet|D(?:ictionary|ata)|URLRequest|ParagraphStyle|A(?:ttributedString|rray))|e(?:ssagePort(?:NameServer)?|nu(?:Item(?:Cell)?|View)?|t(?:hodSignature|adata(?:Item|Query(?:ResultGroup|AttributeValueTuple)?)))|a(?:ch(?:BootstrapServer|Port)|trix))|B(?:itmapImageRep|ox|u(?:ndle|tton(?:Cell)?)|ezierPath|rowser(?:Cell)?)|S(?:hadow|c(?:anner|r(?:ipt(?:SuiteRegistry|C(?:o(?:ercionHandler|mmand(?:Description)?)|lassDescription)|ObjectSpecifier|ExecutionContext|WhoseTest)|oll(?:er|View)|een))|t(?:epper(?:Cell)?|atus(?:Bar|Item)|r(?:ing|eam))|imple(?:HorizontalTypesetter|CString)|o(?:cketPort(?:NameServer)?|und|rtDescriptor)|p(?:e(?:cifierTest|ech(?:Recognizer|Synthesizer)|ll(?:Server|Checker))|litView)|e(?:cureTextField(?:Cell)?|t(?:Command)?|archField(?:Cell)?|rializer|gmentedC(?:ontrol|ell))|lider(?:Cell)?|avePanel)|H(?:ost|TTP(?:Cookie(?:Storage)?|URLResponse)|elpManager)|N(?:ib(?:Con(?:nector|trolConnector)|OutletConnector)?|otification(?:Center|Queue)?|u(?:ll|mber(?:Formatter)?)|etService(?:Browser)?|ameSpecifier)|C(?:ha(?:ngeSpelling|racterSet)|o(?:n(?:stantString|nection|trol(?:ler)?|ditionLock)|d(?:ing|er)|unt(?:Command|edSet)|pying|lor(?:Space|P(?:ick(?:ing(?:Custom|Default)|er)|anel)|Well|List)?|m(?:p(?:oundPredicate|arisonPredicate)|boBox(?:Cell)?))|u(?:stomImageRep|rsor)|IImageRep|ell|l(?:ipView|o(?:seCommand|neCommand)|assDescription)|a(?:ched(?:ImageRep|URLResponse)|lendar(?:Date)?)|reateCommand)|T(?:hread|ypesetter|ime(?:Zone|r)|o(?:olbar(?:Item(?:Validations)?)?|kenField(?:Cell)?)|ext(?:Block|Storage|Container|Tab(?:le(?:Block)?)?|Input|View|Field(?:Cell)?|List|Attachment(?:Cell)?)?|a(?:sk|b(?:le(?:Header(?:Cell|View)|Column|View)|View(?:Item)?))|reeController)|I(?:n(?:dex(?:S(?:pecifier|et)|Path)|put(?:Manager|S(?:tream|erv(?:iceProvider|er(?:MouseTracker)?)))|vocation)|gnoreMisspelledWords|mage(?:Rep|Cell|View)?)|O(?:ut(?:putStream|lineView)|pen(?:GL(?:Context|Pixel(?:Buffer|Format)|View)|Panel)|bj(?:CTypeSerializationCallBack|ect(?:Controller)?))|D(?:i(?:st(?:antObject(?:Request)?|ributed(?:NotificationCenter|Lock))|ctionary|rectoryEnumerator)|ocument(?:Controller)?|e(?:serializer|cimalNumber(?:Behaviors|Handler)?|leteCommand)|at(?:e(?:Components|Picker(?:Cell)?|Formatter)?|a)|ra(?:wer|ggingInfo))|U(?:ser(?:InterfaceValidations|Defaults(?:Controller)?)|RL(?:Re(?:sponse|quest)|Handle(?:Client)?|C(?:onnection|ache|redential(?:Storage)?)|Download(?:Delegate)?|Prot(?:ocol(?:Client)?|ectionSpace)|AuthenticationChallenge(?:Sender)?)?|n(?:iqueIDSpecifier|doManager|archiver))|P(?:ipe|o(?:sitionalSpecifier|pUpButton(?:Cell)?|rt(?:Message|NameServer|Coder)?)|ICTImageRep|ersistentDocument|DFImageRep|a(?:steboard|nel|ragraphStyle|geLayout)|r(?:int(?:Info|er|Operation|Panel)|o(?:cessInfo|tocolChecker|perty(?:Specifier|ListSerialization)|gressIndicator|xy)|edicate))|E(?:numerator|vent|PSImageRep|rror|x(?:ception|istsCommand|pression))|V(?:iew(?:Animation)?|al(?:idated(?:ToobarItem|UserInterfaceItem)|ue(?:Transformer)?))|Keyed(?:Unarchiver|Archiver)|Qui(?:ckDrawView|tCommand)|F(?:ile(?:Manager|Handle|Wrapper)|o(?:nt(?:Manager|Descriptor|Panel)?|rm(?:Cell|atter)))|W(?:hoseSpecifier|indow(?:Controller)?|orkspace)|L(?:o(?:c(?:k(?:ing)?|ale)|gicalTest)|evelIndicator(?:Cell)?|ayoutManager)|A(?:ssertionHandler|nimation|ctionCell|ttributedString|utoreleasePool|TSTypesetter|ppl(?:ication|e(?:Script|Event(?:Manager|Descriptor)))|ffineTransform|lert|r(?:chiver|ray(?:Controller)?))))(?:\\b)"
        },
        {
            token: ["support.type.cocoa.leopard"],
            regex: "(?:\\b)(NS(?:R(?:u(?:nLoop|ler(?:Marker|View))|e(?:sponder|cursiveLock|lativeSpecifier)|an(?:domSpecifier|geSpecifier))|G(?:etCommand|lyph(?:Generator|Storage|Info)|raphicsContext)|XML(?:Node|D(?:ocument|TD(?:Node)?)|Parser|Element)|M(?:iddleSpecifier|ov(?:ie(?:View)?|eCommand)|utable(?:S(?:tring|et)|C(?:haracterSet|opying)|IndexSet|D(?:ictionary|ata)|URLRequest|ParagraphStyle|A(?:ttributedString|rray))|e(?:ssagePort(?:NameServer)?|nu(?:Item(?:Cell)?|View)?|t(?:hodSignature|adata(?:Item|Query(?:ResultGroup|AttributeValueTuple)?)))|a(?:ch(?:BootstrapServer|Port)|trix))|B(?:itmapImageRep|ox|u(?:ndle|tton(?:Cell)?)|ezierPath|rowser(?:Cell)?)|S(?:hadow|c(?:anner|r(?:ipt(?:SuiteRegistry|C(?:o(?:ercionHandler|mmand(?:Description)?)|lassDescription)|ObjectSpecifier|ExecutionContext|WhoseTest)|oll(?:er|View)|een))|t(?:epper(?:Cell)?|atus(?:Bar|Item)|r(?:ing|eam))|imple(?:HorizontalTypesetter|CString)|o(?:cketPort(?:NameServer)?|und|rtDescriptor)|p(?:e(?:cifierTest|ech(?:Recognizer|Synthesizer)|ll(?:Server|Checker))|litView)|e(?:cureTextField(?:Cell)?|t(?:Command)?|archField(?:Cell)?|rializer|gmentedC(?:ontrol|ell))|lider(?:Cell)?|avePanel)|H(?:ost|TTP(?:Cookie(?:Storage)?|URLResponse)|elpManager)|N(?:ib(?:Con(?:nector|trolConnector)|OutletConnector)?|otification(?:Center|Queue)?|u(?:ll|mber(?:Formatter)?)|etService(?:Browser)?|ameSpecifier)|C(?:ha(?:ngeSpelling|racterSet)|o(?:n(?:stantString|nection|trol(?:ler)?|ditionLock)|d(?:ing|er)|unt(?:Command|edSet)|pying|lor(?:Space|P(?:ick(?:ing(?:Custom|Default)|er)|anel)|Well|List)?|m(?:p(?:oundPredicate|arisonPredicate)|boBox(?:Cell)?))|u(?:stomImageRep|rsor)|IImageRep|ell|l(?:ipView|o(?:seCommand|neCommand)|assDescription)|a(?:ched(?:ImageRep|URLResponse)|lendar(?:Date)?)|reateCommand)|T(?:hread|ypesetter|ime(?:Zone|r)|o(?:olbar(?:Item(?:Validations)?)?|kenField(?:Cell)?)|ext(?:Block|Storage|Container|Tab(?:le(?:Block)?)?|Input|View|Field(?:Cell)?|List|Attachment(?:Cell)?)?|a(?:sk|b(?:le(?:Header(?:Cell|View)|Column|View)|View(?:Item)?))|reeController)|I(?:n(?:dex(?:S(?:pecifier|et)|Path)|put(?:Manager|S(?:tream|erv(?:iceProvider|er(?:MouseTracker)?)))|vocation)|gnoreMisspelledWords|mage(?:Rep|Cell|View)?)|O(?:ut(?:putStream|lineView)|pen(?:GL(?:Context|Pixel(?:Buffer|Format)|View)|Panel)|bj(?:CTypeSerializationCallBack|ect(?:Controller)?))|D(?:i(?:st(?:antObject(?:Request)?|ributed(?:NotificationCenter|Lock))|ctionary|rectoryEnumerator)|ocument(?:Controller)?|e(?:serializer|cimalNumber(?:Behaviors|Handler)?|leteCommand)|at(?:e(?:Components|Picker(?:Cell)?|Formatter)?|a)|ra(?:wer|ggingInfo))|U(?:ser(?:InterfaceValidations|Defaults(?:Controller)?)|RL(?:Re(?:sponse|quest)|Handle(?:Client)?|C(?:onnection|ache|redential(?:Storage)?)|Download(?:Delegate)?|Prot(?:ocol(?:Client)?|ectionSpace)|AuthenticationChallenge(?:Sender)?)?|n(?:iqueIDSpecifier|doManager|archiver))|P(?:ipe|o(?:sitionalSpecifier|pUpButton(?:Cell)?|rt(?:Message|NameServer|Coder)?)|ICTImageRep|ersistentDocument|DFImageRep|a(?:steboard|nel|ragraphStyle|geLayout)|r(?:int(?:Info|er|Operation|Panel)|o(?:cessInfo|tocolChecker|perty(?:Specifier|ListSerialization)|gressIndicator|xy)|edicate))|E(?:numerator|vent|PSImageRep|rror|x(?:ception|istsCommand|pression))|V(?:iew(?:Animation)?|al(?:idated(?:ToobarItem|UserInterfaceItem)|ue(?:Transformer)?))|Keyed(?:Unarchiver|Archiver)|Qui(?:ckDrawView|tCommand)|F(?:ile(?:Manager|Handle|Wrapper)|o(?:nt(?:Manager|Descriptor|Panel)?|rm(?:Cell|atter)))|W(?:hoseSpecifier|indow(?:Controller)?|orkspace)|L(?:o(?:c(?:k(?:ing)?|ale)|gicalTest)|evelIndicator(?:Cell)?|ayoutManager)|A(?:ssertionHandler|nimation|ctionCell|ttributedString|utoreleasePool|TSTypesetter|ppl(?:ication|e(?:Script|Event(?:Manager|Descriptor)))|ffineTransform|lert|r(?:chiver|ray(?:Controller)?))))(?:\\b)"
        },
        {
            token: ["support.class.quartz"],
            regex: "(?:\\b)(C(?:I(?:Sampler|Co(?:ntext|lor)|Image(?:Accumulator)?|PlugIn(?:Registration)?|Vector|Kernel|Filter(?:Generator|Shape)?)|A(?:Renderer|MediaTiming(?:Function)?|BasicAnimation|ScrollLayer|Constraint(?:LayoutManager)?|T(?:iledLayer|extLayer|rans(?:ition|action))|OpenGLLayer|PropertyAnimation|KeyframeAnimation|Layer|A(?:nimation(?:Group)?|ction))))(?:\\b)"
        },
        {
            token: ["support.type.quartz"],
            regex: "(?:\\b)(C(?:G(?:Float|Point|Size|Rect)|IFormat|AConstraintAttribute))(?:\\b)"
        },
        {
            token: ["support.type.cocoa"],
            regex: "(?:\\b)(NS(?:R(?:ect(?:Edge)?|ange)|G(?:lyph(?:Relation|LayoutMode)?|radientType)|M(?:odalSession|a(?:trixMode|p(?:Table|Enumerator)))|B(?:itmapImageFileType|orderType|uttonType|ezelStyle|ackingStoreType|rowserColumnResizingType)|S(?:cr(?:oll(?:er(?:Part|Arrow)|ArrowPosition)|eenAuxiliaryOpaque)|tringEncoding|ize|ocketNativeHandle|election(?:Granularity|Direction|Affinity)|wapped(?:Double|Float)|aveOperationType)|Ha(?:sh(?:Table|Enumerator)|ndler(?:2)?)|C(?:o(?:ntrol(?:Size|Tint)|mp(?:ositingOperation|arisonResult))|ell(?:State|Type|ImagePosition|Attribute))|T(?:hreadPrivate|ypesetterGlyphInfo|i(?:ckMarkPosition|tlePosition|meInterval)|o(?:ol(?:TipTag|bar(?:SizeMode|DisplayMode))|kenStyle)|IFFCompression|ext(?:TabType|Alignment)|ab(?:State|leViewDropOperation|ViewType)|rackingRectTag)|ImageInterpolation|Zone|OpenGL(?:ContextAuxiliary|PixelFormatAuxiliary)|D(?:ocumentChangeType|atePickerElementFlags|ra(?:werState|gOperation))|UsableScrollerParts|P(?:oint|r(?:intingPageOrder|ogressIndicator(?:Style|Th(?:ickness|readInfo))))|EventType|KeyValueObservingOptions|Fo(?:nt(?:SymbolicTraits|TraitMask|Action)|cusRingType)|W(?:indow(?:OrderingMode|Depth)|orkspace(?:IconCreationOptions|LaunchOptions)|ritingDirection)|L(?:ineBreakMode|ayout(?:Status|Direction))|A(?:nimation(?:Progress|Effect)|ppl(?:ication(?:TerminateReply|DelegateReply|PrintReply)|eEventManagerSuspensionID)|ffineTransformStruct|lertStyle)))(?:\\b)"
        },
        {
            token: ["support.constant.cocoa"],
            regex: "(?:\\b)(NS(?:NotFound|Ordered(?:Ascending|Descending|Same)))(?:\\b)"
        },
        {
            token: ["support.constant.notification.cocoa.leopard"],
            regex: "(?:\\b)(NS(?:MenuDidBeginTracking|ViewDidUpdateTrackingAreas)?Notification)(?:\\b)"
        },
        {
            token: ["support.constant.notification.cocoa"],
            regex: "(?:\\b)(NS(?:Menu(?:Did(?:RemoveItem|SendAction|ChangeItem|EndTracking|AddItem)|WillSendAction)|S(?:ystemColorsDidChange|plitView(?:DidResizeSubviews|WillResizeSubviews))|C(?:o(?:nt(?:extHelpModeDid(?:Deactivate|Activate)|rolT(?:intDidChange|extDid(?:BeginEditing|Change|EndEditing)))|lor(?:PanelColorDidChange|ListDidChange)|mboBox(?:Selection(?:IsChanging|DidChange)|Will(?:Dismiss|PopUp)))|lassDescriptionNeededForClass)|T(?:oolbar(?:DidRemoveItem|WillAddItem)|ext(?:Storage(?:DidProcessEditing|WillProcessEditing)|Did(?:BeginEditing|Change|EndEditing)|View(?:DidChange(?:Selection|TypingAttributes)|WillChangeNotifyingTextView))|ableView(?:Selection(?:IsChanging|DidChange)|ColumnDid(?:Resize|Move)))|ImageRepRegistryDidChange|OutlineView(?:Selection(?:IsChanging|DidChange)|ColumnDid(?:Resize|Move)|Item(?:Did(?:Collapse|Expand)|Will(?:Collapse|Expand)))|Drawer(?:Did(?:Close|Open)|Will(?:Close|Open))|PopUpButton(?:CellWillPopUp|WillPopUp)|View(?:GlobalFrameDidChange|BoundsDidChange|F(?:ocusDidChange|rameDidChange))|FontSetChanged|W(?:indow(?:Did(?:Resi(?:ze|gn(?:Main|Key))|M(?:iniaturize|ove)|Become(?:Main|Key)|ChangeScreen(?:|Profile)|Deminiaturize|Update|E(?:ndSheet|xpose))|Will(?:M(?:iniaturize|ove)|BeginSheet|Close))|orkspace(?:SessionDid(?:ResignActive|BecomeActive)|Did(?:Mount|TerminateApplication|Unmount|PerformFileOperation|Wake|LaunchApplication)|Will(?:Sleep|Unmount|PowerOff|LaunchApplication)))|A(?:ntialiasThresholdChanged|ppl(?:ication(?:Did(?:ResignActive|BecomeActive|Hide|ChangeScreenParameters|U(?:nhide|pdate)|FinishLaunching)|Will(?:ResignActive|BecomeActive|Hide|Terminate|U(?:nhide|pdate)|FinishLaunching))|eEventManagerWillProcessFirstEvent)))Notification)(?:\\b)"
        },
        {
            token: ["support.constant.cocoa.leopard"],
            regex: "(?:\\b)(NS(?:RuleEditor(?:RowType(?:Simple|Compound)|NestingMode(?:Si(?:ngle|mple)|Compound|List))|GradientDraws(?:BeforeStartingLocation|AfterEndingLocation)|M(?:inusSetExpressionType|a(?:chPortDeallocate(?:ReceiveRight|SendRight|None)|pTable(?:StrongMemory|CopyIn|ZeroingWeakMemory|ObjectPointerPersonality)))|B(?:oxCustom|undleExecutableArchitecture(?:X86|I386|PPC(?:64)?)|etweenPredicateOperatorType|ackgroundStyle(?:Raised|Dark|L(?:ight|owered)))|S(?:tring(?:DrawingTruncatesLastVisibleLine|EncodingConversion(?:ExternalRepresentation|AllowLossy))|ubqueryExpressionType|p(?:e(?:ech(?:SentenceBoundary|ImmediateBoundary|WordBoundary)|llingState(?:GrammarFlag|SpellingFlag))|litViewDividerStyleThi(?:n|ck))|e(?:rvice(?:RequestTimedOutError|M(?:iscellaneousError|alformedServiceDictionaryError)|InvalidPasteboardDataError|ErrorM(?:inimum|aximum)|Application(?:NotFoundError|LaunchFailedError))|gmentStyle(?:Round(?:Rect|ed)|SmallSquare|Capsule|Textured(?:Rounded|Square)|Automatic)))|H(?:UDWindowMask|ashTable(?:StrongMemory|CopyIn|ZeroingWeakMemory|ObjectPointerPersonality))|N(?:oModeColorPanel|etServiceNoAutoRename)|C(?:hangeRedone|o(?:ntainsPredicateOperatorType|l(?:orRenderingIntent(?:RelativeColorimetric|Saturation|Default|Perceptual|AbsoluteColorimetric)|lectorDisabledOption))|ellHit(?:None|ContentArea|TrackableArea|EditableTextArea))|T(?:imeZoneNameStyle(?:S(?:hort(?:Standard|DaylightSaving)|tandard)|DaylightSaving)|extFieldDatePickerStyle|ableViewSelectionHighlightStyle(?:Regular|SourceList)|racking(?:Mouse(?:Moved|EnteredAndExited)|CursorUpdate|InVisibleRect|EnabledDuringMouseDrag|A(?:ssumeInside|ctive(?:In(?:KeyWindow|ActiveApp)|WhenFirstResponder|Always))))|I(?:n(?:tersectSetExpressionType|dexedColorSpaceModel)|mageScale(?:None|Proportionally(?:Down|UpOrDown)|AxesIndependently))|Ope(?:nGLPFAAllowOfflineRenderers|rationQueue(?:DefaultMaxConcurrentOperationCount|Priority(?:High|Normal|Very(?:High|Low)|Low)))|D(?:iacriticInsensitiveSearch|ownloadsDirectory)|U(?:nionSetExpressionType|TF(?:16(?:BigEndianStringEncoding|StringEncoding|LittleEndianStringEncoding)|32(?:BigEndianStringEncoding|StringEncoding|LittleEndianStringEncoding)))|P(?:ointerFunctions(?:Ma(?:chVirtualMemory|llocMemory)|Str(?:ongMemory|uctPersonality)|C(?:StringPersonality|opyIn)|IntegerPersonality|ZeroingWeakMemory|O(?:paque(?:Memory|Personality)|bjectP(?:ointerPersonality|ersonality)))|at(?:hStyle(?:Standard|NavigationBar|PopUp)|ternColorSpaceModel)|rintPanelShows(?:Scaling|Copies|Orientation|P(?:a(?:perSize|ge(?:Range|SetupAccessory))|review)))|Executable(?:RuntimeMismatchError|NotLoadableError|ErrorM(?:inimum|aximum)|L(?:inkError|oadError)|ArchitectureMismatchError)|KeyValueObservingOption(?:Initial|Prior)|F(?:i(?:ndPanelSubstringMatchType(?:StartsWith|Contains|EndsWith|FullWord)|leRead(?:TooLargeError|UnknownStringEncodingError))|orcedOrderingSearch)|Wi(?:ndow(?:BackingLocation(?:MainMemory|Default|VideoMemory)|Sharing(?:Read(?:Only|Write)|None)|CollectionBehavior(?:MoveToActiveSpace|CanJoinAllSpaces|Default))|dthInsensitiveSearch)|AggregateExpressionType))(?:\\b)"
        },
        {
            token: ["support.constant.cocoa"],
            regex: "(?:\\b)(NS(?:R(?:GB(?:ModeColorPanel|ColorSpaceModel)|ight(?:Mouse(?:D(?:own(?:Mask)?|ragged(?:Mask)?)|Up(?:Mask)?)|T(?:ext(?:Movement|Alignment)|ab(?:sBezelBorder|StopType))|ArrowFunctionKey)|ound(?:RectBezelStyle|Bankers|ed(?:BezelStyle|TokenStyle|DisclosureBezelStyle)|Down|Up|Plain|Line(?:CapStyle|JoinStyle))|un(?:StoppedResponse|ContinuesResponse|AbortedResponse)|e(?:s(?:izableWindowMask|et(?:CursorRectsRunLoopOrdering|FunctionKey))|ce(?:ssedBezelStyle|iver(?:sCantHandleCommandScriptError|EvaluationScriptError))|turnTextMovement|doFunctionKey|quiredArgumentsMissingScriptError|l(?:evancyLevelIndicatorStyle|ative(?:Before|After))|gular(?:SquareBezelStyle|ControlSize)|moveTraitFontAction)|a(?:n(?:domSubelement|geDateMode)|tingLevelIndicatorStyle|dio(?:ModeMatrix|Button)))|G(?:IFFileType|lyph(?:Below|Inscribe(?:B(?:elow|ase)|Over(?:strike|Below)|Above)|Layout(?:WithPrevious|A(?:tAPoint|gainstAPoint))|A(?:ttribute(?:BidiLevel|Soft|Inscribe|Elastic)|bove))|r(?:ooveBorder|eaterThan(?:Comparison|OrEqualTo(?:Comparison|PredicateOperatorType)|PredicateOperatorType)|a(?:y(?:ModeColorPanel|ColorSpaceModel)|dient(?:None|Con(?:cave(?:Strong|Weak)|vex(?:Strong|Weak)))|phiteControlTint)))|XML(?:N(?:o(?:tationDeclarationKind|de(?:CompactEmptyElement|IsCDATA|OptionsNone|Use(?:SingleQuotes|DoubleQuotes)|Pre(?:serve(?:NamespaceOrder|C(?:haracterReferences|DATA)|DTD|Prefixes|E(?:ntities|mptyElements)|Quotes|Whitespace|A(?:ttributeOrder|ll))|ttyPrint)|ExpandEmptyElement))|amespaceKind)|CommentKind|TextKind|InvalidKind|D(?:ocument(?:X(?:MLKind|HTMLKind|Include)|HTMLKind|T(?:idy(?:XML|HTML)|extKind)|IncludeContentTypeDeclaration|Validate|Kind)|TDKind)|P(?:arser(?:GTRequiredError|XMLDeclNot(?:StartedError|FinishedError)|Mi(?:splaced(?:XMLDeclarationError|CDATAEndStringError)|xedContentDeclNot(?:StartedError|FinishedError))|S(?:t(?:andaloneValueError|ringNot(?:StartedError|ClosedError))|paceRequiredError|eparatorRequiredError)|N(?:MTOKENRequiredError|o(?:t(?:ationNot(?:StartedError|FinishedError)|WellBalancedError)|DTDError)|amespaceDeclarationError|AMERequiredError)|C(?:haracterRef(?:In(?:DTDError|PrologError|EpilogError)|AtEOFError)|o(?:nditionalSectionNot(?:StartedError|FinishedError)|mment(?:NotFinishedError|ContainsDoubleHyphenError))|DATANotFinishedError)|TagNameMismatchError|In(?:ternalError|valid(?:HexCharacterRefError|C(?:haracter(?:RefError|InEntityError|Error)|onditionalSectionError)|DecimalCharacterRefError|URIError|Encoding(?:NameError|Error)))|OutOfMemoryError|D(?:ocumentStartError|elegateAbortedParseError|OCTYPEDeclNotFinishedError)|U(?:RI(?:RequiredError|FragmentError)|n(?:declaredEntityError|parsedEntityError|knownEncodingError|finishedTagError))|P(?:CDATARequiredError|ublicIdentifierRequiredError|arsedEntityRef(?:MissingSemiError|NoNameError|In(?:Internal(?:SubsetError|Error)|PrologError|EpilogError)|AtEOFError)|r(?:ocessingInstructionNot(?:StartedError|FinishedError)|ematureDocumentEndError))|E(?:n(?:codingNotSupportedError|tity(?:Ref(?:In(?:DTDError|PrologError|EpilogError)|erence(?:MissingSemiError|WithoutNameError)|LoopError|AtEOFError)|BoundaryError|Not(?:StartedError|FinishedError)|Is(?:ParameterError|ExternalError)|ValueRequiredError))|qualExpectedError|lementContentDeclNot(?:StartedError|FinishedError)|xt(?:ernalS(?:tandaloneEntityError|ubsetNotFinishedError)|raContentError)|mptyDocumentError)|L(?:iteralNot(?:StartedError|FinishedError)|T(?:RequiredError|SlashRequiredError)|essThanSymbolInAttributeError)|Attribute(?:RedefinedError|HasNoValueError|Not(?:StartedError|FinishedError)|ListNot(?:StartedError|FinishedError)))|rocessingInstructionKind)|E(?:ntity(?:GeneralKind|DeclarationKind|UnparsedKind|P(?:ar(?:sedKind|ameterKind)|redefined))|lement(?:Declaration(?:MixedKind|UndefinedKind|E(?:lementKind|mptyKind)|Kind|AnyKind)|Kind))|Attribute(?:N(?:MToken(?:sKind|Kind)|otationKind)|CDATAKind|ID(?:Ref(?:sKind|Kind)|Kind)|DeclarationKind|En(?:tit(?:yKind|iesKind)|umerationKind)|Kind))|M(?:i(?:n(?:XEdge|iaturizableWindowMask|YEdge|uteCalendarUnit)|terLineJoinStyle|ddleSubelement|xedState)|o(?:nthCalendarUnit|deSwitchFunctionKey|use(?:Moved(?:Mask)?|E(?:ntered(?:Mask)?|ventSubtype|xited(?:Mask)?))|veToBezierPathElement|mentary(?:ChangeButton|Push(?:Button|InButton)|Light(?:Button)?))|enuFunctionKey|a(?:c(?:intoshInterfaceStyle|OSRomanStringEncoding)|tchesPredicateOperatorType|ppedRead|x(?:XEdge|YEdge))|ACHOperatingSystem)|B(?:MPFileType|o(?:ttomTabsBezelBorder|ldFontMask|rderlessWindowMask|x(?:Se(?:condary|parator)|OldStyle|Primary))|uttLineCapStyle|e(?:zelBorder|velLineJoinStyle|low(?:Bottom|Top)|gin(?:sWith(?:Comparison|PredicateOperatorType)|FunctionKey))|lueControlTint|ack(?:spaceCharacter|tabTextMovement|ingStore(?:Retained|Buffered|Nonretained)|TabCharacter|wardsSearch|groundTab)|r(?:owser(?:NoColumnResizing|UserColumnResizing|AutoColumnResizing)|eakFunctionKey))|S(?:h(?:ift(?:JISStringEncoding|KeyMask)|ow(?:ControlGlyphs|InvisibleGlyphs)|adowlessSquareBezelStyle)|y(?:s(?:ReqFunctionKey|tem(?:D(?:omainMask|efined(?:Mask)?)|FunctionKey))|mbolStringEncoding)|c(?:a(?:nnedOption|le(?:None|ToFit|Proportionally))|r(?:oll(?:er(?:NoPart|Increment(?:Page|Line|Arrow)|Decrement(?:Page|Line|Arrow)|Knob(?:Slot)?|Arrows(?:M(?:inEnd|axEnd)|None|DefaultSetting))|Wheel(?:Mask)?|LockFunctionKey)|eenChangedEventType))|t(?:opFunctionKey|r(?:ingDrawing(?:OneShot|DisableScreenFontSubstitution|Uses(?:DeviceMetrics|FontLeading|LineFragmentOrigin))|eam(?:Status(?:Reading|NotOpen|Closed|Open(?:ing)?|Error|Writing|AtEnd)|Event(?:Has(?:BytesAvailable|SpaceAvailable)|None|OpenCompleted|E(?:ndEncountered|rrorOccurred)))))|i(?:ngle(?:DateMode|UnderlineStyle)|ze(?:DownFontAction|UpFontAction))|olarisOperatingSystem|unOSOperatingSystem|pecialPageOrder|e(?:condCalendarUnit|lect(?:By(?:Character|Paragraph|Word)|i(?:ng(?:Next|Previous)|onAffinity(?:Downstream|Upstream))|edTab|FunctionKey)|gmentSwitchTracking(?:Momentary|Select(?:One|Any)))|quareLineCapStyle|witchButton|ave(?:ToOperation|Op(?:tions(?:Yes|No|Ask)|eration)|AsOperation)|mall(?:SquareBezelStyle|C(?:ontrolSize|apsFontMask)|IconButtonBezelStyle))|H(?:ighlightModeMatrix|SBModeColorPanel|o(?:ur(?:Minute(?:SecondDatePickerElementFlag|DatePickerElementFlag)|CalendarUnit)|rizontalRuler|meFunctionKey)|TTPCookieAcceptPolicy(?:Never|OnlyFromMainDocumentDomain|Always)|e(?:lp(?:ButtonBezelStyle|KeyMask|FunctionKey)|avierFontAction)|PUXOperatingSystem)|Year(?:MonthDa(?:yDatePickerElementFlag|tePickerElementFlag)|CalendarUnit)|N(?:o(?:n(?:StandardCharacterSetFontMask|ZeroWindingRule|activatingPanelMask|LossyASCIIStringEncoding)|Border|t(?:ification(?:SuspensionBehavior(?:Hold|Coalesce|D(?:eliverImmediately|rop))|NoCoalescing|CoalescingOn(?:Sender|Name)|DeliverImmediately|PostToAllSessions)|PredicateType|EqualToPredicateOperatorType)|S(?:cr(?:iptError|ollerParts)|ubelement|pecifierError)|CellMask|T(?:itle|opLevelContainersSpecifierError|abs(?:BezelBorder|NoBorder|LineBorder))|I(?:nterfaceStyle|mage)|UnderlineStyle|FontChangeAction)|u(?:ll(?:Glyph|CellType)|m(?:eric(?:Search|PadKeyMask)|berFormatter(?:Round(?:Half(?:Down|Up|Even)|Ceiling|Down|Up|Floor)|Behavior(?:10|Default)|S(?:cientificStyle|pellOutStyle)|NoStyle|CurrencyStyle|DecimalStyle|P(?:ercentStyle|ad(?:Before(?:Suffix|Prefix)|After(?:Suffix|Prefix))))))|e(?:t(?:Services(?:BadArgumentError|NotFoundError|C(?:ollisionError|ancelledError)|TimeoutError|InvalidError|UnknownError|ActivityInProgress)|workDomainMask)|wlineCharacter|xt(?:StepInterfaceStyle|FunctionKey))|EXTSTEPStringEncoding|a(?:t(?:iveShortGlyphPacking|uralTextAlignment)|rrowFontMask))|C(?:hange(?:ReadOtherContents|GrayCell(?:Mask)?|BackgroundCell(?:Mask)?|Cleared|Done|Undone|Autosaved)|MYK(?:ModeColorPanel|ColorSpaceModel)|ircular(?:BezelStyle|Slider)|o(?:n(?:stantValueExpressionType|t(?:inuousCapacityLevelIndicatorStyle|entsCellMask|ain(?:sComparison|erSpecifierError)|rol(?:Glyph|KeyMask))|densedFontMask)|lor(?:Panel(?:RGBModeMask|GrayModeMask|HSBModeMask|C(?:MYKModeMask|olorListModeMask|ustomPaletteModeMask|rayonModeMask)|WheelModeMask|AllModesMask)|ListModeColorPanel)|reServiceDirectory|m(?:p(?:osite(?:XOR|Source(?:In|O(?:ut|ver)|Atop)|Highlight|C(?:opy|lear)|Destination(?:In|O(?:ut|ver)|Atop)|Plus(?:Darker|Lighter))|ressedFontMask)|mandKeyMask))|u(?:stom(?:SelectorPredicateOperatorType|PaletteModeColorPanel)|r(?:sor(?:Update(?:Mask)?|PointingDevice)|veToBezierPathElement))|e(?:nterT(?:extAlignment|abStopType)|ll(?:State|