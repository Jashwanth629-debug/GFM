const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const templatesController = require('../controllers/templatesController');
const inspectionsController = require('../controllers/inspectionsController');
const analyticsController = require('../controllers/analyticsController');
const reportsController = require('../controllers/reportsController');
const aiController = require('../controllers/aiController');
const notificationsController = require('../controllers/notificationsController');
const enterpriseController = require('../controllers/enterpriseController'); // New controller for CRM, PMS, Chatbot, Contracts
const { authenticateToken, requireRole } = require('../middleware/auth');

// Public Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'GlitzUp PestCheck Backend API',
    organization: 'GlitzUp Facility Management',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Authentication
router.post('/auth/login', authController.login);
router.post('/auth/pin-login', authController.pinLogin); // Employee PIN + Geolocation login
router.get('/auth/me', authenticateToken, authController.getMe);
router.get('/technicians', authenticateToken, authController.getTechnicians);

// Templates & Facilities
router.get('/templates', authenticateToken, templatesController.getTemplates);
router.get('/facilities', authenticateToken, templatesController.getFacilities);

// Inspections
router.get('/inspections', authenticateToken, inspectionsController.getInspections);
router.get('/inspections/:id', authenticateToken, inspectionsController.getInspectionById);
router.post('/inspections', authenticateToken, inspectionsController.createInspection);
router.put('/inspections/:id/status', authenticateToken, requireRole(['admin', 'qa_supervisor']), inspectionsController.updateStatus);

// Analytics & Reports
router.get('/analytics', authenticateToken, analyticsController.getAnalytics);
router.get('/reports/pdf/:id', reportsController.getInspectionReport); // Publicly viewable / printable certificate
router.get('/reports/excel', authenticateToken, reportsController.exportExcelCSV);

// AI & Notifications
router.post('/ai/pest-detect', authenticateToken, aiController.detectPest);
router.post('/ai/batch-queue', authenticateToken, aiController.queueBatchImage); // Batch processing for cleanliness model
router.get('/notifications', authenticateToken, notificationsController.getNotifications);
router.put('/notifications/:id/read', authenticateToken, notificationsController.markAsRead);
router.post('/notifications/reminder', authenticateToken, requireRole(['admin', 'qa_supervisor']), notificationsController.dispatchReminder);

// Glitzup Enterprise Features (Contracts, CRM, PMS, Chatbot)
router.post('/chatbot/message', enterpriseController.handleChatbotMessage); // Routes to founder/admin inbox based on priority
router.get('/crm/clients', authenticateToken, requireRole(['admin', 'qa_supervisor']), enterpriseController.getClients); // Assign client ID
router.get('/contracts', authenticateToken, requireRole(['admin', 'qa_supervisor']), enterpriseController.getContracts); // Cost breakups
router.get('/pms/gaps', authenticateToken, requireRole(['admin', 'qa_supervisor']), enterpriseController.getRoomGaps); // Deep cleaning scheduling

module.exports = router;
