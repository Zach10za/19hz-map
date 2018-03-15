
const express = require('express');
const router = express.Router();
const path = require('path');
const EventController = require('../controllers/EventController.js');
const OrganizerController = require('../controllers/OrganizerController.js');
const TagController = require('../controllers/TagController.js');
const VenueController = require('../controllers/VenueController.js');

// Scrape events from 19hz.info
router.get('/api/scrape/:region', EventController.fetchEvents);

// API calls for events
router.get('/api/events', EventController.index);
router.get('/api/events/:region', EventController.getByRegion);
router.get('/api/events/:id/tags', EventController.getTags);
router.get('/api/events/:id/organizers', EventController.getOrganizers);

// API calls for organizers
router.get('/api/organizers', OrganizerController.getAll);
router.post('/api/organizers/findorcreate', OrganizerController.findOrCreate);
router.get('/api/organizers/:id/events', EventController.findByOrganizer);

// API calls for tags
router.post('/tags/create', TagController.create);
router.post('/tags/findorcreate', TagController.findOrCreate);
router.get('/tags/:id', TagController.findById);
router.get('/tags/:id/events', EventController.findByTag);

// API calls for venues
router.get('/api/venues', VenueController.getAll);
router.get('/api/venues/fetch/:region', VenueController.fetchVenues);
// router.post('/api/venues/findorcreate', VenueController.findOrCreate);
// router.get('/api/venues/:id/events', EventController.findByVenue);
// router.post('/api/venues/locate', VenueController.getPreciseLocation);
// router.post('/api/venues/locate/getandstore', VenueController.getAndStorePreciseLocation);

module.exports = router;
