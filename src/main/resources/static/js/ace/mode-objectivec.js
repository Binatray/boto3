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
            regex: "(?:\\b)(NS(?:R(?:u(?:nLoop|ler(?:Marker|View))|e(?:sponder|cursiveLock|lativeSpecifier)|an(?:domSpecifier|geSpecifier))|G(?:etCommand|lyph(?:Generator|Storage|Info)|raphicsContext)|XML(?:Node|D(?:ocument|TD(?:Node)?)|Parser|Element)|M(?:iddleSpecifier|ov(?:ie(?:View)?|eCommand)|utable(?:S(?:tring|et)|C(?:haracterSet|opying)|IndexSet|D(?:ictionary|ata)|URLRequest|ParagraphStyle|A(?:ttributedString|rray))|e(?:ssagePort(?:NameServer)?|nu(?:Item(?:Cell)?|View)?|t(?:hodSignature|adata(?:Item|Query(?:ResultGroup|AttributeValueTuple)?)))|a(?:ch(?:BootstrapServer|Port)|trix))|B(?:itmapImageRep|ox|u(?:ndle|tton(?:Cell)?)|ezierPath|rowser(?:Cell)?)|S(?:hadow|c(?:anner|r(?:ipt(?:SuiteRegistry|C(?:o(?:ercionHandler|mmand(?:Description)?)|lassDescription)|ObjectSpecifier|ExecutionContext|WhoseTest)|oll(?:er|View)|een))|t(?:epper(?:Cell)?|atus(?:Bar|Item)|r(?:ing|eam))|imple(?:HorizontalTypesetter|CString)|o(?:cketPort(?:NameServer)?|und|rtDescriptor)|p(?:e(?:cifierTest|ech(?:Recognizer|Synthesizer)|ll(?:Server|Checker))|litView)|e(?:cureTextField(?:Cell)?|t(?:Command)?|archField(?:Cell)?|rializer|gmentedC(?:ontrol|ell))|lider(?:Cell)?|avePanel)|H(?:ost|TTP(?:Cookie(?:Storage)?|URLResponse)|elpManager)|N(?:ib(?:Con(?:nector|trolConnector)|OutletConnector)?|otification(?:Center|Queue)?|u(?:ll|mber(?:Formatter)?)|etService(?:Browser)?|ameSpecifier)|C(?:ha(?:ngeSpelling|racterSet)|o(?:n(?:stantString|nection|trol(?:ler)?|ditionLock)|d(?:ing|er)|unt(?:Command|edSet)|pying|lor(?:Space|P(?:ick(?:ing(?:Custom|Default)|er)|anel)|Well|List)?|m(?:p(?:oundPredicate|arisonPredicate)|boBox(?:Cell)?))|u(?:stomImageRep|rsor)|IImageRep|ell|l(?:ipView|o(?:seCommand|neCommand)|assDescription)|a(?:ched(?:ImageRep|URLResponse)|lendar(?:Date)?)|reateCommand)|T(?:hread|ypesetter|ime(?:Zone|r)|o(?:olbar(?:Item(?:Validations)?)?|kenField(?:Cell)?)|ext(?:Block|Storage|Container|Tab(?:le(?:Block)?)?|Input|View|Field(?:Cell)?|List|Attachment(?:Cell)?)?|a(?:sk|b(?:le(?:Header(?:Cell|View)|Column|View)|View(?:Item)?))|reeController)|I(?:n(?:dex(?:S(?:pecifier|et)|Path)|put(?:Manager|S(?:tream|erv(?:iceProvider|er(?:MouseTracker)?)))|vocation)|gnoreMisspelledWords|mage(?:Rep|Cell|View)?)|O(?:ut(?:putStream|lineView)|pen(?:GL(?:Context|Pixel(?:Buffer|Format)|View)|Panel)|bj(?:CTypeSerializationCallBack|ect(?:Controller)?))|D(?:i(?:st(?:antObject(?:Request)?|ributed(?:NotificationCenter|Lock))|ctionary|rectoryEnumerator)|ocument(?:Controller)?|e(?:serializer|cimalNumber(?:Behaviors|Handler)?|leteCommand)|at(?:e(?:Components|Picker(?:Cell)?|Formatter)?|a)|ra(?:wer|ggingInfo))|U(?:ser(?:InterfaceValidations|Defaults(?:Controller)?)|RL(?:Re(?:sponse|quest)|Handle(?:Client)?|C(?:onnection|ache|redential(?:Storage)?)|Download(?:Delegate)?|Prot(?:ocol(?:Client)?|ectionSpace)|AuthenticationChallenge(?:Sender)?)?|n(?:iqueIDSpecifier|doManager|archiver))|P(?:ipe|o(?:sitionalSpecifier|pUpButton(?:Cell)?|rt(?:Message|NameServer|Coder)?)|ICTImageRep|ersistentDocument|DFImageRep|a(?:steboard|nel|ragraphStyle|geLayout)|r(?:int(?:Info|er|Operation|Panel)|o(?:cessInfo|tocolChecker|pe