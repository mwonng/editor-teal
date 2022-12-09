import "./styles.css";
import { addNewParagraph, bindingListeners } from "./func/helpers";

document.getElementById("app").innerHTML = `
<h1>JS loaded!</h1>
`;

let freeStyleArea = document.getElementById("free-style");

addNewParagraph("aaa bbb ccc ddaabbcc");
bindingListeners(freeStyleArea)