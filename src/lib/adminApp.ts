/**
 * The admin app (hallos-admin). Admin screens and the email portal live there,
 * not on this site. Set NEXT_PUBLIC_ADMIN_APP_URL to point elsewhere (e.g.
 * http://localhost:3000 while developing).
 */
export const ADMIN_APP_URL = (process.env.NEXT_PUBLIC_ADMIN_APP_URL || 'https://admin.hallos.net').replace(/\/+$/, '');
