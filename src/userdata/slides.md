# Outline
// Outlines are introduced with a colon (:) at the beginning of a blank line.
// Subsequent lines begin with the number of colons corresponding to the desired level.
// Numbering/lettering is handled automatically. Going up one or more levels makes the
// lettering/numbering for all lower levels reset.
:
:TU This is my title. There are many like it but this one is mine.
:L This is at level one. Goes to Google. | http://www.google.com
:L This is also at level one. Goes to quiz. | quiz
:: This is at level two.
:: So is this.
::: This is at level three.
:: Back to level two
::: Back down to level three. Numbering for level three has been reset.
: Back to level one
::  Lettering for level 2 has been reset.
::: Level three
:::: Level four
::::: Level five
:::::: Level six
::::::: Level seven
:::::::: Level eight

# Gorilla Presenter

{{{image Bob | Our Founder Says "Hi"}}}

* 100% self-contained {{{branch Branch Test|Editing Slides}}}
* No app
* No server 
* No net connection needed

# Gorilla Presenter

* Produces a standard HTML file
* Compatible with all standard modern browsers

# Gorilla Presenter

* Fast text-based editing.
* Can be edited anywhere --- desktop, tablet -- even on a phone in a pinch.
* Get your presentation done and be off enjoying a tasty beverage while your rivals are still playing pointy-clicky.

# How do I get it?

You're soaking in it, mang! 
* Control+click (long press on mobile) 
* Choose "Save Presentation"
* That's it! Look wherever your machine puts downloaded files and you should see a copy of this file. Open it and you have a full working copy of Gorilla Presenter.
(iOS and iPadOS require special handling -- see the note at the end of this presentation)

# Editing Slides

* Control-click/long press
* Choose "Edit Slides"
* Uses standard Markdown formatting, plus GorillaPresenter extensions (discussed later in this deck)
* To see your changes, switch back to the Slide Show from the menu, or click the check button at the top of the editor.

# New Slides

An octophorpe, #, (aka "hash mark", "pound sign") at the beginning of a new line begins a new slide.
This is the standard Markdown first leve heading. You can also use ##, ###, etc. to get heading levels in the slide.

## This line is on the second level.
### This line is on the third level.

# New Paragraphs

To separate paragraphs, use blank lines. This is in one paragraph.

This is in another.

# Italic

Italic text is set off by either asterisks (\*) or underscores (\_)

*This is italic*, and _so is this_

If you need a "real" \* or \_ to show up on the slide, precede it with a backslash.

# Bold

* **This is bold** and __so is this__

# Bold Italic

To get bold *and* italic, use three of your chosen delimiter (\* or \_)

***This is bold italic*** and ___so is this___.

# Lists

Bulleted list items begin with \*. Numbered list items begin with a number followed by a parenthesis. The numbers don't have to be in order or even unique. Markdown figures that out for you.

* Bullet Point 1
* Bullet Point 2

1) Numbered Point 1
1) Numbered Point 2

# Block Quotes

This slide contains a block quote.

> Be yourself; everyone else is already taken. – Oscar Wilde

# Source Code

This slide contains computer source code.

```
int main(int argc, char *argv[]{
    printf("Hello, world!\n");
}
```

# Advanced Functions and Directives

None of the information on the following slides is required for basic functionality. You definitely *don't*  need to memorize all this stuff to use Gorilla Presenter. Think of the following as reference material. 

# Comments and Speaker Notes

// This line will only appear in the editor, not in the speaker notes or the slide.
; This line will appear in the editor and the speaker notes, but not on the slide.

You can view the speaker notes by choosing that option in the main menu.

# LaTeX Mathematics

Gorilla Presenter uses \\(\KaTeX\\) to render \\(\LaTeX\\) math on your slides, in either inline format  or display format.

Inline format example: This sentence has a  math expression \\(log(x^2)\\) in the middle of it.

Display format example:

$$\int_a^b x^2 dx  = \frac{x^3}{3}\LARGE{|}{_{\small a}^{\small b}}$$

A full tutorial on \\(\KaTeX\\)and \\(\LaTeX\\) is way beyond the scope of this presentation. There are many excellent resources on the web for learning these packages.

# Media Resources

You can upload and manage media files from the Media Library (accessible from the main menu). There are a few samples in there to get you started. One nice feature is that you can give your media files human-friendly names, for example, TalkingHead rather than "userdata/media/testvideo.mp4" or some similar gibberish. Media directives will use the first matching name they find, meaning that you could use just "Talking" or "Head", if you had no other media files containing those text strings in their names. Of course the full "TalkingHead" will also work. 

At present, Gorilla Presenter supports .jpg,.gif,.png, and .svg images, .mp3 audio, and .mp4 video. The goal here was to restrict media formats to those that are viewable/playable on the widest possible variety of systems.

Media files are stored within your presentation bundle, meaning that they can potentially make the bundle quite large (especially for video). There's no real way around this.

# YouTube videos

YouTube is easy. Just copy the embed code that YouTube provides and paste it into the slide. Not all video providers allow embedding, and, of course, YouTube videos only work if there's an Internet connection.

<iframe width="560" height="315" src="https://www.youtube.com/embed/4rW_-FuzYKY?si=TG7O9osLHrbZMsSB" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

You can also embed other external media files this way, using whatever code the source uses. Of course, using any external media source means your presentation will not work offline. You win some, you lose some.


# Directive: image

{{{image Bob | Our Founder Says "Hi"}}}

# Directive: audio

{{{audio BWV764 | Excerpt from Wie schön leuchtet der Morgenstern, BWV 764, Johann Sebastian Bach (variation of completion, performed by Thomas A. Schneider)}}}

# Directive: video

{{{video TalkingHead | Video sample}}}


# Directive: mailto

{{{mailto Send some mail|example@example.com|This is the test subject|This is the test body. Thanks!}}}


# Directive: externallinks

Provides a menu of clickable links to external resources. These open in a new window or tab (depending on how the user's browser is configured).

{{{externallinks Reference/Search Engine Resources
DuckDuckGo|https://duckduckgo.com/
Google|https://google.com
Wikipedia|https://en.wikipedia.com
Archive.org|https://archive.org
}}}

# Directive: branch

{{{branch LaTeX|Go to the LaTeX slide}}}

# Directive: branches

This lets you navigate within the slide show. As with media files, you only have to use enough of the slide's name to make it unique.

{{{branches Directives Table of Contents
The image directive|image
The audio directivedirective|audio
The video directive|video
The isbn directive|isbn
The mailto directive|mailto
The fontsize directive|fontsize
The fontfamily directive|fontfamily
The quiz directive|quiz
The quizconfig directive|quizconfig
The transition directive|transition
The externallinks directive|externallinks
The branch directive|branch
}}}


# Directive: quiz
The first line is the title. Question and answer sets are separated by blank lines. The correct answer(s) should be preceded with an asterisk (*).

{{{quiz This is the quiz title
True or false: the quiz directive allows you to add a quiz to a slide.
* True
False
LOL WAT?

How do you separate question/answer sets from each other?
With an asterisk
* With a blank line
By hitting enter enough times to go to a new page
It can't be done. A quiz can only have one question and answer set.
}}}


# Directive: quizconfig

This lets you customize the correct/incorrect responses for quizzes. 

{{{quizconfig Woohoo! That is correct!|I'm sorry. That is incorrect.}}}

would change the default responses of "Correct" and "Incorrect"  to "Woohoo! That is correct! and "I'm sorry. That is incorrect." respectively. This is a global setting (i.e., it affects all the slides, regardless of which slide contains the directive).

# Directive: transition

{{{transition zoom}}} 

Navigating to this slide will produce a zoom effect.

Available transitions are: swiperight, swipeleft, swipetop, swipebottom, cut, crossdissolve, iris, spin, and zoom.


# Directive: notitle

{{{notitle}}}
* This slide displays no title
* However, the title still appears in the slide selector in the main menu.
* This is useful if you need more room on the slide, for whatever reason.

# Directive: fontsize

{{{fontsize tiny This is tiny text.}}}

Available sizes are tiny, footnotesize, small, normalsize, large, Large, LARGE, huge, Huge, and HUGE.

These are designed to match the corresponding font sizes in \\(\LaTeX\\). For example, fontsize Large  should produce text of approximately the same size as \Large in \\(\LaTeX\\).

# Directive: fontfamily

This sets a span of text to the specified font stack.

{{{fontfamily slab-serif This is in slab serif.}}}

{{{fontfamily cursive This is in cursive}}}

Available stacks are:

{{{fontfamily serif serif}}} {{{fontfamily sans-serif sans-serif}}} {{{fontfamily monospace monospace}}} {{{fontfamily cursive cursive}}} {{{fontfamily system-ui system-ui}}} {{{fontfamily transitional transitional}}} {{{fontfamily old-style old-style}}} {{{fontfamily humanist humanist}}} {{{fontfamily geometric-humanist geometric-humanist}}} {{{fontfamily classical-humanist classical-humanist}}} {{{fontfamily neo-grotesque neo-grotesque}}} {{{fontfamily monospace-slab-serif monospace-slab-serif}}} {{{fontfamily monospace-code monopace-code}}} {{{fontfamily industrial industrial}}} {{{fontfamily rounded-sans rounded-sans}}} {{{fontfamily slab-serif slab-serif}}} {{{fontfamily antique antique}}} {{{fontfamily didone didone}}} {{{fontfamily handwritten handwritten}}}

# Directive: isbn

Given an International Standard Book Number (ISBN) this generates a menu of potential sources for the book.

{{{isbn 978-0743261692|Gilgamesh: A New English Version}}}


# Special instructions for Apple mobile devices

For whatever reason, Apple doesn't allow direct opening of HTML files (like a GorillaPresenter presentation) from the the file system of a mobile device (iPhone or iPad). To get around this, you need to add the GorillaPresenter Launcher web app to your home screen. This will allow you to choose a presentation to open.
