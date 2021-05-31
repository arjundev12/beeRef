const config = require("../../../config/config")
const commenFunction = require('../common/Common')
const UsersModel = require('../../models/users');
const moment = require("moment");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const authConfig = require('../../authConfig/auth')
const walletModel = require('../../models/wallet')
const TransactionModel = require('../../models/transactions')
class users {
    constructor() {
        return {
            getTransaction: this.getTransaction.bind(this),
            // uploadeImage: this.uploadeImage.bind(this),
            // submitReferral: this.submitReferral.bind(this)
        }
    }

    //create wallet Api

    async getTransaction(req, res) {
        try {
            let options = {
                page: req.body.page || 1,
                limit: req.body.limit || 10,
                sort: { createdAt: -1 },
                lean: true,
                // select: 'name user_type minner_Activity createdAt',
            }
            console.log("hii", req.body)
            let query = {}
            if (req.body.type && req.body.type != "") {
                query.type = req.body.type
            } if (req.body.toId && req.body.toId != "") {
                query.to_id = req.body.toId
            } if (req.body.todayDate && req.body.todayDate != "") {
                query.createdAt = { "$gte": new Date(req.body.todayDate).toISOString() }// + "T00:00:00Z" 
                query.createdAt["$lte"] = new Date(req.body.todayDate).toISOString()// + "T12:00:00Z"
            } if (req.body.toDate && req.body.toDate != "") {
                query.createdAt = { "$lte": req.body.toDate + "T12:00:00Z" }
            } if (req.body.fromDate && req.body.fromDate != "") {
                query.createdAt["$gte"] = new Date(req.body.fromDate)// + "T00:00:00Z"
            }
            // console.log("query", query)
            // let getUser = await TransactionModel.paginate(query, options)
            let query1 = { "$match": { $and: [{ to_id: query.to_id }, { type: query.type }] } }
            console.log("query1", query.createdAt)
            let past_x_days = 10 * 86400000;
            let getUser = await TransactionModel.aggregate([ query1, {
                $group: {
                    _id:  { dateYMD: { 
                        $dateFromParts : {
                            year: { $year: "$_id" }, 
                            month: { $month: "$_id" }, 
                            day: { $dayOfMonth: "$_id" }
                        },
                        
                    },
                    // amount: "$amount",
                },
                    // {
                    //     createdAt: "$createdAt",
                    // },
                    
                    // SUM: {
                    //     $sum: "$amount"
                    // },
                    COUNT: {
                        $sum: 1
                    }
                }
                
            },  {
                $project: {
                  TotalAmount: { $sum: "$amount"},
                  COUNT:1
                }
              }
        
        ]
            )
            res.json({ code: 200, success: true, message: "Get list successfully ", data: getUser })
        } catch (error) {
            console.log("Error in catch", error)
            res.status(500).json({ success: false, message: "Internal server error", })
        }
    }


    // [
    //     { $project: { day: { $dayOfMonth: '$createdAt' } } },
    //     {
    //         $group: {
    //             _id: {
    //                 day: '$day',
    //                 amount: "$amount",
    //                 status: "$status",
    //                 transaction_type: "$transaction_type",
    //                 type: "$type",
    //                 to_id: "to_id"
    //             },
    //             count: {
    //                 $sum: 1
    //             }
    //         }
    //     }]

}

module.exports = new users();