

var submit = d3.select("#submit");
submit.on("click", function() {

// Prevent the page from refreshing
d3.event.preventDefault();

// I want the table rows that I created (within the "selection" variable) below to be cleared out each time
// the function is called 
d3.selectAll("tr").remove();
d3.selectAll("svg").remove();

// Select the input element and get the raw HTML node
var inputElement = d3.select("#patient-form-input");

// Get the value property of the input element
var inputValue = inputElement.property("value");
console.log(inputValue);

// grab_bd 
d3.json("/data")
.then(function(data) { 
  console.log(data);
    // med_sat_value;
    data.endow_value = +data.endow_value;
    data.aid_value = +data.aid_value;

    // filter the data; if input value is equal to "state" column... console and html log!

    var filteredData = data.filter(person => person.state === inputValue);
    var schools = filteredData.map(person => person.chronname);
    var studentCount = filteredData.map(person => person.student_count);
    var SAT = filteredData.map(person => person.med_sat_value);
    var endow = filteredData.map(person => person.endow_value);
    var aid = filteredData.map(person => person.aid_value);

    filteredData.aid_value = +filteredData.aid_value;

    console.log(schools);  
    console.log(studentCount);
    console.log(SAT);
    console.log(endow);
    console.log(aid);
   
    // once list of schools are gathered, print on html page
    var selection =  d3.select("tbody")
    .selectAll("tr")
    .data(filteredData)
    .enter()
    .append("tr")
    .html(function(d) {
        return `<td>${d.chronname}</td><td>${d.student_count}</td><td>${d.med_sat_value}</td>
        <td>${d.endow_value}</td><td>${d.retain_value}</td><td>${d.aid_value}</td>`    })



       ///////////////bar graph /////////////////

// set the dimensions and margins of the graph
// set the dimensions and margins of the graph
var margin = {top: 80, right: 50, bottom: 30, left: 300},
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// set the ranges
var y = d3.scaleBand()
          .range([height, 0])
          .padding(0.1);

var x = d3.scaleLinear()
          .range([0, width]);

    

function GetTopThirty(arrayData){  //sorting to top 30 function
    arrayData.sort(function(a, b) {
                     return parseFloat(b.value) - parseFloat(a.value);
                   });
    return arrayData.slice(0, 30); 
  }

filteredData = GetTopThirty(filteredData);

filteredData.sort(function(a,b){
  return a.student_count-b.student_count
}) 
          
// append the svg object to the body of the page
// append a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

  // Scale the range of the data in the domains
  x.domain([0, d3.max(filteredData, function(d){ return +d.student_count; })])
  y.domain(filteredData.map(function(d) { return d.chronname; }));
  //y.domain([0, d3.max(data, function(d) { return d.sales; })]);

  

 // create tooltip, assign it a class
  // =======================================================
  var tip = d3.tip()
  .attr('class', 'd3-tip')
  //.offset([-10, 0])
  .offset([-10, 0])
  .style("opacity", .9)
  .style("background",'steelblue')
  .html(function(d) {
    return "<span style='color:Blue'>" + d.chronname + "</span>" +
    "<br>" + "Student Count" + ": " + d.student_count + 
    "<br>" + "Mediat SAT" + ": " + d.med_sat_value + 
    "<br>" + "Endowment" + ": " + d.endow_value + 
    "<br>" + "Retention" + ": " + d.retain_value + "%"
  })

  svg.call(tip)

  // append the rectangles for the bar chart
  svg.selectAll(".bar")
      .data(filteredData)
    .enter().append("rect")
      .attr("class", "bar")
      //.attr("x", function(d) { return x(d.sales); })
      .attr("width", function(d) {return x(d.student_count); } )
      .attr("y", function(d) { return y(d.chronname); })
      .attr("height", y.bandwidth())
      //.attr("fill", "green")
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)


  // add the x Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  // add the y Axis
  svg.append("g")
      .call(d3.axisLeft(y));






})

});
var svg = d3.select("#svg-area3")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import Data
d3.json("/data")
  .then(function(data) {

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    collegeData.forEach(function(data) {
      data.med_sat_value  = +data.med_sat_value;
      data.retain_value  = +data.retain_value;
    });

    // Step 2: Create scale
    

    // ==============================
    var xLinearScale = d3.scaleLinear()
      .domain([0, d3.max(collegeData, d => d.med_sat_value)])
      .range([20, width]);

    var yLinearScale = d3.scaleLinear()
      .domain([-5, d3.max(collegeData, d => d.retain_value)])
      .range([height, 20]);

    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

    // Step 5: Create Circles
    // ==============================
    var circlesGroup = chartGroup.selectAll("circle")
    .data(collegeData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.med_sat_value))
    .attr("cy", d => yLinearScale(d.retain_value))
    .attr("r", "15")
    .attr("fill", "pink")
    .attr("stroke", "darkpink") 
    .attr("opacity", ".5");

    // Step 6: Initialize tool tip
    // ==============================
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.chronname}<br>Medium SAT Value: ${d.med_sat_value}<br>Freshmen Retention: ${d.retain_value}`);
      });

    // Step 7: Create tooltip in the chart
    // ==============================
    chartGroup.call(toolTip);

    // Step 8: Create event listeners to display and hide the tooltip
    // ==============================
    circlesGroup.on("click", function(data) {
      toolTip.show(data, this);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });

    // Create axes labels
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Med SAT Value");

    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "axisText")
      .text("Retention Value");
  });
