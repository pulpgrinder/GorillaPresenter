let GuerrillaPresenterComponents = {
    heading: function(text,init = false){
        if(init === true){
            text = "Type your heading here"
        }
        return "<div class='guerrilla-presenter-heading-container'><div class='guerrilla-presenter-heading  guerrilla-presenter-editable'></div><textarea class='guerrilla-presenter-editor'>" + text + "</textarea></div>"
    }, 
    bodytext: function(text,init = false){
        if(init === true){
            text = "Type your body text here. Can include Markdown:\n\n* Item 1\n* Item 2\n* Item 3\n\n**Bold** *Italic*\n\nand/or LaTeX equations.\n\n$$a^2+b^2=c^2$$\n"
        }
        return "<div class='guerrilla-presenter-bodytext-container'><div class='guerrilla-presenter-bodytext guerrilla-presenter-editable'></div><textarea class='guerrilla-presenter-editor'>" + text + "</textarea></div>";
    },
   
  
    image: function(url,init = false){
        if(init === true){
            url = "";
        }
        return "<img class='guerilla-presenter-image src='" + url + "' contenteditable=true>";
    },
}

let GuerrillaPresenterTemplates = {
    basicslide: ["heading","bodytext"],
    textonly:["bodytext"],
}

