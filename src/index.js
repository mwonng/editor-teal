import "./styles.css";
import { onChange, onBlur, onFocus } from "./func/helpers";

document.getElementById("app").innerHTML = `
<h1>JS loaded!</h1>
`;

let freeStyleArea = document.getElementById("free-style");

freeStyleArea.addEventListener("input", onChange);
freeStyleArea.addEventListener("focus", onFocus);
freeStyleArea.addEventListener("blur", onBlur);
