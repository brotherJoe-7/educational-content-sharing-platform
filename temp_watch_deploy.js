const fetch = globalThis.fetch;
const adminUrl = 'https://edu-content-backend.onrender.com';
const credentials = { email: 'admin@educonnectsl.org', password: 'AdminPassword2026!' };
const maxAttempts = 20;
const delay = 15000;
(async () => {
  for (let i = 1; i <= maxAttempts; i++) {
    console.log(`Attempt ${i}/${maxAttempts}...`);
    try {
      const loginRes = await fetch(`${adminUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const loginJson = await loginRes.json();
      console.log('login', loginRes.status, JSON.stringify(loginJson));
      if (!loginJson.token) {
        console.log('Login failed or no token');
      } else {
        const token = loginJson.token;
        const urlRes = await fetch(`${adminUrl}/api/admin/resources/6a2ab1cb2709c9d8c7dc2d00/file/url`, {
          method: 'GET',
          headers: { Authorization: 'Bearer ' + token }
        });
        const body = await urlRes.text();
        console.log('file/url status:', urlRes.status, urlRes.headers.get('content-type'));
        console.log(body.slice(0, 800));
        if (urlRes.status === 200) {
          console.log('SUCCESS: updated deploy is live.');
          process.exit(0);
        }
        const fileRes = await fetch(`${adminUrl}/api/admin/resources/6a2ab1cb2709c9d8c7dc2d00/file`, {
          method: 'GET',
          headers: { Authorization: 'Bearer ' + token },
          redirect: 'manual'
        });
        console.log('/file status:', fileRes.status, fileRes.headers.get('location') || fileRes.headers.get('content-type'));
        if (fileRes.status === 200) {
          const fileBody = await fileRes.text();
          console.log('/file body:', fileBody.slice(0, 800));
        }
      }
    } catch (e) {
      console.error('Request error:', e.message || e);
    }
    if (i < maxAttempts) {
      console.log(`Waiting ${delay / 1000}s before retry...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  console.log('Finished polling without seeing updated route.');
  process.exit(1);
})();
