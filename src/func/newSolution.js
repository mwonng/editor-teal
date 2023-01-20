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

export const onInput = (e) => {
  if (e.data === "*") {
    // const sel = window.getSelection();
    // sliceInlineMarks(sel.anchorNode, sel.anchorOffset);
    appendTextNode();
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
      replaceTextAndAddMarkElements(parentNode, anchorText, allText);
      setCursorPos(parentNode, anchorOffset, allText);
    }
  }

  if (getElementNode())
    if (e.inputType === "deleteContentBackward") {
      console.log("capture BACKSPACE, input are", currentCursorNode());
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
  const regexp = /(?<p>.+)(?<m>\s\*\*.+\*\*\s)(?<n>.*)/g;
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
    const markSpanRight = markSpanLeft.cloneNode(true);

    const boldNode = document.createElement("B");
    boldNode.innerText = boldText;
    const nodesFragment = document.createDocumentFragment();
    const prevTextNode = document.createTextNode(
      makredTextWithSiblings.p + " "
    );
    const nextTextNode = makredTextWithSiblings.n
      ? document.createTextNode(" " + makredTextWithSiblings.n)
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

export function getCurrentCursorNodeName(anchorNode) {
  const node = getElementNode();
  return node.nodeName;
}

export function showPrevAndNextSiblingSpan() {
  const currentAnchorNode = getElementNode();
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

export function updateInlineStyleState() {
  if (getCurrentCursorNodeName() === "B") {
    showPrevAndNextSiblingSpan();
  }

  if (getCurrentCursorNodeName() === "P" || isParaChange()) {
    const lastPositioNode = getCursorState().last;
    hideSiblingSpan(lastPositioNode);
  }
}

export function sliceInlineMarks(anchorNode, anchorOffset) {
  console.log("anchorOffSet", anchorOffset);
  anchorNode.splitText(anchorOffset);
  return;
}

export function appendTextNode() {
  console.log("appendTextNode");
  const anchorOffset = window.getSelection().anchorOffset;
  const anchorNode = window.getSelection().anchorNode;
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
