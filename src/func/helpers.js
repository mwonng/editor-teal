import { headingKeyBindingSet } from "./const";
let lastVisitedNode, currentVisitingNode;
function getSelectionNode() {
  var node = document.getSelection().anchorNode;
  return node.nodeType === 3 ? node.parentNode : node;
}

export function onChange(e) {
  const currNode = getSelectionNode();
  let content = getSeclectedMainNode(currNode).innerText;
  const selection = window.getSelection();
  const anchorOffset = window.getSelection().anchorOffset;

  updateActiveNode(getSeclectedMainNode(currNode));
  // console.log("----");
  // console.log(e);
  // console.log("current content", content);

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
  if (content.match(/^#\s/) && getSectionNodeName(currNode) !== "H1") {
    setMarkup("h1", headingKeyBindingSet.h1, anchorOffset);
  }

  if (content.match(/^##\s/) && getSectionNodeName(currNode) !== "H2") {
    setMarkup("h2", headingKeyBindingSet.h2, anchorOffset);
  }

  if (content.match(/^###\s/) && getSectionNodeName(currNode) !== "H3") {
    setMarkup("h3", headingKeyBindingSet.h3, anchorOffset);
  }

  // TODO: links

  // TODO: bold

  // TODO: italic

  // TODO: quote

  // TODO: hr

  // code ?

  if (getSectionNodeName(currNode) === "P") {
    return;
  }

  // p tag
  // if (
  //   !/^#+\s/.test(content) &&
  //   getSectionNodeName(currNode) !== "P" &&
  //   !isInlineTag(currNode)
  // ) {
  //   debugger;
  //   let content = getSeclectedMainNode(currNode).innerText;
  //   let n = changeTagName(getSeclectedMainNode(currNode), "p", content);
  //   // n.focus();
  //   let sel = window.getSelection();
  //   sel.setBaseAndExtent(
  //     n.firstChild,
  //     anchorOffset,
  //     n.firstChild,
  //     anchorOffset
  //   );
  //   console.log("should go to ", anchorOffset);
  // }
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

export function onBlur(e) {
  let tag = e.target.tagName;

  switch (tag) {
    case headingKeyBindingSet.h1.tag:
      hideTags(headingKeyBindingSet.h1.shortcut, e);
      break;
    case headingKeyBindingSet.h2.tag:
      hideTags(headingKeyBindingSet.h2.shortcut, e);
      break;
    case headingKeyBindingSet.h3.tag:
    default:
      hideTags(headingKeyBindingSet.h3.shortcut, e);
      break;
  }
}

function hideTags(node) {
  console.log("hideTags", node);
  if (isInlineTag(node)) {
    node.previousSibling.classList.remove("show");
    node.previousSibling.classList.add("hide");
    node.nextSibling.classList.remove("show");
    node.nextSibling.classList.add("hide");
  }
  if (node.firstChild && node.firstChild.classList) {
    node.firstChild.classList.remove("show");
    node.firstChild.classList.add("hide");
  }
}

function showTags(node) {
  if (isInlineTag(node)) {
    console.log("%cgoing to add tags", "color: blue");
    node.previousSibling.classList.remove("hide");
    node.previousSibling.classList.add("show");
    node.nextSibling.classList.remove("hide");
    node.nextSibling.classList.add("show");
  }
  if (node.firstChild && node.firstChild.classList) {
    node.firstChild.classList.remove("hide");
    node.firstChild.classList.add("show");
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

export function addNewParagraph(text) {
  const editorRoot = getEditorElement();
  const newParagraph = document.createElement("p");

  if (text) {
    newParagraph.innerHTML = text;
  }
  editorRoot.append(newParagraph);
  let sel = window.getSelection();
  sel.setBaseAndExtent(newParagraph, 0, newParagraph, 0);
  return newParagraph;
}

// bindings!!
export function bindingListeners(node) {
  let allListeners = [
    { key: "input", action: onChange },
    { key: "click", action: onMouseClick },
    // {key: 'blur', action: onBlur},
    { key: "keyup", action: onKeyPressed },
  ];

  allListeners.forEach((item) => node.addEventListener(item.key, item.action));
}

function getSectionNodeName(currNode) {
  console.log("getSectionNodeName", currNode);
  if (currNode && currNode.parentNode && currNode.tagName === "SPAN") {
    return currNode.parentNode.tagName;
  }
  return currNode.tagName;
}

function getSeclectedMainNode(currNode) {
  const node = currNode.nodeType === 3 ? node.parentNode : node;
  if (currNode.tagName === "SPAN") {
    return currNode.parentNode;
  }
  return currNode;
}

function setMarkup(tagName, tagConfig, anchorOffset) {
  // debugger;
  const currNode = getSelectionNode();
  let content = getSeclectedMainNode(currNode).innerText;
  const lengthOfTag = tagConfig.shortcut.length;

  currNode.innerText = content.replace(tagConfig.shortcut, "");
  console.log("currNode.innerText", currNode.innerText);
  console.log("currNode.innerText", content.replace(tagConfig.shortcut, ""));

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
  const targetNode = e.target;
  const anchorNode = window.getSelection().anchorNode;
  const targetText = e.target.innerText;
  updateActiveNode(anchorNode);
  // console.log("onMouseClick", e);
  // console.log(targetNode);
  // console.log(targetText);
}

function updateActiveNode(node) {
  // debugger;
  lastVisitedNode = currentVisitingNode;
  currentVisitingNode = node;
  const currNode = window.getSelection().anchorNode;
  if (lastVisitedNode && currentVisitingNode != lastVisitedNode) {
    console.log("-----");
    console.log(
      "lastVisitedNode ->",
      lastVisitedNode,
      lastVisitedNode.nodeValue
    );
    console.log(
      "currentVisitingNode",
      currentVisitingNode.nodeType,
      currentVisitingNode.nodeName,
      currentVisitingNode.nodeValue
    );
    console.log(
      "%cisSame??? ->",
      "color: red",
      lastVisitedNode == currentVisitingNode
    );
    console.log(
      "isInlineTag(currentVisitingNode)",
      isInlineTag(currentVisitingNode)
    );
    console.log("-----");
  }

  // cusor enter inline tag from left side
  if (
    getAnchorOffset() === getAnchorFocusNodeSize() &&
    currentVisitingNode.parentNode.nextSibling &&
    !isInlineTag(lastVisitedNode.parentNode) &&
    isInlineTag(currentVisitingNode.parentNode.nextSibling) &&
    !hasInlineMarkInText(currentVisitingNode.nodeValue)
  ) {
    // console.log(
    //   "enter from left",
    //   currentVisitingNode.parentNode.nextSibling.firstChild.nextSibling
    // );

    showTags(currentVisitingNode.parentNode.nextSibling.firstChild.nextSibling);
    // do sth add inline tags around
    if (getSelectionNode(currentVisitingNode).tagName === "B") {
      addInlineMarkup(
        "P",
        "**",
        currentVisitingNode.parentNode.nextSibling.firstChild.nextSibling
      );
    }
    if (getSelectionNode(currentVisitingNode).tagName === "I") {
      addInlineMarkup(
        "P",
        "_",
        currentVisitingNode.parentNode.nextSibling.firstChild.nextSibling
      );
    }
  }

  // inside

  if (isInlineTag(getSelectionNode(currentVisitingNode))) {
    console.log("inside inline tags");
    // console.log("inside b tag", getSelectionNode(currentVisitingNode));
    if (getSelectionNode(currentVisitingNode).tagName === "B") {
      addInlineMarkup("P", "**", currentVisitingNode);
    }
    if (getSelectionNode(currentVisitingNode).tagName === "I") {
      addInlineMarkup("P", "_", currentVisitingNode);
    }
  }

  // cusor enter inline tag from right side
  if (
    getAnchorOffset() === getAnchorFocusNodeSize() &&
    isInlineTag(currentVisitingNode)
  ) {
    console.log("enter from right");
    showTags(currentVisitingNode);
    if (getSelectionNode(currentVisitingNode).tagName === "B") {
      addInlineMarkup("P", "**", currentVisitingNode);
    }
    if (getSelectionNode(currentVisitingNode).tagName === "I") {
      addInlineMarkup("P", "_", currentVisitingNode);
    }
  }

  // TODO: mouse click not works
  if (isHeadingTag(lastVisitedNode) || isHeadingTag(currentVisitingNode)) {
    if (
      lastVisitedNode &&
      lastVisitedNode != currentVisitingNode &&
      lastVisitedNode.tagName !== "P"
    ) {
      hideTags(lastVisitedNode);
    }

    if (
      currentVisitingNode &&
      lastVisitedNode != currentVisitingNode &&
      currentVisitingNode.tagName !== "P"
    ) {
      showTags(currentVisitingNode);
    }
  }
}

function onKeyPressed(e) {
  // const currNode = getSelectionNode();
  const currNode = window.getSelection().anchorNode;
  console.log("!!!!!!!!! key press -> currentNode", currNode);
  // let node = getSeclectedMainNode(currNode);
  // debugger;
  updateActiveNode(currNode);

  // remove from inline mark when curosr move out to right
  if (
    lastVisitedNode &&
    currentVisitingNode != lastVisitedNode &&
    !isInlineTag(lastVisitedNode.parentNode) &&
    !isInlineTag(currentVisitingNode.parentNode) &&
    lastVisitedNode.parentNode.tagName === "SPAN" &&
    !hasInlineMarkInText(currentVisitingNode.nodeValue) &&
    currentVisitingNode.nodeType === 3 &&
    e.key === "ArrowRight"
  ) {
    hideTags(lastVisitedNode.parentNode.previousSibling);
    console.log("e", e);
  }

  // remove from inline mark when curosr move out to left
  if (
    lastVisitedNode &&
    isInlineTag(lastVisitedNode.parentNode.nextSibling) &&
    !isInlineTag(lastVisitedNode.parentNode) &&
    lastVisitedNode.parentNode.tagName === "SPAN" &&
    currentVisitingNode.nodeType === 3 &&
    !hasInlineMarkInText(currentVisitingNode.nodeValue) &&
    getAnchorOffset() < getAnchorFocusNodeSize() &&
    e.key === "ArrowLeft"
  ) {
    hideTags(lastVisitedNode.parentNode.nextSibling.firstChild.nextSibling);
    console.log("e", e);
  }

  // const anchorNode = getSelectionNode();
  // const sel = window.getSelection();
  // const position = sel.anchorOffset;

  // if (
  //   position === anchorNode.innerText.length &&
  //   anchorNode.nodeName === "SPAN"
  // ) {
  //   console.log("%chelp, im blocked", "color: red");
  //   sel.setBaseAndExtent(anchorNode.nextSibling, 0, anchorNode.nextSibling, 0);

  //   console.log("window.getSelection();", window.getSelection());
  //   console.log("%coops", "color: red");
  // }
}

function isInlineTag(node) {
  if (!node) {
    return false;
  }
  // debugger;
  const inlineTags = ["B", "I"];

  if (node.nodeName === "#text") {
    return inlineTags.includes(node.parentNode.tagName);
  }
  return inlineTags.includes(node.tagName);
}

function isHeadingTag(node) {
  const inlineTags = ["H1", "H2", "H3", "H4"];
  return inlineTags.includes(node);
}

function addInlineMarkup(tagName, symbol, node) {
  // console.log("inline currNode", currNode);

  const hasMark = /\*\D+\*/.test(node.innerText);

  if (hasMark) {
    return;
  }
  if (hasInlineMarkAround(node)) {
    return;
  }

  // console.log("addInlineMarkup node", node);
  // console.log("addInlineMarkup parent", node.parentNode);
  const inlineElement = node.nodeName === "#text" ? node.parentNode : node;
  // debugger;

  const anchorNode = getAnchorFocusNode();
  const anchorOffset = getAnchorOffset();
  const sel = window.getSelection();
  // console.log("anchorNode,", anchorNode);

  const beforeText = inlineElement.previousSibling;
  const afterText = inlineElement.nextSibling;

  // console.log("addInlineMarkup beforeText", beforeText);
  // console.log("addInlineMarkup afterText", afterText);
  const beforeSpan = document.createElement("span");
  beforeSpan.innerText = beforeText.nodeValue;
  const afterSpan = document.createElement("span");
  afterSpan.innerText = afterText.nodeValue;

  const grandpaNode = inlineElement.parentNode;
  // console.log("addInlineMarkup beforeSpan", beforeSpan);
  // console.log("addInlineMarkup afterSpan", afterSpan);
  // console.log("addInlineMarkup grandpaNode", grandpaNode);

  // debugger;
  grandpaNode.replaceChild(beforeSpan, beforeText);
  grandpaNode.replaceChild(afterSpan, afterText);

  // debugger;
  if (anchorNode == beforeText) {
    sel.setBaseAndExtent(
      beforeSpan.firstChild,
      anchorOffset,
      beforeSpan.firstChild,
      anchorOffset
    );
  }

  const inlineTagLeftNode = document.createElement("span");
  inlineTagLeftNode.innerText = symbol;
  const inlineTagRightNode = inlineTagLeftNode.cloneNode(true);
  let inlineTagNode;
  if (node.nodeType === 3 && isInlineTag(node)) {
    inlineTagNode = node.parentNode;
  }
  inlineTagNode = node;
  inlineTagNode.insertBefore(inlineTagRightNode, node.firstChild.nextSibling);
  inlineTagNode.insertBefore(inlineTagLeftNode, node.firstChild);

  // replace current and lastVisted node
  if (currentVisitingNode == beforeText) {
    currentVisitingNode = beforeSpan;
  }
  if (currentVisitingNode == afterText) {
    currentVisitingNode = afterSpan;
  }
  if (lastVisitedNode == beforeText) {
    lastVisitedNode = beforeSpan;
  }
  if (lastVisitedNode == afterText) {
    lastVisitedNode = afterSpan;
  }

  // inlineTagRightNode.parentNode.nextSibling.textContent =
  //   " " + inlineTagRightNode.parentNode.nextSibling.nodeValue;
  // inlineTagLeftNode.parentNode.previousSibling.textContent =
  //   inlineTagLeftNode.parentNode.previousSibling.nodeValue + " ";

  // let content = getSeclectedMainNode(currNode).innerText;
  // const lengthOfTag = tagConfig.shortcut.length;

  // currNode.innerText = content.replace(tagConfig.shortcut, "");
  // console.log("currNode.innerText", currNode.innerText);
  // console.log("currNode.innerText", content.replace(tagConfig.shortcut, ""));

  // let n = changeTagName(
  //   getSeclectedMainNode(currNode),
  //   tagName,
  //   content.replace(tagConfig.shortcut, "")
  // );

  // bindingListeners(n);

  // const sel = window.getSelection();

  // sel.setBaseAndExtent(
  //   n.lastChild.firstChild,
  //   anchorOffset - lengthOfTag,
  //   n.lastChild.firstChild,
  //   anchorOffset - lengthOfTag
  // );
}

function hasInlineMarkAround(node) {
  // console.log("-- hasInlineMarkAround node--", node);
  // console.log("-- hasInlineMarkAround same?--", node == getAnchorFocusNode());

  const marks = ["*", "**", "_", "__"];
  if (!node.nextSibling || !node.previousSibling) {
    return false;
  }

  // console.log("next sibling", node.nextSibling.nodeType);
  // console.log("prev sibling", node.previousSibling.nodeType);
  return (
    node.nextSibling.nodeType === node.previousSibling.nodeType &&
    node.nextSibling.innerText === node.previousSibling.innerText &&
    marks.includes(node.nextSibling.innerText) &&
    marks.includes(node.previousSibling.innerText)
  );
}

function hasInlineMarkInText(text) {
  const marks = ["*", "**", "_", "__"];
  return marks.includes(text);
}

function getAnchorFocusNode() {
  return window.getSelection().anchorNode;
}

function getAnchorFocusNodeSize() {
  const anchorNode = getAnchorFocusNode();
  if (anchorNode.nodeType === 3) {
    return anchorNode.length;
  }

  return anchorNode.innerText.length;
}

function getAnchorOffset() {
  return window.getSelection().anchorOffset;
}