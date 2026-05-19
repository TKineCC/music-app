import { spawn } from 'node:child_process'
import { networkInterfaces } from 'node:os'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const nextBin = require.resolve('next/dist/bin/next')
const port = process.env.PORT || '3001'
const dryRun = process.argv.includes('--print-only') || process.env.NEXT_DEV_PRINT_ONLY === '1'

function isWifiLike(name) {
  return /wlan|wi-?fi|wireless|无线|wifi/i.test(name)
}

function isLikelyVirtual(name) {
  return /vmware|virtualbox|hyper-v|veth|docker|podman|wsl|vpn|trust|zero|tailscale|wireguard|tap|tun|loopback|adapter vmnet/i.test(name)
}

function getDevHosts() {
  const seen = new Set()
  const hosts = []

  for (const [name, nets] of Object.entries(networkInterfaces())) {
    for (const net of nets ?? []) {
      if (!net || net.family !== 'IPv4' || net.internal) continue
      if (seen.has(net.address)) continue
      seen.add(net.address)
      hosts.push({
        ip: net.address,
        name,
        preferred: isWifiLike(name) || (!isLikelyVirtual(name) && /eth|ether|以太网/i.test(name)),
      })
    }
  }

  hosts.sort((a, b) => Number(b.preferred) - Number(a.preferred) || a.ip.localeCompare(b.ip))
  return hosts
}

function printHosts() {
  const hosts = getDevHosts()
  console.log('Dev server is listening on:')
  console.log(`  http://localhost:${port}`)

  if (hosts.length === 0) {
    console.log('  No LAN IPv4 address detected.')
    return
  }

  console.log('  LAN addresses:')
  for (const host of hosts) {
    const tag = host.preferred ? ' <recommended>' : ''
    console.log(`  - http://${host.ip}:${port} (${host.name})${tag}`)
  }
}

printHosts()

if (dryRun) {
  process.exit(0)
}

const child = spawn(process.execPath, [nextBin, 'dev', '-H', '0.0.0.0', '-p', port], {
  stdio: 'inherit',
  env: process.env,
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 0)
})
