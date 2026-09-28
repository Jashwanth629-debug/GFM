const { db } = require('../config/db');

// 1. Chatbot Message Routing (Tokenized Priority)
exports.handleChatbotMessage = async (req, res) => {
  try {
    const { clientName, email, message } = req.body;
    
    // Simulate LLM/NLP categorization for priority
    const priorityText = message.toLowerCase();
    let priority = 'low'; // default
    if (priorityText.includes('urgent') || priorityText.includes('complaint')) priority = 'high';
    else if (priorityText.includes('quote') || priorityText.includes('deal')) priority = 'medium';

    // In a real app, this sends via SendGrid/AWS SES
    console.log(`[EMAIL ROUTING] Sending ${priority.toUpperCase()} priority message to founder@glitzupfm.in and admin inbox.`);
    
    // Log to DB inbox
    // await db.asyncRun('INSERT INTO admin_inbox (client_name, email, message, priority, token_status) VALUES (?, ?, ?, ?, ?)', [clientName, email, message, priority, 'on-going']);

    res.json({ success: true, message: 'Message routed successfully', priority_token: priority });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 2. CRM Clients (Assign Client ID)
exports.getClients = async (req, res) => {
  try {
    // Simulated DB query for clients
    const clients = [
      { client_id: 'GLZ-CLI-001', name: 'Taj Coromandel', contact_number: '+91 9876543210', active_contracts: 2 },
      { client_id: 'GLZ-CLI-002', name: 'ITC Grand Chola', contact_number: '+91 8765432109', active_contracts: 1 }
    ];
    res.json({ clients });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 3. Contracts & Quotations
exports.getContracts = async (req, res) => {
  try {
    // Simulated DB query for cost breakups
    const contracts = [
      { id: 1, client_id: 'GLZ-CLI-001', service_type: 'Deep Cleaning', cost_breakup: { labor: 5000, chemicals: 1200, tax: 1116 }, total: 7316 },
      { id: 2, client_id: 'GLZ-CLI-002', service_type: 'Marble Polishing', cost_breakup: { labor: 8000, abrasives: 2500, tax: 1890 }, total: 12390 }
    ];
    res.json({ contracts });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 4. PMS Gap Analysis (Deep Cleaning Scheduling)
exports.getRoomGaps = async (req, res) => {
  try {
    // Simulating API call to Opera/Guesty PMS to get check-in/checkout times
    const roomGaps = [
      { room_number: '104', previous_checkout: '2026-09-27T11:00:00Z', next_checkin: '2026-09-28T15:00:00Z', gap_hours: 28, deep_cleaning_available: true },
      { room_number: '215', previous_checkout: '2026-09-27T10:00:00Z', next_checkin: '2026-09-27T14:00:00Z', gap_hours: 4, deep_cleaning_available: false }
    ];
    
    // Filter rooms with > 5 hrs gap
    const availableRooms = roomGaps.filter(r => r.deep_cleaning_available);
    
    res.json({ scheduled_rooms: availableRooms });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
