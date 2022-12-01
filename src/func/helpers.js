import { headingKeyBindingSet } from "./const";

function moveCaretToEnd(el) {
  if (typeof el.selectionStart == "number") {
      el.selectionStart = el.selectionEnd = el.value.length;
  } else if (typeof el.createTextRange != "undefined") {
      el.focus();
      var range = el.createTextRange();
      range.collapse(false);
      range.select();
  }
}

export function onChange(e) {
  const currNode = e.target;
  let content = e.target.innerText;
  const anchorOffset = window.getSelection().anchorOffset;
  const oldTagNmae =  e.target.tagName

  console.log(anchorOffset)
  if (
    content.match(/^#\s/) &&
    currNode.tagName !== headingKeyBindingSet.h1.tag
  ) {
    debugger
    const lengthOfTag = headingKeyBindingSet.h1.shortcut.length
    // heading one
    currNode.innerText = content.replace("#", "");
    let n = changeTagName(currNode, "h1", oldTagNmae);
    console.log(n)
    n.focus();

    let sel = window.getSelection()
    sel.setBaseAndExtent(n.lastChild.firstChild, anchorOffset-lengthOfTag, n.lastChild.firstChild, anchorOffset-lengthOfTag)
    console.log("should go to ",anchorOffset)
  }

  if (
    content.match(/^##\s/) &&
    currNode.tagName !== headingKeyBindingSet.h2.tag
  ) {
    const lengthOfTag = headingKeyBindingSet.h2.shortcut.length

    // heading two
    currNode.innerText = content.replace("##", "");
    
    let n = changeTagName(currNode, "h2",oldTagNmae);
    n.focus();

    let sel = window.getSelection()
    sel.setBaseAndExtent(n.lastChild.firstChild, anchorOffset-lengthOfTag, n.lastChild.firstChild, anchorOffset-lengthOfTag)
    console.log("should go to ",anchorOffset)
  }

  if (
    content.match(/^###\s/) &&
    currNode.tagName !== headingKeyBindingSet.h1.tag
  ) {
    const lengthOfTag = headingKeyBindingSet.h2.shortcut.length

    // heading two
    currNode.innerText = content.replace("###", "");
    let n = changeTagName(currNode, "h3");
    n.focus();
    
    let sel = window.getSelection()
    sel.setBaseAndExtent(n.lastChild.firstChild, anchorOffset-lengthOfTag, n.lastChild.firstChild, anchorOffset-lengthOfTag)
    console.log("should go to ",anchorOffset)
  }

  // p tag
  if (!/^#+\s/.test(content) && currNode.tagName !== "P") {
    let n = changeTagName(currNode, "p", oldTagNmae);
    n.focus();
    let sel = window.getSelection()
    sel.setBaseAndExtent(n.firstChild, anchorOffset, n.firstChild, anchorOffset)
    console.log("should go to ",anchorOffset)
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
  // n.innerText = el.innerText;
  el.parentNode.replaceChild(n, el);

  let tagSpan = createEditableTag('span','heading-tag')

  debugger
  if (newTagName.toUpperCase() === 'P') {
    n.innerText = el.innerText;
  } else {
    let mdtag = headingKeyBindingSet[newTagName].shortcut
  
    tagSpan.contentEditable = "true";
    tagSpan.innerText= mdtag;
    let textSpan = createEditableTag('span','heading-one')
    textSpan.contentEditable = "true";
    textSpan.innerText= el.innerText
    n.append(tagSpan, textSpan);
  }
  return n;

}


export function onBlur(e) {
  let tag = e.target.tagName;

  switch (tag) {
    case headingKeyBindingSet.h1.tag:
      removeTags(headingKeyBindingSet.h1.shortcut,e);
      break;
    case headingKeyBindingSet.h2.tag:
      removeTags(headingKeyBindingSet.h2.shortcut,e);
      break;
    case headingKeyBindingSet.h3.tag:
    default:
      removeTags(headingKeyBindingSet.h3.shortcut,e);
      break;
  }
}

export function onFocus(e) {
  let tag = e.target.tagName;
  console.log("onfcous",window.getSelection().anchorOffset);

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


// function moveCaret(win, charCount) {
//   var sel;
//   if (win.getSelection) {
//     sel = win.getSelection();
//     console.log("sel", sel)
//     if (sel.rangeCount > 0) {
//       console.log("rangeCount > 0", sel)
//       var textNode = sel.focusNode;
//       var newOffset = sel.focusOffset + charCount;
//       sel.collapse(textNode, Math.min(textNode.length, newOffset));
//     }
//   }
// }

function removeTags(tag, e) {
  // e.target.innerText = e.target
  //   .innerText.replace(tag, "");
  console.log(e.target)
  if (e.target.firstChild && e.target.firstChild.classList) {
    e.target.firstChild.classList.remove('show')
    e.target.firstChild.classList.add('hide')
  }
}

function addTags(tag, e) {
  // let oldText = e.target.innerText;
  // let tagSpan = createEditableTag('span','heading-tag')
  // tagSpan.innerText= ""
  // e.target.innerText=""
  // let textSpan = createEditableTag('span','heading-one')
  // textSpan.innerText= oldText
  // // e.target.innerText = `${tag} ${oldText}`;
  // e.target.append(tagSpan, textSpan);
  if (e.target.firstChild && e.target.firstChild.classList) {
    e.target.firstChild.classList.remove('hide')
    e.target.firstChild.classList.add('show')
  }
}

function createEditableTag(tagName, className) {
  let newTag = document.createElement(tagName.toUpperCase())
  newTag.contentEditable = "true";

  if (className) {
    newTag.classList.add(className);
  }

  return newTag
}