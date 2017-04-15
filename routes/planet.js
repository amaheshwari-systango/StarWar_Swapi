var express = require('express');
var router = express.Router();
var request = require('request');
var promise = require('promise');
var qs = require('qs');
var url = require('url');

/* Api will fetch planet Info with residents on page basis from swapi. */
router.get('/planetresident', function(req, res, next) {
    var queryData = url.parse(req.url, true).query;
    getPlanetResidentInfo(queryData.page).then(function(data) {
        let resultArray = data.results;
        var resultObject = {};
        var counter = 0;
        var emptyResident = 0;
        for (let x = 0; x < resultArray.length; x++) {
            let jsonObject = resultArray[x];
            let name = jsonObject.name;
            let residents = jsonObject.residents;
            if (residents.length == 0) {
                resultObject[name] = [];
                emptyResident++;
            }
            var residentArray = [];            
            forloopPromise(residents).then(function(result) {
                resultObject[name] = result;
                counter++;
                if (counter === (resultArray.length - emptyResident)) {
                    console.log(resultObject);
                     res.send({ data: resultObject});
                }
            });
        }        
    }).catch(function(error) {
        console.log(error);
    });
});

function forloopPromise(residents) {
    return new promise(function(resolve, reject) {
        var residentArray = [];
        var counter = 0;
        for (let u = 0; u < residents.length; u++) {
            getCharacterNamebyId(residents[u]).then(function(data) {
                residentArray.push(data.name);
                counter++;
                if (counter === residents.length) {
                    return resolve(residentArray);
                }
            });
        }
    });
}

function getPlanetResidentInfo(pageNo) {
    return new promise(function(resolve, reject) {
        request('https://swapi.co/api/planets?page='+pageNo, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var bodyObj = JSON.parse(response.body);
                return resolve(bodyObj);
            }
        });
    });
}

function getCharacterNamebyId(url) {
    return new promise(function(resolve, reject) {
        request(url, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var bodyObj = JSON.parse(response.body);
                return resolve(bodyObj);
            }
        });
    });
}


module.exports = router;