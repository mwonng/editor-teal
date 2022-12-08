import { headingKeyBindingSet } from "./const";

function getSelectionNode() {
  var node = document.getSelection().anchorNode;
  return node.nodeType === 3 ? node.parentNode : node;
}

export function onChange(e) {
  const currNode = getSelectionNode();
  let content = getSeclectedMainNode(currNode).innerText;
  const selection = window.getSelection();
  const anchorOffset = window.getSelection().anchorOffset;
  const oldTagNmae = e.target.tagName;

  console.log("----");
  console.log(e);
  console.log("current content", content);

  if (e.inputType == "deleteContentBackward" && content.trim() == "") {
    currNode.innerText = currNode.innerText.trim();
    if (currNode.innerText.length > 0) {
      selection.setBaseAndExtent(
        currNode.firstChild,
        currNode.innerText.length,
        currNode.firstChild,
        currNode.innerText.length
      );
    }
  }
  // heading triggers
  if (
    content.match(/^#\s/) &&
    getSectionNodeName(currNode) !== "H1" &&
    e.data !== null
  ) {
    const lengthOfTag = headingKeyBindingSet.h1.shortcut.length;
    // heading one
    currNode.innerText = content.replace("#", "");
    let n = changeTagName(currNode, "h1", oldTagNmae);
    bindingListeners(n);
    let sel = window.getSelection();

    sel.setBaseAndExtent(
      n.lastChild.firstChild,
      anchorOffset - lengthOfTag,
      n.lastChild.firstChild,
      anchorOffset - lengthOfTag
    );
    console.log("should go to ", anchorOffset);
  }

  // if (
  //   content.match(/^##\s/) &&
  //   currNode.tagName !== headingKeyBindingSet.h2.tag
  // ) {
  //   const lengthOfTag = headingKeyBindingSet.h2.shortcut.length

  //   // heading two
  //   currNode.innerText = content.replace("##", "");

  //   let n = changeTagName(currNode, "h2",oldTagNmae);
  //   // n.focus();

  //   let sel = window.getSelection()
  //   sel.setBaseAndExtent(n.lastChild.firstChild, anchorOffset-lengthOfTag, n.lastChild.firstChild, anchorOffset-lengthOfTag)
  //   console.log("should go to ",anchorOffset)
  // }

  // if (
  //   content.match(/^###\s/) &&
  //   currNode.tagName !== headingKeyBindingSet.h1.tag
  // ) {
  //   const lengthOfTag = headingKeyBindingSet.h2.shortcut.length

  //   // heading two
  //   currNode.innerText = content.replace("###", "");
  //   let n = changeTagName(currNode, "h3");
  //   // n.focus();

  //   let sel = window.getSelection()
  //   sel.setBaseAndExtent(n.lastChild.firstChild, anchorOffset-lengthOfTag, n.lastChild.firstChild, anchorOffset-lengthOfTag)
  //   console.log("should go to ",anchorOffset)
  // }

  // TODO: links

  // TODO: bold

  // TODO: italic

  // TODO: quote

  // TODO: hr

  // code ?

  // p tag
  debugger;
  if (
    !/^#+\s/.test(content) &&
    getSectionNodeName(currNode) !== "P"
    // e.data !== null
  ) {
    let n = changeTagName(getSeclectedMainNode(currNode), "p", oldTagNmae);
    // n.focus();
    let sel = window.getSelection();
    sel.setBaseAndExtent(
      n.firstChild,
      anchorOffset,
      n.firstChild,
      anchorOffset
    );
    console.log("should go to ", anchorOffset);
  }
}

function changeTagName(el, newTagName) {
  var n = document.createElement(newTagName);
  let sectionParentEl;
  // bindingListeners(n)
  var attr = el.attributes;

  for (var i = 0, len = attr.length; i < len; ++i) {
    n.setAttribute(attr[i].name, attr[i].value);
  }

  if (el.tagName === "SPAN") {
    sectionParentEl = el.parentNode;
  } else {
    sectionParentEl = el;
  }

  sectionParentEl.parentNode.replaceChild(n, el);

  debugger;
  let tagSpan = createEditableTag("span", "heading-tag");

  if (newTagName.toUpperCase() === "P") {
    n.innerText = el.innerText;
  } else {
    let mdtag = headingKeyBindingSet[newTagName].shortcut;
    tagSpan.innerText = mdtag;

    let textSpan = createEditableTag("span", "heading-one");
    textSpan.innerText = el.innerText;

    n.append(tagSpan, textSpan);
  }
  return n;
}

export function onBlur(e) {
  let tag = e.target.tagName;

  switch (tag) {
    case headingKeyBindingSet.h1.tag:
      removeTags(headingKeyBindingSet.h1.shortcut, e);
      break;
    case headingKeyBindingSet.h2.tag:
      removeTags(headingKeyBindingSet.h2.shortcut, e);
      break;
    case headingKeyBindingSet.h3.tag:
    default:
      removeTags(headingKeyBindingSet.h3.shortcut, e);
      break;
  }
}

export function onFocus(e) {
  let tag = e.target.tagName;
  console.log("onfcous");

  // switch (tag) {
  //   case headingKeyBindingSet.h1.tag:
  //     addTags(headingKeyBindingSet.h1.shortcut, e);
  //     break;
  //   case headingKeyBindingSet.h2.tag:
  //     addTags(headingKeyBindingSet.h2.shortcut, e);
  //     break;
  //   case headingKeyBindingSet.h3.tag:
  //     addTags(headingKeyBindingSet.h3.shortcut, e);
  //     break;
  //   default:
  // }
}

function removeTags(tag, e) {
  console.log(e.target);
  if (e.target.firstChild && e.target.firstChild.classList) {
    e.target.firstChild.classList.remove("show");
    e.target.firstChild.classList.add("hide");
  }
}

function addTags(tag, e) {
  if (e.target.firstChild && e.target.firstChild.classList) {
    e.target.firstChild.classList.remove("hide");
    e.target.firstChild.classList.add("show");
  }
}

function createEditableTag(tagName, className) {
  let newTag = document.createElement(tagName.toUpperCase());
  // newTag.contentEditable = "true";

  if (className) {
    newTag.classList.add(className);
  }

  return newTag;
}

export function getEditorElement() {
  return document.getElementById("free-style");
}

// KEY PRESS
function onKeyPressed(e) {
  const sel = window.getSelection();
  const currNode = sel.anchorNode;
  if (e.keyCode === 13) {
    e.preventDefault();
    // console.log("key pressed", e);
    addNewParagraph();
  }
}

export function addNewParagraph() {
  const editorRoot = getEditorElement();
  const newParagraph = document.createElement("p");

  editorRoot.append(newParagraph);
  let sel = window.getSelection();
  sel.setBaseAndExtent(newParagraph, 0, newParagraph, 0);
  return newParagraph;
}

export function bindingListeners(node) {
  let allListeners = [
    { key: "input", action: onChange },
    { key: "focus", action: onFocus },
    // {key: 'blur', action: onBlur},
    { key: "keydown", action: onKeyPressed },
  ];

  allListeners.forEach((item) => node.addEventListener(item.key, item.action));
  // node.addEventListener("input", onChange);
  // node.addEventListener("focus", onFocus);
  // // node.addEventListener("blur", onBlur);
  // node.addEventListener("keydown", onKeyPressed);
}

function getSectionNodeName(currNode) {
  if (currNode.tagName === "SPAN") {
    return currNode.parentNode.tagName;
  }
  return currNode.tagName;
}

function getSeclectedMainNode(currNode) {
  if (currNode.tagName === "SPAN") {
    return currNode.parentNode;
  }
  return currNode;
}

function hasLineBreak(text) {
  return /\n/.test(text);
}