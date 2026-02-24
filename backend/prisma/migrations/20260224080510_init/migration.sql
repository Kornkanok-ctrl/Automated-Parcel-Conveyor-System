-- CreateTable
CREATE TABLE "Admin" (
    "name" TEXT NOT NULL,
    "hash" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "Transport" (
    "id" TEXT NOT NULL,
    "transport_name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receiver" (
    "id" TEXT NOT NULL,
    "fullname" TEXT,
    "phone" TEXT,
    "roomNumber" TEXT,
    "token_line" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Receiver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransportNumber" (
    "id" TEXT NOT NULL,
    "id_transport" TEXT NOT NULL,
    "id_receiver" TEXT NOT NULL,
    "trackingNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransportNumber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TransportNumber_trackingNumber_key" ON "TransportNumber"("trackingNumber");

-- CreateIndex
CREATE INDEX "TransportNumber_id_transport_idx" ON "TransportNumber"("id_transport");

-- CreateIndex
CREATE INDEX "TransportNumber_id_receiver_idx" ON "TransportNumber"("id_receiver");

-- AddForeignKey
ALTER TABLE "TransportNumber" ADD CONSTRAINT "TransportNumber_id_transport_fkey" FOREIGN KEY ("id_transport") REFERENCES "Transport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportNumber" ADD CONSTRAINT "TransportNumber_id_receiver_fkey" FOREIGN KEY ("id_receiver") REFERENCES "Receiver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
