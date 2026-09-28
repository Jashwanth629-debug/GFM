const { db } = require('../config/db');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await db.asyncAll(`
      SELECT n.*, i.inspection_number 
      FROM notifications n
      LEFT JOIN inspections i ON n.inspection_id = i.id
      ORDER BY n.sent_at DESC
      LIMIT 30
    `);
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await db.asyncRun('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
};

exports.dispatchReminder = async (req, res) => {
  try {
    const { technician_id, inspection_id, message, channel } = req.body;
    const notifId = `notif-${Date.now()}`;
    await db.asyncRun(
      `INSERT INTO notifications (id, recipient_id, inspection_id, channel, title, message)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        notifId,
        technician_id,
        inspection_id,
        channel || 'sms',
        'Task Reminder Dispatch',
        message || 'Reminder: You have a scheduled inspection pending for review.'
      ]
    );

    res.json({ success: true, message: `Notification sent via ${channel || 'SMS'}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to dispatch reminder' });
  }
};
