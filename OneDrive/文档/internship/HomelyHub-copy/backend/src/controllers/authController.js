import {User} from "../Models/userModel.js";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import imagekit from "../utils/ImagekitIO.js";
import { sendMail, forgotPasswordMailGenContent} from "../utils/mail.js";
import {signinToken,createSendToken,defaultAvatarUrl,filterObj} from "../utils/token.js";
import { decode } from "node:punycode";


//signup : create the account

const signup = async(req,res) =>{
    try{
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
            avatar: {url:req.body.avatar || defaultAvatarUrl(req.body.name)}
        })
        

        createSendToken(newUser,201,res)

    }catch (error) {
    const duplicateField = Object.keys(error.keyPattern || {})[0];

    const message = duplicateField
        ? `An account with that ${duplicateField} already exists`
        : error.message;

    res.status(400).json({ message });
}

}

// login :check email +password, then give token 

const login = async(req,res) =>{
    try{
        const {email,password} = req.body;
        if(!email || !password){
            throw new Error("please provide email or password")
        }

        const user = await User.findOne({email}).select("+password")

        if(!User || (await user.correctPassword(password,user.password)) === false){
            throw new Error("incorrect email or password")
        }

        createSendToken(user,200,res)
    }catch(error){
        // 
        res.status(401).json({status:"fail", message:error.message})
    }
}

//protect
const protect = async(req,res,next)=>{
    try{
        let token;
        if(
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ){ //this is from smtg like postman
            token= req.headers.authorization.split(" ")[1]
            //if its from brower thn else if
        }else if(req.cookies.jwt && req.cookies.jwt !=="loogedout"){
            token = req.cookies.jwt;
        }

        //step2: no token so stop here
        if(!token){
            throw new Error("you are not logged in!please login to access")
        }

        // step:3 if token is real??
        const decoded =jwt.verify(token,process.env.JWT_SECRET)
        
        //step 4: token is real but user still exists?
        const currentUser = await User.findById(decoded.id);
        if(!currentUser){
            throw new Error("the user belonging to the token dosent exists")
        };

        //step 5:
        if(currentUser.changedPasswordAfter(decoded.iat)){
            throw new Error("user recently changed the password,please login again")
        }

        //step :6 all checks are vaild
        req.user =currentUser;
        next();
    }
    catch(error){
        res.status(401).json({
            status:"fail",
            message:error.message
        })
    }
}


export {signup, login,protect};
    







 