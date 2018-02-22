var request = require('supertest');

describe('UserController', function() {

    describe('#login()', function() {
        it('следует перенаправить на / mypage', function (done) {
            request(sails.hooks.http.app)
                .put('/login')
                .send({ name: 'test', password: '111111' })
                .expect(302)
                .expect('location','/mypage', done);
        });
    });

});