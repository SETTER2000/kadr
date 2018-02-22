describe('UserModel', function() {

    describe('#find()', function() {
        it('следует проверить функцию поиска', function (done) {
            User.find()
                .then(function(results) {
                    // some tests
                    done();
                })
                .catch(done);
        });
    });

});