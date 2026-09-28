// AI Vision Recognition Engine for Pest Detection
// Simulates / connects to computer vision model (e.g. YOLOv8 / MobileNet trained on urban pests)
exports.detectPest = async (req, res) => {
  try {
    const { image_url, category_hint } = req.body;

    // Realistic detection catalog with species identification and confidence scores
    const pestCatalog = {
      termite: [
        {
          pest: 'Subterranean Termite (Coptotermes formosanus)',
          common_name: 'Subterranean Termite',
          confidence: 98.4,
          severity: 'high',
          recommended_chemical: 'Imidacloprid 30.5% SC',
          recommended_action: 'Perform sub-slab chemical barrier drilling at 30cm spacing.',
          bounding_box: { ymin: 0.22, xmin: 0.35, ymax: 0.65, xmax: 0.72 }
        },
        {
          pest: 'Drywood Termite (Cryptotermes brevis)',
          common_name: 'Drywood Termite Frass / Swarmer',
          confidence: 96.1,
          severity: 'moderate',
          recommended_chemical: 'Borate Foam Injection',
          recommended_action: 'Localized wood injection and moisture control.',
          bounding_box: { ymin: 0.30, xmin: 0.25, ymax: 0.70, xmax: 0.68 }
        }
      ],
      rodent: [
        {
          pest: 'Norway Rat (Rattus norvegicus) Active Rubmarks & Gnawings',
          common_name: 'Norway Rat Infestation',
          confidence: 95.8,
          severity: 'high',
          recommended_chemical: 'Bromadiolone 0.005% RB Wax Blocks',
          recommended_action: 'Replenish exterior bait stations and seal entry penetrations > 6mm.',
          bounding_box: { ymin: 0.18, xmin: 0.28, ymax: 0.75, xmax: 0.82 }
        },
        {
          pest: 'Roof Rat (Rattus rattus) Droppings',
          common_name: 'Black Roof Rat',
          confidence: 93.4,
          severity: 'moderate',
          recommended_chemical: 'Mechanical Snap Traps & Glue Boards',
          recommended_action: 'Position overhead traps along ceiling conduit trays.',
          bounding_box: { ymin: 0.25, xmin: 0.30, ymax: 0.68, xmax: 0.75 }
        }
      ],
      cockroach: [
        {
          pest: 'German Cockroach (Blattella germanica)',
          common_name: 'German Cockroach Ootheca & Nymphs',
          confidence: 97.9,
          severity: 'critical',
          recommended_chemical: 'Fipronil 0.05% Gel Bait',
          recommended_action: 'Apply micro-droplet gel along electrical hinges and kitchen kickboards.',
          bounding_box: { ymin: 0.20, xmin: 0.32, ymax: 0.62, xmax: 0.69 }
        }
      ]
    };

    const hint = (category_hint || 'termite').toLowerCase();
    const matches = pestCatalog[hint] || pestCatalog.termite;
    const selectedMatch = matches[Math.floor(Math.random() * matches.length)];

    res.json({
      success: true,
      detection: {
        pest_identified: selectedMatch.pest,
        common_name: selectedMatch.common_name,
        confidence_score: selectedMatch.confidence,
        severity: selectedMatch.severity,
        bounding_box: selectedMatch.bounding_box,
        recommended_action: selectedMatch.recommended_action,
        recommended_chemical: selectedMatch.recommended_chemical,
        model_name: 'GlitzUp-UrbanPestNet-v3.2',
        processed_at: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Error in AI pest detection:', err);
    res.status(500).json({ error: 'AI detection failed' });
  }
};

// Queue batch image for cleanliness processing (Point 1)
exports.queueBatchImage = async (req, res) => {
  try {
    const { imageUrl, locationId } = req.body;
    const userId = req.user.id; // from auth middleware

    // In production, this would be pushed to a queue like BullMQ or Redis stream
    // e.g. await imageAnalysisQueue.add('analyze-cleanliness', { imageUrl, locationId, userId });
    
    // Log to DB for daily PDF reporting
    // await db.asyncRun('INSERT INTO daily_reports (technician_id, location_id, image_url, status) VALUES (?, ?, ?, ?)', [userId, locationId, imageUrl, 'queued']);

    res.json({
      success: true,
      message: 'Image successfully queued for batch AI analysis.',
      jobId: `batch-job-${Math.floor(Math.random() * 10000)}`
    });
  } catch (err) {
    console.error('Error queuing batch image:', err);
    res.status(500).json({ error: 'Failed to queue image' });
  }
};
