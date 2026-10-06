# Atelier Vell - Handbags E-Commerce Demo

This is a front-end only demonstration for a luxury handbags e-commerce web application, built with plain HTML, CSS, and vanilla JavaScript.

## Features Built
- **Pages**: Exactly 10 pages as required: index, shop, collections, product-detail, cart, services, about, login, register, and dashboard. No extra pages.
- **Design System**: Luxury-refined aesthetic using CSS variables, Cormorant Garamond (headings) and Mulish (body).
- **Authentication**: Fully functional client-side demo authentication.
- **Shopping Workflow**: Category filtering, instant Quick-View modals, slide-over Wishlist drawer, Cart with stock limitations, and an inline Checkout placeholder.
- **Admin Dashboard**: Full CRUD management of products, inventory, and order status updates using a shared localStorage data model.
- **Validation**: All forms feature client-side HTML5 validation.

## Demo Credentials
Since this is a front-end only demo, user state is simulated using `localStorage`.

- **Admin Account**: To access the Admin Dashboard, log in using the email `admin@ateliervell.com` (any password will work, minimum 8 characters).
- **User Account**: Register a new account or log in with any other email to be assigned the "user" role, which will restrict access to the dashboard.

## Technical Details
- No frameworks were used, strictly ES6 JavaScript and Vanilla CSS.
- The only external library is the Phosphor Icons CDN.
- Data persistence is handled via the `AtelierStore` class wrapping `localStorage`.

## Setup
Simply open `index.html` in a web browser or run using a local development server (e.g., Live Server, `python -m http.server`).

*Note: All products, images, prices, stock, and orders are placeholder data for demonstration purposes only.*
