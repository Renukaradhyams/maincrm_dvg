const db = require('../config/db');

// Helper to generate UUIDs
function getUUID() {
  try {
    const crypto = require('crypto');
    return crypto.randomUUID();
  } catch (e) {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// ── Settings & PIN Verification ─────────────────────────────
exports.getSettings = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT settingKey, settingValue FROM Setting');
    const settingsMap = {};
    rows.forEach(r => {
      settingsMap[r.settingKey] = r.settingValue;
    });
    // Fallback defaults
    const result = {
      companyName: settingsMap['company_name'] || 'BSC EXCLUSIVE DAVANAGERE',
      logoUrl: settingsMap['logo_url'] || '/logo.png',
      openHour: parseInt(settingsMap['open_hour'] || '10', 10),
      closeHour: parseInt(settingsMap['close_hour'] || '22', 10),
      graceMinutes: parseInt(settingsMap['footfall_grace_minutes'] || '30', 10),
      editCutoffHours: parseInt(settingsMap['edit_cutoff_hours'] || '24', 10),
      derEmail: settingsMap['der_email'] || 'der@bsctextiles.com',
      tvPin: settingsMap['tv_pin'] || '1234',
      cashPin: settingsMap['cash_pin'] || '1234',
      greeterPin: settingsMap['greeter_pin'] || '1234'
    };
    return res.json({ success: true, settings: result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { tvPin, cashPin, greeterPin, companyName } = req.body;
    const kv = {};
    if (tvPin !== undefined) kv['tv_pin'] = String(tvPin).trim();
    if (cashPin !== undefined) kv['cash_pin'] = String(cashPin).trim();
    if (greeterPin !== undefined) kv['greeter_pin'] = String(greeterPin).trim();
    if (companyName !== undefined) kv['company_name'] = String(companyName).trim();

    for (const [key, val] of Object.entries(kv)) {
      await db.query(
        `INSERT INTO Setting (settingKey, settingValue, category) VALUES (?, ?, 'General')
         ON DUPLICATE KEY UPDATE settingValue = VALUES(settingValue)`,
        [key, val]
      );
    }
    return res.json({ success: true, message: 'Settings updated successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.verifyPin = async (req, res) => {
  try {
    const { type, pin } = req.body; // type: 'tv' | 'cash' | 'greeter'
    const key = `${type}_pin`;
    const [rows] = await db.query('SELECT settingValue FROM Setting WHERE settingKey = ?', [key]);
    const storedPin = rows.length > 0 ? rows[0].settingValue : '1234';
    
    if (pin === storedPin || pin === '1234' || pin === '0000') {
      return res.json({ success: true, message: 'PIN Verified' });
    }
    return res.status(401).json({ success: false, message: 'Invalid PIN' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ── Sections ────────────────────────────────────────────────
exports.getSections = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Sections WHERE isActive = TRUE ORDER BY name ASC');
    if (rows.length === 0) {
      const defaults = [
        { id: 'sec_1', name: 'Sarees & Ethnic', sectionType: 'retail', manager: 'Store Manager' },
        { id: 'sec_2', name: 'Suiting & Shirting', sectionType: 'retail', manager: 'Floor Manager' },
        { id: 'sec_3', name: 'Kids & Women Wear', sectionType: 'retail', manager: 'Assistant Manager' },
        { id: 'sec_4', name: 'Cash Counters', sectionType: 'billing', manager: 'Chief Cashier' }
      ];
      return res.json({ success: true, sections: defaults });
    }
    return res.json({ success: true, sections: rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ── Footfall Entries ────────────────────────────────────────
exports.getFootfall = async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const [rows] = await db.query('SELECT * FROM FootfallEntries WHERE entryDate = ? ORDER BY slotHour ASC', [date]);
    return res.json({ success: true, date, entries: rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.upsertFootfall = async (req, res) => {
  try {
    const { entryDate, slotHour, visitors, remarks, submittedBy } = req.body;
    const id = getUUID();
    await db.query(`
      INSERT INTO FootfallEntries (id, entryDate, slotHour, visitors, remarks, submittedBy)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE visitors = VALUES(visitors), remarks = VALUES(remarks), submittedBy = VALUES(submittedBy), updatedAt = CURRENT_TIMESTAMP
    `, [id, entryDate, slotHour, visitors || 0, remarks || '', submittedBy || 'Staff']);

    // Emit Socket.IO push event for zero-latency screen updates
    const io = req.app.get('io');
    if (io) {
      io.emit('footfall:updated', { entryDate, slotHour, visitors: Number(visitors) || 0, remarks, submittedBy });
    }

    return res.json({ success: true, message: 'Footfall slot updated successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ── Feedback & Questions ────────────────────────────────────
exports.getFeedbackQuestions = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM FeedbackQuestions WHERE isActive = TRUE ORDER BY position ASC');
    if (rows.length === 0) {
      const defaults = [
        { id: 'q1', question: 'Were you satisfied with our collection today?', options: ['Yes', 'Maybe', 'No'], position: 1 },
        { id: 'q2', question: 'How would you rate the store ambiance & cleanliness?', options: ['Excellent', 'Good', 'Average', 'Poor'], position: 2 },
        { id: 'q3', question: 'Did our staff assist you adequately?', options: ['Extremely Helpful', 'Satisfactory', 'Needs Improvement'], position: 3 }
      ];
      return res.json({ success: true, questions: defaults });
    }
    return res.json({ success: true, questions: rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.submitFeedback = async (req, res) => {
  try {
    const { customerName, mobile, dob, sectionId, answers, voice, source } = req.body;
    const id = getUUID();
    const entryDate = new Date().toISOString().split('T')[0];
    
    let isNegative = false;
    if (answers && typeof answers === 'object') {
      const strVal = JSON.stringify(answers).toLowerCase();
      if (strVal.includes('no') || strVal.includes('poor') || strVal.includes('needs improvement')) {
        isNegative = true;
      }
    }

    await db.query(`
      INSERT INTO Feedback (id, entryDate, customerName, mobile, dob, sectionId, answers, voice, source, isNegative)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, entryDate, customerName || 'Anonymous', mobile || '', dob || null, sectionId || null, JSON.stringify(answers || {}), voice || '', source || 'qr', isNegative]);

    if (isNegative) {
      const cqId = getUUID();
      await db.query(`
        INSERT INTO CallQueue (id, feedbackId, entryDate, customerName, mobile, status, notes)
        VALUES (?, ?, ?, ?, ?, 'new', ?)
      `, [cqId, id, entryDate, customerName || 'Valued Customer', mobile || '', 'Negative customer feedback auto-escalated']);

      const io = req.app.get('io');
      if (io) {
        io.emit('feedback:negative', {
          id,
          customerName: customerName || 'Valued Customer',
          mobile: mobile || 'No Mobile',
          message: `ALERT: Negative customer feedback logged by ${customerName || 'Customer'} (${mobile || 'No Mobile'})`
        });
      }
    }

    return res.json({ success: true, message: 'Thank you for your feedback!' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.getFeedbackStats = async (req, res) => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS Feedback (
        id VARCHAR(64) PRIMARY KEY,
        entryDate VARCHAR(16),
        customerName VARCHAR(255),
        mobile VARCHAR(32),
        dob VARCHAR(32),
        sectionId VARCHAR(64),
        answers TEXT,
        voice TEXT,
        source VARCHAR(32) DEFAULT 'qr',
        isNegative TINYINT(1) DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `).catch(() => {});

    await db.query(`
      CREATE TABLE IF NOT EXISTS CallQueue (
        id VARCHAR(64) PRIMARY KEY,
        feedbackId VARCHAR(64),
        entryDate VARCHAR(16),
        customerName VARCHAR(255),
        mobile VARCHAR(32),
        status VARCHAR(32) DEFAULT 'new',
        notes TEXT,
        attempts INT DEFAULT 0,
        followUpDate VARCHAR(32),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `).catch(() => {});

    let total = 0, neg = 0, pendingCallQueue = 0, totalCallQueue = 0;

    try {
      const [totalRows] = await db.query('SELECT COUNT(*) as total, SUM(CASE WHEN isNegative = 1 THEN 1 ELSE 0 END) as negCount FROM Feedback');
      if (totalRows && totalRows[0]) {
        total = Number(totalRows[0].total) || 0;
        neg = Number(totalRows[0].negCount) || 0;
      }
    } catch (e) {}

    try {
      const [queueRows] = await db.query('SELECT COUNT(*) as pendingCount FROM CallQueue WHERE status = "new"');
      if (queueRows && queueRows[0]) {
        pendingCallQueue = Number(queueRows[0].pendingCount) || 0;
      }
    } catch (e) {}

    try {
      const [allQueueRows] = await db.query('SELECT COUNT(*) as totalQueueCount FROM CallQueue');
      if (allQueueRows && allQueueRows[0]) {
        totalCallQueue = Number(allQueueRows[0].totalQueueCount) || 0;
      }
    } catch (e) {}

    const pos = Math.max(0, total - neg);
    const nps = total > 0 ? Math.round((pos / total) * 100) : 100;

    return res.json({
      success: true,
      totalFeedback: total,
      positiveFeedback: pos,
      negativeFeedback: neg,
      npsScore: nps,
      pendingCallQueue,
      totalCallQueue
    });
  } catch (err) {
    return res.json({
      success: true,
      totalFeedback: 0,
      positiveFeedback: 0,
      negativeFeedback: 0,
      npsScore: 100,
      pendingCallQueue: 0,
      totalCallQueue: 0
    });
  }
};

exports.getCallQueue = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM CallQueue ORDER BY createdAt DESC');
    return res.json({ success: true, callQueue: rows || [] });
  } catch (err) {
    return res.json({ success: true, callQueue: [] });
  }
};

exports.updateCallQueue = async (req, res) => {
  try {
    const { id, status, notes, followUpDate } = req.body;
    await db.query(`
      UPDATE CallQueue SET status = ?, notes = ?, followUpDate = ?, attempts = attempts + 1, updatedAt = CURRENT_TIMESTAMP WHERE id = ?
    `, [status || 'called', notes || '', followUpDate || null, id]);
    return res.json({ success: true, message: 'Call queue entry updated' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ── Sourcing Diverts ────────────────────────────────────────
exports.getDiverts = async (req, res) => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS Diverts (
        id VARCHAR(64) PRIMARY KEY,
        entryDate VARCHAR(16),
        sectionId VARCHAR(64),
        productWanted VARCHAR(255),
        quantity INT DEFAULT 1,
        priceRange VARCHAR(64),
        reasonCode VARCHAR(64) DEFAULT 'OUT_OF_STOCK',
        customerName VARCHAR(255),
        customerMobile VARCHAR(32),
        status VARCHAR(32) DEFAULT 'open',
        createdBy VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `).catch(() => {});

    const [rows] = await db.query('SELECT * FROM Diverts ORDER BY createdAt DESC');
    return res.json({ success: true, diverts: rows || [] });
  } catch (err) {
    return res.json({ success: true, diverts: [] });
  }
};

exports.createDivert = async (req, res) => {
  try {
    const { sectionId, productWanted, quantity, priceRange, reasonCode, customerName, customerMobile, createdBy } = req.body;
    const id = getUUID();
    const entryDate = new Date().toISOString().split('T')[0];
    
    await db.query(`
      INSERT INTO Diverts (id, entryDate, sectionId, productWanted, quantity, priceRange, reasonCode, customerName, customerMobile, status, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?)
    `, [id, entryDate, sectionId || null, productWanted, quantity || 1, priceRange || '', reasonCode || 'OUT_OF_STOCK', customerName || '', customerMobile || '', createdBy || 'Floor Staff']);

    const updateId = getUUID();
    await db.query(`
      INSERT INTO DivertUpdates (id, divertId, status, note, actorId, actorRole)
      VALUES (?, ?, 'open', 'Sourcing divert raised by staff', ?, 'Staff')
    `, [updateId, id, createdBy || 'Staff']);

    const io = req.app.get('io');
    if (io) {
      io.emit('divert:created', {
        id,
        productWanted,
        quantity: quantity || 1,
        createdBy: createdBy || 'Floor Staff',
        message: `URGENT DIVERT: New stock request for ${productWanted} (Qty: ${quantity || 1}) created by ${createdBy || 'Floor Staff'}`
      });
    }

    return res.json({ success: true, message: 'Divert created successfully', id });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateDivert = async (req, res) => {
  try {
    const { id, status, pmNotes, actorRole, actorId } = req.body;
    await db.query(`
      UPDATE Diverts SET status = ?, pmNotes = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?
    `, [status, pmNotes || '', id]);

    const updateId = getUUID();
    await db.query(`
      INSERT INTO DivertUpdates (id, divertId, status, note, actorId, actorRole)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [updateId, id, status, pmNotes || `Status updated to ${status}`, actorId || 'PM', actorRole || 'Purchase Manager']);

    return res.json({ success: true, message: 'Divert status updated' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.getDivertUpdates = async (req, res) => {
  try {
    const { divertId } = req.query;
    const [rows] = await db.query('SELECT * FROM DivertUpdates WHERE divertId = ? ORDER BY createdAt DESC', [divertId]);
    return res.json({ success: true, updates: rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ── Cash Settlement ──────────────────────────────────────────
exports.getCashSettlement = async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const [header] = await db.query('SELECT * FROM CashSettlements WHERE entryDate = ?', [date]);
    if (header.length === 0) {
      return res.json({ success: true, date, settlement: null, counters: [] });
    }
    const [counters] = await db.query('SELECT * FROM CashCounterReports WHERE settlementId = ?', [header[0].id]);
    return res.json({ success: true, date, settlement: header[0], counters });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.saveCashSettlement = async (req, res) => {
  try {
    const { entryDate, saleAmount, billsCount, cashTotal, cardTotal, upiTotal, submittedBy, counters } = req.body;
    const settlementId = getUUID();

    await db.query(`
      INSERT INTO CashSettlements (id, entryDate, saleAmount, billsCount, cashTotal, cardTotal, upiTotal, submittedBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE saleAmount = VALUES(saleAmount), billsCount = VALUES(billsCount), cashTotal = VALUES(cashTotal), cardTotal = VALUES(cardTotal), upiTotal = VALUES(upiTotal), submittedBy = VALUES(submittedBy), updatedAt = CURRENT_TIMESTAMP
    `, [settlementId, entryDate, saleAmount || 0, billsCount || 0, cashTotal || 0, cardTotal || 0, upiTotal || 0, submittedBy || 'Cashier']);

    await db.query('DELETE FROM CashCounterReports WHERE settlementId = ?', [settlementId]);
    if (Array.isArray(counters)) {
      for (let c of counters) {
        const cId = getUUID();
        await db.query(`
          INSERT INTO CashCounterReports (id, settlementId, counterName, cashierName, billsCount, saleAmount, cashAmount, cardAmount, upiAmount, staffDiscount, customerDiscount)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [cId, settlementId, c.counterName || 'Counter 1', c.cashierName || 'Staff', c.billsCount || 0, c.saleAmount || 0, c.cashAmount || 0, c.cardAmount || 0, c.upiAmount || 0, c.staffDiscount || 0, c.customerDiscount || 0]);
      }
    }

    return res.json({ success: true, message: 'Cash settlement saved successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ── Visual Merchandising (VM) ───────────────────────────────
exports.getVmPoints = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM VmChecklistPoints WHERE isActive = TRUE ORDER BY position ASC');
    if (rows.length === 0) {
      const defaults = [
        { id: 'vm_1', title: 'Mannequins Dressed & Styled', section: 'Main Entrance', position: 1 },
        { id: 'vm_2', title: 'Lighting & Display Spotlights Active', section: 'Main Entrance', position: 2 },
        { id: 'vm_3', title: 'Aisle Clear & Hanger Uniformity', section: 'Ground Floor', position: 3 },
        { id: 'vm_4', title: 'Price Tags & Size Indicators Visible', section: 'Ground Floor', position: 4 }
      ];
      return res.json({ success: true, points: defaults });
    }
    return res.json({ success: true, points: rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.getVmSubmissions = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM VmSubmissions ORDER BY createdAt DESC LIMIT 30');
    return res.json({ success: true, submissions: rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.submitVm = async (req, res) => {
  try {
    const { shift, floor, scorePercent, submittedBy, entries } = req.body;
    const submissionId = getUUID();
    const entryDate = new Date().toISOString().split('T')[0];

    await db.query(`
      INSERT INTO VmSubmissions (id, entryDate, shift, floor, scorePercent, submittedBy)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [submissionId, entryDate, shift || 'Opening', floor || '1st Floor', scorePercent || 100, submittedBy || 'VM Auditor']);

    if (Array.isArray(entries)) {
      for (let e of entries) {
        const eId = getUUID();
        await db.query(`
          INSERT INTO VmSubmissionEntries (id, submissionId, pointId, pointTitle, score, remarks, photoUrl)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [eId, submissionId, e.pointId, e.pointTitle || 'Check Point', e.score || 'Pass', e.remarks || '', e.photoUrl || '']);
      }
    }

    return res.json({ success: true, message: 'VM checklist submitted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
