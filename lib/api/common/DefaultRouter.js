const express = require('express');

class DefaultRouter {
    api
    client
    name
     constructor(rada) {
        this.api = express();
        this.name = "RadaAPI";
        this.client = rada
        this.setup()
        this.shutdown()
    }
    getName() {
        return this.name
    }
    setup() {}
    shutdown() {}
}

module.exports = DefaultRouter;
