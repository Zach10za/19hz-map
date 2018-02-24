var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
  res.json({"API": true});
});

router.get('/user/:id', function(req, res, next) {
  res.json(req.user);
});

module.exports = router;
