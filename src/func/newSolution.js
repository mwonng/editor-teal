export const onInput = (e) => {
  console.log("onInput call ---");
  console.log(e);

  if (e.data === " ") {
    console.log("capture SPACE");
    const anchorText = currentCursorNode();
    console.log(anchorText);
    const allText = isTextHadBoldMark(anchorText.wholeText);
    console.log(allText, getBoldText(allText.m));
  }

  if (e.inputType === "deleteContentBackward") {
    console.log("capture BACKSPACE, input are", currentCursorNode());
  }

  if (e.data === ".") {
    console.log(currentCursorNode());
    const currentTagNode = currentCursorNode().parentNode.append(
      ...createBoldElementWithMarkSpan("BOLD")
    );
  }

  if (e.data === ",") {
    const textNode = document.createTextNode(" text");
    currentCursorNode().parentNode.append(textNode);
  }
  return;
};

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

export const isCursorInside = () => {
  const cursorAnchorNode = window.getSelection().anchorNode;
  return;
};

export function getElementNode() {
  // this function call will return parent node if current selection is text node
  const node = document.getSelection().anchorNode;
  return node.nodeType === 3 ? node.parentNode : node;
}

export function isTextHadBoldMark(text) {
  // if text had bold mark return 3 parts of the text:
  // groups
  // p: previous text before bold mark
  // m: text with bold mark
  // n: next text after bold mark
  const regexp = /(?<p>.+)(?<m>\s\*\*.+\*\*\s)(?<n>.+)/g;
  const arr = [...text.matchAll(regexp)];

  if (!arr[0]) {
    return false;
  }

  const textToBeBold = arr[0].groups.m.slice(3, -3);

  console.log("isTextHadBold", arr[0].groups);
  console.log("text =>", textToBeBold, textToBeBold.length);
  return arr[0].groups;
}

export function getBoldText(textWithMark) {
  return textWithMark.slice(3, -3);
}
