<#
apply-herd-nginx-gad-block.ps1

Backs up Herd's nginx.conf and inserts a server block for gad_system.test that proxies to
http://127.0.0.1:8000 and serves static assets from the project's public folder.

Run as Administrator from the project folder:
PowerShell -ExecutionPolicy Bypass -File .\apply-herd-nginx-gad-block.ps1

This script does NOT restart Herd/nginx. After running it, restart Herd using its UI or
stop/start the nginx processes.
#>

$ErrorActionPreference = 'Stop'

# Paths - adjust if Herd is installed elsewhere
$nginxConf = 'C:\Program Files\Herd\resources\app.asar.unpacked\resources\bin\nginx\conf\nginx.conf'
$projectPublic = 'C:/Users/User/OneDrive/Documents/Projects/GAD_system/public'

if (-not (Test-Path $nginxConf)) {
    Write-Error "nginx.conf not found at expected location: $nginxConf`nIf Herd is installed elsewhere, edit this script to point to the correct path."
    exit 1
}

# Backup
$timestamp = (Get-Date).ToString('yyyyMMdd-HHmmss')
$backup = "$nginxConf.$timestamp.bak"
Copy-Item -LiteralPath $nginxConf -Destination $backup -Force
Write-Host "Backed up original nginx.conf to: $backup"

# Read content
$content = Get-Content -LiteralPath $nginxConf -Raw -ErrorAction Stop

if ($content -match 'server_name\s+gad_system\.test') {
    Write-Host "A server block for gad_system.test already exists in nginx.conf. No changes made."
    exit 0
}

# Server block to add (uses forward slashes for Windows paths inside nginx)
$serverBlock = @"

    server {
        listen       80;
        server_name  gad_system.test;

        access_log  logs/gad_system.access.log;
        error_log   logs/gad_system.error.log;

        # Serve static files directly from the project's public folder
        location ~* \.(?:css|js|jpg|jpeg|png|gif|ico|svg|woff2?|ttf|map)$ {
            root   $projectPublic;
            try_files \$uri =404;
            expires 7d;
            access_log off;
        }

        # Proxy everything else to the PHP built-in server (127.0.0.1:8000)
        location / {
            proxy_pass http://127.0.0.1:8000;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
    }

"@

# Insert server block before the final closing brace of the http { ... } block.
# We'll attempt to find the last occurrence of "\n}\s*$" and insert before it.
if ($content -match '\n\s*}\s*$') {
    # simple insert before last closing brace
    $newContent = [System.Text.RegularExpressions.Regex]::Replace($content, "\n\s*}\s*$", "`n$serverBlock`n}", [System.Text.RegularExpressions.RegexOptions]::RightToLeft)
    Set-Content -LiteralPath $nginxConf -Value $newContent -Encoding UTF8
    Write-Host "Inserted gad_system.test server block into nginx.conf"
    Write-Host "Please restart Herd (or the nginx processes) for the change to take effect."
    Write-Host "If you used the PHP built-in server during testing, ensure it's running on http://127.0.0.1:8000"
    exit 0
} else {
    Write-Error "Could not locate insertion point in nginx.conf. Manual edit required."
    exit 1
}
