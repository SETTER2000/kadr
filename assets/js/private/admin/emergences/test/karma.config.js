// Karma configuration
// Generated on Wed Feb 21 2018 23:09:27 GMT+0300 (RTZ 2 (зима))
module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '../../../../',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],


        // list of files / patterns to load in the browser
        files: [
            // Load sails.io before everything else
            'dependencies/sails.io.js',
            'dependencies/jquery.min.js',
            'dependencies/bootstrap.min.js',
            'dependencies/angular.js',
            'dependencies/angular-mocks.js',
            'dependencies/angular-ui-router.min.js',
            'dependencies/angular-resource.min.js',
            'dependencies/moment.min.js',
            'dependencies/angular-moment.min.js',
            'dependencies/toastr/*.js',
            'dependencies/angular-material.min.js',
            'dependencies/angular-animate.js',
            'dependencies/angular-aria.min.js',
            'dependencies/angular-messages.min.js',
            'dependencies/angular-file-upload.min.js',
            'dependencies/ng-fx.min.js',
            'dependencies/angular-sanitize.min.js',
            'dependencies/ngDialog.js',
            'private/admin/users/UserModule.js',
            'private/admin/emergences/EmergenceModule.js',
            'private/admin/emergences/ctrl/EditEmergenceController.js',


            //'private/HolidayModule.js',
            'private/admin/emergences/test/*.test.js'

        ],


        // list of files / patterns to exclude
        exclude: [],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {},


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    })
}
