# Gorilla Presenter

* Free software (MIT license)
* Completely self-contained in a **single** HTML file
* No apps. No servers. Just a browser.
* Presentations can be:
    * Emailed
    * Put on a thumb drive
    * I dunno, put them on a Babylonian cuneiform tablet if that floats your boat.
* Built-in editor
* Built-in media recorder
* Slides are written in Markdown, fast and easy. Get your deck finished and be off enjoying a tasty beverage while your rivals are still playing pointy-clicky.

{{{outline
Overview
=Sounds great! How do I get it?|> How Do I Get Gorilla Presente
=How do I Navigate the Slide Show?|> Navigation
Editing
=How do I Edit the Presentation?|> Editing Slides
==Markdown Basics |> Markdown Basics
Advanced Flow Control
=Branches, Menus, and Outlines
==Branches|> Branches
==Menus|> Menus
==Outlines|>  Outlines
=Autoplay |> Autoplay
Media
=Using Media |> Using Media
=Media Recorder|> Media Recorder
Plugins
=Book|> Book
==Wikipedia |> Wikipedia
===Map |> Map
====Icon |> Icon
=====Using with iPhoneOS/iPadOS|>iPhoneOS
=LaTeX Math|>LaTeX Math
Advanced Formatting
=Built-in CSS Classes |Built-in CSS Classes
=Custom CSS Classes|> Custom CSS Classes
}}}

# How Do I Get Gorilla Presenter?

You're soaking in it! Press/click and hold ("long press") anywhere in the slide body to bring up main menu, then click the the download button. You'll have your own fully self-contained copy... presentation, editor, media recorder, the whole bit.


{{{media Download Presentation}}}

# Navigation

There are several ways to move around in the slide show. Clicking/tapping on the right side of the screen advances to the next slide (if there is one), and clicking/tapping on the left side of the screen returns to the previous slide (again, if there is one). You can also move forward and back using space/backspace, page up/page down, right arrow/left arrow, or up arrow/down arrow. It's not picky.

You can choose a specific slide by pressing/clicking and holding anywhere on the slide until the main menu appears, then picking the slide you want from the slide chooser.

{{{media Slide Chooser}}}

The menu, outline, branch, and autoplay directives give you advanced control over the flow of your presentation. Those are discussed later.


# Editing Slides

To edit your presentation, click/tap and hold ("long press") on a slide, then choose the editor. 

{{{media Open Editor}}}

You can type your Markdown code as you wish, or if you select some text and click one of the buttons (e.g., the B for bold button), that text will be formatted accordingly. 

When you're done, click the slideshow button on the main menu (you may need to long-press again if the menu has been closed).

{{{media Return to Slides}}}

# Markdown Basics

Gorilla Presenter slides are written using Markdown, with some extensions. Markdown is a way of specifying text formatting with special keyboard sequences.

In the examples below, non-standard Markdown will be indicated with a § (section character)

This is just a brief overview -- there are many excellent Markdown tutorials on the web. 

## *Paragraphs*

Separate paragraphs using a blank line.

```
This text has two paragraphs.

Here's the second one.
```
produces:

This text has two paragraphs.

Here's the second one.

```
This text has only one paragraph. 
Even though there's a line break, there is no blank line.
```
produces:

This text has only one paragraph. 
Even though there's a line break, there is no blank line.

§ If you want a line break without starting a new paragraph, you can end the previous line with a backslash character (\\).


## *Headings*

One or more # characters at the beginning of a line produce a heading.

`## this will be a second-level heading` ->

## this will be a second-level heading

## *Slide separators*

Gorilla Presenter uses first-level headings to mark the boundary between slides. 

```
\# This is title for the first slide

This is the text of the first slide

\#  This is the title for the second slide

This is the text of the second slide.

```

The above will produce two slides.


If you really need a first-level heading in the middle of a slide, you can prefix the # with a \ character, but you should probably avoid doing that except in special circumstances.

`\# This will produce a first-level heading in the middle of the slide, without starting a new slide` ->

\# This will produce a first-level heading in the middle of the slide, without starting a new slide


## *Bold and Italic*

 `**this will be bold**` -> **this will be bold**
 
 `*this will be italic*` -> *this will be italic*
 
 Technically these produce 'strong' and 'emphasized' text rather than bold and italic per se. However, by default those are visually the same (you could use CSS to change that).

## *Ordered (numbered) Lists*

```markdown
1. This is a numbered list.
0. It has three items in it.
95. This is the third one.
```
will produce:

1. This is a numbered list.
0. It has three items in it.
95. This is the third one.

Note that only thing that matters is that the lines begin with numbers -- they can be anything and Markdown will automatically create a sequential numbered list.


## *Unordered (bulleted) Lists*

```markdown
* This is a numbered list.
* It has three items in it.
* This is the third one.
```
will produce:

* This is a numbered list.
* It has three items in it.
* This is the third one.

You can use - characters instead of * if you prefer.


## *Blockquotes*

```
> Quis custodiet ipsos custodes?
> 
> -- Juvenal
```

will produce a blockquote:

> Quis custodiet ipsos custodes?
> 
> -- Juvenal

## *Superscripts and subscripts§*

Superscripts are achieved by surrounding the superscript text with caret (^) characters.

`X^2^` -> X^2^

Subscripts are achieved by surrounding the subscript text with tilde (~) characters.

`H~2~O` -> H~2~O

## *Code*

Inline code:  \`x = x + 2\` ->  `x = x + 2`


Code blocks:

````plaintext
```javascript
function test() {
    console.log("Code block");
}
```
````

will produce:


```javascript
function test() {
    console.log("Code block");
}
```

## *Footnotes§*

Footnotes are produced using the syntax `^[text of note]`.

This is a line with a ^[Here's the note] footnote in it.

There are numerous other Markdown features, but these are the ones most generally useful in creating slide presentations. If you want to learn more, have a look at this [Markdown "cheatsheet"](https://www.markdownguide.org/cheat-sheet/)


# *Branches§*

A branch is like a high-powered hyperlink. You can navigate to another slide, open an external web site, ask a true/false question, or display any message of your choice.

If the text for the branch begins with an asterisk, clicking it will display whatever you have set as "Default Correct Response" in the Gorilla Presenter settings.

`{{{branch *correct answer}}}` -> {{{branch *correct answer}}}

If the text begins with a minus sign, clicking it will display whatever you've set as Default Incorrect Response.

`{{{branch -incorrect answer}}}` -> {{{branch -incorrect answer}}}

If the text contains |> followed by a slide name, Gorilla Presenter will produce an internal link to another slide. You can even use a partial name, in which case the link will go to the first matching slide.

`{{{branch Go to the first slide |> Gorilla P}}}` -> {{{branch Go to the first slide |> Gorilla P}}} (note use of partial slide name)

(if you try that out you may want to click the back button to get back here afterward)

|~ will produce a link to an external web site.

`{{{branch external link|~https://www.google.com}}}` -> {{{branch external link|~https://www.google.com}}}

If you have just a | as the separator, Gorilla Presenter will display a message containing whatever text follows it.

`{{{branch this branch displays a message|Hi, there!}}}` -> {{{branch this branch displays a message|Hi, there!}}}

If you don't have an | at all, the branch won't do anything (other than being displayed with a different color)

{{{branch The goggles do nothing!}}}` -> {{{branch The goggles do nothing!}}}

This is of little use for a single branch, but is quite useful in Menus and Outlines (read on).


# *Menus§*

Menus are basically a collection of branches packed into a list. The link format is exactly the same as for branches (see previous slide). Here a blank argument (which was of no use in a plain branch) is used as a menu separator.

```
{{{menu
Menu Section 1
Go to the Navigation slide|>Navigation
Go to an external site|~https://google.com
Menu Section 2
Display a message|Hi there!
*This is the right answer, yo.
-This is a wrong answer
}}}
```

will produce:

{{{menu
Menu Section 1
Go to the Navigation slide|>Navigation
Go to an external site|~https://google.com
Menu Section 2
Display a message|Hi there!
*This is the right answer, yo.
-This is a wrong answer
}}}


# Outlines

Outlines are exactly like menus, except they appear in MLA outline format. Outline indentation levels are specified by preceding the line with an equals sign for each desired indentation level.

````
{{{outline
Search Engines
=Google|~https://www.google.com
=Duck Duck Go|~https://duckduckgo.com/
=Worldcat|~https://search.worldcat.org/
Level Demonstration
=Here's some text
==With many different levels of indentation
===Third level.
===Another third level
====Fourth level
====Another fourth level
== Back up to second level
Back up to top level
}}}
````

will produce:

{{{outline
Search Engines
=Google|~https://www.google.com
=Duck Duck Go|~https://duckduckgo.com/
=Worldcat|~https://search.worldcat.org/
Level Demonstration
=Here's some text
==With many different levels of indentation
===Third level.
===Another third level
====Fourth level
====Another fourth level
== Back up to second level
}}}

# Using Media

The media screen lets you upload and manage resource files, such as images, audio files, video files, and custom fonts and CSS.


This should {{{media theda}}} show a picture of Theda Bara

{{{media Test}}}

Display an audio player with a test MP3 file.


{{{media spin}}}

Display an MP4 video.

# Media Recorder

# Autoplay

The autoplay plugin is for unattended presentations.

There are three basic forms:

`{{{autoplay 15}}}` will advance through the slides one-by-one, starting at the current slide, changing to the next slide after 15 seconds. This continues until another autoplay directive is encountered or the end of the presentation is reached.

`{{{autoplay 10 foobar}}}` This would delay 10 seconds, then advance to the first slide whose title matches "foobar". Unlike the previous form, this is a one-shot. After the foobar slide is visible, the autoplay stops (it wouldn't make any sense to go to the foobar slide when you were already on foobar) You'd need to put another autoplay directive on that slide if you wanted to keep things moving.

`{{{autoplay 0}}}` or just `{{{autoplay}}}` This stops any autoplay that is currently in progress.

While the slides are autoplaying, you can click on a slide to pause the autoplay, then click again to resume.


```

# Book

The books plugin lets you create links to sources for any book for which you have the ISBN. Both ISBN-10 and ISBN-13 are supported. If you have both, you should probably prefer ISBN-13.

Unlike Gorilla Presenter in general, the Books plugin does require an active internet connection (otherwise there'd be no way to retrieve the cover, and no way to follow a link to the book search engines).

The format is:

`{{{book 978-0201514254}}}`

and the result will be:


{{{book 978-0201514254}}}


# Wikipedia

The Wikipedia plugin will retrieve a summary for your chosen topic (if it exists, of course). It also provides a link to the full article.

As with the Book plugin, this obviously requires an active internet connection.

{{{wikipedia black sabbath}}}


# Map

The Map plugin embeds a Google Map for your chosen search term (if it exists, of course). Google Maps is pretty flexible... you can enter your searches by city name, latitude and longitude, and even major landmarks. Once again, this obviously requires an internet connection to work.

`{{{map Washington Monument}}}`

produces:


{{{map Washington Monument}}}

# LaTeX Math


Gorilla Presenter uses the KaTeX plugin to render LaTeX mathematics. 

Display (large) math uses `$$LaTeX code$$`

Here's some display LaTeX: $$x^n + y^n = z^n$$

Inline (small) math uses `\\(LaTeX code\\)`

Here's some inline LaTeX:  \\(z^n\\).


# Icon

Gorilla Presenter contains the full set of {{{branch Ionicons|~https://ionic.io/ionicons}}}. You can use these for decorative purposes, custom menus, or the

`{{icon american-football-outline}}}`

produces:

{{{icon american-football-outline}}}


# Using with iPhoneOS/iPadOS

Unfortunately, most web browsers for iPhoneOS and/or iPadOS do not allow you to open HTML files (like a GorillaPresenter presentation) from the local file system. It is widely believed that Apple does this to prevent web applications (again, like GorillaPresenter) from competing with the App Store. 

    There is a workaround which requires installing the Microsoft Edge Browser.

        {{{menu
        Get the Microsoft Edge Browser for iOS|~https://apps.apple.com/us/app/microsoft-edge-ai-browser/id1288723196}}}

# Built-in CSS Classes


# Custom CSS Classes

