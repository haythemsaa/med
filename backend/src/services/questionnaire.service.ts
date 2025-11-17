import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Questionnaire Service
 * Handles pre-consultation questionnaires
 */
export class QuestionnaireService {
  /**
   * Create a new questionnaire
   */
  async create(data: {
    cabinetId: string;
    title: string;
    description?: string;
    isActive?: boolean;
    isRequired?: boolean;
    showBeforeBooking?: boolean;
    questions: any[];
  }) {
    return await prisma.questionnaire.create({
      data: {
        cabinetId: data.cabinetId,
        title: data.title,
        description: data.description,
        isActive: data.isActive ?? true,
        isRequired: data.isRequired ?? false,
        showBeforeBooking: data.showBeforeBooking ?? true,
        questions: data.questions,
      },
    });
  }

  /**
   * Get all questionnaires for a cabinet
   */
  async getAll(cabinetId: string, activeOnly: boolean = false) {
    return await prisma.questionnaire.findMany({
      where: {
        cabinetId,
        ...(activeOnly && { isActive: true }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get a questionnaire by ID
   */
  async getById(id: string) {
    return await prisma.questionnaire.findUnique({
      where: { id },
    });
  }

  /**
   * Get questionnaires to show before booking
   */
  async getForBooking(cabinetId: string) {
    return await prisma.questionnaire.findMany({
      where: {
        cabinetId,
        isActive: true,
        showBeforeBooking: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * Update a questionnaire
   */
  async update(id: string, data: Partial<{
    title: string;
    description: string;
    isActive: boolean;
    isRequired: boolean;
    showBeforeBooking: boolean;
    questions: any[];
  }>) {
    return await prisma.questionnaire.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a questionnaire
   */
  async delete(id: string) {
    // Check if there are any responses
    const responses = await prisma.questionnaireResponse.count({
      where: { questionnaireId: id },
    });

    if (responses > 0) {
      // Soft delete - just mark as inactive
      return await prisma.questionnaire.update({
        where: { id },
        data: { isActive: false },
      });
    }

    // Hard delete if no responses
    return await prisma.questionnaire.delete({
      where: { id },
    });
  }

  /**
   * Submit questionnaire response
   */
  async submitResponse(data: {
    questionnaireId: string;
    patientId: string;
    appointmentId?: string;
    answers: any[];
  }) {
    return await prisma.questionnaireResponse.create({
      data: {
        questionnaireId: data.questionnaireId,
        patientId: data.patientId,
        appointmentId: data.appointmentId,
        answers: data.answers,
      },
    });
  }

  /**
   * Get patient's responses
   */
  async getPatientResponses(patientId: string) {
    return await prisma.questionnaireResponse.findMany({
      where: { patientId },
      include: {
        questionnaire: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    });
  }

  /**
   * Get response for an appointment
   */
  async getAppointmentResponse(appointmentId: string) {
    return await prisma.questionnaireResponse.findFirst({
      where: { appointmentId },
      include: {
        questionnaire: true,
      },
    });
  }

  /**
   * Get questionnaire statistics
   */
  async getStatistics(questionnaireId: string) {
    const questionnaire = await prisma.questionnaire.findUnique({
      where: { id: questionnaireId },
      include: {
        responses: true,
      },
    });

    if (!questionnaire) {
      throw new Error('Questionnaire not found');
    }

    const questions = questionnaire.questions as any[];
    const responses = questionnaire.responses;

    // Analyze answers for each question
    const analysis = questions.map((question) => {
      const questionAnswers = responses.map((response) => {
        const answers = response.answers as any[];
        const answer = answers.find((a) => a.questionId === question.id);
        return answer?.answer;
      }).filter(Boolean);

      let stats: any = {
        questionId: question.id,
        questionText: question.text,
        questionType: question.type,
        totalAnswers: questionAnswers.length,
      };

      // Calculate statistics based on question type
      if (question.type === 'YES_NO' || question.type === 'MULTIPLE_CHOICE') {
        const distribution: any = {};
        questionAnswers.forEach((answer) => {
          distribution[answer] = (distribution[answer] || 0) + 1;
        });
        stats.distribution = distribution;
      } else if (question.type === 'RATING') {
        const ratings = questionAnswers.map(Number).filter((n) => !isNaN(n));
        const average = ratings.length > 0
          ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(2)
          : 0;
        stats.average = average;
        stats.ratings = ratings;
      } else {
        stats.answers = questionAnswers;
      }

      return stats;
    });

    return {
      questionnaireId,
      title: questionnaire.title,
      totalResponses: responses.length,
      analysis,
    };
  }
}

export default new QuestionnaireService();
