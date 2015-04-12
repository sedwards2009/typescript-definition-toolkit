/* Parser for TypeScript definition files. */

/* lexical grammar */
%lex

StringLiteral (\"[^\"]*\")|(\'[^\']*\')
IdentifierRegexp ([$_a-zA-Z][$_a-zA-Z0-9]*)

%s brackets

%%
\s+                               { /* return 'WhiteSpace'; */ }
"//"[^\x0d\x0a]*[\x0d\x0a]        { return 'SingleLineComment'; }
"/*"(.|[\x0d\x0a])*?"*/"          { return 'MultiLineComment'; }
[0-9]+                            { return 'Numeric'; }
<<EOF>>                           { return 'EOF'; }
"import"                          { return 'IMPORT'; }
"export"                          { return 'EXPORT'; }
"require"                         { return 'REQUIRE'; }
"any"                             { return 'ANY'; }
"number"                          { return 'NUMBER'; }
"boolean"                         { return 'BOOLEAN'; }
"string"                          { return 'STRING'; }
"void"                            { return 'VOID'; }
"new"                             { return 'NEW'; }
"public"                          { return 'PUBLIC'; }
"private"                         { return 'PRIVATE'; }
"protected"                       { return 'PROTECTED'; }
"..."                             { return 'ELLIPSIS'; }
"?"                               { return 'QUESTIONMARK'; }
"<"                               { return 'LANGLE'; }
">"                               { return 'RANGLE'; }
"("                               { this.begin('brackets'); return 'LBRACKET'; }
")"                               { this.popState(); return 'RBRACKET'; }
"=>"                              { return 'ARROW'; }
"="                               { return 'EQUALS'; }
":"                               { return 'COLON'; }
";"                               { return 'SEMI'; }
","                               { return 'COMMA'; }
"."                               { return 'DOT'; }
"module"                          { return 'MODULE'; }
"interface"                       { return 'INTERFACE'; }
"extends"                         { return 'EXTENDS'; }
{StringLiteral}                   { yytext = yytext.slice(1,-1); return 'String'; }
"{"                               { this.begin('INITIAL'); return 'LBRACE'; }
"}"                               { this.popState(); return 'RBRACE'; }
"|"                               { return 'PIPE'; }
"["                               { return 'LSQUARE'; }
"]"                               { return 'RSQUARE'; }
<brackets>{IdentifierRegexp} { return 'IdentifierInBrackets'; }
{IdentifierRegexp}                { return 'Identifier'; }

/lex

%start file

%% /* language grammar */

file
    : declaration_source_file EOF
        { return $1;}
    | EOF
        {return [];}
    ;

declaration_source_file
    : declaration_elements
        { $$ = $1;}
    ;
    
declaration_elements
    : declaration_elements declaration_element
        { $$ = $1.concat($2); }
    | declaration_element
        { $$ = [$1]; }
    ;

declaration_element
    : comment
        { $$ = $1;}
    | export_assignment
        { $$ = $1;}
    | ambient_external_module_declaration
        { $$ = $1;}
    | interface_declaration
        { $$ = $1;}
    | EXPORT interface_declaration
        { $2.export = true; $$ = $2;}
    ;

comment
    : SingleLineComment
        { $$ = {type: 'SingleLineComment', value: $1}; }
    | MultiLineComment
        { $$ = {type: 'MultiLineComment', value: $1}; }
    ;

export_assignment
    : EXPORT EQUALS Identifier SEMI
        { $$ = {type: 'Export', value: $3}; }
    ;

ambient_external_module_declaration
    : MODULE String LBRACE ambient_external_module_body RBRACE
        { $$ = {type: "Module", name: $2, value: $4 }; }
    | MODULE String LBRACE RBRACE
        { $$ = {type: "Module", name: $2, value: [] }; }
    ;

ambient_external_module_body
    : ambient_external_module_elements
        { $$ = $1; }
    ;

ambient_external_module_elements
    : ambient_external_module_element
        { $$ = [$1]; }
    | ambient_external_module_elements ambient_external_module_element
        { $1.push($2); $$ = $1; }
    ;

ambient_external_module_element
    : ambient_module_element
        { $$ = $1; }
    | export_assignment
        { $$ = $1; }
    | EXPORT external_import_declaration
        { $2.export = true; $$ = $2; }
    | external_import_declaration
        { $$ = $1; }
    ;

external_import_declaration
    : IMPORT Identifier EQUALS external_module_reference SEMI
        { $$ = {type: "Import", name: $2, module: $4, export: false }; }
    ;

external_module_reference
    : REQUIRE LBRACKET String RBRACKET
        { $$ = $3; }
    ;

interface_declaration
    : INTERFACE Identifier type_parameters interface_extends_clause object_type
        { $$ = {type: 'Interface', name: $2, typeParameters: $3, extends: $4, objectType: $5}; }
    | INTERFACE Identifier interface_extends_clause object_type
        { $$ = {type: 'Interface', name: $2, typeParameters: [], extends: $3, objectType: $4}; }
    | INTERFACE Identifier type_parameters object_type
        { $$ = {type: 'Interface', name: $2, typeParameters: $3, extends: [], objectType: $4}; }
    | INTERFACE Identifier object_type
        { $$ = {type: 'Interface', name: $2, typeParameters: [], extends: [], objectType: $3}; }
    ;

interface_extends_clause
    : EXTENDS class_or_interface_type_list
        { $$ = $2; }
    ;

class_or_interface_type_list
    : class_or_interface_type
        { $$ = [$1]; }
    | class_or_interface_type_list COMMA class_or_interface_type
         { $2.push($1); $$ = $2; }
    ;

class_or_interface_type
    : type_reference
        { $$ = $1; }
    ;

/* types */
type_parameters
    : LANGLE type_parameter_list RANGLE
        { $$ = $2; }
    ;

type_parameter_list
    : type_parameter
        { $$ = [$1]; }
    | type_parameter_list COMMA type_parameter
        { $1.push($3); $$ = $1; }
    ;

type_parameter
    : Identifier constraint
        { $$ = {type: 'Parameter', name: $1, constraint: $2}; }
    | Identifier
        { $$ = {type: 'Parameter', name: $1, constraint: null}; }
    ;

constraint
    : EXTENDS type
        { $$ = $2; }
    ;

type_arguments
    : LANGLE type_argument_list RANGLE
        { $$ = $2; }
    ;

type_argument_list
    : type_argument
        { $$ = [$1]; }
    | type_argument_list COMMA type_argument
        { $1.push($3); $$ = $1;}
    ;

type_argument
    : type
        { $$ = $1; }
    ;

type
    : primary_or_union_type
        { $$ = $1; }
    | function_type
        { $$ = $1; }
    | constructor_type
        { $$ = $1; }
    ;

primary_or_union_type
    : primary_type
        { $$ = $1; }
    | union_type
        { $$ = $1; }
    ;

primary_type
    : parenthesized_type
        { $$ = $1; }
    | predefined_type
        { $$ = $1; }
    | type_reference
        { $$ = $1; }
    | object_type
        { $$ = $1; }
    | array_type
        { $$ = $1; }
    | tuple_type
        { $$ = $1; }
    | type_query
        { $$ = $1; }
    ;

parenthesized_type
    : LBRACKET type RBRACKET
        { $$ = $2; }
    ;
    
predefined_type
    : ANY
        { $$ = 'any'; }
    | NUMBER
        { $$ = 'number'; }
    | BOOLEAN
        { $$ = 'boolean'; }
    | STRING
        { $$ = 'string'; }
    | VOID
        { $$ = 'void'; }
    ;

type_reference
    : type_name type_arguments
        { $$ = $1 + $2; }
    | type_name
        { $$ = $1; }
    ;

/* ********************************************* */
/*
type_name
    : Identifier
        { $$ = $1; }
    | module_name DOT Identifier
        { $$ = $1 + "." + $3; }
    ;

module_name
    : Identifier
        { $$ = $1; }
    | module_name DOT Identifier
        { $$ = $1 + "." + $3; }
    ;
*/

type_name
    : Identifier
        { $$ = $1; }
    | type_name DOT Identifier
        { $$ = $1 + "." + $3; }
    ;
/* ********************************************* */

object_type
    : LBRACE type_body RBRACE
      { $$ = {type: 'Object', members: $2 }; }
    | LBRACE RBRACE
      { $$ = {type: 'Object', members: [] }; }
    ;
    
type_body
    : type_member_list SEMI
        { $$ = $1; }
    | type_member_list
        { $$ = $1; }
    ;
    
type_member_list
    : type_member
      { $$ = [$1]; }
    | type_member_list SEMI type_member
      { $1.push($3); $$ = [$1]; }
    ;

type_member
    : property_signature
        { $$ = $1; }
    | call_signature
        { $$ = $1; }
    | construct_signature
        { $$ = $1; }
    | index_signature
        { $$ = $1; }
    | method_signature
        { $$ = $1; }
    ;

array_type
    : primary_type LSQUARE RSQUARE
        { $$ = $1 + "[]"; }
    ;
    
tuple_type
    : LSQUARE tuple_element_types RSQUARE
        { $$ = "[" + $1 + "]"; }
    ;

tuple_element_types
    : tuple_element_type
        { $$ = [$1]; }
    | tuple_element_types COMMA tuple_element_type
        { $1.push($3); $$ = $1; }
    ;

tuple_element_type
    : type
      { $$ = $1; }
    ;

union_type
    : primary_or_union_type PIPE primary_type
      { $$ = $1 + "|" + $3; }
    ;

function_type
    : type_parameters LBRACKET parameter_list RBRACKET ARROW type
      { $$ = $1 + "(" + $3 + ") => " + $6; }
    | LBRACKET parameter_list RBRACKET ARROW type
      { $$ = "(" + $2 + ") => " + $5; }
    | type_parameters LBRACKET RBRACKET ARROW type
      { $$ = $1 + "() => " + $5; }
    | LBRACKET RBRACKET ARROW type
      { $$ = "() => " + $4; }
    ;  

constructor_type
    : NEW type_parameters LBRACKET parameter_list RBRACKET ARROW type
      { $$ = "new " + $2 + "(" + $4 + ") => " + $7; }
    | NEW LBRACKET parameter_list RBRACKET ARROW type
      { $$ = "new(" + $3 + ") => " + $6; }
    | NEW type_parameters LBRACKET RBRACKET ARROW type
      { $$ = "new " + $2 + "() => " + $6; }
    | NEW LBRACKET RBRACKET ARROW type
      { $$ = "new () => " + $5; }
    ;

type_query
    : TYPEOF type_query_expression
       { $$ = "typeof " + $2; }
    ;
    
type_query_expression
    : Identifier
        { $$ = $1;}
    | type_query_expression DOT Identifier
        { $$ = $1 + "." + $3; }
    ;

property_signature
    : property_name QUESTIONMARK type_annotation
        { $$ = $1 + "?" + $3; }
    | property_name type_annotation
        { $$ = $1 + $2; }
    | property_name QUESTIONMARK
        { $$ = $1 + "?"; }
    | property_name
        { $$ = $1; }
    ;

property_name
    : Identifier
    | string
    | numeric
    ;

call_signature
    : type_parameters LBRACKET parameter_list RBRACKET type_annotation
        { $$ = $1 + "(" + $3 + "): " + $5; }
    | LBRACKET parameter_list RBRACKET type_annotation
        { $$ = "(" + $2 + "): " + $4; }
    | type_parameters LBRACKET RBRACKET type_annotation
        { $$ = $1 + "(): " + $4; }
    | LBRACKET RBRACKET type_annotation
        { $$ = "()" + $3; }
    | type_parameters LBRACKET parameter_list RBRACKET
        { $$ = $1 + "(" + $3 + ")"; }
    | LBRACKET parameter_list RBRACKET
        { $$ = "(" + $2 + ")"; }
    | type_parameters LBRACKET RBRACKET
        { $$ = $1 + "()"; }
    | LBRACKET RBRACKET
        { $$ = "()"; }
    ;

parameter_list
    : required_parameter_list
        { $$= $1; }
    | optional_parameter_list
        { $$= $1; }
    | rest_parameter
        { $$= $1; }
    | required_parameter_list COMMA optional_parameter_list
        { $$= $1 + ", " + $3; }
    | required_parameter_list COMMA rest_parameter
        { $$= $1 + ", " + $3; }
    | optional_parameter_list COMMA rest_parameter
        { $$= $1 + ", " + $3; }
    | required_parameter_list COMMA optional_parameter_list COMMA rest_parameter
        { $$= $1 + ", " + $3 + "" + $5; }
    ;

required_parameter_list
    : required_parameter
        { $$ = [$1];}
    | required_parameter_list COMMA required_parameter
        { $1.push($3); $$ = $1; }
    ;

required_parameter
    : accessibility_modifier IdentifierInBrackets type_annotation
        { $$ = $1 + " " + $2 + ": " + $3; }
    | IdentifierInBrackets type_annotation
        { $$ = $1 + ": " + $2; }
    | accessibility_modifier IdentifierInBrackets
        { $$ = $1 + " " + $2; }
    | IdentifierInBrackets
        { $$ = $1; }
    | IdentifierInBrackets COLON String 
        { $$ = $1 + ": " + $3; }
    ;

accessibility_modifier
    : PUBLIC
        { $$ = 'public'; }
    | PRIVATE
        { $$ = 'private'; }
    | PROTECTED
        { $$ = 'protected'; }
    ;

optional_parameter_list
    : optional_parameter
        { $$ = $1; }
    | optional_parameter_list COMMA optional_parameter
        { $1.push($3); $$ = $1; }
    ;

optional_parameter
    : accessibility_modifier IdentifierInBrackets QUESTIONMARK type_annotation
        { $$ = $1 + " " + $2 + "?: " + $4; }
    | IdentifierInBrackets QUESTIONMARK type_annotation
        { $$ = $1 + "?: " + $3; }    
    | accessibility_modifier IdentifierInBrackets QUESTIONMARK
        { $$ = $1 + " " + $2 + "?"; }    
    | IdentifierInBrackets QUESTIONMARK
        { $$ = $1 + "?"; }
    | accessibility_modifier IdentifierInBrackets type_annotation initialiser
        { $$ = $1 + " " + $2 + ":" + $3 + "=" + $4; }   
    | IdentifierInBrackets type_annotation initialiser
        { $$ = $1 + ": " + $2 + "=" + $3; }
    | accessibility_modifier IdentifierInBrackets initialiser
        { $$ = $1 + " " + $2 + "=" + $3; }       
    | IdentifierInBrackets initialiser
        { $$ = $1 + "=" + $2; }
    | IdentifierInBrackets QUESTIONMARK COLON String
       { $$ = $1 + "?: " + $4; }
    ;

rest_parameter
    : ELLIPSIS IdentifierInBrackets type_annotation
       { $$ = "..." + $2 + ": " + $3; }
    | ELLIPSIS IdentifierInBrackets
       { $$ = "..." + $2; }
    ;

construct_signature
     : NEW type_parameters LBRACKET parameter_list RBRACKET type_annotation
       { $$ = "new " + $1 + "(" + $4 + ")" + $6;}
     | NEW type_parameters LBRACKET  RBRACKET type_annotation
       { $$ = "new " + $1 + "()" + $5;}
     | NEW type_parameters LBRACKET parameter_list RBRACKET
       { $$ = "new " + $1 + "(" + $4 + ")";}
     | NEW type_parameters LBRACKET RBRACKET 
       { $$ = "new " + $1 + "()";}
     | NEW LBRACKET parameter_list RBRACKET type_annotation
       { $$ = "new (" + $3 + ")" + $5;}
     | NEW LBRACKET  RBRACKET type_annotation
       { $$ = "new ()" + $4;}  
     | NEW LBRACKET parameter_list RBRACKET
       { $$ = "new (" + $3 + ")";}
     | NEW LBRACKET RBRACKET 
       { $$ = "new ()";}
     ;

index_signature
    : LSQUARE Identifier COLON STRING RSQUARE type_annotation
        { $$ = "[" + $2 + ": string]" + $6;}
    | LSQUARE Identifier COLON NUMBER RSQUARE type_annotation
        { $$ = "[" + $2 + ": number]" + $6;}
    ;

method_signature
    : property_name QUESTIONMARK call_signature
      { $$ = $1 + "?" + $3; }
    | property_name call_signature
      { $$ = $1 + $2; }
    ;

type_alias_declaration
    : TYPE Identifier EQUALS type SEMI
      { $$ = "type " + $2 + "=" + $4 + ";"; }
    ;
type_annotation
    : COLON type
      { $$ = $2; }
    ;