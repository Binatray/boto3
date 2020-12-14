define("ace/mode/actionscript_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var ActionScriptHighlightRules = function() {

    this.$rules = { start: 
       [ { token: 'support.class.actionscript.2',
           regex: '\\b(?:R(?:ecordset|DBMSResolver|adioButton(?:Group)?)|X(?:ML(?:Socket|Node|Connector)?|UpdateResolverDataHolder)|M(?:M(?:Save|Execute)|icrophoneMicrophone|o(?:use|vieClip(?:Loader)?)|e(?:nu(?:Bar)?|dia(?:Controller|Display|Playback))|ath)|B(?:yName|inding|utton)|S(?:haredObject|ystem|crollPane|t(?:yleSheet|age|ream)|ound|e(?:ndEvent|rviceObject)|OAPCall|lide)|N(?:umericStepper|et(?:stream|S(?:tream|ervices)|Connection|Debug(?:Config)?))|C(?:heckBox|o(?:ntextMenu(?:Item)?|okie|lor|m(?:ponentMixins|boBox))|ustomActions|lient|amera)|T(?:ypedValue|ext(?:Snapshot|Input|F(?:ield|ormat)|Area)|ree|AB)|Object|D(?:ownload|elta(?:Item|Packet)?|at(?:e(?:Chooser|Field)?|a(?:G(?:lue|rid)|Set|Type)))|U(?:RL|TC|IScrollBar)|P(?:opUpManager|endingCall|r(?:intJob|o(?:duct|gressBar)))|E(?:ndPoint|rror)|Video|Key|F(?:RadioButton|GridColumn|MessageBox|BarChart|S(?:croll(?:Bar|Pane)|tyleFormat|plitView)|orm|C(?:heckbox|omboBox|alendar)|unction|T(?:icker|ooltip(?:Lite)?|ree(?:Node)?)|IconButton|D(?:ataGrid|raggablePane)|P(?:ieChart|ushButton|ro(?:gressBar|mptBox))|L(?:i(?:stBox|neChart)|oadingBox)|AdvancedMessageBox)|W(?:indow|SDLURL|ebService(?:Connector)?)|L(?:ist|o(?:calConnection|ad(?:er|Vars)|g)|a(?:unch|bel))|A(?:sBroadcaster|cc(?:ordion|essibility)|S(?:Set(?:Native|PropFlags)|N(?:ew|ative)|C(?:onstructor|lamp(?:2)?)|InstanceOf)|pplication|lert|rray))\\b' },
         { token: 'support.function.actionscript.2',
           regex: '\\b(?:s(?:h(?:ift|ow(?:GridLines|Menu|Border|Settings|Headers|ColumnHeaders|Today|Preferences)?|ad(?:ow|ePane))|c(?:hema|ale(?:X|Mode|Y|Content)|r(?:oll(?:Track|Dr