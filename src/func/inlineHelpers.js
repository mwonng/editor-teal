import {
  createMarkSpan,
  currentCursorNode,
  getElementNode,
  getBoldText,
  getItalicText,
} from "./eventHelpers";
import {
  setCaretOffset,
  setNodeOffset,
  getNodeIndexOfChild,
  hasParentClass,
  hasClassNextSibling,
  hasClassPreviousSibling,
} from "./utils";

let cursorAtLastParaNode, cursorAtCurrentParaNode;
let cursorAtLastElement, cursorAtCurrentElement;

/**
 * test if text has matched bold marks in the text
 * @param {string} text full text from the node to be text regex, usually textContent from textNode
 * @returns {boolean | object}
 * it will return false if not captured a marked text
 * otherwise, it will return a capture array
 * example: {p: "textBefore", m: "markedText", n: "textAfter"}
 * if text had bold mark return 3 parts of the text:
 * groups
 * p: previous text before bold mark
 * m: text with bold mark
 * n: next text after bold mark
 */

export function isTextHadBoldMark(text) {
  // const regexp = /(?<p>.*)(?<m>\*\*.+\*\*)(?<n>.*)/g;
  const regexp =
    /(?<p>\*(?:\<wbr.*>)?\*)(?<m>(?=[^\s\*]).*?[^\s\*>])(?<n>\*(?:\<wbr.*>)?\*)/g;

  const arr = [...text.matchAll(regexp)];
  console.log("test result", arr);
  if (!arr[0]) {
    return false;
  }
  console.log(arr[0][1]);
  return { ...arr[0].groups, k: arr[0][0] };
}

export function getCurrentParaNode() {
  let currentNode = window.getSelection().anchorNode;
  while (currentNode.nodeName !== "P") {
    currentNode = currentNode.parentNode;
  }
  return currentNode;
}

/**
 * capture if current textNode has bold syntax
 * @returns {void}
 */
export function boldInlineCapture() {
  const allText = isTextHadBoldMark(getCurrentParaNode().innerHTML);
  if (allText) {
    const parentNode = getElementNode();
    const getMatchedGroups = isTextHadBoldMark(getCurrentParaNode().innerHTML);
    replaceTextAndAddMarkElements(parentNode, getMatchedGroups);
    const caretWbr = document.querySelector("#caret-wbr");
    setCaretOffset(caretWbr.nextSibling, 0);
    return true;
  }
  return false;
}

/**
 * this function replace the text with a styled fragments
 * @param {Node} parentNode the parent paragraph, usually p tag
 * @param {Node} oldChildNode the old node going to be replaced, usually textNode within marks
 * @param {object} makredTextWithSiblings, it including, p, m, n as keys to present the wholeText
 * @returns {firstNode} it return first node in the styled fragment, ususally text before the left marks
 */
export function replaceTextAndAddMarkElements(anchorParentNode, matchedGroups) {
  const prefixHTML = `<span class="inline-md-bold marks-expend"><span class="bold-mark">${matchedGroups.p}</span><strong>`;
  const suffixHTML = `</strong><span class="bold-mark">${matchedGroups.n}</span></span>`;
  const newText = prefixHTML + matchedGroups.m + suffixHTML;
  anchorParentNode.innerHTML = anchorParentNode.innerHTML.replace(
    matchedGroups.k,
    newText
  );
}

export function getCurrentCursorNodeName() {
  const node = getElementNode();
  return node.nodeName;
}

export function isParaChange() {
  return cursorAtCurrentParaNode != cursorAtLastParaNode;
}

export function setAndUpdateCursorNodeState() {
  console.log("cursor will update");
  const anchorElement = getElementNode();
  const anchorNode = window.getSelection().anchorNode;
  const anchorOffset = window.getSelection().anchorOffset;
  const currentCursorNode =
    anchorElement.nodeName !== "P" ? anchorElement.parentNode : anchorElement;
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
  };
}

/**
 * deal if input end position of mark span tag
 */
export function inputEndOfMarkSpan() {}

export function updateInlineStyleState() {
  let anchorNode = window.getSelection().anchorNode;
  let anchorOffset = window.getSelection().anchorOffset;
  let currParagraphNode = getCurrentParaNode();
  debugger;
  if (hasParentClass("inline-md-bold")) {
    const parent = hasParentClass("inline-md-bold");
    parent.classList.add("marks-expend");
    if (isParaChange()) {
      removeMarkExpendFromNode();
    }
  } else if (
    hasClassNextSibling("inline-md-bold") &&
    anchorOffset === anchorNode.textContent.length
  ) {
    const neighbor = hasClassNextSibling("inline-md-bold");
    neighbor.classList.add("marks-expend");
  } else if (hasClassPreviousSibling("inline-md-bold") && anchorOffset === 0) {
    const neighbor = hasClassPreviousSibling("inline-md-bold");
    neighbor.classList.add("marks-expend");
  } else if (currParagraphNode.querySelectorAll(".inline-md-bold").length > 0) {
    // debugger;
    currParagraphNode.querySelectorAll(".inline-md-bold").forEach((e) => {
      e.classList.remove("marks-expend");
    });
  } else {
    if (
      (getCurrentCursorNodeName() === "P" && anchorOffset !== 0) ||
      isParaChange()
    ) {
      removeMarkExpendFromNode();
    }
  }
  // hide marks if it leave the bold and right after inline mark style
}

export function removeMarkExpendFromNode() {
  const lastPositioNode = getCursorState().last;
  const inlineMarkdownContainer = hasParentClass(
    "inline-md-bold",
    lastPositioNode
  );
  if (inlineMarkdownContainer) {
    inlineMarkdownContainer.classList.remove("marks-expend");
  }
}
