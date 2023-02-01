import { getElementNode } from "./eventHelpers";
import {
  boldInlineCapture,
  monitorTailInput,
  onSelectionChange,
  setAndUpdateCursorNodeState,
  updateInlineStyleState,
  monitorBoldStyle,
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
  if (e.inputType === "insertParagraph") {
    return;
  }

  if (e.data === "*" || e.data === null) {
    let anchorText = window.getSelection().anchorNode;
    let anchorOffset = window.getSelection().anchorOffset;
    anchorText.splitText(anchorOffset);
    const wbr = document.createElement("wbr");
    wbr.id = "caret-wbr";
    anchorText.after(wbr);
    if (getElementNode().nodeName !== "B") {
      boldInlineCapture();
      // return;
    }
    const caretWbr = document.querySelector("#caret-wbr");
    caretWbr.remove();
  }
  monitorBoldStyle(e);
  monitorTailInput(e);

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
