import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@collospot.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@collospot.com',
      phone: '+254700000000',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'SUPER_ADMIN'
    }
  });

  console.log('✅ Admin user created:', admin.email);

  // Create sample plans
  const plans = [
    {
      name: 'Basic 1 Hour',
      description: 'Perfect for quick browsing and social media',
      price: 20,
      duration: 1,
      dataLimit: '500MB',
      speedLimit: '5Mbps'
    },
    {
      name: 'Standard 6 Hours',
      description: 'Great for work and entertainment',
      price: 100,
      duration: 6,
      dataLimit: '2GB',
      speedLimit: '10Mbps'
    },
    {
      name: 'Premium 24 Hours',
      description: 'Full day unlimited browsing',
      price: 300,
      duration: 24,
      dataLimit: '10GB',
      speedLimit: '20Mbps'
    },
    {
      name: 'Weekly Package',
      description: 'Best value for extended use',
      price: 1500,
      duration: 168, // 7 days
      dataLimit: '50GB',
      speedLimit: '25Mbps'
    },
    {
      name: 'Monthly Unlimited',
      description: 'Unlimited internet for a full month',
      price: 5000,
      duration: 720, // 30 days
      dataLimit: 'Unlimited',
      speedLimit: '50Mbps'
    }
  ];

  for (const planData of plans) {
    const plan = await prisma.plan.upsert({
      where: { name: planData.name },
      update: planData,
      create: planData
    });
    console.log('✅ Plan created:', plan.name);
  }

  // Create system config
  const configs = [
    { key: 'SYSTEM_NAME', value: 'COLLOSPOT' },
    { key: 'SYSTEM_TAGLINE', value: 'Connect. Pay. Browse — Seamlessly.' },
    { key: 'COMPANY_NAME', value: 'COLLOSPOT WiFi Solutions' },
    { key: 'SUPPORT_PHONE', value: '+254700000000' },
    { key: 'SUPPORT_EMAIL', value: 'support@collospot.com' },
    { key: 'FREE_TRIAL_MINUTES', value: '15' },
    { key: 'SESSION_WARNING_MINUTES', value: '10' }
  ];

  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config
    });
  }

  console.log('✅ System configuration created');
  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });