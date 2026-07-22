import { test, expect } from '@playwright/test';

// คลิก custom dropdown จริง โดยอ้างจาก value ของ <select> ที่ซ่อนอยู่ (ไม่ผูกกับภาษา UI)
async function selectCustomDropdown(page, selectId, value) {
  const selectWrap = page.locator(`#nav-search-form .select-wrap:has(#${selectId})`);
  const trigger = selectWrap.locator('.custom-select button.selected-box');

  await trigger.click();
  await expect(selectWrap.locator('.options-menu .option-item').first()).toBeVisible();

  const optionIndex = await page.locator(`#${selectId} option[value="${value}"]`).evaluate(
    (option) => Array.from(option.parentElement.options).indexOf(option)
  );

  await selectWrap.locator('.options-menu .option-item').nth(optionIndex).click();
  await expect(page.locator(`#${selectId}`)).toHaveValue(value);
}

test.describe('Search Module (TC-SEA-01)', () => {

  test.beforeEach(async ({ page }) => {

    await page.goto('http://localhost/rmutimt_gallery/index.php'); 

    // แถบค้นหาซ่อนอยู่ใน Dropdown ต้องกดไอคอนแว่นขยายบน Navbar เปิดก่อนทุกครั้ง
    await page.locator('#btn-nav-search').click();
    await expect(page.locator('#nav-search-dropdown')).toHaveAttribute('aria-hidden', 'false');
  });

  test('TC-SEA-01: ค้นหาผลงานด้วยการระบุคำค้นหา (Keyword Search)', async ({ page }) => {
    // 1. พิมพ์คำค้นหาลงช่อง search (id="q")
    await page.locator('#q').fill('เสียงในเงา'); // ⚠️ เปลี่ยนเป็นคำที่มีผลงานจริงใน DB

    // 2. กดปุ่มค้นหา (อ้างจาก class ปุ่ม submit ในฟอร์ม ไม่ใช้ข้อความบนปุ่ม)
    await page.locator('#nav-search-form button.btn-search').click();

    // 3. ฟอร์มเป็น GET ดังนั้น URL ต้องมีพารามิเตอร์ q= ติดไปด้วย
    await expect(page).toHaveURL(/[?&]q=/);

    // 4. ตรวจสอบการ์ดภายใน grid ผลงาน โดยไม่อ้างอิงข้อความหรือภาษา
    const projectCards = page.locator(
      '#actual-project-grid a.work-card[href*="project_detail.php?id="]'
    );
    await expect(projectCards.first()).toBeVisible();
  });

  test('TC-SEA-02: ค้นหาผลงานด้วยการเลือกฟิลเตอร์รวม (ปีการศึกษา + หมวดหมู่ + อาจารย์ที่ปรึกษา)', async ({ page }) => {
    // 1. เลือกปีการศึกษา 2025 ผ่าน custom dropdown
    await selectCustomDropdown(page, 'year', '2025');

    // 2. เลือกหมวดหมู่ Animation (value="2")
    await selectCustomDropdown(page, 'category', '2');

    // 3. เลือกอาจารย์ที่ปรึกษา ดร สิทธิศักดิ์ รัตนประภาวรรณ (value="11")
    await selectCustomDropdown(page, 'advisor', '11');

    // 4. กดปุ่ม 'ค้นหา'
    await page.locator('#nav-search-form button.btn-search').click();

    // 5. URL ต้องมีพารามิเตอร์ฟิลเตอร์ติดไปด้วย
    await expect(page).toHaveURL(/[?&]year=2025/);
    await expect(page).toHaveURL(/[?&]category=2(?:&|$)/);
    await expect(page).toHaveURL(/[?&]advisor=11(?:&|$)/);

    // 6. ตรวจสอบว่ามีการ์ดผลงานแสดงตรงตามเงื่อนไข
    const projectCards = page.locator(
      '#actual-project-grid a.work-card[href*="project_detail.php?id="]'
    );
    await expect(projectCards.first()).toBeVisible();
  });

});