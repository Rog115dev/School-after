import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath:
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless: true,
  args: ["--no-sandbox"],
});

const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(`PAGE: ${e.message}`));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(`ERROR: ${msg.text()}`);
});

await page.goto("http://localhost:8081", {
  waitUntil: "networkidle0",
  timeout: 120000,
});
await new Promise((r) => setTimeout(r, 2000));

await page.evaluate(() => {
  const inputs = Array.from(document.querySelectorAll("input"));
  const set = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  ).set;
  if (inputs[0]) {
    set.call(inputs[0], "parent@test.com");
    inputs[0].dispatchEvent(new Event("input", { bubbles: true }));
    inputs[0].dispatchEvent(new Event("change", { bubbles: true }));
  }
  if (inputs[1]) {
    set.call(inputs[1], "DEMO2026");
    inputs[1].dispatchEvent(new Event("input", { bubbles: true }));
    inputs[1].dispatchEvent(new Event("change", { bubbles: true }));
  }
  const nodes = Array.from(document.querySelectorAll("*"));
  const btn = nodes.find((n) => (n.textContent || "").trim() === "Unlock content");
  btn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
});

await new Promise((r) => setTimeout(r, 6000));
const text = await page.evaluate(() => document.body.innerText.slice(0, 1500));
console.log("BODY:", JSON.stringify(text));
console.log("ERROR_COUNT:", errors.length);
errors.slice(0, 10).forEach((e) => console.log(e.slice(0, 600)));
await browser.close();
process.exit(errors.length ? 1 : 0);
