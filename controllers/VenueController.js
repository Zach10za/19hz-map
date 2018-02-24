const Event = require('../models/Events.js');
const Venue = require('../models/Venues.js');
const fs = require('fs');
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

exports.getAll = function(req, res) {
    Venue.all().then((result) => {
        res.send(result);
    }).catch((err) => res.send(err));
}

exports.getPreciseLocation = async (req, res) => {
    try {
        console.log('Getting precise location');
        const places_result = await googleMaps.places({query: req.body.location, language: 'en'}).asPromise();
        console.log(places_result);
        return res.send(places_result);
    } catch(err) {
        return err;
    }
}


exports.getAndStorePreciseLocation = async (location) => {
    try {
        const exists = await Venue.findByName(location);
        if (exists.success) {
            if (exists.result[0].place_id) {
                console.log("Precise location has already been stored.");
            } else {
                console.log("Venue found. Getting precise location for: " + location);
                const places_result = await googleMaps.places({query: req.body.location, language: 'en'}).asPromise();
                if (places_result.status === 200) console.log("Precise location found. Now getting picture with reference: " + places_result.json.results[0].photos[0].photo_reference);
                const places_photo = await googleMaps.placesPhoto({maxwidth: 600, photoreference: places_result.json.results[0].photos[0].photo_reference}).asPromise();
                console.log("Found photo");

                let path = '/images/' + Date.now() + '.jpg';
                places_photo.pipe(fs.createWriteStream('./public'+path));
                let venue = {
                    id: exists.result[0].id,
                    name: places_result.json.results[0].name,
                    place_id: places_result.json.results[0].place_id,
                    address: places_result.json.results[0].formatted_address,
                    image: path,
                    price_level: places_result.json.results[0].price_level,
                    rating: places_result.json.results[0].rating,
                    lat: places_result.json.results[0].geometry.location.lat,
                    lng: places_result.json.results[0].geometry.location.lng,
                };
                const venue_result = await Venue.storePreciseInfo(venue);
                console.log("Precise Location stored");
            }
        } else {
            console.log( "Venue does not exist" );
        }
    } catch(err) {
        return err;
    }
}
