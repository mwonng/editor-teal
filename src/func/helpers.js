import { getElementNode } from "./eventHelpers";
import {
  getInlinePrefix,
  initializeInlineBold,
  initializeInlineItalic,
  monitorBoldTailInput,
  monitorItalicTailInput,
  monitorPrefix,
  onSelectionChange,
  removeInlineBold,
  removeInlineItalic,
  resetBoldPrefix,
  resetItalicPrefix,
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
  console.log(e);
  if (e.inputType === "insertParagraph") {
    return;
  }

  if (e.data === "*" || e.data == null) {
    monitorPrefix(e);
    let anchorText = window.getSelection().anchorNode;
    let anchorOffset = window.getSelection().anchorOffset;

    anchorText.splitText(anchorOffset);
    const wbr = document.createElement("wbr");
    wbr.id = "caret-wbr";
    anchorText.after(wbr);

    if (getElementNode().nodeName !== "B" && getInlinePrefix().bold) {
      initializeInlineBold();
    }

    if (getElementNode().nodeName !== "I" && getInlinePrefix().italic) {
      initializeInlineItalic();
    }

    const caretWbr = document.querySelector("#caret-wbr");
    caretWbr.remove();
  }

  if (e.data === "_" || e.data === null || e.data === " ") {
    let anchorText = window.getSelection().anchorNode;
    let anchorOffset = window.getSelection().anchorOffset;

    anchorText.splitText(anchorOffset);
    const wbr = document.createElement("wbr");
    wbr.id = "caret-wbr";
    anchorText.after(wbr);

    if (getElementNode().nodeName !== "I") {
      initializeInlineItalic();
    }
    const caretWbr = document.querySelector("#caret-wbr");
    caretWbr.remove();
    resetItalicPrefix();
  }

  removeInlineBold(e);
  removeInlineItalic(e);
  monitorBoldTailInput(e);
  monitorItalicTailInput(e);

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
