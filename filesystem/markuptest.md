
# Home

These are some "torture tests" for the custom Markdown extensions.



{{{center}}}{{{media founder}}}

{{{clear}}}This is a simple slide with **bold** and *italic* text.

{{{center}}}It has multiple paragraphs. This one should be centered.

So should this one.

{{{}}}but not this one.

{{{center}}}Centered.

{{{}}}Not.

{{{center}}}Centered.


{{{clear}}}Not.

{{{justify}}}Justified. Here's a fairly long line that should be justified.Justified. Here's a fairly long line that should be justified.Justified. Here's a fairly long line that should be justified.Justified. Here's a fairly long line that should be justified.Justified. Here's a fairly long line that should be justified.Justified. Here's a fairly long line that should be justified.

{{{right}}}This paragraph should be right-aligned (ragged left).This paragraph should be right-aligned (ragged left).This paragraph should be right-aligned (ragged left).This paragraph should be right-aligned (ragged left).This paragraph should be right-aligned (ragged left).
{{{}}}

{{{left}}}This paragraph should be left-aligned (ragged right).  This paragraph should be left-aligned (ragged right). This paragraph should be left-aligned (ragged right).   This paragraph should be left-aligned (ragged right). This paragraph should be left-aligned (ragged right). This paragraph should be left-aligned (ragged right). This paragraph should be left-aligned (ragged right).This paragraph should be left-aligned (ragged right).
{{{clear}}}

{{{hang}}}This paragraph should have a hanging indent.This paragraph should have a hanging indent.This paragraph should have a hanging indent.This paragraph should have a hanging indent.This paragraph should have a hanging indent.This paragraph should have a hanging indent.

This should have a {{{red}}}**bold**{{{clear}}} span with the class "red".



# Test Slide 2: Line Breaks

{{{menu Go home|>Basic}}}

This line should break here\
nand continue on the next line without a new paragraph.

This should be a new paragraph.

This has multiple breaks:\
first break\
nsecond break\
third break.

# Test Slide 3: Escaped Line Breaks

This has three backslashes\\\n
so it should NOT create a line break.

It should appear as literal backslash-backslash-n in the output.

# Test Slide 4: Empty Body

# Test Slide 5: H1 Header in Body
{{{autoplay 0}}}
This slide has a normal title.

\# This Should Be an H1 Header Inside the Body

Not a slide boundary! Just a header within the slide content.

\# Another H1 in the body

With some text after it.

# Test Slide 6: Lists and Formatting

Unordered list:
- Item one
- Item two with **bold**
- Item three

Ordered list:
1. First item
2. Second item
3. Third item

#
This slide has no title.

It should work fine without one.

# Test Slide 8: Code and Special Characters

Here's some inline `code` text.
```javascript
function test() {
    console.log("Code block");
}
```

Special characters: & < > " '

# Test Slide 9: Mixed Line Breaks and Paragraphs

First line\\nSecond line (no paragraph break)

New paragraph here.

Third line\\nFourth line (no paragraph break)

# Test Slide 10: Multiple Consecutive Headers

This tests what happens after the next slide.

#

#

# Test Slide 13: After Empty Slides

Did those empty slides (11 and 12, both blank title and blank content) render correctly?

# Test Slide 14: Complex Markdown

> This is a blockquote
> with multiple lines

Here's a [link](https://example.com)

| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |
| Data 3   | Data 4   |

# Test Slide 15: Whitespace Handling

   This body has leading spaces that should be trimmed.

But internal    spaces    should    be    preserved.

And trailing spaces...     

# Test Slide 16: Escaped Header with Formatting

\# This Header Has **Bold** and *Italic*

It should render as an H1 inside the slide body, not create a new slide.

# Test Slide 17: Line Break Edge Cases

Start\\nMiddle\\\nEnd

The middle one should show literal backslashes, not a break.

Multiple\\n\\nline\\nbreaks\\nin\\na\\nrow.

# Test Slide 18: Final Slide

This is the last slide.

It should render correctly even though there's no slide after it.

Testing trailing content at end of file.