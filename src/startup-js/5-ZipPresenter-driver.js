ZipPresenter = {
    sicTransit:new SicTransit("#zip-presenter-slideroot",".zip-presenter-slide"),
    addSlide:function(template){
        let slideElement = document.getElementById("zip-presenter-slideroot");
        let id = "zip-presenter-slide-" + Math.random();
        let newSlide = document.createElement("div");
        slideElement.appendChild(newSlide);
        newSlide.setAttribute("class", "zip-presenter-slide");
        newSlide.setAttribute("id", id);
        let html = this.processTemplate(template)
        newSlide.innerHTML = html;
      //  sicTransit.showSlide("#" + id);
    },
    processTemplate: function(template){
        return "<b>Hooha</b>";
    }
}