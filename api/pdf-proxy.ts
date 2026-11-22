/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Hardened PDF Proxy: Delegates to /api/get-book-access
 * Completely blocks unauthenticated arbitrary URL fetching.
 */

export const config = {
  runtime: 'edge',
};

import getBookAccessHandler from './get-book-access';

export default async function handler(req: any, res?: any) {
  // Directly delegate to the authenticated server-side access controller
  return getBookAccessHandler(req, res);
}
