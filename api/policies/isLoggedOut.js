module.exports = function isLoggedOut(req, res, next) {

    if (!req.session.me) {
        return next();
    }

    if (req.wantsJSON) {
        return res.forbidden('isLoggedOut: Вам не разрешено выполнять это действие. Выйдите сначало из системы.');
    }

    return res.redirect('/');
};