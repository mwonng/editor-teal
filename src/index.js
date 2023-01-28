import "./styles.css";
import { bindingListeners } from "./func/helpers";
import { addNewParagraph } from "./func/utils";

document.getElementById("app").innerHTML = `
<h1>JS loaded!</h1>
`;

let freeStyleArea = document.getElementById("free-style");

addNewParagraph("abcdefg");
bindingListeners(freeStyleArea);
