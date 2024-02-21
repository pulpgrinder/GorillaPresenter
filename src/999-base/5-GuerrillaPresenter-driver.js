GuerrillaPresenter.slideIDNumber = 1;
GuerrillaPresenter.sicTransit = new SicTransit("#guerrilla-presenter-slideroot",".guerrilla-presenter-slide"),
GuerrillaPresenter.addSlide = function(template){
        let slideElement = document.getElementById("guerrilla-presenter-slideroot");
        let id = "guerrilla-presenter-slide-" + GuerrillaPresenter.slideIDNumber;
        GuerrillaPresenter.slideIDNumber++;
        let newSlide = document.createElement("div");
        newSlide.setAttribute("class", "guerrilla-presenter-slide");
        newSlide.setAttribute("id", id);
        let html = this.processTemplate(template)
        newSlide.innerHTML = html;
        document.body.appendChild(newSlide);
        GuerrillaPresenter.sicTransit.showPanel("#" + id);
    },
GuerrillaPresenter.processTemplate = function(template){
        return JSON.stringify(template);
    }