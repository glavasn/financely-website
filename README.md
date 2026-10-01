# financely.com.au

Website for financely, Australian mortgage and finance brokers. Deployed with Cloudflare Pages.

## Files

| File | What it is |
|---|---|
| `index.html` | The home page content |
| `styles.css` | Colours, fonts and layout (colours are set once at the top as variables) |
| `main.js` | Repayment, borrowing power and refinance calculators, menu, contact form |
| `functions/api/contact.js` | Cloudflare Pages Function that emails contact form enquiries |
| `favicon.svg`, `robots.txt`, `sitemap.xml`, `_headers` | Browser icon, search engine files, security headers |

No build step: Cloudflare Pages serves the files as they are.

## Still to add

- Credit licence or credit representative details, and ABN, in the footer `legal` block
- Phone number, office address and hours in the contact section (and `telephone`/`address` in the JSON-LD block in the `<head>`)
- Credit Guide, Privacy Policy and Complaints (AFCA) pages, linked from the footer
- Real client reviews (a reviews section with styles is ready in `styles.css` under `/* reviews */`)
- Contact form email setup (below). Until it is set up, the form asks visitors to email instead.

## Contact form email

The form posts to `/api/contact`, which sends the enquiry by email through [Resend](https://resend.com).

1. Create a Resend account and verify the `financely.com.au` domain.
2. In Cloudflare Pages, open the project, then Settings, then Variables and Secrets, and add:
   - `RESEND_API_KEY` (as a secret)
   - `CONTACT_TO`, for example `info@financely.com.au`
   - `CONTACT_FROM`, for example `financely website <enquiries@financely.com.au>`
3. Redeploy. Until these are set, the form tells visitors to phone or email instead.

## Preview locally

```
npx wrangler pages dev .
```
