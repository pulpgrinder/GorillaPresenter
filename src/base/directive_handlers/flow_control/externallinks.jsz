GorillaPresenter.processExternalLinks = function(titleparts,links){
    let title = titleparts.join(" ").trim();
    if(title === "")
    {
        return "<span class='gorilla-presenter-error-message'>Found externallinks directive without title.</span>";
    }

    if(links.length < 0){
        return "<span class='gorilla-presenter-error-message'>Found externalLinks directive without links.</span>";
    }

    let linksobject = {
        customClass: "gorilla-presenter-external-link",
        items: []
    };
    linksobject.items.push({
        type: "title",
        text: title,
        parameter: "title"
    });
    for(i = 0; i < links.length; i++){
        if(links[i].trim() === ""){
            continue;
        }
        let link = links[i].split("|");
        if(link.length < 2){
            return "<span class='gorilla-presenter-error-message'>Found externallinks without enough arguments; need title and URL</span>";
        }
        let title = link[0];
        let url = link[1];
        linksobject.items.push({
            type: "clickable",
            text: title,
            parameter: url
        }); 
    }
    GorillaPresenter.clickHandlers["gorilla-presenter-external-link"] = function(evt){
        evt.preventDefault();
        evt.stopPropagation()
        evt.stopImmediatePropagation();
        GorillaPresenter.openNewWindow(evt,evt.target.getAttribute("parameter"));
    }
    return GorillaPresenter.navigableList(linksobject);
}