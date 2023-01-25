import {
  createMarkSpan,
  currentCursorNode,
  getElementNode,
  getBoldText,
} from "./eventHelpers";
import { setCaretOffset, setNodeOffset } from "./utils";

let cursorAtLastParaNode, cursorAtCurrentParaNode;

/**
 * this function to enable existed style to show mark span
 * @param {event} e pass event
 */
export function enableBoldInlineStyle(e) {
  const anchorNode = window.getSelection().anchorNode;
  const anchorOffSet = window.getSelection().anchorOffset;
  let anchorElement = getElementNode();
  if (
    isBoldMarkSpan(anchorElement) &&
    anchorOffSet === anchorElement.innerText.length
  ) {
    handleInputInBoldBeforeFirstChar(e);
  }

  if (isBoldMarkSpan(anchorElement) && anchorOffSet === anchorNode.length) {
    const range = document.createRange();
    range.selectNode(anchorElement.nextSibling);
    if (e.data) {
      // if not input, eg. backspace wont have issue
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
    }
  }
}

export function boldMarkStyleToText(boldNode) {
  const anchorElement = getElementNode();
  const prevSpanNode = boldNode.previousSibling;
  const nextSpanNode = boldNode.nextSibling;
  const textPrev = document.createTextNode(prevSpanNode.innerText);
  const textNext = document.createTextNode(nextSpanNode.innerText);
  const textBody = document.createTextNode(boldNode.innerText);
  const parentNode =
    anchorElement.nodeName === "P" ? anchorElement : anchorElement.parentNode;
  parentNode.replaceChild(textPrev, prevSpanNode);
  parentNode.replaceChild(textNext, nextSpanNode);
  parentNode.replaceChild(textBody, boldNode);
  return {
    textPrev,
    textBody,
    textNext,
  };
}

export function disableBoldInlineStyle(e) {
  console.log(e, getElementNode());
  // e.g: <span>0*1*2</span>
  // position: *(I)*text**, press backspace
  if (
    e.inputType === "deleteContentBackward" &&
    getElementNode().nodeName === "P" &&
    isBoldMarkSpan(window.getSelection().anchorNode.nextSibling)
  ) {
    console.log("capture in position left span position 1");
    let boldNode = window.getSelection().anchorNode.nextSibling.nextSibling;
    const ajustOffset = 0;
    const textAfterConvert = boldMarkStyleToText(boldNode);
    appendTextNode(textAfterConvert.textPrev, ajustOffset);
    setNodeOffset(textAfterConvert.textPrev, ajustOffset);
    return;
  }

  // position 1's **<b>text<b>*(I)* cursor will position in bold
  if (
    e.inputType === "deleteContentBackward" &&
    isBoldMarkSpan(getElementNode().nextSibling)
  ) {
    console.log("capture in right span position 1");
    const sel = window.getSelection();
    const anchorOffset = sel.anchorOffset;
    let boldNode = getElementNode();
    const textAfterConvert = boldMarkStyleToText(boldNode);
    const ajustOffset = anchorOffset + textAfterConvert.textPrev.length;
    appendTextNode(textAfterConvert.textPrev);
    setNodeOffset(textAfterConvert.textPrev, ajustOffset);
    return;
  }
  // position 2's cursor position in span
  console.log("----", getElementNode());
  if (
    e.inputType === "deleteContentBackward" &&
    getElementNode().classList.contains("bold")
  ) {
    debugger;
    const sel = window.getSelection();
    const anchorOffset = sel.anchorOffset;
    const anchorElement = getElementNode();
    let boldNode;
    let isPrev;
    if (anchorElement.previousSibling.nodeName === "B") {
      boldNode = anchorElement.previousSibling;
      isPrev = false;
    } else {
      boldNode = anchorElement.nextSibling;
      isPrev = true;
    }
    const textAfterConvert = boldMarkStyleToText(boldNode);
    // boldNode.outerHTML = boldNode.innerText;
    const ajustOffset = isPrev
      ? anchorOffset
      : anchorOffset +
        textAfterConvert.textPrev.length +
        textAfterConvert.textBody.length;
    appendTextNode(textAfterConvert.textPrev);
    setNodeOffset(textAfterConvert.textPrev, ajustOffset);
    return;
  }
  // position 0 cursor position is textNode before span
  if (e.inputType === "deleteContentForward") {
    // tbd
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
 */

export function isTextHadBoldMark(text) {
  const regexp = /(?<p>.*)(?<m>\*\*.+\*\*)(?<n>.*)/g;
  const arr = [...text.matchAll(regexp)];
  if (!arr[0]) {
    return false;
  }

  const textToBeBold = arr[0].groups.m.slice(3, -3);

  console.log("isTextHadBold", arr[0].groups);
  console.log("text =>", textToBeBold, textToBeBold.length);
  return arr[0].groups;
}

export function handleInputInBoldBeforeFirstChar(e) {
  //TODO: if delete the first input it will go NULL?
  // debugger;
  console.log(e);
  const anchorElement = getElementNode();
  const input = e.data;
  if (input) {
    // if not input, eg. backspace wont have issue
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
  }
  console.log("html position bug");
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
  const anchorText = currentCursorNode();
  const anchorOffset = window.getSelection().anchorOffset;
  const allText = isTextHadBoldMark(anchorText.textContent);

  // if there is bold mark in anchorNode, starting replacing and add the style
  if (allText) {
    const parentNode = anchorText.parentNode;
    let firstNode = replaceTextAndAddMarkElements(
      parentNode,
      anchorText,
      allText
    );
    setCaretOffset(firstNode, anchorOffset);
  }
  return;
}

/**
 * this function replace the text with a styled fragments
 * @param {Node} parentNode the parent paragraph, usually p tag
 * @param {Node} oldChildNode the old node going to be replaced, usually textNode within marks
 * @param {object} makredTextWithSiblings, it including, p, m, n as keys to present the wholeText
 * @returns {firstNode} it return first node in the styled fragment, ususally text before the left marks
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
    let nodesFragment = document.createDocumentFragment();
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
    console.log("nodesFragement", nodesFragment.childElementCount);
    console.log(nodesFragment);
    parentNode.replaceChild(nodesFragment, oldChildNode);
    return prevTextNode;
  } else {
    return false;
  }
}

export function getCurrentCursorNodeName() {
  const node = getElementNode();
  return node.nodeName;
}

export function showPrevAndNextSiblingSpan(node) {
  console.log("showPreAndNextSiblings");
  const currentAnchorNode = node ? node : getElementNode();
  currentAnchorNode.previousSibling.classList.remove("hide");
  currentAnchorNode.previousSibling.classList.add("show");
  currentAnchorNode.nextSibling.classList.remove("hide");
  currentAnchorNode.nextSibling.classList.add("show");
}

export function hideSiblingSpan(node) {
  const currentAnchorNode = node ? node : getElementNode();
  currentAnchorNode.childNodes.forEach((child) => {
    if (isBoldMarkSpan(child)) {
      child.classList.remove("show");
      child.classList.add("hide");
    }
  });
}

export function isParaChange() {
  return cursorAtCurrentParaNode != cursorAtLastParaNode;
}

export function setAndUpdateCursorNodeState() {
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
  let anchorNode = window.getSelection().anchorNode;
  let anchorOffset = window.getSelection().anchorOffset;

  // this show marks span if your cursor/caret just before the bold
  // e.g. (I)**ab**
  if (
    anchorNode.nextSibling &&
    anchorNode.nextSibling.className &&
    anchorNode.nextSibling.className.indexOf("bold") >= 0 &&
    anchorOffset === anchorNode.textContent.length
  ) {
    showPrevAndNextSiblingSpan(anchorNode.nextSibling.nextSibling);
    return;
  }

  // if cursor in a bold node
  // note: before first letter might not be reckon inside b node
  if (getCurrentCursorNodeName() === "B") {
    debugger;
    const boldElement = getElementNode();
    let anchorOffset = window.getSelection().anchorOffset;
    if (anchorOffset > 0 && anchorOffset < boldElement.innerText.length) {
      showPrevAndNextSiblingSpan();
    }
    // if closing mark tag is missing - only should in chrome
    // e.g. ab**cd**ef, when you delete e, right ** will remove in chrome
    if (
      !isBoldMarkSpan(boldElement.nextSibling) ||
      boldElement.nextSibling.nodeName !== "SPAN"
    ) {
      //add after span
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

    anchorNode = window.getSelection().anchorNode;
    // **dccd**(I)text - when ** is hide and
    if (
      anchorOffset === anchorNode.textContent.length &&
      getElementNode().nextSibling.classList.contains("hide") &&
      getElementNode().nextSibling.classList.contains("bold")
    ) {
      console.log("SOS", getCursorState().current, getCursorState().last);
      showPrevAndNextSiblingSpan();
      setNodeOffset(
        getElementNode().nextSibling,
        getElementNode().nextSibling.innerText.length
      );
    }

    anchorNode = window.getSelection().anchorNode;
    anchorOffset = window.getSelection().anchorOffset;
    // this show marks span if you just behind the bold
    if (
      anchorNode.previousSibling &&
      anchorNode.previousSibling.nodeName === "SPAN" &&
      anchorOffset === 0
    ) {
      showPrevAndNextSiblingSpan(anchorNode.previousSibling.previousSibling);

      // this case: insert a paragraph by enter after **text**(I)
      // and when backspace and detelte the new parapraph, it will generate a new span
      if (
        anchorNode.nodeName === "SPAN" &&
        !anchorNode.classList.contains("bold")
      ) {
        anchorNode.outerHTML = anchorNode.innerText;
      }
    }

    // this will trigger when you cursor jump from one bold paragraph to another bold element in another paragraph.
    if (isParaChange()) {
      const lastPositioNode = getCursorState().last;
      hideSiblingSpan(lastPositioNode);
    }

    return;
  }

  anchorOffset = window.getSelection().anchorOffset;
  // if it leave the bold and right after inline mark style
  if (
    (getCurrentCursorNodeName() === "P" && anchorOffset !== 0) ||
    isParaChange()
  ) {
    const lastPositioNode = getCursorState().last;
    hideSiblingSpan(lastPositioNode);
  }
}

/**
 * this function to protect everytime when marks match and trigger, it should always a full textNode been select. sometimes text might be split into two or more, this feature just append sibling node into one if it is textNode
 * @param {textNode} textNode
 * @returns {void}
 */
export function appendTextNode(textNode, offset) {
  const anchorOffset = window.getSelection().anchorOffset;
  const anchorNode = textNode ? textNode : window.getSelection().anchorNode;
  let nextTextNode = anchorNode.nextSibling;
  let manualOffset = offset == undefined ? anchorOffset : offset;
  while (nextTextNode && nextTextNode.nodeType === 3) {
    const nodeToRemove = nextTextNode;
    anchorNode.textContent += nextTextNode.textContent;
    nextTextNode = nextTextNode.nextSibling;
    nodeToRemove.remove();
  }

  const sel = window.getSelection();
  sel.setBaseAndExtent(anchorNode, manualOffset, anchorNode, manualOffset);
}

export function isBoldMarkSpan(node) {
  if (!node) {
    return false;
  }
  return node.nodeName === "SPAN" && node.classList.contains("bold");
}
