define("ace/ext/searchbox",["require","exports","module","ace/lib/dom","ace/lib/lang","ace/lib/event","ace/keyboard/hash_handler","ace/lib/keys"], function(require, exports, module) {
"use strict";

var dom = require("../lib/dom");
var lang = require("../lib/lang");
var event = require("../lib/event");
var searchboxCss = "\
.ace_search {\
background-color: #ddd;\
color: #666;\
border: 1px solid #cbcbcb;\
border-top: 0 none;\
overflow: hidden;\
margin: 0;\
padding: 4px 6px 0 4px;\
position: absolute;\
top: 0;\
z-index: 99;\
white-space: normal;\
}\
.ace_search.left {\
border-left: 0 none;\
border-radius: 0px 0px 5px 0px;\
left: 0;\
}\
.ace_search.right {\
border-radius: 0px 0px 0px 5px;\
border-right: 0 none;\
right: 0;\
}\
.ace_search_form, .ace_replace_form {\
margin: 0 20px 4px 0;\
overflow: hidden;\
line-height: 1.9;\
}\
.ace_replace_form {\
margin-right: 0;\
}\
.ace_search_form.ace_nomatch {\
outline: 1px solid red;\
}\
.ace_search_field {\
border-radius: 3px 0 0 3px;\
background-color: white;\
color: black;\
border: 1px solid #cbcbcb;\
border-right: 0 none;\
outline: 0;\
padding: 0;\
font-size: inherit;\
margin: 0;\
line-height: inherit;\
padding: 0 6px;\
min-width: 17em;\
vertical-align: top;\
min-height: 1.8em;\
box-sizing: content-box;\
}\
.ace_searchbtn {\
border: 1px solid #cbcbcb;\
line-height: inherit;\
display: inline-block;\
padding: 0 6px;\
background: #fff;\
border-right: 0 none;\
border-left: 1px solid #dcdcdc;\
cursor: pointer;\
margin: 0;\
position: relative;\
color: #666;\
}\
.ace_searchbtn:last-child {\
border-radius: 0 3px 3px 0;\
border-right: 1px solid #cbcbcb;\
}\
.ace_searchbtn:disabled {\
background: none;\
cursor: default;\
}\
.ace_searchbtn:hover {\
background-color: #eef1f6;\
}\
.ace_searchbtn.prev, .ace_searchbtn.next {\
padding: 0px 0.7em\
}\
.ace_searchbtn.prev:after, .ace_searchbtn.next:after {\
content: \"\";\
border: solid 2px #888;\
width: 0.5em;\
height: 0.5em;\
border-width:  2px 0 0 2px;\
display:inline-block;\
transform: rotate(-45deg);\
}\
.ace_searchbtn.next:after {\
border-width: 0 2px 2px 0 ;\
}\
.ace_searchbtn_close {\
background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAcCAYAAABRVo5BAAAAZ0lEQVR42u2SUQrAMAhDvazn8OjZBilCkYVVxiis8H4CT0VrAJb4WHT3C5xU2a2IQZXJjiQIRMdkEoJ5Q2yMqpfDIo+XY4k6h+YXOyKqTIj5REaxloNAd0xiKmAtsTHqW8sR2W5f7gCu5nWFUpVjZwAAAABJRU5ErkJggg==) no-repeat 50% 0;\
border-radius: 50%;\
border: 0 none;\
color: #656565;\
cursor: pointer;\
font: 16px/16px Arial;\
padding: 0;\
height: 14px;\
width: 14px;\
top: 9px;\
right: 7px;\
position: absolute;\
}\
.ace_searchbtn_close:hover {\
background-color: #656565;\
background-position: 50% 100%;\
color: white;\
}\
.ace_button {\
margin-left: 2px;\
cursor: pointer;\
-webkit-user-select: none;\
-moz-user-select: none;\
-o-user-select: none;\
-ms-user-select: none;\
user-select: none;\
overflow: hidden;\
opacity: 0.7;\
border: 1px solid rgba(100,100,100,0.23);\
padding: 1px;\
box-sizing:    border-box!important;\
color: black;\
}\
.ace_button:hover {\
background-color: #eee;\
opacity:1;\
}\
.ace_button:active {\
background-color: #ddd;\
}\
.ace_button.checked {\
border-color: #3399ff;\
opacity:1;\
}\
.ace_search_options{\
margin-bottom: 3px;\
text-align: right;\
-webkit-user-select: none;\
-moz-user-select: none;\
-o-user-select: none;\
-ms-user-select: none;\
user-select: none;\
clear: both;\
}\
.ace_search_counter {\
float: left;\
font-family: arial;\
padding: 0 8px;\
}";
var HashHandler = require("../keyboard/hash_handler").HashHandler;
var keyUtil = require("../lib/keys");

var MAX_COUNT = 999;

dom.importCssString(searchboxCss, "ace_searchbox");

var html = '<div class="ace_search right">\
    <span action="hide" class="ace_searchbtn_close"></span>\
    <div class="ace_search_form">\
        <input class="ace_search_field" placeholder="Search for" spellcheck="false"></input>\
        <span action="findPrev" class="ace_searchbtn prev"></span>\
        <span action="findNext" class="ace_searchbtn next"></span>\
        <span action="findAll" class="ace_searchbtn" title="Alt-Enter">All</span>\
    </div>\
    <div class="ace_replace_form">\
        <input class="ace_search_field" placeholder="Replace with" spellcheck="false"></input>\
        <span action="replaceAndFindNext" class="ace_searchbtn">Replace</span>\
        <span action="replaceAll" class="ace_searchbtn">All</span>\
    </div>\
    <div class="ace_search_options">\
        <span action="toggleReplace" class="ace_button" title="Toggle Replace mode"\
            style="float:left;margin-top:-2px;padding:0 5px;">+</span>\
        <span class="ace_search_counter"></span>\
        <span action="toggleRegexpMode" class="ace_button" title="RegExp Search">.*</span>\
        <span action="toggleCaseSensitive" class="ace_button" title="CaseSensitive Search">Aa</span>\
        <span action="toggleWholeWords" class="ace_button" title="Whole Word Search">\\b</span>\
        <span action="searchInSelection" class="ace_button" title="Search In Selection">S</span>\
    </div>\
</div>'.replace(/> +/g, ">");

var SearchBox = function(editor, range, showReplaceForm) {
    var div = dom.createElement("div");
    div.innerHTML = html;
    this.element = div.firstChild;
    
    this.setSession = this.setSession.bind(this);

    this.$init();
    this.setEditor(editor);
    dom.importCssString(searchboxCss, "ace_searchbox", editor.container);
};

(function() {
    this.setEditor = function(editor) {
        editor.searchBox = this;
        editor.renderer.scroller.appendChild(this.element);
        this.editor = editor;
    };
    
    this.setSession = function(e) {
        this.searchRange = null;
        this.$syncOptions(true);
    };

    this.$initElements = function(sb) {
        this.searchBox = sb.querySelector(".ace_search_form");
        this.replaceBox = sb.querySelector(".ace_replace_form");
        this.searchOption = sb.querySelector("[action=searchInSelection]");
        this.replaceOption = sb.querySelector("[action=toggleReplace]");
        this.regExpOption = sb.querySelector("[action=toggleRegexpMode]");
        this.caseSensitiveOption = sb.querySelector("[action=toggleCaseSensitive]");
        this.wholeWordOption = sb.querySelector("[action=toggleWholeWords]");
        this.searchInput = this.searchBox.querySelector(".ace_search_field");
        this.replaceInput = this.replaceBox.querySelector(".ace_search_field");
        this.searchCounter = sb.querySelector(".ace_search_counter");
    };
    
    this.$init = function() {
        var sb = this.element;
        
        this.$initElements(sb);
        
        var _this = this;
        event.addListener(sb, "mousedown", function(e) {
            setTimeout(function(){
                _this.activeInput.focus();
            }, 0);
            event.stopPropagation(e);
        });
        event.addListener(sb, "click", function(e) {
            var t = e.target || e.srcElement;
            var action = t.getAttribute("action");
            if (action && _this[action])
                _this[action]();
            else if (_this.$searchBarKb.commands[action])
                _this.$searchBarKb.commands[action].exec(_this);
            event.stopPropagation(e);
        });

        event.addCommandKeyListener(sb, function(e, hashId, keyCode) {
            var keyString = keyUtil.keyCodeToString(keyCode);
            var command = _this.$searchBarKb.findKeyCommand(hashId, keyString);
            if (command && command.exec) {
                command.exec(_this);
                event.stopEvent(e);
            }
        });

        this.$onChange = lang.delayedCall(function() {
            _this.find(false, false);
  