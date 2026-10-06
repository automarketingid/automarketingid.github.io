AUTO MARKETING WEB V3
=======================

Files:
- index.html       = public Web AM
- style.css        = shared visual style
- script.js        = navigation, reveal animation, form handling
- am-plus.html     = separate AM+ product/system page

DESIGN DIRECTION
- Plain Indonesian for ordinary prospective clients.
- Long-form explanation so visitors understand before contacting.
- Web AM and AM+ are explicitly separated.
- CTA buttons are separated from the intake form.
- Form remains on the page but does not dominate the website.

IMPORTANT FORM NOTE
The production intake endpoint is intentionally NOT invented.
script.js contains:
    const INTAKE_ENDPOINT = "";

Before public production launch, this must be replaced with the verified AUTO MARKETING backend intake endpoint.
The expected request is POST JSON and includes source=WEB_AM.

The current source project did not establish a verified public Web intake endpoint, so pretending that a random URL is active would be misleading.
