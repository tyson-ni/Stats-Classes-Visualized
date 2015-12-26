d3.select("div#viz").append("svg")

queue()
  .defer(d3.json, "classes.json")
  .defer(d3.csv, "relations.csv")
  .await(function(error, classes, relations) { dataViz(classes.all, relations) });


function dataViz(classes, relations) {

  // define some attributes
  var numMath = 5
  var numRequired = 11
  var numLower = 2
  var num100 = 3
  var num101 = 3
  var num102 = 3
  var numElective = 7
  var numConsulting = 2
  var smallRadius = 14
  var bigRadius = 22
  var reqRadius = 16
  var smallVerticalDist = 45
  var bigVerticalDist = 70
  var horizontalDist = 80
  var horizontalY = 450
  var majorY = 700
  var mathColor = "#7DCEA0"
  var reqColor = "#CD6155"
  var electiveColor = "#E6B0AA"
  var consultingColor = "#EB984E"
  var transitionDuration = 200
  var categoryFont = "18px"

  /* determine where to place each class */
  setPositions(classes)

  /* create a g element for each class */
  var classG = d3.select("svg")
               .selectAll("g#classes")
               .data(classes)
               .enter()
               .append("g")
               .attr("id", function(d) { return "classes" + d.category })
               .attr("transform", function(d) {
                                   return "translate(" + d.x + "," + d.y + ")"
                                 })

  /* create a g element to place quarter selectors */
  var quarterG = d3.select("svg")
                   .data(classes)
                   .append("g")
                   .attr("id", "quarters")
                   .attr("transform", "translate(850, 60)")

  /* create g element to display class info */
  // var infoG = d3.select("svg")
  //               .append("g")
  //               .attr("id", "info")
  //               .attr("transform", "translate(50, 50)")


  /* hash class nodes */
  var nodeHash = {}
  hashClasses()

  /* determine where to place labels beside circles */
  labelsExtent = d3.extent(classes, function(d) { return d.abbrev.length })
  labelsScale = d3.scale.linear().domain(labelsExtent).range([-38, -65])

  /* create a circle for each class */
  var circles = classG.append("circle")
                    .attr("id", "classes")
                    .attr("r", function(d) {
                      if (d.category !== "Math") {
                        return bigRadius
                      } else {
                        return smallRadius
                      }
                    })
                    .attr("cx", 0)
                    .attr("cy", 0)
                    .style("fill", function(d) {
                      if (d.category === "Math") {
                        return mathColor
                      } else if (d.category === "Elective") {
                        return electiveColor
                      } else if (d.category === "Consulting") {
                        return consultingColor
                      } else {
                        return reqColor
                      }
                    })
                    .on("mouseover", mouseoverClass)
                    .on("mouseout", function(d, i) { mouseOut(d, i, "class") })

  /* create a label for each class */
  var labels = classG.append("text")
                  .attr("x", function(d) {
                               if (d.category !== "Elective" && d.category !== "Consulting") {
                                 return labelsScale(d.abbrev.length)
                               } else {
                                 return 0.25*labelsScale(d.abbrev.length)
                               }
                             })
                  .attr("y", function(d) {
                               if (d.category !== "Elective" && d.category !== "Consulting") {
                                 return 0
                               } else {
                                 return 2*bigRadius
                               }
                             })
                  .attr("id", "classLabels")
                  .text(function(d) { return d.abbrev })

  /* create a label for each category */
  d3.select("g#classesMath")
    .append("text")
    .attr("x", -20)
    .attr("y", -50)
    .attr("id", "categoryLabels")
    .text("Math")
    .style("font-size", categoryFont)

  d3.select("g#classesLower")
      .append("text")
      .attr("x", -40)
      .attr("y", -50)
      .attr("id", "categoryLabels")
      .text("Lower Div")
      .style("font-size", categoryFont)

  d3.select("g#classes100")
    .append("text")
    .attr("x", -15)
    .attr("y", -50)
    .attr("id", "categoryLabels")
    .text("100")
    .style("font-size", categoryFont)

  d3.select("g#classes101")
    .append("text")
    .attr("x", -15)
    .attr("y", -50)
    .attr("id", "categoryLabels")
    .text("101")
    .style("font-size", categoryFont)

  d3.select("g#classes102")
    .append("text")
    .attr("x", -15)
    .attr("y", -50)
    .attr("id", "categoryLabels")
    .text("102")
    .style("font-size", categoryFont)

  d3.select("g#classesElective")
  .append("text")
  .attr("x", -130)
  .attr("y", 0)
  .attr("id", "categoryLabels")
  .text("Electives")
  .style("font-size", categoryFont)

  d3.select("g#classesConsulting")
  .append("text")
  .attr("x", -140)
  .attr("y", 0)
  .attr("id", "categoryLabels")
  .text("Consulting")
  .style("font-size", categoryFont)

  /* create viz-es of major and minor requirements */
  var majorReqG = d3.select("svg")
               .append("g")
               .attr("id", "majorReqs")
               .attr("transform", "translate(0," + majorY + ")")
  var minorReqG = d3.select("svg")
               .append("g")
               .attr("id", "minorReqs")
               .attr("transform", "translate(0," + parseInt(majorY + 60) + ")")

  makeReqsViz(majorReqG, 5, 11, 2, 2)
  makeReqsViz(minorReqG, 5, 8, 1, 0)

  majorReqG.append("text")
          .text("Major")
          .attr("x", 50)
          .attr("y", 5)
          .attr("class", "majorMinor")


  minorReqG.append("text")
          .text("Minor")
          .attr("x", 50)
          .attr("y", 5)
          .attr("class", "majorMinor")

  /* create quarter selectors */
  quarterG.append("text").attr("x", 0).attr("y", 0).attr("class", "selected").attr("id", "all")
          .text("All")
          .on("mouseover", function(d, i) { mouseoverQuarter(d, i, 0, "all") })
          .on("mouseout", function(d, i) {
                            mouseOut(d, i, "quarter")
                            d3.select(this).attr("class", "notSelected")
                            d3.select("text#all").attr("class", "selected")
                          })
  quarterG.append("text").attr("x", 0).attr("y", 35).attr("class", "notSelected"). attr("id", "fall")
          .text("Fall")
          .on("mouseover", function(d, i) { mouseoverQuarter(d, i, [1, 4, 5, 6, 8, 9], "fall") })
          .on("mouseout", function(d, i) {
                            mouseOut(d, i, "quarter")
                            d3.select("text#all").attr("class", "selected")
                            d3.select(this).attr("class", "notSelected")
                          })
  quarterG.append("text").attr("x", 0).attr("y", 70).attr("class", "notSelected").attr("id", "winter")
          .text("Winter")
          .on("mouseover", function(d, i) { mouseoverQuarter(d, i, [2, 4, 7, 8], "winter") })
          .on("mouseout", function(d, i) {
                            mouseOut(d, i, "quarter")
                            d3.select("text#all").attr("class", "selected")
                            d3.select(this).attr("class", "notSelected")
                          })
  quarterG.append("text").attr("x", 0).attr("y", 105).attr("class", "notSelected").attr("id", "spring")
          .text("Spring")
          .on("mouseover", function(d, i) { mouseoverQuarter(d, i, [3, 5, 7, 9], "spring") })
          .on("mouseout", function(d, i) {
                            mouseOut(d, i, "quarter")
                            d3.select("text#all").attr("class", "selected")
                            d3.select(this).attr("class", "notSelected")
                          })

  quarterG.append("text").attr("x", 0).attr("y", 140).attr("class", "notSelected").attr("id", "summer")
          .text("Summer")
          .on("mouseover", function(d, i) { mouseoverQuarter(d, i, [6, 8, 9], "summer") })
          .on("mouseout", function(d, i) {
                            mouseOut(d, i)
                            d3.select("text#all").attr("class", "selected")
                            d3.select(this).attr("class", "notSelected")
                          })

  /* implement: create viz-es of major and minor requirements */
  function makeReqsViz(G, numMath, numRequired, numElective, numConsulting) {
    for (var i = 0; i < numMath; i++) {
      G.append("circle")
               .attr("id", "mathreq" + (i+1))
               .attr("r", reqRadius)
               .attr("cx", 150 + i*2.3*reqRadius)
               .attr("cy", 0)
               .style("fill", mathColor)
    }
    for (var i = 0; i < numRequired; i++) {
      G.append("circle")
               .attr("id", "req" + (i+1))
               .attr("r", reqRadius)
               .attr("cx", (150 + numMath*2.3*reqRadius) + (i*2.3*reqRadius))
               .attr("cy", 0)
               .style("fill", reqColor)
    }

    for (var i = 0; i < numElective; i++) {
      G.append("circle")
               .attr("id", "electivereq" + (i+1))
               .attr("r", reqRadius)
               .attr("cx", (150 + numMath*2.3*reqRadius) + (numRequired*2.3*reqRadius) + (i*2.3*reqRadius))
               .attr("cy", 0)
               .style("fill", electiveColor)
    }
    for (var i = 0; i < numConsulting; i++) {
      majorReqG.append("circle")
               .attr("id", "consultingreq" + (i+1))
               .attr("r", reqRadius)
               .attr("cx", (150 + numMath*2.3*reqRadius) + (numRequired*2.3*reqRadius) + (numElective*2.3*reqRadius) + (i*2.3*reqRadius))
               .attr("cy", 0)
               .style("fill", consultingColor)
    }

  }

  /* implement: create animation when mouse is over a class */
  function mouseoverClass(d, i) {
    var links = getRelations(d, i)
    var linksCount = links.length
    var selectSelf = classG.filter(function(p) { return p.class === d.class })
    var selectHide = classG.filter(function(p) {
                                      if (linksCount === 0) {
                                        return p.class !== d.class
                                      } else if (linksCount === 1) {
                                        return p.class !== d.class &&
                                               p.class !== links[0].source.class
                                      } else if (linksCount === 2) {
                                        return p.class !== d.class &&
                                               p.class !== links[0].source.class &&
                                               p.class !== links[1].source.class
                                      } else if (linksCount === 3) {
                                        return p.class !== d.class &&
                                               p.class !== links[0].source.class &&
                                               p.class !== links[1].source.class &&
                                               p.class !== links[2].source.class
                                      } else if (linksCount > 3) {
                                        console.log("More than 3 prereqs!")
                                      }
                                  })
    var selectKeep = classG.filter(function(p) {
                                      if (linksCount === 0) {
                                        return p.class === d.class
                                      } else if (linksCount === 1) {
                                        return p.class === d.class ||
                                               p.class === links[0].source.class
                                      } else if (linksCount === 2) {
                                        return p.class === d.class ||
                                               p.class === links[0].source.class ||
                                               p.class === links[1].source.class
                                      } else if (linksCount === 3) {
                                        return p.class === d.class ||
                                               p.class === links[0].source.class ||
                                               p.class === links[1].source.class ||
                                               p.class === links[2].source.class
                                      } else if (linksCount > 3) {
                                        console.log("More than 3 prereqs!")
                                      }
                                   })
    selectHide.selectAll("circle")
                .transition()
                .duration(transitionDuration)
                .style("opacity", 0)

    var allCategories = [ "classesMath", "classesLower", "classes100", "classes101",
                "classes102", "classesElective", "classesConsulting"]

    var keepTheseCategories = []
    for (var i = 0; i < selectKeep[0].length; i++) {
      keepTheseCategories[i] = selectKeep[0][i].id
    }

    var hideTheseCategories = allCategories.filter(function(x) { return keepTheseCategories.indexOf(x) < 0 })

    selectSelf.select("circle")
              .transition()
              .duration(transitionDuration)
              .style("stroke", "gray")
              .style("stroke-width", function(p) {
                                       if (p.category !== "Math") {
                                         return "7px"
                                       } else {
                                         return "4px"
                                       }
                                     })

    selectHide.selectAll("text#classLabels")
                .transition()
                .duration(transitionDuration)
                .style("opacity", 0)

    for (var i = 0; i < hideTheseCategories.length; i++) {
      d3.select("g#" + hideTheseCategories[i])
        .select("text#categoryLabels")
        .transition()
        .duration(transitionDuration)
        .style("opacity", 0)
    }

    d3.selectAll("g#quarters")
      .transition()
      .duration(transitionDuration)
      .style("opacity", 0)

    d3.select("svg")
      .append("g")
      .attr("id", "info")
      .attr("transform", "translate(0, 0)")

    d3.select("g#info")
      .append("text")
      .text(d.class + " : " + d.name)
      .attr("x", 50)
      .attr("y", 50)
      .attr("class", "info_name")

    d3.select("g#info")
      .append("text")
      .text(linksCount == 0 ? "no prereq!" : linksCount + (linksCount > 1 ? " prereqs" : " prereq"))
      .attr("x", 400)
      .attr("y", horizontalY - 70)
      .attr("class", "info_req")
  }

  /* implement: create animation when mouse is out of a class OR a quarter */
  function mouseOut(d, i, classOrQuarter) {
    if (classOrQuarter === "class") {
      var selectSelf = classG.filter(function(p) { return p.class === d.class })
      d3.selectAll("g#quarters")
        .transition()
        .duration(transitionDuration)
        .style("opacity", 1)
      d3.select("g#info")
        .remove()
    } else {
      var selectSelf = quarterG.filter(function(p) { return p.class === d.class })
    }

    classG.selectAll("circle#classes")
        .transition()
        .duration(transitionDuration)
        .style("opacity", 1)


    selectSelf.select("circle#classes")
              .transition()
              .duration(transitionDuration)
              .style("stroke", "none")

    classG.selectAll("text#classLabels")
        .transition()
        .duration(transitionDuration)
        .style("opacity", 1)

    d3.selectAll("text#categoryLabels")
      .transition()
      .duration(transitionDuration)
      .style("opacity", 1)
  }

  /* implement: show data based on selected quarter */
  function mouseoverQuarter(d, i, selection, quarter) {
    d3.select("text#" + quarter).attr("class", "selected")
    if (selection !== 0) {
      d3.select("text#all").attr("class", "notSelected")
      var selectHide = classG.filter(function(p) { return selection.indexOf(p.term) < 0 && p.term !== 0 })
      selectHide.selectAll("circle")
                  .transition()
                  .duration(transitionDuration)
                  .style("opacity", 0)

      selectHide.selectAll("text#classLabels")
                .transition()
                .duration(transitionDuration)
                .style("opacity", 0)
    }
  }

  /* implement: determine where to place each class */
  function setPositions(nodes) {
    for (i in nodes) {
        if (nodes[i].category === "Math") {
          nodes[i].x = 150
          nodes[i].y = 150 + i * smallVerticalDist
        } else if (nodes[i].category === "Lower") {
          nodes[i].x = 300
          nodes[i].y = 150 + (i-numMath) * bigVerticalDist
        } else if (nodes[i].category === "100") {
          nodes[i].x = 450
          nodes[i].y = 150 + (i-(numMath+numLower)) * 70
        } else if (nodes[i].category === "101") {
          nodes[i].x = 600
          nodes[i].y = 150 + (i-(numMath+numLower+num100)) * bigVerticalDist
        } else if (nodes[i].category === "102") {
          nodes[i].x = 750
          nodes[i].y = 150 + (i-(numMath+numLower+num100+num101)) * bigVerticalDist
        } else if (nodes[i].category === "Elective") {
          nodes[i].x = 200 + (i-(numMath+numRequired)) * horizontalDist
          nodes[i].y = horizontalY
        } else if (nodes[i].category === "Consulting") {
          nodes[i].x = 200 + (i-(numMath+numRequired+numElective)) * horizontalDist
          nodes[i].y = horizontalY + 100
        }
      }
  }

  /* implement: hash class nodes */
  function hashClasses() {
    for (i in classes) {
      nodeHash[classes[i].class] = classes[i]
    }
    for (i in relations) {
      if (relations[i].requirement === "Enforced") {
        relations[i].weight = 2.5
      } else if (relations[i].requirement === "Choice") {
        relations[i].weight = 1.5
      } else {
        relations[i].weight = 1
      }
      relations[i].source = nodeHash[relations[i].source]
      relations[i].target = nodeHash[relations[i].target]
    }
  }

  /* implement: get prereqs of a class */
  function getRelations(d, i) {
    var links = []
    var linksCount = 0
    for (i in relations) {
      if (nodeHash[d.class] === relations[i].target) {
        links[linksCount] = relations[i]
        linksCount++
      }
    }
    return links
  }

}
