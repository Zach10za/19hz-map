const request = require('request');
const cheerio = require('cheerio');
const Event = require('../models/Events.js');
const Venue = require('../models/Venues.js');
const Organizer = require('../models/Organizers.js');
const Tag = require('../models/Tags.js');

exports.index = async (req, res) => {
    console.log("Calling EventController.index");
    try {
        const events_result = await Event.all();
        let events = events_result.result;
        for (let i=0; i<events.length; i++) {
            const venue = await Venue.findById(events[i].location);
            events[i].venue = venue.result[0];
        }
        return res.send({ success: true, count: events.length, result: events });
    } catch(err) {
        return err;
    }
}

exports.getTags = async (req, res) => {
    try {
        res.send( await Event.tags(req.params.id) );
    } catch(err) {
        return err;
    }
}

exports.getOrganizers = async (req, res) => {
    try {
        res.send( await Event.organizers(req.params.id) );
    } catch(err) {
        return err;
    }
}

exports.getAll = function(req, res) {
    Event.all().then((result) => {
        res.send(result);
    }).catch((err) => res.send(err));
}

exports.findOrCreate = function(req, res) {
    Event.findOrCreate(event).then(result => {
        res.send(result);
    });
}

exports.findByTag = async (req, res) => {
    try {
        res.send( await Event.findByTag(req.params.id) );
    } catch(err) {
        return err;
    }
}

exports.findByOrganizer = async (req, res) => {
    try {
        res.send( await Event.findByOrganizer(req.params.id) );
    } catch(err) {
        return err;
    }
}

exports.findByVenue = async (req, res) => {
    try {
        res.send( await Event.findByVenue(req.params.id) );
    } catch(err) {
        return err;
    }
}

exports.scrapeEvents = function(req, res) {
    events = [];
    request('https://19hz.info/eventlisting_LosAngeles.php', function(error, response, html) {
        if (!error && response.statusCode == 200) {
            const $ = cheerio.load(html);
            $('table:first-of-type tbody').find('tr').map(function (index, row) {
                raw = {
                    date: null,
                    time: null,
                    title: null,
                    location: null,
                    tags: [],
                    age: null,
                    price: null,
                    organizers: [],
                    link: null,
                    facebook: null
                };
                $(row).find('td').map(function(i, cell) {
                    let text = $(cell).text();
                    if (text) {
                        switch(i) {
                            case 0:
                                raw['date'] = text.split('(')[0];
                                let time = text.split('(')[1];
                                raw['time'] = time ? (time.includes(')') ? time.split(')')[0] : time) : '';
                                break;
                            case 1:
                                raw['link'] = $(cell).find('a').attr('href');
                                raw['title'] = text.split(' @ ')[0];
                                raw['location'] = text.split(' @ ')[1];
                                break;
                            case 2:
                                raw['tags'] = text.split(', ');
                                break;
                            case 3:
                                if (text.includes('|')) {
                                    raw['age'] = text.split(' | ')[1];
                                    raw['price'] = text.split(' | ')[0];
                                } else if(text.includes('Free')) {
                                    raw['price'] = 'Free';
                                } else {
                                    if (text.includes('$')) {
                                        raw['price'] = text;
                                    } else {
                                        raw['age'] = text;
                                    }
                                }
                                break;
                            case 4:
                                raw['organizers'] = text.split(', ');
                                break;
                            case 5:
                                raw['facebook'] = $(cell).find('a').attr('href');
                                break;
                            case 6:
                                raw['date'] = text;
                                break;
                        }
                    }
                });
                events.push(raw);
            });
        }
        //res.send(events);
        processBatch(events).then(result => {res.send(result)}).catch(err => {res.send(err)});
    });
}

const processBatch = async (raw_events) => {
    console.log('Looking for new events');
    try {
        let events_added = 0;
        for (let i=0; i<raw_events.length; i++) {
            let raw_event = raw_events[i];
            let date_split = raw_event.date.split('/');
            let new_date = date_split[0]+'-'+date_split[1]+'-'+date_split[2];
            const find_if_exists = await Event.findByNameAndDate(raw_event.title, new_date);
            if (find_if_exists.success && find_if_exists.result.length < 1) {
                let new_event = {
                    event_date: new_date,
                    time: raw_event.time,
                    title: raw_event.title,
                    location: raw_event.location,
                    age: raw_event.age,
                    price: raw_event.price,
                    link: raw_event.link,
                    facebook: raw_event.facebook,
                }
                const venue = await Venue.findOrCreate(new_event.location);
                if (venue.success) new_event.location = venue.result[0].id;
                const precise_location = Venue.getAndStorePreciseLocation(new_event.location);

                const create_event = await Event.create(new_event);
                new_event['id'] = create_event.id;

                for (let j=0; j<raw_event.organizers.length; j++) {
                    console.log('Finding/Creating Organizer');
                    let organizer = await Organizer.findOrCreate(raw_event.organizers[j]);
                    let organizer_link = await Organizer.linkToEvent(new_event.id, organizer.result[0].id);
                }

                for (let j=0; j<raw_event.tags.length; j++) {
                    console.log('Finding/Creating Tag');
                    let tag = await Tag.findOrCreate(raw_event.tags[j]);
                    let tag_link = await Tag.linkToEvent(new_event.id, tag.result[0].id);
                }
                events_added++;
            }
        }
        console.log('Found ' + events_added + ' new events');
        return { success: true, new_events: events_added };
    } catch(err) {
        console.error('PROCESS ERR:', err);
        return err;
    }
}

exports.createEvent = function(req, cb) {
    // Check if there is another event with the same title and date
    // Event.exists(event.title, event.date, function(result){
    //     if (result.success) {
    //         if (result.data.length > 0) {
    //             cb({ success: false, message: 'Even already exists' });
    //         } else {
    //             Venue.findByNameOrCreate(event.title, function(result){

    //                     Event.create(new_event, function(result) {
    //                         if (result.success) {
    //                             new_event['id'] = result.id;
    //                             for (let i=0; i<event.organizers.length; i++) {
    //                                 let organizer_id = null;
    //                                 Organizer.findByNameOrCreate(event.organizers[i], function(result){

    //                                 });
    //                             }
    //                         }
    //                     });
    //                 }
    //             });

    //         }
    //     }
    // });
    // let event = {
    //     date: '',
    //     time: '',
    //     title: '',
    //     location: '',
    //     price: '',
    //     age: '',
    //     link: ''
    // };
    // check if event exists
    // check if venue exists
    // if not create venue

    // check if organizer(s) exist
    // if not create organizers
    // create entry(s) in event_organizer table
    // check if tags exist
    // if not create tags
    // create entry(s) in event_tags table
    //
    // process event to fit in table
    // store event detail in event table
}
