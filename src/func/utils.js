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

export function replaceInlineTags(node) {
  console.log("found inline in Node", node);
  console.log("anchorOffset", getAnchorOffset());
  const anchorOffset = getAnchorOffset();
  const parentNode = node.parentNode;

  const oldInnerText = node.innerText;

  // split by marks
  const textArr = oldInnerText.split("**");
  const term = "**" + textArr[1] + "**";
  const termPos = oldInnerText.indexOf(term);
  console.log(termPos + term.length);
  // create before and after marks spans
  const beforeMarkSpan = createEditableTag("span");
  beforeMarkSpan.innerText = textArr[0] + " ";

  const afterMarkSpan = createEditableTag("span");
  afterMarkSpan.innerText = " " + textArr[2];

  // create mark spans
  const markSpan = createEditableTag("span", "bold");
  markSpan.innerText = "**";

  // create a inline mark text span(text to be bold/italic)
  const inlineMarkTextSpan = createEditableTag("span");
  inlineMarkTextSpan.innerText = textArr[1];

  // create the inline mark wrapper
  const inlineMark = createEditableTag("b");
  inlineMark.append(markSpan.cloneNode(true), inlineMarkTextSpan, markSpan);

  // create a new paragraph to replace current node
  const newNode = document.createElement("P");
  newNode.append(beforeMarkSpan, inlineMark, afterMarkSpan);

  parentNode.replaceChild(newNode, node);

  if (anchorOffset >= termPos) {
    console.log("move to after ");
    const sel = window.getSelection();
    // debugger;
    sel.setBaseAndExtent(
      afterMarkSpan.firstChild,
      1,
      afterMarkSpan.firstChild,
      1
    );
  }
  return newNode;
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

export function hideMarkSpan(inlineNode) {
  inlineNode.firstChild.classList.remove("show");
  inlineNode.firstChild.classList.add("hide");
  inlineNode.lastChild.classList.remove("show");
  inlineNode.lastChild.classList.add("hide");
  removeSpace(inlineNode);
}

export function removeSpace(inlineNode) {
  inlineNode.previousSibling.innerHTML = inlineNode.previousSibling.innerHTML.trim();
  inlineNode.nextSibling.innerHTML = inlineNode.nextSibling.innerHTML.trim();
}

export function showMarkSpan(markSpanNode) {
  markSpanNode.classList.remove("hide");
  markSpanNode.classList.add("show");
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
