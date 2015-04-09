/* Parser for TypeScript definition files. */

/* lexical grammar */
%lex

StringLiteral (\"[^\"]*\")|(\'[^\']*\')

%%
\s+                               { /* return 'WhiteSpace'; */ }
"//"[^\x0d\x0a]*[\x0d\x0a]        { return 'SingleLineComment'; }
"/*"(.|[\x0d\x0a])*?"*/"          { return 'MultiLineComment'; }
<<EOF>>                           { return 'EOF'; }
"import"                          {return 'IMPORT'; }
"export"                          { return 'EXPORT'; }
"require"                         { return 'REQUIRE'; }
"("                               { return 'LBRACKET'; }
")"                               { return 'RBRACKET'; }
"="                               { return 'EQUALS'; }
";"                               { return 'SEMI'; }
"module"                          { return 'MODULE'; }
{StringLiteral}                   { yytext = yytext.slice(1,-1); return 'String'; }
"{"                               { return 'LBRACE'; }
"}"                               { return 'RBRACE'; }
[$_a-zA-Z][$_a-zA-Z0-9]*          { return 'Identifier'; }

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
        { $$ = { type: "ExportImport", name: $2.name, module: $2.module}; }
    | external_import_declaration
        { $$ = $1; }
    ;

external_import_declaration
    : IMPORT Identifier EQUALS external_module_reference SEMI
        { $$ = {type: "Import", name: $2, module: $4 }; }
    ;

external_module_reference
    : REQUIRE LBRACKET String RBRACKET
        { $$ = $3; }
    ;
