PocketPresenter.sicTransit = new SicTransit("#pocket-presenter-slideroot",".pocket-presenter-slide"),
PocketPresenter.addSlide = function(template){
        let slideElement = document.getElementById("pocket-presenter-slideroot");
        let id = "pocket-presenter-slide-" + Math.random();
        let newSlide = document.createElement("div");
        slideElement.appendChild(newSlide);
        newSlide.setAttribute("class", "pocket-presenter-slide");
        newSlide.setAttribute("id", id);
        let html = this.processTemplate(template)
        newSlide.innerHTML = html;
      //  sicTransit.showSlide("#" + id);
    },
PocketPresenter.processTemplate = function(template){
        return "<b>Hooha</b>";
    }