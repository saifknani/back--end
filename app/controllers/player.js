import { Player } from "../models/player.js";
import xlsx from 'xlsx';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

export class PlayerController {

    static async addPlayer(req, res) {
        try {
            const { firstName, lastName, email, phoneNumber, region } = req.body;

            if (!firstName || !lastName || !phoneNumber) {
                res.status(400);
                throw new Error('All fields are mandatory!');
            }

            const existingPlayer = await Player.findOne({ email });
            if (existingPlayer) {
                // Si un joueur avec la même adresse e-mail existe déjà, mettez à jour ses informations au lieu d'ajouter un nouvel enregistrement
                existingPlayer.firstName = firstName;
                existingPlayer.lastName = lastName;
                existingPlayer.phoneNumber = phoneNumber;
                existingPlayer.region = region;

                await existingPlayer.save();
                res.status(200).json({ _id: existingPlayer.id, message: 'Player information updated' });
            } else {
                // Sinon, créez un nouveau joueur et enregistrez-le dans la base de données
                const newPlayer = await Player.create({
                    firstName,
                    lastName,
                    email,
                    phoneNumber,
                    region,
                });

                res.status(201).json({ _id: newPlayer.id, message: 'New player added' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async importExcel(filePath) {
        try {
            console.log("File path:", filePath); // Log the file path
            const workbook = xlsx.readFile(filePath);
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const excelData = xlsx.utils.sheet_to_json(worksheet);
    
            // Assurez-vous que les colonnes spécifiées correspondent exactement aux en-têtes de colonnes dans votre fichier Excel
            const firstNameCol = "Participant Name";
            const emailCol = "Participant email";
            const phoneNumberCol = "phoneNumber";
    
            const importedPlayers = []; // Tableau pour stocker les données des joueurs importés
    
            for (let i = 0; i < excelData.length; i++) {
                const rowData = excelData[i];
                const fullName = rowData[firstNameCol];
                const email = rowData[emailCol];
                const phoneNumber = rowData[phoneNumberCol];
    
                if (!fullName || !email || !phoneNumber) {
                    console.error(`Missing mandatory fields in record ${i + 1}. Skipping...`);
                    continue;
                }
    
                // Utilisez une expression régulière pour extraire le prénom et le nom du participant
                const nameMatch = fullName.match(/^(\S+)\s(.+)$/);
                if (!nameMatch) {
                    console.error(`Invalid name format in record ${i + 1}. Skipping...`);
                    continue;
                }
                const firstName = nameMatch[1];
                const lastName = nameMatch[2];
    
                // Vérifiez si le joueur existe déjà dans la base de données
                const existingPlayer = await Player.findOne({ email });
    
                if (existingPlayer) {
                    // Mettre à jour les informations du joueur existant avec les nouvelles données du fichier Excel
                    existingPlayer.firstName = firstName;
                    existingPlayer.lastName = lastName;
                    existingPlayer.phoneNumber = phoneNumber;
    
                    await existingPlayer.save();
                    importedPlayers.push(existingPlayer); // Ajouter le joueur mis à jour au tableau des joueurs importés
                } else {
                    // Créez un nouveau joueur et enregistrez-le dans la base de données
                    const newPlayer = await Player.create({
                        firstName,
                        lastName,
                        email,
                        phoneNumber,
                    });
                    importedPlayers.push(newPlayer); // Ajouter le nouveau joueur au tableau des joueurs importés
                }
            }
    
            return { players: importedPlayers }; // Renvoyer les données des joueurs importés au format JSON
        } catch (error) {
            console.error('Error importing Excel file:', error); // Log any errors
            throw new Error('Failed to import Excel file');
        }
    }


    static async getRandomPlayer(req, res) {
        try {
            // Vérifier s'il y a déjà un joueur gagnant dans la base de données
            const existingWinner = await Player.findOne({ winner: true });
    
            if (existingWinner) {
                return res.status(400).json({ message: 'There is already a winner' });
            }
    
            // Réinitialiser tous les joueurs gagnants
            await Player.updateMany({}, { winner: false });
    
            const count = await Player.countDocuments();
            const randomIndex = Math.floor(Math.random() * count);
            const randomPlayer = await Player.findOne().skip(randomIndex);
    
            if (!randomPlayer) {
                return res.status(404).json({ message: 'No players found' });
            }
    
            // Marquer le joueur sélectionné comme gagnant
            randomPlayer.winner = true;
            await randomPlayer.save();
    
            return res.status(200).json(randomPlayer);
        } catch (error) {
            return res.status(500).json({ error: 'An internal server error occurred' });
        }
    }
    
    static async getAllPlayers(req, res) {
        try {
            const players = await Player.find();
            return res.status(200).json(players);
        } catch (error) {
            return res.status(500).json({ error: 'An internal server error occurred' });
        }
    }


    static async listPlayers(req, res) {
        try {
            let { page, limit } = req.body;
            page = parseInt(page)
            limit = parseInt(limit)
            console.log(page, limit);
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;

            const players = await Player.find().skip(startIndex).limit(limit);
            const totalPlayersCount = await Player.countDocuments();

            const paginationInfo = {
                currentPage: page,
                totalPages: Math.ceil(totalPlayersCount / limit),
                totalPlayers: totalPlayersCount
            };

            return res.json({ players, paginationInfo });
        } catch (error) {
            return handler(res, 'PLAYERS_LIST_FETCH', error.message);
        }
    }

    static async getPlayer(req, res) {
        try {
            const player = await Player.findById(req.params.id);
            if (!player) {
                return res.status(404).json({ error: 'Player not found' });
            }
            res.status(200).json(player);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updatePlayer(req, res) {
        try {
            const { firstName, lastName, email, phoneNumber, region } = req.body;
            const playerId = req.params.id;

            const player = await Player.findById(playerId);

            if (!player) {
                return res.status(404).json({ message: 'Player not found' });
            }

            if (firstName) {
                player.firstName = firstName;
            }
            if (lastName) {
                player.lastName = lastName;
            }
            if (email) {
                player.email = email;
            }
            if (phoneNumber) {
                player.phoneNumber = phoneNumber;
            }
            if (region) {
                player.region = region;
            }

            await player.save();

            return res.status(200).json({ message: 'Player updated successfully', player });
        } catch (error) {
            return handler(res, 'INTERNAL_SERVER_ERROR', 'An internal server error occurred', 500);
        }
    }

    static async deletePlayer(req, res) {
        try {
            const playerId = req.params.id;

            const deletedPlayer = await Player.findByIdAndDelete(playerId);

            if (deletedPlayer) {
                return res.status(200).json({ message: 'Player deleted successfully' });
            } else {
                return res.status(404).json({ message: 'Player not found' });
            }
        } catch (error) {
            return handler(res, 'INTERNAL_SERVER_ERROR', 'An internal server error occurred', 500);
        }
    }
}