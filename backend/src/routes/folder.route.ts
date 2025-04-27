import { Router } from 'express';
import { Request, Response } from 'express';
import { Folder } from '../repository/schemas/Folder.schema';

const router = Router();

// Create a new folder
router.post('/', async (req: Request, res: Response) => {
  const { name, parentId, user } = req.body;

  const newFolder = new Folder({ name, parentId, user });

  try {
    const savedFolder = await newFolder.save();
    res.status(201).json(savedFolder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all folders
router.get('/', async (req: Request, res: Response) => {
  try {
    const folders = await Folder.find();
    res.status(200).json(folders);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
