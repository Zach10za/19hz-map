const Event = require('../models/Events.js');
const Venue = require('../models/Venues.js');
const fs = require('fs');
const csv = require('csv');
const request = require('request');
const googleMaps = require('@google/maps').createClient({ key: 'AIzaSyDgTT27dxGtMUKso84YXTvAV48x9923pO8', Promise: Promise});


exports.index = async (req, res) => {
    try {
        const venues_result = await Venue.all();
        let venues = venues_result.result;
        return res.render('venues', { title: "19hz | Venues", venues: venues });
    } catch(err) {
        return err;
    }
}

exports.findOrCreate = function(req, res) {
    Venue.findOrCreate(req.body.venue).then(result => {
        res.send(result);
    });
}

exports.findByName = function(req, res) {
  Venue.findByName(req.body.venue).then(result => {
    res.send(result);
  });
}

exports.getAll = function(req, res) {
    Venue.all().then((result) => {
        res.send(result);
    }).catch((err) => res.send(err));
}

// exports.getPreciseLocation = async (req, res) => {
//     try {
//         console.log('Getting precise location');
//         const places_result = await googleMaps.places({query: req.body.location, language: 'en'}).asPromise();
//         console.log(places_result);
//         return res.send(places_result);
//     } catch(err) {
//         return err;
//     }
// }

exports.fetchVenues = async () => {
  try {
    console.log('fetching venues');
    let venues_found = 0;
    request.get('http://19hz.info/venues_LosAngeles.csv', async (err, response, result) => {
      if (!err && response.statusCode === 200) {
        // result = name, address, link, fb
        let tba = await Venue.findById(1);
        if (tba.success && tba.result.length < 1) {
          await Venue.create({
            name: 'TBA',
            link: null,
            fb: null,
            place_id: null,
            address: null,
            price_level: null,
            rating: null,
            lat: 0,
            lng: 0,
          });
        }
        csv.parse(result, (error, data) => {
          data.map( async (row) => {
            let exists = await Venue.findByName(row[0]);
            if (exists.success && exists.result.length < 1) {
              let precise_location = await exports.getPreciseLocation(row[1]);
              let venue = await Venue.create({
                name: row[0],
                link: row[2],
                fb: row[3],
                place_id: precise_location.place_id,
                address: precise_location.formatted_address,
                price_level: precise_location.price_level,
                rating: precise_location.rating,
                lat: precise_location.geometry.location.lat,
                lng: precise_location.geometry.location.lng,
              });
            } else {
              if (exists.message) console.error(message);
            }
          });
        });
      } else {
        console.error('PROBLEM FETCHING VENUES');
      }
    });
  } catch(err) {
    console.error('FETCH VENUES ERROR:', err);
  }
}

exports.getPreciseLocation = async (venue_address) => {
    try {
        const places_result = await googleMaps.places({query: venue_address, language: 'en'}).asPromise();
        return places_result.json.results[0];
    } catch(err) {
      console.error(err);
        return err;
    }
}


// exports.getAndStorePreciseLocation = async (location) => {
//     try {
//         const exists = await Venue.findByName(location);
//         if (exists.success) {
//             if (exists.result[0].place_id) {
//                 console.log("Precise location has already been stored.");
//             } else {
//                 console.log("Venue found. Getting precise location for: " + location);
//                 const places_result = await googleMaps.places({query: req.body.location, language: 'en'}).asPromise();
//                 let venue = {
//                     id: exists.result[0].id,
//                     name: places_result.json.results[0].name,
//                     place_id: places_result.json.results[0].place_id,
//                     address: places_result.json.results[0].formatted_address,
//                     price_level: places_result.json.results[0].price_level,
//                     rating: places_result.json.results[0].rating,
//                     lat: places_result.json.results[0].geometry.location.lat,
//                     lng: places_result.json.results[0].geometry.location.lng,
//                 };
//                 const venue_result = await Venue.storePreciseInfo(venue);
//                 console.log("Precise Location stored");
//             }
//         } else {
//             console.log( "Venue does not exist" );
//         }
//     } catch(err) {
//         return err;
//     }
// }
