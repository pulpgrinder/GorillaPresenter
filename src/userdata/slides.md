; Any line beginning with a semicolon (;), like this one, will not appear on the slide, but will appear in the speaker notes.
Any line beginning with two slashes (//), like the next one one, will appear neither on the slide nor in the speaker notes.
// This will only appear in the slide editor. It won't be on the slides or in the speaker notes.
; A line that begins with an octothorpe (#), like the next one, begins a new slide.
# Gorilla Presenter
// The line below will be explained later. For now, don't worry about how it works.
{{{image Bob | Our Founder Says "Hi"}}}

* 100% self-contained
* No app
* No server 
* No net connection needed

# Gorilla Presenter

* Produces a standard HTML file
* Compatible with all standard modern browsers

(iOS and iPadOS require adding a home screen shortcut)

# Gorilla Presenter
; Notes for slide 2.
* Fast text-based editing.
* Can be edited anywhere, even on a phone or tablet
* Get your presentation done and be off enjoying a tasty beverage while your rivals are still playing pointy-clicky.


# How do I get it?

You're soaking in it, mang! 
* Control+click (long press on mobile) 
* Choose "Save Presentation"
* That's it! You can open this file on your local computer and have a full working copy of Gorilla Presenter.

# Editing Slides

* Control-click/long press
* Choose "Edit Slides"
* Use standard Markdown formatting
* Switch back to the Slide Show to see your changes.

# Bold and Italic
* Italic text segments are surrounded by \* (for instance, *This is italic*)
* Bold text segments are surrounded by \*\* (for instance, **This is Bold**)
* Bold text segments are surrounded by \*\*\* (for instance, ***This is Bold Italic***)
# Lists

Bulleted list items begin with \*. Numbered list  items begin with a number followed by a parenthesis.

* Bullet Point 1
* Bullet Point 2

1) Numbered Point 1
2) Numbered Point 2

# Block Quotes

> This is a block quote

# Code
```
Code
```

# Equations

Gorilla Presenter supports \\(\LaTeX\\) equations:

$$x=\frac{-b\pm \sqrt{{{b}^{2}}-4ac}}{2a}$$

$$\int_a^b x^2 dx  = \frac{x^3}{3}\LARGE{|}{_{\small a}^{\small b}}$$

# Demo Slide 3

Hey mang!


# Media

{{{image Bob | Our Founder Says "Hi"}}}
{{{audio BWV764 | Excerpt from Wie schön leuchtet der Morgenstern, BWV 764, Johann Sebastian Bach (variation of completion, performed by Thomas A. Schneider)}}}


Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Tellus in hac habitasse platea dictumst vestibulum rhoncus est.

# Demo Slide 5

Nunc consequat interdum varius sit amet mattis vulputate enim. Arcu non sodales neque sodales ut etiam sit amet. Lacus vestibulum sed arcu non odio euismod lacinia at quis. Amet mauris commodo quis imperdiet massa tincidunt nunc pulvinar. 

# Demo Slide 6

Fames ac turpis egestas integer eget aliquet nibh praesent. Tincidunt dui ut ornare lectus sit amet est. Tincidunt eget nullam non nisi est. Est ullamcorper eget nulla facilisi etiam dignissim diam. 

# Demo Slide 7

Non nisi est sit amet facilisis. Cursus metus aliquam eleifend mi in nulla. Suspendisse sed nisi lacus sed viverra tellus in hac habitasse. Massa placerat duis ultricies lacus. 

# The fontsize Command

The \{\{\{fontsize (size) (text)\}\}\} command lets you alter the size of a run of text. For example, \{\{\{fontsize Large Hi, there!\}\}\} produces {{{fontsize Large Hi, there!}}}.

Available sizes are:

{{{fontsize tiny tiny}}}

{{{fontsize scriptsize scriptsize}}}

{{{fontsize footnotesize footnotesize}}}

{{{fontsize small small}}}

{{{fontsize normalsize normalsize}}}

{{{fontsize large large}}}

{{{fontsize Large Large}}}

{{{fontsize LARGE LARGE}}}

{{{fontsize huge huge}}}

{{{fontsize Huge Huge}}}

{{{fontsize HUGE HUGE}}}

These are designed to match the corresponding font sizes in \\(\LaTeX\\). For example, \{\{\{fontsize Large Hi, there!\}\}\}  should produce approximately the same size text as \Large in \\(\LaTeX\\).
