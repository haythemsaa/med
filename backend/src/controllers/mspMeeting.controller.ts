import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import mspMeetingService from '../services/mspMeeting.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { MeetingType, AttendanceStatus } from '@prisma/client';

const createMeetingSchema = z.object({
  cabinetId: z.string().uuid(),
  title: z.string(),
  meetingType: z.nativeEnum(MeetingType),
  description: z.string().optional(),
  scheduledDate: z.string().transform(val => new Date(val)),
  duration: z.number(),
  location: z.string().optional(),
  onlineLink: z.string().optional(),
  organizerId: z.string().uuid(),
  agenda: z.string().optional(),
});

const addParticipantsSchema = z.object({
  participants: z.array(
    z.object({
      userId: z.string().uuid(),
      role: z.string().optional(),
    })
  ),
});

const updateAttendanceSchema = z.object({
  attendance: z.nativeEnum(AttendanceStatus),
});

const completeMeetingSchema = z.object({
  minutes: z.string().optional(),
  decisions: z.string().optional(),
});

export class MSPMeetingController {
  /**
   * Create meeting
   */
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createMeetingSchema.parse(req.body);
      const meeting = await mspMeetingService.create(data as any);
      sendSuccess(res, meeting, 'Meeting created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add participants
   */
  async addParticipants(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { participants } = addParticipantsSchema.parse(req.body);
      await mspMeetingService.addParticipants(id, participants);
      sendSuccess(res, null, 'Participants added successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Suggest participants
   */
  async suggestParticipants(req: Request, res: Response, next: NextFunction) {
    try {
      const { cabinetId } = req.params;
      const { meetingType, caseDetails } = req.query;

      const suggestions = await mspMeetingService.suggestParticipants(
        cabinetId,
        meetingType as MeetingType,
        caseDetails ? JSON.parse(caseDetails as string) : undefined
      );

      sendSuccess(res, suggestions);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update attendance
   */
  async updateAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const { participantId } = req.params;
      const { attendance } = updateAttendanceSchema.parse(req.body);
      const participant = await mspMeetingService.updateAttendance(participantId, attendance);
      sendSuccess(res, participant, 'Attendance updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Start meeting
   */
  async startMeeting(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const meeting = await mspMeetingService.startMeeting(id);
      sendSuccess(res, meeting, 'Meeting started successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Complete meeting
   */
  async completeMeeting(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = completeMeetingSchema.parse(req.body);
      const meeting = await mspMeetingService.completeMeeting(id, data);
      sendSuccess(res, meeting, 'Meeting completed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get meeting by ID
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const meeting = await mspMeetingService.getById(id);
      sendSuccess(res, meeting);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get cabinet meetings
   */
  async getCabinetMeetings(req: Request, res: Response, next: NextFunction) {
    try {
      const { cabinetId } = req.params;
      const { meetingType, status, startDate, endDate } = req.query;

      const meetings = await mspMeetingService.getCabinetMeetings(cabinetId, {
        meetingType: meetingType as MeetingType,
        status: status as any,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      sendSuccess(res, meetings);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user meetings
   */
  async getUserMeetings(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const meetings = await mspMeetingService.getUserMeetings(userId);
      sendSuccess(res, meetings);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete meeting
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await mspMeetingService.delete(id);
      sendSuccess(res, null, 'Meeting deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new MSPMeetingController();
