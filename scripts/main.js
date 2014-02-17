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
    });
});