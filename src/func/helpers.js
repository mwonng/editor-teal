import { headingKeyBindingSet } from "./const";
import {
  onInput,
  onSelectionChange,
  setAndUpdateCursorNodeState,
  updateInlineStyleState,
} from "./newSolution";

import {
  createEditableTag,
  getSeclectedMainNode,
  getSelectionNode,
  getMainElementTagName,
  replaceInlineTags,
} from "./utils";

let lastVisitedNode, currentVisitingNode;

export function onChange(e) {
  // heading triggers
  if (content.match(/^#\s/) && currNode !== "H1") {
    setMarkup("h1", headingKeyBindingSet.h1, anchorOffset);
  }

  if (content.match(/^##\s/) && getMainElementTagName(currNode) !== "H2") {
    setMarkup("h2", headingKeyBindingSet.h2, anchorOffset);
  }

  if (content.match(/^###\s/) && getMainElementTagName(currNode) !== "H3") {
    setMarkup("h3", headingKeyBindingSet.h3, anchorOffset);
  }

  if (getMainElementTagName(currNode) === "P") {
    return;
  }
}

function changeTagName(el, newTagName, innerText) {
  var n = document.createElement(newTagName);
  let sectionParentEl;
  // bindingListeners(n)
  var attr = el.attributes;
  // debugger;
  for (var i = 0, len = attr.length; i < len; ++i) {
    n.setAttribute(attr[i].name, attr[i].value);
  }

  sectionParentEl = getSeclectedMainNode(el);

  sectionParentEl.parentNode.replaceChild(n, el);

  let tagSpan = createEditableTag("span", "heading-tag");

  if (newTagName.toUpperCase() === "P") {
    n.innerText = innerText;
  } else {
    let mdtag = headingKeyBindingSet[newTagName].shortcut;
    tagSpan.innerText = mdtag;

    let textSpan = createEditableTag("span", "heading-one");
    textSpan.innerText = innerText;

    n.append(tagSpan, textSpan);
  }
  return n;
}

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

function setMarkup(tagName, tagConfig, anchorOffset) {
  // debugger;
  const currNode = getSelectionNode();
  let content = getSeclectedMainNode(currNode).innerText;
  const lengthOfTag = tagConfig.shortcut.length;

  currNode.innerText = content.replace(tagConfig.shortcut, "");
  let n = changeTagName(
    getSeclectedMainNode(currNode),
    tagName,
    content.replace(tagConfig.shortcut, "")
  );

  bindingListeners(n);

  const sel = window.getSelection();

  sel.setBaseAndExtent(
    n.lastChild.firstChild,
    anchorOffset - lengthOfTag,
    n.lastChild.firstChild,
    anchorOffset - lengthOfTag
  );
}

function onMouseClick(e) {
  setAndUpdateCursorNodeState();
  updateInlineStyleState();
}

function onKeyPressed(e) {
  setAndUpdateCursorNodeState();
  updateInlineStyleState();
}
