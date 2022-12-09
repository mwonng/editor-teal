export function getSelectionNode() {
  var node = document.getSelection().anchorNode;
  return node.nodeType === 3 ? node.parentNode : node;
}

export function getMainElementTagName(currNode) {
  const mainElement = getSeclectedMainNode(currNode);
  return mainElement.tagName;
}

export function getSeclectedMainNode(currNode) {
  const node = currNode.nodeType === 3 ? currNode.parentNode : currNode;
  if (node.tagName === "SPAN") {
    return node.parentNode;
  }
  return node;
}

export function getAnchorFocusNode() {
  return window.getSelection().anchorNode;
}

export function getAnchorFocusNodeSize() {
  const anchorNode = getAnchorFocusNode();
  if (anchorNode.nodeType === 3) {
    return anchorNode.length;
  }

  return anchorNode.innerText.length;
}

export function getAnchorOffset() {
  return window.getSelection().anchorOffset;
}

export function hasInlineMarkInText(text) {
  const marks = ["*", "**", "_", "__"];
  return marks.includes(text);
}

export function isHeadingTag(tagName) {
  const inlineTags = ["H1", "H2", "H3", "H4"];
  return inlineTags.includes(tagName);
}

export function isInlineTag(node) {
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

export function showTags(node) {
  if (isInlineTag(node)) {
    console.log("%cgoing to add tags", "color: blue");
    node.previousSibling.classList.remove("hide");
    node.previousSibling.classList.add("show");
    node.nextSibling.classList.remove("hide");
    node.nextSibling.classList.add("show");
  }
  if (
    isHeadingTag(getMainElementTagName(node)) &&
    node.firstChild &&
    node.firstChild.classList
  ) {
    node.firstChild.classList.remove("hide");
    node.firstChild.classList.add("show");
  }
}

export function hideTags(node) {
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

export function createEditableTag(tagName, className) {
  let newTag = document.createElement(tagName.toUpperCase());

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

export function hasInlineMarkAround(node) {
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
