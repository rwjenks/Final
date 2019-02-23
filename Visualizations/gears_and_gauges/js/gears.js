{
    const height = 500;
    const x = Math.sin(2 * Math.PI / 3);
    const y = Math.cos(2 * Math.PI / 3);
    const start = Date.now();
  
    const svg = d3.select(DOM.svg(width, height));
    
    const frame = svg.append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
      .append("g")
        .datum({radius: +frameRadius});
  
    const path = frame.selectAll("g")
      .data([
        {fill: "#c6dbef", teeth: 80, radius: -radius * 5, origin: [0, 0], annulus: true},
        {fill: "#6baed6", teeth: 16, radius: radius, origin: [0, 0]},
        {fill: "#9ecae1", teeth: 32, radius: -radius * 2, origin: [0, -radius * 3]},
        {fill: "#9ecae1", teeth: 32, radius: -radius * 2, origin: [-radius * 3 * x, -radius * 3 * y]},
        {fill: "#9ecae1", teeth: 32, radius: -radius * 2, origin: [radius * 3 * x, -radius * 3 * y]}
       ])
      .join("g")
        .attr("transform", d => `translate(${d.origin})`)
      .append("path")
        .attr("stroke", "black")
        .attr("fill", d => d.fill)
        .attr("d", gear);
  
    while (true) {
      const angle = (Date.now() - start) * speed;
      const transform = d => `rotate(${angle / d.radius})`;
      path.attr("transform", transform);
      frame.attr("transform", transform);
      yield svg.node();
    }
  }