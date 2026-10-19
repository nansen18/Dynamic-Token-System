require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const { connectDB, Users } = require('../database/store');

async function setupAdmin() {
  console.log('====================================================');
  console.log('🛡️  NexusQueue Authorized Admin Setup Utility');
  console.log('====================================================');

  const args = process.argv.slice(2);
  const email = (args[0] || process.env.ADMIN_EMAIL || 'admin@nexusqueue.io').toLowerCase().trim();
  const password = args[1] || process.env.ADMIN_PASSWORD || 'Admin@Nexus2025';
  const name = args[2] || process.env.ADMIN_NAME || 'System Administrator';

  if (!email || !password) {
    console.error('❌ Error: Email and password are required.');
    console.log('Usage: node scripts/setupAdmin.js <email> <password> [name]');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('❌ Error: Admin password must be at least 6 characters long.');
    process.exit(1);
  }

  try {
    await connectDB(process.env.MONGODB_URI);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const existingAdmin = await Users.findOne({ email });

    if (existingAdmin) {
      console.log(`⚠️  Admin account with email [${email}] already exists. Updating password and privileges...`);
      await Users.updateOne(
        { email },
        {
          name,
          password: hashedPassword,
          role: 'ADMIN',
          active: true,
          updatedAt: new Date()
        }
      );
      console.log(`✅ Admin account [${email}] successfully updated!`);
    } else {
      const adminId = 'usr_admin_' + Date.now();
      await Users.create({
        id: adminId,
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
        department: 'ALL',
        active: true
      });
      console.log(`✅ Authorized Admin account [${email}] successfully created!`);
    }

    console.log('----------------------------------------------------');
    console.log('Admin Email   :', email);
    console.log('Admin Password:', '****** (encrypted via bcrypt)');
    console.log('Role          : ADMIN (Full Security Clearance)');
    console.log('====================================================');
    process.exit(0);
  } catch (err) {
    console.error('❌ Fatal error setting up admin:', err.message);
    process.exit(1);
  }
}

setupAdmin();
