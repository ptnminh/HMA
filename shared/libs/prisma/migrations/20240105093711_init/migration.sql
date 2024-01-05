-- CreateTable
CREATE TABLE "userSchedules" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "startTime" TIME(0) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_disabled" BOOLEAN NOT NULL DEFAULT false,
    "disabled_at" TIMESTAMP(3),

    CONSTRAINT "userSchedules_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "userSchedules" ADD CONSTRAINT "userSchedules_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
