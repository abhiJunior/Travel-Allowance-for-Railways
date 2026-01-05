import {model,Schema} from "mongoose"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"

dotenv.config()
const userSchema = new Schema({

    fullName : {
        type : String,
        require : [true,"Name is required"],
        minlength : [3,"Min 3 Characters are required"],
        trim : true,
        lowercase : true 
    },

    email : {
        type : String,
        require : [true, "email is required"],
        unique : true ,
        trim : true,
        lowercase : true 
    },
    password : {
        type : String,
        require : [true,"password is required"] ,
        minlength : [6, "Min 6 characters"],
        select: false

    },
    designation : {
        type : String,
        default : null
        
    },
    headquarters:{
        type : String ,
        default : null
        
    },
    rateOfPay : {
        type : Number,
        default : null
        
    },
    rate : {
        type : Number,
        default : null
    },
    pfNumber : {
        type : String,
        default : null
        
    },
    billUnitNo : {
        type : String,
        default : null
        
    },
    division : {
        type : String,
        default : null 
        
    },
    railwayZone : {
        type : String ,
        default : null
    },

    isProfileComplete : {
        type : Boolean,
        default : false
    }
},{
    timestamps:true
})

userSchema.methods = {
    generateJWTToken: function(){
        return jwt.sign(
            {id : this._id , fullName: this.fullName , isProfileComplete: this.isProfileComplete},
            process.env.JWT_PASSWORD,
            {
                expiresIn : process.env.JWT_EXPIRY
            }
        )
    }
}

const User = model("Users",userSchema)

export default User