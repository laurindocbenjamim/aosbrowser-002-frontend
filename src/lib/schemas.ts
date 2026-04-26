import { z } from 'zod';

export const AgentSchema = z.object({
  target: z.string().min(3, { message: "Target URL is too short" }),
  instruction: z.string().min(10, { message: "Instruction must be at least 10 characters long" }),
  iterations: z.number().min(1).max(100).optional(),
});

export const AutomationSchema = z.object({
  target: z.string().min(3, { message: "Target URL is too short" }),
  instruction: z.string().min(10, { message: "Instruction must be at least 10 characters long" }),
  context: z.string().optional(),
  autoDecision: z.boolean().optional(),
});
