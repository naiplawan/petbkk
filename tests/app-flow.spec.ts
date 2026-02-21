import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3002';

test.describe('PetBKK POC Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('1. Auth Page - Phone Input', async ({ page }) => {
    // Should be redirected to auth
    await expect(page).toHaveURL(/\/auth/);

    // Check phone input exists
    await expect(page.locator('input#phone')).toBeVisible();
    await expect(page.getByRole('button', { name: /send code/i })).toBeVisible();

    // Enter phone number
    await page.locator('input#phone').fill('0812345678');
    await page.getByRole('button', { name: /send code/i }).click();

    // Should show OTP input
    await expect(page.locator('input#otp')).toBeVisible();
    await page.screenshot({ path: 'test-results/01-phone-input.png' });
  });

  test('2. Auth Page - OTP Verification', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth`);

    // Enter phone and submit
    await page.locator('input#phone').fill('0812345678');
    await page.getByRole('button', { name: /send code/i }).click();

    // Enter OTP
    await page.locator('input#otp').fill('123456');
    await page.getByRole('button', { name: /verify/i }).click();

    // Should redirect to pets page
    await expect(page).toHaveURL(/\/pets/, { timeout: 10000 });
    await page.screenshot({ path: 'test-results/02-otp-verified.png' });
  });

  test('3. Pets Page - Empty State', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/auth`);
    await page.locator('input#phone').fill('0899999999');
    await page.getByRole('button', { name: /send code/i }).click();
    await page.locator('input#otp').fill('999999');
    await page.getByRole('button', { name: /verify/i }).click();

    await expect(page).toHaveURL(/\/pets/, { timeout: 10000 });

    // Check page loads - use first() to avoid strict mode
    await expect(page.getByRole('heading', { name: 'Your Pets' })).toBeVisible();
    await page.screenshot({ path: 'test-results/03-pets-page.png' });
  });

  test('4. Add Pet Flow', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/auth`);
    await page.locator('input#phone').fill('0888888888');
    await page.getByRole('button', { name: /send code/i }).click();
    await page.locator('input#otp').fill('888888');
    await page.getByRole('button', { name: /verify/i }).click();

    await expect(page).toHaveURL(/\/pets/, { timeout: 10000 });

    // Click Add Pet
    await page.getByRole('link', { name: /add pet/i }).click();
    await expect(page).toHaveURL(/\/pets\/new/);

    // Fill pet form
    await page.locator('input#name').fill('Buddy');
    await page.locator('input#breed').fill('Golden Retriever');
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: /dog/i }).click();

    // Submit
    await page.getByRole('button', { name: /add pet/i }).click();

    // Should redirect to pets list
    await expect(page).toHaveURL(/\/pets/, { timeout: 10000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/04-pet-added.png' });
  });

  test('5. Providers Page', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/auth`);
    await page.locator('input#phone').fill('0877777777');
    await page.getByRole('button', { name: /send code/i }).click();
    await page.locator('input#otp').fill('777777');
    await page.getByRole('button', { name: /verify/i }).click();

    await expect(page).toHaveURL(/\/pets/, { timeout: 10000 });

    // Go to providers via bottom nav
    await page.getByRole('link', { name: /services/i }).click();
    await expect(page).toHaveURL(/\/providers/);

    // Should show providers
    await expect(page.getByText('PetCare Veterinary Clinic').first()).toBeVisible();
    await expect(page.getByText('Happy Paws Grooming').first()).toBeVisible();
    await expect(page.getByText('Pet Paradise Hotel').first()).toBeVisible();
    await page.screenshot({ path: 'test-results/05-providers-list.png' });
  });

  test('6. Provider Detail', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/auth`);
    await page.locator('input#phone').fill('0866666666');
    await page.getByRole('button', { name: /send code/i }).click();
    await page.locator('input#otp').fill('666666');
    await page.getByRole('button', { name: /verify/i }).click();

    await expect(page).toHaveURL(/\/pets/, { timeout: 10000 });

    // Go to providers
    await page.getByRole('link', { name: /services/i }).click();
    await expect(page).toHaveURL(/\/providers/);

    // Click on a provider
    await page.getByText('PetCare Veterinary Clinic').first().click();

    // Should show provider details
    await expect(page.getByRole('heading', { name: 'General Checkup' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Vaccination' })).toBeVisible();
    await page.screenshot({ path: 'test-results/06-provider-detail.png' });
  });

  test('7. Booking Flow - View Booking Page', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/auth`);
    await page.locator('input#phone').fill('0855555555');
    await page.getByRole('button', { name: /send code/i }).click();
    await page.locator('input#otp').fill('555555');
    await page.getByRole('button', { name: /verify/i }).click();

    await expect(page).toHaveURL(/\/pets/, { timeout: 10000 });

    // Go to providers
    await page.getByRole('link', { name: /services/i }).click();
    await page.getByText('Happy Paws Grooming').first().click();

    // Book a service - just verify the book button works
    const bookButton = page.getByRole('link', { name: /^book$/i }).first();
    await expect(bookButton).toBeVisible();

    await page.screenshot({ path: 'test-results/07-booking-flow.png' });
  });

  test('8. View Bookings', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/auth`);
    await page.locator('input#phone').fill('0855555555');
    await page.getByRole('button', { name: /send code/i }).click();
    await page.locator('input#otp').fill('555555');
    await page.getByRole('button', { name: /verify/i }).click();

    await expect(page).toHaveURL(/\/pets/, { timeout: 10000 });

    // Go to bookings
    await page.getByRole('link', { name: /bookings/i }).click();
    await expect(page).toHaveURL(/\/bookings/);

    // Check bookings page loads - use specific heading with exact match
    await expect(page.getByRole('heading', { name: 'Bookings', exact: true })).toBeVisible();
    await page.screenshot({ path: 'test-results/08-bookings-list.png' });
  });

  test('9. Profile Page', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/auth`);
    await page.locator('input#phone').fill('0844444444');
    await page.getByRole('button', { name: /send code/i }).click();
    await page.locator('input#otp').fill('444444');
    await page.getByRole('button', { name: /verify/i }).click();

    await expect(page).toHaveURL(/\/pets/, { timeout: 10000 });

    // Go to profile
    await page.getByRole('link', { name: /profile/i }).click();
    await expect(page).toHaveURL(/\/profile/);

    // Check profile content - use specific heading
    await expect(page.getByRole('heading', { name: 'Pet Parent' })).toBeVisible();
    await page.screenshot({ path: 'test-results/09-profile.png' });
  });

  test('10. Full User Journey - Navigation', async ({ page }) => {
    // 1. Login
    await page.goto(`${BASE_URL}/auth`);
    await page.locator('input#phone').fill('0811111111');
    await page.getByRole('button', { name: /send code/i }).click();
    await page.locator('input#otp').fill('111111');
    await page.getByRole('button', { name: /verify/i }).click();
    await expect(page).toHaveURL(/\/pets/, { timeout: 10000 });

    // 2. Navigate to services
    await page.getByRole('link', { name: /services/i }).click();
    await expect(page).toHaveURL(/\/providers/);
    await expect(page.getByText('Happy Paws Grooming').first()).toBeVisible();

    // 3. View provider
    await page.getByText('Happy Paws Grooming').first().click();
    await expect(page.getByRole('heading', { name: 'Full Grooming' })).toBeVisible();

    // 4. Go to profile
    await page.getByRole('link', { name: /profile/i }).click();
    await expect(page).toHaveURL(/\/profile/);

    // 5. Sign out
    await page.getByRole('button', { name: /sign out/i }).click();
    await expect(page).toHaveURL(/\/auth/);

    await page.screenshot({ path: 'test-results/10-full-journey.png' });
  });
});
