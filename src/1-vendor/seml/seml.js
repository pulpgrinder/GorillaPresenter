// seml-extensions.js.
// SEML (S-Expression Markup Language) in JavaScript.
// Copyright 2018-2019 by Anthony W. Hursh
// MIT License.


 /*  SEML parser. This is based on an idea due to
  *  Logan Braga and written by him in Ruby.
  *  See http://seml.loganbraga.fr/
  *  However, this implementation has been written
  *  from scratch in JavaScript.
  */
SEML = {
    parseSEML:function(elementType,queryString,content){
      console.log("queryString is " + queryString);
   let index = 0;
   let idstring = "";
   let classstring = "";
   let otherattrs = "";
   let result = "";
   let STATE_IDLE = 0;
   let STATE_ID = 1;
   let STATE_CLASS=2;
   let STATE_PARAM=3;
   let STATE_SINGLE=4;
   let STATE_DOUBLE=5;
   let currentState = STATE_IDLE;
   try {
   while(index < queryString.length){
     let currentChar = queryString.charAt(index);
     switch(currentState){
         case STATE_IDLE:
           switch(currentChar){
             case ".": currentState = STATE_CLASS;
                       index = index + 1;
                       continue;
             case "#": currentState = STATE_ID;
                       index = index + 1;
                       continue;
             case "!": currentState = STATE_PARAM;
                       index = index + 1;
                       continue;
             default: console.error("parseSEML: parse error on " + queryString);
                     return "parse error: " + queryString;
           }
       case STATE_ID:
         switch(currentChar){
           case "\\": idstring = idstring + queryString.charAt(index + 1);
                      index = index + 2;
                      continue;
           case "'":
           case "\"":   console.error("parseSEML: quotes not allowed in id --> " + queryString)
             return "parseSEML: quotes not allowed in id " + queryString;

           case ".": currentState = STATE_CLASS;
                   if(classstring !== ""){
                     classstring = classstring + " "
                   }
                   index = index + 1;
                   continue;
           case "!": currentState = STATE_PARAM;
                   index = index + 1;
                   if(otherattrs !== ""){
                     otherattrs = otherattrs + " "
                   }
                   continue;
           default: idstring = idstring + currentChar;
                    index = index + 1;
                    continue;
                  }
     case STATE_CLASS:
       switch(currentChar){
       case "\\":   classstring = classstring + queryString.charAt(index + 1);
                    index = index + 2;
                    continue;
       case "'":
       case "\"":   console.error("parseSEML: quotes not allowed in class name --> " + queryString)
         return "parseSEML: quotes not allowed in class name " + queryString;

       case "#": currentState = STATE_ID;
             if(idstring !== ""){
               console.error("parseSEML: string has more than one id param --> " + queryString)
               return "parseSEML: too many ids in " + queryString;
             }
             index = index + 1;
             continue;
       case "!": currentState = STATE_PARAM;
             index = index + 1;
             if(otherattrs !== ""){
               otherattrs = otherattrs + " "
             }
             continue;
       case ".": classstring = classstring + " "
           index = index + 1;
           continue;
       default: classstring = classstring + currentChar;
              index = index + 1;
              continue;
     }
     case STATE_PARAM:
       switch(currentChar){
       case "\\": otherattrs = otherattrs + queryString.charAt(index + 1);
                    index = index + 2;
                    continue;
       case "'": otherattrs = otherattrs + "'";
             index = index + 1;
             currentState = STATE_SINGLE;
             continue;
       case "\"": otherattrs = otherattrs + "\"";
             index = index + 1;
             currentState = STATE_DOUBLE;
             continue;
       case "#": currentState = STATE_ID;
             if(idstring !== ""){
               console.error("parseSEML: string has more than one id param --> " + queryString)
               return "parseSEML: too many ids in " + queryString;
             }
             index = index + 1;
             continue;
       case ".": currentState = STATE_CLASS;
             index = index + 1;
             if(classstring !== ""){
               classstring = classstring + " "
             }
             continue;

       case "!":
             index = index + 1;
             otherattrs = otherattrs + " "
             continue;
       default: otherattrs = otherattrs + currentChar;
              index = index + 1;
              continue;
     }
     case STATE_SINGLE:
       switch(currentChar){
       case "\\": otherattrs = otherattrs + queryString.charAt(index + 1);
            index = index + 2;
            continue;
       case "'": otherattrs = otherattrs + currentChar;
             index = index + 1;
             currentState = STATE_PARAM;
             continue;
       default: otherattrs = otherattrs + currentChar;
              index = index + 1;
              continue;
     }
     case STATE_DOUBLE:
       switch(currentChar){
       case "\\": otherattrs = otherattrs + queryString.charAt(index + 1);
             index = index + 2;
             continue;
       case "\"": otherattrs = otherattrs + currentChar;
             index = index + 1;
             currentState = STATE_PARAM;
             continue;
       default: otherattrs = otherattrs + currentChar;
              index = index + 1;
              continue;
     }
 }
 }
   if(currentState === STATE_DOUBLE){
     console.error("parseSEML: missing double-quote --> " + queryString)
     return "parseSEML: missing double quote in  " + queryString;
   }
   if(currentState === STATE_SINGLE){
     console.error("parseSEML: missing single-quote --> " + queryString)
     return "parseSEML: missing single quote in  " + queryString;
   }
   if(idstring !== ""){
     result = "id=\"" + idstring + "\""
   }
   if(classstring !== ""){
     if(result !== ""){
       result = result + " "
     }
     result = result + "class=\"" + classstring + "\""
   }
   if(otherattrs !== ""){
     if(result !== ""){
       result = result + " "
     }
     result = result + otherattrs;
   }
   return "<" + elementType + " " + result + ">" + content + "</" + elementType + ">";
  }
  catch(e){
    console.error("SEML error: " + e.toString() + " while attempting to parse:  " + queryString);
    return "";
  }
 }
}
