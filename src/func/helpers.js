import { getElementNode } from "./eventHelpers";
import {
  appendTextNode,
  boldInlineCapture,
  disableBoldInlineStyle,
  disableItalicInlineStyle,
  enableBoldInlineStyle,
  enableItalicInlineStyle,
  isTextHadBoldMark,
  isTextHadItalicMark,
  italicInlineCapture,
  onSelectionChange,
  setAndUpdateCursorNodeState,
  updateInlineStyleState,
} from "./inlineHelpers";
import { nodeSize } from "./utils";
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
  enableBoldInlineStyle(e);
  disableBoldInlineStyle(e);
  enableItalicInlineStyle(e);
  disableItalicInlineStyle(e);
  if (e.inputType === "deleteContentBackward") {
    console.log("backspace!!!", e.cancelable);
    e.preventDefault();
  }

  if (e.data === "*" || e.data === null) {
    appendTextNode();
    let anchorText = window.getSelection().anchorNode;
    let anchorOffset = window.getSelection().anchorOffset;
    anchorText.splitText(anchorOffset);
    let charLength = 0;
    getElementNode().childNodes.forEach((e) => (charLength += nodeSize(e)));
    console.log("-->>>", getElementNode().nodeName);
    console.log("how many child nodes? =>", getElementNode().childNodes.length);
    console.log("charLength? =>", charLength);
    if (getElementNode().nodeName !== "B") {
      boldInlineCapture();
      // return;
    }
    // if (getElementNode().nodeName !== "I") {
    //   console.log("capture ITA");
    //   italicInlineCapture();
    //   // return;
    // }
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
