import { getElementNode } from "./func/utils";
import { bindingListeners } from "./func/helpers";
import { addNewParagraph } from "./func/utils";

class Editor {
  constructor() {
    this.cursorAtLastParaNode = null;
    this.cursorAtCurrentParaNode = null;
    this.hasBoldPrefix = false;
    this.hasItalicPrefix = false;
    this.anchorNode = null;
    this.anchorOffset = 0;
  }

  get cursorStatus() {
    return {
      current: this.cursorAtCurrentParaNode,
      last: this.cursorAtLastParaNode,
      cursorElement: this.cursorAtCurrentElement,
      lastElement: this.cursorAtLastElement,
    };
  }

  setAndUpdateCursorNodeState() {
    const anchorElement = getElementNode();
    const anchorNode = window.getSelection().anchorNode;
    const currentCursorNode =
      anchorElement.nodeName !== "P" ? anchorElement.parentNode : anchorElement;
    this.cursorAtLastParaNode = cursorAtCurrentParaNode;
    this.cursorAtCurrentParaNode = currentCursorNode;
    this.cursorAtLastElement = cursorAtCurrentElement;
    this.cursorAtCurrentElement = anchorNode;
  }

  get currentCursorNodeName() {
    const node = getElementNode();
    return node.nodeName;
  }

  resetBoldPrefix() {
    hasBoldPrefix = false;
    console.log("reset hasBoldPrefix");
  }

  resetItalicPrefix() {
    hasItalicPrefix = false;
    console.log("reset hasItalicPrefix");
  }

  get isParaChange() {
    return cursorAtCurrentParaNode != cursorAtLastParaNode;
  }

  renderEditor() {
    document.getElementById("app").innerHTML = `
        <h1>JS loaded!</h1>
        `;
    let freeStyleArea = document.getElementById("free-style");
    addNewParagraph("Lorem ipsum dolor sit amet, consectetur adipiscing.");
    bindingListeners(freeStyleArea);
  }
}

export default Editor;
