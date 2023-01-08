import { headingKeyBindingSet } from "./const";
import { onInput } from "./newSolution";
import {
  addNewParagraph,
  createEditableTag,
  getAnchorFocusNode,
  getAnchorFocusNodeSize,
  getAnchorOffset,
  getEditorElement,
  getSeclectedMainNode,
  getSelectionNode,
  getMainElementTagName,
  hasInlineMarkAround,
  hasInlineMarkInText,
  hideTags,
  isHeadingTag,
  isInlineTag,
  showTags,
  showMarkSpan,
  hideMarkSpan,
  replaceInlineTags,
  strToHtml,
} from "./utils";

let lastVisitedNode, currentVisitingNode;

export function onChange(e) {
  const currNode = getSelectionNode();
  let content = getSeclectedMainNode(currNode).innerText;
  const selection = window.getSelection();
  const anchorOffset = window.getSelection().anchorOffset;

  const rootEle = document.getElementById("free-style");
  const editorEle = rootEle.firstChild.innerText;

  // console.log("editorEle", editorEle);
  console.log("content", content, getMainElementTagName(currNode));
  isPrevPosNbsp();
  // capture inline marks
  if (
    content.match(/\*{2}(\S+)\*{2}/) &&
    getMainElementTagName(currNode) === "P" &&
    e.data === "*"
  ) {
    console.log("sel", selection, anchorOffset);
    const newNode = replaceInlineTags(currNode, anchorOffset);
    // selection.setBaseAndExtent()
  }

  //

  // updateActiveNode(getSeclectedMainNode(currNode));
  // console.log("----");
  // console.log(e);
  // console.log("current content", content);

  // if (e.inputType == "deleteContentBackward" && content.trim() == "") {
  //   currNode.innerText = currNode.innerText.trim();
  //   if (currNode.innerText.length > 0) {
  //     selection.setBaseAndExtent(
  //       currNode.firstChild,
  //       currNode.innerText.length,
  //       currNode.firstChild,
  //       currNode.innerText.length
  //     );
  //   }
  // }
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

  // TODO: links

  // TODO: bold

  // TODO: italic

  // TODO: quote

  // TODO: hr

  // code ?

  if (getMainElementTagName(currNode) === "P") {
    return;
  }

  // p tag
  // if (
  //   !/^#+\s/.test(content) &&
  //   getMainElementTagName(currNode) !== "P" &&
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

// bindings!!
export function bindingListeners(node) {
  let allListeners = [
    { key: "input", action: onInput },
    { key: "click", action: onMouseClick },
    // {key: 'blur', action: onBlur},
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
  // console.log("currNode.innerText", currNode.innerText);
  // console.log("currNode.innerText", content.replace(tagConfig.shortcut, ""));

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
  const anchorNode = window.getSelection().anchorNode;
  // updateActiveNode(anchorNode);
  // leave from inline bolder

  // when mouse click out from a inline element

  if (lastVisitedNode && isInlineTag(getSeclectedMainNode(lastVisitedNode))) {
    hideTags(lastVisitedNode);
  }

  // when mouse click into a inline element
  if (isInlineTag(getSeclectedMainNode(anchorNode))) {
    showTags(anchorNode);
  }
}

function updateActiveNode(node) {
  // debugger;
  lastVisitedNode = currentVisitingNode;
  currentVisitingNode = node;
  const currNode = window.getSelection().anchorNode;

  if (lastVisitedNode && currentVisitingNode != lastVisitedNode) {
    // console.log("-----");
    // console.log(
    //   "lastVisitedNode ->",
    //   lastVisitedNode,
    //   lastVisitedNode.nodeValue
    // );
    // console.log(
    //   "currentVisitingNode",
    //   currentVisitingNode.nodeType,
    //   currentVisitingNode.nodeName,
    //   currentVisitingNode.nodeValue
    // );
    // console.log(
    //   "%cisSame??? ->",
    //   "color: red",
    //   lastVisitedNode == currentVisitingNode
    // );
    // console.log(
    //   "isInlineTag(currentVisitingNode)",
    //   isInlineTag(currentVisitingNode)
    // );
    // console.log("-----");
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
    const mainNode = getSeclectedMainNode(currentVisitingNode);
    // console.log(
    //   "inside inline tags",
    //   getSeclectedMainNode(currentVisitingNode)
    // );
    const hasBoldMark = /\*\*\D+\*\*/.test(mainNode.innerText);
    const hasItalicMark = /\_\D+\_/.test(mainNode.innerText);

    if (!hasBoldMark && !hasItalicMark) {
      // console.log("inside b tag", getSelectionNode(currentVisitingNode));
      if (getSelectionNode(currentVisitingNode).tagName === "B") {
        addInlineMarkup("P", "**", currentVisitingNode);
      }
      if (getSelectionNode(currentVisitingNode).tagName === "I") {
        addInlineMarkup("P", "_", currentVisitingNode);
      }
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
  // debug
  // console.log(e);
  //
  // const currNode = getSelectionNode();
  const currNode = window.getSelection().anchorNode;
  const anchorOffset = getAnchorOffset();
  // let node = getSeclectedMainNode(currNode);
  // debugger;
  // updateActiveNode(currNode);

  // this condition for cursor move out of bold to right side
  // TODO need to fix
  // if (
  //   anchorOffset === 1 &&
  //   getSelectionNode().tagName === "SPAN" &&
  //   getSelectionNode().previousSibling.tagName === "B"
  // ) {
  //   const anchorOffsetHiding = getAnchorOffset();

  //   hideMarkSpan(getSelectionNode().previousSibling);

  //   // currSel.textContent = currNode.textContent.trim();
  //   const currSel = window.getSelection().anchorNode;
  //   let sel = window.getSelection();
  //   debugger;
  //   sel.setBaseAndExtent(
  //     currSel.firstChild,
  //     anchorOffsetHiding - 1,
  //     currSel.firstChild,
  //     anchorOffsetHiding - 1
  //   );
  // }

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

function addInlineMarkup(tagName, symbol, node) {
  // console.log("inline currNode", currNode);

  const hasBoldMark = /\*\*\D+\*\*/.test(node.innerText);
  const hasItalicMark = /\_\D+\_/.test(node.innerText);

  if (hasBoldMark || hasItalicMark) {
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
  const beforeSpan = createEditableTag("span");
  beforeSpan.innerText = beforeText.nodeValue;
  const afterSpan = createEditableTag("span");
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

  const inlineTagLeftNode = createEditableTag("span", "bold-tag");
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

function isPrevPosNbsp() {
  const currPos = getAnchorOffset();
  const currText = getSelectionNode().innerText;
  const prevCharacter = currText[currPos - 1];

  if (prevCharacter == "*") {
    console.log("isPrevPosNbsp -> true");
    const anchorNode = getSelectionNode();
    console.log("anchorNode", anchorNode);
    const sel = window.getSelection();
    const nextNode = anchorNode.nextSibling;
    console.log("nextNode", nextNode);
    // sel.setBaseAndExtent(nextNode.firstChild, 0, nextNode.firstChild, 1);
    return true;
  }

  console.log("isPrevPosNbsp", currText, currPos, prevCharacter);
}
