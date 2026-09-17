//user schema
import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import crypto from "node:crypto"

const userSchema = new mongoose.Schema (
    {
        name:{
            type:String,
            required:[true,"please enter your name"],
            // '      jhon              '
            trim:true,
            maxLength:[50,"your name cant exceed 50 characters"]

        },
        email:{
            type:String,
            required:[true,"please enter your email"],
            unique:true,
            lowercase:true,
            trim:true,
            validate:[validator.isEmail,"please enter a vaild email address"]
        },
        password:{
            type:String,
            required:[true,"please enter your password"],
            minLength:[6,"your password must be at least 6 characters"],
                select:false

        },
        passwordConfirm:{
            type:String,
            required:[true,"please confirm your password"],
            validate:{
                validator:function(el){
                    return el === this.password
                },
                message:"invalid password confirm"
            }
        },
        phoneNumber:{
            type:String,
            required:[true,"please enter your phone number"],
            unique:true,
            trim:true,


        },
        role:{
            type:String,
            enum:["user","admin"],
            default:"user"
        },
        avatar:{
            url:{type:String},
            public_id:{type:String}
        },
        passwordChangedAt:{
            type:Date
        },
        passwordResetToken:{
            type:String,
            select:false,
            index:true
        },
        passwordResetExpires:{
            type:Date,
            select:false
        },
    },
    {timestamps:true}
)
//settings not to pass in response in server

userSchema.set("toJSON",{
    transfrom:function(doc,ret){
        delete ret.password;
        delete ret.passwordConfirm;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.__v;
        return ret;

    }
})

//password logic 
//hashing
userSchema.pre("save",async function(){
    if(!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password,12);
    this.passwordConfirm = undefined;
    
})

// login check 
//test123 === 3eft7uiookiu899000
userSchema.methods.correctPassword = async function(candidatePassword,userPassword){
    return await bcrypt.compare(candidatePassword,userPassword);
}

//
userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime()/1000,10
        );
        return JWTTimestamp < changedTimestamp;
    }
    return false;
}

//forgot password
userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto.createHash("sha256")
    .update(resetToken)
    .digest("hex");

    this.passwordResetTokenExpires = Date.now() +10 *60 *1000;
    return resetToken;
}

const User = mongoose.model("User",userSchema);
//in mongodb : users
export{User};