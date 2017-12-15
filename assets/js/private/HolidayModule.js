angular.module('Holiday', [
        'ui.router',
        'ngResource',
        'ngAnimate',
        'SkdModule',
        'StructureModule',
        'PositionModule',
        'FurloughModule',
        'VacationModule',
        'DepartmentModule',
        'EmployeeModule',
        'DashboardModule',
        'UserModule',
        'CalendarModule',
        'AttendanceModule',
        'ScheduleModule',
        'AdminModule',
        'ngMaterial'
    ])
    // .constant("baseUrl", "http://localhost\\:1337")

    //.config(function ($routeProvider, $locationProvider) {
    //$routeProvider
    //        .when('/', {
    //            templateUrl: '/js/private/holiday.tpl.html',
    //            controller: 'HolidayController'
    //        })
    //        ;
    //    $locationProvider.html5Mode({enabled: true, requireBase: false});
    //})
    .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
        $locationProvider.html5Mode({enabled: true, requireBase: false});
        $urlRouterProvider.otherwise('/');
//        $stateProvider
//            .state('index', {
//                url: '/',
//                views: {
//                    'sidebar@': {templateUrl: '/js/private/tpl/sidebar.tpl.html'},
//                    'body@': {templateUrl: '/js/private/tpl/workspace.tpl.html'}

//                }
//            })
//            .state('account', {
//                url: '/account',
//                templateUrl: '/js/private/dashboard/account/tpl/account.tpl.html'
//            })
//            .state('contact', {
//                url: '/contact',
//                // Будет автоматически вложен в безымянный ui-view
//                // родительского шаблона. Начиная с состояния верхнего уровня,
//                // шаблоном этого родительского состояния является index.html.
//                templateUrl: '/js/private/contacts.html'
//            })
//
//            .state('contact.detail', {
//                views: {
//                    /////////////////////////////////////////////////////
//                    // Относительное позиционирование                  //
//                    // позиционируется родительское состояние в ui-view//
//                    /////////////////////////////////////////////////////
//
//                    // Относительное позиционирование вида 'detail' в родительском
//                    // состоянии 'contacts'.
//                    // <div ui-view='detail'/> внутри contacts.html
//                    // "detail": {},
//
//                    // Относительное поциционирование безымянного вида в родительском
//                    // состояния 'contacts'.
//                    // <div ui-view/> внутри contacts.html
//                    // "": {}
//
//                    ////////////////////////////////////////////////////////////////////////////
//                    // Абсолютное позиционирование '@'                                        //
//                    // Позиционирование любых видов внутри этого состояния или предшествующего //
//                    ////////////////////////////////////////////////////////////////////////////
//
//                    // Абсолютное позиционирование вида 'info' в состоянии 'contacts.detail'.
//                    // <div ui-view='info'/> внутри contacts.detail.html
//                    //"info@contacts.detail" : { }
//
//                    // Абсолютное позиционирование вида 'detail' в состоянии 'contacts'.
//                    // <div ui-view='detail'/> внутри contacts.html
//                    "detail@contact" : {  templateUrl: '/js/private/contact.detail.tpl.html' }
//
//                    // Абсолютное позиционирование безымянного вида в родительском
//                    // состоянии 'contacts'.
//                    // <div ui-view/> внутри contacts.html
//                    // "@contacts" : { }
//
//                    // Абсолютное позиционирование вида 'sidebar' в корневом безымянном состоянии.
//                    // <div ui-view='sidebar'/> внутри index.html (views/page/showhomepage.ejs)
//                    // "sidebar@" : { }
//
//                    // Абсолютное позиционирование безымянного вида в корневом безымянном состоянии.
//                    // <div ui-view/> внутри index.html
//                    // "@" : { }
//                }
//                // .state('route1.viewC', {
//                //     url: "/route1",
//                //     views: {
//                //         "viewC": { template: "route1.viewA" }
//                //     }
//                // })
//                // .state('route2', {
//                //     url: "/route2",
//                //     views: {
//                //         "viewA": { template: "route2.viewA" },
//                //         "viewB": { template: "route2.viewB" }
//                //     }
//                // })
//            })
    })
    .controller('HolidayController', ['$scope', '$window', function ($scope) {
        //$scope.logout = function () {
        //    window.SAILS_LOCALS = {me:null};
        //    $http.get('/logout');
        //}

        $scope.firstName = 'Петя';
        $scope.header = function () {
            return 'Привет, ' + $scope.firstName;
        };

    }]);


