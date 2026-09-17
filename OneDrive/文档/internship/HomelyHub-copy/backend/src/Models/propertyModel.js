import slugify from 'slugify';
import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
    propertyName: {
        type: String,
        required: [true, 'Property name is required'],
},
description: {
        type: String,
        required: [true, 'Description is required'],
},
extraInfo: {
        type: String,
        default: "checkin on time, good services available."
},
roomType: {
        type: String,
        enum: ["single", "double", "suite", "family", "entire place"],
        default: "single"
},
maximumguest: {
    type: Number,
    required: [true, 'Maximum guest is required'],
},
amenities: [
    {
        name:{
            type: String,
            required:true,
            enum:[
                "wifi",
                "kitchen",
                "air conditioning",
                "washing machine",
                "tv",
                "pool",
                "free parking on premises",
                "hot tub",
                "gym",
            ]
            },
            icon:{
                type: String,
                required:true,
            }

        }
    ],
    images:{
        type:[
            {
                public_id:{
                    type:String
                },
                url:{
                    type:String,
                required:true
            }   
            }
        ],
        validate:{
            validator:function(arr){
                return arr.length >=6;
        },
        message:"Please upload at least 6 images"
    }
    },
    price:{
        type:Number,
        required:[true,"Please enter the price per night"],
        default:1500
    },
    address:{
        area:String,
        city:String,
        state:String,
        pincode:Number
    },

    currentBookings:[
          {
            bookingId:{
                type: mongoose.Schema.Types.ObjectId,
                ref:"Booking" 
            },
             fromDate:{
                 type:Date
            },
            toDate:{
                 type:Date,
         },
         userId:{
            type: mongoose.Schema.Types.ObjectId,
                ref:"User"
         }
          }  
    ],
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    slug:String,
    checkInTime:{type:String,default:"10:00"},
    checkOutTime:{type:String,default:"13:00"}
})

propertySchema.pre("save",function(next){
    this.slug =slugify(this.propertyName,{lower:true});
    next();
})

propertySchema.pre("save",function(next){
    this.address.city = this.address.city.toLowerCase().replaceAll(" ","")
    next();
})

// const Property = mongoose.model("property",propertySchema);

const Property = mongoose.model.Property || mongoose.model("Property",propertySchema);
export{Property};