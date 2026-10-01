// Cloudflare Pages Function: receives the contact form and emails it via Resend (https://resend.com).
// Set these in Cloudflare Pages > Settings > Variables and Secrets:
//   RESEND_API_KEY  - API key from Resend (store as a secret)
//   CONTACT_TO      - inbox that receives enquiries, e.g. info@financely.com.au
//   CONTACT_FROM    - sender on a domain verified in Resend, e.g. "financely website <enquiries@financely.com.au>"

const TOPICS = ['First home', 'Refinancing', 'Next home', 'Investing', 'Business or car'];

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid request' }, 400);
  }

  // Honeypot: real visitors never fill this hidden field
  if (clean(data.company, 200)) return json({ ok: true });

  const name = clean(data.name, 100);
  const phone = clean(data.phone, 30);
  const email = clean(data.email, 200);
  const message = clean(data.message, 2000);
  const topic = TOPICS.includes(data.topic) ? data.topic : 'Not specified';

  if (!name || !phone || !/^\S+@\S+\.\S+$/.test(email)) {
    return json({ ok: false, error: 'Missing name, phone or email' }, 400);
  }
  if (!env.RESEND_API_KEY || !env.CONTACT_TO || !env.CONTACT_FROM) {
    return json({ ok: false, error: 'Email is not configured' }, 500);
  }

  const rows = [['Name', name], ['Phone', phone], ['Email', email], ['Looking at', topic], ['Message', message || '(none)']];
  const html = '<h2>New website enquiry</h2><table cellpadding="6">' +
    rows.map(([k, v]) => `<tr><td><strong>${k}</strong></td><td>${escapeHtml(v).replace(/\n/g, '<br>')}</td></tr>`).join('') +
    '</table>';
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.CONTACT_FROM,
      to: [env.CONTACT_TO],
      reply_to: email,
      subject: `Website enquiry: ${topic} - ${name}`,
      html,
      text
    })
  });

  if (!res.ok) return json({ ok: false, error: 'Could not send email' }, 502);
  return json({ ok: true });
}
