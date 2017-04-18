var express = require('express');
var router = express.Router();
var request = require('request');
var promise = require('promise');
var qs = require('qs');

/* Api will fetch character using name from swapi. */
router.get('/:name', function(req, res, next) {
    var name = req.params.name;
    getCharacterByName(name)
        .then(function(data) {
            res.render('character', { data: data.results, searchString: name });
        }).catch(function(error) {
            res.render('character', {
                data: [],
                message: 'No response returned from swapi',
                searchString: name
            });
        });
});

// return promise when get response from swapi
function getCharacterByName(name) {
    return new promise(function(resolve, reject) {
        request.get({
                url: "https://swapi.co/api/people",
                qs: { search: name }
            },
            function(error, response, body) {
                // console.log('error:', error); // Print the error if one occurred 
                // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
                // console.log('body:', body); // Print the HTML for the Google homepage. 
                if (body && JSON.parse(body).count > 0) {
                    resolve(JSON.parse(body));
                } else {
                    reject(error);
                }

            });
    });
}

/* Api will fetch character using name from swapi. */
router.get('/', function(req, res, next) {
    var page = req.query.page;
    var sort = req.query.sort;
    var dataObject = [];
    
    getCharacterCount().then(function(count) {
        var reminder = count % 10;
        var pageCount = Math.floor(count / 10);

        if(reminder>0){
            pageCount = pageCount+1;
        }

        forLoopPromise(pageCount).then(function(dataObject) {
            dataObject.sort(function(a, b) {
                if (sort === 'name') {
                    return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);
                }
                if (sort === 'height') {
                    return (a.height - b.height);
                }
            });
            var resultArray = [];
            for(var loop=0;loop<50;loop++){
                resultArray[loop]=dataObject[loop];
            }
            res.send({
                data: resultArray,
                sort: sort
        });

        });
    }).catch(function(error) {
        res.send({
            data: [],
            message: 'No response returned from swapi',
            searchString: sort
        });
    });
});


/*ForloopPromise Function will add page based results and return an array which is sum of all page results*/
function forLoopPromise(pageCount) {
    return new promise(function(resolve, reject) {
        var counter = 0;
        for (var loop = 0; loop < pageCount; loop++) {

            var alphaFlag = false;
            getCharacters(loop+1).then(function(characters) {
                
                var data     = characters.results;
                var flag     = 1;
                var next     = null;
                var previous = null;

                if(characters.next != null){
                    next = characters.next.substr(characters.next.length-1,1);
                }
                
                if(characters.previous != null){
                    previous = characters.previous.substr(characters.previous.length-1,1);
                }
                

                if(next == null){
                    flag = pageCount;
                }  
                if(previous == null){
                    flag = 1;
                }
                if(next != null && previous != null){
                    flag = parseInt(next)-1;
                }

                if(flag == 1){
                    if(!alphaFlag){
                        dataObject = data;
                        alphaFlag = true; 

                    }else{
                        dataObject =  concatArrays(dataObject,data); 
                    }                    
                                     
                }else{
                    
                    if(!alphaFlag){
                        dataObject = data;
                        alphaFlag = true;
                    }
                    else{
                        dataObject =  concatArrays(dataObject,data); // dataObject.concat(characters);
                    }
                    
                }

                counter++;
                if (counter === pageCount) {
                    return resolve(dataObject);
                }
            }).catch(function(error) {
                res.send({
                    data: [],
                    message: 'No response returned from swapi',
                    searchString: sort
                });
            });
        }
    });
}


/*Return the characters array with size =10 on the basis of page number passed from swapi*/
function getCharacters(page) {
   
    return new promise(function(resolve, reject) {
        request.get({
                url: "https://swapi.co/api/people",
                qs: { page: page }
            },
            function(error, response, body) {
                if (body && JSON.parse(body).count > 0) {
                    var data = JSON.parse(body);
                    var characters = data;
                   
                    resolve(characters);
                } else {
                    reject(error);
                }
            });
    });
}

// return promise when get response from swapi
function getCharacterCount() {
    return new promise(function(resolve, reject) {
        request.get({
            url: "https://swapi.co/api/people"
        }, function(error, response, body) {            
            if (body && JSON.parse(body).count > 0) {
                var data = JSON.parse(body);
                var count = data.count;
                
                resolve(count);
            } else {
                reject(error);
            }
        });
    });
}


function concatArrays(array1,array2){

    var finalArray = [];
    for(let u = 0; u < array1.length; u++){
        finalArray[u]=array1[u];
    }

    for(let zVar = 0; zVar < array2.length ; zVar++){
        var indexForInsert = parseInt(array1.length) + parseInt(zVar);
        finalArray[indexForInsert] = array2[zVar];
    }
    
    return finalArray;

}

module.exports = router;