
import User from "../models/User.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export const createUser = async(req,res)=>{

    const userExist = await User.findOne({email : req.body.email})
    if (userExist){
        return res.status(403).send({status:false,message:"User already exist"})
    }

    const userData = req.body 
    try{
        userData.password = await bcrypt.hash(userData.password,10);
        const data = await User.create(userData)
        return res.status(200).send({status:true,message:"Successfully register!",data : data})
    }catch(e){
        console.log("erorr on createUser",e.message)
        return res.status(500).send({status:false,message:e.message})
    }
}

export const login = async(req,res)=>{
    try{
        const {email,password} = req.body 

        const validUser = await User.findOne({email:email.toLowerCase()}).select("+password")

        if (!validUser){
            return res.status(401).send({status:false,message:"Invalid Credentails"})
        }

        const isMatch = await bcrypt.compare(password,validUser.password)

        if (!isMatch){
            return res.status(401).send({status:false,message:"Invalid Credentails"})
        }

        const jwtToken = await validUser.generateJWTToken()

        return res.status(200).send({
            status:true,
            message:"Sucessfully Login",
            token : jwtToken,
            user : {
                id : validUser._id,
                name : validUser.fullName,
                email : validUser.email,
                isProfileComplete : validUser.isProfileComplete
            }
        })

    }catch(e){
        console.log("error on login",e.message)
        return res.status(500).send({status:false,message:e.message})
    }
}


export const updateProfile = async(req,res)=>{
    try{
        const {pfNumber,billUnitNo,designation,headquarters,division,rateOfPay,railwayZone,rate} = req.body
        
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
                pfNumber,
                billUnitNo,
                designation,
                headquarters,
                division,
                rateOfPay,
                rate,
                railwayZone,
                isProfileComplete : true
            },
            {new : true}
        )

        return res.status(200).send({status:true,message:"Profile Updated successfully",user:updatedUser})

    }catch(e){
        console.log("error on updateProfile",e.message)
        return res.status(500).send({
            status : false,
            message : e.message
        })
    }
}

export const getUser = async(req,res)=>{
    try{
        
        const id = req.user.id 
        const userData = await User.findById({_id : id})
        if (!userData){
            return res.status(404).send({status:false,message:"User not found"})
        }
        
        return res.status(200).send(userData)
    }catch(e){
        console.log("error",e.message)
        return res.status(500).send({status:false,message:e.message})
    }
}