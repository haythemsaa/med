import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Analytics Service
 * Advanced analytics with AI predictions for medical practice management
 */
export class AnalyticsService {
  /**
   * Record analytics metric
   */
  async recordMetric(data: {
    cabinetId: string;
    metric: string;
    value: number;
    count?: number;
    date?: Date;
    practitionerId?: string;
    metadata?: any;
  }) {
    return await prisma.analytics.create({
      data: {
        cabinetId: data.cabinetId,
        metric: data.metric,
        value: data.value,
        count: data.count || 1,
        date: data.date || new Date(),
        practitionerId: data.practitionerId,
        metadata: data.metadata,
      },
    });
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(cabinetId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Today's appointments
    const todayAppointments = await prisma.appointment.count({
      where: {
        cabinetId,
        startTime: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    // This month's appointments
    const thisMonthAppointments = await prisma.appointment.count({
      where: {
        cabinetId,
        startTime: { gte: thisMonthStart },
      },
    });

    // Last month's appointments
    const lastMonthAppointments = await prisma.appointment.count({
      where: {
        cabinetId,
        startTime: {
          gte: lastMonthStart,
          lte: lastMonthEnd,
        },
      },
    });

    // Total patients
    const totalPatients = await prisma.patient.count({
      where: { cabinetId },
    });

    // New patients this month
    const newPatientsThisMonth = await prisma.patient.count({
      where: {
        cabinetId,
        createdAt: { gte: thisMonthStart },
      },
    });

    // Revenue this month
    const revenueThisMonth = await prisma.invoice.aggregate({
      where: {
        cabinetId,
        issueDate: { gte: thisMonthStart },
        paymentStatus: 'PAID',
      },
      _sum: { total: true },
    });

    // Revenue last month
    const revenueLastMonth = await prisma.invoice.aggregate({
      where: {
        cabinetId,
        issueDate: {
          gte: lastMonthStart,
          lte: lastMonthEnd,
        },
        paymentStatus: 'PAID',
      },
      _sum: { total: true },
    });

    // No-show rate
    const completedAppointments = await prisma.appointment.count({
      where: {
        cabinetId,
        status: 'COMPLETED',
        startTime: { gte: thisMonthStart },
      },
    });

    const noShowAppointments = await prisma.appointment.count({
      where: {
        cabinetId,
        status: 'NO_SHOW',
        startTime: { gte: thisMonthStart },
      },
    });

    const noShowRate =
      thisMonthAppointments > 0
        ? ((noShowAppointments / thisMonthAppointments) * 100).toFixed(2)
        : '0';

    // Calculate growth rates
    const appointmentGrowth =
      lastMonthAppointments > 0
        ? (((thisMonthAppointments - lastMonthAppointments) / lastMonthAppointments) * 100).toFixed(2)
        : '0';

    const revenueGrowth =
      (revenueLastMonth._sum.total || 0) > 0
        ? (((Number(revenueThisMonth._sum.total || 0) - Number(revenueLastMonth._sum.total || 0)) /
            Number(revenueLastMonth._sum.total || 0)) *
            100).toFixed(2)
        : '0';

    return {
      today: {
        appointments: todayAppointments,
      },
      thisMonth: {
        appointments: thisMonthAppointments,
        newPatients: newPatientsThisMonth,
        revenue: Number(revenueThisMonth._sum.total || 0),
        completedAppointments,
        noShowAppointments,
        noShowRate: parseFloat(noShowRate),
      },
      lastMonth: {
        appointments: lastMonthAppointments,
        revenue: Number(revenueLastMonth._sum.total || 0),
      },
      totals: {
        patients: totalPatients,
      },
      growth: {
        appointments: parseFloat(appointmentGrowth),
        revenue: parseFloat(revenueGrowth),
      },
    };
  }

  /**
   * Predict no-show probability using simple ML algorithm
   */
  async predictNoShow(appointmentData: {
    patientId: string;
    practitionerId: string;
    appointmentType: string;
    dayOfWeek: number;
    hourOfDay: number;
    isOnlineBooking: boolean;
  }): Promise<number> {
    // Get patient's historical data
    const patient = await prisma.patient.findUnique({
      where: { id: appointmentData.patientId },
      include: {
        appointments: {
          where: {
            status: { in: ['COMPLETED', 'NO_SHOW'] },
          },
          select: {
            status: true,
            type: true,
          },
        },
      },
    });

    if (!patient || patient.appointments.length === 0) {
      // New patient - base probability
      return 0.15; // 15% base no-show rate
    }

    let score = 0;
    const weights = {
      historicalNoShowRate: 0.4,
      patientNoShowCount: 0.3,
      appointmentType: 0.15,
      timeOfDay: 0.1,
      bookingMethod: 0.05,
    };

    // 1. Historical no-show rate
    const historicalNoShows = patient.appointments.filter(
      (a) => a.status === 'NO_SHOW'
    ).length;
    const historicalNoShowRate = historicalNoShows / patient.appointments.length;
    score += historicalNoShowRate * weights.historicalNoShowRate;

    // 2. Patient's total no-show count (normalized)
    const noShowCountScore = Math.min(patient.noShowCount / 5, 1); // Cap at 5
    score += noShowCountScore * weights.patientNoShowCount;

    // 3. Appointment type factor
    const typeNoShowRates: any = {
      TELECONSULTATION: 0.1,
      CONSULTATION: 0.15,
      FOLLOW_UP: 0.12,
      FIRST_VISIT: 0.18,
      EMERGENCY: 0.05,
    };
    score += (typeNoShowRates[appointmentData.appointmentType] || 0.15) * weights.appointmentType;

    // 4. Time of day factor (early morning and late afternoon have higher no-show)
    let timeScore = 0.15;
    if (appointmentData.hourOfDay < 9 || appointmentData.hourOfDay > 17) {
      timeScore = 0.25;
    } else if (appointmentData.hourOfDay >= 10 && appointmentData.hourOfDay <= 16) {
      timeScore = 0.1;
    }
    score += timeScore * weights.timeOfDay;

    // 5. Booking method (online bookings have slightly higher no-show)
    score += (appointmentData.isOnlineBooking ? 0.18 : 0.12) * weights.bookingMethod;

    // Normalize to 0-1 range
    return Math.min(Math.max(score, 0), 1);
  }

  /**
   * Get revenue forecast for next month
   */
  async getForecastRevenue(cabinetId: string): Promise<{
    forecast: number;
    confidence: number;
    trend: 'up' | 'down' | 'stable';
  }> {
    // Get last 6 months revenue
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await prisma.invoice.groupBy({
      by: ['issueDate'],
      where: {
        cabinetId,
        paymentStatus: 'PAID',
        issueDate: { gte: sixMonthsAgo },
      },
      _sum: { total: true },
    });

    if (monthlyRevenue.length < 2) {
      return {
        forecast: 0,
        confidence: 0,
        trend: 'stable',
      };
    }

    // Simple linear regression for trend
    const revenues = monthlyRevenue.map((m) => Number(m._sum.total || 0));
    const avgRevenue = revenues.reduce((sum, r) => sum + r, 0) / revenues.length;

    // Calculate trend
    const recentAvg = revenues.slice(-2).reduce((sum, r) => sum + r, 0) / 2;
    const olderAvg = revenues.slice(0, 2).reduce((sum, r) => sum + r, 0) / 2;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (recentAvg > olderAvg * 1.1) trend = 'up';
    else if (recentAvg < olderAvg * 0.9) trend = 'down';

    // Apply trend to forecast
    const trendFactor = recentAvg / avgRevenue;
    const forecast = avgRevenue * trendFactor;

    // Calculate confidence based on variance
    const variance = revenues.reduce((sum, r) => sum + Math.pow(r - avgRevenue, 2), 0) / revenues.length;
    const stdDev = Math.sqrt(variance);
    const confidence = Math.max(0, Math.min(1, 1 - stdDev / avgRevenue));

    return {
      forecast: Math.round(forecast * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      trend,
    };
  }

  /**
   * Get popular appointment times
   */
  async getPopularTimes(cabinetId: string, practitionerId?: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const appointments = await prisma.appointment.findMany({
      where: {
        cabinetId,
        ...(practitionerId && { practitionerId }),
        startTime: { gte: thirtyDaysAgo },
        status: { in: ['COMPLETED', 'CONFIRMED', 'SCHEDULED'] },
      },
      select: {
        startTime: true,
      },
    });

    // Group by hour
    const hourCounts: { [key: number]: number } = {};
    appointments.forEach((apt) => {
      const hour = apt.startTime.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    // Convert to array and sort
    const popularHours = Object.entries(hourCounts)
      .map(([hour, count]) => ({
        hour: parseInt(hour),
        count,
        label: `${hour}:00`,
      }))
      .sort((a, b) => b.count - a.count);

    return popularHours;
  }

  /**
   * Get practitioner performance metrics
   */
  async getPractitionerPerformance(practitionerId: string, startDate: Date, endDate: Date) {
    const appointments = await prisma.appointment.findMany({
      where: {
        practitionerId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const total = appointments.length;
    const completed = appointments.filter((a) => a.status === 'COMPLETED').length;
    const noShow = appointments.filter((a) => a.status === 'NO_SHOW').length;
    const cancelled = appointments.filter((a) => a.status === 'CANCELLED').length;

    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(2) : '0';
    const noShowRate = total > 0 ? ((noShow / total) * 100).toFixed(2) : '0';

    // Average consultation duration
    const consultations = await prisma.consultation.findMany({
      where: {
        practitionerId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Revenue generated
    const revenue = await prisma.invoice.aggregate({
      where: {
        appointment: {
          practitionerId,
        },
        issueDate: {
          gte: startDate,
          lte: endDate,
        },
        paymentStatus: 'PAID',
      },
      _sum: { total: true },
    });

    return {
      appointments: {
        total,
        completed,
        noShow,
        cancelled,
        completionRate: parseFloat(completionRate),
        noShowRate: parseFloat(noShowRate),
      },
      consultations: {
        total: consultations.length,
      },
      revenue: Number(revenue._sum.total || 0),
    };
  }

  /**
   * Get patient engagement score
   */
  async getPatientEngagement(cabinetId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalPatients = await prisma.patient.count({
      where: { cabinetId },
    });

    // Active patients (had appointment in last 30 days)
    const activePatients = await prisma.patient.count({
      where: {
        cabinetId,
        appointments: {
          some: {
            startTime: { gte: thirtyDaysAgo },
          },
        },
      },
    });

    // Patients with upcoming appointments
    const patientsWithUpcoming = await prisma.patient.count({
      where: {
        cabinetId,
        appointments: {
          some: {
            startTime: { gte: now },
            status: { in: ['SCHEDULED', 'CONFIRMED'] },
          },
        },
      },
    });

    // Calculate engagement score (0-100)
    const activeRate = totalPatients > 0 ? activePatients / totalPatients : 0;
    const upcomingRate = totalPatients > 0 ? patientsWithUpcoming / totalPatients : 0;

    const engagementScore = Math.round((activeRate * 0.6 + upcomingRate * 0.4) * 100);

    return {
      totalPatients,
      activePatients,
      patientsWithUpcoming,
      engagementScore,
      activeRate: (activeRate * 100).toFixed(2),
      upcomingRate: (upcomingRate * 100).toFixed(2),
    };
  }

  /**
   * Identify patients at risk of churning (not returning)
   */
  async getChurnRiskPatients(cabinetId: string) {
    const now = new Date();
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Patients who had appointments before but none recently
    const patients = await prisma.patient.findMany({
      where: {
        cabinetId,
        appointments: {
          some: {
            startTime: { lt: ninetyDaysAgo },
          },
          none: {
            startTime: { gte: ninetyDaysAgo },
          },
        },
      },
      include: {
        appointments: {
          orderBy: { startTime: 'desc' },
          take: 1,
        },
      },
    });

    return patients.map((patient) => ({
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phone: patient.phone,
      lastAppointment: patient.appointments[0]?.startTime,
      daysSinceLastVisit: patient.appointments[0]
        ? Math.floor((now.getTime() - patient.appointments[0].startTime.getTime()) / (1000 * 60 * 60 * 24))
        : null,
    }));
  }
}

export default new AnalyticsService();
