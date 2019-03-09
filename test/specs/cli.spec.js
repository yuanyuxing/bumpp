"use strict";

const { files } = require("../utils");
const { chaiExec, expect } = require("../utils/chai");
const manifest = require("../../package.json");

describe("bump", () => {

  it("should run without any arguments", function () {
    // Create a dummy package.json, otherwise an error will occur
    files.create("package.json", { version: "1.0.0" });

    // Run the CLI without any arguments.
    // It will prompt the user and wait forever, so add a timeout.
    this.timeout(Math.max(10000, this.timeout()));
    let bump = chaiExec("", { timeout: 6000 });

    // It should have prompted for input
    expect(bump.stdout).to.contain("The current version in package.json is 1.0.0\nHow would you like to bump it? (Use arrow keys)");
  });

  it("should error if an invalid argument is used", () => {
    let bump = chaiExec("--commit --help --fizzbuzz --quiet");

    expect(bump).to.have.exitCode(9);
    expect(bump).to.have.stdout("");
    expect(bump.stderr).to.match(/^Unknown option: --fizzbuzz\n\nUsage: bump \[release\] \[options\] \[files...\]\n/);
    expect(bump.stderr).to.contain(manifest.description);
  });

  it("should error if an invalid shorthand argument is used", () => {
    let bump = chaiExec("-cqhzt");

    expect(bump).to.have.exitCode(9);
    expect(bump).to.have.stdout("");
    expect(bump.stderr).to.match(/^Unknown option: -z\n\nUsage: bump \[release\] \[options\] \[files...\]\n/);
    expect(bump.stderr).to.contain(manifest.description);
  });

  it("should error if an argument is missing its value", () => {
    let bump = chaiExec("--commit --help --preid --quiet");

    expect(bump).to.have.exitCode(9);
    expect(bump).to.have.stdout("");
    bump.stderr.should.match(
      /^The --preid option requires a value, such as "alpha", "beta", etc\.\n\nUsage: bump \[release\] \[options\] \[files...\]\n/
    );
    expect(bump.stderr).to.contain(manifest.description);
  });

  describe("bump --help", () => {
    it("should show usage text", () => {
      let bump = chaiExec("--help");

      expect(bump).to.have.exitCode(0);
      expect(bump).to.have.stderr("");
      expect(bump.stdout).to.match(/^\nUsage: bump \[release\] \[options\] \[files...\]\n/);
      expect(bump.stdout).to.contain(manifest.description);
    });

    it("should support -h shorthand", () => {
      let bump = chaiExec("-h");

      expect(bump).to.have.exitCode(0);
      expect(bump).to.have.stderr("");
      expect(bump.stdout).to.match(/^\nUsage: bump \[release\] \[options\] \[files...\]\n/);
      expect(bump.stdout).to.contain(manifest.description);
    });

    it("should ignore other arguments", () => {
      let bump = chaiExec("--quiet --help --tag");

      expect(bump).to.have.exitCode(0);
      expect(bump).to.have.stderr("");
      expect(bump.stdout).to.match(/^\nUsage: bump \[release\] \[options\] \[files...\]\n/);
      expect(bump.stdout).to.contain(manifest.description);
    });

    it("should ignore other shorthand arguments", () => {
      let bump = chaiExec("-cht");

      expect(bump).to.have.exitCode(0);
      expect(bump).to.have.stderr("");
      expect(bump.stdout).to.match(/^\nUsage: bump \[release\] \[options\] \[files...\]\n/);
      expect(bump.stdout).to.contain(manifest.description);
    });
  });

  describe("bump --version", () => {
    it("should show the version number", () => {
      let bump = chaiExec("--version");

      expect(bump).to.have.exitCode(0);
      expect(bump).to.have.stderr("");
      expect(bump).to.have.stdout(manifest.version + "\n");
    });

    it("should support -v shorthand", () => {
      let bump = chaiExec("-v");

      expect(bump).to.have.exitCode(0);
      expect(bump).to.have.stderr("");
      expect(bump).to.have.stdout(manifest.version + "\n");
    });

    it("should ignore other arguments", () => {
      let bump = chaiExec("--quiet --version --tag");

      expect(bump).to.have.exitCode(0);
      expect(bump).to.have.stderr("");
      expect(bump).to.have.stdout(manifest.version + "\n");
    });

    it("should ignore other shorthand arguments", () => {
      let bump = chaiExec("-cvt");

      expect(bump).to.have.exitCode(0);
      expect(bump).to.have.stderr("");
      expect(bump).to.have.stdout(manifest.version + "\n");
    });
  });
});
