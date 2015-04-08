/* Parser for TypeScript definition files. */

/* lexical grammar */
%lex
%%
\s+                               { /* return 'WhiteSpace'; */ }
"//"[^\x0d\x0a]*[\x0d\x0a]        { return 'SingleLineComment'; }
"/*"(.|[\x0d\x0a])*?"*/"          { return 'MultiLineComment'; }
<<EOF>>                           { return 'EOF'; }

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
    ;

comment
    : SingleLineComment
        { $$ = {type: 'SingleLineComment', value: $1}; }
    | MultiLineComment
        { $$ = {type: 'MultiLineComment', value: $1}; }
    ;
