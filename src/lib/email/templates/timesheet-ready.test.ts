import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildTimesheetReadyEmail } from './timesheet-ready';

describe('buildTimesheetReadyEmail', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://app.example.com');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('builds email with correct subject using formatted month', () => {
    const email = buildTimesheetReadyEmail({
      primaryContactName: 'Alice',
      to: 'alice@example.com',
      month: '2026-01',
      portalToken: 'abc123',
    });

    expect(email.subject).toBe('January 2026 timesheet');
  });

  it('addresses TO to primary contact', () => {
    const email = buildTimesheetReadyEmail({
      primaryContactName: 'Alice',
      to: 'alice@example.com',
      month: '2026-01',
      portalToken: 'abc123',
    });

    expect(email.to).toBe('alice@example.com');
  });

  it('includes CC contacts when provided', () => {
    const email = buildTimesheetReadyEmail({
      primaryContactName: 'Alice',
      to: 'alice@example.com',
      cc: ['bob@example.com', 'carol@example.com'],
      month: '2026-01',
      portalToken: 'abc123',
    });

    expect(email.cc).toEqual(['bob@example.com', 'carol@example.com']);
  });

  it('omits CC when no cc contacts', () => {
    const email = buildTimesheetReadyEmail({
      primaryContactName: 'Alice',
      to: 'alice@example.com',
      cc: [],
      month: '2026-01',
      portalToken: 'abc123',
    });

    expect(email.cc).toBeUndefined();
  });

  it('includes portal link in text body', () => {
    const email = buildTimesheetReadyEmail({
      primaryContactName: 'Alice',
      to: 'alice@example.com',
      month: '2026-01',
      portalToken: 'abc123',
    });

    expect(email.text).toContain('https://app.example.com/portal/abc123');
  });

  it('includes portal link as button in html body', () => {
    const email = buildTimesheetReadyEmail({
      primaryContactName: 'Alice',
      to: 'alice@example.com',
      month: '2026-01',
      portalToken: 'abc123',
    });

    expect(email.html).toContain('href="https://app.example.com/portal/abc123"');
    expect(email.html).toContain('Review Timesheet');
  });

  it('greets primary contact by name', () => {
    const email = buildTimesheetReadyEmail({
      primaryContactName: 'Alice',
      to: 'alice@example.com',
      month: '2026-01',
      portalToken: 'abc123',
    });

    expect(email.text).toMatch(/^Hi Alice,/);
    expect(email.html).toContain('Hi Alice,');
  });

  it('strips trailing slash from app URL to avoid double-slash portal links', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://app.example.com/');

    const email = buildTimesheetReadyEmail({
      primaryContactName: 'Alice',
      to: 'alice@example.com',
      month: '2026-01',
      portalToken: 'abc123',
    });

    expect(email.text).toContain('https://app.example.com/portal/abc123');
    expect(email.text).not.toContain('//portal');
  });

  it('throws when NEXT_PUBLIC_APP_URL not set', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', '');

    expect(() =>
      buildTimesheetReadyEmail({
        primaryContactName: 'Alice',
        to: 'alice@example.com',
        month: '2026-01',
        portalToken: 'abc123',
      })
    ).toThrow('NEXT_PUBLIC_APP_URL');
  });
});
