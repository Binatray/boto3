define("ace/ext/menu_tools/overlay_page",["require","exports","module","ace/lib/dom"], function(require, exports, module) {
'use strict';
var dom = require("../../lib/dom");
var cssText = "#ace_settingsmenu, #kbshortcutmenu {\
background-color: #F7F7F7;\
color: black;\
box-shadow: -5px 4px 5px rgba(126, 126, 126, 0.55);\
padding: 1em 0.5em 2em 1em;\
overflow: auto;\
position: absolute;\
margin: 0;\
bottom: 0;\
right: 0;\
top: 0;\
z-index: 9991;\
cursor: default;\
}\
.ace_dark #ace_settingsmenu, .ace_dark #kbshortcutmenu {\
box-shadow: -20px 10px 25px rgba(126, 126, 126, 0.25);\
background-color: rgba(255, 255, 255, 0.6);\
color: black;\
}\
.ace_optionsMenuEntry:hover {\
background-color: rgba(100, 100, 100, 0.1);\
transition: all 0.3s\
}\
.ace_closeButton {\
background: rgba(245, 146, 146, 0.5);\
border: 1px solid #F48A8A;\
border-radius: 50%;\
padding: 7px;\
position: absolute;\
right: -8px;\
top: -8px;\
z-index: 100000;\
}\
.ace_closeButton{\
background: rgba(245, 146, 146, 0.9);\
}\
.ace_optionsMenuKey {\
color: darkslateblue;\
font-weight: bold;\
}\
.ace_optionsMenuCommand {\
color: darkcyan;\
font-weight: normal;\
}\
.ace_optionsMenuEntry input, .ace_optionsMenuEntry button {\
vertical-align: middle;\
}\
.ace_optionsMenuEntry button[ace_selected_button=true] {\
background: #e7e7e7;\
box-shadow: 1px 0px 2px 0px #adadad inset;\
border-color: #adadad;\
}\
.ace_optionsMenuEntry button {\
background: white;\
border: 1px solid lightgray;\
margin: 0px;\
}\
.ace_optionsMenuEntry button:hover{\
background: #f0f0f0;\
}";
dom.importCssString(cssText);
module.exports.overlayPage = function overlayPage(editor, contentElement, top, right, bottom, left) {
    top = top ? 'top: ' + top + ';' : '';
    bottom = bottom ? 'bottom: ' + bottom + ';' : '';
    right = right ? 'right: ' + right + ';' : '';
    left = left ? 'left: ' + left + ';' : '';

    var closer = document.createElement('div');
    var contentContainer = document.createElement('div');

    function documentEscListener(e) {
        if (e.keyCode === 27) {
            closer.click();
        }
    }

    closer.style.cssText = 'margin: 0; padding: 0; ' +
        'position: fixed; top:0; bottom:0; left:0; right:0;' +
        'z-index: 9990; ' +
        'background-color: rgba(0, 0, 0, 0.3);';
    closer.addEventListener('click', function() {
        document.removeEventListener('keydown', documentEscListener);
        closer.parentNode.removeChild(closer);
        editor.focus();
        closer = null;
    });
    document.addEventListener('keydown', documentEscListener);

    contentContainer.style.cssText = top + right + bottom + left;
    contentContainer.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    var wrapper = dom.createElement("div");
    wrapper.style.position = "relative";
    
    var closeButton = dom.createElement("div");
    closeButton.className = "ace_closeButton";
    closeButton.addEventListener('click', function() {
        closer.click();
    });
    
    wrapper.appendChild(closeButton);
    contentContainer.appendChild(wrapper);
    
    contentContainer.appendChild(contentElement);
    closer.appendChild(contentContainer);
    document.body.appendChild(closer);
    editor.blur();
};

});

define("ace/ext/modelist",["require","exports","module"], function(require, exports, module) {
"use strict";

var modes = [];
function getModeForPath(path) {
    var mode = modesByName.text;
    var fileName = path.split(/[\/\\]/).pop();
    for (var i = 0; i < modes.length; i++) {
        if (modes[i].supportsFile(fileName)) {
            mode = modes[i];
            break;
        }
    }
    return mode;
}

var Mode = function(name, caption, extensions) {
    this.name = name;
    this.caption = caption;
    this.mode = "ace/mode/" + name;
    this.extensions = extensions;
    var re;
    if (/\^/.test(extensions)) {
        re = extensions.replace(/\|(\^)?/g, function(a, b){
            return "$|" + (b ? "^" : "^.*\\.");
        }) + "$";
    } else {
        re = "^.*\\.(" + extensions + ")$";
    }

    this.extRe = new RegExp(re, "gi");
};

Mode.prototype.supportsFile = function(filename) {
    return filename.match(this.extRe);
};
var supportedModes = {
    ABAP:        ["abap"],
    ABC:         ["abc"],
    ActionScript:["as"],
    ADA:         ["ada|adb"],
    Apache_Conf: ["^htaccess|^htgroups|^htpasswd|^conf|htaccess|htgroups|htpasswd"],
    AsciiDoc:    ["asciidoc|adoc"],
    ASL:         ["dsl|asl"],
    Assembly_x86:["asm|a"],
    AutoHotKey:  ["ahk"],
    BatchFile:   ["bat|cmd"],
    Bro:         ["bro"],
    C_Cpp:       ["cpp|c|cc|cxx|h|hh|hpp|ino"],
    C9Search:    ["c9search_results"],
    Cirru:       ["cirru|cr"],
    Clojure:     ["clj|cljs"],
    Cobol:       ["CBL|COB"],
    coffee:      ["coffee|cf|cson|^Cakefile"],
    ColdFusion:  ["cfm"],
    CSharp:      ["cs"],
    Csound_Document: ["csd"],
    Csound_Orchestra: ["orc"],
    Csound_Score: ["sco"],
    CSS:         ["css"],
    Curly:       ["curly"],
    D:           ["d|di"],
    Dart:        ["dart"],
    Diff:        ["diff|patch"],
    Dockerfile:  ["^Dockerfile"],
    Dot:         ["dot"],
    Drools:      ["drl"],
    Edifact:     ["edi"],
    Eiffel:      ["e|ge"],
    EJS:         ["ejs"],
    Elixir:      ["ex|exs"],
    Elm:         ["elm"],
    Erlang:      ["erl|hrl"],
    Forth:       ["frt|fs|ldr|fth|4th"],
    Fortran:     ["f|f90"],
    FSharp:      ["fsi|fs|ml|mli|fsx|fsscript"],
    FTL:         ["ftl"],
    Gcode:       ["gcode"],
    Gherkin:     ["feature"],
    Gitignore:   ["^.gitignore"],
    Glsl:        ["glsl|frag|vert"],
    Gobstones:   ["gbs"],
    golang:      ["go"],
    GraphQLSchema: ["gql"],
    Groovy:      ["groovy"],
    HAML:        ["haml"],
    Handlebars:  ["hbs|handlebars|tpl|mustache"],
    Haskell:     ["hs"],
    Haskell_Cabal:     ["cabal"],
    haXe:        ["hx"],
    Hjson:       ["hjson"],
    HTML:        ["html|htm|xhtml|vue|we|wpy"],
    HTML_Elixir: ["eex|html.eex"],
    HTML_Ruby:   ["erb|rhtml|html.erb"],
    INI:         ["ini|conf|cfg|prefs"],
    Io:          ["io"],
    Jack:        ["jack"],
    Jade:        ["jade|pug"],
    Java:        ["java"],
    JavaScript:  ["js|jsm|jsx"],
    JSON:        ["json"],
    JSONiq:      ["jq"],
    JSP:         ["jsp"],
    JSSM:        ["jssm|jssm_state"],
    JSX:         ["jsx"],
    Julia:       ["jl"],
    Kotlin:      ["kt|kts"],
    LaTeX:       ["tex|latex|ltx|bib"],
    LESS:        ["less"],
    Liquid:      ["liquid"],
    Lisp:        ["lisp"],
    LiveScript:  ["ls"],
    LogiQL:      ["logic|lql"],
    LSL:         ["lsl"],
    Lua:         ["lua"],
    LuaPage:     ["lp"],
    Lucene:      ["lucene"],
    Makefile:    ["^Makefile|^GNUmakefile|^makefile|^OCamlMakefile|make"],
    Markdown:    ["md|markdown"],
    Mask:        ["mask"],
    MATLAB:      ["matlab"],
    Maze:        ["mz"],
    MEL:         ["mel"],
    MIXAL:       ["mixal"],
    MUSHCode:    ["mc|mush"],
    MySQL:       ["mysql"],
    Nix:         ["nix"],
    NSIS:        ["nsi|nsh"],
    ObjectiveC:  ["m|mm"],
    OCaml:       ["ml|mli"],
    Pascal:      ["pas|p"],
    Perl:        ["pl|pm"],
    pgSQL:       ["pgsql"],
    PHP_Laravel_blade: ["blade.php"],
    PHP:         ["php|phtml|shtml|php3|php4|php5|phps|phpt|aw|ctp|module"],
    Puppet:      ["epp|pp"],
    Pig:         ["pig"],
    Powershell:  ["ps1"],
    Praat:       ["praat|praatscript|psc|proc"],
    Prolog:      ["plg|prolog"],
    Properties:  ["properties"],
    Protobuf:    ["proto"],
    Python:      ["py"],
    R:           ["r"],
    Razor:       ["cshtml|asp"],
    RDoc:        