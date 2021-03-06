# StringTemplate Documentation

StringTemplate is a language for describing how to combine structured data with literal text to produce output text.
It is also a library that processes that language.

A template system is a template processor or engine that processes the template language along with any application
specific code needed to acquire, access or generate the data and possibly store or transmit the resulting text.
The template processor is generally supplied as a library or program to be called by the application.

The purpose of a template system is to produce output text where the output is given by the input template(s).
The templates are made up of literal text that is copied to the output as is and embedded expressions that specify what 
data is to be inserted into the output.

Official [documentation](https://theantlrguy.atlassian.net/wiki/display/ST4/StringTemplate+4+Documentation) for StringTemplate.

## Templates
Templates are literal text with embedded template expressions. Expressions are delimited with a special start and stop
character. All text outside of these characters is copied to the output nearly verbatim (see Escaping Expression 
Delimiters below). Text inside the delimiters are template expressions that determine how data is to be inserted into
the output. The insertion happens at the point where the expression occurs within the literal text.

StringTemplate templates enforce a separation between the template and the data (this is also known as model - view 
separation where the data is referred to as the model and the template is the view). Templates cannot implement
any business logic *. The template cannot modify the data model. Processing the template produces no side effects.
The data model is created prior to template processing, which means the order of data acquisition is independent of the
order that the data is referenced by template processing.

Templates *do* have a constructs for conditionals, looping, a small number of built-in functions, 
a few options to control the output rendering, and calling templates with arguments. These features are necessary 
for the efficient generation of output text. They are not sufficient to implement business logic.

These claims of strict separation apply to the StringTemplate language. It is possible to abuse the API such that
side effects or data modifications are possible. These are faults of the application implementation and not
StringTemplate.

\* One place where it could be argued that templates allow business logic is in conditional expressions because
they allow boolean operators: and, or, and not. These operators are for convenience and provide very little opportunity
for abuse. You don't need to use these operators if you don't want to.

### Template Expression Delimiters
StringTemplate allows the start and stop delimiter characters to be configurable. This is useful for working with 
different text output formats. It allows you to choose characters that are uncommon in the output format. 
The default is determined by the implementation and can easily be changed through the processor API or with the
group file syntax described below.

The following characters can be used as start or stop delimiters. The start and stop delimiter need not be the same
character. 

Possible start and stop delimiters:

```
#$%^&*<>
```

Common delimiter pairs are <> and $$. Most of the examples in this documentation use $$.

Example:
```
Dear $name$,
You may have already won $prize$. To collect your prize...
```

As will be explained in detail below all of the text is copied verbatim to the output except for what is in between the
dollar signs ($): `$name$` will be replaced with the data associated with attribute `name` and `$prize$` will be 
 replaced with the data associated with attribute `prize`.

If the delimiters were instead configured to be < and > then the above example would be written:
```
Dear <name>,
You may have already won <prize>. To collect your prize...
```

### Escaping Expression Delimiters
To include the start character in the literal template text it will need to be escaped. There is no need to escape
the stop character (assuming it is different from the start character)

The start character is escaped using the backslash character as follows: `\$`.

As we will learn later, sub templates are delimited with { } characters so inside a sub template the closing bracket
needs to be escaped. Again a backslash is used: `\}`.

Normally you don't need to worry about escaping the backslash character but in situations where there is any ambiguity
you will need to escape it with another backslash like this: `\\`. 

This means that:

To get this output | Enter this in the template
-------------------|------------------------
 `$`               | `\$`
 `\`               | `\`
 `\\`              | `\\\\`
 `\$`              | `\\\$`
 `\}`              | `\\}`
 `\}`              | `\\\}`
 `}`               | `\}`

The last two only apply in a sub template.

## The Data Model
StringTemplate has very few data types. Most of how it deals with the data model is implementation specific. What it 
does know about is the shape of the data. Data can be one of the following shapes:

 * scalar - a single value. This includes obvious things like strings and numbers but also includes things like 
 a Point or Complex object.
 StringTemplate doesn't deal with specific types but relies on the implementation to be able to turn any scalar into 
 a string (for example via a toString method).

 * array - also known as a list or linear collection/enumeration. The items in the array can be of any shape or type.
 The values are ordered. StringTemplate will aways implicitly iterate over the array items.

 * object - also known as a map, dictionary, or hash. This is an unordered collection of named values.
 The named values are known as properties of the object.
 The values can be of any shape or type. StringTemplate allows accessing the values by their name. This is known as 
 a property reference, access, or lookup. Depending on the context StringTemplate can also iterate over the 
 property names of an object.

The data types that StringTemplate deals with explicitly are:

 * Templates
 * Strings
 * Lists (arrays)
 * Booleans
 * Dictionaries (similar to objects but with a special feature for handling defaults)

It is also aware of, but has no representation for, the special value null.

The StringTemplate processor and its API is implemented in a specific programming language such as Java, C# or JavaScript and
each implementation must specify how it maps the StringTemplate data model onto the native data structures of that language.

The processor API provides a way to associate application data with templates. In addition data values can be passed from
one template to another via argument passing as described below. Template expressions can also contain a few literal
data represenetations as described next. See also dictionaries in Group Files section.

xxx attribute names, scopes here or later

## Literals
Template expressions may include the following literals:

* The boolean values `true` and `false`.

* Strings. Strings are sequences of characters enclosed in double quotes. Inside the double quotes these escape sequences
are supported to include special characters:

    - `\t` tab
    - `\r` charage return
    - `\n` line feed
    - `\"` double quote
    - `\\` single back slash

* Lists. Lists (also known as arrays) are comma separated expressions enclosed in square brackets. For example
an empty list is `[ ]`. A list of strings would look like this: `[ "a", "b", "c" ]`. 

Note that there is no literal representation of numbers.

It may seem unnecessary to have these literals. After all a template such as this:

```
My name is $"Sam"$.
```

could more easily be given as:

```
My name is Sam.
```

Where these literals come in handy is in contexts such as passing template parameters, dictionaries, options and
conditions each of which will be discussed below.

## Character Escape Expressions
The following expressions are used to insert special characters in the output:

 * `$\ $` insert a single space
 * `$\n$` insert a new line. This will be converted to the appropriate line ending character or character sequence
by the implementation according to the Operating System conventions.
 * `$\t$` insert a tab
 * `$\uhhhh$` insert a Unicode character where *hhhh* is the hex value of the Unicode character

The expression `$\\$` will suppress the following new line. This allows inserting a new line in the template for
better readability without including that new line in the output. 

todo give an example

## Comments
Inside templates you can include comments as follows:

```
$!this is a comment!$
```

Comments are not copied to the output.

See section Group Files below for comments you can have outside of templates.

## Expressions
This section describes each of the possible expressions.

### Attribute Expressions
The simplest expression is an attribute expression. An attribute is simply the name or identifier of a data value.
An attribute identifier starts with an alphabetic character or underscore followed by zero or more alphabetic characters
underscores or digits.

An attribute identifier matches this regular expression: `[a-zA-Z_][a-zA-Z_0-9]*`. Attribute identifiers are case
sensitive.

For example:

```
$hobbit$
```

If the value of the `hobbit` attribute is "Bilbo Baggins" then the above expression results in:

```
Bilbo Baggins
```

If the value of an attribute is null then the result is an empty string (i.e. nothing). If the value of an attribute 
is an array the result is a concatenation of all the values in the array. So using JSON syntax for arrays, suppose the
attribute `hobbits` contains `[ "Samwise", "Frodo", "Bilbo" ]` then the expression

```
$hobbits$
```

results in

```
SamwiseFrodoBilbo
```

This may not seem very useful but when we get to Map expressions and Options you will see how to make better
use of arrays.

### Property Reference
If the attribute value is an object then you can access the values of its properties with this property reference
syntax: *attribute*.*property*

For example:

```
Mr $hobbit.firstName$ $hobbit.lastName$,
```

If the value of the `hobbit` attribute is an object with properties firstName and lastName and those properties have
values "Bilbo" and "Baggins" respectively then the above template results in:

```
Mr Bilbo Baggins,
```

If the value of a property is also an object then the same dot property name syntax can be used to access properties
of that object. This nesting of property references can be continued to any number of levels.

For example if the hobbit object had a property called `name` and its value was an object with properties `first` and
`last`.  

(Using JSON syntax it would look like this

```
{
    "name": {
        "first": "Bilbo",
        "last": "Baggins"
    }
}
```
)

Then the hobbit's first name could be accessed in a template expression like so:

```
$hobbit.name.first$
```

xxx attribute indirect
xxx property indirect


### Include
Often the output text requires repeated patterns of similar text. For example the footer at the bottom of each page
in a book. To accomplish this StringTemplate allows you to break up your overall template system into any number of
modular templates and include the output of one template in another. Templates are given names so they can be referenced
in expressions. Templates can also define names for data values they expect to be given. These names are called 
formal arguments or simply arguments or parameters. The syntax for defining templates with their name and arguments
is given later in the Template Definition Files and Group Files sections. This section is about how to include templates
from other templates. The syntax looks very much like a function call in various programming languages. Indeed, similar
terminology is sometimes used. Rather than saying template A includes template B you could say template A calls or 
invokes template B.

Here is an over simplified example using HTML. Suppose your HTLM page is going to have a few buttons and you don't
want to repeat the button markup each time. Make a template called button that takes parameters id and label.

```
<button id=$id$>$label$</button>
```

Then from the page template you can include as many buttons as you need.

```
...
<input ...>
...
<div>
$button("okBtn", "OK")$ $button("cancelBtn", "Cancel")$
</div>
...
```

In this simple example the values passed to the button template are string literals. In a more realistic example
the argument values would be attribute or property reference expressions. For example:

```
$button(button1.id, button1.label)$
```


#### Argument Passing

xxx todo

### Map
xxx todo

xxx rot

### Zip
xxx todo

### Expression Options

todo 

separator
format
null
wrap
anchor


### Anonymous Sub Templates

todo

### Functions
StringTemplate defines a small fixed number of functions that operate on data values. 
The syntax for calling functions is the same as template includes. In practice this doesn't cause problems because
the number of functions is very small. If you want to name a template the same as a function name then you will need
to call it with absolute path syntax. For example `$/first(arg1)$`. Why this works will become clear later.

The following functions expect to be passed an array. That means they make the most sense when given an array but
they are forgiving enough if you pass a different type of data.

* `first(a)` Returns the first element of the input array `a` or `a` if it is not an array.

* `last(a)` Returns the last element of the input array `a` or `a` if it is not an array. 

* `rest(a)` Returns all but the first element of the input array `a` or null if it is not an array.

* `trunc(a)` Returns all but the last element of the input array `a` or null if it is not an array.

* `length(a)` Returns length of the input array `a` or 0 if input is null or undefined or 1 if input is a scalar value or object.
 
* `reverse(a)` Returns an array that is the same as the input array `a` but with the elements reversed or `a` if it is not an array.

* `strip(a)` Returns an array that is the same as the input array `a` but with all null elements removed or `a` if it is not an array.

The following functions expect to be given a string. It is a runtime error if the input argument is not a string.

* `trim(str)` Return copy of the input `str` with leading and trailing white space characters removed.

* `strlen(str)` Return the length of a string.

xxx discus the two return values that are numbers

### Conditionals
todo:
if
elseif
else
endif

todo explain evaluation of conditions
 !, &&, ||


## Template Definition Files

todo

xxx  >> and %> escapes

## Raw Template Files

todo

## Group Files

todo

### Dictionaries

todo

### Group inheritance

todo

## Regions

todo
