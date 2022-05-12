const mongoose = require('mongoose');
const uri = require('./keys').uri; 

mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
    .then( () => console.log('connection established!'))
    .catch( err => console.log(err));
