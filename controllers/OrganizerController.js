const Event = require('../models/Events.js');
const Organizer = require('../models/Organizers.js');

exports.findOrCreate = function(req, res) {
    Organizer.findOrCreate(req.body.organizer).then(result => {
        res.send(result);
    });
}


exports.getAll = function(req, res) {
    Organizer.all().then((result) => {
        res.send(result);
    }).catch((err) => res.send(err));
}
