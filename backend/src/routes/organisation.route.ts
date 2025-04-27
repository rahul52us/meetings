
import express from 'express';
import { getChooseInputService } from '~/services/organisation.service';


const router = express.Router();

router.get('/chooseinput', (req, res) => {
  try {
    const data = getChooseInputService();
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error retrieving chooseinput data' });
  }
});

export default router;
