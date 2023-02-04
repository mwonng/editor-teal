import {
  getInlinePrefix,
  monitorPrefix,
  onSelectionChange,
  setAndUpdateCursorNodeState,
} from "../inlineHelper";
import { getElementNode, appendTextNode, getEditorElement } from "./utils";
import {
  initializeInlineBold,
  monitorBoldTailInput,
  removeInlineBold,
  updateInlineStyleState,
} from "../inlineHelper/boldHelper";

import {
  initializeInlineItalic,
  monitorItalicTailInput,
  removeInlineItalic,
  updateInlineItalicStyleState,
} from "../inlineHelper/italicHelper";

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

export function outputMarkdown() {
  const editorElement = getEditorElement();
  const previewElement = document.getElementById("markdown-review");
  previewElement.innerText = editorElement.innerText;
}

function onInput(e) {
  console.log(e);
  if (e.inputType === "insertParagraph") {
    return;
  }

  appendTextNode();
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

  // if (e.data === "_" || e.data === null || e.data === " ") {
  //   let anchorText = window.getSelection().anchorNode;
  //   let anchorOffset = window.getSelection().anchorOffset;

  //   anchorText.splitText(anchorOffset);
  //   const wbr = document.createElement("wbr");
  //   wbr.id = "caret-wbr";
  //   anchorText.after(wbr);

  //   if (getElementNode().nodeName !== "I") {
  //     initializeInlineItalic();
  //   }
  //   const caretWbr = document.querySelector("#caret-wbr");
  //   caretWbr.remove();
  // }

  removeInlineBold(e);
  removeInlineItalic(e);
  monitorBoldTailInput(e);
  monitorItalicTailInput(e);

  return;
}

function onMouseClick(e) {
  setAndUpdateCursorNodeState();
  updateInlineStyleState();
  updateInlineItalicStyleState();
  outputMarkdown();
}

function onKeyPressed(e) {
  setAndUpdateCursorNodeState();
  updateInlineStyleState();
  updateInlineItalicStyleState();
  outputMarkdown();
}
