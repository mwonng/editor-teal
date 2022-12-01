import { headingKeyBindingSet } from "./const";

export function onChange(e) {
  const currNode = e.target;
  let content = e.target.innerText;
  const anchorOffset = window.getSelection().anchorOffset;

  if (
    content.match(/^#\s/) &&
    currNode.tagName !== headingKeyBindingSet.h1.tag
  ) {
    // heading one
    currNode.innerText = content.replace("#", "");
    let n = changeTagName(currNode, "h1");
    n.focus();
    moveCaret(window, anchorOffset);
  }
  if (
    content.match(/^##\s/) &&
    currNode.tagName !== headingKeyBindingSet.h2.tag
  ) {
    // heading two
    currNode.innerText = content.replace("##", "");
    let n = changeTagName(currNode, "h2");
    n.focus();
    moveCaret(window, anchorOffset);
  }

  if (
    content.match(/^###\s/) &&
    currNode.tagName !== headingKeyBindingSet.h1.tag
  ) {
    // heading two
    currNode.innerText = content.replace("###", "");
    let n = changeTagName(currNode, "h3");
    n.focus();
    moveCaret(window, anchorOffset);
  }

  // p tag
  if (!/^#+\s/.test(content) && currNode.tagName !== "P") {
    let n = changeTagName(currNode, "p");
    n.focus();
    moveCaret(window, anchorOffset);
  }
}

export function onBlur(e) {
  let tag = e.target.tagName;

  switch (tag) {
    case headingKeyBindingSet.h1.tag:
      removeTags(headingKeyBindingSet.h1.shortcut);
      break;
    case headingKeyBindingSet.h2.tag:
      removeTags(headingKeyBindingSet.h2.shortcut);
      break;
    case headingKeyBindingSet.h3.tag:
    default:
      removeTags(headingKeyBindingSet.h3.shortcut);
      break;
  }
}

export function onFocus(e) {
  let tag = e.target.tagName;
  console.log("onfcous");
  switch (tag) {
    case headingKeyBindingSet.h1.tag:
      addTags(headingKeyBindingSet.h1.shortcut, e);
      break;
    case headingKeyBindingSet.h2.tag:
      addTags(headingKeyBindingSet.h2.shortcut, e);
      break;
    case headingKeyBindingSet.h3.tag:
      addTags(headingKeyBindingSet.h3.shortcut, e);
      break;
    default:
  }
}

function changeTagName(el, newTagName) {
  var n = document.createElement(newTagName);
  n.addEventListener("focus", onFocus);
  n.addEventListener("blur", onBlur);
  n.addEventListener("input", onChange);
  var attr = el.attributes;
  for (var i = 0, len = attr.length; i < len; ++i) {
    n.setAttribute(attr[i].name, attr[i].value);
  }
  n.innerText = el.innerText;
  el.parentNode.replaceChild(n, el);
  return n;
}

function moveCaret(win, charCount) {
  var sel;
  if (win.getSelection) {
    sel = win.getSelection();
    if (sel.rangeCount > 0) {
      var textNode = sel.focusNode;
      var newOffset = sel.focusOffset + charCount;
      sel.collapse(textNode, Math.min(textNode.length, newOffset));
    }
  }
}

function removeTags(tag) {
  document.getElementById("free-style").innerText = document
    .getElementById("free-style")
    .innerText.replace(tag, "");
}

function addTags(tag, e) {
  let oldText = e.target.innerText;
  e.target.innerText = `${tag} ${oldText}`;
}
