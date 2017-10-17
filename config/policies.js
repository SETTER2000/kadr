/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on how policies work, see:
 * http://sailsjs.org/#!/documentation/concepts/Policies
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.policies.html
 */


module.exports.policies = {

    /***************************************************************************
     *                                                                          *
     * Default policy for all controllers and actions (`true` allows public     *
     * access)                                                                  *
     *                                                                          *
     ***************************************************************************/
    // Ограничение действий controllers
    // '*': true,
    UserController: {
        //'*': 'isLoggedIn',
        create: ['isLoggedIn', 'isAdmin'],
        destroy: ['isLoggedIn', 'isAdmin'],
        //update: ['isLoggedIn'],
        login: ['isLoggedOut'],
        loginLDAP: ['isLoggedOut'],
        //logout: ['isLoggedIn'],
        signup: ['isLoggedOut'],
        //removeProfile: ['isLoggedIn'],
        //updateProfile: ['isLoggedIn'],
        //restoreGravatarURL: ['isLoggedIn'],
        restoreProfile: ['isLoggedOut'],
        //changePassword: ['isLoggedIn'],
        adminUsers: ['isLoggedIn', 'isAdmin'],
        updateAdmin: ['isLoggedIn', 'isAdmin'],
        updateAction: ['isLoggedIn', 'isAdmin'],
        updateDeleted: ['isLoggedIn', 'isAdmin'],
        updateMatching:true,
        addMatching:true,
        deleteMatching:true,
        getAllUsersName:true
    },


    PageController: {
        showSignupPage: ['isLoggedOut']
    },

    DepartmentController: {
        '*': 'isLoggedIn',
        create: ['isLoggedIn', 'isAdminOrKadr'],
        delete: ['isLoggedIn', 'isAdmin'],
        update: ['isLoggedIn', 'isAdminOrKadr']
    },

    PositionController: {
        '*': 'isLoggedIn',
        //'*': false,
        createPosition: ['isLoggedIn', 'isAdminOrKadr'],
        destroy: ['isLoggedIn', 'isAdmin'],
        update: ['isLoggedIn', 'isAdminOrKadr']
        //find: ['isLoggedIn']
        //find:   ['isLoggedIn', 'isAdmin','isKadr'],
    },

    InterfaceController: {
        //'*': true
        //update: ['isLoggedIn'],
        //create: ['isLoggedIn']
    },
    //FurloughController: {
    //    '*': 'isLoggedIn',
    //    //'*': false,
    //    create: ['isLoggedIn', 'isAdminOrKadr'],
    //    destroy: ['isLoggedIn', 'isAdmin'],
    //    update: ['isLoggedIn', 'isAdminOrKadr']
    //}


    /***************************************************************************
     *                                                                          *
     * Here's an example of mapping some policies to run before a controller    *
     * and its actions                                                          *
     *                                                                          *
     ***************************************************************************/
    // RabbitController: {

    // Apply the `false` policy as the default for all of RabbitController's actions
    // (`false` prevents all access, which ensures that nothing bad happens to our rabbits)
    // '*': false,

    // For the action `nurture`, apply the 'isRabbitMother' policy
    // (this overrides `false` above)
    // nurture	: 'isRabbitMother',

    // Apply the `isNiceToAnimals` AND `hasRabbitFood` policies
    // before letting any users feed our rabbits
    // feed : ['isNiceToAnimals', 'hasRabbitFood']
    // }
};
