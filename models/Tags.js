var db = require('../db.js');

exports.all = function() {
    return new Promise((resolve, reject) => {
        db.get().query('SELECT * FROM tags', function(err, result) {
            if (err) return reject(err);
            return resolve({ success: true, count: result.length, result: result });
        });
    });
}

exports.findById = function(id) {
    return new Promise((resolve, reject) => {
        db.get().query('SELECT * FROM tags WHERE id = ?', id, function(err, result) {
            if (err) return reject(err);
            return resolve({ success: true, result: result });
        });
    });
}

exports.create = function(tag) {
    return new Promise((resolve, reject) => {
        db.get().query('INSERT INTO tags (tag) VALUES(?)', tag, function(err, result) {
            if (err) return reject(err);
            return resolve({ success: true, id: result.insertId });
        });
    });
}

exports.findByName = function(name) {
    return new Promise((resolve, reject) => {
        db.get().query('SELECT * FROM tags WHERE LOWER(tag) = LOWER(?)', name, function(err, result) {
            if (err) return reject(err);
            return resolve({ success: true, result: result });
        });
    });
}

exports.findOrCreate = function(name) {
    return new Promise((resolve, reject) => {
        db.get().query('SELECT * FROM tags WHERE LOWER(tag) = LOWER(?)', name, function(err, result) {
            if (err) return reject(err);
            if (result.length > 0) {
                return resolve({ success: true, result: result });
            } else {
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

exports.linkToEvent = function(event_id, tag_id) {
    return new Promise((resolve, reject) => {
        db.get().query('INSERT INTO event_tags (event_id, tag_id) VALUES(?,?)', [event_id, tag_id], function(err, result) {
            if (err) return reject(err);
            return resolve({ success: true, id: result.insertId });
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

