button = d3.select("body").append("button");
button.text("Change Map");
button.on("click", changeMap);

button = d3.select("body").append("button");
button.text("Change Size");
button.on("click", changeSize);