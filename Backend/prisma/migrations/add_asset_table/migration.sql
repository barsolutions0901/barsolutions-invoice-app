-- Create Asset table for storing image assets (logo, favicon, ttd, stempel, qris, login branding)
CREATE TABLE IF NOT EXISTS "Asset" (
    "key" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "base64" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Asset_pkey" PRIMARY KEY ("key")
);
