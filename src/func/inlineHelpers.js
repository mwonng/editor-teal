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
} from "./utils";

let cursorAtLastParaNode, cursorAtCurrentParaNode;
let cursorAtLastElement, cursorAtCurrentElement;
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
    return;
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

export function enableItalicInlineStyle(e) {
  const anchorNode = window.getSelection().anchorNode;
  const anchorOffSet = window.getSelection().anchorOffset;
  let anchorElement = getElementNode();
  if (
    isItalicMarkSpan(anchorElement) &&
    anchorOffSet === anchorElement.innerText.length
  ) {
    handleInputInItalicBeforeFirstChar(e);
    return;
  }

  if (isItalicMarkSpan(anchorElement) && anchorOffSet === anchorNode.length) {
    const range = document.createRange();
    range.selectNode(anchorElement.nextSibling);
    if (e.data) {
      // if not input, eg. backspace wont have issue
      let newInput = document.createTextNode(e.data);
      anchorNode.textContent = "*";
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

export function inlineMarkStyleToText(boldNode) {
  const anchorElement = getElementNode();
  const prevSpanNode = boldNode.previousSibling;
  const nextSpanNode = boldNode.nextSibling;
  const textPrev =
    prevSpanNode.innerText && document.createTextNode(prevSpanNode.innerText);
  const textNext =
    nextSpanNode.innerText && document.createTextNode(nextSpanNode.innerText);
  const textBody =
    boldNode.innerText && document.createTextNode(boldNode.innerText);
  const parentNode =
    anchorElement.nodeName === "P" ? anchorElement : anchorElement.parentNode;
  textPrev && parentNode.replaceChild(textPrev, prevSpanNode);
  textNext && parentNode.replaceChild(textNext, nextSpanNode);
  textBody && parentNode.replaceChild(textBody, boldNode);
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
    const textAfterConvert = inlineMarkStyleToText(boldNode);
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
    const textAfterConvert = inlineMarkStyleToText(boldNode);
    const ajustOffset = anchorOffset + textAfterConvert.textPrev.length;
    appendTextNode(textAfterConvert.textPrev);
    setNodeOffset(textAfterConvert.textPrev, ajustOffset);
    return;
  }
  // position 2's cursor position in span
  console.log("----", getElementNode());
  if (
    e.inputType === "deleteContentBackward" &&
    isBoldMarkSpan(getElementNode())
  ) {
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
    const textAfterConvert = inlineMarkStyleToText(boldNode);
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

export function disableItalicInlineStyle(e) {
  // position 1's *<b>text<b>*(I) cursor will position in bold
  if (
    e.inputType === "deleteContentBackward" &&
    getElementNode().nodeName === "I" &&
    getCursorState().lastElement.textContent === "*"
  ) {
    console.log("capture in right span position 1");
    const sel = window.getSelection();
    const anchorOffset = sel.anchorOffset;
    let boldNode = getElementNode();
    const textAfterConvert = inlineMarkStyleToText(boldNode);
    const ajustOffset = anchorOffset + textAfterConvert.textPrev.length;
    appendTextNode(textAfterConvert.textPrev);
    setNodeOffset(textAfterConvert.textPrev, ajustOffset);
    return;
  }

  // e.g: <span>0*1</span>
  // position: *(I)text*, press backspace
  if (
    e.inputType === "deleteContentBackward" &&
    window.getSelection().anchorNode.nextSibling &&
    window.getSelection().anchorNode.nextSibling.nodeName === "I" &&
    getElementNode().nodeName === "P"
  ) {
    debugger;
    console.log("capture in position left span position 1");
    let boldNode = window.getSelection().anchorNode.nextSibling.nextSibling;
    const ajustOffset = 0;
    const textAfterConvert = inlineMarkStyleToText(boldNode);
    appendTextNode(textAfterConvert.textPrev, ajustOffset);
    setNodeOffset(textAfterConvert.textPrev, ajustOffset);
    return;
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
  // const regexp = /(?<p>.*)(?<m>\*\*.+\*\*)(?<n>.*)/g;
  const regexp = /\*{2}((?=[^\s\*<]).*?[^\s\*>])\*{2}/g;

  const arr = [...text.matchAll(regexp)];
  console.log("test result", arr);
  if (!arr[0]) {
    return false;
  }
  console.log(arr[0][1]);
  return arr[0][1];

  // console.log("isTextHadBold", arr[0].groups);
  // console.log("text =>", textToBeBold, textToBeBold.length);
  // return arr[0].groups;
}
export function isTextHadItalicMark(text) {
  const regexp = /(?<p>.*)(?<m>\*.+\*)(?<n>.*)/g;
  const arr = [...text.matchAll(regexp)];
  if (!arr[0]) {
    return false;
  }

  const textToItalic = arr[0].groups.m.slice(3, -3);

  console.log("isTextHadItalic", arr[0].groups);
  console.log("text =>", textToItalic, textToItalic.length);
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

export function handleInputInItalicBeforeFirstChar(e) {
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
    anchorElement.innerText = "*";
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
  const anchorTextNode = currentCursorNode();
  const anchorOffset = window.getSelection().anchorOffset;
  const allText = isTextHadBoldMark(getCurrentParaNode().innerHTML);

  // if there is bold mark in anchorNode, starting replacing and add the style
  if (allText) {
    const parentNode = getElementNode();
    const childIndex = getNodeIndexOfChild(parentNode, anchorTextNode);

    let offset = 0;
    for (let i = 0; i < childIndex; i++) {
      const childrenNodes = parentNode.childNodes;
      if (childrenNodes.item(i).nodeType === 3) {
        offset += childrenNodes.item(i).textContent.length;
      } else {
        offset += childrenNodes.item(i).innerText.length;
      }
    }
    offset += anchorOffset;
    debugger;
    console.log("actual position is =>", offset);
    replaceTextAndAddMarkElements(parentNode, allText, anchorTextNode);
    debugger;
    setCaretOffset(parentNode.firstChild, offset);
    return true;
  }
  return false;
}

export function italicInlineCapture() {
  const anchorText = currentCursorNode();
  const anchorOffset = window.getSelection().anchorOffset;
  const allText = isTextHadItalicMark(anchorText.textContent);

  // if there is bold mark in anchorNode, starting replacing and add the style
  if (allText) {
    const parentNode = anchorText.parentNode;
    let firstNode = replaceTextAndAddItalicElements(
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
export function replaceTextAndAddMarkElements(anchorParentNode, text) {
  const prefixHTML =
    '<span class="inline-md-bold marks-expend"><span class="bold-mark">**</span><strong>';
  const suffixHTML = '</strong><span class="bold-mark">**</span></span>';
  const newText = prefixHTML + text + suffixHTML;
  anchorParentNode.innerHTML = anchorParentNode.innerHTML.replace(
    `**${text}**`,
    newText
  );
  console.log("curr para", anchorParentNode);
}

export function replaceTextAndAddItalicElements(
  parentNode,
  oldChildNode,
  makredTextWithSiblings
) {
  if (makredTextWithSiblings) {
    const boldText = getItalicText(makredTextWithSiblings.m);
    const markSpanLeft = createMarkSpan("*");
    markSpanLeft.className = "italic show";
    const markSpanRight = createMarkSpan("*");
    markSpanRight.className = "italic show";
    const boldNode = document.createElement("I");
    boldNode.innerText = boldText;
    let nodesFragment = document.createDocumentFragment();
    const prevTextNode = document.createTextNode(makredTextWithSiblings.p);
    const nextTextNode = makredTextWithSiblings.n
      ? document.createTextNode(makredTextWithSiblings.n)
      : parentNode.nodeName === "P"
      ? document.createTextNode("\u00A0")
      : "";

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
    if (isItalicMarkSpan(child)) {
      child.classList.remove("show");
      child.classList.add("hide");
    }
  });
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
  //
  console.log("hasParentClass", hasParentClass("inline-md-bold"));

  if (hasParentClass("inline-md-bold")) {
    const parent = hasParentClass("inline-md-bold");
    parent.classList.add("marks-expend");
  } else if (currParagraphNode.querySelectorAll(".inline-md-bold").length > 0) {
    currParagraphNode.querySelectorAll(".inline-md-bold").forEach((e) => {
      e.classList.remove("marks-expend");
    });
  }
  // this show marks span if your cursor/caret just before the bold
  // e.g. (I)**ab**
  if (
    isInlineMarkSpan(anchorNode.nextSibling) &&
    anchorOffset === anchorNode.textContent.length
  ) {
    console.log("(I)**ab**");
    showPrevAndNextSiblingSpan(anchorNode.nextSibling.nextSibling);
    return;
  }

  // if cursor in a bold node, its only in bold, italic will have some exception
  // note: before first letter might not be reckon inside b node
  if (getCurrentCursorNodeName() === "B") {
    const boldElement = getElementNode();
    let anchorOffset = window.getSelection().anchorOffset;
    if (anchorOffset > 0 && anchorOffset < boldElement.innerText.length) {
      showPrevAndNextSiblingSpan();
    }
    // if closing mark tag is missing - only should in chrome
    // e.g. ab**cd**ef, when you delete e, right ** will remove in chrome
    if (
      !isInlineMarkSpan(boldElement.nextSibling) ||
      (boldElement.nextSibling && boldElement.nextSibling.nodeName !== "SPAN")
    ) {
      debugger;
      //add after span
      console.log("trigger missing tail marks");
      console.log("last", getCursorState().last);
      console.log("curret", getCursorState().current);
      const nextBoldSpan = initMarkSpan(boldElement.nodeName);
      boldElement.after(nextBoldSpan);
      if (!nextBoldSpan.nextSibling) {
        nextBoldSpan.after(document.createTextNode("\u00A0"));
      }
      setNodeOffset(nextBoldSpan.nextSibling, 0);
      setAndUpdateCursorNodeState();
    }

    anchorNode = window.getSelection().anchorNode;
    anchorOffset = window.getSelection().anchorOffset;
    // **dccd**(I)text - when ** is hide and
    if (
      anchorOffset === anchorNode.textContent.length &&
      getElementNode().nextSibling.classList.contains("hide") &&
      isInlineMarkSpan(getElementNode().nextSibling)
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

  if (getCurrentCursorNodeName() === "I") {
    console.log("enter italic trigger", getCursorState());
    const boldElement = getElementNode();
    let anchorOffset = window.getSelection().anchorOffset;
    if (anchorOffset > 0 && anchorOffset < boldElement.innerText.length) {
      showPrevAndNextSiblingSpan();
    }
    // if closing mark tag is missing - only should in chrome
    // e.g. ab**cd**ef, when you delete e, right ** will remove in chrome
    if (
      !isInlineMarkSpan(boldElement.nextSibling) ||
      (boldElement.nextSibling && boldElement.nextSibling.nodeName !== "SPAN")
    ) {
      if (getCursorState().lastElement.textContent !== "*") {
        //add after span
        console.log("trigger missing tail marks");
        console.log("last", getCursorState().last);
        console.log("curret", getCursorState().current);
        const nextBoldSpan = initMarkSpan(boldElement.nodeName);
        boldElement.after(nextBoldSpan);
        if (!nextBoldSpan.nextSibling) {
          nextBoldSpan.after(document.createTextNode("\u00A0"));
        }
        setNodeOffset(nextBoldSpan.nextSibling, 0);
        setAndUpdateCursorNodeState();
      }
    }

    anchorNode = window.getSelection().anchorNode;
    anchorOffset = window.getSelection().anchorOffset;
    // **dccd**(I)text - when ** is hide and
    if (
      anchorOffset === anchorNode.textContent.length &&
      getElementNode().nextSibling &&
      getElementNode().nextSibling.classList &&
      getElementNode().nextSibling.classList.contains("hide") &&
      isInlineMarkSpan(getElementNode().nextSibling)
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
  // hide marks if it leave the bold and right after inline mark style
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

export function isItalicMarkSpan(node) {
  if (!node) {
    return false;
  }
  return node.nodeName === "SPAN" && node.classList.contains("italic");
}

export function isInlineMarkSpan(node) {
  if (!node) {
    return false;
  }

  if (node.nodeName === "SPAN") {
    return node.classList.contains("italic") || node.classList.contains("bold");
  }
}

export function isInlineStyleIntegral(inlineStyleNode) {
  return (
    isInlineMarkSpan(inlineStyleNode.previousSibling) &&
    isInlineMarkSpan(inlineStyleNode.previousSibling)
  );
}

export function initMarkSpan(tag) {
  const markSpan = document.createElement("SPAN");
  if (tag === "I") {
    markSpan.innerText = "*";
    markSpan.className = "italic show";
  }
  if (tag === "B") {
    markSpan.innerText = "**";
    markSpan.className = "bold show";
  }
  return markSpan;
}
