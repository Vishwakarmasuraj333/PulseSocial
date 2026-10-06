import { prisma } from "@/lib/prisma";

export interface AiGenerationCreateInput {
  userId?: string | null;
  workspaceId?: string | null;
  provider?: string;
  taskType: string;
  model: string;
  prompt: string;
  enhancedPrompt?: string | null;
  inputData?: string | null;
  outputText?: string | null;
  imageUrl?: string | null;
  platform?: string | null;
  tone?: string | null;
  status?: string;
  errorMessage?: string | null;
}

export interface AiGenerationFindManyArgs {
  where?: any;
  orderBy?: any;
  take?: number;
  skip?: number;
  select?: any;
}

export interface AiGenerationFindUniqueArgs {
  where: { id: string };
  select?: any;
}

export interface AiGenerationDeleteArgs {
  where: { id: string };
}

export const aiDb = {
  create: async (data: AiGenerationCreateInput) => {
    return (prisma as any).aiGeneration.create({ data });
  },
  findMany: async (args: AiGenerationFindManyArgs) => {
    return (prisma as any).aiGeneration.findMany(args);
  },
  findUnique: async (args: AiGenerationFindUniqueArgs) => {
    return (prisma as any).aiGeneration.findUnique(args);
  },
  delete: async (args: AiGenerationDeleteArgs) => {
    return (prisma as any).aiGeneration.delete(args);
  },
  count: async (args?: any) => {
    return (prisma as any).aiGeneration.count(args);
  },
};
