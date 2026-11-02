# Spotless Mobile Detailing — spotlessdetailingreno.com

Static site (HTML/CSS/JS), deployed on Vercel. No build step.

Pages: Home, About, Services & Pricing, Car Club, Gallery, Reviews, Contact (free quote).

## Set the phone number & email
Open `assets/js/main.js` and fill in the `SPOTLESS` config at the top:

```js
phone: "(775) 555-0123",   // shows Call / Text buttons everywhere
email: "owner@example.com" // quote + car club forms get emailed here (FormSubmit)
```

The first form submission after setting the email sends a one-time FormSubmit
activation email to that inbox — click the link in it to activate.
Until an email is set, forms copy the request and open an Instagram DM to @spotlessdetails__.
