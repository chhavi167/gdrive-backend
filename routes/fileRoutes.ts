import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middlewares/authMiddleware';
import upload from './upload';
import { uploadFile, getMyFiles } from './upload';

const router = express.Router();
const prisma = new PrismaClient();

//upload file middleware
router.post('/upload', verifyToken, upload.single('file'), uploadFile);

// get all my files middleware
router.get('/my-files', verifyToken, getMyFiles);

// Rename File
router.put('/rename/:fileId', verifyToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { fileId } = req.params;
    const { newName } = req.body;

    const file = await prisma.file.findUnique({ where: { id: fileId } });
    if (!file || file.ownerId !== userId) {
       res.status(403).json({ error: 'Not authorized' });
       return;
    }

    const updatedFile = await prisma.file.update({
      where: { id: fileId },
      data: { name: newName },
    });

    res.status(200).json(updatedFile);
  } catch (error) {
    console.error('Rename error:', error);
    res.status(500).json({ error: 'Rename failed' });
  }
});

// Delete File
router.delete('/delete/:fileId', verifyToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { fileId } = req.params;

    const file = await prisma.file.findUnique({ where: { id: fileId } });
    if (!file || file.ownerId !== userId) {
       res.status(403).json({ error: 'Not authorized' });
       return;
    }

    await prisma.file.delete({ where: { id: fileId } });
    res.status(200).json({ message: 'File deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

//  Share File with Users by Email
router.post('/share/:fileId', verifyToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { fileId } = req.params;
    const { userEmails } = req.body;

    const file = await prisma.file.findUnique({
      where: { id: fileId },
      include: { owner: true },
    });

    if (!file || file.ownerId !== userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const usersToShare = await prisma.user.findMany({
      where: { email: { in: userEmails } },
    });

    const updated = await prisma.file.update({
      where: { id: fileId },
      data: {
        accessList: {
          connect: usersToShare.map((u) => ({ id: u.id })),
        },
      },
      include: { accessList: true },
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error('Share error:', error);
    res.status(500).json({ error: 'Share failed' });
  }
});

// Files Shared With Me
router.get('/shared-with-me', verifyToken, async (req, res) => {
  const userId = (req as any).user.userId;

  try {
    const files = await prisma.file.findMany({
      where: {
        accessList: {
          some: { id: userId },
        },
      },
      include: {
        owner: { select: { email: true } },
        accessList: { select: { email: true } },
      },
    });

    res.status(200).json(files);
  } catch (err) {
    console.error('Error fetching shared files:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

export default router;
