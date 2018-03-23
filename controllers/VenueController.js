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

exports.fetchVenues = async (req, res) => {
  try {
    let venues_found = 0;
    let region = req.params.region || 1;
    let link = 'https://19hz.info/venues_LosAngeles.csv';
    switch(region) {
      case '1':
        link = 'https://19hz.info/venues_BayArea.csv';
        break;
      case '2':
        link = 'https://19hz.info/venues_LosAngeles.csv';
        break;
      case '3':
        link = 'https://19hz.info/venues_Atlanta.csv';
        break;
      case '4':
        link = 'https://19hz.info/venues_Texas.csv';
        break;
      case '5':
        link = 'https://19hz.info/venues_Miami.csv';
        break;
      case '6':
        link = 'https://19hz.info/venues_Phoenix.csv';
        break;
      case '7':
        link = 'https://19hz.info/venues_Massachusetts.csv';
        break;
    }
    request.get(link, async (err, response, result) => {
      if (!err && response.statusCode === 200) {
        console.log('fetching venues from ', link);
        // result = name, address, link, fb
        let tba = await Venue.findByNameAndRegion('TBA', region);
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
            region: region,
          });
        }
        let venues;
        csv.parse(result, async (error, data) => {
          venues = await data.map( async (row) => {
            let exists = await Venue.findByAddressAndRegion(row[1], region);
            if (exists.success && exists.result.length < 1) {
              let precise_location = await exports.getPreciseLocation(row[1]);
              if (precise_location && precise_location.geometry.location) {
                let venue = await Venue.create({
                  name: row[0],
                  link: row[2],
                  fb: row[3],
                  place_id: precise_location.place_id,
                  address: row[1],
                  price_level: precise_location.price_level,
                  rating: precise_location.rating,
                  lat: precise_location.geometry.location.lat,
                  lng: precise_location.geometry.location.lng,
                  region: region,
                });
                venues_found++;
                return venue;
              } else {
                console.error('COULD NOT GET PRECISE LOCATION');
              }
            } else {
              if (exists.message) console.error(message);
            }
          });
          let result = await Promise.all(venues);
          console.log('Found ' + venues_found + ' venues');
          return res.sendStatus(200);
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



exports.fetchAllVenues = async () => {
  try {
    let venues_found = 0;
    let region = 1;
    let links = [
        'https://19hz.info/venues_BayArea.csv',
        'https://19hz.info/venues_LosAngeles.csv',
        'https://19hz.info/venues_Atlanta.csv',
        'https://19hz.info/venues_Texas.csv',
        'https://19hz.info/venues_Miami.csv',
        'https://19hz.info/venues_Phoenix.csv',
        'https://19hz.info/venues_Massachusetts.csv',
    ];
    for (let x=0; x < links.length; x++) {
      region = x + 1;
      request.get(links[x], async (err, response, result) => {
        if (!err && response.statusCode === 200) {
          console.log('fetching venues from ', links[x]);
          // result = name, address, link, fb
          let tba = await Venue.findByNameAndRegion('TBA', region);
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
              region: region,
            });
          }
          let venues;
          csv.parse(result, async (error, data) => {
            venues = await data.map( async (row) => {
              let exists = await Venue.findByAddressAndRegion(row[1], region);
              if (exists.success && exists.result.length < 1) {
                let precise_location = await exports.getPreciseLocation(row[1]);
                if (precise_location && precise_location.geometry.location) {
                  let venue = await Venue.create({
                    name: row[0],
                    link: row[2],
                    fb: row[3],
                    place_id: precise_location.place_id,
                    address: row[1],
                    price_level: precise_location.price_level,
                    rating: precise_location.rating,
                    lat: precise_location.geometry.location.lat,
                    lng: precise_location.geometry.location.lng,
                    region: region,
                  });
                  venues_found++;
                  return venue;
                } else {
                  console.error('COULD NOT GET PRECISE LOCATION');
                }
              } else {
                if (exists.message) console.error(message);
              }
            });
            let result = await Promise.all(venues);
            console.log('Found ' + venues_found + ' venues');
            return result;
          });
        } else {
          console.error('PROBLEM FETCHING VENUES');
        }
      });
    }
  } catch(err) {
    console.error('FETCH VENUES ERROR:', err);
  }
}