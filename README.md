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

## Before going live

1. Replace the sample details in `index.html` (search for each one):
   - phone `1300 975 714`
   - address `Suite 4.02, 77 Berry Street, North Sydney NSW 2060` (also in the JSON-LD block in the `<head>`)
   - ABN, CRN, licensee name and Australian Credit Licence number in the footer
   - lender count `40+`, Google rating, and the three sample reviews (use real reviews with permission and remove the "Sample review" tags)
2. Delete the `SAMPLE DETAILS NOTICE` block at the top of `<body>`.
3. Add the Credit Guide, Privacy Policy and Complaints (AFCA) pages and link them in the footer.
4. Set up the contact form email (below).

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
