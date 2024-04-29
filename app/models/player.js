import mongoose from "mongoose";


const playerSchema = mongoose.Schema(
    {
      firstName: {
        type: String,
        required: [true, "Please add the player firstName"],
      },
      lastName: {
        type: String,
        required: [true, "Please add the player lastName"],
      },
      email: {
        type: String,
        unique: [true, "Email address already taken"],    
      },
      phoneNumber: {
        type: Number,
        required: [true, "Please add the player phoneNumber"],
      },
      region: {
        type: String,  
      },
      winner: {
        type: Boolean,
        default: false // Par défaut, aucun joueur n'est un gagnant
    }
    },
    {
      timestamps: true,
    }
    
);

export const Player = mongoose.model('Player', playerSchema);