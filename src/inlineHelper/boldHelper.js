import {
  getElementNode,
  hasClassNextSibling,
  hasClassPreviousSibling,
  hasParentClass,
  setCaretOffset,
} from "../func/utils";
import { BOLD_CONTAINER_CLASSNAME, REGEX_INNER_TEXT_BOLD } from "../func/const";

export function monitorBoldTailInput(e) {
  const anchorNode = window.getSelection().anchorNode;
  const anchorOffset = window.getSelection().anchorOffset;
  const anchorElement = getElementNode();
  const inlineParentContainer = hasParentClass("marks-expend");
  if (
    anchorOffset === 3 &&
    inlineParentContainer &&
    anchorElement.nodeName !== "STRONG" &&
    anchorElement.nodeName !== "EM"
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

export function removeInlineBold(e, setBoldPrefix) {
  let testReg =
    /(?:.*\>(?<p>\*(?:<wbr.*)?\*?)\<.*)?(?:<strong>(?<m>.*(?:(\<wbr.*))?)<\/strong>)(?:.*\>(?<n>\*(?:<wbr.*)?\*?)<.*)?/g;

  if (
    e.inputType === "deleteContentBackward" ||
    e.inputType === "deleteContentForward"
  ) {
    if (
      hasParentClass(BOLD_CONTAINER_CLASSNAME) ||
      hasClassNextSibling(BOLD_CONTAINER_CLASSNAME)
    ) {
      let boldContainer;
      if (hasParentClass(BOLD_CONTAINER_CLASSNAME)) {
        boldContainer = hasParentClass(BOLD_CONTAINER_CLASSNAME);
      }
      if (hasClassNextSibling(BOLD_CONTAINER_CLASSNAME)) {
        boldContainer = hasClassNextSibling(BOLD_CONTAINER_CLASSNAME);
      }

      let anchorText = window.getSelection().anchorNode;
      const innerText = boldContainer.innerText;

      const wbr = document.createElement("wbr");
      wbr.id = "caret-wbr";
      anchorText.after(wbr);

      const innerHTML = boldContainer.innerHTML;

      const arr = [...innerText.matchAll(REGEX_INNER_TEXT_BOLD)];
      if (!arr[0]) {
        const removedGroups = [...innerHTML.matchAll(testReg)][0].groups;
        const strongElement = document.createElement("strong");

        boldContainer.parentNode.replaceChild(strongElement, boldContainer);

        strongElement.outerHTML =
          removedGroups.p + removedGroups.m + removedGroups.n;

        let caretWbr = document.getElementById("caret-wbr");
        if (caretWbr.nextSibling) {
          setCaretOffset(caretWbr.nextSibling, 0);
        } else if (caretWbr.parentNode && caretWbr.parentNode.nextSibling) {
          setCaretOffset(caretWbr.parentNode.nextSibling, 0);
        }
        setBoldPrefix();
        caretWbr.remove();
      }
      wbr && wbr.remove();
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

export function isBoldMarkSpan(node) {
  if (node && node.classList && node.classList.contains("bold-mark")) {
    return true;
  }
  return false;
}
