/*
 *  Xojo Syntax Highlighter for JavaScript
 *
 *  Originally Written by Jonathan Johnson <nilobject.com>
 *  Updated for Xojo by Thom McGrath <thezaz.com>
 *  Ported to JavaScript and jQuery by Sean Beach <seanbeach.com>
 *  
 *  Public domain. Feel free to submit any changes back to me at the above
 *  address.
 */

// make a pad with zeros function to accomodate missing PHP functions
function padWithZeros(v, n, str) {
    return new Array(n-String(v).length+1).join(str||'0') + v;
}

// Recreate the PHP str_repeat method:
function str_repeat(s, n){
    var r = [];
    while(r.length < n){ r.push(s); }
    return r.join('');
}

// IsNumerical returns 0 if the string isn't a number
// It returns 1 if it's an integer
// and returns 2 if it's a double

function IsNumerical(theString) {
    // An empty string isn't a number :P
    var len = theString.length;
    if(len == 0) { return 0; }
    
    //JS uses function level scope for all variables.
    var secondChar, type, pos;
     
    // Few options, either it begins with &h, &o, &b
    // Since any of the &_ combinations require at least
    // two characters, we'll check for that first
    if(len >= 6) {
        // Next, check to see if it starts with an &
        if(theString.substr(0, 5) == '&amp;') {
            // Finally, check for the 3 known numerical types
            secondChar = theString.substr(5,1);
            if(secondChar === 'h' || secondChar === 'o' || secondChar === 'b') {
                // All these are always considered integers
                return 1;
            }
            // If we started with an &, but weren't of any of the above types
            // we know we aren't numerical
            return 0;
        }
    }

    // Now, we start out assuming we're an integer
    type = 1;
 
    for(pos = 0; pos < len; pos++) {
        var chr = theString.substr(pos, 1);

        if(chr >= 0 && chr <= 9) {
	        // If we're between 0 and 9, we don't modify the type
        } else if (chr === '.') {
            // If we are a decimal, we now assume double
            type = 2;
        } else {
            // We failed to be numerical. Return 0
            return 0;
        }
    }
     
    // TODO: Check the value with MAXINT and change type to a double if needed

    if(type === 1) {
        if(len === 10) {
            if(theString > 2147483647.0) { return 2; }
        } else if (len > 10) {
            return 2;
        }
    }
     
    // return the type
    return type;
}

// FormatXojoCodeByClass
// Takes a class name representing document objects that need to be stylized.
// Will format all text within these objects according to the options parameter.
function FormatXojoByClass(className, options) {
	className = className || "xojo_code";
	var nodes = document.getElementsByClassName(className);
	for(var i = 0; i<nodes.length; i++) {
		nodes[i].innerHTML = FormatXojoCode(nodes[i].innerHTML, options);
	}
	
}

// FormatXojoCode takes a string and returns a new string
// The new string has indentation and coloring just like
// the defaults in REALbasic. It's best wrapped in <pre>
// </pre> tags.
// Modified to take a single options parameter instead of many numerated parameters:
//		
function FormatXojoCode(source, options) {
	//JS uses function-level variable scope.  Define them all here.
	var opt, i, lineNumber, tokens, pos, lineLength, currentToken, isInQuote, chr, isInStyle, 
		isOnEndLine, isInComment, tmp, lcaseToken, lcaseSecondToken, shouldEndStyle, color,
		lines, line, indentLevel, output, lastLineHadLineContinuationCharacter, lineNumberLength,
		isInInterface, isIfLine, endedWithThen;
		
    // A list of known keywords.
    var keywords = {
        "#elseif"       : "#ElseIf",
        "#bad"          : "#bad",
        "#else"         : "#Else", 
        "#endif"        : "#EndIf",
        "#if"           : "#If", 
        "#pragma"       : "#pragma",
        "#tag"          : "#tag",
        "addhandler"    : "AddHandler",
        "addressof"     : "AddressOf",
        "and"           : "And",
        "array"         : "Array",
        "as"            : "As",
        "assigns"       : "Assigns",
        "break"         : "Break",
        "byref"         : "ByRef",
        "byval"         : "ByVal",
        "call"          : "Call",
        "case"          : "Case",
        "catch"         : "Catch",
        "class"         : "Class",
        "const"         : "Const",
        "continue"      : "Continue",
        "ctype"         : "CType",
        "declare"       : "Declare",
        "delegate"      : "Delegate",
        "dim"           : "Dim",
        "do"            : "Do",
        "downto"        : "DownTo",
        "each"          : "Each",
        "else"          : "Else",
        "elseif"        : "ElseIf",
        "end"           : "End",
        "enum"          : "Enum",
        "event"         : "Event",
        "exception"     : "Exception",
        "exit"          : "Exit",
        "extends"       : "Extends",
        "false"         : "False",
        "finally"       : "Finally",
        "for"           : "For",
        "function"      : "Function",
        "gettypeinfo"   : "GetTypeInfo",
        "global"        : "Global",
        "goto"          : "GoTo",
        "handles"       : "Handles",
        "if"            : "If",
        "implements"    : "Implements",
        "in"            : "In",
        "inherits"      : "Inherits",
        "inline68k"     : "Inline68k",
        "interface"     : "Interface",
        "is"            : "Is",
        "isa"           : "IsA",
        "lib"           : "Lib",
        "loop"          : "Loop",
        "me"            : "Me",
        "mod"           : "Mod",
        "module"        : "Module",
        "namespace"     : "Namespace",
        "new"           : "New",
        "next"          : "Next",
        "nil"           : "Nil",
        "not"           : "Not",
        "object"        : "Object",
        "of"            : "Of",
        "optional"      : "Optional",
        "or"            : "Or",
        "paramarray"    : "ParamArray",
        "private"       : "Private",
        "property"      : "Property",
        "protected"     : "Protected",
        "public"        : "Public",
        "raise"         : "Raise",
        "raiseevent"    : "RaiseEvent",
        "redim"         : "Redim",
        "removehandler" : "RemoveHandler",
        "return"        : "Return",
        "select"        : "Select",
        "self"          : "Self",
        "shared"        : "Shared",
        "soft"          : "Soft",
        "static"        : "Static",
        "step"          : "Step",
        "structure"     : "Structure",
        "sub"           : "Sub",
        "super"         : "Super",
        "then"          : "Then",
        "to"            : "To",
        "true"          : "True",
        "try"           : "Try",
        "until"         : "Until",
        "using"         : "Using",
        "weakaddressof" : "WeakAddressOf",
        "wend"          : "Wend",
        "while"         : "While",
        "with"          : "With",
        "xor"           : "Xor",
        
        "byte"			: "Byte",
        "short"			: "Short",
        "integer"		: "Integer",
        "int8"			: "Int8",
        "int16"			: "Int16",
        "int32"			: "Int32",
        "int64"			: "Int64",
        "uint8"			: "UInt8",
        "uint16"		: "UInt16",
        "uint32"		: "UInt32",
        "uint64"		: "UInt64",
        "boolean"		: "Boolean",
        "single" 		: "Single",
        "double" 		: "Double",
        "currency"		: "Currency",
        "string" 		: "String",
        "color"	 		: "Color",
        "variant"		: "Variant",
        "ptr"	 		: "Ptr",
        "cstring"		: "CString",
        "pstring"		: "pstring",
        "wstring"		: "WString",
        "cfstringref"	: "CFStringRef",
        "windowptr"		: "WindowPtr",
        "ostype"		: "OSType",
        
        "controlinstance" : "ControlInstance"
    };
    
	//Manage Default Options
    var default_options = {
    	changeKeywordCase   : false,
    	showLineNumbers     : false,
    	padLineNumbers      : '0',
    	lineBreak           : "\n",
    	codeBlockPreWrap    : '<span class="xojo_code_text">',
    	codeBlockPostWrap   : '</span>',
    	linePreWrap         : '',
    	linePostWrap        : '',
    	lineNumberPreWrap   : '<span class="xojo_code_linenumber">',
    	lineNumberPostWrap  : '  </span>',
    	lineContentPreWrap  : '<span class="xojo_code_codeline">',
    	lineContentPostWrap : '</span>',
    	spanClassKeyword    : 'xojo_code_keyword',
    	spanClassString	    : 'xojo_code_string',
    	spanClassInteger    : 'xojo_code_integer',
    	spanClassReal	    : 'xojo_code_real',
    	spanClassComment    : 'xojo_code_comment'
    };

    options = options || {};
    for(opt in default_options) {
        if (default_options.hasOwnProperty(opt) && !options.hasOwnProperty(opt)) {
            options[opt] = default_options[opt];
        }
	}

    // Trim the source code
    source = String(source).trim();
     
    // Since this is going to output xhtml compliant code, we need to take the xml entities
    // and convert them. So, if the REALbasic code contains &, <, >, ', " they can come in as
    // the entities. They *will* come back out as entities no matter what.
    source = source.replace("&lt;",   "<" );
    source = source.replace("&gt;",   ">" );
    source = source.replace("&quot;", "\"");
    source = source.replace("&apos;", "'" );
    source = source.replace("&amp;",  "&" );
     
    // Take the source, and split it into lines
    // First, replace all the line breaks of different platforms
    // TODO: This could be optimized to be a single loop that modifies
    // the string. However, this is easier for now.
    source = source.replace("\r\n", "/|\**__");
    source = source.replace("\r", "\n");
    source = source.replace("/|\**__", "\n");
	
    // Break the lines by \r's
    lines = new Array();
    lines = String(source).split("\n");
    
    // Initialize indent level and output, and linecontinuation character
    indentLevel = 0;
    output = options.codeBlockPreWrap;
    lastLineHadLineContinuationCharacter = false;
    lineNumberLength = String(lines.length).length;
    isInInterface = false;
    isIfLine      = false;
    endedWithThen = false;
	line          = '';
	
    // Iterate over each line
    for(lineNumber in lines) {
	    output += options.linePreWrap;
	    line = lines[lineNumber];
        if(!(lastLineHadLineContinuationCharacter)) {
            isIfLine		= false;
            endedWithThen	= false;
        }
        
        // Trim the line. We handle the indentation, so we'll just trim off the beginning
        // of the line
        if(options.showLineNumbers) {
	        output += options.lineNumberPreWrap;
	        if(options.padLineNumbers !== '') {
	            output += padWithZeros(Number(lineNumber)+1,lineNumberLength,options.padLineNumbers);
	        } else {
	            output += String(Number(lineNumber)+1);
	        }
	        output += options.lineNumberPostWrap;
        }
        
        // Begin content-wrapper
        output += options.lineContentPreWrap;
        
        // Trim the line, we'll handle the indenting!
        line = line.trim();
        
        // We want to iterate over each "token". To do this, we need to split them up
        // Initialze the tokens array
        tokens = new Array();

        pos = 0;
        lineLength = line.length;
        currentToken = "";
        isInQuote = false;
         
        for(pos = 0; pos < lineLength; pos++) {
            chr = line.substr(pos, 1);
            
            // If we're inside a string, we need to add it to the current token
            // unless it's a quote, in which case we end the current token
            if(isInQuote && chr !='"') {
                currentToken += chr;
            } else {
                // Basically, every character has the same effect if it's an
                // operator or special character.
                switch (chr) {
                    case '"':
                        // if we're a quote, we need to switch the state
                        isInQuote = !(isInQuote);
                        // Intentional fall-through
                    case '=':
                    case '(':
                    case ')':
                    case ' ':
                    case '+':
                    case '-':
                    case '/':
                    case '\\':
                    case '*':
                    case ',':
                    case '\'':
                    case '^':
                        // If we have a current token, add it to the array
                        if (currentToken != '') { tokens.push(currentToken); }
                        
                        // Add the current character as its own token
                        tokens.push(chr);
                        
                        // Reset the current token
                        currentToken = '';
                        break;
                        
	                case '.':
	                	// if we've got a . then check for self and me keywords.
	                	if(!(isInQuote) && (currentToken.toLowerCase() == 'me' || currentToken.toLowerCase() == 'self')) {
		                	//push the first part as it's own token
		                	tokens.push(currentToken); 
		                	
		                	//reset the current token with our period
		                	currentToken = '.';
		                	break;
	                	}
	                	
                    default:
                        // Add the character to the current token
                        currentToken += chr;
                        break;
                }
            }
        }
        
        // If we have a token left over, we need to add it to the array
        if (currentToken !== '') { tokens.push(currentToken); }

        // Now, we want to iterate over each token
        isInQuote	= false;
        isInStyle 	= false;
        isOnEndLine	= false;
        isInComment	= false;
        
        tmp			= 0;
        lcaseToken	= "";

        // Check for if, #if, etc.
        if (tokens.length > 0) {
            lcaseToken = String(tokens[0]).toLowerCase();
            if(lcaseToken == 'if') {
                tmp = 2;
                isIfLine = true;
            } else if (lcaseToken == '#if' || lcaseToken == "for" || 
                lcaseToken == "while" || lcaseToken == "do" || lcaseToken == "try" || 
                lcaseToken == "sub" || lcaseToken == "function" || lcaseToken == "class" || 
                lcaseToken == "module" || lcaseToken == "window" ||
                lcaseToken == "controlinstance" || lcaseToken == "get" || lcaseToken == "set" || lcaseToken == "property" || lcaseToken == "structure" || lcaseToken == "enum" || lcaseToken == "select" || lcaseToken == "event") {
                // increase indentation level
                if(!(isInInterface)) { tmp = 2; }
            } else if (lcaseToken == "interface") {
                isInInterface = true;
                tmp = 2;
            } else if (lcaseToken == "end" || lcaseToken == "#endif" || lcaseToken == "next" || 
                       lcaseToken == "wend" || lcaseToken == "loop") {
                indentLevel -= 2;
                isInInterface = false;
                isOnEndLine = true;
            } else if (lcaseToken == "else" || lcaseToken == "elseif" || lcaseToken == "#else" || 
                       lcaseToken == "#elseif" || lcaseToken == "catch" || 
                       lcaseToken == "implements" || lcaseToken == "inherits" || lcaseToken == "case") {
                tmp = 2;
                indentLevel -= 2;
            } else if (tokens.length > 2 && tokens[1] == " ") {
                // Check for protected sub, protected function, etc
                lcaseSecondToken = String(tokens[2]).toLowerCase();
                 
                if ((lcaseToken == "protected" || lcaseToken == "private" || lcaseToken == "global" ||
                     lcaseToken == "public") && (lcaseSecondToken == "function" || lcaseSecondToken == "sub")) {
                     tmp = 2;
                }
            }
        }
         
        // Output the indentation
        if (indentLevel > 0) { output += str_repeat(" ", indentLevel); }
         
        // If we had a line continuation character, output extra spaces
        if (lastLineHadLineContinuationCharacter) {
            output += "  ";
        }
        lastLineHadLineContinuationCharacter = false;

        // tmp was used to delay the addition to the intentLevel. We add it now
        indentLevel += tmp;
         
        for(i=0; i < tokens.length; i++) {
            // Each token now needs to have the entities replaced. This is the perfect time
            // because anything past this will possibly have xhtml tags, and therefore is too
            // late to perform a replacement.
            tokens[i] = String(tokens[i]).replace('&', "&amp;");
            tokens[i] = String(tokens[i]).replace('<', "&lt;");
            tokens[i] = String(tokens[i]).replace('>', "&gt;");
            tokens[i] = String(tokens[i]).replace('"', "&quot;");
            tokens[i] = String(tokens[i]).replace("'", "&apos;");
            shouldEndStyle = false;
            // Get the lowercase of the token. This is just cached for speed.
            lcaseToken = String(tokens[i]).toLowerCase().trim();
             
            // if we're not in a comment, we can colorize things
            if (!(isInComment)) {
                // Check to see if we're a quote
                if (lcaseToken == '&quot;') {  // Strings
                    if (isInQuote) {
                        // If we're the ending quote, we need to end the style
                        shouldEndStyle = true;
                    } else {
                        // If we're beginning, we need to output the beginning style
                        output += '<span class="'+options.spanClassString+'">';
                    }
                    isInQuote = !(isInQuote);
                     
                // Check for keywords
                } else if(isInQuote) {
                    // do nothing. Quotes superceed all.
                } else if(lcaseToken in keywords) {
                    // Keywords are only coloring the single word, so we output
                    // a font color, and then end the style
                    output += '<span class="'+options.spanClassKeyword+'">';
                    shouldEndStyle = true;
                    if(options.changeKeywordCase) {
                        tokens[i] = keywords[lcaseToken];
                    }
                } else if(i == 0 && (lcaseToken == "get" || lcaseToken == "set")) {
                    // Keywords are only coloring the single word, so we output
                    // a font color, and then end the style
                    output += '<span class="'+options.spanClassKeyword+'">';
                    shouldEndStyle = true;
                     
                } else if(isOnEndLine && (lcaseToken == "get" || lcaseToken == "set")) {
                    // Keywords are only coloring the single word, so we output
                    // a font color, and then end the style
                    output += '<span class="'+options.spanClassKeyword+'">';
                    shouldEndStyle = true;
                 
                // Intentional assignment within conditional:
                } else if((tmp = IsNumerical(lcaseToken)) > 0) {
                    // tmp is now the type of numerical token
                    if (tmp == 1) { // Integer
                        output += '<span class="'+options.spanClassInteger+'">';
                    } else { // Real
                        output += '<span class="'+options.spanClassReal+'">';
                    }
                    // The style should only be for this token, so we need to end the style
                    shouldEndStyle = true;
                     
                // Comments. First, check for ', next check for //, and finally check for
                // rem
                } else if(lcaseToken.substr(0,6) == "&apos;" || (lcaseToken == '/' && i + 1 < tokens.length && tokens[i+1] == '/') || lcaseToken == 'rem') {
                    // Turn comment on (which is reset at the beginning of each line
                    isInComment = true;
                    // output our style
                    output += '<span class="'+options.spanClassComment+'">';
                } else if(String(lcaseToken).length == 12 && lcaseToken.substr(0,6) == "&amp;c") {
                    // This is tricky!
                    color = tokens[i].substr(6,6);
                    tokens[i] = '';
                    output += '&amp;c';
                    output += '<span style="color: #FF0000;">' + color.substr(0, 2) + '</span>';
                    output += '<span style="color: #00BB00;">' + color.substr(2, 2) + '</span>';
                    output += '<span style="color: #0000FF;">' + color.substr(4, 2) + '</span>';
                }
            }
            // If we're not in a comment, we do a cheap check for line continuation
            if(!(isInComment) && lcaseToken !== '') {
	            lastLineHadLineContinuationCharacter = (lcaseToken == '_');
	            endedWithThen = (lcaseToken == "then");
            }
             
            // Output the token
            output += tokens[i];
             
            // And now, check to see if we need to end the style
            if(shouldEndStyle) {
                output += '</span>';
                shouldEndStyle = false;
            }
        }
         
        if(isIfLine && !(endedWithThen) && !(lastLineHadLineContinuationCharacter)) {
            indentLevel -= 2;
        }
         
        // If we're in a comment, we need to end that style
        if(isInComment) {
            output += '</span>';
        }
        
        // end content-wrapper
        output += options.lineContentPostWrap;

		// line post wrap
	    output += options.linePostWrap;
	    
        // break line
        if(lineNumber < lines.length - 1) {
            output += options.lineBreak;
        }
    }
    output += options.codeBlockPostWrap;
     
    // Return the block of text. Works best if wrapped in <pre></pre>
    return output;
}