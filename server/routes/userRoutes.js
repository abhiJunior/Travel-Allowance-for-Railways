import { Router } from "express";
import isLoggedIn from "../middlewares/authentication.js";
import { createUser,login,updateProfile,getUser} from "../controllers/userController.js";
const router = Router()


router.post("/register",createUser)
router.get("/me",isLoggedIn,getUser)
router.post("/login",login)

router.patch("/update-profile",isLoggedIn,updateProfile)

export default router