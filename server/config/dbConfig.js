import mongoose from "mongoose";
import dotenv from "dotenv"


dotenv.config()
const connectToDB = async()=>{
    
    try{
        const {connection} = await mongoose.connect(
            `mongodb+srv://userdb:${process.env.DATABASE_PASSWORD}@cluster0.hkbuoog.mongodb.net/TA?appName=Cluster0`
        )
        if (connection){
            console.log("successfully connected to DB",connection.host)
        }
    }catch(e){
        console.log("error on database connection",e.message)
    }
}

export default connectToDB