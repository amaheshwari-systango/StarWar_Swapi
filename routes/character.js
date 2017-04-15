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
                console.log('error:', error); // Print the error if one occurred 
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
                console.log('body:', body); // Print the HTML for the Google homepage. 
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
    getCharacters(sort, page)
        .then(function(characters) {
            res.send({ data: characters, searchString: sort });
        }).catch(function(error) {
            res.send({
                data: [],
                message: 'No response returned from swapi',
                searchString: sort
            });
        });
});


// return promise when get response from swapi
function getCharacters(sort, page) {
    return new promise(function(resolve, reject) {
        request.get({
                url: "https://swapi.co/api/people",
                qs: { page: page }
            },
            function(error, response, body) {
                console.log('error:', error); // Print the error if one occurred 
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
                console.log('body:', body); // Print the HTML for the Google homepage. 
                if (body && JSON.parse(body).count > 0) {
                    var data = JSON.parse(body);
                    var characters = data.results;
                    characters.sort(function(a, b) {
                        if (sort === 'name') {
                            return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);
                        }
                    });
                    resolve(characters);
                } else {
                    reject(error);
                }
            });
    });
}

module.exports = router;