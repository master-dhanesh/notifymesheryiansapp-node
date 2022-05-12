var express = require('express');
var router = express.Router();
var Data = require('../model/dataSchema');
var  nodeMailer = require('nodemailer');
const { check, validationResult} = require('express-validator')

/**
 * INTERVEL FOR WISHING
 */
const STOP_INTERVAL =  setInterval(() => {
    Data.find()
    .then(data => {
          data.forEach(el => {
              if(arrange(new Date(el.timer)) === arrange(new Date())) {
                emailSender(el.receiveremail, el.title, el.message);
                emailSender(el.senderemail, el.title, el.message, `Your ${el.title} greeting is sent to ${el.receiveremail}, which you have registered in Notify Us Sheryians App.`);

                Data.findByIdAndDelete({_id: el._id})
                  .then( notify => console.log(`${notify.username} notified and removed!`))
                  .catch(err => console.log(err));
                // clearInterval(STOP_INTERVAL);
            } else {
              console.log('not yet!')
            }
          });
    })
    .catch (err => console.log(err));
    // clearInterval(STOP_INTERVAL);
}, 1000);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

// /* GET home page. */
// router.get('/confirm', function(req, res, next) {
//   res.render('confirmation');
// });

/* POST home page. */
router.post('/', [
  check('username').isLength({min:4}).withMessage('Username required alteast 4 characters.'),
  check('title').isLength({min:8}).withMessage('Title required alteast 8 characters.'),
  check('senderemail').isEmail(),
  check('receiveremail').isEmail(),
  check('message').isLength({min:15}).withMessage('Message required alteast 15 characters.'),
], function(req, res, next) {
     if(req.body.datetime === '') return res.send("<h3>This is warning...</h3><p>The given date is invalid, Please put the correct date. <a href='/'>Got to Home<a/></p>"); 
  const ACTUAL_DATE = new Date();
  const GIVEN_DATE =  new Date(req.body.datetime);
  if(ACTUAL_DATE > GIVEN_DATE || ACTUAL_DATE === GIVEN_DATE) return res.send("<h3>This is warning...</h3><p>The given date is invalid, Please put the correct date. <a href='/'>Got to Home<a/></p>");
  const DATE_DIFFERENCE = Math.abs(ACTUAL_DATE - GIVEN_DATE);
  let DATE_DURATION = getDuration(DATE_DIFFERENCE);

  const errors = validationResult(req);

  if(!errors.isEmpty()) return res.json(errors);

  const newData = new Data({
    title: req.body.title,
    username: req.body.username,
    senderemail: req.body.senderemail,
    receiveremail: req.body.receiveremail,
    message: req.body.message,
    timer: req.body.datetime
  });

  newData.save()
    .then( data => {
      emailSender(req.body.senderemail, req.body.title, req.body.message,
        `${req.body.receiveremail} will be notified after ${DATE_DURATION}. And you'll be getting the feedback soon.`);
        res.render('confirmation', {DATE_DURATION, data} )
      // res.json({ timer: `${DATE_DURATION}`, data })
    })
    .catch(err => res.send(err));
});

function arrange(date){
  return (`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}T${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`);
}

function getDuration(duration){
let seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;
  return `${hours} hours ${minutes} minutes ${seconds} seconds`;
};

function emailSender(to, subject, text, ...extras) {
  let funcData = extras[0] ? extras[0] : text
  let transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dhanesh1296@gmail.com',
        pass: 'dhanesh1296@'
    }
});
  let mailOptions = {
    from: '"Sheryians Auto Wisher Service" <dhanesh1296@gmail.com>', // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    text: funcData
};
transporter.sendMail(mailOptions, (error, info) => {
    if (error) return console.log(error);
    console.log('Message %s sent: %s', info.messageId, info.response);
        res.redirect('/');
    });
}

module.exports = router;
