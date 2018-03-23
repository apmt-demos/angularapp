
var MessageHubAdminRest = require('message-hub-rest');
var config = require('./config.json');
// setup the services
services = {
        "messagehub": [
           {
              "label": "messagehub",
              "credentials": {
                 "api_key": config.apikey,
                 "kafka_rest_url": config.kafka_admin_url
              }
           }
        ]
    };

// Fire up the admin service
var adminRestInstance = new MessageHubAdminRest(services);


function getContainers() {
    return adminRestInstance.consume('my_consumer_group2', 'my_consumer_instance2', { 'auto.offset.reset': 'largest' })
        .then(function (response) {
            var consumerInstance = response[0];
            return consumerInstance.get('container-input');
        })
        .then(function (data) {
            return data;
        });
};

function getGeospatialEvents(){
    return adminRestInstance.consume('my_consumer_group3', 'my_consumer_instance3', { 'auto.offset.reset': 'largest' })
    .then(function (response) {
        var consumerInstance = response[0];
        return consumerInstance.get('terminal-events');
    })
    .then(function (data) {
        return data;
    });
}

module.exports = function (app) {

    // api ---------------------------------------------------------------------
    // get all containers
    app.get('/api/containers', function (req, res) {
        getContainers().then(function(data){
            res.json(data);
        });
    });
    app.get('/api/events', function(req, res){
        getGeospatialEvents().then(function(data){
            res.json(data);
        })
    })

    // application -------------------------------------------------------------
    app.get('*', function (req, res) {
        res.sendFile(__dirname + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
};
