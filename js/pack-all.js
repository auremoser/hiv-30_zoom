var margin = 20,
    diameter = 800;

var color = d3.scale.linear()
    .range(["#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#99000d"])
    .interpolate(d3.interpolateHcl);

var pack = d3.layout.pack()
    .padding(2)
    .size([diameter - margin, diameter - margin])
    .value(function(d) { return d.terms.length; })

var svg = d3.select("body").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
  .append("g")
    .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

d3.json("hiv-all.json", function(error, root) {
  if (error) return console.error(error);

  var focus = root,
      nodes = pack.nodes(root),
      view;

  var circle = svg.selectAll("circle")
      .data(nodes)
    .enter().append("circle")
      .attr("class", function(d) {
        var c = d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"
        if (d.terms) {
          c += ' ' + d.name
        }
        return c;
      })
      .style("fill", function(d) { return d.children ? color(d.depth) : null; })
      .on("click", function(d) {
        if (d.depth === 2) {
          showTerms(d)
        }
        if (focus !== d) zoom(d), d3.event.stopPropagation();
      });

  var text = svg.selectAll("text")
      .data(nodes)
    .enter().append("text")
      .attr("class", "label")
      .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
      .style("display", function(d) { return d.parent === root ? null : "none"; })
      .text(function(d) { return d.name; });

  var node = svg.selectAll("circle,text");

  d3.select("body")
      .style("background", color(-1))
      .on("click", function() { zoom(root); });

  zoomTo([root.x, root.y, root.r * 2 + margin]);

  function zoom(d) {
    var focus0 = focus; focus = d;

    var transition = d3.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom", function(d) {
          var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
          return function(t) { zoomTo(i(t)); };
        });

    transition.selectAll("text")
      .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
        .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
        .each("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
        .each("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
  }

  function zoomTo(v) {
    var k = diameter / v[2]; view = v;
    node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
    circle.attr("r", function(d) { return d.r * k; });
  }
});

function showTerms(d) {
  console.log(d)

  d3.select('#article-date').text(d.name)

  d3.selectAll('.term').remove()

  d.children.forEach(function(child) {
    d3.select('#terms-' + child.name)
      .selectAll('.term')
      .data(child.terms)
      .enter()
        .append('div')
        .attr('class', 'term')
        .text(function(d) {
          return d
        })
  })
}
