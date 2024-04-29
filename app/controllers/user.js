import { User } from "../models/user.js";
import { handler } from "../exception/handler.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export class UserController{

    static async listUser(req, res) {
        try {
        
      
            const users = await User.find();
            return res.json(users);
        } catch (error) {
            return handler(res, 'USERS_LIST_FETCH', error.message);
        }
    }

    static async addUser(req, res) {
      try {
        const { username, email, password ,role} = req.body;

        if (!username || !email || !password) {
          res.status(400);
          throw new Error('All fields are mandatory!');
        }

        const hashedpassword = await bcrypt.hash(password, 10);
        const user = await User.create({
          username,
          email,
          password: hashedpassword,
          role,
        }); 
        if (user) {
          res.status(201).json({ _id: user.id, email: user.email });
        } else {
          res.status(400);
          throw new Error('User data is not valid');
        }
      } catch (error) { 
        res.status(500).json({ error: error.message });}
    }
    
    static async  checkUserRole(requiredRole) {
      return (req, res, next) => {
        const userRole = req.user.role; 
        if (userRole === requiredRole) {
          next(); 
        } else {
          res.status(403).json({ message: "Access denied. Insufficient privileges." });
        }
      };
    }

    static async loginUser(req, res) {
      try {
        const { email, password } = req.body;
        if (!email || !password) {
          handler(res, 'BAD_REQUEST', 'Tous les champs sont obligatoires', 400);
          return;
        }
        
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
          req.session.userId = user._id;
          req.session.email = user.email;
          const accessToken = jwt.sign(
            {
              user: {
                username: user.username,
                email: user.email,
                id: user.id,
                role: user.role,
              },
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1h' }
          );
          res.status(200).json({ accessToken });
          
        } else {
          handler(res, 'UNAUTHORIZED', 'L\'e-mail ou le mot de passe n\'est pas valide', 401);
        }
      } catch (error) {
        handler(res, 'INTERNAL_SERVER_ERROR', 'Une erreur interne du serveur s\'est produite', 500);
      }
    }

    static async logoutUser(req, res) {
      try {
        if (req.session) {
          req.session.destroy((err) => {
            if (err) {
              console.error('Erreur lors de la déconnexion :', err);
              res.sendStatus(500);
            } else {
              res.sendStatus(200);
            }
          });
        } else {
          res.sendStatus(400); 
        }
      } catch (error) {
        console.error('Erreur lors de la déconnexion :', error);
        res.sendStatus(500);
      }
    }

    static async currentUser(req, res)  {
        res.json(req.user);
      };

      
      static async updateUserProfile(req, res) {
        try {
          const { username, email, role } = req.body;
          const userId = req.params.id; 
      
          const user = await User.findById(userId);
      
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }
      
          if (username) {
            user.username = username;
          }
          if (email) {
            user.email = email;
          }
          
          if (role) {
            user.role = role;
          }
      
          await user.save();
      
          return res.status(200).json({ message: 'User profile updated successfully', user });
        } catch (error) {
          return handler(res, 'INTERNAL_SERVER_ERROR', 'An internal server error occurred', 500);
        }
      }
      


      static async updatePassword(req, res) {
        try {
          const { currentPassword, newPassword,confirmNewPassword } = req.body;
          const userId = req.params.id;
          const user = await User.findById(userId);
          
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }
          
          const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
          if (!isPasswordValid) {
            return res.status(400).json({ message: 'Current password is incorrect' });
          }
          
          if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
          }
          const hashedPassword = await bcrypt.hash(newPassword, 10);
          user.password = hashedPassword;

          await user.save();
          
          return res.status(200).json({ message: 'Password updated successfully' });
        } catch (error) {
          return handler(res, 'INTERNAL_SERVER_ERROR', 'An internal server error occurred', 500);
        }
      }

     

      static async deleteUser(req, res) {
        try {
          const userId = req.params.id;
    
          
          const deletedUser = await User.findByIdAndDelete(userId);
    
          if (deletedUser) {
           
            return res.status(200).json({ message: 'User deleted successfully' });
          } else {
            
            return res.status(404).json({ message: 'User not found' });
          }
        } catch (error) {
          
          return handler(res, 'INTERNAL_SERVER_ERROR', 'An internal server error occurred', 500);
        }
      }


}

