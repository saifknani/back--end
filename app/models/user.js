import mongoose from "mongoose";

const userSchema = mongoose.Schema(
    {
      username: {
        type: String,
        required: [true, "Please add the user name"],
      },
      email: {
        type: String,
        required: [true, "Please add the user email address"],
        unique: [true, "Email address already taken"],
      },
      password: {
        type: String,
        required: [true, "Please add the user password"],
      },
      role: {
        type: String,
        enum: ["admin", "subadmin"],
        default: "subadmin", 
      },
    },
    {
      timestamps: true,
    }
  );

  export const User = mongoose.model('User', userSchema);