const express = require("express");
const app = express();
const shell = require("shelljs");
const path = require("path");

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, "client/build")));

// API endpoint to get the CPU and RAM usage data
app.get("/usage", (req, res) => {
  const totalMem = shell.exec("awk '/^MemTotal:/{print $2}' /proc/meminfo", {
    silent: true,
  }).stdout;
  const freeMem = shell.exec("awk '/^MemFree:/{print $2}' /proc/meminfo", {
    silent: true,
  }).stdout;
  const usedMem = totalMem - freeMem;
  const ramUsage = (usedMem / totalMem) * 100;

  const cpuUsage = shell
    .exec("top -bn1 | awk '/%Cpu/{print $2}' | cut -d'.' -f1", { silent: true })
    .stdout.trim();

  res.json({
    ram: ramUsage,
    cpu: cpuUsage,
  });
});

// API endpoint to get system information
app.get("/system", (req, res) => {
	//const cpuInfo = shell.exec("cat /proc/cpuinfo", { silent: true }).stdout;
  const cpuInfo = shell.exec(" grep 'model name' /proc/cpuinfo | awk -F ': ' '{print $2}' |head -n 1", { silent: true }).stdout;
  const maxClockFreq = shell
    .exec("lscpu | grep 'CPU max MHz' | awk '{print $4}'", { silent: true })
    .stdout.trim();
  const maxAvailableRam = shell
    .exec("awk '/^MemTotal/ {print $2 / 1024}' /proc/meminfo", { silent: true })
    .stdout.trim();

  res.json({
    cpuInfo: cpuInfo,
    maxClockFreq: maxClockFreq,
    maxAvailableRam: maxAvailableRam,
  });
});

// Handles any requests that don't match the above
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`Live RAM and CPU usage app listening on port ${port}`);

