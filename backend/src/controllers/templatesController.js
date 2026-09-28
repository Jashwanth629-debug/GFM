const { db } = require('../config/db');

exports.getTemplates = async (req, res) => {
  try {
    const templates = await db.asyncAll('SELECT * FROM inspection_templates WHERE is_active = 1');
    const items = await db.asyncAll('SELECT * FROM template_checklist_items ORDER BY item_order ASC');

    const templatesWithItems = templates.map((tmpl) => ({
      ...tmpl,
      checklist_items: items.filter((item) => item.template_id === tmpl.id)
    }));

    res.json({ templates: templatesWithItems });
  } catch (err) {
    console.error('Error fetching templates:', err);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

exports.getFacilities = async (req, res) => {
  try {
    const facilities = await db.asyncAll('SELECT * FROM facilities WHERE is_active = 1 ORDER BY client_name ASC');
    res.json({ facilities });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch facilities' });
  }
};
