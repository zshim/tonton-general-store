import { Request, Response } from 'express';
import { User, Transaction, Notification } from '../schemas';
import { sendPushNotification } from '../config/firebase';

const OVERDUE_THRESHOLD_DAYS = 7; // Configurable: Remind if debt is older than 7 days

// @desc    Trigger overdue payment reminders manually or via cron
// @route   POST /api/notifications/reminders
// @access  Private/Manager
export const sendDueReminders = async (req: Request, res: Response) => {
  try {
    const { customMessage } = req.body;
    
    // 1. Find users with pending dues and an FCM token
    const debtors = await User.find({ 
        pendingDues: { $gt: 0 },
        fcmToken: { $exists: true, $ne: '' } 
    });

    if (debtors.length === 0) {
        return res.json({ message: 'No eligible debtors found for notifications.' });
    }

    let sentCount = 0;
    const errors: string[] = [];

    // 2. Logic: 
    // If customMessage is provided, we treat this as a manual broadcast to ALL debtors.
    // If NO customMessage, we apply the "Age" logic (OVERDUE_THRESHOLD) to avoid spamming recent debtors.
    
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - OVERDUE_THRESHOLD_DAYS);
    const isBroadcast = !!customMessage;

    for (const user of debtors) {
        let shouldSend = false;

        if (isBroadcast) {
            shouldSend = true;
        } else {
            // Check "Age" of the debt for automatic reminders
            // Find last transaction
            const lastTx = await Transaction.findOne({ user: user._id }).sort({ date: -1 });
            // If no transaction found (weird data) or last transaction is older than threshold
            if (!lastTx || lastTx.date < thresholdDate) {
                shouldSend = true;
            }
        }

        if (shouldSend) {
            const title = 'Payment Reminder: Outstanding Dues';
            const body = customMessage || `Hello ${user.name}, you have pending dues of ₹${user.pendingDues.toFixed(2)}. Please visit the store to clear them.`;
            
            // Send FCM
            const success = await sendPushNotification(user.fcmToken!, title, body);

            if (success) {
                sentCount++;
                // Log in Database
                await Notification.create({
                    user: user._id,
                    title,
                    message: body,
                    type: 'REMINDER',
                    isRead: false
                });
            } else {
                if (user.email) errors.push(user.email);
            }
        }
    }

    res.json({ 
        message: 'Reminder process completed', 
        totalDebtors: debtors.length,
        remindersSent: sentCount,
        errors 
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update User FCM Token
// @route   PUT /api/notifications/token
// @access  Private
export const updateFcmToken = async (req: any, res: Response) => {
    try {
        const { fcmToken } = req.body;
        if (!fcmToken) return res.status(400).json({ message: 'Token required' });

        const user = await User.findById(req.user._id);
        if (user) {
            user.fcmToken = fcmToken;
            await user.save();
            res.json({ message: 'Token updated' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getMyNotifications = async (req: any, res: Response) => {
    try {
        const notes = await Notification.find({ user: req.user._id }).sort({ sentAt: -1 });
        res.json(notes);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};