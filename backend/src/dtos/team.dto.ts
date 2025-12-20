import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(100, 'Team name too long'),
  description: z.string().optional(),
  memberIds: z.array(z.string()).optional(),
});

export const updateTeamSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
});

export const addMemberSchema = z.object({
  userId: z.string(),
  role: z.enum(['admin', 'member']).default('member'),
});

export type CreateTeamDto = z.infer<typeof createTeamSchema>;
export type UpdateTeamDto = z.infer<typeof updateTeamSchema>;
export type AddMemberDto = z.infer<typeof addMemberSchema>;
