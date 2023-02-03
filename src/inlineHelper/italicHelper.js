import { getElementNode } from "../func/eventHelpers";
import {
  setCaretOffset,
  hasParentClass,
  hasClassNextSibling,
  hasClassPreviousSibling,
} from "./func/utils";
import {
  BOLD_CONTAINER_CLASSNAME,
  REGEX_INNER_TEXT_BOLD,
  ITALIC_CONTAINER_CLASSNAME,
  REGEX_INNER_TEXT_ITALIC,
} from "./func/const";

let cursorAtLastParaNode, cursorAtCurrentParaNode;
let cursorAtLastElement, cursorAtCurrentElement;
let hasBoldPrefix, hasItalicPrefix;

export function monitorBoldTailInput(e) {
  const anchorNode = window.getSelection().anchorNode;
  const anchorOffset = window.getSelection().anchorOffset;
  const anchorElement = getElementNode();
  const inlineParentContainer = hasParentClass("marks-expend");
  if (
    anchorOffset === 3 &&
    inlineParentContainer &&
    anchorElement.nodeName !== "STRONG"
  ) {
    const inputChar = e.data;
    anchorNode.textContent = anchorNode.textContent.slice(0, 2);
    let adjustElement;
    if (anchorElement.nextSibling) {
      adjustElement = anchorElement.nextSibling.firstChild;
      adjustElement.before(inputChar);
    } else {
      adjustElement = inlineParentContainer.nextSibling;
      adjustElement.before(inputChar);
    }
    setCaretOffset(adjustElement, 0);
  }
}

export function monitorItalicTailInput(e) {
  const anchorNode = window.getSelection().anchorNode;
  const anchorOffset = window.getSelection().anchorOffset;
  const anchorElement = getElementNode();
  const inlineParentContainer = hasParentClass("marks-expend");
  if (
    anchorOffset === 2 &&
    inlineParentContainer &&
    anchorElement.nodeName !== "EM"
  ) {
    const inputChar = e.data;
    anchorNode.textContent = anchorNode.textContent.slice(0, 1);
    let adjustElement;
    if (anchorElement.nextSibling) {
      adjustElement = anchorElement.nextSibling.firstChild;
      adjustElement.before(inputChar);
    } else {
      adjustElement = inlineParentContainer.nextSibling;
      adjustElement.before(inputChar);
    }
    setCaretOffset(adjustElement, 0);
  }
}

export function removeInlineBold(e) {
  if (
    e.inputType === "deleteContentBackward" ||
    e.inputType === "deleteContentForward"
  ) {
    if (hasParentClass(BOLD_CONTAINER_CLASSNAME)) {
      let anchorText = window.getSelection().anchorNode;
      const wbr = document.createElement("wbr");
      wbr.id = "caret-wbr";
      anchorText.after(wbr);
      const boldContainer = hasParentClass(BOLD_CONTAINER_CLASSNAME);
      const innerText = boldContainer.innerText;
      const innerHTML = boldContainer.innerHTML;
      const afterFilter = innerHTML.replace(/<((?!wbr)[^>]+)>/g, "");
      const afterFilterIndex = afterFilter.indexOf("<wbr");
      console.log("afterFilter", afterFilter, afterFilterIndex);
      const arr = [...innerText.matchAll(REGEX_INNER_TEXT_BOLD)];
      if (!arr[0]) {
        console.log("not matched");
        let textNode = document.createTextNode(innerText);
        boldContainer.parentNode.replaceChild(textNode, boldContainer);
        setCaretOffset(textNode, afterFilterIndex);
      }
    } else if (hasClassNextSibling(BOLD_CONTAINER_CLASSNAME)) {
      const boldContainer = hasClassNextSibling(BOLD_CONTAINER_CLASSNAME);
      const innerText = boldContainer.innerText;
      const arr = [...innerText.matchAll(REGEX_INNER_TEXT_BOLD)];
      if (!arr[0]) {
        let textNode = document.createTextNode(innerText);
        boldContainer.parentNode.replaceChild(textNode, boldContainer);
        setCaretOffset(textNode, 0);
      }
    }
  }
}

export function removeInlineItalic(e) {
  if (
    e.inputType === "deleteContentBackward" ||
    e.inputType === "deleteContentForward"
  ) {
    if (hasParentClass(ITALIC_CONTAINER_CLASSNAME)) {
      let anchorText = window.getSelection().anchorNode;
      const wbr = document.createElement("wbr");
      wbr.id = "caret-wbr";
      anchorText.after(wbr);

      const italicContainer = hasParentClass(ITALIC_CONTAINER_CLASSNAME);
      const innerText = italicContainer.innerText;
      const innerHTML = italicContainer.innerHTML;
      const afterFilter = innerHTML.replace(/<((?!wbr)[^>]+)>/g, "");
      const afterFilterIndex = afterFilter.indexOf("<wbr");
      const arr = [...innerText.matchAll(REGEX_INNER_TEXT_ITALIC)];

      if (!arr[0]) {
        console.log("not matched");
        let textNode = document.createTextNode(innerText);
        italicContainer.parentNode.replaceChild(textNode, italicContainer);
        setCaretOffset(textNode, afterFilterIndex);
      }
    } else if (hasClassNextSibling(ITALIC_CONTAINER_CLASSNAME)) {
      const italicContainer = hasClassNextSibling(ITALIC_CONTAINER_CLASSNAME);
      const innerText = italicContainer.innerText;
      const arr = [...innerText.matchAll(REGEX_INNER_TEXT_ITALIC)];

      if (!arr[0]) {
        let textNode = document.createTextNode(innerText);
        italicContainer.parentNode.replaceChild(textNode, italicContainer);
        setCaretOffset(textNode, 0);
      }
    }
  }
}

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
 * k: the string with marks
 */
export function isTextHaddItalicMark(text) {
  const regexp =
    /(?<p>[\*\_]{1})(?<m>(?=[^\s\*\_<])(?!<\/span>).*?[^\s\*\_>])(?<n>[\*\_]{1})/g;

  const arr = [...text.matchAll(regexp)];
  console.log("test result", arr);
  if (!arr[0]) {
    return false;
  }
  console.log(arr[0][1]);
  return { ...arr[0].groups, k: arr[0][0] };
}

export function isTextHadBoldMark(text) {
  // const regexp = /(?<p>.*)(?<m>\*\*.+\*\*)(?<n>.*)/g;
  const regexp =
    /(?<p>\*(?:\<wbr.*)?\*)(?<m>(?=[^\s\*])(?!<\/span>).*?[^\s\*])(?<n>\*(?:\<wbr.*)?\*)/g;

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

export function initializeInlineItalic() {
  const allText = isTextHaddItalicMark(getCurrentParaNode().innerHTML);
  if (allText) {
    const parentNode = getElementNode();
    const getMatchedGroups = isTextHaddItalicMark(
      getCurrentParaNode().innerHTML
    );
    replaceTextAndAddItalicElements(parentNode, getMatchedGroups);
    const caretWbr = document.querySelector("#caret-wbr");
    setCaretOffset(caretWbr.nextSibling, 0);
    resetItalicPrefix();
    return true;
  }
  return false;
}

export function initializeInlineBold() {
  const allText = isTextHadBoldMark(getCurrentParaNode().innerHTML);
  if (allText) {
    const parentNode = getElementNode();
    const getMatchedGroups = isTextHadBoldMark(getCurrentParaNode().innerHTML);
    replaceTextAndAddMarkElements(parentNode, getMatchedGroups);
    const caretWbr = document.querySelector("#caret-wbr");
    setCaretOffset(caretWbr.nextSibling, 0);
    resetBoldPrefix();
    return true;
  }
  return false;
}

export function replaceTextAndAddItalicElements(
  anchorParentNode,
  matchedGroups
) {
  const prefixHTML = `<span class="inline-md-italic marks-expend"><span class="italic-mark">${matchedGroups.p}</span><em>`;
  const suffixHTML = `</em><span class="italic-mark">${matchedGroups.n}</span></span>`;
  const newText = prefixHTML + matchedGroups.m + suffixHTML;
  anchorParentNode.innerHTML = anchorParentNode.innerHTML.replace(
    matchedGroups.k,
    newText
  );
}

/**
 * this function replace the text with a styled fragments
 * @param {Node} parentNode the parent paragraph, usually p tag
 * @param {Node} matchedGroups the result come from regex matched groups
 * @returns {void} void
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

export function isBoldMarkSpan(node) {
  if (node && node.classList && node.classList.contains("bold-mark")) {
    return true;
  }
  return false;
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
