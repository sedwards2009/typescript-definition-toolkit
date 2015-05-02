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
var METHOD = 9;
var PROPERTY = 10;
var TYPE_ALIAS = 11;
var INDEX_METHOD = 12;
var TYPE_PARAMETER = 13;
var TUPLE_TYPE = 14;
var EXPORT_ASSIGNMENT = 15;
var CLASS_DECLARATION = 16;
var AMBIENT_VARIABLE = 17;
var ENUM = 18;
var ENUM_MEMBER = 19;
var UNION_TYPE = 20;

}

start
    = result:declaration_element*
    {
      return result;
    }
                 
_ "WhiteSpace" = value:([ \t\r\n]*) comment_list:(comment [ \t\r\n]*)*
    {
      var result = "";
      result += value.join("");
      if (comment_list !== null) {
        comment_list.forEach( function(tup) {
          result += tup[0];
          result += tup[1].join("");
        });
      }
      return { type: WHITESPACE, value: result };
    }

__ "MandatoryWhiteSpace" = front:[ \t\r\n]? comment_list:(comment [ \t\r\n]*)+
    {
      var value = "";
      if (front !== null) {
        value += front.join("");
      }
      
      if (comment_list !== null) {
        value += comment_list.map( function(cl) { return cl[0] + cl[1].join(""); } ).join("");
      }

      return { type: WHITESPACE, value: value };
    }
    / value:[ \t\r\n]+
    {
      return { type: WHITESPACE, value: value.join("") };
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
    = str:('"' [^"]* '"')
    {
      return str[1].join("");
    }
    / str:("'" [^']* "'")
    {
      return str[1].join("");
    }

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
    / EXPORT import_declaration:import_declaration
    {
      import_declaration.export = true;;
      return import_declaration;
    }
    / ambient_declaration
    / EXPORT ambient_declaration
    / external_import_declaration /* FIXME */
    / EXPORT external_import_declaration /* FIXME */
    / ws:__
    {
      return ws;
    }
    
export_assignment
    = EXPORT _ EQUALS _ name:Identifier _ SEMI
    {
      return {type: EXPORT_ASSIGNMENT, name: name };
    }

ambient_external_module_declaration
    = DECLARE __ MODULE __ name:StringLiteral _ LBRACE members:(ambient_external_module_element)* RBRACE
    {
        return {type: MODULE, name: name, members: members, ambient: true, external: true};
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
    / ws:__
    {
    return ws;
    }
    
external_import_declaration
    = IMPORT __ name:Identifier _ EQUALS _ ext:external_module_reference _ SEMI
    {
      return { type: IMPORT_DECLARATION, name: name, externalModule: ext, export: false, external: true};
    }

external_module_reference
    = REQUIRE _ LBRACKET _ name:StringLiteral _ RBRACKET
    {
      return name;
    }

interface_declaration
    = INTERFACE __ name:Identifier typeParameters:(_ type_parameters)? extends_:(__ interface_extends_clause)? _ object_type:object_type
    {
      return {type: INTERFACE, name: name, typeParameters: typeParameters !== null ? typeParameters[1] : [],
        extends: (extends_ === null ? [] : extends_[1]), objectType: object_type, export: false};
    }

interface_extends_clause
    = EXTENDS __ list:class_or_interface_type_list
    {
      return list;
    }

class_or_interface_type_list
    = head:type_reference rest:(_ COMMA _ type_reference)*
    {
      var result = [];
      result.push(head);
      rest.forEach( function(item) {
        result.push(item[3]);
      });
      return result;
    }

/* types */
type_parameters
    = LANGLE _ list:type_parameter_list _ RANGLE
    {
      return list;
    }

type_parameter_list
    = firstParameter:type_parameter otherParameters:(_ COMMA _ type_parameter)*
    {
      var result = [];
      result.push(firstParameter);
      otherParameters.forEach( function(tup) {
        result.push(tup[3]);
      });
      return result;
    }

type_parameter
    = name:Identifier extends_:constraint?
    {
      return { type: TYPE_PARAMETER, name: name, extends: extends_ };
    }

constraint
    = EXTENDS type:type
    {
      return type;
    }
    
type_arguments
    = LANGLE _ list:type_argument_list _ RANGLE
    {
      return list;
    }

type_argument_list
    = firstParameter:type_argument otherParameters:(_ COMMA _ type_argument)*
    {
      var result = [];
      result.push(firstParameter);
      otherParameters.forEach( function(tup) {
        result.push(tup[3]);
      });
      return result;
    }
    
type_argument
    = type

type
    = primary_or_union_type
    / function_type
    / constructor_type

primary_or_union_type
    = union_type
    / primary_type

primary_type
    = name:parenthesized_type _ array:array_square !(_ ARROW) /* A parenthesized looks very similar to the start of function signature */
    {
      return { type: OBJECT_TYPE_REF, name: name + array, typeArguments: null };
    }
    / name:predefined_type _ array:array_square
    {
      return { type: OBJECT_TYPE_REF, name: name + array, typeArguments: null };
    }
    / tr:type_reference _ array:array_square
    {
      tr.name = tr.name + array;
      return tr;
    }
    / ot:object_type _ array:array_square
    {
//      ot.name = ot.name + array;
      return ot;
    }
//    / array_type
    / tupleType:tuple_type _ array:array_square
    {
      return tupleType;
    }
    / type_query _ array:array_square

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
    = name:type_name _ ta:type_arguments
    {
      return { type: OBJECT_TYPE_REF, name: name, typeArguments: ta };
    }
    / name:type_name
    {
      return { type: OBJECT_TYPE_REF, name: name, typeArguments: null };
    }

type_name
    = $(Identifier (DOT Identifier)*)

object_type
    = LBRACE body:type_body RBRACE
    {
      return { type: OBJECT_TYPE, members: body };
    }
    / LBRACE ws:_ RBRACE
    {
      if (ws.value !== "") {
        return { type: OBJECT_TYPE, members: [ws] };
      } else {
        return { type: OBJECT_TYPE, members: [] };
      }
    }

type_body
    = firstws:_ first:type_member _ rest:(SEMI _ type_body_member)* _ SEMI? lastws:_
    {
      var result = [];
      if (firstws.value !== "") {
        result.push(firstws);
      }
      result.push(first);
      var i;
      for (i=0; i<rest.length; i++) {
        if (rest[i][1] !== null && rest[i][1].value !== "") {
          result.push(rest[i][1]);
        }
        result.push(rest[i][2]);
      }
      
      if (lastws.value !== "") {
        result.push(lastws);
      }
      return result;
    }

type_body_member
    = member:type_member
    {
      return member;
    }
    / ws:__
    {
      return ws;
    }
    
type_member_list
    = (type_member _)+ SEMI

type_member
    = signature:call_signature
    {
      return {type: METHOD, name: "", optional: false, signature: signature, static: false, };
    }
    / construct_signature
    / index_signature
    / method_signature
    / property_signature

// This is changed to avoid left recursion.
//array_type
//    = primary_type LSQUARE RSQUARE
    
array_square = squares:(LSQUARE RSQUARE)*
    {
      var result = "";
      var i;
      for (i=0; i<squares.length; i++) {
        result += "[]";
      }
      return result;
    }
    
tuple_type
    = LSQUARE _ types:tuple_element_types _ RSQUARE
    {
      return {type: TUPLE_TYPE, members: types};
    }

tuple_element_types
    = type:type rest:(_ COMMA _ type)*
    {
      var result = [];
      result.push(type);
      rest.forEach( function(r) {
        result.push(r[3]);
      });
      return result;
    }

union_type
    = head:primary_type PIPE rest:primary_or_union_type
    {
      var members = [];
      members.push(head);
      if (rest.type === UNION_TYPE) {
        members = members.concat(rest.members);
      } else {
        members.push(rest);
      }
      return {type: UNION_TYPE, members: members };
    }

function_type
    = typeParameters:type_parameters? _ LBRACKET _ parameterList:parameter_list? _ RBRACKET _ ARROW _ type:type
    {
      return { type: FUNCTION_TYPE, typeParameters: typeParameters, parameters: parameterList || [], returnType: type };
    }

constructor_type
    = NEW _ type_parameters? _ LBRACKET _ parameter_list? _ RBRACKET _ ARROW _ type

type_query
    = TYPEOF __ type_query_expression
    
type_query_expression
    = Identifier (DOT Identifier)*

property_signature
    = name:property_name qm:QUESTIONMARK? _ type_annotation:type_annotation?
    {
      return {type: PROPERTY, name: name, access: null, static: false, optional: qm !== null, signature: type_annotation };
    }

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
    / rp:rest_parameter
    {
      return [rp];
    }

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
    = NEW _ type_parameters:type_parameters? _ LBRACKET _ parameters:parameter_list? _ RBRACKET _ type_annotation:type_annotation?
    {
      return { type: METHOD, name: "new", optional: false, static: false, 
        signature:  {type: FUNCTION_TYPE, typeParameters: type_parameters, parameters: parameters || [], returnType: type_annotation } };
    }

index_signature
    = LSQUARE _ index_name:Identifier _ COLON _ index_type:(STRING / NUMBER) _ RSQUARE _ returnType:type_annotation
    {
      return { type: INDEX_METHOD,
        index: { type: PARAMETER, name: index_name, accessibility: null, required: true, rest: false,
          parameterType: { type: OBJECT_TYPE_REF, name: index_type, typeArguments: null }, initialiser: null},
        returnType: returnType };
    }

method_signature
    = name:property_name qm:QUESTIONMARK? signature:call_signature
    {
      return { type: METHOD, name:name, optional: qm!==null, static: false, signature: signature };
    }

type_alias_declaration
    = TYPE __ name:Identifier _ EQUALS _ entity:type _ SEMI
    {
      return { type: TYPE_ALIAS, name: name, entity: entity };
    }


type_annotation
    = COLON _ type:type
    {
      return type;
    }
    
import_declaration
    = IMPORT __ name:Identifier _ EQUALS _ en:entity_name _ SEMI
    {
      return { type: IMPORT_DECLARATION, name: name, externalModule: en, export: false, external: false };
    }
    
    
entity_name
    = name:Identifier rest:(DOT Identifier)*
    {
      if (rest.length !== 0) {
        return name + "." + rest.join(".");
      } else {
        return name;
      }
    }        
        
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
    = VAR _ name:Identifier type_annotation:type_annotation? _ SEMI?
    {
      return {type: AMBIENT_VARIABLE, name:name, signature: type_annotation};
    }

ambient_function_declaration
    = FUNCTION __ name:Identifier _ signature:call_signature _ SEMI
        {
        return {type: FUNCTION, name: name, signature: signature, ambient: false};
        }

ambient_class_declaration
    = CLASS __ name:Identifier _ type_parameters:type_parameters? _  extends_:(EXTENDS __ class_type)? impls:(IMPLEMENTS __ class_or_interface_type_list)? _ LBRACE members:ambient_class_body RBRACE
    {
      return {type: CLASS_DECLARATION, name: name, typeParameters: type_parameters, members: members, ambient: false,
        extends: extends_ === null || extends_ === undefined ? null : extends_[2],
        implements: impls === null || impls === undefined ? [] : impls[2]};
    }

ambient_class_body
    = ambient_class_body_elements
    
ambient_class_body_elements
    = ambient_class_body_element*

ambient_class_body_element
    = ambient_constructor_declaration
    / prop:ambient_property_member_declaration
    {
      return prop;
    }
    / index_signature
    / ws:__
    {
      return ws;
    }

ambient_constructor_declaration
    = CONSTRUCTOR _ LBRACKET _ parameter_list _ RBRACKET _ SEMI
    / CONSTRUCTOR _ LBRACKET _ RBRACKET _ SEMI

ambient_property_member_declaration
    = access:(accessibility_modifier? __) static:(STATIC __)? name:property_name _ type_annotation:type_annotation _ SEMI
    {
      return {type: PROPERTY, name: name, access: (access !== null ? access[0] : null), static: static!==null,
        optional: false, signature: type_annotation };
    }
    / (accessibility_modifier? __) static:(STATIC __)? name:property_name _ signature:call_signature _ SEMI
    {
      return {type: METHOD, name: name, static: static !== null, optional: false, signature: signature};
    }

ambient_enum_declaration
    = ENUM _ name:Identifier _ LBRACE _ member:ambient_enum_member rest_members:(_ COMMA _ ambient_enum_member)* _ RBRACE
    {
      var memberList = [];
      memberList.push(member);
      if (rest_members !== undefined && rest_members !== null) {
        rest_members.forEach( function(item) {
          memberList.push(item[3]);
        });
      }
      return { type: ENUM, name: name, members: memberList, export: false, ambient: false};
    }

/*
ambient_enum_member
    = property_name
    / property_name EQUALS constant_enum_value
*/

ambient_enum_member
    = name:property_name value:(_ EQUALS _ (StringLiteral / Numeric))?
    {
      return {type: ENUM_MEMBER, name: name, value: value !== null && value !== undefined ? value[3] : null };
    }

ambient_module_declaration
    = MODULE _ name:type_name _ LBRACE members:ambient_module_body RBRACE
    {
      return {type: MODULE, name: name, members: members, ambient: true, external: false};
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
    / EXPORT __ result:type_alias_declaration { result.export = true; return result; }
    / ambient_variable_declaration
    / ambient_function_declaration
    / ambient_class_declaration
    / interface_declaration
    / ambient_enum_declaration
    / ambient_module_declaration
    / import_declaration
    / type_alias_declaration
    / __

/* Class */
// class_declaration

/* Folded this into ambient_class_declaration above.
class_heritage
    = class_extends_clause implements_clause
        
class_extends_clause
    = EXTENDS class_type:class_type { return class_type; }

implements_clause
    = IMPLEMENTS list:class_or_interface_type_list

*/

class_type
    = type_reference
