GorillaPresenter.findAttributeInAncestors = function(element, attributeName) {
    if (!element || element === document.body) {
      return null;
    }
    const attributeValue = element.getAttribute(attributeName);
    if (attributeValue !== null) {
      return attributeValue;
    }
  return GorillaPresenter.findAttributeInAncestors(element.parentElement, attributeName);
}

GorillaPresenter.bytes_to_base_64 = function(buffer){
    let arr = new Uint8Array(buffer)
    let raw = '';
    for (let i = 0, l = arr.length; i < l; i++) {
      raw += String.fromCharCode(arr[i]);
    }
    return window.btoa(raw);
  }

GorillaPresenter.pad = (number) => (number < 10 ? '0' + number : number);

GorillaPresenter.downloadDate = function(){
  const date = new Date();
  const year = date.getFullYear();
  const month = GorillaPresenter.pad(date.getMonth() + 1);
  const day = GorillaPresenter.pad(date.getDate());
  const hours = GorillaPresenter.pad(date.getHours());
  const minutes = GorillaPresenter.pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

GorillaPresenter.patchSVGs = function(containerID){
  document.querySelectorAll('svg').forEach(svg => {
    console.log("got one, height is " + svg.getAttribute('height') + " width is " + svg.getAttribute('width'));
    let height = parseInt(svg.getAttribute('height'));
    let width = parseInt(svg.getAttribute('width'));
    height = height * 1.5 + "ex";
    width = width * 1.5 + "ex";
    svg.setAttribute('height', height);
})}




