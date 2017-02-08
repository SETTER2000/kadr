var actionUtil = require('../actionUtil');
var _ = require('@sailshq/lodash');

module.exports = function findRecords (req, res) {
    console.log('FIND MY:');
    console.log(actionUtil.parseCriteria(req));
    // Look up the model
    var Model = actionUtil.parseModel(req);

    // Lookup for records that match the specified criteria.
    var query = Model.find()
        .where( actionUtil.parseCriteria(req) )
        .limit( actionUtil.parseLimit(req) )
        .skip( actionUtil.parseSkip(req) )
        .sort( actionUtil.parseSort(req) );
    query = actionUtil.populateRequest(query, req);
    query.exec(function found(err, matchingRecords) {
        if (err) {
            // If this is a usage error coming back from Waterline,
            // (e.g. a bad criteria), then respond w/ a 400 status code.
            // Otherwise, it's something unexpected, so use 500.
            switch (err.name) {
                case 'UsageError': return res.badRequest(err);
                default: return res.serverError(err);
            }
        }//-•

        if (req._sails.hooks.pubsub && req.isSocket) {
            Model.subscribe(req, _.pluck(matchingRecords, Model.primaryKey));
            // Only `._watch()` for new instances of the model if
            // `autoWatch` is enabled.
            if (req.options.autoWatch) { Model._watch(req); }
            // Also subscribe to instances of all associated models
            _.each(matchingRecords, function (record) {
                actionUtil.subscribeDeep(req, record);
            });
        }//>-

        return res.ok(matchingRecords);

    });//</ .find().exec() >

};