const Event = require('../models/Events.js');
const Tag = require('../models/Tags.js');

exports.create = async (req, res) => {
    try {
        res.send( await Tag.create(req.body.tag) );
    } catch(err) {
        return err;
    } 
}
exports.findOrCreate = async (req, res) => {
    try {
        res.send( await Tag.findOrCreate(req.body.tag) );
    } catch(err) {
        return err;
    } 
}

exports.findById = async (req, res) => {
    try {
        res.send( await Tag.findById(req.params.id) );
    } catch(err) {
        return err;
    } 
}

exports.getAll = async (req, res) => {
    try {
        res.send( await Tag.all() );
    } catch(err) {
        return err;
    } 
}
