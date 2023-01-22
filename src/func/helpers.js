import {
  onSelectionChange,
  setAndUpdateCursorNodeState,
  updateInlineStyleState,
  appendTextNode,
  boldInlineCapture,
  handleInputInBoldBeforeFirstChar,
} from "./inlineHelpers";
import { currentCursorNode, getElementNode } from "./eventHelpers";

// bindings!!
export function bindingListeners(node) {
  let allListeners = [
    { key: "input", action: onInput },
    { key: "click", action: onMouseClick },
    { key: "selectionchange", action: onSelectionChange },
    { key: "keyup", action: onKeyPressed },
  ];

  allListeners.forEach((item) => node.addEventListener(item.key, item.action));
}

function onInput(e) {
  const anchorNode = window.getSelection().anchorNode;
  const anchorOffSet = window.getSelection().anchorOffset;
  let anchorElement = getElementNode();

  console.log("---- on input", anchorOffSet, anchorElement.previousSibling);
  // input on index 0, but char will go previous element
  // this also can be in updateCursorStatu function to manually move to next text node
  if (
    anchorElement.className.indexOf("bold") >= 0 &&
    anchorOffSet === anchorElement.innerText.length
  ) {
    handleInputInBoldBeforeFirstChar(e);
  }

  if (
    getElementNode().nodeName === "SPAN" &&
    anchorOffSet === anchorNode.length
  ) {
    console.log("edge condition", anchorNode.textContent);
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
      console.log("edge!!!");
    }
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
}

function onMouseClick(e) {
  setAndUpdateCursorNodeState();
  updateInlineStyleState();
}

function onKeyPressed(e) {
  setAndUpdateCursorNodeState();
  updateInlineStyleState();
}
