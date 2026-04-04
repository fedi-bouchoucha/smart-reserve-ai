$passwords = @("postgres", "admin", "root", "1234", "123456", "trytoguessit12345", "")
$psql = "C:\Program Files\PostgreSQL\15\bin\psql.exe"

$success = $false
foreach ($pass in $passwords) {
    $env:PGPASSWORD = $pass
    $output = & $psql -U postgres -d postgres -c "SELECT 1;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS_PASSWORD_IS:$pass"
        $success = $true
        break
    }
}

if (-not $success) {
    Write-Host "NO_PASSWORD_MATCHED"
}
