import express from 'express';
const router = express.Router();

import { verifyAuth, authorize } from '../middlewares/auth.middleware.js';
import * as feedbackController from '../controllers/feedback.controller.js';
import * as adminController from '../controllers/admin.controller.js';

// Feedbacks
router.get(
    '/feedbacks',
    verifyAuth,
    authorize('college_admin', 'super_admin'),
    feedbackController.getAllFeedbacks
);

// Summary
router.get(
    '/feedback-summary',
    verifyAuth,
    authorize('college_admin', 'super_admin'),
    feedbackController.getFeedbackSummary
);

// Logs
router.get(
    '/logs',
    verifyAuth,
    authorize('super_admin'),
    adminController.getAdminLogs
);

export default router;