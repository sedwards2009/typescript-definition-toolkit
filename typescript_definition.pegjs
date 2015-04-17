/* Parser for TypeScript definition files. */

start
    = _ result:declaration_element* _
        { return result; }

_ "WhiteSpace" = $([ \t\r\n]* (comment [ \t\r\n]*)*)

__ "MandatoryWhiteSpace" = $([ \t\r\n]+ (comment [ \t\r\n]*)*)

IMPORT = "import"

DECLARE = "declare"

EXPORT = "export"

REQUIRE = "require"

FUNCTION = "function"

TYPEOF = "typeof"

ANY = "any"

NUMBER = "number"

BOOLEAN = "boolean"

STRING = "string"

VOID = "void"

NEW = "new"

TYPE = "type"

PUBLIC = "public"

PRIVATE = "private"

PROTECTED = "protected"

ENUM = "enum"

STATIC = "static"

IMPLEMENTS  = "implements"

ELLIPSIS = "..."

QUESTIONMARK = "?"

LANGLE = "<"

RANGLE = ">"

LBRACKET = "("

RBRACKET = ")"

ARROW = "=>"

EQUALS = "="

COLON = ":"

SEMI = ";"

COMMA = ","

DOT = "."

MODULE = "module"

INTERFACE = "interface"

CLASS = "class"

CONSTRUCTOR = "constructor"

EXTENDS = "extends"

VAR = "var"

LBRACE = "{"

RBRACE = "}"

PIPE = "|"

LSQUARE = "["

RSQUARE = "]"

Identifier
    = $([$_a-zA-Z][$_a-zA-Z0-9]*)

StringLiteral
    = '"' $([^"]*) '"'
    / "'" $([^']*) "'"

Numeric
    = $[0-9]+

declaration_element
    = export_assignment
    / interface_declaration
    / EXPORT _ interface_declaration
    / ambient_external_module_declaration
    / type_alias_declaration
    / EXPORT type_alias_declaration
    / import_declaration
    / EXPORT import_declaration
    / ambient_declaration
    / EXPORT ambient_declaration
    / external_import_declaration /* FIXME */
    / EXPORT external_import_declaration /* FIXME */

comment
    = SingleLineComment
    / MultiLineComment

SingleLineComment
    = "//" $[^\x0d\x0a]* [\x0d\x0a]
    
MultiLineComment
    = "/*" $(!"*/" .)* "*/"


export_assignment
    = EXPORT _ EQUALS _ Identifier _ SEMI

ambient_external_module_declaration
    = DECLARE __ MODULE __ StringLiteral _ LBRACE _ (ambient_external_module_element _)* RBRACE


ambient_external_module_element
    = EXPORT __ external_import_declaration _
    / external_import_declaration _
    / export_assignment _
    / ambient_module_element _

external_import_declaration
    = IMPORT __ Identifier _ EQUALS _ external_module_reference _ SEMI

external_module_reference
    = REQUIRE _ LBRACKET _ StringLiteral _ RBRACKET

interface_declaration
    = INTERFACE __ Identifier _ type_parameters __ interface_extends_clause _ object_type
    / INTERFACE __ Identifier __ interface_extends_clause _ object_type
    / INTERFACE __ Identifier _ type_parameters _ object_type
    / INTERFACE __ Identifier _ object_type

interface_extends_clause
    = EXTENDS __ class_or_interface_type_list

class_or_interface_type_list
    = type_reference (_ COMMA _ type_reference)*

/* types */
type_parameters
    = LANGLE _ type_parameter_list _ RANGLE

type_parameter_list
    = type_parameter (_ COMMA _ type_parameter)*

type_parameter
    = Identifier constraint?

constraint
    = EXTENDS type

type_arguments
    = LANGLE type_argument_list RANGLE

type_argument_list
    = type_argument
    / type_argument COMMA type_argument_list

type_argument
    = type

type
    = primary_or_union_type
    / function_type
    / constructor_type

primary_or_union_type
    = primary_type
    / union_type

primary_type
    = parenthesized_type _ array_square?
    / predefined_type _ array_square?
    / type_reference _ array_square?
    / object_type _ array_square?
//    / array_type
    / tuple_type _ array_square?
    / type_query _ array_square?

parenthesized_type
    = LBRACKET _ type _ RBRACKET
    
predefined_type
    = ANY
    / NUMBER
    / BOOLEAN
    / STRING
    / VOID

type_reference
    = type_name _ type_arguments
    / type_name

type_name
    = $(Identifier (DOT Identifier)*)

object_type
    = LBRACE _ type_body _ RBRACE
    / LBRACE _ RBRACE

type_body
    = (type_member _ SEMI _)*

type_member_list
    = (type_member _)+ SEMI

type_member
    = call_signature
    / construct_signature
    / index_signature
    / method_signature
    / property_signature

// This is changed to avoid left recursion.
//array_type
//    = primary_type LSQUARE RSQUARE
    
array_square = (LSQUARE RSQUARE)*
    
tuple_type
    = LSQUARE _ tuple_element_types _ RSQUARE

tuple_element_types
    = type (_ COMMA _ type)*

union_type
    = primary_type PIPE primary_or_union_type

function_type
    = type_parameters _ LBRACKET _ parameter_list _ RBRACKET _ ARROW _ type
    / LBRACKET _ parameter_list _ RBRACKET _ ARROW _ type
    / type_parameters _ LBRACKET _ RBRACKET _ ARROW _ type
    / LBRACKET _ RBRACKET _ ARROW _ type

constructor_type
    = NEW _ type_parameters _ LBRACKET _ parameter_list _ RBRACKET _ ARROW _ type
    / NEW _ LBRACKET _ parameter_list _ RBRACKET _ ARROW _ type
    / NEW _ type_parameters _ LBRACKET RBRACKET _ ARROW _ type
    / NEW _ LBRACKET _ RBRACKET _ ARROW _ type

type_query
    = TYPEOF __ type_query_expression
    
type_query_expression
    = Identifier (DOT Identifier)*

property_signature
    = property_name QUESTIONMARK _ type_annotation
    / property_name _ type_annotation
    / property_name _ QUESTIONMARK
    / property_name

property_name
    = Identifier
    / StringLiteral
    / Numeric

call_signature
    = type_parameters _ LBRACKET _ parameter_list _ RBRACKET _ type_annotation
    / LBRACKET parameter_list RBRACKET type_annotation
    / type_parameters LBRACKET RBRACKET type_annotation
    / LBRACKET RBRACKET type_annotation
    / type_parameters LBRACKET parameter_list RBRACKET
    / LBRACKET parameter_list RBRACKET
    / type_parameters LBRACKET RBRACKET
    / LBRACKET RBRACKET

parameter_list
    = required_parameter_list _ COMMA _ optional_parameter_list COMMA rest_parameter
    / required_parameter_list _ COMMA _ optional_parameter_list
    / required_parameter_list _ COMMA _ rest_parameter
    / optional_parameter_list _ COMMA _ rest_parameter
    / rest_parameter
    / optional_parameter_list
    / required_parameter_list

required_parameter_list
    = required_parameter (_ COMMA _ required_parameter _)*

required_parameter
    = accessibility_modifier? _ Identifier _ type_annotation? ![?]  // <- Don't om nom part of an optional parameter.
    / Identifier _ COLON _ StringLiteral

/*
required_parameter
    = accessibility_modifier _ Identifier _ type_annotation
    / Identifier _ COLON _ StringLiteral
    / Identifier _ type_annotation
    / accessibility_modifier _ Identifier
    / Identifier
*/

accessibility_modifier
    = PUBLIC
    / PRIVATE
    / PROTECTED

optional_parameter_list
    = optional_parameter (_ COMMA _ optional_parameter _)*

optional_parameter
    = accessibility_modifier _ Identifier _ QUESTIONMARK _ type_annotation
    / accessibility_modifier _ Identifier _ QUESTIONMARK
    / accessibility_modifier _ Identifier _ type_annotation _ initialiser
    / accessibility_modifier _ Identifier _ initialiser
    / Identifier _ QUESTIONMARK _ COLON _ StringLiteral
    / Identifier _ QUESTIONMARK _ type_annotation
    / Identifier _ QUESTIONMARK
    / Identifier _ type_annotation _ initialiser
    / Identifier _ initialiser

initialiser
    = StringLiteral
    / Numeric

rest_parameter
    = ELLIPSIS Identifier _ type_annotation
    / ELLIPSIS Identifier

construct_signature
     = NEW _ type_parameters _ LBRACKET _ parameter_list _ RBRACKET _ type_annotation
     / NEW _ type_parameters _ LBRACKET _ RBRACKET _ type_annotation
     / NEW _ type_parameters _ LBRACKET _ parameter_list _ RBRACKET
     / NEW _ type_parameters _ LBRACKET _ RBRACKET 
     / NEW _ LBRACKET _ parameter_list _ RBRACKET _ type_annotation
     / NEW _ LBRACKET _ RBRACKET _ type_annotation
     / NEW _ LBRACKET _ parameter_list _ RBRACKET
     / NEW _ LBRACKET _ RBRACKET 

index_signature
    = LSQUARE _ Identifier _ COLON _ (STRING / NUMBER) _ RSQUARE _ type_annotation

method_signature
    = property_name QUESTIONMARK? call_signature

type_alias_declaration
    = TYPE __ Identifier _ EQUALS _ type _ SEMI

type_annotation
    = COLON _ type
    
import_declaration
    = IMPORT __ Identifier _ EQUALS _ entity_name _ SEMI

entity_name
    = Identifier (DOT Identifier)*
        
/* Ambients */
ambient_declaration
    = DECLARE __ ambient_variable_declaration
    / DECLARE __ ambient_function_declaration
    / DECLARE __ ambient_class_declaration
    / DECLARE __ ambient_enum_declaration
    / DECLARE __ ambient_module_declaration

ambient_variable_declaration
    = VAR Identifier type_annotation SEMI
    / VAR Identifier SEMI

ambient_function_declaration
    = FUNCTION __ Identifier _ call_signature _ SEMI

ambient_class_declaration
    = CLASS __ Identifier _ type_parameters __ class_heritage _ LBRACE _ ambient_class_body _ RBRACE
    / CLASS __ Identifier __ class_heritage _ LBRACE _ ambient_class_body _ RBRACE

ambient_class_body
    = ambient_class_body_elements
    
ambient_class_body_elements
    = ambient_class_body_element*

ambient_class_body_element
    = ambient_constructor_declaration
    / ambient_property_member_declaration
    / index_signature

ambient_constructor_declaration
    = CONSTRUCTOR _ LBRACKET _ parameter_list _ RBRACKET _ SEMI
    / CONSTRUCTOR _ LBRACKET _ RBRACKET _ SEMI

ambient_property_member_declaration
    = STATIC __ property_name _ SEMI
    / STATIC __ property_name __ type_annotation _ SEMI
    / accessibility_modifier __ STATIC __ property_name _ SEMI
    / accessibility_modifier __ property_name _ SEMI
    / accessibility_modifier __ STATIC __ property_name _ type_annotation _ SEMI
    / accessibility_modifier __ property_name _ type_annotation _ SEMI    
    / accessibility_modifier __ STATIC _ property_name _ call_signature _ SEMI
    / accessibility_modifier __ property_name _ call_signature _ SEMI
    / STATIC __ property_name _ call_signature _ SEMI
    / property_name __ call_signature _ SEMI
    / property_name __ type_annotation _ SEMI
    / property_name _ SEMI

ambient_enum_declaration
    = ENUM Identifier LBRACE ambient_enum_body RBRACE
    / ENUM Identifier LBRACE RBRACE

ambient_enum_body
    = ambient_enum_member_list COMMA
    / ambient_enum_member_list

ambient_enum_member_list
    = ambient_enum_member (COMMA ambient_enum_member)*

/*
ambient_enum_member
    = property_name
    / property_name EQUALS constant_enum_value
*/
// FIXME
ambient_enum_member
    = property_name
    / property_name EQUALS StringLiteral


ambient_module_declaration
    = MODULE _ type_name _ LBRACE _ ambient_module_body _ RBRACE

ambient_module_body
    = ambient_module_element*

ambient_module_element
    = EXPORT __ ambient_variable_declaration
    / EXPORT __ ambient_function_declaration
    / EXPORT __ ambient_class_declaration
    / EXPORT __ interface_declaration
    / EXPORT __ ambient_enum_declaration
    / EXPORT __ ambient_module_declaration
    / EXPORT __ import_declaration
    / ambient_variable_declaration
    / ambient_function_declaration
    / ambient_class_declaration
    / interface_declaration
    / ambient_enum_declaration
    / ambient_module_declaration
    / import_declaration
    / comment
    
/* Class */
// class_declaration

class_heritage
    = class_extends_clause implements_clause
    
class_extends_clause
    = EXTENDS class_type

implements_clause
    = IMPLEMENTS class_or_interface_type_list

class_type
    = type_reference
