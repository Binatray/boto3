define("ace/snippets/ruby",["require","exports","module"], function(require, exports, module) {
"use strict";

exports.snippetText = "########################################\n\
# Ruby snippets - for Rails, see below #\n\
########################################\n\
\n\
# encoding for Ruby 1.9\n\
snippet enc\n\
	# encoding: utf-8\n\
\n\
# #!/usr/bin/env ruby\n\
snippet #!\n\
	#!/usr/bin/env ruby\n\
	# encoding: utf-8\n\
\n\
# New Block\n\
snippet =b\n\
	=begin rdoc\n\
		${1}\n\
	=end\n\
snippet y\n\
	:yields: ${1:arguments}\n\
snippet rb\n\
	#!/usr/bin/env ruby -wKU\n\
snippet beg\n\
	begin\n\
		${3}\n\
	rescue ${1:Exception} => ${2:e}\n\
	end\n\
\n\
snippet req require\n\
	require \"${1}\"${2}\n\
snippet #\n\
	# =>\n\
snippet end\n\
	__END__\n\
snippet case\n\
	case ${1:object}\n\
	when ${2:condition}\n\
		${3}\n\
	end\n\
snippet when\n\
	when ${1:condition}\n\
		${2}\n\
snippet def\n\
	def ${1:method_name}\n\
		${2}\n\
	end\n\
snippet deft\n\
	def test_${1:case_name}\n\
		${2}\n\
	end\n\
snippet if\n\
	if ${1:condition}\n\
		${2}\n\
	end\n\
snippet ife\n\
	if ${1:condition}\n\
		${2}\n\
	else\n\
		${3}\n\
	end\n\
snippet elsif\n\
	elsif ${1:condition}\n\
		${2}\n\
snippet unless\n\
	unless ${1:condition}\n\
		${2}\n\
	end\n\
snippet while\n\
	while ${1:condition}\n\
		${2}\n\
	end\n\
snippet for\n\
	for ${1:e} in ${2:c}\n\
		${3}\n\
	end\n\
snippet until\n\
	until ${1:condition}\n\
		${2}\n\
	end\n\
snippet cla class .. end\n\
	class ${1:`substitute(Filename(), '\\(_\\|^\\)\\(.\\)', '\\u\\2', 'g')`}\n\
		${2}\n\
	end\n\
snippet cla class .. initialize .. end\n\
	class ${1:`substitute(Filename(), '\\(_\\|^\\)\\(.\\)', '\\u\\2', 'g')`}\n\
		def initialize(${2:args})\n\
			${3}\n\
		end\n\
	end\n\
snippet cla class .. < ParentClass .. initialize .. end\n\
	class ${1:`substitute(Filename(), '\\(_\\|^\\)\\(.\\)', '\\u\\2', 'g')`} < ${2:ParentClass}\n\
		def initialize(${3:args})\n\
			${4}\n\
		end\n\
	end\n\
snippet cla ClassName = Struct .. do .. end\n\
	${1:`substitute(Filename(), '\\(_\\|^\\)\\(.\\)', '\\u\\2', 'g')`} = Struct.new(:${2:attr_names}) do\n\
		def ${3:method_name}\n\
			${4}\n\
		end\n\
	end\n\
snippet cla class BlankSlate .. initialize .. end\n\
	class ${1:BlankSlate}\n\
		instance_methods.each { |meth| undef_method(meth) unless meth =~ /\\A__/ }\n\
	end\n\
snippet cla class << self .. end\n\
	class << ${1:self}\n\
		${2}\n\
	end\n\
# class .. < DelegateClass .. initialize .. end\n\
snippet cla-\n\
	class ${1:`substitute(Filename(), '\\(_\\|^\\)\\(.\\)', '\\u\\2', 'g')`} < DelegateClass(${2:ParentClass})\n\
		def initialize(${3:args})\n\
			super(${4:del_obj})\n\
\n\
			${5}\n\
		end\n\
	end\n\
snippet mod module .. end\n\
	module ${1:`substitute(Filename(), '\\(_\\|^\\)\\(.\\)', '\\u\\2', 'g')`}\n\
		${2}\n\
	end\n\
snippet mod module .. module_function .. end\n\
	module ${1:`substitute(Filename(), '\\(_\\|^\\)\\(.\\)', '\\u\\2', 'g')`}\n\
		module_function\n\
\n\
		${2}\n\
	end\n\
snippet mod module .. ClassMethods .. end\n\
	module ${1:`substitute(Filename(), '\\(_\\|^\\)\\(.\\)', '\\u\\2', 'g')`}\n\
		module ClassMethods\n\
			${2}\n\
		end\n\
\n\
		module InstanceMethods\n\
\n\
		end\n\
\n\
		def self.included(receiver)\n\
			receiver.extend         ClassMethods\n\
			receiver.send :include, InstanceMethods\n\
		end\n\
	end\n\
# attr_reader\n\
snippet r\n\
	attr_reader :${1:attr_names}\n\
# attr_writer\n\
snippet w\n\
	attr_writer :${1:attr_names}\n\
# attr_accessor\n\
snippet rw\n\
	attr_accessor :${1:attr_names}\n\
snippet atp\n\
	attr_protected :${1:attr_names}\n\
snippet ata\n\
	attr_accessible :${1:attr_names}\n\
# include Enumerable\n\
snippet Enum\n\
	include Enumerable\n\
\n\
	def each(&block)\n\
		${1}\n\
	end\n\
# include Comparable\n\
snippet Comp\n\
	include Comparable\n\
\n\
	def <=>(other)\n\
		${1}\n\
	end\n\
# extend Forwardable\n\
snippet Forw-\n\
	extend Forwardable\n\
# def self\n\
snippet defs\n\
	def self.${1:class_method_name}\n\
		${2}\n\
	end\n\
# def method_missing\n\
snippet defmm\n\
	def method_missing(meth, *args, &blk)\n\
		${1}\n\
	end\n\
snippet defd\n\
	def_delegator :${1:@del_obj}, :${2:del_meth}, :${3:new_name}\n\
snippet defds\n\
	def_delegators :${1:@del_obj}, :${2:del_methods}\n\
snippet am\n\
	alias_method :${1:new_name}, :${2:old_name}\n\
snippet app\n\
	if __FILE__ == $PROGRAM_NAME\n\
		${1}\n\
	end\n\
# usage_if()\n\
snippet usai\n\
	if ARGV.${1}\n\
		abort \"Usage: #{$PROGRAM_NAME} ${2:ARGS_GO_HERE}\"${3}\n\
	end\n\
# usage_unless()\n\
snippet usau\n\
	unless ARGV.${1}\n\
		abort \"Usage: #{$PROGRAM_NAME} ${2:ARGS_GO_HERE}\"${3}\n\
	end\n\
snippet array\n\
	Array.new(${1:10}) { |${2:i}| ${3} }\n\
snippet hash\n\
	Hash.new { |${1:hash}, ${2:key}| $1[$2] = ${3} }\n\
snippet file File.foreach() { |line| .. }\n\
	File.foreach(${1:\"path/to/file\"}) { |${2:line}| ${3} }\n\
snippet file File.read()\n\
	File.read(${1:\"path/to/file\"})${2}\n\
snippet Dir Dir.global() { |file| .. }\n\
	Dir.glob(${1:\"dir/glob/*\"}) { |${2:file}| ${3} }\n\
snippet Dir Dir[\"..\"]\n\
	Dir[${1:\"glob/**/*.rb\"}]${2}\n\
snippet dir\n\
	Filename.dirname(__FILE__)\n\
snippet deli\n\
	delete_if { |${1:e}| ${2} }\n\
snippet fil\n\
	fill(${1:range}) { |${2:i}| ${3} }\n\
# flatten_once()\n\
snippet flao\n\
	inject(Array.new) { |${1:arr}, ${2:a}| $1.push(*$2)}${3}\n\
snippet zip\n\
	zip(${1:enums}) { |${2:row}| ${3} }\n\
# downto(0) { |n| .. }\n\
snippet dow\n\
	downto(${1:0}) { |${2:n}| ${3} }\n\
snippet ste\n\
	step(${1:2}) { |${2:n}| ${3} }\n\
snippet tim\n\
	times { |${1:n}| ${2} }\n\
snippet upt\n\
	upto(${1:1.0/0.0}) { |${2:n}| ${3} }\n\
snippet loo\n\
	loop { ${1} }\n\
snippet ea\n\
	each { |${1:e}| ${2} }\n\
snippet ead\n\
	each do |${1:e}|\n\
		${2}\n\
	end\n\
snippet eab\n\
	each_byte { |${1:byte}| ${2} }\n\
snippet eac- each_char { |chr| .. }\n\
	each_char { |${1:chr}| ${2} }\n\
snippet eac- each_cons(..) { |group| .. }\n\
	each_cons(${1:2}) { |${2:group}| ${3} }\n\
snippet eai\n\
	each_index { |${1:i}| ${2} }\n\
snippet eaid\n\
	each_index do |${1:i}|\n\
		${2}\n\
	end\n\
snippet eak\n\
	each_key { |${1:key}| ${2} }\n\
snippet eakd\n\
	each_key do |${1:key}|\n\
		${2}\n\
	end\n\
snippet eal\n\
	each_line { |${1:line}| ${2} }\n\
snippet eald\n\
	each_line do |${1:line}|\n\
		${2}\n\
	end\n\
snippet eap\n\
	each_pair { |${1:name}, ${2:val}| ${3} }\n\
snippet eapd\n\
	each_pair do |${1:name}, ${2:val}|\n\
		${3}\n\
	end\n\
snippet eas-\n\
	each_slice(${1:2}) { |${2:group}| ${3} }\n\
snippet easd-\n\
	each_slice(${1:2}) do |${2:group}|\n\
		${3}\n\
	end\n\
snippet eav\n\
	each_value { |${1:val}| ${2} }\n\
snippet eavd\n\
	each_value do |${1:val}|\n\
		${2}\n\
	end\n\
snippet eawi\n\
	each_with_index { |${1:e}, ${2:i}| ${3} }\n\
snippet eawid\n\
	each_with_index do |${1:e},${2:i}|\n\
		${3}\n\
	end\n\
snippet reve\n\
	reverse_each { |${1:e}| ${2} }\n\
snippet reved\n\
	reverse_each do |${1:e}|\n\
		${2}\n\
	end\n\
snippet inj\n\
	inject(${1:init}) { |${2:mem}, ${3:var}| ${4} }\n\
snippet injd\n\
	inject(${1:init}) do |${2:mem}, ${3:var}|\n\
		${4}\n\
	end\n\
snippet map\n\
	map { |${1:e}| ${2} }\n\
snippet mapd\n\
	map do |${1:e}|\n\
		${2}\n\
	end\n\
snippet mapwi-\n\
	enum_with_index.map { |${1:e}, ${2:i}| ${3} }\n\
snippet sor\n\
	sort { |a, b| ${1} }\n\
snippet sorb\n\
	sort_by { |${1:e}| ${2} }\n\
snippet ran\n\
	sort_by { rand }\n\
snippet all\n\
	all? { |${1:e}| ${2} }\n\
snippet any\n\
	any? { |${1:e}| ${2} }\n\
snippet cl\n\
	classify { |${1:e}| ${2} }\n\
snippet col\n\
	collect { |${1:e}| ${2} }\n\
snippet cold\n\
	collect do |${1:e}|\n\
		${2}\n\
	end\n\
snippet det\n\
	detect { |${1:e}| ${2} }\n\
snippet detd\n\
	detect do |${1:e}|\n\
		${2}\n\
	end\n\
snippet fet\n\
	fetch(${1:name}) { |${2:key}| ${3} }\n\
snippet fin\n\
	find { |${1:e}| ${2} }\n\
snippet find\n\
	find do |${1:e}|\n\
		${2}\n\
	end\n\
snippet fina\n\
	find_all { |${1:e}| ${2} }\n\
snippet finad\n\
	find_all do |${1:e}|\n\
		${2}\n\
	end\n\
snippet gre\n\
	grep(${1:/pattern/}) { |${2:match}| ${3} }\n\
snippet sub\n\
	${1:g}sub(${2:/pattern/}) { |${3:match}| ${4} }\n\
snippet sca\n\
	scan(${1:/pattern/}) { |${2:match}| ${3} }\n\
snippet scad\n\
	scan(${1:/pattern/}) do |${2:match}|\n\
		${3}\n\
	end\n\
snippet max\n\
	max { |a, b| ${1} }\n\
snippet min\n\
	min { |a, b| ${1} }\n\
snippet par\n\
	partition { |${1:e}| ${2} }\n\
snippet pard\n\
	partition do |${1:e}|\n\
		${2}\n\
	end\n\
snippet rej\n\
	reject { |$