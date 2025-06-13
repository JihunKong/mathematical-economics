-- CreateTable
CREATE TABLE "StockPriceHistory" (
    "id" TEXT NOT NULL,
    "stockId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "currentPrice" DOUBLE PRECISION NOT NULL,
    "previousClose" DOUBLE PRECISION NOT NULL,
    "dayOpen" DOUBLE PRECISION NOT NULL,
    "dayHigh" DOUBLE PRECISION NOT NULL,
    "dayLow" DOUBLE PRECISION NOT NULL,
    "volume" BIGINT NOT NULL DEFAULT 0,
    "change" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "changePercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL DEFAULT 'mock',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockPriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StockPriceHistory_symbol_timestamp_idx" ON "StockPriceHistory"("symbol", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "StockPriceHistory_stockId_idx" ON "StockPriceHistory"("stockId");

-- CreateIndex
CREATE INDEX "StockPriceHistory_timestamp_idx" ON "StockPriceHistory"("timestamp");

-- AddForeignKey
ALTER TABLE "StockPriceHistory" ADD CONSTRAINT "StockPriceHistory_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE CASCADE ON UPDATE CASCADE;