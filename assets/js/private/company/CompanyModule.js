angular.module('CompanyModule', ['ui.router', 'ngResource', 'ngAnimate','ngMaterial'])
    .config(function ($stateProvider) {
        $stateProvider
            .state('home.company', {
                url: 'company',
                // templateUrl: '/js/private/company/tpl/company.tpl.html'
                //controller: function () {
                //
                //}
                views: {
                    '@': {
                        templateUrl: '/js/private/company/tpl/company.tpl.html',
                        controller: 'CompanyController'
                    },

                    /**
                     * Абсолютное позиционирование вида 'sidebar' в состоянии home.company.
                     * <div ui-view='sidebar'/> внутри /js/private/company/tpl/company.tpl.html
                     * "sidebar@home.company": { какой-то код }
                     * То есть, при выборе определенного состояния (ищи строку типа .state('home.company', и т.д...),
                     * мы в templateUrl этого состояния, вставляем небольшой кусочек разметки <div ui-view='sidebar'/>
                     * с указанием вида, в данном случаи sidebar, который будет выводится вместо этой разметки.
                     * А вид (views), который будет выведен вместо именованой разметки <div ui-view='sidebar'/>,
                     * может быть определен в любом модуле, который связан в системе.
                     * В данном примере сайдбар будет выведен только, конкретно на странице /company, но если
                     * убрать имя состояния (hime.company), то вид будет показан в корневом безымянном состоянии и
                     * будет уже виден в каждом состоянии которое имеет разметку <div ui-view='sidebar'/>
                     * А так как корневой шаблон views/page/showhomepage.ejs содержит несколько тегов разметки:
                     * <div ui-view></div>
                     * <div ui-view="sidebar"></div>
                     * <div ui-view="body"></div>
                     * то сайдбар при не определённом состоянии для вывода, будет виден на всех страницах, которые
                     * заменяют разметку <div ui-view></div>, так как он вставляется рядом
                     * в разметке <div ui-view="sidebar"></div>
                     * <div ui-view></div> - это тег отображающий вид, причём любой вид, читай безымянный
                     * <div ui-view="sidebar"></div> - этот тег отображает именованный вид, имя вида sidebar
                     */
                    //'sidebar@home.company': {
                    //    templateUrl: '/js/private/tpl/sidebar.tpl.html'
                    //}
                }
            })
        ;
    })
    // .constant('CONF_MODULE', {baseUrl: '/user/:userId'})
    // .factory('Users', function ($resource, CONF_MODULE) {
    //     var Users = $resource(
    //         CONF_MODULE.baseUrl,
    //         {userId: '@id'},
    //         // Определяем собственный метод update на обоих уровнях, класса и экземпляра
    //         {
    //             update: {
    //                 method: 'PUT'
    //             }
    //         }
    //     );
    //
    //     Users.prototype.getFullName = function () {
    //         return this.lastName + ' ' + this.firstName + ' ' + this.patronymicName;
    //     };
    //
    //     Users.prototype.ok = function () {
    //         return alert('Сотрудник: ' + this.getFullName() + ' изменён!');
    //     };
    //     Users.prototype.lastDateSetting = function () {
    //         return new Date();
    //     };
    //
    //     return Users;
    // })
;