import {
  createBoldElementWithMarkSpan,
  createMarkSpan,
  currentCursorNode,
  isCursorInside,
  getElementNode,
  getBoldText,
} from "./eventHelpers";

let cursorAtLastParaNode, cursorAtCurrentParaNode;

export function getCurrentParaNode() {
  let currentNode = window.getSelection().anchorNode;
  while (currentNode.nodeName !== "P") {
    currentNode = currentNode.parentNode;
  }
  return currentNode;
}

/**
 * this is function to secure inline style should always have span before
 * and after. otherwise, this function should add the missing span
 * chrome backspace will delete hidden element but firefox no, so this is
 * mainly for chrome.
 */
export function shieldInlineElement() {
  console.log("secure inline style");
  return;
}

export const onInput = (e) => {
  const anchorNode = window.getSelection().anchorNode;
  const anchorOffSet = window.getSelection().anchorOffset;
  const anchorElement = getElementNode();

  console.log("---- on input", anchorOffSet, anchorElement.previousSibling);
  // input on index 0, but char will go previous element
  // this also can be in updateCursorStatu function to manually move to next text node
  if (
    anchorElement.className.indexOf("bold") >= 0 &&
    anchorOffSet === anchorElement.innerText.length
  ) {
    const input = e.data;
    const nextTextNode =
      anchorElement.nextSibling.nodeType === 3
        ? anchorElement.nextSibling
        : anchorElement.nextSibling.firstChild;
    let range = document.createRange();
    let inputText = document.createTextNode(input);
    range.selectNode(nextTextNode);
    range.insertNode(inputText);
    anchorElement.innerText = "**";
    const sel = window.getSelection();
    sel.setBaseAndExtent(inputText, 1, inputText, 1);
    appendTextNode(inputText);
    console.log("html position bug");
  }

  if (anchorElement.nodeName === "SPAN" && anchorOffSet === anchorNode.length) {
    console.log("edge condition", anchorNode.textContent);
    const range = document.createRange();
    range.selectNode(anchorElement.nextSibling);
    let newInput = document.createTextNode(e.data);
    anchorNode.textContent = "**";
    range.insertNode(newInput);
    const sel = window.getSelection();
    sel.setBaseAndExtent(
      anchorElement.nextSibling,
      1,
      anchorElement.nextSibling,
      1
    );
    appendTextNode();
    console.log("edge!!!");
  }
  if (e.data === "*") {
    // const sel = window.getSelection();
    // sliceInlineMarks(sel.anchorNode, sel.anchorOffset);
    appendTextNode();
    boldInlineCapture();
  }
  if (e.data === " ") {
    console.log("capture SPACE");
    const anchorText = currentCursorNode();
    const anchorOffset = window.getSelection().anchorOffset;
    console.log(anchorText);
    const allText = isTextHadBoldMark(anchorText.wholeText);

    // if there is bold mark in anchorNode, starting replacing and add the style
    if (allText) {
      const parentNode = anchorText.parentNode;
      console.log("---", window.getSelection().anchorOffset);
      debugger;
      replaceTextAndAddMarkElements(parentNode, anchorText, allText);
      setCursorPos(parentNode, anchorOffset, allText);
    }
  }

  if (e.inputType === "deleteContentBackward") {
    console.log("capture BACKSPACE, input are", currentCursorNode());
  }

  return;
};

export function boldInlineCapture() {
  console.log("boldInlineCapture()");
  const anchorText = currentCursorNode();
  const anchorOffset = window.getSelection().anchorOffset;
  console.log(anchorText);
  const allText = isTextHadBoldMark(anchorText.wholeText);

  // if there is bold mark in anchorNode, starting replacing and add the style
  if (allText) {
    const parentNode = anchorText.parentNode;
    console.log("---", window.getSelection().anchorOffset);

    replaceTextAndAddMarkElements(parentNode, anchorText, allText);
    // debugger;
    setCursorPos(parentNode, anchorOffset, allText);
  }
  return;
}

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
  const regexp = /(?<p>.+)(?<m>\*\*.+\*\*)(?<n>.*)/g;
  const arr = [...text.matchAll(regexp)];
  if (!arr[0]) {
    return false;
  }

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
  oldChildNode,
  makredTextWithSiblings
) {
  if (makredTextWithSiblings) {
    const boldText = getBoldText(makredTextWithSiblings.m);
    console.log("parent ele", parentNode);
    console.log("replacing function", makredTextWithSiblings);

    const markSpanLeft = createMarkSpan("**");
    markSpanLeft.className = "bold show";
    const markSpanRight = createMarkSpan("**");
    markSpanRight.className = "bold show";
    const boldNode = document.createElement("B");
    boldNode.innerText = boldText;
    const nodesFragment = document.createDocumentFragment();
    const prevTextNode = document.createTextNode(makredTextWithSiblings.p);
    const nextTextNode = makredTextWithSiblings.n
      ? document.createTextNode(makredTextWithSiblings.n)
      : document.createTextNode("\u00A0");

    nodesFragment.append(
      prevTextNode,
      markSpanLeft,
      boldNode,
      markSpanRight,
      nextTextNode
    );

    parentNode.replaceChild(nodesFragment, oldChildNode);
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
  if (offset > matchedText.p.length + 2) {
    sel.setBaseAndExtent(parentNode.lastChild, 0, parentNode.lastChild, 0);
  } else {
    console.log("ELSE - set cursor");
    sel.setBaseAndExtent(
      parentNode.firstChild.nextSibling.nextSibling.firstChild,
      0, // 2 is length of "**"
      parentNode.firstChild.nextSibling.nextSibling.firstChild,
      0
    );
  }
}

export function getCurrentCursorNodeName(anchorNode) {
  const node = getElementNode();
  return node.nodeName;
}

export function showPrevAndNextSiblingSpan(node) {
  console.log("showPreAndNextSiblings");
  const currentAnchorNode = node ? node : getElementNode();
  currentAnchorNode.previousSibling.classList.remove("hide");
  currentAnchorNode.nextSibling.classList.add("show");
}

export function hideSiblingSpan(node) {
  const currentAnchorNode = node ? node : getElementNode();
  currentAnchorNode.childNodes.forEach((child) => {
    if (child.nodeName === "SPAN") {
      child.classList.remove("show");
      child.classList.add("hide");
    }
  });
}

export function isParaChange() {
  return cursorAtCurrentParaNode != cursorAtLastParaNode;
}

export function setAndUpdateCursorNodeState() {
  console.log("update State call");
  const anchorNode = getElementNode();
  const currentCursorNode =
    anchorNode.nodeName !== "P" ? anchorNode.parentNode : anchorNode;
  cursorAtLastParaNode = cursorAtCurrentParaNode;
  cursorAtCurrentParaNode = currentCursorNode;
}

export function getCursorState() {
  return {
    current: cursorAtCurrentParaNode,
    last: cursorAtLastParaNode,
  };
}

/**
 * deal if input end position of mark span tag
 */
export function inputEndOfMarkSpan() {}

export function updateInlineStyleState() {
  const currentElement = getElementNode();
  const anchorNode = window.getSelection().anchorNode;
  const anchorOffSet = window.getSelection().anchorOffset;
  console.log(
    "currentElement.className",
    currentElement,
    currentElement.className
  );

  // this show marks span if you just behind the bold
  if (
    anchorNode.nextSibling &&
    anchorNode.nextSibling.className.indexOf("bold") >= 0 &&
    anchorOffSet === anchorNode.textContent.length
  ) {
    showPrevAndNextSiblingSpan(anchorNode.nextSibling.nextSibling);
    return;
  }

  if (getCurrentCursorNodeName() === "B") {
    const boldElement = getElementNode();
    if (boldElement.previousSibling.nodeName !== "SPAN") {
      // add before span
    }

    // if closing mark tag is missing
    if (boldElement.nextSibling.nodeName !== "SPAN") {
      //add after span
      console.log("MISSING NEXT SIBLING");
      const nextBoldSpan = document.createElement("SPAN");
      nextBoldSpan.innerText = "**";
      nextBoldSpan.className = "bold show";
      const range = document.createRange();
      range.selectNode(boldElement.nextSibling);
      range.insertNode(nextBoldSpan);
      const sel = window.getSelection();
      sel.setBaseAndExtent(
        nextBoldSpan.nextSibling,
        0,
        nextBoldSpan.nextSibling,
        0
      );
    }
    // shieldInlineElement();
    if (getCurrentCursorNodeName() === "B") {
      showPrevAndNextSiblingSpan();
    }

    const anchorNode = window.getSelection().anchorNode;
    const anchorOffSet = window.getSelection().anchorOffset;
    // this show marks span if you just behind the bold
    if (
      anchorNode.previousSibling &&
      anchorNode.previousSibling.nodeName === "SPAN" &&
      anchorOffSet === 0
    ) {
      showPrevAndNextSiblingSpan(anchorNode.previousSibling.previousSibling);
    }
    return;
  }

  const anchorOffset = window.getSelection().anchorOffset;
  if (
    (getCurrentCursorNodeName() === "P" && anchorOffset !== 0) ||
    isParaChange()
  ) {
    const lastPositioNode = getCursorState().last;
    hideSiblingSpan(lastPositioNode);
  }
}
export function sliceInlineMarks(anchorNode, anchorOffset) {
  console.log("anchorOffSet", anchorOffset);
  anchorNode.splitText(anchorOffset);
  return;
}

export function appendTextNode(textNode) {
  console.log("appendTextNode");
  const anchorOffset = window.getSelection().anchorOffset;
  const anchorNode = textNode ? node : window.getSelection().anchorNode;
  let nextTextNode = anchorNode.nextSibling;

  while (nextTextNode && nextTextNode.nodeType === 3) {
    const nodeToRemove = nextTextNode;
    anchorNode.textContent += nextTextNode.textContent;
    nextTextNode = nextTextNode.nextSibling;
    nodeToRemove.remove();
  }

  const sel = window.getSelection();
  sel.setBaseAndExtent(anchorNode, anchorOffset, anchorNode, anchorOffset);
}

//TODO:  GOAL: create a feature if user type ' **text** ', it will replace with styled e.g. ** go to bold and also keep marks span around
// NOTE: have to had SPACE before and after **
// if no letter's after still have issue
