param(
    [Parameter(Mandatory=$true)][string]$Bundle,
    [Parameter(Mandatory=$true)][string]$Keystore,
    [string]$Alias = 'lilopia-upload',
    [Parameter(Mandatory=$true)][string]$Output
)
$ErrorActionPreference = 'Stop'
$taskSigner = if ($env:JAVA_HOME) { Join-Path $env:JAVA_HOME 'bin/jarsigner.exe' } else { 'jarsigner.exe' }
$taskStorePassword = Read-Host 'Upload keystore password (never printed)' -AsSecureString
$taskKeyPassword = Read-Host 'Upload key password (never printed)' -AsSecureString
try {
    $env:LILOPIA_STORE_PASSWORD = [System.Net.NetworkCredential]::new('', $taskStorePassword).Password
    $env:LILOPIA_KEY_PASSWORD = [System.Net.NetworkCredential]::new('', $taskKeyPassword).Password
    & $taskSigner -keystore (Resolve-Path -LiteralPath $Keystore).Path -storepass:env LILOPIA_STORE_PASSWORD -keypass:env LILOPIA_KEY_PASSWORD -signedjar $Output (Resolve-Path -LiteralPath $Bundle).Path $Alias
    if ($LASTEXITCODE -ne 0) { throw 'Bundle signing failed' }
    & $taskSigner -verify $Output
    if ($LASTEXITCODE -ne 0) { throw 'Signature verification failed' }
    Write-Output "Signed bundle: $Output"
} finally {
    Remove-Item Env:LILOPIA_STORE_PASSWORD -ErrorAction SilentlyContinue
    Remove-Item Env:LILOPIA_KEY_PASSWORD -ErrorAction SilentlyContinue
    $taskStorePassword.Dispose(); $taskKeyPassword.Dispose()
}
