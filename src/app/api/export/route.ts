import { buildExportWorkbook } from "@/export/excel";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const workbook = await buildExportWorkbook(prisma);
  const buffer = await workbook.xlsx.writeBuffer();
  return new Response(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="pokemon-go-retention-001-030.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
