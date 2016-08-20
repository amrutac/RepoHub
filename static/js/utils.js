/**
 * Helper function to get an element
 * @param  {String} selector
 * @return {Element}   Returns the first element within the document
 * that matches the specified group of selectors.
 */
function $(selector) {
  return document.querySelector(selector);
}

/**
 * Helper function to make an element
 * @param  {String} tag       tag name
 * @param  {String} optClass class name
 * @param  {String} optAttrs attributes
 * @param  {String} optHtml  innerHTML
 * @return {Element} created element
 */
function makeTag(tag, optClass, optAttrs, optHtml) {
  var tag = document.createElement(tag);

  if (optClass) {
    tag.className = optClass;
  }

  if (optAttrs) {
    for (var attr in optAttrs) {
      tag.setAttribute(attr, optAttrs[attr]);
    }
  }

  if (optHtml) {
    tag.innerHTML = optHtml;
  }

  return tag;
}