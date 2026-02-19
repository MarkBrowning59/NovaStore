// services/bcInventory.service.js
const axios = require('axios');

let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Get and cache a Business Central OAuth token (client credentials).
 * Uses either:
 *  - BC_TOKEN_URL, or
 *  - BC_TENANT_ID to build the URL
 */
async function getBusinessCentralToken() {
  const now = Date.now();

  if (cachedToken && now < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const tokenUrl =
    process.env.BC_TOKEN_URL ||
    `https://login.microsoftonline.com/${process.env.BC_TENANT_ID}/oauth2/v2.0/token`;

  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', process.env.BC_CLIENT_ID);
  params.append('client_secret', process.env.BC_CLIENT_SECRET);
  params.append('scope', 'https://api.businesscentral.dynamics.com/.default');

  const resp = await axios.post(tokenUrl, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  cachedToken = resp.data.access_token;
  tokenExpiresAt = now + resp.data.expires_in * 1000;

  return cachedToken;
}

/**
 * Get inventory from BC for a given item "no".
 *
 * This calls:
 *   {BC_BASE_URL}/api/novabrandprojection/api/v2.0/companies({BC_COMPANY_ID})/storefrontInventory
 * with:
 *   $filter=no eq '{bcNo}'
 *   $select=inventory
 */
async function getInventoryForBcNo(bcNo) {
  if (!bcNo) return null;

  const token = await getBusinessCentralToken();

  const baseUrl = process.env.BC_BASE_URL;
  const companyId = process.env.BC_COMPANY_ID;

  const url = `${baseUrl}/api/novabrandprojection/api/v2.0/companies(${companyId})/storefrontInventory`;

  const resp = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    params: {
      $filter: `no eq '${bcNo}'`,
      $select: 'inventory',
    },
  });

  const rows = resp.data && resp.data.value ? resp.data.value : [];
  if (!rows.length) {
    return 0;
  }

  const inventory = rows[0].inventory;
  return typeof inventory === 'number' ? inventory : 0;
}

module.exports = {
  getInventoryForBcNo,
};
