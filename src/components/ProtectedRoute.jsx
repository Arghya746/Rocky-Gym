import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Decode a JWT payload without verifying it.
 *
 * IMPORTANT:
 * This is only a client-side UX check.
 * The backend remains responsible for actual authentication.
 */
const decodeJwtPayload = (token) => {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }

    const parts = token.split('.');

    if (parts.length !== 3) {
      return null;
    }

    const base64 = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const padded =
      base64 +
      '='.repeat(
        (4 - (base64.length % 4)) % 4
      );

    return JSON.parse(atob(padded));
  } catch (error) {
    console.warn(
      'Unable to decode admin token:',
      error
    );

    return null;
  }
};

/**
 * ProtectedRoute
 *
 * Protects the admin dashboard from:
 * - missing JWT
 * - malformed JWT
 * - expired JWT
 */
export default function ProtectedRoute({
  children,
}) {
  const token =
    localStorage.getItem('adminToken');

  // -----------------------------------------
  // NO TOKEN
  // -----------------------------------------

  if (!token) {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  // -----------------------------------------
  // DECODE TOKEN
  // -----------------------------------------

  const payload =
    decodeJwtPayload(token);

  // -----------------------------------------
  // INVALID TOKEN
  // -----------------------------------------

  if (!payload) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');

    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  // -----------------------------------------
  // TOKEN EXPIRATION
  // -----------------------------------------

  if (
    payload.exp &&
    Date.now() >= payload.exp * 1000
  ) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');

    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  // -----------------------------------------
  // VALID TOKEN
  // -----------------------------------------

  return children;
}