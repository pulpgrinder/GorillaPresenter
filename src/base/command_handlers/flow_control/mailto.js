GorillaPresenter.processMailto = function(commandparts){
    commandparts = commandparts.join(" ");
    commandparts = commandparts.split("|");
   
    if(commandparts.length < 3){
        return "<span class='gorilla-presenter-error-message'>Found mailto without enough arguments; need email, subject, and body</span>";
    }
    let email = commandparts[0];
    let subject = commandparts[1];
    let body = commandparts[2];
    let mailtoString = '<a href="mailto:' + email + '?subject=' + subject + '&body=' + body + '">' + subject + '</a>';
    return mailtoString;
}