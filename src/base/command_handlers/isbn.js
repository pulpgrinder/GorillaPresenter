GorillaPresenter.processISBN = function(commandparts){
    commandparts = commandparts.join(" ");
    commandparts = commandparts.split("|");
    if(commandparts.length < 2){
        return "<span class='gorilla-presenter-error-message'>Found ISBN without enough arguments; need ISBN and title</span>";
    }
    let isbn = commandparts[0];
    let title = commandparts[1];
    return title + "<br /><img src='https://covers.openlibrary.org/b/isbn/" + isbn + "-S.jpg" + "' /><br />" + "<a href='https://www.worldcat.org/isbn/" + isbn + "' target='_blank'>Worldcat</a><br />"+ "<a href='https://www.amazon.com/s?k=" + isbn + "' target='_blank'>Amazon</a><br />" + "<a href='https://openlibrary.org/isbn/" + isbn + "' target='_blank'>Open Library</a><br />";

}