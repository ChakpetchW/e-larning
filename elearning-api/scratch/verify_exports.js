const AdminService = require('../src/services/admin.service');

async function verify() {
  const requiredMethods = [
    'getAdminAnnouncements',
    'createAnnouncement',
    'updateAnnouncement'
  ];

  console.log('Verifying AdminService exports:');
  let allPresent = true;

  requiredMethods.forEach(method => {
    if (typeof AdminService[method] === 'function') {
      console.log(`[OK] ${method} is exported correctly.`);
    } else {
      console.error(`[FAIL] ${method} is MISSING or is not a function (Type: ${typeof AdminService[method]})`);
      allPresent = false;
    }
  });

  if (allPresent) {
    console.log('\nSuccess! All announcement methods are now exported.');
  } else {
    process.exit(1);
  }
}

verify();
