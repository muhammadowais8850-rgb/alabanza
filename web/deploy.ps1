# Deploys to Vercel and copies every NEXT_PUBLIC_* value from .env.local into the project's Production env vars.
# Run from web/:  powershell -ExecutionPolicy Bypass -File .\deploy.ps1
npx -y vercel link --yes --project alabanza
$existing = npx -y vercel env ls production 2>&1 | Out-String
foreach ($line in Get-Content .env.local) {
  if ($line -match '^\s*(NEXT_PUBLIC_[A-Z0-9_]+)=(.+)$') {
    $key = $Matches[1]; $val = $Matches[2].Trim()
    if ($existing -match "\b$key\b") { Write-Host "env exists: $key (change it in the Vercel dashboard)"; continue }
    # All are public by design (Storefront + Judge.me *public* tokens, pixel ID), so expose them explicitly.
    $val | npx -y vercel env add $key production --type config | Out-Null
    Write-Host "env set: $key"
  }
}
npx -y vercel deploy --prod --yes
