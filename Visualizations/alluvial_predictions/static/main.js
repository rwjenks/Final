/**
 Copyright (c) 2015 BrightPoint Consulting, Inc.

 Permission is hereby granted, free of charge, to any person
 obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without
 restriction, including without limitation the rights to use,
 copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following
 conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.
 */
main = function main() {
    var linkFillOpacity = 0;
    var linkStrokeOpacity = 0;
    var rectFillOpacity = 0.4;
    var fadeOpacity = .1;
    var rectStrokeOpacity = 0;
    var textFillOpacity = 1;
    var chartTop = 100;

    var gameTip = d3.select("#game");
    var gameWinnder = d3.select("#winner");
    var gameWinnerName = d3.select("#game_winner_name");
    var gameWinnerImg = d3.select("#game_winner_img");
    var gameWinnerProb = d3.select("#game_winner_prob");

    var gameLoser = d3.select("#loser");
    var gameLoserName = d3.select("#game_loser_name");
    var gameLoserImg = d3.select("#game_loser_img");
    var gameLoserProb = d3.select("#game_loser_prob");


    var availWidth = window.innerWidth - 30;

    var margin = {top: 0, right: 50, bottom: 10, left: 50},
        width = Math.max(availWidth, 800) - margin.left - margin.right,
        height = 1440 - margin.top - margin.bottom;

    var formatNumber = d3.format(",.0f"),    // 1 decimal place
        format = function (d) {
            return formatNumber(d) + " " + units;
        },
        color = d3.scale.category20();

// append the svg canvas to the page
    var svg = d3.select("#chart").append("svg").style("overflow", "visible")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);


    var gTop = svg.append("g")
        .attr("transform",
        "translate(" + margin.left + "," + (margin.top) + ")");


    var g = svg.append("g")
        .attr("transform",
        "translate(" + margin.left + "," + (margin.top + chartTop) + ")");

// Set the alluvial diagram properties
    var alluvial = d3.alluvial()
        .nodeWidth(8)
        .nodePadding(10)
        .size([width, height - chartTop]);

    var path = alluvial.link();


// load the data
    d3.json("nba_teams.json", function (error, data) {

        var games = [];
        var teams = {};


        data.teams.forEach(function (team) {
            teams[team.key] = team;
            //console.log(teams[team.key])
        });

        d3.csv("nba_games.csv", function (csv) {

            games = [];
            csv.forEach(function (row) {
                game = {};
                game.round = Number(row.round);
                game.away = row.away;
                game.home = row.home;
                game.away_prob = (row.away_prob);
                game.home_prob = (row.home_prob);
                game.awayWL = row.awayWL;
                game.homeWL = row.homeWL;
                games.push(game);
                //console.log(game)
            });

            alluvial.data(games)
                .layout();


            var links = alluvial.links();
            var nodes = alluvial.nodes();
            var roundOffsets = alluvial.hOffsets();

            var rounds = gTop.selectAll(".topLabel")
                .data(roundOffsets)
                .enter();

            rounds.append("text")
                .style("fill", "#1976D2")
                .style("font-weight", 400)
                .style("text-anchor", "middle")
                .attr("class", "roundLabel")
                .attr("y", 15 - margin.top)
                .attr("x", function (d) {
                    return d;
                })
                .text("round");

            rounds.append("text")
                .style("fill", "#1976D2")
                .style("font-weight", 400)
                .style("text-anchor", "middle")
                .attr("class", "roundLabel")
                .attr("y", 35 - margin.top)
                .attr("x", function (d) {
                    return d;
                })
                .text(function (d, i) {
                    return (i + 1);
                });

            var link = g.append("g").selectAll(".link")
                .data(links)
                .enter().append("path")
                .attr("class", function (d) {
                    return "link " + d.key
                })
                .attr("d", path)
                .style("fill", function (d) {
                    return getTeamColor(d.key)
                })
                .style("fill-opacity", linkFillOpacity)
                .style("stroke", function (d) {
                    return getTeamColor(d.key)
                })
                .style("stroke-width", .5)
                .style("stroke-opacity", linkStrokeOpacity);
            // .on("mouseover",function (d) { link_onMouseOver(d.source) })
            // .on("mouseout",function (d) { link_onMouseOut(d.source) });


            var node = g.append("g").selectAll(".node")
                .data(nodes)
                .enter().append("g")
                .attr("class", "node")
                .attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });

            node.append("rect")
                .attr("class", function (d) {
                    return "game " + d.key + " " + d.gameKey
                })
                .attr("height", function (d) {
                    return d.dy;
                })
                .attr("width", alluvial.nodeWidth())
                .style("fill", function (d) {
                    return getTeamColor(d.key)
                })
                .style("fill-opacity", function (d) {
                    return (d.value < 0.5) ? rectFillOpacity : .8
                })
                .style("stroke", function (d) {
                    return getTeamColor(d.key)
                })
                .style("stroke-opacity", rectStrokeOpacity)
                .on("mouseover", function (d) {
                    link_onMouseOver(d)
                })
                .on("mouseout", function (d) {
                    link_onMouseOut(d)
                });

            node.append("text")
                .attr("x", -6)
                .attr("class", function (d) {
                    return "game " + d.gameKey + " " + d.key
                })
                .attr("y", function (d) {
                    return d.dy / 2;
                })
                .attr("dy", ".35em")
                .style("font-weight", function (d) {
                    return (d.value < 0.5) ? 200 : 700
                })
                .style("fill-opacity", textFillOpacity)
                .attr("text-anchor", "end")
                .style("font-size", "10px")
                .style("fill", function (d) {
                    return getTeamColor(d.key)
                })
                .attr("transform", null)
                .text(function (d) {
                    return d.key
                })
                .on("mouseover", function (d) {
                    link_onMouseOver(d)
                })
                .on("mouseout", function (d) {
                    link_onMouseOut(d)
                });


            function link_onMouseOver(d) {

                d3.selectAll("path." + d.key)
                    .transition()
                    .style("fill-opacity", .3);

                g.selectAll("rect")
                    .filter(function () {
                        return ((this.__data__.key != d.key))
                    })
                    .transition()
                    .style("fill-opacity", fadeOpacity);

                g.selectAll("rect")
                    .filter(function () {
                        return ((this.__data__.opponent == d.key))
                    })
                    .transition()
                    .style("fill-opacity", .25);


                var thisGames = g.selectAll("text." + d.key).data();

                g.selectAll("text")
                    .filter(function () {
                        return (this.__data__.key != d.key && this.__data__.opponent != d.key)
                    })
                    .transition()
                    .style("fill-opacity", fadeOpacity);

                var top = 110

                gameTip.style("top", function () {
                    var r = ((d.value > .49) ? d.y + margin.top + 140 : d.y + margin.top + 140 - (20 - d.dy))
                    // if (r < 70) r =  top;
                    return r + "px"
                })
                    .style("left", function () {
                        return Math.min(width-130,Math.max(d.x -37,200)) + "px";
                    });

                
                //  if (gameTip.style("top") == top + "px") {
                //  gameLoser.style("right",0).style("top","0px");
                //  gameTip.style("left", (d.x-50) + "px")
                //  console.log("here it is")
                //  }
                 

                gameTip.transition().style("opacity", 1);

                var winner, loser;
                var winVal, loseVal;

                if (d.value != "L") {
                    winner = teams[d.key];
                    loser = teams[d.opponent];
                    //winVal = d.value;
                    winVal = d.wL;
                    //winVal = "Winner";
                    //loseVal = d.opponentValue;
                    loseVal = d.opponentWL;
                    //loseVal = "Loser";
                // }
                // else {
                //     winner = teams[d.opponent];
                //     loser = teams[d.key];
                    //winVal = d.opponentValue;
                    //winVal = "Loser";
                    //winVal = "Winner";
                    //loseVal = d.value;
                    //loseVal = "Winner";
                    //loseVal = "Loser";
                }
                

//right now, it thinks game winner is whoever is on the left side of tip and loser os whoever is on the right
                gameWinnerName.text(winner.name).style("color", winner.color);
                gameWinnerProb.text((winVal)).style("color", winner.color);
                gameWinnerImg.attr("src", "logos/" + winner.key + ".png");

                gameLoserName.text(loser.name).style("color", loser.color);
                gameLoserProb.text((loseVal)).style("color", loser.color);
                gameLoserImg.attr("src", "logos/" + loser.key + ".png");

                gTop.selectAll(".roundLabel")
                    .transition()
                    .style("font-weight", function (dd, i) {
                        return (i == d.round || i == d.round + 4) ? "bold" : "normal"
                    })
                    .style("font-size", function (dd, i) {
                        return (i == d.round || i == d.round + 4) ? "16px" : "12px"
                    });


            }

            function link_onMouseOut(d) {

                d3.selectAll("path")
                    .transition()
                    .style("fill-opacity", linkFillOpacity);

                g.selectAll("rect")
                    .transition()
                    .style("fill-opacity", function (d) {
                        return (d.value < 0.5) ? rectFillOpacity : .8
                    });

                g.selectAll("text")
                    .transition()
                    .style("fill-opacity", textFillOpacity);

                gTop.selectAll(".headerLabel").transition().style("opacity", 0);

                gTop.selectAll(".roundLabel")
                    .transition()
                    .style("font-weight", "normal")
                    .style("font-size", "12px");


                gameTip.transition().style("opacity", 0);


            }


            function getLinkOpacity(d) {
                if (d.wins == 0)
                    return .05;
                else
                    return d.wins / 5;
            }


            function getTeamColor(key) {

                return teams[key].color;
            }


        });

    });
}();

