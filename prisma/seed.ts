import { prisma } from '../src/lib/db/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('--- Iniciando Seed Multitenant SaaS ---');

  // 1. Configuración global
  const defaultPrompt = `Eres un asistente de inteligencia artificial experto en administración pública municipal de Ecuador. Tu objetivo es asesorar a alcaldes y directores departamentales con base en el COOTAD, la LOSNCP y las resoluciones vigentes del SERCOP.`;

  await prisma.systemSettings.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      platformName: 'Plataforma Ciudadana SaaS',
      aiPromptMaster: defaultPrompt,
    },
  });

  // 2. Tenant 1: GAD Municipal de Quijos
  const quijosParishes = [
    'Baeza',
    'Cosanga',
    'Cuyuja',
    'Papallacta',
    'San Francisco de Borja',
    'Sumaco',
  ];

  const quijosTenant = await prisma.tenant.upsert({
    where: { slug: 'quijos' },
    update: {
      name: 'GAD Municipal del Cantón Quijos',
      canton: 'Quijos',
      province: 'Napo',
      parishes: quijosParishes,
      isActive: true,
    },
    create: {
      slug: 'quijos',
      name: 'GAD Municipal del Cantón Quijos',
      canton: 'Quijos',
      province: 'Napo',
      parishes: quijosParishes,
      plan: 'ENTERPRISE',
      isActive: true,
    },
  });
  console.log(`Tenant listo: ${quijosTenant.name} [slug: ${quijosTenant.slug}]`);

  // 3. Tenant 2: GAD Municipal de Archidona (para demo multitenant en vivo)
  const archidonaParishes = [
    'Archidona',
    'Cotundo',
    'San Pablo de Ushpayacu',
    'Hatun Sumaku',
  ];

  const archidonaTenant = await prisma.tenant.upsert({
    where: { slug: 'archidona' },
    update: {
      name: 'GAD Municipal del Cantón Archidona',
      canton: 'Archidona',
      province: 'Napo',
      parishes: archidonaParishes,
      isActive: true,
    },
    create: {
      slug: 'archidona',
      name: 'GAD Municipal del Cantón Archidona',
      canton: 'Archidona',
      province: 'Napo',
      parishes: archidonaParishes,
      plan: 'PRO',
      isActive: true,
    },
  });
  console.log(`Tenant listo: ${archidonaTenant.name} [slug: ${archidonaTenant.slug}]`);

  // 4. Asignar reportes existentes sin tenant al tenant de Quijos
  try {
    await prisma.$executeRawUnsafe(
      `UPDATE \`Report\` SET \`tenantId\` = ? WHERE \`tenantId\` IS NULL OR \`tenantId\` = ''`,
      quijosTenant.id
    );
  } catch (e) {
    // Reportes ya asignados
  }

  // 5. Usuario Administrador de Quijos
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@solinteec.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminQuijos2026*';
  const adminHashed = await bcrypt.hash(adminPassword, 12);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'ADMIN',
      tenantId: quijosTenant.id,
      name: 'Administrador GAD Quijos',
    },
    create: {
      email: adminEmail,
      password: adminHashed,
      name: 'Administrador GAD Quijos',
      role: 'ADMIN',
      tenantId: quijosTenant.id,
    },
  });
  console.log(`Admin Tenant Quijos listo: ${adminUser.email} (tenant: ${quijosTenant.slug})`);

  // 6. Super Administrador Global
  const superAdminEmail = process.env.SUPERADMIN_EMAIL || 'superadmin@solinteec.com';
  const superAdminPassword = process.env.SUPERADMIN_PASSWORD || 'SuperAdmin2026*';
  const superAdminHashed = await bcrypt.hash(superAdminPassword, 12);

  const superAdminUser = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      role: 'SUPERADMIN',
      tenantId: null,
      name: 'Superadmin Global SaaS',
    },
    create: {
      email: superAdminEmail,
      password: superAdminHashed,
      name: 'Superadmin Global SaaS',
      role: 'SUPERADMIN',
      tenantId: null,
    },
  });
  console.log(`SuperAdmin listo: ${superAdminUser.email} [SUPERADMIN]`);

  // 7. Administrador para Archidona (demo)
  const archidonaAdminEmail = 'admin@archidona.gob.ec';
  const archidonaAdminHashed = await bcrypt.hash('AdminArchidona2026*', 12);

  await prisma.user.upsert({
    where: { email: archidonaAdminEmail },
    update: {
      role: 'ADMIN',
      tenantId: archidonaTenant.id,
      name: 'Administrador GAD Archidona',
    },
    create: {
      email: archidonaAdminEmail,
      password: archidonaAdminHashed,
      name: 'Administrador GAD Archidona',
      role: 'ADMIN',
      tenantId: archidonaTenant.id,
    },
  });
  console.log(`Admin Tenant Archidona listo: ${archidonaAdminEmail}`);

  // 8. Reporte de muestra en Archidona para verificar aislamiento
  const archidonaReportsCount = await prisma.report.count({
    where: { tenantId: archidonaTenant.id },
  });

  if (archidonaReportsCount === 0) {
    await prisma.report.create({
      data: {
        tenantId: archidonaTenant.id,
        title: 'Mantenimiento del sistema de agua potable en Cotundo',
        category: 'WATER',
        urgency: 'HIGH',
        parish: 'Cotundo',
        neighborhood: 'Sector Central',
        description: 'Baja presión de agua potable durante horas pico afectando a más de 50 familias del sector.',
        status: 'RECEIVED',
        votes: 4,
        citizenName: 'Comunidad Cotundo',
      },
    });
    console.log('Reporte de muestra creado en Archidona para validar aislamiento.');
  }

  console.log('--- Seed Multitenant finalizado con éxito ---');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
