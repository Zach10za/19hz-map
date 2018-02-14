var mysql = require('mysql');
var async = require('async');

var DB = '19hz';

var state = {
    pool: null,
}

exports.connect = function(cb) {
    state.pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'E50yetbeo',
        database: DB,
        dateStrings: 'date'
    });
    if (cb) cb();
}

exports.get = function() {
    return state.pool;
}

exports.drop = function(tables, done) {
    var pool = state.pool
    if (!pool) return new Error('Missing database connection.')

    async.each(tables, function(name, cb) {
        pool.query('DELETE * FROM ' + name, cb)
    }, next)
}

