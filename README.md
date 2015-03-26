#XojoHighlight.js
###A JavaScript based syntax highlighter for Xojo and REALbasic code blocks.

**XojoHighlight.js** was adapted from [Thom McGrath](thezaz.com)'s updates to [Johnathan Johnson](http://www.nilobject.com)'s `FormatRBCode()` php function.

A number of new options flags have been provided to create more flexible formatting.  To accomodate these added options, all original arguments have been buried within a single *options* object/parameter.

##Installing the Library
The default instalation consists of:

* **XojoHighlight.js** - the JavasScript library.
* **XojoHighlight.css** - the default CSS classes.

These two files can be linked into your existing HTML by adding the following two lines within your `<head>` tag:

```js
<link rel="stylesheet" href="XojoHighlight.css"/>
<script src="XojoHighlight.js"></script>
```

##Using the Library

###General

The base function definition is `FormatXojoCode(source, options)` which takes a string (`source`), optional formatting parameters (`options`), and returns a string with html-formatted code.

The result is best wrapped in `<pre>` tags, because indentation is presently handled with spaces.

###Using Class Selectors

To ease in implementation there is also a function called `FormatXojoByClass(classname)`.  You simply pass a class name and all code blocks matching that class will have their contents replaced with formatted code.

*When using the default `options` the classes should be attached to `<pre>` blocks.*

###Options

A number of options exist for changing the way code blocks are formatted.  These options are passed as properties of the `options` object.

Their names, descriptions and default values are described below.

| Property            | Type    | Default Value                           |
|:--------------------|:-------:|:----------------------------------------|
| changeKeywordCase   | boolean | `false`                                 |
| showLineNumbers     | boolean | `false`                                 |
| padLineNumbers      | string  | `0`                                     |
| lineBreak           | string  | `"\n"`                                  |
| codeBlockPreWrap    | string  | `'<span class="xojo_code_text">'`       |
| codeBlockPostWrap   | string  | `'</span>'`                             |
| linePreWrap         | string  | `''`                                    |
| linePostWrap        | string  | `''`                                    |
| lineNumberPreWrap   | string  | `'<span class="xojo_code_linenumber">'` |
| lineNumberPostWrap  | string  | `'  </span>'`                           |
| lineContentPreWrap  | string  | `'<span class="xojo_code_codeline">'`   |
| lineContentPostWrap | string  | `'</span>'`                             |
| spanClassKeyword    | string  | `'xojo_code_keyword'`                   |
| spanClassString     | string  | `'xojo_code_string'`                    |
| spanClassInteger    | string  | `'xojo_code_integer'`                   |
| spanClassReal       | string  | `'xojo_code_real'`                      |
| spanClassComment    | string  | `'xojo_code_comment'`                   |

**changeKeywordCase**  
Set `changeKeywordCase` to `true` to apply standard Xojo case to all keywords.  
This will only affect keywords, not class or property names.  
*Default value is `false`*

**showLineNumbers**  
Set `showLineNumbers` to `true` to print line numbers on for each code line.  
*Default value is `false`*

**padLineNumbers**  
Set `padLineNumbers` to a string value that will be prepended to all line numbers so they take the same amount of mono-spaced/preformated width.  Useful when using mono-spaced `<pre>` blocks.  Set to `''` when using css-based alignments.  
*Default value is `0`*

**lineBreak**  
Set `lineBreak` to a string that would follow every line of code.  The default is a chariage return, assuming the use of `<pre>` tags.  
*Default value is `"\n"`*

**codeBlockPreWrap**  
Set `codeBlockPreWrap` to a tag that would preface all formatted code.  
*Default value is `'<span class="xojo_code_text">'`*

**codeBlockPostWrap**  
Set `codeBlockPostWrap` to a tag that would follow all formatted code.  
*Default value is `'</span>'`*

**linePreWrap**  
Set `linePreWrap` to a tag or value that would preface each line of formatted code.  Useful when using `<table>` or `<div>` tags to break up codeblocks.  
*Default value is `''`*

**linePostWrap**  
Set `linePostWrap` to a tag or value that would follow each line of formatted code.  Useful when using `<table>` or `<div>` tags to break up codeblocks.  
*Default value is `''`*

**lineNumberPreWrap**  
Set `lineNumberPreWrap` to a tag or value that would preface each line number.  Useful when using `<table>` or `<div>` tags to break up codeblocks.   
*Default value is `'<span class="xojo_code_linenumber">'`*

**lineNumberPostWrap**  
Set `lineNumberPostWrap` to a tag or value that would preface each line number.  Useful when using `<table>` or `<div>` tags to break up codeblocks.

When using the default css (which has no padding), it is neccesary to have some white space characters to separate the code line from the line number.  
*Default value is `'  </span>'`*

**lineContentPreWrap**  
Set `lineContentPreWrap` to a tag or value that would preface each line of Xojo code.  Useful when using `<table>` or `<div>` tags to break up codeblocks.   
*Default value is `'<span class="xojo_code_codeline">'`*

**lineContentPostWrap**  
Set `lineContentPostWrap` to to a tag or value that would preface each line of Xojo code.  Useful when using `<table>` or `<div>` tags to break up codeblocks.  
*Default value is `'</span>'`*

**spanClassKeyword**  
Set `spanClassKeyword` to override the default class applied to found keywords.  
*Default value is `'xojo_code_keyword'`*

**spanClassString**  
Set `spanClassString` to override the default class applied to found strings.  
*Default value is `'xojo_code_string'`*

**spanClassInteger**  
Set `spanClassInteger` to override the default class applied to found integers.  
*Default value is `'xojo_code_integer'`*

**spanClassReal**  
Set `spanClassReal` to override the default class applied to found reals.  
*Default value is `'xojo_code_real'`*

**spanClassComment**  
Set `spanClassComment` to override the default class applied to found comments.  
*Default value is `'xojo_code_comment'`*

##Example Code
Example HTML files are included, but for those perusing prior to download the following examples show the ease of using this script.

```html
<html>
<head>
	<link rel="stylesheet" href="XojoHighlight.css"/>
	<script src="XojoHighlight.js"></script>
</head>
<body>
	Below is an example of formatted Xojo Code:
	<pre class="xojo_code">
		dim s as string
		s = "Hello World"
		msgBox s
	</pre>
	<script>
		//Put this down here so the document model is loaded.
		FormatXojoByClass("xojo_code",{
			showLineNumbers   : true,
			changeKeywordCase : true
		});
	</script>
</body>
</html>
```

You can completely omit the options object if you would like to use the defaults:

```js
FormatXojoByClass("xojo_code");
```
###Using other Libraries
The example above places the formatting code at the end of the document in order to ensure that the whole document has loaded prior to processing code blocks.  If you have additional wrappers installed you could leverage the power of their selectors and extensions.  The following code uses the jQuery library to wait for the document to finish loading and uses the more powerful selector sytem:

```js
$(document).ready(function() {
	$('pre.xojo_code').each(function(){
		$(this).html(FormatXojoCode($(this).html()));
	});
});
```