d3.alluvial = function() {

    var nodes;
    var links;
    var data;
    var rounds;
    var xOffset;
    var yOffset;
    var hOffsets=[];
    var nodeHeight = 50;
    var nodePadding = 10;
    var nodePaddingPercent= .01;

    var alluvial = {},
        nodeWidth = 8,
        nodePadding = 8,
        size = [1, 1],
        nodes = [],
        links = [];

    alluvial.data = function(_) {
        if (!arguments.length) return _data;
        _data = _;
        return alluvial;
    };


    alluvial.nodeHeight = function(_) {
        if (!arguments.length) return nodeHeight;
        return alluvial;
    };

    alluvial.nodeWidth = function(_) {
        if (!arguments.length) return nodeWidth;
        nodeWidth = +_;
        return alluvial;
    };

    alluvial.nodePadding = function(_) {
        if (!arguments.length) return nodePadding;
        nodePadding = +_;
        return alluvial;
    };

    alluvial.nodes = function(_) {
        if (!arguments.length) return nodes;
        nodes = _;
        return alluvial;
    };

    alluvial.links = function(_) {
        if (!arguments.length) return links;
        links = _;
        return alluvial;
    };

    alluvial.size = function(_) {
        if (!arguments.length) return size;
        size = _;
        return alluvial;
    };

    alluvial.hOffsets = function () {
        return hOffsets;
    }

    alluvial.xOffset = function () {
        return xOffset;
    }

    alluvial.layout = function() {
        computeNodeLinks();
    //    computeNodeValues();
    //    computeNodeBreadths();
    //    computeNodeDepths(iterations);
   //     computeLinkDepths();
        return alluvial;
    };

    alluvial.relayout = function() {
       // computeLinkDepths();
        return alluvial;
    };

    alluvial.link = function() {
        var curvature = .5;

        function link(d) {
            var x0 = d.source.x + d.source.dx,
                x1 = d.target.x,
                xi = d3.interpolateNumber(x0, x1),
                x2 = xi(curvature),
                x3 = xi(1 - curvature),
                y0 = d.source.y,
                y1 = d.target.y;

            var p = "M " + x0 + "," + y0
                + " C " + x2 + ", " + y0
                + " " + x3 + ", " + y1
                + " " + x1 + ", " + y1
                + " L " + x1 + ", " + (y1 + d.tdy)
                + " C " + x2 + ", " + (y1 + d.tdy)
                + " " + x2 + ", " + (y0 + d.sdy)
                + " " + x0 + ", " + (y0 + d.sdy)
                + " L " + x0 + "," + y0;

            return p;
        }

        link.curvature = function(_) {
            if (!arguments.length) return curvature;
            curvature = +_;
            return link;
        };

        return link;
    };

    // Populate the sourceLinks and targetLinks for each node.
    // Also, if the source and target are not objects, assume they are indices.
    function computeNodeLinks() {

        links = [];
        nodes = [];
        rounds = [];

        var gameIndex;

        _data.forEach( function (game) {

            if (game.round > rounds.length-1)  {
                rounds.push([]);
                gameIndex=0;
            }

            node = {}
            node.pointSpread = game.point_spread;
            node.wL = game.awayWL;
            node.opponentWL = game.homeWL;
            node.key = game.away;
            node.value = game.away_prob;
            node.opponentValue = game.home_prob;
            node.gameKey = game.home + "_" + game.away + "_w" + game.round ;
            node.round = game.round;
            node.opponent = game.home;
            node.game = game;
            node.win = (game.away_prob >=.5) ? 1 : 0;
            node.totalWins = 0;
            node.type = "away";
            node.gameIndex=gameIndex;
            node.sourceLinks = [];
            node.targetLinks = [];
            nodes.push(node);

            rounds[node.round].push(node);

            node = {}
            node.pointSpread = game.point_spread;
            node.wL = game.homeWL;
            node.opponentWL = game.awayWL;
            node.key = game.home;
            node.opponent = game.away;
            node.opponentValue = game.away_prob;
            node.gameKey = game.home + "_" + game.away + "_w" + game.round ;
            node.value = game.home_prob;
            node.round = game.round;
            node.game = game;
            node.type = "home";
            node.win = (game.home_prob >=.5) ? 1 : 0;
            node.gameIndex = gameIndex;
            node.totalWins = 0;
            node.sourceLinks = [];
            node.targetLinks = [];
            nodes.push(node);

            rounds[node.round].push(node);

            gameIndex++;
        });

        nodePadding = size[1] * nodePaddingPercent;
        nodeHeight= (size[1]-(rounds[0].length * nodePadding))/(rounds[0].length);
        xOffset = (size[0]-nodeWidth)/(rounds.length-1);
        yOffset = nodeHeight + nodePadding;

        var i=0;
        rounds.forEach(function (round) {
            hOffsets.push(i * xOffset);
            i++;
        });

        nodes.forEach(function(node) {

            node.sourceLinks = getSourceLinks(node,node.round);
            node.targetLinks = getTargetLinks(node,node.round);
            node.x = node.round * xOffset;
            node.dx = nodeWidth;

            if (node.value >= .5) {
                node.y = (node.gameIndex-1) * (nodeHeight + nodePadding);
            }
            else {
                node.y = (node.gameIndex-1) * (nodeHeight + nodePadding) + (nodeHeight*(1-node.value)) + 1;
            }

            node.dy = nodeHeight * node.value;

        });


        nodes.forEach(function (node) {
            if (node.round < rounds.length-1) {
                var t = getTargetLinks(node,node.round);
                if (t.length > 0 ) {
                    var link={}
                    link.source = node;
                    link.target = t[0]
                    link.sy = link.source.y;
                    link.ty = link.target.y;
                    link.sdy = link.source.dy;
                    link.tdy = link.target.dy;
                    link.dy = node.dy;
                    link.key = node.key;
                    link.value = link.target.value;
                    link.target.totalWins = link.source.totalWins + link.target.win;
                    link.wins = link.target.totalWins;
                    links.push(link);
                }
            }
        });


        function getTargetLinks(node,round) {
            if (round+1 > rounds.length-1 ) {
              //  console.log("returning empty links");
                return [];
            }
            var w = rounds[round+1];  //Get next round and find corresponding node
            var linkNode = w.filter(function (val) {
                if (node.key == val.key)
                    return true;
                else
                    return false;});

            if (linkNode.length < 1) {
                linkNode = getTargetLinks(node,round+1);
                    if (round+1 == rounds.length-1) {
                        return [];
                    }
                    else {
                        return linkNode;
                    }
            }
            else {
                return linkNode;
            }
        }

        function getSourceLinks(node,round) {
            if (node.round < 1) {
                return [];
            }
            var w = rounds[round-1];  //Get next round and find corresponding node
            console.log(w)
            var linkNode = w.filter(function (val) {
                if (node.key == val.key)
                    return true;
                else
                    return false;});

            if (linkNode.length < 1) {
                linkNode =  getSourceLinks(node,round-1);
                if (linkNode.length < 1) {
                    console.log("source - can't find team " + node.key + " in round " + (round-1));
                }
                return linkNode;
            }
            else {
                return linkNode;
            }
        }

    }

    // Compute the value (size) of each node by summing the associated links.
    function computeNodeValues() {
        nodes.forEach(function(node) {
            node.value = Math.max(
                d3.sum(node.sourceLinks, value),
                d3.sum(node.targetLinks, value)
            );
        });
    }


    function value(link) {
        return link.value;
    }

    return alluvial;
};





