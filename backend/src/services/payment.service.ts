import { PrismaClient, PaymentStatus, PaymentMethod } from '@prisma/client';
// import Stripe from 'stripe'; // Uncomment when ready to integrate

const prisma = new PrismaClient();
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

/**
 * Payment Service
 * Online payment processing (Stripe integration)
 */
export class PaymentService {
  /**
   * Create payment intent (Stripe)
   */
  async createPaymentIntent(data: {
    cabinetId: string;
    patientId: string;
    appointmentId?: string;
    invoiceId?: string;
    amount: number;
    currency?: string;
    description?: string;
  }) {
    // TODO: Integrate with Stripe
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(data.amount * 1000), // Convert to millimes
    //   currency: data.currency || 'tnd',
    //   description: data.description,
    //   metadata: {
    //     cabinetId: data.cabinetId,
    //     patientId: data.patientId,
    //     appointmentId: data.appointmentId || '',
    //   },
    // });

    const payment = await prisma.payment.create({
      data: {
        cabinetId: data.cabinetId,
        patientId: data.patientId,
        appointmentId: data.appointmentId,
        invoiceId: data.invoiceId,
        amount: data.amount,
        currency: data.currency || 'TND',
        method: 'CARD',
        status: 'PENDING',
        description: data.description,
        // stripePaymentId: paymentIntent.id,
      },
    });

    return {
      payment,
      // clientSecret: paymentIntent.client_secret,
      clientSecret: 'mock_client_secret', // Mock for now
    };
  }

  /**
   * Confirm payment
   */
  async confirmPayment(paymentId: string, stripeChargeId?: string) {
    return await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        stripeChargeId,
      },
    });
  }

  /**
   * Process cash payment
   */
  async processCashPayment(data: {
    cabinetId: string;
    patientId: string;
    appointmentId?: string;
    invoiceId?: string;
    amount: number;
    receiptNumber?: string;
  }) {
    return await prisma.payment.create({
      data: {
        ...data,
        method: 'CASH',
        status: 'PAID',
        paidAt: new Date(),
      },
    });
  }

  /**
   * Refund payment
   */
  async refund(paymentId: string, amount: number, reason: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'PAID') {
      throw new Error('Can only refund paid payments');
    }

    // TODO: Process refund with Stripe
    // if (payment.stripeChargeId) {
    //   await stripe.refunds.create({
    //     charge: payment.stripeChargeId,
    //     amount: Math.round(amount * 1000),
    //   });
    // }

    return await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'REFUNDED',
        refundedAmount: amount,
        refundedAt: new Date(),
        refundReason: reason,
      },
    });
  }

  /**
   * Get patient payments
   */
  async getPatientPayments(patientId: string) {
    return await prisma.payment.findMany({
      where: { patientId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get cabinet payments
   */
  async getCabinetPayments(
    cabinetId: string,
    startDate?: Date,
    endDate?: Date
  ) {
    return await prisma.payment.findMany({
      where: {
        cabinetId,
        ...(startDate && endDate && {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get payment statistics
   */
  async getStatistics(cabinetId: string, startDate: Date, endDate: Date) {
    const payments = await prisma.payment.findMany({
      where: {
        cabinetId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const total = payments.length;
    const paid = payments.filter((p) => p.status === 'PAID').length;
    const pending = payments.filter((p) => p.status === 'PENDING').length;
    const refunded = payments.filter((p) => p.status === 'REFUNDED').length;

    const totalAmount = payments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const refundedAmount = payments
      .filter((p) => p.status === 'REFUNDED')
      .reduce((sum, p) => sum + Number(p.refundedAmount || 0), 0);

    // By method
    const byMethod: any = {};
    payments.filter((p) => p.status === 'PAID').forEach((p) => {
      byMethod[p.method] = (byMethod[p.method] || 0) + Number(p.amount);
    });

    return {
      total,
      paid,
      pending,
      refunded,
      totalAmount: Math.round(totalAmount * 100) / 100,
      refundedAmount: Math.round(refundedAmount * 100) / 100,
      byMethod,
    };
  }

  /**
   * Generate receipt
   */
  async generateReceipt(paymentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment || payment.status !== 'PAID') {
      throw new Error('Payment not found or not paid');
    }

    const receiptNumber = `RCP-${Date.now().toString(36).toUpperCase()}`;

    return await prisma.payment.update({
      where: { id: paymentId },
      data: {
        receiptNumber,
        receiptUrl: `/api/payments/${paymentId}/receipt`,
      },
    });
  }
}

export default new PaymentService();
