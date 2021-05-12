var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
/* hello API */
router.get('/hello', function (req, res){
  return res.send('world').end();
});

module.exports = router;
