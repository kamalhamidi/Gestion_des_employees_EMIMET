-- CreateTable
CREATE TABLE "advance_logs" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "advance_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "advance_logs_employeeId_idx" ON "advance_logs"("employeeId");

-- CreateIndex
CREATE INDEX "advance_logs_createdAt_idx" ON "advance_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "advance_logs" ADD CONSTRAINT "advance_logs_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
