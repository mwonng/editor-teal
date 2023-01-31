import { getElementNode } from "./eventHelpers";
import { getCurrentCursorNodeName } from "./inlineHelpers";

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

export function getEditorElement() {
  return document.getElementById("free-style");
}

/**
 * This function will set new curosr/Caret position to new node by the old node offset
 * @param {node} nodeFragments, when window.getSelection() catch a textNode on current cursor and going to be change to a inline style, this is the new Node which has inline sytled applied.
 * @param {number} offset, the offset before the inline style change
 * @returns {void | false}
 */
export function setCaretOffset(firstNode, offset) {
  let restOffset = offset;
  let currentFragment = firstNode;

  while (currentFragment && restOffset > nodeSize(currentFragment)) {
    restOffset = restOffset - nodeSize(currentFragment);
    currentFragment =
      currentFragment.nextSibling || currentFragment.parentNode.nextSibling;
    if (currentFragment && currentFragment.childNodes.length > 1) {
      currentFragment = currentFragment.firstChild;
    }
  }

  setNodeOffset(currentFragment, restOffset);
  return true;
}

export function nodeSize(node) {
  if (node.nodeType === 3) {
    return node.textContent.length;
  }
  return node.innerText.length;
}

export function setNodeOffset(node, offset) {
  let currNode = node;
  while (currNode && currNode.nodeType !== 3) {
    currNode = currNode.firstChild;
  }

  const sel = window.getSelection();
  sel.setBaseAndExtent(currNode, offset, currNode, offset);
}

export function getNodeIndexOfChild(parent, child) {
  const index = Array.prototype.findIndex.call(
    parent.childNodes,
    (c) => c === child
  );
  return index;
}

export function hasParentClass(className, node) {
  let currentNode = node || getElementNode();

  while (currentNode && currentNode.nodeType !== "P") {
    if (currentNode.classList && currentNode.classList.contains(className)) {
      return currentNode;
    }
    currentNode = currentNode.parentNode;
  }

  return false;
}

export function hasClassNextSibling(className) {
  let anchorNode = window.getSelection().anchorNode;
  if (!anchorNode.nextElementSibling) {
    return false;
  }
  if (
    anchorNode.nextElementSibling.classList &&
    anchorNode.nextElementSibling.classList.contains(className)
  ) {
    return anchorNode.nextElementSibling;
  }
  return false;
}

export function hasClassPreviousSibling(className) {
  let anchorNode = window.getSelection().anchorNode;
  if (!anchorNode.previousSibling) {
    return false;
  }
  if (
    anchorNode.previousSibling.classList &&
    anchorNode.previousSibling.classList.contains(className)
  ) {
    return anchorNode.previousSibling;
  }
  return false;
}
