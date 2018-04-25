/**
 * Created by apetrov on 10.01.2018.
 */
var module = angular.module('customServices', []);


module.service('sampleSvc', ['$window', 'modalSvc', function($window, modalSvc){
    this.showDialog = function(message, title){
        if(title){
            modalSvc.showModalDialog({
                title: title,
                message: message
            });
        } else {
            $window.alert(message);
        }
    };
}]);
// !!! НЕ УДАЛЯТЬ ПРИМЕР !!!
/**
 *  Service Calendar (используется прототипирование)
 *
 *  START
 */
//var baseCalendar = function () {
//    this.year = [new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1, new Date().getFullYear() + 2];
//    /**
//     * Праздники и выходные дни по годам,
//     */
//    let data = [
//        {
//            "Год/Месяц": "2016",
//            "Январь": "1,2,3,4,5,6,7,8,9,10,16,17,23,24,30,31",
//            "Февраль": "6,7,13,14,20*,21,22,23,27,28",
//            "Март": "5,6,7,8,12,13,19,20,26,27",
//            "Апрель": "2,3,9,10,16,17,23,24,30",
//            "Май": "1,2,3,7,8,9,14,15,21,22,28,29",
//            "Июнь": "4,5,11,12,13,18,19,25,26",
//            "Июль": "2,3,9,10,16,17,23,24,30,31",
//            "Август": "6,7,13,14,20,21,27,28",
//            "Сентябрь": "3,4,10,11,17,18,24,25",
//            "Октябрь": "1,2,8,9,15,16,22,23,29,30",
//            "Ноябрь": "3*,4,5,6,12,13,19,20,26,27",
//            "Декабрь": "3,4,10,11,17,18,24,25,31",
//            "Всего рабочих дней": "247",
//            "Всего праздничных и выходных дней": "119",
//            "Количество рабочих часов при 40-часовой рабочей неделе": "1974",
//            "Количество рабочих часов при 36-часовой рабочей неделе": "1776.4",
//            "Количество рабочих часов при 24-часовой рабочей неделе": "1183.6"
//        },
//        {
//            "Год/Месяц": "2017",
//            "Январь": "1,2,3,4,5,6,7,8,14,15,21,22,28,29",
//            "Февраль": "4,5,11,12,18,19,22*,23,24,25,26",
//            "Март": "4,5,7*,8,11,12,18,19,25,26",
//            "Апрель": "1,2,8,9,15,16,22,23,29,30",
//            "Май": "1,6,7,8,9,13,14,20,21,27,28",
//            "Июнь": "3,4,10,11,12,17,18,24,25",
//            "Июль": "1,2,8,9,15,16,22,23,29,30",
//            "Август": "5,6,12,13,19,20,26,27",
//            "Сентябрь": "2,3,9,10,16,17,23,24,30",
//            "Октябрь": "1,7,8,14,15,21,22,28,29",
//            "Ноябрь": "3*,4,5,6,11,12,18,19,25,26",
//            "Декабрь": "2,3,9,10,16,17,23,24,30,31",
//            "Всего рабочих дней": "247",
//            "Всего праздничных и выходных дней": "118",
//            "Количество рабочих часов при 40-часовой рабочей неделе": "1973",
//            "Количество рабочих часов при 36-часовой рабочей неделе": "1775.4",
//            "Количество рабочих часов при 24-часовой рабочей неделе": "1182.6"
//        },
//        {
//            "Год/Месяц": "2018",
//            "Январь": "1,2,3,4,5,6,7,8,13,14,20,21,27,28",
//            "Февраль": "3,4,10,11,17,18,22*,23,24,25",
//            "Март": "3,4,7*,8,9,10,11,17,18,24,25,31",
//            "Апрель": "1,7,8,14,15,21,22,28*,29,30",
//            "Май": "1,2,5,6,8*,9,12,13,19,20,26,27",
//            "Июнь": "2,3,9*,10,11,12,16,17,23,24,30",
//            "Июль": "1,7,8,14,15,21,22,28,29",
//            "Август": "4,5,11,12,18,19,25,26",
//            "Сентябрь": "1,2,8,9,15,16,22,23,29,30",
//            "Октябрь": "6,7,13,14,20,21,27,28",
//            "Ноябрь": "3,4,5,10,11,17,18,24,25",
//            "Декабрь": "1,2,8,9,15,16,22,23,29*,30,31",
//            "Всего рабочих дней": "247",
//            "Всего праздничных и выходных дней": "118",
//            "Количество рабочих часов при 40-часовой рабочей неделе": "1970",
//            "Количество рабочих часов при 36-часовой рабочей неделе": "1772.4",
//            "Количество рабочих часов при 24-часовой рабочей неделе": "1179.6"
//        },
//        {
//            "Год/Месяц": "2019",
//            "Январь": "1,2,3,4,5,6,7,8,9,10,12,13,19,20,26,27",
//            "Февраль": "2,3,9,10,16,17,22*,23,24,25",
//            "Март": "2,3,7*,8,9,10,16,17,23,24,30,31",
//            "Апрель": "6,7,13,14,20,21,27,28,30*",
//            "Май": "1*,4,5,8*,9,11,12,18,19,25,26",
//            "Июнь": "1,2,8,9,11*,12,15,16,22,23,29,30",
//            "Июль": "6,7,13,14,20,21,27,28",
//            "Август": "3,4,10,11,17,18,24,25,31",
//            "Сентябрь": "1,7,8,14,15,21,22,28,29",
//            "Октябрь": "5,6,12,13,19,20,26,27",
//            "Ноябрь": "2,3,4*,9,10,16,17,23,24,30",
//            "Декабрь": "1,7,8,14,15,21,22,28,29,31*",
//            "Всего рабочих дней": "247",
//            "Всего праздничных и выходных дней": "118",
//            "Количество рабочих часов при 40-часовой рабочей неделе": "1970",
//            "Количество рабочих часов при 36-часовой рабочей неделе": "1772.4",
//            "Количество рабочих часов при 24-часовой рабочей неделе": "1179.6"
//        }
//    ];
//    let months = [
//        {'Январь': '01'},
//        {'Февраль': '02'},
//        {'Март': '03'},
//        {'Апрель': '04'},
//        {'Май': '05'},
//        {'Июнь': '06'},
//        {'Июль': '07'},
//        {'Август': '08'},
//        {'Сентябрь': '09'},
//        {'Октябрь': '10'},
//        {'Ноябрь': '11'},
//        {'Декабрь': '12'}
//    ];
//    /**
//     * Официальные праздники РФ
//     */
//    let holiday = [
//        '01.01',
//        '02.01',
//        '03.01',
//        '04.01',
//        '05.01',
//        '06.01',
//        '07.01',
//        '08.01',
//        '23.02',
//        '08.03',
//        '01.05',
//        '09.05',
//        '12.06',
//        '04.11'
//    ];
//    this.getData = function () {
//        return data;
//    };
//    this.getMonths = function () {
//        return months;
//    };
//    this.getHolidayRF = function () {
//        return holiday;
//    };
//    this.showData = function () {
//        return console.log('Доступные данные:', this.getData());
//    };
//    this.getYears = function () {
//        let data = this.getData();
//        let y = this.year;
//        let ob = [];
//        data.forEach(function (v, k, arr) {
//            let g = v["Год/Месяц"];
//            if (y.indexOf(+g) >= 0) {
//                v.year = g;
//                ob.push(v);
//            }
//        });
//        return ob;
//    };
//    this.getCreateDate = function () {
//        let years = this.getYears();
//        let m = this.getMonths();
//        let days = [];
//        for (let k in m) {
//            for (let y in years) {
//                for (let key in years[y]) {
//                    if (m[k][key]) {
//                        let o = {};
//                        o.getOfDay = function () {
//                            let j = [];
//                            let reg = /\*/;
//                            for (let d in this.holiday) {
//                                let day = this.holiday[d];
//                                if (day.match(reg) === null) {
//                                    j.push(day + '.' + this.number + '.' + this.year);
//                                }
//                            }
//                            return j;
//                        };
//                        o.celebration = function () {
//                            let j = [];
//                            let reg = /\*/;
//                            for (let d in this.holiday) {
//                                let day = this.holiday[d];
//                                if (day.match(reg) !== null) {
//                                    j.push(day + '.' + this.number + '.' + this.year);
//                                }
//                            }
//                            return j;
//                        };
//                        o.number = m[k][key];
//                        o.month = key;
//                        o.year = years[y].year;
//                        o.holiday = years[y][key].split(',');
//                        days.push(o);
//                    }
//                }
//            }
//        }
//        return days;
//    };
//    this.getDayOff = function () {
//        let d = this.getCreateDate();
//        var ar = [];
//        d.forEach(function (v, k, arr) {
//            ar = ar.concat(v.getOfDay());
//        });
//        return ar;
//    };
//    this.getCelebration = function () {
//        let d = this.getCreateDate();
//        var ar = [];
//        d.forEach(function (v, k, arr) {
//            ar = ar.concat(v.celebration());
//        });
//        return ar;
//    };
//    this.getHoliday = function () {
//        let h = this.getHolidayRF();
//        let y = this.year;
//        let arr = [];
//        for (let i in y) {
//            for (let d in h) {
//                arr.push(h[d] + '.' + y[i]);
//            }
//        }
//        return arr;
//    };
//    this.getCountDay = function (arr) {
//        console.log('COUNNNTTT date moment:', moment());
//        if (angular.isArray(arr) && arr.length == 2) {
//            let h = this.getHoliday();
//            let t = moment(arr[0]).twix(new Date(arr[1]));
//            let count = +t.count('day');
//            for (let i in h) {
//                if (moment(h[i], 'DD.MM.YYYY').isBetween(arr[0], arr[1])) {
//                    count--
//                }
//                if (moment(h[i], 'DD.MM.YYYY').isSame(arr[0])) {
//                    count--
//                }
//                if (moment(h[i], 'DD.MM.YYYY').isSame(arr[1])) {
//                    count--
//                }
//            }
//            return count;
//        }
//    };
//    /**
//     * Метод проверяет,
//     * пересекается ли выбраный период с уже созданными ранее периодами
//     * @param selectedDates
//     */
//    this.checkBetween = function (selectedDates) {
//        if (angular.isArray(selectedDates) && selectedDates.length == 2) {
//
//
//
//            //let h = this.getHoliday();
//            //let t = moment(arr[0]).twix(new Date(arr[1]));
//            //let count = +t.count('day');
//            //for (let i in h) {
//            //    if (moment(h[i], 'DD.MM.YYYY').isBetween(arr[0], arr[1])) {
//            //        count--
//            //    }
//            //    if (moment(h[i], 'DD.MM.YYYY').isSame(arr[0])) {
//            //        count--
//            //    }
//            //    if (moment(h[i], 'DD.MM.YYYY').isSame(arr[1])) {
//            //        count--
//            //    }
//            //}
//            //return count;
//        }
//    };
//};
//
//var workCalendar = function () {
//};
//workCalendar.prototype = new baseCalendar();
//module.service('calendarService', workCalendar);

//****** END


/**
 * Service provider Calendar
 * Фабричная функция возвращает провайдер объект (provider object), который содержит обязательно, метод $get
 * Метод $get и должен возвращать сервис.
 * Подход с использованием provider функции позволяет
 * выполнить дополнительную конфигурацию сервиса
 *
 * START
 */


module.provider('calendarService', function () {
    /**
     * Переменные, которые устанавливаются при конфигурации провайдера
     * через функции объекта провайдера
     * @type {boolean}
     */

    // Включает/выключает сервис.
    var on = true;


    //Праздники и выходные дни по годам,
    var data = [
        {
            "Год/Месяц": "2016",
            "Январь": "1,2,3,4,5,6,7,8,9,10,16,17,23,24,30,31",
            "Февраль": "6,7,13,14,20*,21,22,23,27,28",
            "Март": "5,6,7,8,12,13,19,20,26,27",
            "Апрель": "2,3,9,10,16,17,23,24,30",
            "Май": "1,2,3,7,8,9,14,15,21,22,28,29",
            "Июнь": "4,5,11,12,13,18,19,25,26",
            "Июль": "2,3,9,10,16,17,23,24,30,31",
            "Август": "6,7,13,14,20,21,27,28",
            "Сентябрь": "3,4,10,11,17,18,24,25",
            "Октябрь": "1,2,8,9,15,16,22,23,29,30",
            "Ноябрь": "3*,4,5,6,12,13,19,20,26,27",
            "Декабрь": "3,4,10,11,17,18,24,25,31",
            "Всего рабочих дней": "247",
            "Всего праздничных и выходных дней": "119",
            "Количество рабочих часов при 40-часовой рабочей неделе": "1974",
            "Количество рабочих часов при 36-часовой рабочей неделе": "1776.4",
            "Количество рабочих часов при 24-часовой рабочей неделе": "1183.6"
        },
        {
            "Год/Месяц": "2017",
            "Январь": "1,2,3,4,5,6,7,8,14,15,21,22,28,29",
            "Февраль": "4,5,11,12,18,19,22*,23,24,25,26",
            "Март": "4,5,7*,8,11,12,18,19,25,26",
            "Апрель": "1,2,8,9,15,16,22,23,29,30",
            "Май": "1,6,7,8,9,13,14,20,21,27,28",
            "Июнь": "3,4,10,11,12,17,18,24,25",
            "Июль": "1,2,8,9,15,16,22,23,29,30",
            "Август": "5,6,12,13,19,20,26,27",
            "Сентябрь": "2,3,9,10,16,17,23,24,30",
            "Октябрь": "1,7,8,14,15,21,22,28,29",
            "Ноябрь": "3*,4,5,6,11,12,18,19,25,26",
            "Декабрь": "2,3,9,10,16,17,23,24,30,31",
            "Всего рабочих дней": "247",
            "Всего праздничных и выходных дней": "118",
            "Количество рабочих часов при 40-часовой рабочей неделе": "1973",
            "Количество рабочих часов при 36-часовой рабочей неделе": "1775.4",
            "Количество рабочих часов при 24-часовой рабочей неделе": "1182.6"
        },
        {
            "Год/Месяц": "2018",
            "Январь": "1,2,3,4,5,6,7,8,13,14,20,21,27,28",
            "Февраль": "3,4,10,11,17,18,22*,23,24,25",
            "Март": "3,4,7*,8,9,10,11,17,18,24,25,31",
            "Апрель": "1,7,8,14,15,21,22,28*,29,30",
            "Май": "1,2,5,6,8*,9,12,13,19,20,26,27",
            "Июнь": "2,3,9*,10,11,12,16,17,23,24,30",
            "Июль": "1,7,8,14,15,21,22,28,29",
            "Август": "4,5,11,12,18,19,25,26",
            "Сентябрь": "1,2,8,9,15,16,22,23,29,30",
            "Октябрь": "6,7,13,14,20,21,27,28",
            "Ноябрь": "3,4,5,10,11,17,18,24,25",
            "Декабрь": "1,2,8,9,15,16,22,23,29*,30,31",
            "Всего рабочих дней": "247",
            "Всего праздничных и выходных дней": "118",
            "Количество рабочих часов при 40-часовой рабочей неделе": "1970",
            "Количество рабочих часов при 36-часовой рабочей неделе": "1772.4",
            "Количество рабочих часов при 24-часовой рабочей неделе": "1179.6"
        },
        {
            "Год/Месяц": "2019",
            "Январь": "1,2,3,4,5,6,7,8,9,10,12,13,19,20,26,27",
            "Февраль": "2,3,9,10,16,17,22*,23,24,25",
            "Март": "2,3,7*,8,9,10,16,17,23,24,30,31",
            "Апрель": "6,7,13,14,20,21,27,28,30*",
            "Май": "1*,4,5,8*,9,11,12,18,19,25,26",
            "Июнь": "1,2,8,9,11*,12,15,16,22,23,29,30",
            "Июль": "6,7,13,14,20,21,27,28",
            "Август": "3,4,10,11,17,18,24,25,31",
            "Сентябрь": "1,7,8,14,15,21,22,28,29",
            "Октябрь": "5,6,12,13,19,20,26,27",
            "Ноябрь": "2,3,4*,9,10,16,17,23,24,30",
            "Декабрь": "1,7,8,14,15,21,22,28,29,31*",
            "Всего рабочих дней": "247",
            "Всего праздничных и выходных дней": "118",
            "Количество рабочих часов при 40-часовой рабочей неделе": "1970",
            "Количество рабочих часов при 36-часовой рабочей неделе": "1772.4",
            "Количество рабочих часов при 24-часовой рабочей неделе": "1179.6"
        }
    ];


    // Месяцы
    var months = [
        {'Январь': '01'},
        {'Февраль': '02'},
        {'Март': '03'},
        {'Апрель': '04'},
        {'Май': '05'},
        {'Июнь': '06'},
        {'Июль': '07'},
        {'Август': '08'},
        {'Сентябрь': '09'},
        {'Октябрь': '10'},
        {'Ноябрь': '11'},
        {'Декабрь': '12'}
    ];


    // Официальные праздники РФ
    var holiday = [
        '01.01',
        '02.01',
        '03.01',
        '04.01',
        '05.01',
        '06.01',
        '07.01',
        '08.01',
        '23.02',
        '08.03',
        '01.05',
        '09.05',
        '12.06',
        '04.11'
    ];


    // provider object
    return {
        /**
         * Функции для установки параметров сервиса
         */

        /**
         * Включает/выключает сервис,
         * либо возвращает установки по умолчанию
         * @param setting
         * @returns {*}
         */
        enabledService: function (setting) {
            if (angular.isDefined(setting)) {
                on = setting;
                return this;
            } else {
                return on;
            }
        },

        /**
         * Устанавливает написание месяцев и порядковый номер месяца,
         * либо возвращает установки по умолчанию
         */
        holidaySet: function (data) {
            return data = data || this;
            //if (angular.isDefined(setting)) {
            //    data = setting;
            //    return this;
            //} else {
            //    //return data;
            //    return this;
            //}
        },

        /**
         * Устанавливает праздники и выходные дни по годам,
         * либо возвращает установки по умолчанию
         */
        monthsSet: function (setting) {
            if (angular.isDefined(setting)) {
                months = setting;
                return this;
            } else {
                //return months;
                return this;
            }
        },

        /**
         * Устанавливает официальные праздники РФ,
         * либо возвращает установки по умолчанию
         */
        officialHolidaysRF: function (setting) {
            if (angular.isDefined(setting)) {
                holiday = setting;
                return this;
            } else {
                return holiday;
            }
        },

        /**
         * Функция возвращает сам объект сервиса уже сконфигурированный
         * @returns {{year: *[]}}
         */
        $get: function () {
            return {
                year: [new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1, new Date().getFullYear() + 2],
                allDaysHolidays: 'Всего праздничных и выходных дней в',
                allDaysWork: 'Всего рабочих дней в',
                hours: 40,
                //hoursName : 'Количество рабочих часов при '+this.hours+'-часовой рабочей неделе в',
                hoursGetDefault: function (hours) {
                    return 'Количество рабочих часов при ' + hours + '-часовой рабочей неделе в';
                },
                getData: function () {
                    return data;
                },
                getMonths: function () {
                    return months;
                },
                getHolidayRF: function () {
                    return holiday;
                },
                showData: function () {
                    return console.log('Доступные данные:', this.getData());
                },
                getYears: function () {
                    let data = this.getData();
                    let y = this.year;
                    let ob = [];
                    data.forEach(function (v, k, arr) {
                        let g = v["Год/Месяц"];
                        if (y.indexOf(+g) >= 0) {
                            v.year = g;
                            ob.push(v);
                        }
                    });
                    return ob;
                },
                getAllWorkHolidayDays: function (yearNumber, text) {
                    text = text || this.allDaysHolidays;
                    let data = this.getData();
                    let currentYear = this.year;
                    let ob = '';
                    data.forEach(function (obj, k, arr) {
                        let works = obj["Всего праздничных и выходных дней"];
                        let year = obj["Год/Месяц"];
                        //console.log('ГОД year: ', year);
                        //console.log('ГОД currentYear: ', currentYear);
                        //console.log('ГОД -1: ', new Date().getFullYear() - 1);
                        if (year == (+yearNumber)) {
                            console.log(text + ' ' + yearNumber + ' г:', works);
                            ob = text + ' ' + yearNumber + ' г: ' + works;
                            //obj.year = g;
                            //ob.push(obj);
                        }
                    });
                    return ob;
                },
                getAllWorkDays: function (yearNumber, text) {
                    text = text || this.allDaysWork;
                    let data = this.getData();
                    let currentYear = this.year;
                    let ob = '';
                    data.forEach(function (obj, k, arr) {
                        let works = obj["Всего рабочих дней"];
                        let year = obj["Год/Месяц"];
                        //console.log('ГОД year: ', year);
                        //console.log('ГОД currentYear: ', currentYear);
                        //console.log('ГОД -1: ', new Date().getFullYear() - 1);
                        if (year == (+yearNumber)) {
                            console.log(text + ' ' + yearNumber + ' г:', works);
                            ob = text + ' ' + yearNumber + ' г: ' + works;
                            //obj.year = g;
                            //ob.push(obj);
                        }
                    });
                    return ob;
                },
                getHoursYear: function (yearNumber, hours, text) {
                    hours = hours || this.hours;
                    text = text || this.hoursGetDefault(hours);
                    let data = this.getData();
                    let ob = '';
                    data.forEach(function (obj, k, arr) {
                        let works = obj["Количество рабочих часов при " + hours + "-часовой рабочей неделе"];
                        let year = obj["Год/Месяц"];
                        //console.log('ГОД year: ', year);
                        //console.log('ГОД currentYear: ', currentYear);
                        //console.log('ГОД -1: ', new Date().getFullYear() - 1);
                        if (year == (+yearNumber)) {
                            console.log(text + ' ' + yearNumber + ' г:', works);
                            ob = text + ' ' + yearNumber + ' г: ' + works;
                            //obj.year = g;
                            //ob.push(obj);
                        }
                    });
                    return ob;
                },
                getCreateDate: function () {
                    let years = this.getYears();
                    let m = this.getMonths();
                    let days = [];
                    for (let k in m) {
                        for (let y in years) {
                            for (let key in years[y]) {
                                if (m[k][key]) {
                                    let o = {};
                                    o.getOfDay = function () {
                                        let j = [];
                                        let reg = /\*/;
                                        for (let d in this.holiday) {
                                            let day = this.holiday[d];
                                            if (day.match(reg) === null) {
                                                j.push(day + '.' + this.number + '.' + this.year);
                                            }
                                        }
                                        return j;
                                    };
                                    o.celebration = function () {
                                        let j = [];
                                        let reg = /\*/;
                                        for (let d in this.holiday) {
                                            let day = this.holiday[d];
                                            if (day.match(reg) !== null) {
                                                j.push(day + '.' + this.number + '.' + this.year);
                                            }
                                        }
                                        return j;
                                    };
                                    o.number = m[k][key];
                                    o.month = key;
                                    o.year = years[y].year;
                                    o.holiday = years[y][key].split(',');
                                    days.push(o);
                                }
                            }
                        }
                    }
                    return days;
                },
                getDayOff: function () {
                    let d = this.getCreateDate();
                    var ar = [];
                    d.forEach(function (v, k, arr) {
                        ar = ar.concat(v.getOfDay());
                    });
                    return ar;
                },
                getCelebration: function () {
                    let d = this.getCreateDate();
                    var ar = [];
                    d.forEach(function (v, k, arr) {
                        ar = ar.concat(v.celebration());
                    });
                    return ar;
                },
                getHoliday: function () {
                    let h = this.getHolidayRF();
                    let y = this.year;
                    let arr = [];
                    for (let i in y) {
                        for (let d in h) {
                            arr.push(h[d] + '.' + y[i]);
                        }
                    }
                    return arr;
                },
                getCountDay: function (arr,countDayTwix) {

                    //console.log('arr0',arr);
                    if (angular.isArray(arr) && arr.length == 2 && countDayTwix) {
                        let h = this.getHoliday();
                        //let t = moment(arr[0]).twix(new Date(arr[1]));
                        //console.log('countDayTwix:::', countDayTwix);
                        //console.log('arr:::', arr);
                        let count = +countDayTwix.count('day');

                        //console.log('COUT::', count);
                        
                        for (let i in h) {
                            if (moment(h[i], 'DD.MM.YYYY').isBetween(arr[0], arr[1])) {
                                count--
                            }
                            if (moment(h[i], 'DD.MM.YYYY').isSame(arr[0])) {
                                count--
                            }
                            if (moment(h[i], 'DD.MM.YYYY').isSame(arr[1])) {
                                count--
                            }
                        }
                        return count;
                    }
                },
                /**
                 * Метод проверяет,
                 * пересекается ли выбраный период с уже созданными ранее периодами
                 * @param selectedDates
                 */
                checkBetween: function (selectedDates) {
                    if (angular.isArray(selectedDates) && selectedDates.length == 2) {



                        //let h = this.getHoliday();
                        //let t = moment(arr[0]).twix(new Date(arr[1]));
                        //let count = +t.count('day');
                        //for (let i in h) {
                        //    if (moment(h[i], 'DD.MM.YYYY').isBetween(arr[0], arr[1])) {
                        //        count--
                        //    }
                        //    if (moment(h[i], 'DD.MM.YYYY').isSame(arr[0])) {
                        //        count--
                        //    }
                        //    if (moment(h[i], 'DD.MM.YYYY').isSame(arr[1])) {
                        //        count--
                        //    }
                        //}
                        //return count;
                    }
                }
            };
        }
    }
});


// ********** END
/**
 *  Service LOGGER (test)
 *
 *  START
 */

var baseLogger = function () {
    this.messageCount = 0;
    this.log = function (msg) {
        console.log("Type " + this.msgType + " LOG #" + this.messageCount++ + ", message = " + msg);
    }
};
var debugLogger = function () {};
debugLogger.prototype = new baseLogger();
debugLogger.prototype.msgType = "Debug";
var errorLogger = function () {};
errorLogger.prototype = new baseLogger();
errorLogger.prototype.msgType = "Error";

// service - метод для создания сервисов. При использовании данного метода
// фабричная функция работает как конструктор.
// Для создания сервисов AngularJS будет запускать эту функцию с использованием ключевого слова new
module.service("logService", debugLogger).service("errorService", errorLogger);

//********* END