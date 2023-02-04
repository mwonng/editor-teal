import {
  getElementNode,
  setCaretOffset,
  hasParentClass,
  hasClassNextSibling,
  hasClassPreviousSibling,
} from "../func/utils";
import {
  ITALIC_CONTAINER_CLASSNAME,
  REGEX_INNER_TEXT_ITALIC,
} from "../func/const";
import {
  getCurrentCursorNodeName,
  getCurrentParaNode,
  getCursorState,
  resetItalicPrefix,
  isParaChange,
  setItalicPrefix,
} from ".";

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
        setItalicPrefix();
      }
    } else if (hasClassNextSibling(ITALIC_CONTAINER_CLASSNAME)) {
      const italicContainer = hasClassNextSibling(ITALIC_CONTAINER_CLASSNAME);
      const innerText = italicContainer.innerText;
      const arr = [...innerText.matchAll(REGEX_INNER_TEXT_ITALIC)];

      if (!arr[0]) {
        let textNode = document.createTextNode(innerText);
        italicContainer.parentNode.replaceChild(textNode, italicContainer);
        setCaretOffset(textNode, 0);
        setItalicPrefix();
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

export function updateInlineItalicStyleState() {
  let anchorNode = window.getSelection().anchorNode;
  let anchorOffset = window.getSelection().anchorOffset;
  let currParagraphNode = getCurrentParaNode();

  if (hasParentClass("inline-md-italic")) {
    const parent = hasParentClass("inline-md-italic");
    parent.classList.add("marks-expend");
    if (isParaChange()) {
      removeMarkExpendFromNode();
    }
  } else if (
    hasClassNextSibling("inline-md-italic") &&
    anchorOffset === anchorNode.textContent.length
  ) {
    debugger;
    const neighbor = hasClassNextSibling("inline-md-italic");
    neighbor.classList.add("marks-expend");
  } else if (
    hasClassPreviousSibling("inline-md-italic") &&
    anchorOffset === 0
  ) {
    const neighbor = hasClassPreviousSibling("inline-md-italic");
    neighbor.classList.add("marks-expend");
  } else if (
    currParagraphNode.querySelectorAll(".inline-md-italic").length > 0
  ) {
    currParagraphNode.querySelectorAll(".inline-md-italic").forEach((e) => {
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
    "inline-md-italic",
    lastPositioNode
  );
  if (inlineMarkdownContainer) {
    inlineMarkdownContainer.classList.remove("marks-expend");
  }
}

export function isItalicMarkSpan(node) {
  if (node && node.classList && node.classList.contains("italic-mark")) {
    return true;
  }
  return false;
}
