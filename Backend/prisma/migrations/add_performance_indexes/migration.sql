-- Add performance indexes for frequently queried columns

CREATE INDEX IF NOT EXISTS "Client_createdAt_idx" ON "public"."Client"("createdAt");

CREATE INDEX IF NOT EXISTS "Service_createdAt_idx" ON "public"."Service"("createdAt");

CREATE INDEX IF NOT EXISTS "Quotation_createdAt_idx" ON "public"."Quotation"("createdAt");
CREATE INDEX IF NOT EXISTS "Quotation_ClientID_idx" ON "public"."Quotation"("ClientID");
CREATE INDEX IF NOT EXISTS "Quotation_Status_idx" ON "public"."Quotation"("Status");
CREATE INDEX IF NOT EXISTS "Quotation_Tanggal_idx" ON "public"."Quotation"("Tanggal");

CREATE INDEX IF NOT EXISTS "Invoice_createdAt_idx" ON "public"."Invoice"("createdAt");
CREATE INDEX IF NOT EXISTS "Invoice_ClientID_idx" ON "public"."Invoice"("ClientID");
CREATE INDEX IF NOT EXISTS "Invoice_Status_idx" ON "public"."Invoice"("Status");
CREATE INDEX IF NOT EXISTS "Invoice_Tanggal_idx" ON "public"."Invoice"("Tanggal");
CREATE INDEX IF NOT EXISTS "Invoice_JatuhTempo_idx" ON "public"."Invoice"("JatuhTempo");

CREATE INDEX IF NOT EXISTS "Payment_InvoiceID_idx" ON "public"."Payment"("InvoiceID");
CREATE INDEX IF NOT EXISTS "Payment_NomorInvoice_idx" ON "public"."Payment"("NomorInvoice");
CREATE INDEX IF NOT EXISTS "Payment_Tanggal_idx" ON "public"."Payment"("Tanggal");
CREATE INDEX IF NOT EXISTS "Payment_createdAt_idx" ON "public"."Payment"("createdAt");
