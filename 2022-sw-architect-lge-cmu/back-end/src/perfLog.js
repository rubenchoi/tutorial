let perflog = [

    // { id: "user1", platenumber: 'LDX1939', start:1657671335000 , end :1657671535000 , result: 'exact' },
    // { id: "user1", platenumber: 'ADX1939', start:1657671335000 , end :1657671535000 , result: 'no' },
    // { id: "user2", platenumber: 'BDX1939', start:1657671335000 , end :1657671535000 , result: 'exact' },
    // { id: "user4", platenumber: 'CDX1939', start:1657671335000 , end :1657671535000 , result: 'no' },
    // { id: "user2", platenumber: 'LDX1939', start:1657671335000 , end :1657671535000 , result: 'exact' },
    // { id: "user1", platenumber: 'TDX1939', start:1657673034000 , end :1657671535000 , result: 'partial' },
    // { id: "user3", platenumber: 'HDX1939', start:1657671335000 , end :1657671535000 , result: 'partial' },
    // { id: "user3", platenumber: 'JDX1939', start:1657673034000 , end :1657671535000 , result: 'partial' },
    // { id: "user1", platenumber: 'IDX1939', start:1657671335000 , end :1657671535000 , result: 'exact' },
    // { id: "user1", platenumber: 'LDX1939', start:1657671335000 , end :1657671535000 , result: 'no' },
    // { id: "user2", platenumber: 'LAX1939', start:1657673034000 , end :1657671535000 , result: 'exact' },
    // { id: "user1", platenumber: 'LBX1939', start:1657671335000 , end :1657671535000 , result: 'partial' },
    // { id: "user4", platenumber: 'LCX1939', start:1657673034000 , end :1657671535000 , result: 'exact' },
    // { id: "user3", platenumber: 'LTX1939', start:1657673034000 , end :1657671535000 , result: 'no' },
    // { id: "user1", platenumber: 'LNX1939', start:1657671335000 , end :1657671535000 , result: 'exact' },
];

let testmode = false;
let testTimestamp = 1657673378249;    

function groupArrayOfObjects(list, key) {
  return list.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

var addPerfLog = ( userid, carplatenumber, startDate, endDate, match_result ) => {
    perflog.push( { id: userid, platenumber: carplatenumber, start:startDate , end :endDate , result: match_result } ) 
}

var clearPefLog = () => {
    perflog.splice(0, perflog.length);
}

var averageNumOfQueriesPerEachuser = (logSet) => {
    let result = [];

    let groupedId = groupArrayOfObjects(logSet,"id");
    for ( var key in groupedId ){
        result.push( { id: key, count:groupedId[key].length })
    }
    return result;
}

var averageNumOfQueriesAll = (logSet) => {
    return filtered.length;
}

var numberOfExactMatchPerUser = (logSet) => {
    let result = [];
    let filtered = logSet.filter(it => { return it.result.includes('exact') } );
    let groupedId = groupArrayOfObjects(filtered,"id");
    for ( var key in groupedId ){
        result.push( { id: key, count:groupedId[key].length })
    }
    return result;
}

var numberofExactMatchAll = (logSet) => {
    let filtered = logSet.filter(it => { return it.result.includes('exact') } );
    return filtered.length;
}

var numberofPartialMatchPerUser = (logSet) => {
    let result = [];
    let filtered = logSet.filter(it => { return it.result.includes('partial') } );
    let groupedId = groupArrayOfObjects(filtered,"id");
    for ( var key in groupedId ){
        result.push( { id: key, count:groupedId[key].length })
    }
    return result;
}

var numberofPartialMatchAll = (logSet) => {
    let filtered = logSet.filter(it => { return it.result.includes('partial') } );
    return filtered.length;
}

var numberofNoMatchPerUser = (logSet) => {
    let result = [];
    let filtered = logSet.filter(it => { return it.result.includes('no') } );
    let groupedId = groupArrayOfObjects(filtered,"id");
    for ( var key in groupedId ){
        result.push( { id: key, count:groupedId[key].length })
    }
    return result;
}

var numberofNoMatchAll = (logSet) => {
    let filtered = logSet.filter(it => { return it.result.includes('no') } );
    return filtered.length;
}

var performanceSummary = () => {
    let filtered = perflog.filter(it => { return it.start >  (new Date().getTime() - 1800000) } );

    if (testmode)
        filtered = perflog.filter(it => { return it.start >  (testTimestamp - 1800000) } );

    var groupedId =groupArrayOfObjects(filtered,"id");
    
    let exactPerUser =  numberOfExactMatchPerUser(filtered);
    let partialPerUser = numberofPartialMatchPerUser(filtered);
    let nomatchPerUser = numberofNoMatchPerUser(filtered);
    
    let result = [];

    for ( var key in groupedId ){
        console.log( key, groupedId[key].length );
        var exactPerUserCount = 0;
        var exactPerUserObject = exactPerUser.filter( it => it.id.includes(key) ).map(it => it.count );    
        if ( exactPerUserObject.length > 0)
            exactPerUserCount = exactPerUserObject[0];

        
        var partialPerUserCount = 0;
        var partialPerUserObject = partialPerUser.filter( it => it.id.includes(key) ).map(it => it.count ); 
        if ( partialPerUserObject.length > 0)
            partialPerUserCount = partialPerUserObject[0];
       
        var nomatchPerUserCount = 0;
        var nomatchPerUserObject = nomatchPerUser.filter( it => it.id.includes(key) ).map(it => it.count );  
        if ( nomatchPerUserObject.length > 0)
            nomatchPerUserCount = nomatchPerUserObject[0];

        result.push( { id: key, number_total_query: groupedId[key].length 
                    , number_exact_match: exactPerUserCount
                    , number_partial_match: partialPerUserCount
                    , number_no_match: nomatchPerUserCount
                 })
    }
    return result;

}

export { addPerfLog, clearPefLog, performanceSummary};
