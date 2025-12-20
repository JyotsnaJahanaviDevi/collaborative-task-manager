/*
  Warnings:

  - You are about to drop the column `teamId` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the `task_assignments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `team_members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `teams` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "task_assignments" DROP CONSTRAINT "task_assignments_taskId_fkey";

-- DropForeignKey
ALTER TABLE "task_assignments" DROP CONSTRAINT "task_assignments_userId_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_teamId_fkey";

-- DropForeignKey
ALTER TABLE "team_members" DROP CONSTRAINT "team_members_teamId_fkey";

-- DropForeignKey
ALTER TABLE "team_members" DROP CONSTRAINT "team_members_userId_fkey";

-- DropForeignKey
ALTER TABLE "teams" DROP CONSTRAINT "teams_creatorId_fkey";

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "teamId",
ADD COLUMN     "assignedToId" TEXT;

-- DropTable
DROP TABLE "task_assignments";

-- DropTable
DROP TABLE "team_members";

-- DropTable
DROP TABLE "teams";

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
