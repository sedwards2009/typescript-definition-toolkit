/* Parser for TypeScript definition files. */

/* lexical grammar */
%lex

StringLiteral (\"[^\"]*\")|(\'[^\']*\')

%%
\s+                               { /* return 'WhiteSpace'; */ }
"//"[^\x0d\x0a]*[\x0d\x0a]        { return 'SingleLineComment'; }
"/*"(.|[\x0d\x0a])*?"*/"          { return 'MultiLineComment'; }
<<EOF>>                           { return 'EOF'; }
"export"                          { return 'EXPORT'; }
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
        { $$ = {type: "", name: $2, value: $4 }; }
    | MODULE String LBRACE RBRACE
        { $$ = {type: "", name: $2, value: [] }; }
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
        { $$ = $2; }
    | external_import_declaration
        { $$ = $1; }
    ;
