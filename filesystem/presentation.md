# Gorilla Presenter

{{{media Our Founder}}}

## *Overview*
* Free software (MIT license)
* Completely self-contained in a **single** HTML file
## *Easy Distribution*
* No apps. No servers. Just a browser.
* Presentations can be:
    * Emailed
    * Put on a thumb drive
    * I dunno, put them on a Babylonian cuneiform tablet if that floats your boat.
## *Rapid Creation*
* Slides are written in Markdown, fast and easy. 
* Built-in editor
* Built-in media recorder (desktop Chrome, Brave, and Firefox)
* Get your deck finished and be off enjoying a tasty beverage while your rivals are still playing pointy-clicky.
## *Create Self-directed Tutorials/Programmed Learning Artifacts*
Gorilla Presenter has a number of ways of controlling the path through a presentation, such as branches, menus, outlines, and autoplay. These give you advanced control over the flow of your presentation. They're discussed in detail later. On the next slide, you'll see an example of Gorilla Presenter's own documentation organized using the Outline plugin. 

# Table of Contents

{{{outline
Tell Me More
=How do I Get It?|> How Do I Get Gorilla Presenter
=How do I Navigate the Slide Show?|> Navigation
=How do I Edit the Presentation?|> Editing Slides
=What is this "Markdown" Jazz? |> Markdown Basics
Media Plugins
= Media |> Media Management
== Media Recorder|> Media Recorder
== Using Media |> Using Media
Flow Control Plugins
= Advanced Flow Control |> Advanced Flow Control
==Branches|> Branches
==Menus|> Menus
==Outlines|>  Outlines
=Autoplay |> Autoplay
Other Plugins
=Poetry|> Poetry
=Book|> Book
=Wikipedia |> Wikipedia
=Map |> Map
=Icon |> Icon
=LaTeX Math|> LaTeX Math
=Stet|> Stet
=Literal|> Literal
Advanced Formatting
=Controlling Appearance with CSS|> Controlling Appearance with CSS
=Built-in CSS Classes |> Built-in CSS Classes
=Custom CSS Classes|> Custom CSS Classes
Mobile Platform Notes
=Using Gorilla Presenter with iOS|>iOS
}}}

# How Do I Get Gorilla Presenter?

You're soaking in it! Press/click and hold ("long press") anywhere in the slide body to bring up main menu, then click the the download button. You'll have your own fully self-contained copy... presentation, editor, media recorder, the whole bit. If you've made any edits, there will also be a download button in the upper right corner of the screen.


{{{media Download Presentation}}}


# Navigation

There are several ways to move around in the slide show. Clicking/tapping on the right side of the screen advances to the next slide (if there is one), and clicking/tapping on the left side of the screen returns to the previous slide (again, if there is one). You can also move forward and back using space/backspace, page up/page down, right arrow/left arrow, or up arrow/down arrow. It's not picky. Your browser's forward and back buttons are also functional.

You can choose a specific slide by pressing/clicking and holding anywhere on the slide until the main menu appears, then picking the slide you want from the slide chooser.

{{{media Slide Chooser}}}



# Editing Slides

To edit your presentation, click/tap and hold ("long press") on a slide, then choose the editor. 

{{{media Open Editor}}}

You can type your Markdown code as you wish, or if you select some text and click one of the buttons (e.g., the B for bold button), that text will be formatted accordingly. 

When you're done, click the slideshow button on the main menu (you may need to long-press again if the menu has been closed).

{{{media Return to Slides}}}

# Markdown Basics

Gorilla Presenter slides are written using Markdown, with some extensions. Markdown is a way of specifying text formatting with special keyboard sequences.

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
Even though there's a line break, there is no blank line, so the line break will be eaten.
```
produces:

This text has only one paragraph. 
Even though there's a line break, there is no blank line, so the line break will be eaten.

If you want a line break without starting a new paragraph, you can end the previous line with a backslash character (\\)^[not standard Markdown].

{{{literal
This text will have a single line break, \
rather than a paragraph break.
}}}

produces:

This text will have a single line break, \
rather than a paragraph break.

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

Note that only thing that matters is that the lines begin with a number -- they can be arbitrary numbers and Markdown will automatically create a sequentially numbered list. This avoids tedious manual renumbering for material that gets reorganized a lot.


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

## *Superscripts and subscripts*

Superscripts are achieved by surrounding the superscript text with caret (^) characters.

`X^2^` -> X^2^

Subscripts are achieved by surrounding the subscript text with tilde (~) characters.

`H~2~O` -> H~2~O

Note that superscripts and subscripts are not a feature in standard Markdown, though this syntax is a widely-used extension.

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

## *Footnotes*

Footnotes are produced using the syntax {{{stet ^[text of note]}}}.

This is a line with a ^[Here's the note. Click the reverse arrow to go back.] footnote in it.

This is an extension. The way standard Markdown creates footnotes is more clumsy, though you can use it if you prefer (or if you have existing Markdown that's formatted that way).

There are numerous other Markdown features, but these are the ones most generally useful in creating slide presentations. If you want to learn more, have a look at this [Markdown "cheatsheet"](https://www.markdownguide.org/cheat-sheet/)

# Advanced Flow Control

Most presentations are intended for viewing in a linear fashion, from the first slide to the last one.

Gorilla Presenter lets you do that, of course, but it also lets you create branches, menus, outlines, and automatic transitions that let you control the viewer's path through the presentation, based on choices the viewer makes while watching the presentation. You can use these features to create a classic "programmed learning" experience, or create whatever organization matches your own vision.

# Branches

A branch is like a high-powered hyperlink. You can navigate to another slide, open an external web site, ask a true/false question, or display any message of your choice.

If the text for the branch begins with an asterisk, clicking it will display whatever you have set as "Default Correct Response" in the Gorilla Presenter settings.

{{{stet{{{branch *correct answer}}}}}} -> {{{branch *correct answer}}}

If the text begins with a minus sign, clicking it will display whatever you've set as Default Incorrect Response.

{{{stet{{{branch -incorrect answer}}}}}} -> {{{branch -incorrect answer}}}

If the text contains |> followed by a slide name, Gorilla Presenter will produce an internal link to another slide. You can even use a partial name, in which case the link will go to the first matching slide.

{{{stet{{{branch Go to the first slide |> Gorilla P}}}}}} -> {{{branch Go to the first slide |> Gorilla P}}} (note use of partial slide name)

|~ will produce a link to an external web site.

{{{stet{{{branch external link|~https://www.google.com}}}}}} -> {{{branch external link|~https://www.google.com}}} (will open in a new window or tab)

If you have just a | as the separator, Gorilla Presenter will display a message containing whatever text follows it.

{{{stet{{{branch this branch displays a message|Hi, there!}}}}}} -> {{{branch this branch displays a message|Hi, there!}}}

If you don't have an | at all, the branch won't do anything (other than being displayed with a different color)

{{{stet {{{branch The goggles do nothing!}}}}}} -> {{{branch The goggles do nothing!}}}

This doesn't accomplish much for a single branch, but is used as a section separator in Menus and Outlines (read on).

# Menus

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

```
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
```

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

# Media Management

**VERY IMPORTANT** Any changes you make on the media management screen will Go Away unless you download the altered presentation for later reloading. Simply clicking refresh or opening the original file again will result in all your changes being lost (this holds for slides you've edited or changes you've made to the settings, too, of course). Gorilla Presenter does its best to keep track of changes, and displays a notice in the upper right-hand corner of the screen if something has changed. 

To reach the media management screen, click/press and hold on any other screen until the menu appears, then select the media button.

{{{media Media Tab}}}

The media management screen lets you upload and manage resource files, such as images, audio files, video files, and custom fonts and CSS.

{{{media Media Management Screen}}}

You can add or delete standard image files (png,jpeg,gif,bmp,svg,and webp), several types of video file (mp4, mov, avi, webm), audio files (mp3 or webm), font files (ttf,otf,woff,woff2), and css files. Several other file types can be uploaded, but Gorilla Presenter doesn't do anything with them for now. It's expected that other file types will be handled in the future.

For maximum compatibility, it's recommended that you use png, jpeg, gif, svg, or webp images, mp4 or webm videos, and mp3 or webm audio.

Any font files or CSS files uploaded here will be loaded when the presentation starts up, or when the media management screen is exited. The CSS here will be loaded **after** all the built-in CSS is loaded, making it possible to override just about every part of Gorilla Presenter's appearance. Note that this could render the presentation competely unviewable if you don't know what you're doing. 😱 Great power, great responsibility, yadda-yadda-yadda.

It doesn't make much difference what you name your font files or CSS files, but you should try to give your audio, video, and image files meaningful names. Gorilla Presenter uses its own file system which allows you to use just about any character you can type. For example, prefer "Theda Bara With A Skeleton" to some atrocity like "thdabrskl352". You can rename any file on the media management screen just by clicking on the name and typing the new text. 

There is an integrated trash bin that lets you temporarily mark files as deleted, then emptied later to make the deletion permanent.


# Using Media

This is pretty easy. Just insert a media directive along with the name (or a partial name) of the media file you want to use. As with other parts of Gorilla Presenter, you only need to give enough of the name to distinguish it from other files.


You don't need to tell Gorilla Presenter whether it's an audio, video, or still image file, nor do you need to worry about file extensions. Gorilla Presenter figures all that stuff out for you. However, you should probably avoid having (e.g.) both a "This is a cool" image file and a "This is cool" video file, or you may get unexpected behavior (Gorilla Presenter uses the first matching file it finds, which may not be the one you want if you have duplicate names).

{{{stet {{{media theda}}}}}} will display a picture of silent film star Theda Bara.

{{{media theda}}}

The actual media file is named "Theda Bara With A Skeleton.jpg", but "theda" is enough to eliminate ambiguity.


{{{stet {{{media 1812}}}}}} will play an excerpt from Tchaikovsky's 1812 Overture (from a public domain performance courtesy of the Skidmore College Orchestra).


{{{media 1812}}}


{{{stet{{{media nasa}}}}}} will display a webm video of the satellite coverage of some NASA weather satellites (video courtesy NASA)


{{{media nasa}}}

You can also use media files from anywhere on the web. Just use the URL in a media directive.

{{{stet{{media https://upload.wikimedia.org/wikipedia/commons/1/13/NASA-Apollo13-ViewsOfMoon-20200224.webm|Some views of the Moon from Apollo 13}}}}}

(video courtesy Nasa)

Here we're using an explicit title (the part following the |) because the file is on an external site and the file name is ugly. For local files, you should use descriptive file names, as discussed in the {{{branch Media Management|>Media Management}}} section though you can add an explicit title even for a local file if you wish.

{{{media https://upload.wikimedia.org/wikipedia/commons/1/13/NASA-Apollo13-ViewsOfMoon-20200224.webm|Some views of the Moon from Apollo 13}}}

The advantage of this is that you don't bloat the size of your presentation file. The disadvantage is that you're loading the media file over the web, and thus must have an active Internet connection.

You should consider this option if you're going to be using large video files and you know you're going to have an Internet connection available.

# Media Recorder

# Autoplay

The autoplay plugin is for unattended presentations.

There are three basic forms:

`{{{autoplay 15}}}` will advance through the slides one-by-one, starting at the current slide, changing to the next slide after 15 seconds. This continues until another autoplay directive is encountered or the end of the presentation is reached.

`{{{autoplay 10 foobar}}}` This would delay 10 seconds, then advance to the first slide whose title matches "foobar". Unlike the previous form, this is a one-shot. After the foobar slide is visible, the autoplay stops (it wouldn't make any sense to go to the foobar slide when you were already on foobar) You'd need to put another autoplay directive on that slide if you wanted to keep things moving.

`{{{autoplay 0}}}` or just `{{{autoplay}}}` This stops any autoplay that is currently in progress.

While the slides are autoplaying, you can click on a slide to pause the autoplay, then click again to resume.

# Poetry

The poetry plugin formats any contained text as poetry/verse -- line breaks, spacing, etc. are all retained as written, though typographic substitutions (e.g., curly quotes) are still made. In addition, the poetry block is centered horizontally on the screen. Markdown code (bold, italic, etc.) can be used within the poem.

```
{{{poetry
This is *My* Title
Mary had a little lamb.
    Its fleece was white as snow.
And everywhere that Mary went,
    The lamb was sure to go.
}}}
```

will produce:

{{{poetry
This is *My* Title
Mary had a little lamb.
    Its fleece was white as snow.
And everywhere that Mary went,
    The lamb was sure to go.
}}}

The first line will be used as the title. If you don't want the poetry block to have a title, use a blank line.

```
{{{poetry

Here is my poem.
    It hasn't a title.
Maybe it's ho-hum.
    A title's not vital.
}}}
```
will produce:

{{{poetry

Here is my poem.
    It hasn't a title.
Maybe it's ho-hum.
    A title's not vital.
}}}

# Stet

The stet plugin is sort of like an "anti-plugin". Anything contained in a stet directive will appear in the output without any processing by Gorilla Presenter. This is useful in special circumstances (this tutorial uses stet extensively for examples, for instance). Note that this won't keep the web browser from doing web-browsery things (e.g., eating extra whitespace, interpreting any angle brackets as possible HTML code, etc.). It just makes Gorilla Presenter leave the text alone.

Example: this media directive would normally be processed by the media plugin, but because it is wrapped in a stet directive Gorilla Presenter won't touch it.

{{{stet {{{media bazmataz}}}}}}

# Literal

The literal plugin is similar to stet, but it makes some substitutions to make the result render as expected in a browser. Problematic characters, such as space, ampersand, angle brackets, and newlines are replaced so the browser doesn't eat them or confuse them with HTML tags.

{{{literalThis text has    embedded spaces
newlines, 


more newlines,
A line with a                    whole bunch of embedded spaces,
some < > angle brackets, and an & ampersand.}}}


# Book

The books plugin lets you create links to sources for any book for which you have the ISBN. Both ISBN-10 and ISBN-13 are supported. If you have both, you should probably prefer ISBN-13.

Unlike Gorilla Presenter in general, the Books plugin does require an active internet connection (otherwise there'd be no way to retrieve the cover, and no way to follow a link to the book search engines).

The format is:

{{{stet{{{book 978-0201514254}}}}}}

and the result will be:


{{{book 978-0201514254}}}


# Wikipedia

The Wikipedia plugin will retrieve a summary for your chosen topic (if it exists, of course). It also provides a link to the full article.

As with the Book plugin, this obviously requires an active internet connection.

{{{stet{{{wikipedia black sabbath}}}}}} will produce:

{{{wikipedia black sabbath}}}


# Map

The Map plugin embeds a Google Map for your chosen search term (if it exists, of course). Google Maps is pretty flexible... you can enter your searches by city name, latitude and longitude, and even major landmarks. Once again, this obviously requires an internet connection to work.

{{{stet{{{map Washington Monument}}}}}}

produces:


{{{map Washington Monument}}}

# LaTeX Math

Gorilla Presenter uses the KaTeX plugin to render LaTeX mathematics. 

Display (large) math uses {{{stet$$LaTeX code$$}}}

Here's some display LaTeX: $$x^n + y^n = z^n$$

Inline (small) math uses {{{stet\\(LaTeX code\\)}}}

Here's some inline LaTeX:  \\(z^n\\).


# Icon

Gorilla Presenter contains the full set of {{{branch Ionicons|~https://ionic.io/ionicons}}}. You can use these for decorative purposes, custom menus, or the like.

{{{stet {{icon american-football-outline}}}}}

produces:

{{{icon american-football-outline}}}


# Settings

Settings information goes here, TBW

# Controlling Appearance with CSS

You can apply CSS classes of your choice to block-level items in Gorilla Presenter (paragraphs, lists, etc.). Several useful classes are built-in, and you can also define your own. These are invoked the same way as plugin specifications. For instance, {{{stet {{{center}}}}}} will cause every following block to have the .center CSS class, until a {{{stet {{{clear}}}}}} directive is encountered.

These can be stacked:

```
{{{red}}}{{{center}}}Here's some red, centered text

{{{clear}}}
This text is back to normal.
```

will produce:

{{{red}}}{{{center}}}Here's some red, centered text

{{{clear}}}
This text is back to normal.

# Built-in CSS Classes

The media folder contains a file named `Custom CSS.css` that contains some useful CSS formatting classes.

``` css
.center {
  text-align: center;
}

.right {
  text-align: right;
}

.left {
  text-align: left;
}

.justify {
  text-align: justify;
}

.hang {
  /* Hanging indent: first line flush left, subsequent lines indented */  
  padding-left: 2em;
  /* Indent size for subsequent lines */
  text-indent: -2em;
  /* Pull the first line back out */
}


.red {
    color: red;
}

.blue {
    color: blue;

}

.green {
    color: green;

}

.purple {
    color: rebeccapurple;
}
.orange {
    color: orange;
}

```

# Custom CSS Classes

You can add your own CSS classes by adding them to the `Custom CSS.css` file, or uploading your own CSS file to the media folder (as always, you'll need to save the presentation if you want uploaded files to be present on future loads). If you want to use your own separate CSS files, keep in mind that order matters.

First the system's built-in CSS is loaded, then any custom CSS files in the media folder (just `Custom CSS.css` by default). Since the media folder CSS comes later, it's possible to override pretty much any of the built-in CSS.

If there's more than one CSS file in the media folder, they are loaded in English lexical ("alphabetical" or "dictionary") order. If you want to make sure your CSS file is loaded first, you could name it something like `0000LoadMeFirst.css`. If you want to make sure your CSS is loaded last, you could name it something like `zzzLoadMeLast.css`.

You can even override the built-in theme variables to create your own theme.

```css
:root {
  --slide-body-color: yellow;
  --slide-body-background-color: pink;
  --slide-title-color: green;
  --slide-title-background-color: magenta;
  --slide-title-bottom-border: 1px solid #C0C0C0;
  --menu-body-color:cyan;
  --menu-background-color: red;
  --menu-header-color: orange;
  --menu-header-background-color: blue;
}
```

(example only -- don't actually use these colors -- they're hideous {{{icon skull-outline}}})

This theme would only remain in effect until the user changed it to something else (probably pretty quickly if you actually use those colors {{{icon happy-outline}}}).

# Using Gorilla Presenter with iOS

Unfortunately, most web browsers for iPhoneOS and/or iPadOS do not allow you to open HTML files (like a GorillaPresenter presentation) from the local file system. It is widely believed that Apple does this to prevent web applications (again, like GorillaPresenter) from competing with the App Store. 

There is a workaround which requires installing the Microsoft Edge Browser.

{{{branch
Get the Microsoft Edge Browser for iOS|~https://apps.apple.com/us/app/microsoft-edge-ai-browser/id1288723196
}}}


Once you have Edge installed, open the Files app.

{{{media Files App}}}

Browse the file system until you find your Gorilla Presenter index.html file (if you've got it from the web it's probably in the Downloads folder, if you've copied it through iCloud, saved it as an email attachment,  or something, only you know where it is, mang).

{{{media Find Your HTML File}}}

Tap the file and click Share

{{{media Click Share}}}

Choose Microsoft Edge (if you've got a bunch of apps installed, you may need to scroll horizontally to find it)

{{{media Choose Microsoft Edge}}}

Finally, choose Open in Microsoft Edge.

{{{media Open in Microsoft Edge}}}

I apologize for this convoluted process. Apple seems determined to make it as hard as possible to run HTML/web apps.




