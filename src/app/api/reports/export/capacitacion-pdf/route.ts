import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), 'public/downloads/SOLINTEEC_Manual_Capacitacion_Exposicion_Campana_Quijos.pdf');

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const filename = 'SOLINTEEC_Manual_Capacitacion_Exposicion_Campana_Quijos.pdf';

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error sirviendo PDF de capacitación:', error);
    return NextResponse.json({ error: 'Error al obtener el documento' }, { status: 500 });
  }
}
