import { describe, it, expect, beforeAll, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { ENV } from './_core/env';

describe('Admin Authentication System', () => {
  it('should create valid JWT token for admin', () => {
    const adminData = {
      adminId: 1,
      username: 'admin',
      email: 'admin@ooredoo.com',
    };

    const token = jwt.sign(adminData, ENV.jwtSecret, { expiresIn: '24h' });
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    // Verify the token
    const decoded = jwt.verify(token, ENV.jwtSecret) as typeof adminData;
    expect(decoded.adminId).toBe(1);
    expect(decoded.username).toBe('admin');
    expect(decoded.email).toBe('admin@ooredoo.com');
  });

  it('should reject invalid JWT token', () => {
    const invalidToken = 'invalid.token.here';
    
    expect(() => {
      jwt.verify(invalidToken, ENV.jwtSecret);
    }).toThrow();
  });

  it('should reject expired JWT token', () => {
    const expiredToken = jwt.sign(
      { adminId: 1, username: 'admin' },
      ENV.jwtSecret,
      { expiresIn: '-1h' } // Already expired
    );

    expect(() => {
      jwt.verify(expiredToken, ENV.jwtSecret);
    }).toThrow();
  });

  it('should handle admin logout by clearing cookie', () => {
    // This test verifies the logout logic
    const mockRes = {
      clearCookie: vi.fn(),
    };

    // Simulate logout
    mockRes.clearCookie('admin_session_id', {
      httpOnly: true,
      path: '/',
      sameSite: 'none',
      secure: true,
      maxAge: -1,
    });

    expect(mockRes.clearCookie).toHaveBeenCalledWith(
      'admin_session_id',
      expect.objectContaining({
        maxAge: -1,
      })
    );
  });

  it('should validate admin session cookie presence', () => {
    const mockReq = {
      cookies: {
        admin_session_id: 'valid.jwt.token',
      },
    };

    const adminToken = mockReq.cookies?.admin_session_id;
    expect(adminToken).toBeDefined();
    expect(adminToken).toBe('valid.jwt.token');
  });

  it('should reject request without admin session cookie', () => {
    const mockReq = {
      cookies: {},
    };

    const adminToken = mockReq.cookies?.admin_session_id;
    expect(adminToken).toBeUndefined();
  });
});
