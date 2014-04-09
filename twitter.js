// *****************  TWITTER ***************** 
'use strict';

var Twit = require('twit');
var T = new Twit({
    consumer_key:         'pWrTXzDGNOas9CPrhrFnA'
  , consumer_secret:      '0KHCWuqEd9A0O6wo4DU0eLASDUHgF3hUVxcKEANFrnY'
  , access_token:         '1534996477-JGs24bFNaqfgp1jlGv8plLivV4osuVqLsBY6WWt'
  , access_token_secret:  'nyF8FDymyYXvrtxRfVlKOAHKRGuKZGIpTXmZAv5JJCkyD'
});
// **********************************************

var languagesWeAreLookingAt = [
    'es',
    'de',
    'en',
    'fr',
    'ru',
    'ja',
    'it',
    'ar',
    'tr',
    'pt'
];

var languageCodes = {
    tr: 'turkish',
    ru: 'russian',
    pt: 'portuguese',
    nl: 'dutch',
    ja: 'japanese',
    it: 'italian',
    fr: 'french',
    es: 'spanish',
    en: 'english',
    de: 'german',
    ar: 'arabic'
};


/* ***************** DATABASE ***************** 

 - this should be moved to its own file.

*/
var mongoose = require('mongoose');
var uristring =
process.env.MONGOLAB_URI ||
process.env.MONGOHQ_URL ||
'mongodb://localhost/averageTwitter';

var Schema = mongoose.Schema;

mongoose.connect(uristring, function (err) {
    if (err) {
        console.log('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
        console.log('Succeeded connected to: ' + uristring);
    }
});


var ResultSchema = new Schema({
    dateCreated: { type: Date, default: Date.now, expires: 31 },
    lang: String
});

var Results = mongoose.model('Result', ResultSchema);

function isALanguageWereInterestedIn(languageCode) {

    var found = false;
    for (var i = languagesWeAreLookingAt.length - 1; i >= 0; i--) {
        if (languagesWeAreLookingAt[i] === languageCode) {
            found = true;
            break;
        }
    }

    if (found) {
        return true;
    } else {
        return false;
    }
}

function addNewElement(newElement, callback) {

    if (newElement !== 'und' &&
        newElement && typeof
        newElement !== 'undefined' &&
        isALanguageWereInterestedIn(newElement)) {

        isALanguageWereInterestedIn(newElement);

        var result = new Results();
        result.dateCreated = new Date();
        result.lang = newElement;
        result.save(function (e) {
            if (e) {
                console.log('error saving tweet');
            } else {
                if (typeof callback !== 'undefined') {
                    callback(newElement);
                }
            }
        });
    }
}

for (var i = languagesWeAreLookingAt.length - 1; i >= 0; i--) {
    addNewElement(languagesWeAreLookingAt[i]);
}

// **********************************************

var getSummary = function (callback) { // -- this entire funtion needs to be more better muchly

    Results.aggregate(

    {'$group': { _id: '$lang', count: { $sum: 1}}},
    { $sort : { _id : 1} },
    function (err, summary) {

        if (err) {
            console.log('couldnt get group summary', err);
            return err;
        } else {
            console.log(summary);
        }

        if (summary) {

            for (var l = summary.length - 1; l >= 0; l--) {
                summary[l].lang = summary[l]._id;
                delete summary[l]._id;
            }

            var total = 0.0;
            for (var k = summary.length - 1; k >= 0; k--) {
                total += summary[k].count;
            }

            var results = [];
            for (var i = languagesWeAreLookingAt.length - 1; i >= 0; i--) {

                var found = false;
                for (var j = summary.length - 1; j >= 0; j--) {

                    if (summary[j].lang === languagesWeAreLookingAt[i]) {
                        results.push({
                            count: ((summary[j].count / total) * 100).toFixed(1),
                            lang: languageCodes[languagesWeAreLookingAt[i]],
                            code: languagesWeAreLookingAt[i]
                        });
                        found = true;
                    }
                }

                if (!found) {
                    results.push({count: 0, lang: languageCodes[languagesWeAreLookingAt[i]], code: languagesWeAreLookingAt[i]});
                }
            }
            console.log(results);

            callback(results);

        } else {
            console.log('no group summary');
            return err;
        }
    });
};


var getTweets = function () {

    var stream = T.stream('statuses/sample');
    stream.on('tweet', function (tweet) {
        addNewElement(tweet.lang);

    });
};






  
module.exports.getTweets = getTweets;
module.exports.getSummary = getSummary;