GorillaPresenter.processFontFamily = function(directiveparts){
    if(directiveparts.length === 0){
        return "Found {{{fontfamily}}} without a font family";
    }
    let family = directiveparts[0];
    directiveparts.shift();
    return "<span style='font-family:var(--" + family + "-font-stack);'>" + directiveparts.join(" ") + "</span>";
}