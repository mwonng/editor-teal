export const createBoldElementWithMarkSpan = (text) => {
  const boldElement = document.createElement("b");
  boldElement.innerText = text;

  return [createMarkSpan("**"), boldElement, createMarkSpan("**")];
};

export const createMarkSpan = (mark) => {
  let span = document.createElement("span");
  span.innerText = mark;

  return span;
};

export const currentCursorNode = () => {
  return window.getSelection().anchorNode;
};

//TODO: this function looks nothing to bind can trigger it
// so this function not been used yet
export const isCursorInside = () => {
  const cursorAnchorNode = window.getSelection().anchorNode;
  return;
};

export function getElementNode() {
  // this function call will return parent node if current selection is text node
  const node = document.getSelection().anchorNode;
  return node.nodeType === 3 ? node.parentNode : node;
}

export function getBoldText(textWithMark) {
  if (!textWithMark) {
    console.log("no mark text captured");
  } else {
    return textWithMark.slice(3, -3);
  }
}
