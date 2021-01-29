define("ace/mode/matlab_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var MatlabHighlightRules = function() {

var keywords = (
        "break|case|catch|classdef|continue|else|elseif|end|for|function|global|if|otherwise|parfor|persistent|return|spmd|switch|try|while"
    );

    var builtinConstants = (
        "true|false|inf|Inf|nan|NaN|eps|pi|ans|nargin|nargout|varargin|varargout"
    );

    var builtinFunctions = (
        "abs|accumarray|acos(?:d|h)?|acot(?:d|h)?|acsc(?:d|h)?|actxcontrol(?:list|select)?|actxGetRunningServer|actxserver|addlistener|addpath|addpref|addtodate|"+
		"airy|align|alim|all|allchild|alpha|alphamap|amd|ancestor|and|angle|annotation|any|area|arrayfun|asec(?:d|h)?|asin(?:d|h)?|assert|assignin|atan(?:2|d|h)?|" +
		"audiodevinfo|audioplayer|audiorecorder|aufinfo|auread|autumn|auwrite|avifile|aviinfo|aviread|axes|axis|balance|bar(?:3|3h|h)?|base2dec|beep|BeginInvoke|bench|"+
		"bessel(?:h|i|j|k|y)|beta|betainc|betaincinv|betaln|bicg|bicgstab|bicgstabl|bin2dec|bitand|bitcmp|bitget|bitmax|bitnot|bitor|bitset|bitshift|bitxor|blanks|blkdiag|"+
		"bone|box|brighten|brush|bsxfun|builddocsearchdb|builtin|bvp4c|bvp5c|bvpget|bvpinit|bvpset|bvpxtend|calendar|calllib|callSoapService|camdolly|cameratoolbar|camlight|"+
		"camlookat|camorbit|campan|campos|camproj|camroll|camtarget|camup|camva|camzoom|cart2pol|cart2sph|cast|cat|caxis|cd|cdf2rdf|cdfepoch|cdfinfo|cdflib(?:.(?:close|closeVar|"+
		"computeEpoch|computeEpoch16|create|createAttr|createVar|delete|deleteAttr|deleteAttrEntry|deleteAttrgEntry|deleteVar|deleteVarRecords|epoch16Breakdown|epochBreakdown|getAttrEntry|"+
		"getAttrgEntry|getAttrMaxEntry|getAttrMaxgEntry|getAttrName|getAttrNum|getAttrScope|getCacheSize|getChecksum|getCompression|getCompressionCacheSize|getConstantNames|"+
		"getConstantValue|getCopyright|getFileBackward|getFormat|getLibraryCopyright|getLibraryVersion|getMajority|getName|getNumAttrEntries|getNumAttrgEntries|getNumAttributes|"+
		"getNumgAttributes|getReadOnlyMode|getStageCacheSize|getValidate|getVarAllocRecords|getVarBlockingFactor|getVarCacheSize|getVarCompression|getVarData|getVarMaxAllocRecNum|"+
		"getVarMaxWrittenRecNum|getVarName|getVarNum|getVarNumRecsWritten|getVarPadValue|getVarRecordData|getVarReservePercent|getVarsMaxWrittenRecNum|getVarSparseRecords|getVersion|"+
		"hyperGetVarData|hyperPutVarData|inquire|inquireAttr|inquireAttrEntry|inquireAttrgEntry|inquireVar|open|putAttrEntry|putAttrgEntry|putVarData|putVarRecordData|renameAttr|"+
		"renameVar|setCacheSize|setChecksum|setCompression|setCompressionCacheSize|setFileBackward|setFormat|setMajority|setReadOnlyMode|setStageCacheSize|setValidate|"+
		"setVarAllocBlockRecords|setVarBlockingFactor|setVarCacheSize|setVarCompression|setVarInitialRecs|setVarPadValue|SetVarReservePercent|setVarsCacheSize|setVarSparseRecords))?|"+
		"cdfread|cdfwrite|ceil|cell2mat|cell2struct|celldisp|cellfun|cellplot|cellstr|cgs|checkcode|checkin|checkout|chol|cholinc|cholupdate|circshift|cla|clabel|class|clc|clear|"+
		"clearvars|clf|clipboard|clock|close|closereq|cmopts|cmpermute|cmunique|colamd|colon|colorbar|colordef|colormap|colormapeditor|colperm|Combine|comet|comet3|commandhistory|"+
		"commandwindow|compan|compass|complex|computer|cond|condeig|condest|coneplot|conj|containers.Map|contour(?:3|c|f|slice)?|contrast|conv|conv2|convhull|convhulln|convn|cool|"+
		"copper|copyfile|copyobj|corrcoef|cos(?:d|h)?|cot(?:d|h)?|cov|cplxpair|cputime|createClassFromWsdl|createSoapMessage|cross|csc(?:d|h)?|csvread|csvwrite|ctranspose|cumprod|"+
		"cumsum|cumtrapz|curl|customverctrl|cylinder|daqread|daspect|datacursormode|datatipinfo|date|datenum|datestr|datetick|datevec|dbclear|dbcont|dbdown|dblquad|dbmex|dbquit|"+
		"dbstack|dbstatus|dbstep|dbstop|dbtype|dbup|dde23|ddeget|ddesd|ddeset|deal|deblank|dec2base|dec2bin|dec2hex|decic|deconv|del2|delaunay|delaunay3|delaunayn|DelaunayTri|delete|"+
		"demo|depdir|depfun|det|detrend|deval|diag|dialog|diary|diff|diffuse|dir|disp|display|dither|divergence|dlmread|dlmwrite|dmperm|doc|docsearch|dos|dot|dragrect|drawnow|dsearch|"+
		"dsearchn|dynamicprops|echo|echodemo|edit|eig|eigs|ellipj|ellipke|ellipsoid|empty|enableNETfromNetworkDrive|enableservice|EndInvoke|enumeration|eomday|eq|erf|erfc|erfcinv|"+
		"erfcx|erfinv|error|errorbar|errordlg|etime|etree|etreeplot|eval|evalc|evalin|event.(?:EventData|listener|PropertyEvent|proplistener)|exifread|exist|exit|exp|expint|expm|"+
		"expm1|export2wsdlg|eye|ezcontour|ezcontourf|ezmesh|ezmeshc|ezplot|ezplot3|ezpolar|ezsurf|ezsurfc|factor|factorial|fclose|feather|feature|feof|ferror|feval|fft|fft2|fftn|"+
		"fftshift|fftw|fgetl|fgets|fieldnames|figure|figurepalette|fileattrib|filebrowser|filemarker|fileparts|fileread|filesep|fill|fill3|filter|filter2|find|findall|findfigs|"+
		"findobj|findstr|finish|fitsdisp|fitsinfo|fitsread|fitswrite|fix|flag|flipdim|fliplr|flipud|floor|flow|fminbnd|fminsearch|fopen|format|fplot|fprintf|frame2im|fread|freqspace|"+
		"frewind|fscanf|fseek|ftell|FTP|full|fullfile|func2str|functions|funm|fwrite|fzero|gallery|gamma|gammainc|gammaincinv|gammaln|gca|gcbf|gcbo|gcd|gcf|gco|ge|genpath|genvarname|"+
		"get|getappdata|getenv|getfield|getframe|getpixelposition|getpref|ginput|gmres|gplot|grabcode|gradient|gray|graymon|grid|griddata(?:3|n)?|griddedInterpolant|gsvd|gt|gtext|"+
		"guidata|guide|guihandles|gunzip|gzip|h5create|h5disp|h5info|h5read|h5readatt|h5write|h5writeatt|hadamard|handle|hankel|hdf|hdf5|hdf5info|hdf5read|hdf5write|hdfinfo|"+
		"hdfread|hdftool|help|helpbrowser|helpdesk|helpdlg|helpwin|hess|hex2dec|hex2num|hgexport|hggroup|hgload|hgsave|hgsetget|hgtransform|hidden|hilb|hist|histc|hold|home|horzcat|"+
		"hostid|hot|hsv|hsv2rgb|hypot|ichol|idivide|ifft|ifft2|ifftn|ifftshift|ilu|im2frame|im2java|imag|image|imagesc|imapprox|imfinfo|imformats|import|importdata|imread|imwrite|"+
		"ind2rgb|ind2sub|inferiorto|info|inline|inmem|inpolygon|input|inputdlg|inputname|inputParser|inspect|instrcallback|instrfind|instrfindall|int2str|integral(?:2|3)?|interp(?:1|"+
		"1q|2|3|ft|n)|interpstreamspeed|intersect|intmax|intmin|inv|invhilb|ipermute|isa|isappdata|iscell|iscellstr|ischar|iscolumn|isdir|isempty|isequal|isequaln|isequalwithequalnans|"+
		"isfield|isfinite|isfloat|isglobal|ishandle|ishghandle|ishold|isinf|isinteger|isjava|iskeyword|isletter|islogical|ismac|ismatrix|ismember|ismethod|isnan|isnumeric|isobject|"+
		"isocaps|isocolors|isonormals|isosurface|ispc|ispref|isprime|isprop|isreal|isrow|isscalar|issorted|isspace|issparse|isstr|isstrprop|isstruct|isstudent|isunix|isvarname|"+
		"isvector|javaaddpath|javaArray|javachk|javaclasspath|javacomponent|javaMethod|javaMethodEDT|javaObject|javaObjectEDT|javarmpath|jet|keyboard|kron|lasterr|lasterror|"+
		"lastwarn|lcm|ldivide|ldl|le|legend|legendre|length|libfunctions|libfunctionsview|libisloaded|libpointer|libstruct|license|light|lightangle|lighting|lin2mu|line|lines|"+
		"linkaxes|linkdata|linkprop|linsolve|linspace|listdlg|listfonts|load|loadlibrary|loadobj|log|log10|log1p|log2|loglog|logm|logspace|lookfor|lower|ls|lscov|lsqnonneg|lsqr|"+
		"lt|lu|luinc|magic|makehgtform|mat2cell|mat2str|material|matfile|matlab.io.MatFile|matlab.mixin.(?:Copyable|Heterogeneous(?:.getDefaultScalarElement)?)|matlabrc|"+
		"matlabroot|max|maxNumCompThreads|mean|median|membrane|memmapfile|memory|menu|mesh|meshc|meshgrid|meshz|meta.(?:class(?:.fromName)?|DynamicProperty|EnumeratedValue|event|"+
		"MetaData|method|package(?:.(?:fromName|getAllPackages))?|property)|metaclass|methods|methodsview|mex(?:.getCompilerConfigurations)?|MException|mexext|mfilename|min|minres|"+
		"minus|mislocked|mkdir|mkpp|mldivide|mlint|mlintrpt|mlock|mmfileinfo|mmreader|mod|mode|more|move|movefile|movegui|movie|movie2avi|mpower|mrdivide|msgbox|mtimes|mu2lin|"+
		"multibandread|multibandwrite|munlock|namelengthmax|nargchk|narginchk|nargoutchk|native2unicode|nccreate|ncdisp|nchoosek|ncinfo|ncread|ncreadatt|ncwrite|ncwriteatt|"+
		"ncwriteschema|ndgrid|ndims|ne|NET(?:.(?:addAssembly|Assembly|convertArray|createArray|createGeneric|disableAutoRelease|enableAutoRelease|GenericClass|invokeGenericMethod|"+
		"NetException|setStaticProperty))?|netcdf.(?:abort|close|copyAtt|create|defDim|defGrp|defVar|defVarChunking|defVarDeflate|defVarFill|defVarFletcher32|delAtt|endDef|getAtt|"+
		"getChunkCache|getConstant|getConstantNames|getVar|inq|inqAtt|inqAttID|inqAttName|inqDim|inqDimID|inqDimIDs|inqFormat|inqGrpName|inqGrpNameFull|inqGrpParent|inqGrps|"+
		"inqLibVers|inqNcid|inqUnlimDims|inqVar|inqVarChunking|inqVarDeflate|inqVarFill|inqVarFletcher32|inqVarID|inqVarIDs|open|putAtt|putVar|reDef|