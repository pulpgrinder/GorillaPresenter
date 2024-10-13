
GorillaPresenter.scoreQuiz = function(event,isCorrect){
    if(isCorrect === "true"){
        GorillaPresenter.notify(GorillaPresenter.config.correctAnswer);
    }
    else{
        GorillaPresenter.notify(GorillaPresenter.config.incorrectAnswer);
    }
}

GorillaPresenter.setQuizConfig = function(responses){
    let responseparts = responses.join(" ").split("|");
    if(responseparts.length < 2){
        return "<span class='gorilla-presenter-error-message'>Error: Found quizresponses directive without values for correct and incorrect answers.</span>";
    }
    GorillaPresenter.config.correctAnswer = responseparts[0];
    GorillaPresenter.config.incorrectAnswer = responseparts[1];
    GorillaPresenter.saveConfig();
    return "";
}

GorillaPresenter.processQuiz = function(titleparts,directivelines){
    let title = titleparts.join(" ").trim();
    if(title === "")
    {
        return "<span class='gorilla-presenter-error-message'>Found quiz directive without title.</span>";
    }

    if(directivelines.length < 0){
        return "<span class='gorilla-presenter-error-message'>Found quiz directive without body.</span>";
    }
    
    let quizobject = {
        customClass: "gorilla-presenter-quiz",
        items: []
    };
    quizobject.items.push({
        type: "title",
        text: title,
        parameter: "title"
    });
    let questions = directivelines.join("\n").split("\n\n");
    for(i = 0; i < questions.length; i++){
        if(questions[i].trim() === ""){
            continue;
        }
    quizobject.items = quizobject.items.concat(GorillaPresenter.processQuizQuestion(questions[i]));
    }
    GorillaPresenter.clickHandlers["gorilla-presenter-quiz"] = function(evt){
        evt.preventDefault();
        evt.stopPropagation()
        evt.stopImmediatePropagation();
        GorillaPresenter.scoreQuiz(evt,evt.target.getAttribute("parameter"));
    }
    return GorillaPresenter.navigableList(quizobject);
}

GorillaPresenter.processQuizQuestion = function(question){
    let gotCorrectAnswer = false;
    let questionparts = question.split("\n");
    if(questionparts.length < 2){
        return [
            {
                type: "error",
                text: "Error: Found quiz question without title or answers."
            }
        ];
    }
    let questiontitle = questionparts[0];
    let questionarray = [{
        type: "header",
        text: questiontitle
    }];
    questionparts.shift();
    for(let i=0;i < questionparts.length;i++){
        let answer = questionparts[i];
        let text = answer.trim();
        if(text === ""){
            continue;
        } 
        let item = {
            text: text,
            parameter: "false"
        };
        if(answer.indexOf("*") === 0){
            gotCorrectAnswer = true;
            item.parameter = "true";
            item.text = answer.substring(1).trim();

        }
        questionarray.push(item);
    }
    if(gotCorrectAnswer === false){
        return [
            {
                type: "error",
                text: "Error: Found quiz question '" + questiontitle + "' without a correct answer."
            }
        ];
    }
    return questionarray;
}
