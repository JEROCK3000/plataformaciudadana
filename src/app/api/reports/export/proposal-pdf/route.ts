import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), 'public/downloads/SOLINTEEC_Propuesta_G-CRM_G-ERP_Municipal.pdf');

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const filename = 'SOLINTEEC_Propuesta_G-CRM_G-ERP_Municipal.pdf';

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error sirviendo propuesta PDF:', error);
    return NextResponse.json({ error: 'Error al obtener el documento' }, { status: 500 });
  }
}
