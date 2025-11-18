import { PrismaClient, RecordingStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * AI Consultation Assistant Service
 * Doctolib Premium Feature (79€/month) - but we include it FREE!
 * - Audio recording of consultations
 * - Automatic transcription (OpenAI Whisper)
 * - AI-generated summaries and medical letters
 * - Auto-extraction of medical data
 */
export class ConsultationRecordingService {
  /**
   * Create consultation recording
   */
  async create(data: {
    consultationId: string;
    cabinetId: string;
    practitionerId: string;
    patientId: string;
    audioUrl?: string;
  }) {
    return await prisma.consultationRecording.create({
      data: {
        consultationId: data.consultationId,
        cabinetId: data.cabinetId,
        practitionerId: data.practitionerId,
        patientId: data.patientId,
        audioUrl: data.audioUrl,
        status: 'PENDING',
      },
      include: {
        consultation: true,
        practitioner: true,
        patient: true,
      },
    });
  }

  /**
   * Start audio recording
   */
  async startRecording(consultationId: string, audioUrl: string) {
    const recording = await prisma.consultationRecording.findFirst({
      where: { consultationId },
    });

    if (recording) {
      return await prisma.consultationRecording.update({
        where: { id: recording.id },
        data: {
          audioUrl,
          status: 'PENDING',
        },
      });
    }

    throw new Error('Recording not found');
  }

  /**
   * Process recording with AI
   * This would integrate with OpenAI Whisper for transcription
   * and GPT-4 for summary/letter generation
   */
  async processRecording(recordingId: string) {
    const recording = await prisma.consultationRecording.findUnique({
      where: { id: recordingId },
      include: {
        consultation: true,
        patient: true,
        practitioner: true,
      },
    });

    if (!recording) {
      throw new Error('Recording not found');
    }

    // Update status to PROCESSING
    await prisma.consultationRecording.update({
      where: { id: recordingId },
      data: {
        status: 'PROCESSING',
        processingStarted: new Date(),
      },
    });

    try {
      // TODO: Integrate with OpenAI Whisper API for transcription
      // const transcription = await this.transcribeAudio(recording.audioUrl);

      // Placeholder transcription
      const transcription = `Transcription de la consultation du ${new Date().toLocaleDateString('fr-FR')}...`;

      // TODO: Integrate with OpenAI GPT-4 for summary generation
      // const summary = await this.generateSummary(transcription);

      const summary = this.generateMockSummary(recording);

      // TODO: Generate medical letter
      const generatedLetter = this.generateMockLetter(recording, summary);

      // TODO: Extract medical data (antecedents, allergies, diagnostics)
      const extractedData = this.extractMedicalData(transcription);

      // Update recording with results
      return await prisma.consultationRecording.update({
        where: { id: recordingId },
        data: {
          transcription,
          summary,
          generatedLetter,
          extractedData,
          status: 'COMPLETED',
          processingEnded: new Date(),
        },
        include: {
          consultation: true,
        },
      });
    } catch (error: any) {
      // Update status to FAILED
      await prisma.consultationRecording.update({
        where: { id: recordingId },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
          processingEnded: new Date(),
        },
      });

      throw error;
    }
  }

  /**
   * Generate mock summary (will be replaced with real AI)
   */
  private generateMockSummary(recording: any): string {
    return `
RÉSUMÉ DE CONSULTATION

Patient: ${recording.patient.firstName} ${recording.patient.lastName}
Date: ${new Date().toLocaleDateString('fr-FR')}
Praticien: Dr. ${recording.practitioner.firstName} ${recording.practitioner.lastName}

Motif de consultation:
${recording.consultation.chiefComplaint || 'Non spécifié'}

Examen clinique:
- TA: ${recording.consultation.bloodPressureSystolic || '--'}/${recording.consultation.bloodPressureDiastolic || '--'} mmHg
- FC: ${recording.consultation.heartRate || '--'} bpm
- Température: ${recording.consultation.temperature || '--'}°C
- Poids: ${recording.consultation.weight || '--'} kg
- Taille: ${recording.consultation.height || '--'} cm

Diagnostic:
${recording.consultation.diagnosisPrimary || 'À compléter'}

Traitement:
${recording.consultation.prescription || 'Aucun traitement prescrit'}

Recommandations:
${recording.consultation.recommendations || 'Suivi habituel'}
    `.trim();
  }

  /**
   * Generate mock medical letter (will be replaced with real AI)
   */
  private generateMockLetter(recording: any, summary: string): string {
    return `
Dr. ${recording.practitioner.firstName} ${recording.practitioner.lastName}
${recording.practitioner.speciality}
${recording.cabinet.address || ''}
${recording.cabinet.city || ''}, ${recording.cabinet.postalCode || ''}

Le ${new Date().toLocaleDateString('fr-FR')}

COURRIER MÉDICAL

Concerne: ${recording.patient.firstName} ${recording.patient.lastName}
Date de naissance: ${new Date(recording.patient.dateOfBirth).toLocaleDateString('fr-FR')}

Cher Confrère,

Je vous adresse ${recording.patient.gender === 'MALE' ? 'Monsieur' : 'Madame'} ${recording.patient.lastName} que j'ai examiné${recording.patient.gender === 'FEMALE' ? 'e' : ''} en consultation le ${new Date().toLocaleDateString('fr-FR')}.

${summary}

Je reste à votre disposition pour tout complément d'information.

Cordialement,

Dr. ${recording.practitioner.firstName} ${recording.practitioner.lastName}
    `.trim();
  }

  /**
   * Extract medical data from transcription
   */
  private extractMedicalData(transcription: string): any {
    // TODO: Use NLP/AI to extract:
    // - Antecedents mentioned
    // - Allergies mentioned
    // - Current medications
    // - Symptoms
    // - Diagnostics

    return {
      antecedents: [],
      allergies: [],
      medications: [],
      symptoms: [],
      diagnostics: [],
    };
  }

  /**
   * Get recording by consultation ID
   */
  async getByConsultationId(consultationId: string) {
    return await prisma.consultationRecording.findFirst({
      where: { consultationId },
      include: {
        consultation: true,
        practitioner: true,
        patient: true,
      },
    });
  }

  /**
   * Get recording by ID
   */
  async getById(id: string) {
    return await prisma.consultationRecording.findUnique({
      where: { id },
      include: {
        consultation: true,
        practitioner: true,
        patient: true,
      },
    });
  }

  /**
   * Get all recordings for a cabinet
   */
  async getCabinetRecordings(
    cabinetId: string,
    filters?: {
      status?: RecordingStatus;
      practitionerId?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    return await prisma.consultationRecording.findMany({
      where: {
        cabinetId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.practitionerId && { practitionerId: filters.practitionerId }),
        ...(filters?.startDate &&
          filters?.endDate && {
            createdAt: {
              gte: filters.startDate,
              lte: filters.endDate,
            },
          }),
      },
      include: {
        consultation: true,
        practitioner: true,
        patient: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Delete recording
   */
  async delete(id: string) {
    return await prisma.consultationRecording.delete({
      where: { id },
    });
  }

  /**
   * Get statistics
   */
  async getStatistics(cabinetId: string, startDate: Date, endDate: Date) {
    const recordings = await prisma.consultationRecording.findMany({
      where: {
        cabinetId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const total = recordings.length;
    const completed = recordings.filter((r) => r.status === 'COMPLETED').length;
    const processing = recordings.filter((r) => r.status === 'PROCESSING').length;
    const failed = recordings.filter((r) => r.status === 'FAILED').length;
    const pending = recordings.filter((r) => r.status === 'PENDING').length;

    const successRate = total > 0 ? ((completed / total) * 100).toFixed(2) : '0';

    // Calculate average processing time
    const completedWithTime = recordings.filter(
      (r) => r.status === 'COMPLETED' && r.processingStarted && r.processingEnded
    );

    let avgProcessingTime = 0;
    if (completedWithTime.length > 0) {
      const totalTime = completedWithTime.reduce((sum, r) => {
        const start = r.processingStarted!.getTime();
        const end = r.processingEnded!.getTime();
        return sum + (end - start);
      }, 0);
      avgProcessingTime = Math.round(totalTime / completedWithTime.length / 1000); // seconds
    }

    return {
      total,
      completed,
      processing,
      failed,
      pending,
      successRate: parseFloat(successRate),
      avgProcessingTimeSeconds: avgProcessingTime,
    };
  }
}

export default new ConsultationRecordingService();
