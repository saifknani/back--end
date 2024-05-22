import express from "express";
import multer from 'multer'; // Importer multer ici
import { PlayerController } from "../controllers/player.js";

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Ajout de multer pour gérer l'upload des fichiers

router.post("/registerPlayer", PlayerController.addPlayer);
router.get('/players', PlayerController.listPlayers);
router.get('/player/:id', PlayerController.getPlayer);
router.put('/updatePlayer/:id', PlayerController.updatePlayer);
router.delete('/deletePlayer/:id', PlayerController.deletePlayer);
router.get('/Allplayers', PlayerController.getAllPlayers);
router.get('/getRandomPlayer', PlayerController.getRandomPlayer);
router.get('/winner', PlayerController.getWinner);




// Utilisation de multer pour l'upload du fichier Excel et appel de la méthode importExcel
router.post("/importExcel", upload.single("excelFile"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const filePath = req.file.path;
      const playerData = await PlayerController.importExcel(filePath);
      res.status(200).json(playerData);
    } catch (error) {
      console.error("Error importing Excel file:", error);
      res.status(500).json({ error: "Failed to import Excel file" });
    }
  });

export const playersRouter = router;
