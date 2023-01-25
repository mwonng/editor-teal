import {
  onSelectionChange,
  setAndUpdateCursorNodeState,
  updateInlineStyleState,
  appendTextNode,
  boldInlineCapture,
  disableBoldInlineStyle,
  enableBoldInlineStyle,
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

  if (e.data === "*" || e.data === null) {
    appendTextNode();
    boldInlineCapture();
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
