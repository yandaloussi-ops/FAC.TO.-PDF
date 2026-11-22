/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Hardened PDF Proxy: Delegates to /api/get-book-access
 * Completely blocks unauthenticated arbitrary URL fetching.
 */

import getBookAccessHandler from './get-book-access';

export default async function handler(request: Request) {
  // Directly delegate to the authenticated server-side access controller
  return getBookAccessHandler(request);
}
