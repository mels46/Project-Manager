const express = require('express');
const Day = require("../controllers/hoursPerDayController");
const router = express.Router();


router.get('/new', function(req, res, next) {
    res.render('Day/addDay', { title: 'New Day'});
});
router.post('/newDay' ,Day.create,Day.redirectView);


module.exports = router;