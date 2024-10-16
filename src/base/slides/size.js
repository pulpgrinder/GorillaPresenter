 
let fontSizeLookup = {
"tiny":50,
"scriptsize": 67,
"footnotesize": 83,
"small": 91,
"normalsize": 100,
"large":120,
"Large": 150,
"LARGE": 172,
"huge": 207,
"Huge": 250,
"HUGE":300

}



GorillaPresenter.processFontSize = function(directiveparts){
    if(directiveparts.length === 0){
        return "Found {{{fontsize}}} without a size";
    }
    let size = directiveparts[0];
    directiveparts.shift();
    if(fontSizeLookup[size] === undefined){
        return "<span class='gorilla-presenter-error-message'>Unrecognized font size: " + size + "</span>";
    }
    return "<span style='font-size:" + fontSizeLookup[size] + "%;'>" + directiveparts.join(" ") + "</span>";
}