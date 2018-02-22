
const express = require('express');
const router = express.Router();
const path = require('path');
const EventController = require('../controllers/EventController.js');
const OrganizerController = require('../controllers/OrganizerController.js');
const TagController = require('../controllers/TagController.js');
const VenueController = require('../controllers/VenueController.js');

/* GET home page. */
router.get('/api/test', function(req, res, next) {
    res.send({route: '/api/test', location: 'root'});
});

router.get('/api/scrape', EventController.scrapeEvents);


router.get('/events', EventController.index);
router.get('/api/events', EventController.index);
router.get('/api/events/:id/tags', EventController.getTags);
router.get('/api/events/:id/organizers', EventController.getOrganizers);

router.get('/api/organizers', OrganizerController.getAll);
router.post('/api/organizers/findorcreate', OrganizerController.findOrCreate);
router.get('/api/organizers/:id/events', EventController.findByOrganizer);

router.get('/tags', TagController.getAll);
router.post('/tags/create', TagController.create);
router.post('/tags/findorcreate', TagController.findOrCreate);
router.get('/tags/:id', TagController.findById);
router.get('/tags/:id/events', EventController.findByTag);

router.get('/venues', VenueController.index);
router.get('/api/venues', VenueController.getAll);
router.post('/api/venues/findorcreate', VenueController.findOrCreate);
router.get('/api/venues/:id/events', EventController.findByVenue);
router.post('/api/venues/locate', VenueController.getPreciseLocation);
router.post('/api/venues/locate/getandstore', VenueController.getAndStorePreciseLocation);

module.exports = router;
