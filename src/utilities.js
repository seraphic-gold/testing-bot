import boxen from "boxen";
// utility functions
export function box(text, style = "round", title = "") {
  if (title === "") {
    console.log(boxen(text, { borderStyle: style }));
    return;
  } else {
    console.log(boxen(text, { borderStyle: style, title: title }));
    return;
  }
}
