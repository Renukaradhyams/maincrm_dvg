const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const authController = require('../controllers/authController');
const candidateController = require('../controllers/candidateController');
const interviewController = require('../controllers/interviewController');
const offerController = require('../controllers/offerController');
const onboardingController = require('../controllers/onboardingController');
const exitController = require('../controllers/exitController');
const settingsController = require('../controllers/settingsController');
const broadcastController = require('../controllers/broadcastController');
const deptHiringController = require('../controllers/deptHiringController');
const crmController = require('../controllers/crmController');

// ── CRM Store Operations Routes ──────────────────────────────
router.get('/crm/settings', crmController.getSettings);
router.post('/crm/verify-pin', crmController.verifyPin);
router.get('/crm/sections', crmController.getSections);

router.get('/crm/footfall', crmController.getFootfall);
router.post('/crm/footfall/upsert', crmController.upsertFootfall);

router.get('/crm/feedback-questions', crmController.getFeedbackQuestions);
router.post('/crm/feedback', crmController.submitFeedback);
router.get('/crm/call-queue', crmController.getCallQueue);
router.post('/crm/call-queue/update', crmController.updateCallQueue);

router.get('/crm/diverts', crmController.getDiverts);
router.post('/crm/diverts/create', crmController.createDivert);
router.post('/crm/diverts/update', crmController.updateDivert);
router.get('/crm/diverts/updates', crmController.getDivertUpdates);

router.get('/cash', crmController.getCashSettlement);
router.post('/cash/save', crmController.saveCashSettlement);

router.get('/vm/points', crmController.getVmPoints);
router.get('/vm/submissions', crmController.getVmSubmissions);
router.post('/vm/submit', crmController.submitVm);

// ── Broadcast Routes ─────────────────────────────────────────
router.get('/broadcasts', broadcastController.getBroadcasts);
router.post('/broadcasts', broadcastController.createBroadcast);
router.delete('/broadcasts/:id', authenticate, authorize('Admin', 'Super Admin'), broadcastController.deleteBroadcast);

// ── Dept Hiring & Section Allocation Routes ───────────────
router.get('/dept-hiring/targets', deptHiringController.getHiringTargets);
router.post('/dept-hiring/targets', deptHiringController.saveHiringTarget);
router.get('/section-allocations', deptHiringController.getSectionAllocations);
router.post('/section-allocations', deptHiringController.saveSectionAllocation);
router.post('/section-allocations/bulk', deptHiringController.bulkSaveSectionAllocation);

router.get('/dept-hiring/sections', deptHiringController.getDepartmentSections);
router.post('/dept-hiring/sections/add', deptHiringController.addDepartmentSection);
router.post('/dept-hiring/sections/edit', deptHiringController.editDepartmentSection);
router.post('/dept-hiring/sections/delete', deptHiringController.deleteDepartmentSection);

// ── Legacy Google Apps Script Action Dispatcher Endpoint ─────
// Dispatches legacy `{ action: 'verifyUser', ... }` requests to appropriate controller actions
router.get('/legacy', async (req, res) => {
  if (req.query.action === 'getInterviewByToken') {
    return interviewController.getInterviewByToken(req, res);
  }
  return res.json({ status: 'BSC HRMS API v5 Online' });
});

router.post('/legacy', async (req, res) => {
  const { action } = req.body;
  const dispatchMap = {
    verifyUser: authController.verifyUser,
    getCandidates: candidateController.getCandidates,
    addCandidate: candidateController.addCandidate,
    getActivityFull: candidateController.getActivityFull,
    getActivity: candidateController.getSystemActivity,
    updateCandidate: candidateController.updateCandidate,
    checkDuplicate: candidateController.checkDuplicate,
    getNextAppNo: candidateController.getNextAppNo,
    getKPIs: candidateController.getKPIs,
    getPendingActions: candidateController.getPendingActions,
    getSourceBreakdown: candidateController.getSourceBreakdown,
    getDesignations: settingsController.getDesignations,
    getPublicDesignations: settingsController.getPublicDesignations,
    getOpenings: candidateController.getOpenings,
    updateOpening: candidateController.updateOpening,
    saveCallStep: interviewController.saveCallStep,
    getCallStatus: interviewController.getCallStatus,
    getInterviews: interviewController.getInterviews,
    getInterviewQuestions: interviewController.getInterviewQuestions,
    saveScore: interviewController.saveScore,
    generateInterviewToken: interviewController.generateInterviewToken,
    getInterviewByToken: interviewController.getInterviewByToken,
    submitInterviewScore: interviewController.submitInterviewScore,
    getOffers: offerController.getOffers,
    createDirectOffer: offerController.createDirectOffer,
    logOfferCall: offerController.logOfferCall,
    updateOfferDetails: offerController.updateOfferDetails,
    acceptOffer: offerController.acceptOffer,
    rejectOffer: offerController.rejectOffer,
    markJoined: offerController.markJoined,
    updateOfferStatus: offerController.updateOfferStatus,
    approveSelection: interviewController.approveSelection,
    rejectCandidate: interviewController.rejectCandidate,
    getSelectedCandidates: interviewController.getSelectedCandidates,
    getRejectedCandidates: interviewController.getRejectedCandidates,
    getUsers: settingsController.getUsers,
    addUser: settingsController.addUser,
    updateUser: settingsController.updateUser,
    getPageSettings: settingsController.getPageSettings,
    savePageSettings: settingsController.savePageSettings,
    getAllInterviewQuestions: settingsController.getAllInterviewQuestions,
    addInterviewQuestion: settingsController.addInterviewQuestion,
    deleteInterviewQuestion: settingsController.deleteInterviewQuestion,
    addDesignation: settingsController.addDesignation,
    deleteDesignation: settingsController.deleteDesignation,
    getEmployees: candidateController.getEmployees,
    getOnboardingList: onboardingController.getOnboardingList,
    createOnboarding: onboardingController.createOnboarding,
    getOnboardingItems: onboardingController.getOnboardingItems,
    updateOnboardingItem: onboardingController.updateOnboardingItem,
    completeOnboarding: onboardingController.completeOnboarding,
    getExitList: exitController.getExitList,
    createExit: exitController.createExit,
    getExitItems: exitController.getExitItems,
    updateExitItem: exitController.updateExitItem,
    completeExit: exitController.completeExit,
    getHiringTargets: deptHiringController.getHiringTargets,
    saveHiringTarget: deptHiringController.saveHiringTarget,
    getSectionAllocations: deptHiringController.getSectionAllocations,
    saveSectionAllocation: deptHiringController.saveSectionAllocation,
    bulkSaveSectionAllocation: deptHiringController.bulkSaveSectionAllocation,
    getDepartmentSections: deptHiringController.getDepartmentSections,
    addDepartmentSection: deptHiringController.addDepartmentSection,
    editDepartmentSection: deptHiringController.editDepartmentSection,
    deleteDepartmentSection: deptHiringController.deleteDepartmentSection
  };

  if (dispatchMap[action]) {
    return dispatchMap[action](req, res);
  }
  return errorRes(res, `Unknown action: ${action}`, [], 400);
});

module.exports = router;
