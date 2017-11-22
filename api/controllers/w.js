db.vacation.aggregate([
    {
        $match: {
            $or: [
                {$and: [{from: {$lte: ISODate('2017-11-19')}}, {to: {$gte: ISODate('2017-11-19')}}, {owner: ObjectId('58e35656594105801c9d9203')}]},
                {$and: [{from: {$lte: ISODate('2017-11-20')}}, {to: {$gte: ISODate('2017-11-20')}}, {owner: ObjectId('58e35656594105801c9d9203')}]},
                {$and: [{from: {$gt: ISODate('2017-11-19')}}, {to: {$lt: ISODate('2017-11-20')}}, {owner: ObjectId('58e35656594105801c9d9203')}]}
            ]
        }
    }
]);


db.vacation.aggregate([
    {
        $match: {
            $or: [
                {$and: [{from: {$lte: ISODate('2017-11-19')}}, {to: {$gte: ISODate('2017-11-19')}}, {owner: ObjectId('58e35656594105801c9d9203')}, {furlough: ObjectId("599d87cbb88be82bf00a176f")}]},
                {$and: [{from: {$lte: ISODate('2017-11-20')}}, {to: {$gte: ISODate('2017-11-20')}}, {owner: ObjectId('58e35656594105801c9d9203')}, {furlough: ObjectId("599d87cbb88be82bf00a176f")}]},
                {$and: [{from: {$gt: ISODate('2017-11-19')}}, {to: {$lt: ISODate('2017-11-20')}}, {owner: ObjectId('58e35656594105801c9d9203')}, {furlough: ObjectId("599d87cbb88be82bf00a176f")}]}
            ]
        }
    }
]).pretty();


db.vacation.aggregate([
    {
        $match: {
            $or: [
                {$and: [{from: {$lte: ISODate('2017-11-19')}}, {to: {$gte: ISODate('2017-11-19')}}, {owner: ObjectId('58e35656594105801c9d9203')}, {furlough: ObjectId("599d87cbb88be82bf00a176f")}]},
                {$and: [{from: {$lte: ISODate('2017-11-20')}}, {to: {$gte: ISODate('2017-11-20')}}, {owner: ObjectId('58e35656594105801c9d9203')}, {furlough: ObjectId("599d87cbb88be82bf00a176f")}]},
                {$and: [{from: {$gt: ISODate('2017-11-19')}}, {to: {$lt: ISODate('2017-11-20')}}, {owner: ObjectId('58e35656594105801c9d9203')}, {furlough: ObjectId("599d87cbb88be82bf00a176f")}]}
            ]
        }
    },
    {
        $group: {
            _id: "$_id",
            periods: {
                $push: {name: "$name", from: "$from", to: "$to", owner: "$owner"}
            }
        }
    }
]).pretty();


db.vacation.aggregate([
    {
        $match: {
            $or: [
                {$and: [{from: {$lte: ISODate('2017-11-19')}}, {to: {$gte: ISODate('2017-11-19')}}, {owner: ObjectId('58e35656594105801c9d9203')}]},
                {$and: [{from: {$lte: ISODate('2017-11-20')}}, {to: {$gte: ISODate('2017-11-20')}}, {owner: ObjectId('58e35656594105801c9d9203')}]},
                {$and: [{from: {$gt: ISODate('2017-11-19')}}, {to: {$lt: ISODate('2017-11-20')}}, {owner: ObjectId('58e35656594105801c9d9203')}]}
            ]
        }
    },
    {
        $group: {
            _id: "$furlough",
            number: {$sum: 1},
            furloughs: {$push: {name: "$name"}}
        }
    }
]).pretty();


db.vacation.aggregate([
    {
        $match: {
            $or: [
                {$and: [{from: {$lte: ISODate('2017-11-19')}}, {to: {$gte: ISODate('2017-11-19')}}, {owner: ObjectId('58e35656594105801c9d9203')}]},
                {$and: [{from: {$lte: ISODate('2017-11-20')}}, {to: {$gte: ISODate('2017-11-20')}}, {owner: ObjectId('58e35656594105801c9d9203')}]},
                {$and: [{from: {$gt: ISODate('2017-11-19')}}, {to: {$lt: ISODate('2017-11-20')}}, {owner: ObjectId('58e35656594105801c9d9203')}]}
            ]
        }
    },
    {
        $lookup: {
            from: "furlough",
            localField: "furlough",
            foreignField: "_id",
            as: "furlough_docs"
        }
    },
    {
        $group: {
            _id: "$furlough",
            number: {$sum: 1},
            furloughs: {$push: {name: "$name"}}
        }
    }
]).pretty();

db.vacation.aggregate([
    {
        $match: {
            $or: [
                {$and: [{from: {$lte: ISODate('2017-11-19')}}, {to: {$gte: ISODate('2017-11-19')}}, {owner: ObjectId('58e35656594105801c9d9203')}]},
                {$and: [{from: {$lte: ISODate('2017-11-20')}}, {to: {$gte: ISODate('2017-11-20')}}, {owner: ObjectId('58e35656594105801c9d9203')}]},
                {$and: [{from: {$gt: ISODate('2017-11-19')}}, {to: {$lt: ISODate('2017-11-20')}}, {owner: ObjectId('58e35656594105801c9d9203')}]}
            ]
        }
    },
    {
        $lookup: {
            from: "furlough",
            localField: "furlough",
            foreignField: "_id",
            as: "furlough_docs"
        }
    },
    {
        $unwind: "$furlough_docs"
    }
]).pretty();

db.vacation.aggregate([
    {
        $match: {
            $or: [{$and: [{from: {$lte: ISODate('2017-11-19')}}, {to: {$gte: ISODate('2017-11-19')}}, {owner: ObjectId('58e35656594105801c9d9203')}]},
                {$and: [{from: {$lte: ISODate('2017-11-20')}}, {to: {$gte: ISODate('2017-11-20')}}, {owner: ObjectId('58e35656594105801c9d9203')}]},
                {$and: [{from: {$gt: ISODate('2017-11-19')}}, {to: {$lt: ISODate('2017-11-20')}}, {owner: ObjectId('58e35656594105801c9d9203')}]}]
        }
    },
    {
        $lookup: {
            from: "furlough", localField: "furlough", foreignField: "_id",
            as: "furlough_docs"
        }
    },
    {$unwind: "$furlough_docs"},
    {
        $group: {
            _id: {
                fixIntersec: "$furlough_docs.fixIntersec"
            },
            number: {$sum: 1},
            furloughs: {
                $push: {
                    furlough_id: "$furlough_docs._id", vacation_id: "$_id", name: "$name", fixIntersec: "$furlough_docs.fixIntersec",
                    type: "$furlough_docs.name",
                    go: {
                        $in: ["$furlough_docs._id", ['599d87bbb88be82bf00a176d', '599d87cbb88be82bf00a176f', '599d883db88be82bf00a1772']]
                    }, fu: "$furlough_docs._id.valueOf()"
                }
            }
        }
    }
]).pretty();


db.vacation.aggregate([{$match: {$or: [{$and: [{from: {$lte: ISODate('2017-11-19')}}, {to: {$gte: ISODate('2017-11-19')}}, {owner: ObjectId('58e35656594105801c9d9203')}]},
                {$and: [{from: {$lte: ISODate('2017-11-20')}}, {to: {$gte: ISODate('2017-11-20')}}, {owner: ObjectId('58e35656594105801c9d9203')}]},
                {$and: [{from: {$gt: ISODate('2017-11-19')}}, {to: {$lt: ISODate('2017-11-20')}}, {owner: ObjectId('58e35656594105801c9d9203')}]}]}}, {$lookup: {
            from: "furlough", localField: "furlough", foreignField: "_id",
            as: "furlough_docs"}},{$unwind: "$furlough_docs"}, {$group: {
            _id: {
                fixIntersec: "$furlough_docs.fixIntersec"
            },
            number: {$sum: 1},
            a: {$push: "$furlough_docs._id"},
            furloughs: {
                $push: {
                    furlough_id: "$furlough_docs._id", vacation_id: "$_id", name: "$name", fixIntersec: "$furlough_docs.fixIntersec",
                    type: "$furlough_docs.name",
                    go: {
                        $in: ["$furlough_docs._id", ['599d87bbb88be82bf00a176d', '599d87cbb88be82bf00a176f', '599d883db88be82bf00a1772']]
                    }, fu: "$furlough_docs._id.valueOf()"
                }} }}
]).pretty();




db.vacation.aggregate([
    { $match: {$or: [{$and: [{from: {$lte: ISODate('2017-11-19')}}, {to: {$gte: ISODate('2017-11-19')}}, {owner: ObjectId('58e35656594105801c9d9203')}]},
                {$and: [{from: {$lte: ISODate('2017-11-20')}}, {to: {$gte: ISODate('2017-11-20')}}, {owner: ObjectId('58e35656594105801c9d9203')}]},
                {$and: [{from: {$gt: ISODate('2017-11-19')}}, {to: {$lt: ISODate('2017-11-20')}}, {owner: ObjectId('58e35656594105801c9d9203')}]}]
        }},
    {$lookup: {
            from: "furlough", localField: "furlough", foreignField: "_id",
            as: "furlough_docs"
        } },
    {$unwind: "$furlough_docs"},
    {$group: {
            _id: {
                fixIntersec: "$furlough_docs.fixIntersec"
            },
            number: {$sum: 1},
            a: {$push: "$furlough_docs._id"} }
    },{$project:{ fu: {
        $map: {
            input: "$a",
            as: "grade",
            in: {
                oldItemId: '$$grade._id', // Returns ObjectId
                _id: {$literal: ObjectId().valueOf()}
            }
        }
    }}}
]).pretty();

fu:{
    $map: {
        input: "$furlough_docs._id",
            as
    :
        "grade",
    in:
        {
            $in: ["$$grade", ['599d87bbb88be82bf00a176d', '599d87cbb88be82bf00a176f', '599d883db88be82bf00a1772']]
        }
    }
}

db.vacation.aggregate([
    {
        $match: {
            $or: [
                {$and: [{from: {$lte: ISODate('2017-11-19')}}, {to: {$gte: ISODate('2017-11-19')}}, {owner: ObjectId('58e35656594105801c9d9203')}]},
                {$and: [{from: {$lte: ISODate('2017-11-20')}}, {to: {$gte: ISODate('2017-11-20')}}, {owner: ObjectId('58e35656594105801c9d9203')}]},
                {$and: [{from: {$gt: ISODate('2017-11-19')}}, {to: {$lt: ISODate('2017-11-20')}}, {owner: ObjectId('58e35656594105801c9d9203')}]}
            ]
        }
    },
    {
        $lookup: {
            from: "furlough",
            localField: "furlough",
            foreignField: "_id",
            as: "furlough_docs"
        }
    },
    {
        $unwind: "$furlough_docs"
    },
    {
        $group: {
            _id: "$furlough_docs.fixIntersec",
            number: {$sum: 1},
            furloughs: {
                $push: {
                    id: "$_id", name: "$name", fixIntersec: "$furlough_docs.fixIntersec", type: "$furlough_docs.name"
                }
            }
        }
    },
    {
        $project: {
            A: 1, B: 1, sameElements: {$setEquals: ["$A", "$B"]}, _id: 0
        }
    }
]).pretty();


db.vacation.aggregate([
    {
        $lookup: {
            from: "furlough",
            localField: "furlough",
            foreignField: "_id",
            as: "furlough_docs"
        }
    }
]).pretty();