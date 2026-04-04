$psql = "C:\Program Files\PostgreSQL\15\bin\psql.exe"
$sql = @"
GRANT ALL ON SCHEMA public TO smart_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO smart_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO smart_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO smart_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO smart_user;
"@

Write-Host "Running permission fix on smart_office_db..."
$sql | & $psql -U postgres -d smart_office_db
Write-Host "Done! Exit code: $LASTEXITCODE"
