import {
  getElementNode,
  getEditorElement,
  appendTextNode,
  addNewParagraph,
  hasParentClass,
  hasClassNextSibling,
  hasClassPreviousSibling,
  setCaretOffset,
} from "./func/utils";
import {
  removeInlineBold,
  monitorBoldTailInput,
  isTextHadBoldMark,
  replaceTextAndAddMarkElements,
} from "./inlineHelper/boldHelper";

import {
  removeInlineItalic,
  monitorItalicTailInput,
  isTextHaddItalicMark,
  replaceTextAndAddItalicElements,
} from "./inlineHelper/italicHelper";

class Editor {
  constructor() {
    this.cursorAtLastParaNode = null;
    this.cursorAtCurrentParaNode = null;
    this.hasBoldPrefix = false;
    this.hasItalicPrefix = false;
    this.lastPara = null;
    this.currPara = null;
  }

  get cursorStatus() {
    return {
      current: this.cursorAtCurrentParaNode,
      last: this.cursorAtLastParaNode,
      cursorElement: this.cursorAtCurrentElement,
      lastElement: this.cursorAtLastElement,
    };
  }

  get anchorNode() {
    return window.getSelection().anchorNode;
  }

  get anchorOffset() {
    return window.getSelection().anchorOffset;
  }

  get currentCursorNodeName() {
    const node = getElementNode();
    return node.nodeName;
  }

  setBoldPrefix = () => {
    this.hasBoldPrefix = true;
    this.hasItalicPrefix = false;
  };

  setItalicPrefix = () => {
    this.hasBoldPrefix = false;
    this.hasItalicPrefix = true;
  };

  initializeInlineBold = () => {
    const allText = isTextHadBoldMark(this.getCurrentParaNode().innerHTML);
    if (allText) {
      const parentNode = getElementNode();
      const getMatchedGroups = isTextHadBoldMark(
        this.getCurrentParaNode().innerHTML
      );
      replaceTextAndAddMarkElements(parentNode, getMatchedGroups);
      const caretWbr = document.querySelector("#caret-wbr");
      setCaretOffset(caretWbr.nextSibling, 0);
      this.resetBoldPrefix();
      return true;
    }
    return false;
  };

  initializeInlineItalic = () => {
    const allText = isTextHaddItalicMark(this.getCurrentParaNode().innerHTML);
    if (allText) {
      const parentNode = getElementNode();
      const getMatchedGroups = isTextHaddItalicMark(
        this.getCurrentParaNode().innerHTML
      );
      replaceTextAndAddItalicElements(parentNode, getMatchedGroups);
      const caretWbr = document.querySelector("#caret-wbr");
      setCaretOffset(caretWbr.nextSibling, 0);
      this.resetItalicPrefix();
      return true;
    }
    return false;
  };

  resetBoldPrefix = () => {
    this.hasBoldPrefix = false;
    console.log("reset hasBoldPrefix");
  };

  resetItalicPrefix = () => {
    this.hasItalicPrefix = false;
    console.log("reset hasItalicPrefix");
  };

  isParaChange = () => {
    return this.cursorAtCurrentParaNode != this.cursorAtLastParaNode;
  };

  getCurrentParaNode = () => {
    let currentNode = this.anchorNode;
    while (currentNode.nodeName !== "P") {
      currentNode = currentNode.parentNode;
    }
    return currentNode;
  };

  addWbr = () => {
    const wbr = document.createElement("wbr");
    wbr.id = "caret-wbr";
    anchorText.after(wbr);
  };

  monitorPrefix = (e) => {
    let sel = window.getSelection();
    let currText = sel.anchorNode.textContent;
    let newText = currText.slice(0, sel.anchorOffset);
    console.log("before input", newText);

    const hasBold = /\*{2}$/.test(newText);
    if (!this.hasBoldPrefix && hasBold) {
      this.hasBoldPrefix = true;
      this.hasItalicPrefix = false;
      console.log("set hasBoldPrefix");
      return;
    }
    if (!this.hasBoldPrefix && !this.hasItalicPrefix) {
      this.hasItalicPrefix = true;
    }
  };

  getCursorState = () => {
    return {
      current: this.cursorAtCurrentParaNode,
      last: this.cursorAtLastParaNode,
      cursorElement: this.cursorAtCurrentElement,
      lastElement: this.cursorAtLastElement,
      lastPara: this.lastPara,
      currPara: this.currPara,
    };
  };

  outputMarkdown = () => {
    const editorElement = getEditorElement();
    const previewElement = document.getElementById("markdown-review");
    previewElement.innerText = editorElement.innerText;
  };

  onBlur = (e) => {
    this.removeLastParagraphInlineStyle();
  };

  onMouseClick = (e) => {
    this.setAndUpdateCursorNodeState();
    this.updateInlineStyleState();
    this.updateInlineItalicStyleState();
    this.outputMarkdown();
  };

  onKeyPressed = (e) => {
    this.setAndUpdateCursorNodeState();
    this.updateInlineStyleState();
    this.updateInlineItalicStyleState();
    this.outputMarkdown();
    console.log("this", this);
  };

  getInlinePrefix = () => {
    return {
      bold: this.hasBoldPrefix,
      italic: this.hasItalicPrefix,
    };
  };

  getCurrentCursorNodeName = () => {
    const node = getElementNode();
    return node.nodeName;
  };

  updateInlineStyleState = () => {
    let anchorNode = window.getSelection().anchorNode;
    let anchorOffset = window.getSelection().anchorOffset;
    let currParagraphNode = this.getCurrentParaNode();
    debugger;
    if (hasParentClass("inline-md-bold")) {
      const parent = hasParentClass("inline-md-bold");
      parent.classList.add("marks-expend");
      if (this.isParaChange()) {
        this.removeMarkExpendFromNode("inline-md-bold");
      }
    } else if (
      hasClassNextSibling("inline-md-bold") &&
      anchorOffset === anchorNode.textContent.length
    ) {
      const neighbor = hasClassNextSibling("inline-md-bold");
      neighbor.classList.add("marks-expend");
    } else if (
      hasClassPreviousSibling("inline-md-bold") &&
      anchorOffset === 0
    ) {
      const neighbor = hasClassPreviousSibling("inline-md-bold");
      neighbor.classList.add("marks-expend");
    } else if (
      currParagraphNode.querySelectorAll(".inline-md-bold").length > 0
    ) {
      currParagraphNode.querySelectorAll(".inline-md-bold").forEach((e) => {
        e.classList.remove("marks-expend");
      });
    } else {
      if (
        (this.getCurrentCursorNodeName() === "P" && anchorOffset !== 0) ||
        this.isParaChange()
      ) {
        this.removeMarkExpendFromNode("inline-md-bold");
      }
    }
    // hide marks if it leave the bold and right after inline mark style
  };

  updateInlineItalicStyleState = () => {
    let anchorNode = window.getSelection().anchorNode;
    let anchorOffset = window.getSelection().anchorOffset;
    let currParagraphNode = this.getCurrentParaNode();

    if (hasParentClass("inline-md-italic")) {
      const parent = hasParentClass("inline-md-italic");
      parent.classList.add("marks-expend");
      if (this.isParaChange()) {
        this.removeMarkExpendFromNode("inline-md-italic");
      }
    } else if (
      hasClassNextSibling("inline-md-italic") &&
      anchorOffset === anchorNode.textContent.length
    ) {
      const neighbor = hasClassNextSibling("inline-md-italic");
      neighbor.classList.add("marks-expend");
    } else if (
      hasClassPreviousSibling("inline-md-italic") &&
      anchorOffset === 0
    ) {
      const neighbor = hasClassPreviousSibling("inline-md-italic");
      neighbor.classList.add("marks-expend");
    } else if (
      currParagraphNode.querySelectorAll(".inline-md-italic").length > 0
    ) {
      currParagraphNode.querySelectorAll(".inline-md-italic").forEach((e) => {
        e.classList.remove("marks-expend");
      });
    } else {
      if (
        (this.getCurrentCursorNodeName() === "P" && anchorOffset !== 0) ||
        this.isParaChange()
      ) {
        this.removeMarkExpendFromNode("inline-md-italic");
      }
    }
    // hide marks if it leave the bold and right after inline mark style
  };

  onInput = (e) => {
    if (e.inputType === "insertParagraph") {
      return;
    }

    appendTextNode();
    if (e.data === "*" || e.data == null) {
      this.monitorPrefix(e);
      let anchorText = window.getSelection().anchorNode;
      let anchorOffset = window.getSelection().anchorOffset;
      anchorText.splitText(anchorOffset);
      const wbr = document.createElement("wbr");
      wbr.id = "caret-wbr";
      anchorText.after(wbr);
      if (getElementNode().nodeName !== "B" && this.getInlinePrefix().bold) {
        console.log("editor oninput");

        this.initializeInlineBold();
      }

      if (getElementNode().nodeName !== "I" && this.getInlinePrefix().italic) {
        this.initializeInlineItalic();
      }

      const caretWbr = document.querySelector("#caret-wbr");
      caretWbr.remove();
    }

    removeInlineBold(e, this.setBoldPrefix);
    removeInlineItalic(e, this.setItalicPrefix);
    monitorBoldTailInput(e);
    monitorItalicTailInput(e);

    return;
  };

  removeMarkExpendFromNode = (className) => {
    const lastPositioNode = this.getCursorState().last;
    const inlineMarkdownContainer = hasParentClass(className, lastPositioNode);
    if (inlineMarkdownContainer) {
      inlineMarkdownContainer.classList.remove("marks-expend");
    }
  };

  removeLastParagraphInlineStyle = () => {
    const currParagraphNode = this.getCursorState().lastPara;
    console.log("currParagraphNode", currParagraphNode);
    if (currParagraphNode) {
      currParagraphNode.querySelectorAll(".marks-expend").forEach((e) => {
        e.classList.remove("marks-expend");
      });
    }
  };

  setAndUpdateCursorNodeState = () => {
    const anchorElement = getElementNode();
    const anchorNode = window.getSelection().anchorNode;
    const anchorOffset = window.getSelection().anchorOffset;
    const currentCursorNode =
      anchorElement.nodeName !== "P" ? anchorElement.parentNode : anchorElement;
    const currentParaNode = this.getCurrentParaNode();
    this.lastPara = this.currPara;
    this.currPara = currentParaNode;

    this.cursorAtLastParaNode = this.cursorAtCurrentParaNode;
    this.cursorAtCurrentParaNode = currentCursorNode;
    this.cursorAtLastElement = this.cursorAtCurrentElement;
    this.cursorAtCurrentElement = anchorNode;
  };

  // bindings!!
  bindingListeners(node) {
    let allListeners = [
      { key: "input", action: this.onInput },
      { key: "click", action: this.onMouseClick },
      { key: "blur", action: this.onBlur },
      // { key: "selectionchange", action: onSelectionChange },
      { key: "keyup", action: this.onKeyPressed },
    ];

    allListeners.forEach((item) =>
      node.addEventListener(item.key, item.action)
    );
  }

  renderEditor() {
    document.getElementById("app").innerHTML = `
        <h1>Markdown Live Preview Demo:</h1>
        `;
    let freeStyleArea = document.getElementById("free-style");
    addNewParagraph("Lorem ipsum dolor sit amet, consectetur adipiscing.");
    let markdownArea = document.createElement("div");
    markdownArea.id = "markdown-review";
    freeStyleArea.after(markdownArea);
    this.outputMarkdown();
    this.bindingListeners(freeStyleArea);
    console.log("this", this);
  }
}

export default Editor;
