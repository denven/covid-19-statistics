import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

ReactDOM.render(<App />, document.getElementById("root"));

// const getPageZoomRatio = () => {
// 	// if (document.body.clientWidth > 1024) return "70%";
// 	return (
// 		Math.floor((document.body.clientWidth * 100) / window.innerWidth) + "%"
// 	);
// };

// console.log(getPageZoomRatio());

// This property has the same effect with CSS zoom property
// It's not the same effect as Page Zoom in Browser
// Issues: This will effect the echarts map tap/click focus
// document.body.style.zoom = getPageZoomRatio();
