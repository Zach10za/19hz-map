var db = require('../db.js');

exports.all = function() {
    return new Promise((resolve, reject) => {
        db.get().query('SELECT * FROM organizers', function(err, result) {
            if (err) return reject(err);
            return resolve({ success: true, count: result.length, result: result });
        });
    });
}

exports.findById = function(id) {
    return new Promise((resolve, reject) => {
        db.get().query('SELECT * FROM organizers WHERE id = ?', id, function(err, result) {
            if (err) return reject(err);
            return resolve({ success: true, result: result });
        });
    });
}

exports.create = function(organizer) {
    return new Promise((resolve, reject) => {
        db.get().query('INSERT INTO organizers (organizer) VALUES(?)', organizer, function(err, result) {
            if (err) return reject(err);
            return resolve({ success: true, id: result.insertId });
        });
    });
}

exports.findByName = function(name) {
    return new Promise((resolve, reject) => {
        db.get().query('SELECT * FROM organizers WHERE LOWER(organizer) = LOWER(?)', name, function(err, result) {
            if (err) return reject(err);
            return resolve({ success: true, result: result });
        });
    });
}

exports.findOrCreate = function(name) {
    return new Promise((resolve, reject) => {
        db.get().query('SELECT * FROM organizers WHERE LOWER(organizer) = LOWER(?)', name, function(err, result) {
            if (err) return reject(err);
            if (result.length > 0) {
                console.log("Found existing organizer");
                return resolve({ success: true, result: result });
            } else {
                console.log("New organizer being created");
                exports.create(name).then(result => {
                    if (result.success) {
                        exports.findById(result.id).then(result => {
                            return resolve({ success: true, result: result.result });
                        }).catch(err => {return reject(err)});
                    }
                }).catch(err => {return reject(err)});
            }
        });
    });
}

exports.linkToEvent = function(event_id, organizer_id) {
    return new Promise((resolve, reject) => {
        db.get().query('INSERT INTO event_organizers (event_id, organizer_id) VALUES(?,?)', [event_id, organizer_id], function(err, result) {
            if (err) return reject(err);
            return resolve({ success: true, id: result.insertId });
        });
    });
}