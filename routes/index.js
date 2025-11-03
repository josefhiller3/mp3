/*
 * Connect all of your endpoints together here.
 */
module.exports = function (app, router) {
    require('./home.js')(router);
    require('../models/user.js')(router);
    require('../models/task.js')(router);
    app.use('/api', router);
};
