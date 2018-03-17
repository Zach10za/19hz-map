const request = require('request');
const csv = require('csv');
const cheerio = require('cheerio');
const Event = require('../models/Events.js');
const Venue = require('../models/Venues.js');
const Organizer = require('../models/Organizers.js');
const Tag = require('../models/Tags.js');

exports.index = async (req, res) => {
    try {
        const events_result = await Event.all();
        let events = events_result.result;
        for (let i=0; i<events.length; i++) {
            const venue = await Venue.findById(events[i].location);
            events[i].venue = venue.result[0];
        }

        return res.send({ success: true, count: events.length, result: events });
    } catch(err) {
        console.error(err);
        return err;
    }
}

exports.getByRegion = async (req, res) => {
    try {
        const events_result = await Event.region(req.params.region);
        let events = events_result.result;
        for (let i=0; i<events.length; i++) {
            const venue = await Venue.findById(events[i].location);
            events[i].venue = venue.result[0];
        }
        return res.send({ success: true, count: events.length, result: events });
    } catch(err) {
        console.error(err);
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

exports.fetchEvents = async (req, res) => {
  try {
    console.log('fetching events');
    let events_found = 0;
    let region = req.params.region || 1;
    let link = 'https://19hz.info/events_LosAngeles.csv';
    switch(region) {
      case '1':
        link = 'https://19hz.info/events_BayArea.csv';
        break;
      case '2':
        link = 'https://19hz.info/events_LosAngeles.csv';
        break;
      case '3':
        link = 'https://19hz.info/events_Atlanta.csv';
        break;
      case '4':
        link = 'https://19hz.info/events_Texas.csv';
        break;
      case '5':
        link = 'https://19hz.info/events_Miami.csv';
        break;
      case '6':
        link = 'https://19hz.info/events_Phoenix.csv';
        break;
      case '7':
        link = 'https://19hz.info/events_Massachusetts.csv';
        break;
    }
    console.log(link);
    await request.get(link, (err, response, result) => {
      if (!err && response.statusCode === 200) {
        // result = date, title, tags, venue, time, price, age, organizers, link, fb, excel date
        csv.parse(result, (error, data) => {
          data.map( async (row) => {
            let exists = await Event.findByNameAndRegion(row[1], region);
            if (exists.success && exists.result.length < 1) {
              let venue_name = (row[3]).split(' (')[0];
              let venue = await Venue.findByNameAndRegion(venue_name, region);
              if (venue.success) {
                let venue_id;
                if (venue.result.length > 0) {
                  venue_id = venue.result[0].id
                } else if (venue_name === 'TBA') {
                  venue_id = 0;
                }
                if (venue_id) {
                  let new_date = new Date((parseFloat(row[10], 10) - 2.047 - (70 * 365.2422)) * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
                    console.log('createing event: ' + (row[1]).split(' (')[0] + ' in region ' + region);
                  let event = await Event.create({
                    event_date: new_date,
                    time: row[4],
                    title: (row[1]).split(' (')[0],
                    location: venue_id,
                    age: row[6],
                    price: row[5],
                    link: row[8],
                    facebook: row[9],
                    region: region,
                  });
                  events_found++;
                  let organizers = (row[7] || '').split(', ');
                  for (let j=0; j<organizers.length; j++) {
                    let organizer = await Organizer.findOrCreate(organizers[j]);
                    let organizer_link = await Organizer.linkToEvent(event.id, organizer.result[0].id);
                  }

                  let tags = (row[2] || '').split(', ');
                  for (let j=0; j<tags.length; j++) {
                      let tag = await Tag.findOrCreate(tags[j]);
                      let tag_link = await Tag.linkToEvent(event.id, tag.result[0].id);
                  }
                }
              } else {
                console.error('COULD NOT GET VENUE');
              }
            } else {
              console.error('EVENT EXIST');
            }
          });
            console.log('Found ' + events_found + ' events');
          return res.sendStatus(200);
        });
      } else {
        console.error('REQUEST ERR:', err);
      }
    });
  } catch(err) {
    console.error('FETCH EVENTS ERROR:', err);
  }
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
                    region: raw_event.region,
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

exports.scrapeEventsOLD = function(req, res) {
    events = [];
    console.log(req.params.region);
    let region = req.params.region;
    let link = 'https://19hz.info/eventlisting_LosAngeles.php';
    switch(region) {
        case '1':
            link = 'https://19hz.info/eventlisting_BayArea.php';
            break;
        case '2':
            link = 'https://19hz.info/eventlisting_LosAngeles.php';
            break;
        case '3':
            link = 'https://19hz.info/eventlisting_Atlanta.php';
            break;
        case '4':
            link = 'https://19hz.info/eventlisting_Texas.php';
            break;
        case '5':
            link = 'https://19hz.info/eventlisting_Miami.php';
            break;
        case '6':
            link = 'https://19hz.info/eventlisting_Phoenix.php';
            break;
        case '7':
            link = 'https://19hz.info/eventlisting_Massachusetts.php';
            break;
    }
    console.log(link);
    request(link, function(error, response, html) {
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
                    facebook: null,
                    region: region,
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

const processBatchOLD = async (raw_events) => {
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
                    region: raw_event.region,
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
