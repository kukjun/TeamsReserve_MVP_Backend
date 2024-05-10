-- CreateTable
CREATE TABLE "member" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "introduce" TEXT,
    "teamCode" TEXT NOT NULL,
    "joinStatus" BOOLEAN NOT NULL DEFAULT false,
    "authority" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastModifiedTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "space" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastModifiedTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "space_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "path" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "spaceId" UUID NOT NULL,

    CONSTRAINT "photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reserve" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "times" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastModifiedTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reserve_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reserve_log" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "reservedUser" TEXT NOT NULL,
    "reservedSpaceName" TEXT NOT NULL,
    "reservedLocation" TEXT NOT NULL,
    "reservedTimes" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastModifiedTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reserve_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "member_email_key" ON "member"("email");

-- CreateIndex
CREATE UNIQUE INDEX "member_nickname_key" ON "member"("nickname");

-- AddForeignKey
ALTER TABLE "photo" ADD CONSTRAINT "photo_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "space"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
