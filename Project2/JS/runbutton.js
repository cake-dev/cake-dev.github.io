button = d3.select("#legend_container").append("button");
button.text("Change Year");
button.on("click", changeYear);

button = d3.select("#legend_container").append("button");
button.text("Change Size");
button.on("click", changeSize);