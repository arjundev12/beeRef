const config = require('../../config/config');
var jwt = require('jsonwebtoken');
var request = require('request');
let models = require('./../models');
const Admin = models.login;
let Permission = models.permission_admin;
let Role= models.roles_permission;
const userDetails=models.user_details;

var verifyOptions = {
    issuer: config.i,
    subject: config.s,
    audience: config.BASE_URL,
    expiresIn: config.tempTokenExpiresTime,
    algorithm: config.algorithm
};


class CheckToken {
    constructor() {
        return {
            jwtVerify: this.jwtVerify.bind(this),
            Checkvaliduser: this.Checkvaliduser.bind(this),
            CheckUserlogin: this.CheckUserlogin.bind(this)
        }
    }

    async jwtVerify(req, res, next) {
        console.log(req.headers)
        try {
            jwt.verify(req.headers.token, config.superSecret, async (err, logindecoded) => {
                if (err) {
                    return res.json({ success: false, status: '401', data: 'Failed to authenticate token.' });
                } else {
                    // console.log("logindecoded");
                    // console.log(logindecoded);
                    var node_route = req.route.path
                    // console.log(req.route.path)
                    // console.log(req.route.path.split('/'))

                      let permissionRestulData=await this._userRoleDetails(logindecoded, node_route);
                        console.log("permissionRestulData", permissionRestulData);
                        if(permissionRestulData){
                           return next();
                        } else{
                            res.json({  code : 401, success: false, message: 'You have not permission to acces it !' });
                        }
                      // await this._pkey(logindecoded).then(function (decoded) {
                    //     req.decoded = decoded;
                    //     next();

                    // }).catch(function (error) {
                    //     res.json({ code:401, success: false, status: '401', data: 'Failed to authenticate token.' })
                    // })

                }
            });

        } catch (e) {
            return res.json({ success: false, status: '401', data: e });
        }

    };

    async _pkey(logindecoded) {
        try {

            return new Promise(function (resolve, reject) {
                jwt.verify(logindecoded.etoken, config.publicKEY, verifyOptions, function (err, decoded) {
                    if (err) {
                        //console.log(err)
                        reject(err)
                    } else {
                        //console.log(decoded)
                        resolve(decoded)
                    }
                })
            })
        } catch (e) {
            return e;
        }
    }

    async _userRoleDetails(data, routesName){
        console.log("data", data, routesName);

        let roleDetails=await Admin.findOne({
            where:{
            email:data.email
        },
        attribute:['role_id', 'user_type', 'is_super_admin'],
        raw:true
    })
    
    if(roleDetails){
        if (roleDetails.is_super_admin == 1) {
            return true;
        };
        
        if (roleDetails.is_super_admin != 1 && roleDetails.user_type == "admin") {
            let permissionResult= await Permission.findOne({where:{route_name:routesName}, raw:true});
           
            if(permissionResult){
                let permissionRoleResult= await Role.findOne({where:{
                    permission_id: permissionResult.id,
                    role_id:roleDetails.role_id
                }})
                   if(permissionRoleResult){
                        return true;
                    } else{
                        return false //res.json({  code : 401, success: false, message: 'You have not permission to acces it !' });
                    }

            } else{
                return false //res.json({  code : 401, success: false, message: 'You have not permission to acces it !' });

            }
            
        } else{
            return false
           
        }
        
    }else{
        return res.json({  code : 401, success: false, message: 'You have not permission to acces it !' });

    }


    }
    //check token  users
    async Checkvaliduser(req,res,next){
        try{
            let token = req.cookies.token || req.headers.auth
            if (token) {
              jwt.verify(token, config.superSecret, (err, decoded) => {
                if (err) {
                    console.log("err in token", err);
                  return res.json ({ message: "authentication failed", code: 400 ,error:null })
                }
                else {
                  console.log(decoded);
                  req.users = decoded;
                  console.log("success");
                  next()
                }
              })
            } else {
                return res.json ({ message: "authentication failed", code: 400 ,error:null })
           }

        }catch(e){
            return res.json ({ message: "authentication failed", code: 400 ,error:null })
        }
       
    }
    // vierifi jwt for users
    async CheckUserlogin(req,res,next){
        try{
            let token = req.headers.token || req.headers.auth
            let email = req.headers.email 
            if (token) {
              jwt.verify(token, config.superSecret, async (err, decoded) => {
                console.log(decoded);
                if (err) {
                    if (err.name == "TokenExpiredError"){
                          let data =await this._checkLoginStatus(email)
                          console.log("data, ", data)
                          if (data){
                              console.log("data, ", data)
                              let stoken = {
                                id: data.id,
                                email: data.email,
                            }
                            let token1 = await jwt.sign(stoken, config.superSecret, { expiresIn: '7d' })                           
                            req.headers.token =token1
                            next()
                          }else{
                            return res.json ({  code : 401, success: false, message: "jwt expired"})
                          }                         
                    }else{
                        return res.json ({  code : 401, success: false, message: "authentication failed"})
                    }
                }
                else {                  
                //   req.users = decoded;
                let data =await this._checkLoginStatus(email)
                  console.log("success" ,data);
                  if (data){
                    next()
                  }else{
                    return res.json ({ code: 400, success: false,message: "authentication failed"})
                  }
                 
                }
              })
            } else {
                return res.json ({ code: 400, success: false,message: "authentication failed"})
           }

        }catch(e){
            return res.json ({  code: 400 , success: false, message: "authentication failed" })
        }
       
    }
    async _checkLoginStatus(data){
        try {

            let userdata=await Admin.findOne({
                where:{
                email:data
            },
            attribute:["id",'is_now_login',"email", 'user_type'],
            raw:true
        })
        if(userdata.is_now_login == "1"){
            return userdata
        }else{
            return null
        }
        } catch (error) {
            console.log("error in checkLoginStatus",error)
        }
      
    
    }
}

module.exports = new CheckToken();


