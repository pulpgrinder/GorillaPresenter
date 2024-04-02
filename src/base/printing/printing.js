GorillaPresenter.showPrint = function(){
    console.log("in showPrint");
    GorillaPresenter.renderPrinterDialog();
    document.getElementById("gorilla-presenter-printer-dialog").style.display = "block";
    GorillaPresenter.centerElement(document.getElementById("gorilla-presenter-printer-dialog"));
    }
GorillaPresenter.renderPrinterDialog = function(){
    let printerDialog = document.getElementById("gorilla-presenter-printer-dialog");
    printerDialog.innerHTML = "";
    let dialogContent = "";
    dialogContent += "<span class='translatable'>Paper Size</span>:" + "<input type='radio' name='papersize' id='usletter' value='usletter'/>";
    dialogContent += "<label for='usletter'><span class='translatable'>US Letter</span></label>";
    dialogContent += "<input type='radio' name='papersize' id='a4' value='a4'/>";
    dialogContent += "<label for='a4'>A4</label>";
    dialogContent += "<br/>";
    dialogContent += "<span class='translatable'>Slides Per Page</span>:" + "<input type='radio' name='slidesperpage' id='slides6up' value='6up'/>";
    dialogContent += "<label for='slides6up'>6</label>";
    dialogContent += "<input type='radio' name='slidesperpage' id='slides1up' value='1up'/>";
    dialogContent += "<label for='slides1up'>1</label>";
    dialogContent += "<br/>";
    dialogContent += "<div><span class='translatable'>In the system print dialog, please set landscape orientation for one slide per page and portrait orientation for six slides per page, and ensure the paper size is set to the desired format</span>.</div>";
    dialogContent += "<br/>";
    dialogContent += "<hr />";
    dialogContent += "<button id='print-button' onclick='GorillaPresenter.printSlides()'><span class='translatable'>Print</span></button><button id='print-cancel-button' onclick='document.getElementById(\"gorilla-presenter-printer-dialog\").style.display = \"none\"'><span class='translatable'>Cancel</span></button>";
    printerDialog.innerHTML = dialogContent;
    const paperSizes = document.getElementsByName('papersize');
    for (let i = 0; i < paperSizes.length; i++) {
       if (paperSizes[i].value === GorillaPresenter.config.papersize) {
         paperSizes[i].checked = true;
        break;
      }
    }
    const slidesPerPage = document.getElementsByName('slidesperpage');
    for (let i = 0; i <  slidesPerPage.length; i++) {
       if (slidesPerPage[i].value === GorillaPresenter.config.slidesperpage) {
         slidesPerPage[i].checked = true;
        break;
      }
    }
    document.querySelectorAll('input[name="papersize"]').forEach((papersize) => {
      papersize.addEventListener('change', function() {
        GorillaPresenter.config.papersize = this.value;
        GorillaPresenter.saveConfig();
      });
    });
    document.querySelectorAll('input[name="slidesperpage"]').forEach((slidesperpage) => {
      slidesperpage.addEventListener('change', function() {
        GorillaPresenter.config.slidesperpage = this.value;
        GorillaPresenter.saveConfig();
      });
    });
  }



  GorillaPresenter.printSlides = function(){
    let printerDialog = document.getElementById("gorilla-presenter-printer-dialog");
    printerDialog.style.display = "none";
    let paperSizeControl = document.querySelector('input[name="papersize"]:checked');
    if(paperSizeControl === null){
        GorillaPresenter.warn(GorillaPresenter.translate("Please select a paper size.",GorillaPresenter.config.currentLanguage));
        return;
    }
    let paperSize = paperSizeControl.value;
    console.log("paperSize: " + paperSize);
    if(paperSize === null){
        GorillaPresenter.warn(GorillaPresenter.translate("Please select a paper size.",GorillaPresenter.config.currentLanguage));
        return;
    }
    let slidesPerPageControl = document.querySelector('input[name="slidesperpage"]:checked');
    if(slidesPerPageControl === null){
        GorillaPresenter.warn(GorillaPresenter.translate("Please select the number of slides per page.",GorillaPresenter.config.currentLanguage));
        return;
    }
    slidesPerPage = slidesPerPageControl.value;
    console.log("slidesPerPage: " + slidesPerPage);
    if(slidesPerPage === null){
        GorillaPresenter.warn(GorillaPresenter.translate("Please select the number of slides per page.",GorillaPresenter.config.currentLanguage));
        return;
    }
    if(slidesPerPage === "1up"){
        GorillaPresenter.render1up(paperSize);
    }
    else if(slidesPerPage === "6up"){
        GorillaPresenter.render6up(paperSize);
    }
}
  GorillaPresenter.render1up = async function(papersize){
    const paperclass =  " " + papersize + "-landscape";
    const innerclass = "gorilla-presenter-printslide-1-up " + paperclass;
    
    const container1up = document.getElementById("gorilla-presenter-1-up-container");
    container1up.innerHTML = "";
    let text; 
    let slidelines = GorillaPresenter.slideData.split("\n");
    let decommentedlines = [];
    for(let i=0;i < slidelines.length;i++){
       text = slidelines[i];
      if(text.indexOf(";") === 0){
        continue;
      }
      decommentedlines.push(text);
    }
    text = decommentedlines.join("\n");
    let slidetexts = text.split(/^# /gm);
    slidetexts.shift();
    for(let j=0; j < slidetexts.length;j++){
      let slidetext = "# " + slidetexts[j];
      let newSlide = document.createElement("div");
      let id = GorillaPresenter.slideIdFragment + uuid();
      newSlide.setAttribute("class", innerclass);
      newSlide.setAttribute("id", id);
      newSlide.innerHTML =   GorillaPresenter.markdown.render(slidetext) ;
      container1up.appendChild(newSlide);
      renderMathInElement(newSlide);
    }
      document.getElementById("gorilla-presenter-slideroot").style.display = "none";
      container1up.style.display="block";
      window.print();
      container1up.style.display="none";
      document.getElementById("gorilla-presenter-slideroot").style.display = "block";
    }
  
  GorillaPresenter.render6up = async function(papersize){
    const paperclass =  " " + papersize + "-portrait";
    
    const slideclass = "gorilla-presenter-printslide-6-up-slide ";
    const pageclass = "gorilla-presenter-printslide-6-up-page ";
    const wrapperclass = "gorilla-presenter-6-up-slide-wrapper"
    const container6up = document.getElementById("gorilla-presenter-6-up-container");
    container6up.innerHTML = "";
    let text; 
    let slidelines = GorillaPresenter.slideData.split("\n");
    let decommentedlines = [];
    for(let i=0;i < slidelines.length;i++){
      text = slidelines[i];
      if(text.indexOf(";") === 0){
        continue;
      }
      decommentedlines.push(text);
    }
    text = decommentedlines.join("\n");
    let slidetexts = text.split(/^# /gm);
    slidetexts.shift();
    let currentPage;
    for(let j=0; j < slidetexts.length;j++){
      if(j % 6 === 0){
        currentPage = document.createElement("div");
        currentPage.setAttribute("class", pageclass + paperclass);
        container6up.appendChild(currentPage);
     }
      let slidetext = "# " + slidetexts[j];
      let newSlideWrapper = document.createElement("div");
      newSlideWrapper.setAttribute("class",wrapperclass);
      currentPage.appendChild(newSlideWrapper);
      let newSlide = document.createElement("div");
      let id = GorillaPresenter.slideIdFragment + uuid();
      newSlide.setAttribute("class", slideclass);
      newSlide.setAttribute("id", id);
      newSlide.innerHTML =   GorillaPresenter.markdown.render(slidetext) ;
      newSlideWrapper.appendChild(newSlide);
      renderMathInElement(newSlide);
    }
      document.getElementById("gorilla-presenter-slideroot").style.display = "none";
      container6up.style.display="block";
      window.print();
      container6up.style.display="none";
      document.getElementById("gorilla-presenter-slideroot").style.display = "block"; 
    }
  