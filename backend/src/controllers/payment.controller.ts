import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import paymentService from '../services/payment.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

const createPaymentIntentSchema = z.object({
  cabinetId: z.string().uuid(),
  patientId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  invoiceId: z.string().uuid().optional(),
  amount: z.number().positive(),
  currency: z.string().optional(),
  description: z.string().optional(),
});

const confirmPaymentSchema = z.object({
  stripeChargeId: z.string().optional(),
});

const processCashPaymentSchema = z.object({
  cabinetId: z.string().uuid(),
  patientId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  invoiceId: z.string().uuid().optional(),
  amount: z.number().positive(),
  receiptNumber: z.string().optional(),
});

const refundPaymentSchema = z.object({
  amount: z.number().positive(),
  reason: z.string(),
});

export class PaymentController {
  /**
   * Create payment intent (Stripe)
   */
  async createPaymentIntent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createPaymentIntentSchema.parse(req.body);
      const result = await paymentService.createPaymentIntent(data);
      sendSuccess(res, result, 'Payment intent created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirm payment
   */
  async confirmPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { stripeChargeId } = confirmPaymentSchema.parse(req.body);
      const payment = await paymentService.confirmPayment(id, stripeChargeId);
      sendSuccess(res, payment, 'Payment confirmed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Process cash payment
   */
  async processCashPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = processCashPaymentSchema.parse(req.body);
      const payment = await paymentService.processCashPayment(data);
      sendSuccess(res, payment, 'Cash payment processed successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refund payment
   */
  async refund(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { amount, reason } = refundPaymentSchema.parse(req.body);
      const payment = await paymentService.refund(id, amount, reason);
      sendSuccess(res, payment, 'Payment refunded successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get patient payments
   */
  async getPatientPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const payments = await paymentService.getPatientPayments(patientId);
      sendSuccess(res, payments);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get cabinet payments
   */
  async getCabinetPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const { cabinetId } = req.params;
      const { startDate, endDate } = req.query;

      const payments = await paymentService.getCabinetPayments(
        cabinetId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      sendSuccess(res, payments);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get payment statistics
   */
  async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const { cabinetId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'startDate and endDate are required',
        });
      }

      const statistics = await paymentService.getStatistics(
        cabinetId,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      sendSuccess(res, statistics);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate receipt
   */
  async generateReceipt(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const payment = await paymentService.generateReceipt(id);
      sendSuccess(res, payment, 'Receipt generated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new PaymentController();
