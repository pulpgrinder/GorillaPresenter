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

