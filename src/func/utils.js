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
