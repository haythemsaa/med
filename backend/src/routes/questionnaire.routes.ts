import { Router } from 'express';
import QuestionnaireController from '../controllers/questionnaire.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes (for booking flow)
router.get('/cabinets/:cabinetId/for-booking', QuestionnaireController.getForBooking);

// Protected routes
router.use(authenticate);

// Create questionnaire
router.post('/', QuestionnaireController.create);

// Get all questionnaires for a cabinet
router.get('/cabinets/:cabinetId', QuestionnaireController.getAll);

// Get questionnaire by ID
router.get('/:id', QuestionnaireController.getById);

// Update questionnaire
router.put('/:id', QuestionnaireController.update);

// Delete questionnaire
router.delete('/:id', QuestionnaireController.delete);

// Submit response
router.post('/responses', QuestionnaireController.submitResponse);

// Get patient responses
router.get('/patients/:patientId/responses', QuestionnaireController.getPatientResponses);

// Get questionnaire statistics
router.get('/:id/statistics', QuestionnaireController.getStatistics);

export default router;
