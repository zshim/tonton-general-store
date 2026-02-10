import express from 'express';
import {
  sendDueReminders,
  updateFcmToken,
  getMyNotifications
} from '../controllers/notificationController';
import { protect, managerOnly } from '../middleware/authMiddleware';

const router = express.Router();

// Trigger reminders (Manager only)
router.post('/reminders', protect, managerOnly, sendDueReminders);

// Update FCM Token (Client calls this on app load)
router.put('/token', protect, updateFcmToken);

// Get Notifications
router.get('/', protect, getMyNotifications);

export default router;