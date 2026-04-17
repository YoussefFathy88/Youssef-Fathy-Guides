import os from "node:os";

const interfaces = os.networkInterfaces();
const privateIpRegex =
  /^(10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)$/;

const addresses = [];

for (const ifaceList of Object.values(interfaces)) {
  if (!ifaceList) continue;

  for (const iface of ifaceList) {
    if (iface.family !== "IPv4" || iface.internal) continue;
    if (!privateIpRegex.test(iface.address)) continue;
    addresses.push(iface.address);
  }
}

if (addresses.length === 0) {
  console.log("No private IPv4 LAN address found.");
  process.exit(0);
}

const uniqueAddresses = [...new Set(addresses)];
console.log("LAN URL(s):");
for (const ip of uniqueAddresses) {
  console.log(`http://${ip}:3000`);
}
