define(['scripts/d3.v3','scripts/elasticsearch'], function(d3, elasticsearch){
    "use strict";
    var client = new elasticsearch.Client();

    client.search({
        index: 'nfl',
        size: 5,
        body: {
            // begin query
            query: {
                // boolean query for matching and excluding terms
                bool: {
                    must: { match: { "description": "TOUCHDOWN" }},
                    must_not: {match: { "qtr" : 5 }}
                }
            },
            // aggregate on the results
            aggs: {
                touchdowns: {
                    terms: {
                        field: "qtr",
                        // order by quarter, ascending
                        order: {"_term": "asc"}
                    }
                }
            }
            // end query
        }
    }).then(function(resp) {
        console.log(resp);

        // D3 code goes here
        var touchdowns = resp.aggregations.touchdowns.buckets;

        // d3 donut chart
        var width = 600,
            height = 300,
            radius = Math.min(width, height) / 2;

        var color = ['#ff7f0e', '#d62728', '#2ca02c', '#1f77b4'];

        var arc = d3.svg.arc()
            .outerRadius(radius - 60)
            .innerRadius(120);

        var pie = d3.layout.pie()
            .sort(null)
            .value(function (d) { return d.doc_count; });

        var svg = d3.select("#donut-chart").append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 1.4 + "," + height / 2 + ")");

        var g = svg.selectAll(".arc")
            .data(pie(touchdowns))
            .enter()
            .append("g")
            .attr("class","arc");

        g.append("path")
            .attr("d", arc)
            .style("fill", function (d,i) { return color[i]; });

        g.append("text")
            .attr("transform", function (d) {return "translate(" + arc.centroid(d) + ")"; })
            .attr("dy", ".35em")
            .style("text-anchor", "middle")
            .style("fill", "white")
            .text(function (d) { return d.data.key; });

    });
});

define(['scripts/d3.v3', 'scripts/elasticsearch'], function (d3, elasticsearch) {
    "use strict";
    var client = new elasticsearch.Client();

    client.search({
        index: 'nfl',
        size: 5,
        body: {
            query: {
                bool: {
                    must: { match: { "description": "TOUCHDOWN" }},
                    must_not: [
                        { match: {"description": "intercepted"}},
                        { match: {"description": "incomplete"}},
                        { match: {"description": "FUMBLES"}},
                        { match: {"description": "NULLIFIED"}}
                    ]
                }
            },
            aggs: {
                teams: {
                    terms: {
                        field: "off",
                        exclude: "", // exclude empty strings
                        size: 5
                    },
                    aggs: {
                        players: {
                            terms: {
                                field: "description",
                                include: "([a-z]?[.][a-z]+)", // regex to pull out player names e.g. S.Ridley, P.Manning
                                size: 20 // limit to 20 players per team
                            },
                            aggs: {
                                qtrs: {
                                    terms: {
                                        field: "qtr"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }).then(function (resp) {
        console.log(resp);

        // d3 code goes here.
    });

});