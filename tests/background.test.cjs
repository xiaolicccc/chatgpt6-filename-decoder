"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

let listener;
const context = {
  chrome: {
    downloads: {
      onDeterminingFilename: {
        addListener(fn) { listener = fn; }
      }
    }
  }
};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "background.js"), "utf8"), context);

function suggestion(filename) {
  let output = "not-called";
  listener({ filename }, (value) => { output = value; });
  return output;
}

function fixed(filename, expected) {
  const output = suggestion(filename);
  assert.equal(output.filename, expected);
  assert.equal(output.conflictAction, "uniquify");
}

function ignored(filename) {
  assert.equal(suggestion(filename), undefined);
}

test("decodes Chinese UTF-8 filename", () => {
  fixed("%E4%B8%93%E5%88%A9.docx", "专利.docx");
});
test("keeps common extensions and mixed text", () => {
  fixed("report_%E4%B8%93%E5%88%A9_v1.zip", "report_专利_v1.zip");
});
test("keeps safe relative download subdirectories", () => {
  fixed("Research/2026/%E4%B8%93%E5%88%A9.docx", "Research/2026/专利.docx");
  fixed("Research\\2026\\%E4%B8%93%E5%88%A9.docx", "Research/2026/专利.docx");
});
test("does not guess Downloads root for absolute OS paths", () => {
  fixed("C:\\Users\\Example\\Downloads\\%E4%B8%93%E5%88%A9.docx", "专利.docx");
  fixed("/home/example/Downloads/%E4%B8%93%E5%88%A9.docx", "专利.docx");
});
test("drops unsafe relative directory prefixes", () => {
  fixed("../Research/%E4%B8%93%E5%88%A9.docx", "专利.docx");
  fixed("Research/../%E4%B8%93%E5%88%A9.docx", "专利.docx");
});
test("ignores ordinary filenames and ASCII-only escapes", () => {
  ignored("专利.docx");
  ignored("report.docx");
  ignored("report%20v1.docx");
});
test("ignores invalid UTF-8", () => {
  ignored("%E4%B8.docx");
  ignored("bad%Q0%E4.docx");
});
test("rejects decoded path traversal or separators", () => {
  ignored("%E4%B8%93%E5%88%A9%2Fsecret.docx");
  ignored("%E4%B8%93%E5%88%A9%5Csecret.docx");
});
test("rejects disallowed filename characters", () => {
  ignored("%E4%B8%93%E5%88%A9%3F.docx");
  ignored("%E4%B8%93%E5%88%A9%00.docx");
  ignored("%E4%B8%93%E5%88%A9%3A.docx");
});
test("rejects bidi extension-spoofing controls", () => {
  ignored("%E4%B8%93%E5%88%A9%E2%80%AEexe.docx");
});
test("rejects trailing dot and excessive length", () => {
  ignored("%E4%B8%93%E5%88%A9%2E");
  ignored("%E4%B8%93%E5%88%A9" + "x".repeat(201) + ".zip");
});
test("keeps percent-encoded path segments unchanged", () => {
  fixed("%52esearch/%E4%B8%93%E5%88%A9.docx", "%52esearch/专利.docx");
});
