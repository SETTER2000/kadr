'use strict';
/**
 * SkdController
 *
 * @description :: Server-side logic for managing skds
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const XlsxPopulate = require('xlsx-populate');
const Ranges = require('named-ranges');
const DateRu = require('date-ru');
const moment = require('moment');
const Watcher = require('listener-dir');
const _ = require('lodash');

Array.prototype.diff = function (a) {
    return this.filter(function (i) {
        return a.indexOf(i) < 0;
    });
};
module.exports = {
    // getListMonth: function (req, res) {
    //     if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
    //     User.findOne({id: req.session.me}).exec((err, foundUser) => {
    //         if (err) return res.negotiate;
    //         if (!foundUser) return res.notFound();
    //         Skd.native(function (err, collection) {
    //             if (err) return res.serverError(err);
    //             collection.aggregate([{
    //                     $project: {
    //                         month: {$month: "$date"},
    //                         _id: 0
    //                     }
    //                 },
    //                     {$group: {_id: "$month"}},
    //                     {$project: {month: "$_id"}},
    //                     {$sort: {month: -1}}
    //                 ])
    //                 .toArray(function (err, results) {
    //                     if (err) return res.serverError(err);
    //                     return res.ok(results);
    //                 });
    //         });
    //
    //     });
    // },
    // getListData: function (req, res) {
    //     if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
    //     User.findOne({id: req.session.me}).exec((err, foundUser) => {
    //         if (err) return res.negotiate;
    //         if (!foundUser) return res.notFound();
    //         Skd.native(function (err, collection) {
    //             if (err) return res.serverError(err);
    //             collection.aggregate([{
    //                     $project: {
    //                         year: {$year: "$date"},
    //                         month: {$month: "$date"},
    //                         day: {$dayOfMonth: "$date"},
    //                         hour: {$hour: "$date"},
    //                         minutes: {$minute: "$date"},
    //                         seconds: {$second: "$date"},
    //                         milliseconds: {$millisecond: "$date"},
    //                         dayOfYear: {$dayOfYear: "$date"},
    //                         dayOfWeek: {$dayOfWeek: "$date"},
    //                         week: {$week: "$date"},
    //                         date: 1,
    //                         name: 1,
    //                         _id: 0
    //                     }
    //                 },
    //                     {
    //                         $group: {
    //                             _id: {
    //                                 day: {$dayOfYear: "$date"},
    //                                 year: {$year: "$date"},
    //                                 month: {$month: "$date"},
    //                                 name: "$name"
    //                             },
    //                             //months: {
    //                             //    $push: {
    //                             //        date: "$date",
    //                             //        name: "$name"
    //                             //    }
    //                             //},
    //                             count: {$sum: 1}
    //                         }
    //                     },
    //                     {
    //                         $project: {
    //                             year: "$_id",
    //                             //months: 1
    //                         }
    //                     },
    //                     {$sort: {year: -1}}
    //                 ])
    //                 .toArray(function (err, results) {
    //                     if (err) return res.serverError(err);
    //                     return res.ok(results);
    //                 });
    //         });
    //
    //     });
    // },
    getListYear: function (req, res) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        User.findOne({id: req.session.me}).exec((err, foundUser) => {
            if (err) return res.negotiate;
            if (!foundUser) return res.notFound();
            Skd.native(function (err, collection) {
                if (err) return res.serverError(err);
                collection.aggregate([{
                        $project: {
                            year: {$year: "$date"},
                            _id: 0
                        }
                    },
                        {
                            $group: {
                                _id: "$year",
                            }
                        },
                        {$project: {year: "$_id", months: 1}},
                        {$sort: {year: -1}}
                    ])
                    .toArray(function (err, results) {
                        if (err) return res.serverError(err);
                        return res.ok(results);
                    });
            });

        });
    },
    get: function (req, res) {
        if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
        User.findOne({id: req.session.me})
            .exec((err, foundUser) => {
                if (err) return res.negotiate;
                if (!foundUser) return res.notFound();
                //sails.log('req.param(regex): ', req.param('regex'));
                let reg = {$regex: req.param('regex'), $options: "si"};

                let selectedYear = (_.isEmpty(req.param('year'))) ? '' : req.param('year');
                let limit = (_.isEmpty(req.param('limit'))) ? 100000 : req.param('limit');
                let page = (_.isEmpty(req.param('page'))) ? 0 : req.param('page');

                let sort = {'_id.date': -1, '_id.name': 1};
                if (req.param('sortField') == 'date') {
                    sort = {'_id.date': +req.param('sortTrend'), '_id.name': 1};
                }
                if (req.param('sortField') == 'name') {
                    sort = {'_id.date': -1, '_id.name': +req.param('sortTrend')};
                }

                let skip = (+page * +limit);
                Skd.native(function (err, collection) {
                    if (err) return res.serverError(err);
                    collection.find({}, {date: 1, _id: 0}).sort({"date": -1}).limit(1)
                        .toArray(function (err, dateLast) {
                            if (err) return res.serverError(err);
                            Skd.native(function (err, collection) {
                                if (err) return res.serverError(err);
                                sails.log('Отработанное время. Поиск по дате:', req.param('sd'));
                                //"2017-06-23"
                                let searchDate = (req.param('sd')) ? req.param('sd') : '';
                                let match = (searchDate) ? {
                                    $match: {
                                        date: {
                                            $gte: new Date(moment(searchDate[0], ['YYYY-MM-DD HH:mm:ss ZZ']).format('YYYY-MM-DD')),
                                            $lte: new Date(moment(searchDate[1], ['YYYY-MM-DD HH:mm:ss ZZ']).format('YYYY-MM-DD'))
                                        }, name: reg
                                    }
                                } : {
                                    $match: {
                                        date: {$gte: dateLast[0].date}, name: reg
                                    }
                                };
                                collection.aggregate([match,
                                    {$sort: {startPeriod: 1}},
                                    {
                                        $group: {
                                            _id: {owner: "$owner", name: "$name", date: "$date"},
                                            //_id: {name: req.param('name'), date: "$date"},
                                            periods: {
                                                $push: {
                                                    start: "$startPeriod",
                                                    end: "$endPeriod",
                                                    workTimePeriod: {$subtract: ["$endPeriod", "$startPeriod"]}
                                                }
                                            },
                                            maxEnd: {$max: "$endPeriod"},
                                            minStart: {$min: "$startPeriod"},
                                            periodСount: {$sum: 1}
                                        }
                                    },
                                    {$sort: sort},
                                    {
                                        $project: {
                                            minStart: 1,
                                            maxEnd: 1,
                                            periods: 1,
                                            sections: 1,
                                            section: 1,
                                            periodСount: 1,
                                            workTime: {$subtract: ["$maxEnd", "$minStart"]}
                                        }
                                    },
                                    {$skip: +skip},
                                    {$limit: +limit}
                                ]).toArray(function (err, results) {
                                    if (err) return res.serverError(err);
                                    return res.ok(results);
                                });
                            });
                        });
                });
            });
    },
    // findSkds: function (req, res) {
    //     if (!req.session.me) return res.view('public/header', {layout: 'homepage'});
    //     User.findOne({id: req.session.me})
    //         .exec((err, foundUser) => {
    //             if (err) return res.negotiate;
    //             if (!foundUser) return res.notFound();
    //             let limit = (_.isEmpty(req.param('limit'))) ? 3 : req.param('limit');
    //             let sort = (_.isEmpty(req.param('sort'))) ? 'lastName' : req.param('sort');
    //             let query = (_.isEmpty(req.param('id'))) ? {where: {}, sort: sort, limit: limit} : req.param('id');
    //             let page = (_.isEmpty(req.param('page'))) ? 1 : req.param('page');
    //
    //             User.find(query)
    //                 .populate('skds')
    //                 .paginate({page: page, limit: limit, sort: sort})
    //                 .exec((err, foundSkd)=> {
    //                     //Skd.find({sort:req.param('sort')}).paginate({page: 1, limit: 3}).exec((err,foundSkd)=> {
    //                     if (err) return res.negotiate(err);
    //                     res.ok(foundSkd);
    //                 });
    //         });
    // },
    createReport: function (req, res) {
        User.findOne({id: req.session.me})
            .exec(function (err, foundUser) {
                if (err) return res.negotiate;
                if (!foundUser) return res.notFound();
                Skd.findOrCreate({
                        name: req.param('name'),
                        startPeriod: req.param('startPeriod'),
                        endPeriod: req.param('endPeriod'),
                        date: req.param('date'),
                        owner: foundUser.id
                    })
                    .exec(function (err, createdTutorial) {
                        if (err) return res.negotiate(err);

                        return res.json({id: createdTutorial.id});
                    });
            });
    },


    // createAttendance: function (req, res) {
    //
    //     User.findOne({
    //             lastName: 'Якимов'
    //         })
    //         .exec(function (err, foundUser) {
    //             if (err) return res.negotiate;
    //             if (!foundUser) return res.notFound();
    //
    //
    //             Skd.create({
    //                 name: req.param('name'),
    //                 startPeriod: req.param('startPeriod'),
    //                 owner: foundUser.id
    //             }).exec(function (err, createdTutorial) {
    //                 if (err) return res.negotiate(err);
    //
    //                 foundUser.tutorials.add(createdTutorial.id);
    //
    //                 foundUser.save(function (err) {
    //                     if (err) return res.negotiate(err);
    //
    //                     return res.json({id: createdTutorial.id});
    //                 });
    //             });
    //         });
    // },
    getReportSkd: function (req, res) {
        function SKD(sourceReportSkd, targetReportSkd) {
            this.name = {};
            this.dateCreate = new Date(0, 0, 0);
            this.startPeriod = new Date(0, 0, 0);
            this.endPeriod = new Date(0, 0, 0);
            this.headerOneRow = {};
            this.headerTwoRow = {};
            this.data = [];
            this.sourceReportSkd = sourceReportSkd;
            this.targetReportSkd = targetReportSkd;
        }


        /**
         *  После определения класса Watcher можно воспользоваться им,
         *  создав объект Watcher
         *  Первый аргумен папка для прослушивания
         *  Второй аргумент папка назначения файла. Куда он будет перемещён.
         * @type {Watcher}
         */
        var watcher2 = new Watcher(sails.config.skd.targetReportSkd, sails.config.skd.sourceReportSkdErr);


        /**
         * В только что созданном объекте Watcher можно использовать метод on,
         * унаследованный от класса генератора событий, чтобы создать
         * логику обработки каждого файла,
         */
        watcher2.on('process', function process(file) {
            const watchFile = this.watchDir + '/' + file;
            const processedFile = this.processedDir + '/' + file;
            const pathToXlsxFile = watchFile;

            /**
             * Путь и название файла отчета по загрузке
             * @type {string}
             */
            const pathToReport = processedFile;

            const date = new Date();
            const tpl = '%d.%m.%y %H:%M:%S';
            const tpl2 = '%d.%m.%y_%H-%M-%S';
            const dateRu = new DateRu(date, tpl);
            const dateRu2 = new DateRu(date, tpl2);

            /**
             * Текущая дата
             */
            // dateRu.localFormat();


            /**
             * Именование статусов
             * @type {string}
             */
            const statusSec = 'Принят частично';
            const statusOk = 'Принят полностью';
            const statusErr = 'Не принят';


            /**
             * Формируем название файла отчёта NEW
             */
            const date2 = dateRu.localFormat();
            const fname = 'report-' + dateRu2 + '.xlsx';


            /**
             *  Массив-шаблон названия столбцов,
             *  с его помощью будет проверяться соответствие столбцов в загружаемом файле
             * @type {string[]}
             */
            const arrNameColumnsIdeal = [
                'Дата',
                'Отдел',
                'ФИО',
                'Таб. №',
                'События'
            ];


            // Загрузить существующую книгу xlsx
            XlsxPopulate.fromFileAsync(pathToXlsxFile)
                .then(
                    function (workbook) {
                        "use strict";

                        /**
                         * Название листа.
                         * @type {Sheet|Sheet|undefined}
                         */
                        const nameList = workbook.sheet(0);


                        /**
                         * Матрица вся книга.
                         * @type {Range|undefined}
                         */
                        const matrix = workbook.sheet(0).usedRange();


                        /**
                         * Всего строк в книге
                         */
                        const allRows = matrix._numRows;


                        /**
                         * Проверяем наличие данных в книге
                         */
                        if (allRows < 2) {
                            console.log('Книга пустая, проверять нечего! ');
                            // return res.forbidden({
                            //     message: 'Книга пустая, проверять нечего! '
                            // });
                        }


                        /**
                         * Количество колонок в прайсе, которое должно быть по умолчанию
                         * @type {Number}
                         */
                        const countColumnsIdeal = arrNameColumnsIdeal.length;


                        /**
                         *  Массив для добавления имён столбцов из загружаемого файла
                         * @type {Array}
                         */
                        const arrNameColumns = [];

                        /**
                         *  Получить названия колонок в загружаемом файле
                         */
                        for (var i = 1; i <= countColumnsIdeal; i++) {
                            var nameColumn = workbook.sheet(0).row(7).cell(i).value();
                            if (typeof nameColumn == 'undefined' && arrNameColumns.length < countColumnsIdeal) {
                                console.log('Кол-во колонок не совпадает с шаблоном по умолчанию! ');
                                // return res.forbidden({
                                //     message: 'Кол-во колонок не совпадает с шаблоном по умолчанию! ' +
                                //     'Должно быть ' + countColumnsIdeal + ' колонок. '
                                // });
                            }
                            if (arrNameColumnsIdeal[i - 1] !== nameColumn) {
                                console.log('Не верное имя колонки ++++!');
                                // return res.forbidden({
                                //     message: 'Не верное имя колонки ' +
                                //     nameColumn + '! Колонка должна называться ' + arrNameColumnsIdeal[i - 1]
                                // });
                            }

                            arrNameColumns.push(workbook.sheet(0).row(7).cell(i).value());
                        }


                        /**
                         * Инициализация объектов диапазона
                         * @type {Ranges}
                         */
                        // Объект all будет содержать общую информацию по книге
                        const all = new Ranges(workbook, 'ALL', `A1:J${allRows}`);
                        const named = new Ranges(workbook, 'NAMED', 'A1:F1');
                        const info = new Ranges(workbook, 'INFO', 'C3:D5');
                        const header = new Ranges(workbook, 'HEADER', 'A7:E7');
                        const headerTwo = new Ranges(workbook, 'HEADERTWO', 'E8:F8');
                        const dateReport = new Ranges(workbook, 'DATEREPORT', `A9:A${allRows}`);
                        const department = new Ranges(workbook, 'DEPARTMENT', `B9:B${allRows}`, {
                            bold: true,
                            fontFamily: 'Arial',
                            numberFormat: 4,
                            fontSize: 8,
                            fontColor: 'ff0000',
                            horizontalAlignment: 'center',
                            verticalAlignment: 'center'
                        });
                        const fio = new Ranges(workbook, 'FIO', `C9:C${allRows}`);
                        const tab = new Ranges(workbook, 'TAB', `D9:D${allRows}`);
                        const coming = new Ranges(workbook, 'COMING', `E9:E${allRows}`);
                        const exit = new Ranges(workbook, 'EXIT', `F9:F${allRows}`);


                        /**
                         * Инициализация имён диапазонов в загружаемой книге
                         */

                            // ALL
                        workbook.definedName(all.getName(), workbook.sheet(0).range(all.getRange()));

                        // NAMED
                        workbook.definedName(named.getName(), workbook.sheet(0).range(named.getRange()));

                        // INFO
                        workbook.definedName(info.getName(), workbook.sheet(0).range(info.getRange()));

                        // HEADER
                        workbook.definedName(header.getName(), workbook.sheet(0).range(header.getRange()));

                        // HEADERTWO
                        workbook.definedName(headerTwo.getName(), workbook.sheet(0).range(headerTwo.getRange()));

                        // DATEREPORT
                        workbook.definedName(dateReport.getName(), workbook.sheet(0).range(dateReport.getRange()));

                        // DEPARTMENT
                        workbook.definedName(department.getName(), workbook.sheet(0).range(department.getRange()));

                        // FIO
                        workbook.definedName(fio.getName(), workbook.sheet(0).range(fio.getRange()));

                        // TAB
                        workbook.definedName(tab.getName(), workbook.sheet(0).range(tab.getRange()));

                        // COMING
                        workbook.definedName(coming.getName(), workbook.sheet(0).range(coming.getRange()));

                        // EXIT
                        workbook.definedName(exit.getName(), workbook.sheet(0).range(exit.getRange()));


                        /**
                         * VALIDATION
                         */
                        dateReport.validationColumn(/^[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])|undefined/gi);
                        fio.validationReplaceStringColumn(/([а-яё]+)\s(\(.*\))\s([а-яё]+)\s([а-яё]+)/gi, '$1 $3 $4');
                        fio.validationColumn(/^([а-яё]+)\s([а-яё]+)\s([а-яё]+)|undefined/gi);
                        coming.validationReplaceStringColumn(/(\([а-яё]+\))/gi, 0);
                        coming.validationReplaceStringColumn(/(\d\d:\d\d)\s\(\d+\)/gi, '$1');
                        exit.validationReplaceStringColumn(/(\([а-яё]+\))/gi, 0);
                        exit.validationReplaceStringColumn(/(\d\d:\d\d)\s\(\d+\)/gi, '$1');


                        /**
                         * Применить стили для диапазона
                         */
                        department.setStyle();


                        /**
                         * Собираем номера строк, которые имеют ошибки во входящем прайсе
                         * @type {Array.<T>}
                         */
                        all.arrRowsError = all.arrRowsError.concat(
                            all.arrRowsError,
                            header.arrRowsError,
                            headerTwo.arrRowsError,
                            named.arrRowsError,
                            info.arrRowsError,
                            dateReport.arrRowsError,
                            department.arrRowsError,
                            fio.arrRowsError,
                            tab.arrRowsError,
                            coming.arrRowsError,
                            exit.arrRowsError
                        );


                        /**
                         * Сверяет кол-во колонок с шаблоном по умолчанию
                         */
                        if (countColumnsIdeal != arrNameColumns.length) {
                            console.log('Кол-во колонок не совпадает с шаблоном по умолчанию!');
                            // return res.forbidden({
                            //     message: 'Кол-во колонок не совпадает с шаблоном по умолчанию!'
                            // });
                        }

                        /**
                         * В загружаемом файле, проверяем соответствие заголовков столбцов шаблону и
                         * возвращаем массив заголовков не соответствующих шаблону либо пустой массив
                         *
                         */
                        var rs = arrNameColumnsIdeal.diff(arrNameColumns);

                        if (rs.length == 1) {
                            const cll = workbook.sheet(0).row(7).find(rs[0]);
                            workbook.sheet(0).row(7).cell(cll[0]._columnNumber).style({bold: true, fontColor: 'f90b0b'});
                            workbook.toFileAsync(pathToReport);
                            console.log('Ошибка в названии столбца ');
                            // return res.badRequest({
                            //     message: 'Ошибка в названии столбца ' + rs + '!',
                            //     avatarFd: nameFileUpload,
                            //     goReport: true
                            // });
                        }

                        if (rs.length > 1) {
                            console.log('Есть ошибки в названии столбцов ' + rs + '!');
                            // return res.badRequest('Есть ошибки в названии столбцов ' + rs + '!');
                        }


                        // !!! НЕ УДАЛЯТЬ !!
                        console.log('');
                        console.log('***********************************');
                        console.log('*    Имя файла                    *');
                        console.log('***********************************');
                        console.log(file);
                        console.log('');
                        console.log('***********************************');
                        console.log('*    Всего ошибок                *');
                        console.log('***********************************');
                        console.log(all.arrRowsError.length);
                        console.log('');
                        console.log('***********************************');
                        console.log('*    Кол-во ошибок в колонках     *');
                        console.log('***********************************');
                        console.log('Header: ' + header.currentError + ' Строки: ' + header.arrRowsError);
                        console.log('HeaderTwo: ' + headerTwo.currentError + ' Строки: ' + headerTwo.arrRowsError);
                        console.log('NAMED: ' + named.currentError + ' Строки: ' + named.arrRowsError);
                        console.log('INFO: ' + info.currentError + ' Строки: ' + info.arrRowsError);
                        console.log('DateReport: ' + dateReport.currentError + ' Строки: ' + dateReport.arrRowsError);
                        console.log('Department: ' + department.currentError + ' Строки: ' + department.arrRowsError);
                        console.log('Fio: ' + fio.currentError + ' Строки: ' + fio.arrRowsError);
                        console.log('Tab: ' + tab.currentError + ' Строки: ' + tab.arrRowsError);
                        console.log('Coming: ' + coming.currentError + ' Строки: ' + coming.arrRowsError);
                        console.log('Exit: ' + exit.currentError + ' Строки: ' + exit.arrRowsError);
                        console.log('');
                        console.log('**********************************************');
                        console.log('* Процентное соотношение загружаемого прайса *');
                        console.log('**********************************************');
                        console.log('Валидный на: ' + all.getAllValidPercent() + '%');
                        console.log('Ошибок: ' + all.getAllErrorPercent() + '%');
                        console.log('');


                        if (all.uniqueArray().length == (allRows - 1)) {
                            console.log('Книга не валидная! Ни одна строка не записана.');
                            // return res.forbidden({
                            //     message: 'Книга не валидная! Ни одна строка не записана.'
                            // });
                        }

                        if (all.arrRowsError.length) {
                            workbook.toFileAsync(pathToReport).then((response)=> {
                                // fs.unlink(pathToXlsxFile, (err)=> {
                                //     "use strict";
                                //     if (err) console.log('ВНИМАНИЕ! ОШИБКА! Не могу удалить файл отчёта: ' +pathToXlsxFile);
                                // })
                            }).catch((error) => {
                                console.log(error, 'Promise error 9997788');
                            });
                        } else {

                        }


                    }
                ).catch((error) => {
                console.log(error, 'Promise error 885588');
            });

        });

        /**
         * Теперь, после создания всего необходимого кода, инициировать мониторинг
         * папки можно с помощью такой команды:
         */
        watcher2.start();


        // Skd.destroy({vendor: vendor}).exec(function (err, destr) {
        //     if (err) sails.log('Ошибка при удалении записей из БД');
        //     let price = all.rowsValidArr();
        //     if (price.length > 0) {
        //         Skd.findOrCreate(price, price).exec(
        //             function userCreat(err, creat) {
        //                 if (err) return res.negotiate(err);
        //
        //                 if (all.arrRowsError.length) {
        //                     workbook.toFileAsync(pathToReport);
        //                     return res.ok({
        //                         status: 202,
        //                         message: statusSec,
        //                         avatarFd: nameFileUpload,
        //                         progress: all.getAllValidPercent(),
        //                         errorPercent: all.getAllErrorPercent(),
        //                         dateUpload: date2,
        //                         uploaderButtonPrice: false,
        //                         allEr: all.arrRowsError.length,
        //                         goReport: true
        //                     });
        //                 } else {
        //                     return res.ok({
        //                         message: statusOk,
        //                         avatarFd: nameFileUpload,
        //                         progress: all.getAllValidPercent(),
        //                         errorPercent: all.getAllErrorPercent(),
        //                         dateUpload: date2,
        //                         uploaderButtonPrice: false,
        //                         allEr: all.arrRowsError.length,
        //                         textParams: req.params.all(),
        //                         goReport: true
        //                     });
        //                 }
        //
        //                 // Price.find().sort({vendor: 1}).exec(
        //                 //     function userCreated(err, price) {
        //                 //         if (err) return res.negotiate(err);
        //                 //         if (!price) return res.notFound();
        //                 //         let io = 1;
        //                 //         async.each(price, function (priceRow, next) {
        //                 //                 io++;
        //                 //                 fullPrice.sheet(0).row(io).cell(1).value(priceRow.vendor);
        //                 //                 fullPrice.sheet(0).row(io).cell(2).value(priceRow.dax_id);
        //                 //                 fullPrice.sheet(0).row(io).cell(3).value(priceRow.vendor_id);
        //                 //                 fullPrice.sheet(0).row(io).cell(4).value(priceRow.vendor_id2);
        //                 //                 fullPrice.sheet(0).row(io).cell(5).value(priceRow.description);
        //                 //                 fullPrice.sheet(0).row(io).cell(6).value(priceRow.status);
        //                 //                 fullPrice.sheet(0).row(io).cell(7).value(priceRow.currency);
        //                 //                 fullPrice.sheet(0).row(io).cell(8).value(priceRow.dealer_price);
        //                 //                 fullPrice.sheet(0).row(io).cell(9).value(priceRow.special_price);
        //                 //                 fullPrice.sheet(0).row(io).cell(10).value(priceRow.open_price);
        //                 //                 fullPrice.sheet(0).row(io).cell(11).value(priceRow.note);
        //                 //
        //                 //                 return next();
        //                 //             },
        //                 //             function (err) {
        //                 //                 if (err) return res.negotiate(err);
        //                 //             });
        //                 //
        //                 //
        //                 //         return fullPrice.toFileAsync(full + 'price.xlsx').then(
        //                 //             function (fulFilled) {
        //                 //
        //                 //             },
        //                 //             function (reject) {
        //                 //                 sails.log('Prommissss 55 ' + reject);
        //                 //             }
        //                 //         );
        //                 //     }
        //                 // );
        //             });
        //     }
        // });

    }
//     getList: function (req, res) {
//         User.find({}).exec(function getUser(err, users) {
//             if (err) return res.negotiate(err);
//             if (users) {
//                 async.each(users, function (userRow, next) {
//                         console.log(userRow);
//                         return next();
//                     },
//                     function (err) {
//                         sails.log(err);
//                         if (err) return res.negotiate('uhu' + err);
//                     });
//                 res.ok();
//             }
//         });
//     }


};

