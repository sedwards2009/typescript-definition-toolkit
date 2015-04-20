/* Parser for TypeScript definition files. */

{
var WHITESPACE = 0;
var MODULE = 1;
var INTERFACE = 2;
var FUNCTION = 3;
var FUNCTION_TYPE = 4;
var PARAMETER = 5;
var OBJECT_TYPE = 6;
var OBJECT_TYPE_REF = 7;
var IMPORT_DECLARATION = 8;

}

start
    = front:_ result:declaration_element* tail:_
        {
        if (front !== null) {
          result.push(front);
        }
        if (tail !== null) {
          result.push(tail);
        }
        return result;
        }
                 
_ "WhiteSpace" = value:([ \t\r\n]*) comment_list:(comment [ \t\r\n]*)*
    {
      return { type: WHITESPACE, value: value.join("") + (comment_list === null ? "" : comment_list.join("") ) };
    }

__ "MandatoryWhiteSpace" = value:[ \t\r\n]+ comment_list:(comment [ \t\r\n]*)*
    {
      return { type: WHITESPACE, value: value.join("") + (comment_list === null ? "" : comment_list.join("") ) };
    }

comment
    = SingleLineComment
    / MultiLineComment

SingleLineComment
    = $("//" [^\x0d\x0a]* [\x0d\x0a])
    
MultiLineComment
    = $("/*" (!"*/" .)* "*/")

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
    = $('"' [^"]* '"')
    / $("'" [^']* "'")

Numeric
    = $[0-9]+

declaration_element
    = export_assignment
    / interface_declaration
    / EXPORT _ i:interface_declaration { i.export = true; return i; }
    / ambient_external_module_declaration
    / type_alias_declaration
    / EXPORT type_alias_declaration
    / import_declaration
    / EXPORT import_declaration
    / ambient_declaration
    / EXPORT ambient_declaration
    / external_import_declaration /* FIXME */
    / EXPORT external_import_declaration /* FIXME */

export_assignment
    = EXPORT _ EQUALS _ Identifier _ SEMI

ambient_external_module_declaration
    = DECLARE __ MODULE __ name:StringLiteral _ LBRACE _ members:(ambient_external_module_element)* RBRACE
    {
        return {type: MODULE, name: name, members: members, ambient: true};
    }

ambient_external_module_element
    = EXPORT __ dec:external_import_declaration _
    {
      dec.export = true;
      return dec;
    }
    / dec:external_import_declaration _
    {
      return dec;
    }
    / exp:export_assignment _
    {
      return exp;
    }
    / ame:ambient_module_element _
    {
      return ame;
    }

external_import_declaration
    = IMPORT __ name:Identifier _ EQUALS _ ext:external_module_reference _ SEMI
    {
      return { type: IMPORT_DECLARATION, name: name, externalModule: ext};
    }

external_module_reference
    = REQUIRE _ LBRACKET _ name:StringLiteral _ RBRACKET
    {
      return name;
    }

interface_declaration
    = INTERFACE __ name:Identifier parameters:(_ type_parameters)? extends_:(__ interface_extends_clause)? _ members:object_type
    {
        return {type: INTERFACE, name: name, parameters: parameters || [], extends: extends_ || [], members: members, export: false};
    }

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
    / name:predefined_type _ array_square?
    {
      return { type: OBJECT_TYPE_REF, name: name };
    }
    / name:type_reference _ array_square?
    {
      return { type: OBJECT_TYPE_REF, name: name };
    }
    / object_type _ array_square?
//    / array_type
    / tuple_type _ array_square?
    / type_query _ array_square?

parenthesized_type
    = LBRACKET _ type:type _ RBRACKET
    {
      return type;
    }
    
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
    = LBRACE _ body:type_body _ RBRACE
    {
      return body;
    }
    / LBRACE _ RBRACE
    {
      return [];
    }

type_body
    = members:(type_body_member)*
    {
      var result = [];
      var i;
      for (i=0; i<members.length; i++) {
        result = result.concat(members[i]);
      }
      return result;
    }
    
type_body_member
    = member:type_member _ SEMI postws:_
    {
      var result = [];
      result.push(member);
      if (postws.value !== "") {
        result.push(postws);
      }
      return result;
    }

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
    = type_parameters:type_parameters? _ LBRACKET _ parameters:parameter_list? _ RBRACKET _ type_annotation:type_annotation?
        {
          return {type: FUNCTION_TYPE, typeParameters: type_parameters, parameters: parameters || [], returnType: type_annotation };
        }

parameter_list
    = requiredParameterList:required_parameter_list optionalParameterList:(_ COMMA _ optional_parameter_list)? restParameter:(_ COMMA _ rest_parameter)?
    {
      if (optionalParameterList !== null) {
        requiredParameterList = requiredParameterList.concat(optionalParameterList[3]);
      }
      
      if (restParameter !== null) {
        requiredParameterList.push(restParameter[3]);
      }
      
      return requiredParameterList;
    }
    / optionalParameterList:optional_parameter_list restParameter:(_ COMMA _ rest_parameter)?
    {
      if (restParameter !== null) {
        optionalParameterList.push(restParameter[3]);
      }

      return optionalParameterList;
    }
    / rest_parameter

required_parameter_list
    = firstParameter:required_parameter otherParameters:(_ COMMA _ required_parameter _)*
    {
      var result = [];
      result.push(firstParameter);
      otherParameters.forEach( function(tup) {
        result.push(tup[3]);
      });
      return result;
    }

required_parameter
    = accessibility:accessibility_modifier? _ name:Identifier _ type:type_annotation? ![?]  // <- Don't om nom part of an optional parameter.
      {
        return {type: PARAMETER, name: name, accessibility: accessibility, required: true, initialiser: null, rest: false, parameterType: type};
      }
    / name:Identifier _ COLON _ StringLiteral
      {
        return {type: PARAMETER, name: name, accessibility: null, required: true, initialiser: null, rest: false, parameterType: null };
      }


accessibility_modifier
    = PUBLIC
    / PRIVATE
    / PROTECTED

optional_parameter_list
    = firstParameter:optional_parameter otherParameters:(_ COMMA _ optional_parameter _)*
    {
      var result = [];
      result.push(firstParameter);
      otherParameters.forEach( function(tup) {
        result.push(tup[3]);
      });
      return result;
    }

optional_parameter
    = accessibility:accessibility_modifier? _ name:Identifier _ QUESTIONMARK _ type:type_annotation?
      {
        return {type: PARAMETER, name: name, accessibility: accessibility, required: false, parameterType: type, initialiser: null, rest: false };
      }
    / accessibility:accessibility_modifier? _ name:Identifier _ type:type_annotation? _ initialiser:initialiser?
      {
        return {type: PARAMETER, name: name, accessibility: accessibility, required: false, parameterType: type, initialiser: initialiser, rest: false };
      }
    / name:Identifier _ QUESTIONMARK _ COLON _ StringLiteral
      {
        return {type: PARAMETER, name: name, accessibility: null, required: false, parameterType: null,   initialiser: null, rest: false };
      }

initialiser
    = StringLiteral
    / Numeric

rest_parameter
    = ELLIPSIS name:Identifier _ parameterType:type_annotation
      {
        return {type: PARAMETER, name: name, accessibility: null, required: false, rest: true, parameterType: parameterType, initialiser: null };
      }
    / ELLIPSIS name:Identifier
      {
        return {type: PARAMETER, name: name, accessibility: null, required: false, rest: true, parameterType: null, initialiser: null };
      }

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
    = COLON _ type:type
    {
      return type;
    }
    
import_declaration
    = IMPORT __ Identifier _ EQUALS _ entity_name _ SEMI

entity_name
    = Identifier (DOT Identifier)*
        
/* Ambients */
ambient_declaration
    = DECLARE __ value:ambient_variable_declaration
    {
      value.ambient = true;
      return value;
    }
    / DECLARE __ value:ambient_function_declaration
    {
      value.ambient = true;
      return value;
    }
    / DECLARE __ value:ambient_class_declaration
    {
      value.ambient = true;
      return value;
    }
    / DECLARE __ value:ambient_enum_declaration
    {
      value.ambient = true;
      return value;
    }
    / DECLARE __ value:ambient_module_declaration
    {
      value.ambient = true;
      return value;
    }

ambient_variable_declaration
    = VAR Identifier type_annotation SEMI
    / VAR Identifier SEMI

ambient_function_declaration
    = FUNCTION __ name:Identifier _ signature:call_signature _ SEMI
        {
        return {type: FUNCTION, name: name, signature: signature, ambient: false};
        }

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
    = MODULE _ name:type_name _ LBRACE _ members:ambient_module_body _ RBRACE
        {
            return {type: MODULE, name: name, members: members, ambient: true};
        }

ambient_module_body
    = ambient_module_element*

ambient_module_element
    = EXPORT __ result:ambient_variable_declaration { result.export = true; return result; }
    / EXPORT __ result:ambient_function_declaration { result.export = true; return result; }
    / EXPORT __ result:ambient_class_declaration { result.export = true; return result; }
    / EXPORT __ result:interface_declaration { result.export = true; return result; }
    / EXPORT __ result:ambient_enum_declaration { result.export = true; return result; }
    / EXPORT __ result:ambient_module_declaration { result.export = true; return result; }
    / EXPORT __ result:import_declaration { result.export = true; return result; }
    / ambient_variable_declaration
    / ambient_function_declaration
    / ambient_class_declaration
    / interface_declaration
    / ambient_enum_declaration
    / ambient_module_declaration
    / import_declaration
    
/* Class */
// class_declaration

class_heritage
    = class_extends_clause implements_clause
    
class_extends_clause
    = EXTENDS class_type:class_type { return class_type; }

implements_clause
    = IMPLEMENTS list:class_or_interface_type_list { return list; }

class_type
    = type_reference
