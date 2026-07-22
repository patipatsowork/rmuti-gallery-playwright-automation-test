import { test, expect } from '@playwright/test';

test.describe('Authentication Module (TC-AUTH)', () => {

  test('TC-AUTH-01: ทดสอบการเปิดป็อปอัป Sign Up และสมัครสมาชิกสำเร็จ', async ({ page }) => {
    
    await page.goto('http://localhost/rmutimt_gallery/index.php'); 

    await page.locator('#btn-open-signup').click(); 
    await page.locator('#signup-name').fill('สมชาย มัลติมีเดีย');
    await page.locator('#signup-student-id').fill('112233445566-7');
    await page.locator('#signup-email').fill('somchai.mu@rmuti.ac.th');
    await page.locator('#signup-password').fill('Password123');
    await page.locator('#signup-confirm-password').fill('Password123'); 

    
    await page.locator('#auth-signup-view button.auth-submit').click();
    await expect(page).toHaveURL(/.*success/); 
  });

  test('TC-AUTH-02: ทดสอบระบบ Login แบบ Popup (Admin/Advisor)', async ({ page }) => {
    
    await page.goto('http://localhost/rmutimt_gallery/index.php'); 

    await page.locator('#btn-open-signin').click();
    await page.locator('#signin-email').fill('adminfilm@rmuti.ac.th'); 
    await page.locator('#signin-password').fill('12345678');

    // อ้างอิงปุ่ม submit จาก view ของ Sign In โดยตรง ไม่ต้องพึ่งข้อความบนปุ่ม
    await page.locator('#auth-signin-view button.auth-submit').click();
    await expect(page).toHaveURL(/.*manage_projects/); 
  });

  test('TC-AUTH-03: ทดสอบการสมัครสมาชิกไม่สำเร็จ กรณีรหัสผ่านไม่ตรงกัน', async ({ page }) => {
  
    await page.goto('http://localhost/rmutimt_gallery/index.php'); 

    await page.locator('#btn-open-signup').click(); 
    await page.locator('#signup-name').fill('สมชาย มัลติมีเดีย');
    await page.locator('#signup-student-id').fill('112233445566-7');
    await page.locator('#signup-email').fill('somchai.mu@rmuti.ac.th');
    await page.locator('#signup-password').fill('Password123');
    await page.locator('#signup-confirm-password').fill('WrongPassword999'); // จงใจให้ผิด

    await page.locator('#auth-signup-view button.auth-submit').click();
    
    // กล่อง error ของ Sign Up มี id ตรงตัวใน HTML อยู่แล้ว
    const errorMessage = page.locator('#signup-popup-error'); 
    await expect(errorMessage).toBeVisible(); 
  });

  test('TC-AUTH-04: ทดสอบการเข้าสู่ระบบสำเร็จ สำหรับ Role นักศึกษา', async ({ page }) => {
   
    await page.goto('http://localhost/rmutimt_gallery/index.php'); 

    await page.locator('#btn-open-signin').click();
    await page.locator('#signin-email').fill('film@rmuti.ac.th'); // ⚠️ ใช้อีเมลนักศึกษาจริงใน DB
    await page.locator('#signin-password').fill('12345678');

    await page.locator('#auth-signin-view button.auth-submit').click();
    await expect(page).toHaveURL(/.*my_projects/); 
  });

});