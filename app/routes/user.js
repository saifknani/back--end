import express from "express";
import { UserController } from "../controllers/user.js";
import {validateToken} from "../exception/validateToken.js";
 const router = express.Router();



router.get("/",UserController.listUser);

router.post("/register",UserController.addUser);

router.post("/login", UserController.loginUser);

router.post("/logout", UserController.logoutUser);

router.get("/current", validateToken, UserController.currentUser);

router.put("/update/:id", validateToken,UserController.updateUserProfile);

router.put("/updatepassword/:id", validateToken,UserController.updatePassword);

router.delete('/delete/:id', UserController.deleteUser);


export const usersRouter =router;



