param(
    [Parameter(Mandatory=$true)][string]$JavaHome,
    [Parameter(Mandatory=$true)][string]$BuildTools,
    [Parameter(Mandatory=$true)][string]$UnsignedApk,
    [Parameter(Mandatory=$true)][string]$SignedApk,
    [switch]$InitializeKey
)
$ErrorActionPreference = 'Stop'
# A dedicated new Samsung package key. Never reuse or replace a Play upload key.
$privateDir = Join-Path $env:LOCALAPPDATA 'LILOPIA\GalaxySigning'
$keyPath = Join-Path $privateDir 'lilopia-galaxy-release.p12'
$passwordPath = Join-Path $privateDir 'password.dpapi'
if ($InitializeKey) {
    if ((Test-Path -LiteralPath $keyPath) -or (Test-Path -LiteralPath $passwordPath)) {
        throw 'Signing material already exists; initialization never overwrites it.'
    }
    New-Item -ItemType Directory -Path $privateDir -Force | Out-Null
    $identity = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
    & icacls.exe $privateDir /inheritance:r /grant:r "${identity}:(OI)(CI)F" 'SYSTEM:(OI)(CI)F' | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Could not restrict signing directory access.' }
    $randomBytes = New-Object byte[] 48
    [System.Security.Cryptography.RandomNumberGenerator]::Fill($randomBytes)
    $env:LILOPIA_GALAXY_SIGN_PASSWORD = [Convert]::ToBase64String($randomBytes)
    $secure = ConvertTo-SecureString $env:LILOPIA_GALAXY_SIGN_PASSWORD -AsPlainText -Force
    try {
        & "$JavaHome\bin\keytool.exe" -genkeypair -keystore $keyPath -storetype PKCS12 -alias lilopia-galaxy-release -keyalg RSA -keysize 3072 -validity 10000 -dname 'CN=LILOPIA Galaxy Release, O=Unfiltered Ink' -storepass:env LILOPIA_GALAXY_SIGN_PASSWORD -keypass:env LILOPIA_GALAXY_SIGN_PASSWORD
        if ($LASTEXITCODE -ne 0) { throw 'Key generation failed.' }
        ConvertFrom-SecureString $secure | Set-Content -LiteralPath $passwordPath -NoNewline
    } finally { Remove-Item Env:\LILOPIA_GALAXY_SIGN_PASSWORD -ErrorAction SilentlyContinue }
}
if (!(Test-Path -LiteralPath $keyPath) -or !(Test-Path -LiteralPath $passwordPath)) { throw 'Dedicated Samsung signing material is unavailable.' }
$secure = Get-Content -LiteralPath $passwordPath -Raw | ConvertTo-SecureString
$credential = New-Object System.Management.Automation.PSCredential('local-signing', $secure)
$env:LILOPIA_GALAXY_SIGN_PASSWORD = $credential.GetNetworkCredential().Password
$previousJava = $env:JAVA_HOME
try {
    $env:JAVA_HOME = $JavaHome
    & "$BuildTools\zipalign.exe" -f -p 4 $UnsignedApk "$SignedApk.aligned"
    if ($LASTEXITCODE -ne 0) { throw 'APK alignment failed.' }
    & "$BuildTools\apksigner.bat" sign --ks $keyPath --ks-type PKCS12 --ks-key-alias lilopia-galaxy-release --ks-pass env:LILOPIA_GALAXY_SIGN_PASSWORD --key-pass env:LILOPIA_GALAXY_SIGN_PASSWORD --out $SignedApk "$SignedApk.aligned"
    if ($LASTEXITCODE -ne 0) { throw 'APK signing failed.' }
    & "$BuildTools\apksigner.bat" verify --verbose --print-certs $SignedApk
    if ($LASTEXITCODE -ne 0) { throw 'Signed APK verification failed.' }
    & "$BuildTools\zipalign.exe" -c -p 4 $SignedApk
    if ($LASTEXITCODE -ne 0) { throw 'Signed APK alignment verification failed.' }
    Write-Output "Signing key preserved in $privateDir. Password is protected with this Windows user's DPAPI. Keep this Windows profile and signing material recoverable for future updates."
} finally {
    $env:JAVA_HOME = $previousJava
    Remove-Item Env:\LILOPIA_GALAXY_SIGN_PASSWORD -ErrorAction SilentlyContinue
    if (Test-Path -LiteralPath "$SignedApk.aligned") { Remove-Item -LiteralPath "$SignedApk.aligned" }
}
