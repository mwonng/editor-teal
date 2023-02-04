import { getElementNode } from "../func/utils";

let cursorAtLastParaNode, cursorAtCurrentParaNode;
let cursorAtLastElement, cursorAtCurrentElement;
let hasBoldPrefix, hasItalicPrefix;
let lastPara, currPara;

export function getCurrentParaNode() {
  let currentNode = window.getSelection().anchorNode;
  while (currentNode.nodeName !== "P") {
    currentNode = currentNode.parentNode;
  }
  return currentNode;
}

export function setAndUpdateCursorNodeState() {
  console.log("cursor will update");
  const anchorElement = getElementNode();
  const anchorNode = window.getSelection().anchorNode;
  const anchorOffset = window.getSelection().anchorOffset;
  const currentCursorNode =
    anchorElement.nodeName !== "P" ? anchorElement.parentNode : anchorElement;
  const currentParaNode = getCurrentParaNode();
  lastPara = currPara;
  currPara = currentParaNode;

  cursorAtLastParaNode = cursorAtCurrentParaNode;
  cursorAtCurrentParaNode = currentCursorNode;
  cursorAtLastElement = cursorAtCurrentElement;
  cursorAtCurrentElement = anchorNode;
}

export function getCursorState() {
  return {
    current: cursorAtCurrentParaNode,
    last: cursorAtLastParaNode,
    cursorElement: cursorAtCurrentElement,
    lastElement: cursorAtLastElement,
    lastPara: lastPara,
    currPara: currPara,
  };
}

export function monitorPrefix(e) {
  let sel = window.getSelection();
  let currText = sel.anchorNode.textContent;
  let newText = currText.slice(0, sel.anchorOffset);
  console.log("before input", newText);

  const hasBold = /\*{2}$/.test(newText);
  if (!hasBoldPrefix && hasBold) {
    hasBoldPrefix = true;
    hasItalicPrefix = false;
    console.log("set hasBoldPrefix");
    return;
  }
  if (!hasBoldPrefix && !hasItalicPrefix) {
    hasItalicPrefix = true;
  }
}

export function getInlinePrefix() {
  return {
    bold: hasBoldPrefix,
    italic: hasItalicPrefix,
  };
}
export function setBoldPrefix() {
  hasBoldPrefix = true;
  hasItalicPrefix = false;
}

export function setItalicPrefix() {
  hasBoldPrefix = false;
  hasItalicPrefix = true;
}

export function resetBoldPrefix() {
  hasBoldPrefix = false;
  console.log("reset hasBoldPrefix");
}

export function resetItalicPrefix() {
  hasItalicPrefix = false;
  console.log("reset hasItalicPrefix");
}

export function getCurrentCursorNodeName() {
  const node = getElementNode();
  return node.nodeName;
}

export function isParaChange() {
  return cursorAtCurrentParaNode != cursorAtLastParaNode;
}

export function removeLastParagraphInlineStyle() {
  const currParagraphNode = getCursorState().lastPara;
  console.log("currParagraphNode", currParagraphNode);
  currParagraphNode.querySelectorAll(".marks-expend").forEach((e) => {
    e.classList.remove("marks-expend");
  });
}
