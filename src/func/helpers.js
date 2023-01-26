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
    let anchorText = window.getSelection().anchorNode;
    appendTextNode();
    if (isTextHadBoldMark(anchorText.textContent)) {
      boldInlineCapture();
      return;
    }
    if (isTextHadItalicMark(anchorText.textContent)) {
      console.log("capture ITA");
      italicInlineCapture();
      return;
    }
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
