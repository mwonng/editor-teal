export const createMarkSpan = (mark) => {
  let span = document.createElement("span");
  span.innerText = mark;

  return span;
};

export const currentCursorNode = () => {
  return window.getSelection().anchorNode;
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
    return textWithMark.slice(2, -2);
  }
}

export function getItalicText(textWithMark) {
  if (!textWithMark) {
    console.log("no mark text captured");
  } else {
    return textWithMark.slice(1, -1);
  }
}
