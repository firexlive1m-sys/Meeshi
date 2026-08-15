import handler from './api/auth/send-otp.ts';
const req = { method: 'POST', body: { email: 'test@example.com' } };
const res = { 
  setHeader: () => {}, 
  status: (code) => ({ json: (data) => console.log(code, data) }),
  json: (data) => console.log(200, data)
};
handler(req, res).catch(console.error);
