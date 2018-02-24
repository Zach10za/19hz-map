var db = require('../db.js');

exports.all = function() {
    return new Promise((resolve, reject) => {
        db.get().query('SELECT * FROM events WHERE event_date >= CURDATE() ORDER BY event_date DESC', function(err, result) {
            if (err) return reject(err);
            return resolve({ success: true, count: result.length, result: result });
        });
    });
}

exports.findById = function(id) {
    return new Promise((resolve, reject) => {
        db.get().query('SELECT * FROM events WHERE id = ?', id, function(err, result) {
            if (err) return reject(err);
            return resolve({ success: true, result: result });
        });
    });
}



exports.tags = function(event_id) {
    return new Promise((resolve, reject) => {
        db.get().query('SELECT tags.* FROM event_tags INNER JOIN tags ON event_tags.tag_id=tags.id WHERE event_tags.event_id=?', event_id, function(err, result) {
            if (err) return reject(err);
            return resolve({ success: true, count: result.length, result: result });
        });
    });
}

exports.organizers = function(event_id) {
    return new Promise((resolve, reject) => {
        db.get().query('SELECT organizers.* FROM event_organizers INNER JOIN organizers ON event_organizers.organizer_id=organizers.id WHERE event_organizers.event_id=?', event_id, function(err, result) {
            if (err) return reject(err);
            return resolve({ success: true, count: result.length, result: result });
        });
    });
}


exports.findByTag = function(tag_id) {
    return new Promise((resolve, reject) => {
        db.get().query('SELECT events.*, tags.tag FROM event_tags INNER JOIN events ON event_tags.event_id=events.id INNER JOIN tags ON event_tags.tag_id=tags.id WHERE event_tags.tag_id IN (?) GROUP BY events.id', tag_id, function(err, result) {
            if (err) return reject(err);
            return resolve({ success: true, count: result.length, result: result });
        });
    });
}

exports.findByOrganizer = function(organizer_id) {
    return new Promise((resolve, reject) => {
        db.get().query('SELECT * FROM events WHERE organizer = ?', organizer_id, function(err, result) {
            if (err) return reject(err);
            return resolve({ success: true, count: result.length, result: result });
        });
    });
}

exports.findByVenue = function(venue_id) {
    return new Promise((resolve, reject) => {
        db.get().query('SELECT * FROM events WHERE location = ?', venue_id, function(err, result) {
            if (err) return reject(err);
            return resolve({ success: true, count: result.length, result: result });
        });
    });
}

exports.create = function(event) {
    return new Promise((resolve, reject) => {
        db.get().query('INSERT INTO events SET ?', [event], function(err, result) {
            if (err) return reject(err);
            return resolve({ success: true, id: result.insertId });
        });
    });
}

exports.findByName = function(name) {
    return new Promise((resolve, reject) => {
        db.get().query('SELECT * FROM events WHERE title = ?', name, function(err, result) {
            if (err) return reject(err);
            return resolve({ success: true, result: result });
        });
    });
}

exports.findByNameAndDate = function(name, date) {
    return new Promise((resolve, reject) => {
        db.get().query("SELECT * FROM events WHERE title = ? and event_date = ?", [name, date], function(err, result) {
            if (err) return reject(err);
            return resolve({ success: true, result: result });
        });
    });
}

exports.findOrCreate = function(event) {
    return new Promise((resolve, reject) => {
        db.get().query('SELECT * FROM events WHERE title = ?', event.title, function(err, result) {
            if (err) return reject(err);
            if (result.length > 0) return resolve({ success: true, result: result });
            exports.create(event).then(result => {
                if (result.success) {
                    exports.findById(result.id).then(result => {
                        return resolve({ success: true, result: result.result });
                    }).catch(err => {return reject(err)});
                }
            }).catch(err => {return reject(err)});
        });
    });
}


exports.getOrganizers = function(event_id) {
    return new Promise((resolve, reject) => {
        db.get().query('SELECT organizers.* FROM event_organizers INNER JOIN organizers ON event_organizers.organizer_id = organizers.id WHERE event_organizers.event_id = ?', event_id, function(err, result) {
            if (err) return reject(err);
            return resolve({ success: true, count: result.length, result });
        });
    });
}


exports.getTags = function(event_id) {
    return new Promise((resolve, reject) => {
        db.get().query('SELECT tags.* FROM event_tags INNER JOIN tags ON event_tags.tag_id = tags.id WHERE event_tags.event_id = ?', event_id, function(err, result) {
            if (err) return reject(err);
            return resolve({ success: true, count: result.length, result });
        });
    });
}

