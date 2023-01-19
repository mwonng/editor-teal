import {
  createBoldElementWithMarkSpan,
  createMarkSpan,
  currentCursorNode,
  isCursorInside,
  getElementNode,
  getBoldText,
} from "./eventHelpers";

export const onInput = (e) => {
  console.log("onInput call ---");
  console.log(e);

  console.log("isCursorCurrentNodeName", isCursorCurrentNodeName());

  if (e.data === " ") {
    console.log("capture SPACE");
    const anchorText = currentCursorNode();
    const anchorOffset = window.getSelection().anchorOffset;
    console.log(anchorText);
    const allText = isTextHadBoldMark(anchorText.wholeText);

    // if there is bold mark in anchorNode, starting replacing and add the style
    if (allText) {
      const parentNode = anchorText.parentNode;
      replaceTextAndAddMarkElements(parentNode, allText);
      setCursorPos(parentNode, anchorOffset, allText);
    }
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

/**
 *
 * @param {string} text
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
  const regexp = /(?<p>.+)(?<m>\s\*\*.+\*\*\s)(?<n>.+)/g;
  const arr = [...text.matchAll(regexp)];

  if (!arr[0]) {
    return false;
  }

  console.log("show captured regex", arr);

  const textToBeBold = arr[0].groups.m.slice(3, -3);

  console.log("isTextHadBold", arr[0].groups);
  console.log("text =>", textToBeBold, textToBeBold.length);
  return arr[0].groups;
}

/**
 *
 * @param {object} makredTextWithSiblings, it including, p, m, n as keys to present the wholeText
 * @returns
 */
export function replaceTextAndAddMarkElements(
  parentNode,
  makredTextWithSiblings
) {
  if (makredTextWithSiblings) {
    const boldText = getBoldText(makredTextWithSiblings.m);
    console.log("parent ele", parentNode);
    console.log("replacing function", makredTextWithSiblings);

    const markSpan = createMarkSpan("**");
    markSpan.className = "bold show";
    const markSpanHTML = markSpan.outerHTML;

    const boldNode = document.createElement("B");
    boldNode.innerText = boldText;
    const boldNodeHTML = boldNode.outerHTML;
    parentNode.innerHTML =
      makredTextWithSiblings.p +
      " " +
      markSpanHTML +
      boldNodeHTML +
      markSpanHTML +
      " " +
      makredTextWithSiblings.n;
  }
  return false;
}

export function setCursorPos(parentNode, offset, matchedText) {
  console.log("set cursor", parentNode, offset, matchedText);
  const sel = window.getSelection();
  if (!matchedText) {
    return false;
  }
  console.log("length", matchedText.p.length);
  if (offset > matchedText.p.length + 1) {
    sel.setBaseAndExtent(parentNode.lastChild, 1, parentNode.lastChild, 1);
  } else {
    console.log("ELSE - set cursor");
    sel.setBaseAndExtent(
      parentNode.firstChild,
      offset,
      parentNode.firstChild,
      offset
    );
  }
}

export function isCursorCurrentNodeName(anchorNode) {
  const node = getElementNode();
  console.log("isCursorInsideInlineStyle", node.nodeName);

  return node.nodeName;
}

export function showPrevAndNextSiblingSpan() {
  const currentAnchorNode = getElementNode();
  currentAnchorNode.previousSibling.classList.remove("hide");
  currentAnchorNode.nextSibling.classList.add("show");
}

export function hideSiblingSpan() {
  const currentAnchorNode = getElementNode();
  currentAnchorNode.childNodes.forEach((child) => {
    if (child.nodeName === "SPAN") {
      child.classList.remove("show");
      child.classList.add("hide");
    }
  });
}
//TODO:  GOAL: create a feature if user type ' **text** ', it will replace with styled e.g. ** go to bold and also keep marks span around
// NOTE: have to had SPACE before and after **
