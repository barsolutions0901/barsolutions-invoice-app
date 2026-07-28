-- CreateTable
CREATE TABLE "public"."Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "Nama" TEXT,
    "Username" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "Password" TEXT NOT NULL,
    "Jabatan" TEXT,
    "NoHp" TEXT,
    "Foto" TEXT,
    "TandaTangan" TEXT,
    "Role" TEXT NOT NULL DEFAULT 'Staf',
    "Status" TEXT NOT NULL DEFAULT 'Aktif',
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Client" (
    "id" TEXT NOT NULL,
    "Nama" TEXT NOT NULL,
    "Perusahaan" TEXT,
    "Email" TEXT,
    "Telepon" TEXT,
    "Alamat" TEXT,
    "NPWP" TEXT,
    "Catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Service" (
    "id" TEXT NOT NULL,
    "NamaLayanan" TEXT NOT NULL,
    "Kategori" TEXT,
    "Satuan" TEXT,
    "Harga" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "Deskripsi" TEXT,
    "Status" TEXT NOT NULL DEFAULT 'Aktif',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Quotation" (
    "id" TEXT NOT NULL,
    "Nomor" TEXT NOT NULL,
    "ClientID" TEXT NOT NULL,
    "Tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "TanggalBerlaku" TIMESTAMP(3),
    "Catatan" TEXT,
    "Subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "DiskonNilai" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "DiskonPersen" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "DiskonTipe" TEXT NOT NULL DEFAULT 'persen',
    "Diskon" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "PajakPersen" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "Pajak" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "Total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "Status" TEXT NOT NULL DEFAULT 'Draft',
    "CreatedByID" TEXT,
    "CreatedByNama" TEXT,
    "CreatedByJabatan" TEXT,
    "CreatedByTtd" TEXT,
    "UpdatedByID" TEXT,
    "UpdatedByNama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Quotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuotationItem" (
    "id" TEXT NOT NULL,
    "QuotationID" TEXT NOT NULL,
    "ServiceID" TEXT,
    "Deskripsi" TEXT NOT NULL,
    "Qty" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "Satuan" TEXT,
    "Harga" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "Subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    CONSTRAINT "QuotationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Invoice" (
    "id" TEXT NOT NULL,
    "Nomor" TEXT NOT NULL,
    "ClientID" TEXT NOT NULL,
    "Tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "JatuhTempo" TIMESTAMP(3),
    "Catatan" TEXT,
    "Subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "DiskonNilai" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "DiskonPersen" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "DiskonTipe" TEXT NOT NULL DEFAULT 'persen',
    "Diskon" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "PajakPersen" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "Pajak" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "Total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "DP" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "Sisa" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "Terbayar" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "Status" TEXT NOT NULL DEFAULT 'Belum Dibayar',
    "CreatedByID" TEXT,
    "CreatedByNama" TEXT,
    "CreatedByJabatan" TEXT,
    "CreatedByTtd" TEXT,
    "UpdatedByID" TEXT,
    "UpdatedByNama" TEXT,
    "ConvertedByID" TEXT,
    "ConvertedByNama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InvoiceItem" (
    "id" TEXT NOT NULL,
    "InvoiceID" TEXT NOT NULL,
    "ServiceID" TEXT,
    "Deskripsi" TEXT NOT NULL,
    "Qty" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "Satuan" TEXT,
    "Harga" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "Subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "InvoiceID" TEXT NOT NULL,
    "NomorInvoice" TEXT,
    "Tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Jumlah" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "Metode" TEXT NOT NULL DEFAULT 'Transfer Bank',
    "Referensi" TEXT,
    "Catatan" TEXT,
    "PaymentByID" TEXT,
    "PaymentByNama" TEXT,
    "UpdatedByID" TEXT,
    "UpdatedByNama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Setting" (
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "public"."Role"("name");
CREATE UNIQUE INDEX "User_Username_key" ON "public"."User"("Username");
CREATE UNIQUE INDEX "User_Email_key" ON "public"."User"("Email");
CREATE UNIQUE INDEX "Quotation_Nomor_key" ON "public"."Quotation"("Nomor");
CREATE UNIQUE INDEX "Invoice_Nomor_key" ON "public"."Invoice"("Nomor");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quotation" ADD CONSTRAINT "Quotation_ClientID_fkey" FOREIGN KEY ("ClientID") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuotationItem" ADD CONSTRAINT "QuotationItem_QuotationID_fkey" FOREIGN KEY ("QuotationID") REFERENCES "public"."Quotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuotationItem" ADD CONSTRAINT "QuotationItem_ServiceID_fkey" FOREIGN KEY ("ServiceID") REFERENCES "public"."Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_ClientID_fkey" FOREIGN KEY ("ClientID") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InvoiceItem" ADD CONSTRAINT "InvoiceItem_InvoiceID_fkey" FOREIGN KEY ("InvoiceID") REFERENCES "public"."Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InvoiceItem" ADD CONSTRAINT "InvoiceItem_ServiceID_fkey" FOREIGN KEY ("ServiceID") REFERENCES "public"."Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_InvoiceID_fkey" FOREIGN KEY ("InvoiceID") REFERENCES "public"."Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
