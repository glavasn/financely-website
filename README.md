# financely.com.au

Concept website for the brand financely, used to show the potential of the domain financely.com.au, which is for sale. It is a demonstration site: financely is not a lender or broker, and the contact form does not send anything. Deployed with Cloudflare Pages.

## Files

| File | What it is |
|---|---|
| `index.html` | The home page content |
| `styles.css` | Colours, fonts and layout (colours are set once at the top as variables) |
| `main.js` | Repayment, borrowing power and refinance calculators, menu, demo contact form, copy-email button |
| `favicon.svg`, `robots.txt`, `sitemap.xml`, `_headers` | Browser icon, search engine files, security headers |

No build step: Cloudflare Pages serves the files as they are.

## Domain sale

The "for sale" bar at the top and the `#domain` section near the bottom of `index.html` point buyers to offers@financely.com.au (forwarded by Cloudflare Email Routing; a catch-all covers other addresses such as info@). Change the address in both the section and the `mailto:` link if offers should go elsewhere.

## Preview locally

```
python3 -m http.server 8000
```
