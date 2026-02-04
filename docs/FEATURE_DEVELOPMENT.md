# Feature Development Guide

This guide walks you through adding a new feature following the Clean Architecture pattern.

## Example: Adding a "Projects" Feature

Let's add a feature to manage projects.

### Step 1: Define the Domain Entity

Create the entity in `src/domain/entities/`:

```typescript
// src/domain/entities/Project.ts
export interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectPublic {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  isActive: boolean;
  createdAt: Date;
}

export function toProjectPublic(project: Project): ProjectPublic {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    ownerId: project.ownerId,
    isActive: project.isActive,
    createdAt: project.createdAt,
  };
}
```

### Step 2: Define the Repository Interface

Create the interface in `src/domain/interfaces/repositories/`:

```typescript
// src/domain/interfaces/repositories/IProjectRepository.ts
import type { Project } from '@/domain/entities/Project';

export interface CreateProjectInput {
  name: string;
  description?: string | null;
  ownerId: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface IProjectRepository {
  findById(id: string): Promise<Project | null>;
  findByOwnerId(ownerId: string): Promise<Project[]>;
  create(input: CreateProjectInput): Promise<Project>;
  update(id: string, input: UpdateProjectInput): Promise<Project>;
  delete(id: string): Promise<void>;
}
```

### Step 3: Add Prisma Model

Update `prisma/schema.prisma`:

```prisma
model projects {
  id          String   @id @default(uuid()) @db.Uuid
  name        String   @db.VarChar(255)
  description String?  @db.Text
  owner_id    String   @db.Uuid
  is_active   Boolean  @default(true)
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  owner users @relation(fields: [owner_id], references: [id], onDelete: Cascade)

  @@index([owner_id])
}
```

Run migration:

```bash
bun run prisma:migrate:dev --name add_projects
```

### Step 4: Implement the Repository

Create `src/infrastructure/database/repositories/PrismaProjectRepository.ts`:

```typescript
import prisma from '../PrismaClient';
import type { Project } from '@/domain/entities/Project';
import type { IProjectRepository, CreateProjectInput, UpdateProjectInput } from '@/domain/interfaces/repositories/IProjectRepository';

function mapToDomain(data: any): Project {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    ownerId: data.owner_id,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export class PrismaProjectRepository implements IProjectRepository {
  async findById(id: string): Promise<Project | null> {
    const project = await prisma.projects.findUnique({ where: { id } });
    return project ? mapToDomain(project) : null;
  }

  async findByOwnerId(ownerId: string): Promise<Project[]> {
    const projects = await prisma.projects.findMany({
      where: { owner_id: ownerId },
      orderBy: { created_at: 'desc' },
    });
    return projects.map(mapToDomain);
  }

  async create(input: CreateProjectInput): Promise<Project> {
    const project = await prisma.projects.create({
      data: {
        name: input.name,
        description: input.description ?? null,
        owner_id: input.ownerId,
      },
    });
    return mapToDomain(project);
  }

  async update(id: string, input: UpdateProjectInput): Promise<Project> {
    const project = await prisma.projects.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.isActive !== undefined && { is_active: input.isActive }),
      },
    });
    return mapToDomain(project);
  }

  async delete(id: string): Promise<void> {
    await prisma.projects.delete({ where: { id } });
  }
}
```

### Step 5: Create DTOs

Create `src/application/dto/project/`:

```typescript
// src/application/dto/project/CreateProjectDTO.ts
import { z } from 'zod';

export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(1000).optional(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
```

### Step 6: Create Use Cases

Create `src/application/use-cases/project/`:

```typescript
// src/application/use-cases/project/CreateProjectUseCase.ts
import type { IProjectRepository } from '@/domain/interfaces/repositories/IProjectRepository';
import type { CreateProjectInput } from '@/application/dto/project/CreateProjectDTO';
import type { ProjectPublic } from '@/domain/entities/Project';
import { toProjectPublic } from '@/domain/entities/Project';

export class CreateProjectUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(input: CreateProjectInput, userId: string): Promise<ProjectPublic> {
    const project = await this.projectRepository.create({
      name: input.name,
      description: input.description,
      ownerId: userId,
    });
    return toProjectPublic(project);
  }
}
```

### Step 7: Create Controller

Create `src/presentation/controllers/ProjectController.ts`:

```typescript
import { CreateProjectUseCase } from '@/application/use-cases/project/CreateProjectUseCase';
import { PrismaProjectRepository } from '@/infrastructure/database/repositories/PrismaProjectRepository';
import type { CreateProjectInput } from '@/application/dto/project/CreateProjectDTO';
import type { ProjectPublic } from '@/domain/entities/Project';

export class ProjectController {
  private readonly createProjectUseCase: CreateProjectUseCase;

  constructor() {
    const projectRepository = new PrismaProjectRepository();
    this.createProjectUseCase = new CreateProjectUseCase(projectRepository);
  }

  async createProject(input: CreateProjectInput, userId: string): Promise<ProjectPublic> {
    return this.createProjectUseCase.execute(input, userId);
  }
}
```

### Step 8: Create API Routes

Create `src/app/api/projects/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { requireAuth, type AuthenticatedUser } from '@/lib/api-auth';
import { ProjectController } from '@/presentation/controllers/ProjectController';
import { CreateProjectSchema } from '@/application/dto/project/CreateProjectDTO';
import { ValidationError } from '@/domain/errors';

const projectController = new ProjectController();

export const POST = requireAuth(async (request: Request, user: AuthenticatedUser) => {
  try {
    const body = await request.json();
    const parseResult = CreateProjectSchema.safeParse(body);

    if (!parseResult.success) {
      throw ValidationError.fromZodError(parseResult.error);
    }

    const project = await projectController.createProject(parseResult.data, user.userId);
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
});
```

### Step 9: Add UI Components

Create the page in `src/app/(dashboard)/dashboard/projects/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
// ... your UI code
```

## Checklist for New Features

- [ ] Domain entity defined
- [ ] Repository interface defined
- [ ] Prisma model added
- [ ] Migration created and applied
- [ ] Repository implementation created
- [ ] DTOs with validation created
- [ ] Use cases created
- [ ] Controller created
- [ ] API routes created
- [ ] UI components created
- [ ] Tests written (if applicable)

## Tips

1. **Start from the Domain**: Always define your entity and interfaces first
2. **Use TypeScript**: Leverage types for compile-time safety
3. **Validate Early**: Use Zod schemas in DTOs
4. **Handle Errors**: Create domain-specific errors
5. **Keep Use Cases Small**: One use case = one action
