const { connect, Schema, model } = require('mongoose');
const config = require('../config');
connect(config.mongooseUrl, { useNewUrlParser: true, useUnifiedTopology: true });

const clientSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    settings: {
        type: Object,
        require: true
    }
}, { minimize: false });

module.exports = model('client', clientSchema);