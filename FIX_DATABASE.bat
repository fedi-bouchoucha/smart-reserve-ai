@echo off
echo ==========================================
echo  Fix PostgreSQL permissions for smart_user
echo ==========================================
echo.
echo Enter the password for the 'postgres' superuser when prompted.
echo.

"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d smart_office_db -c "GRANT ALL ON SCHEMA public TO smart_user;"
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d smart_office_db -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO smart_user;"
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d smart_office_db -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO smart_user;"
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d smart_office_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO smart_user;"
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d smart_office_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO smart_user;"

echo.
echo ==========================================
echo  All permissions granted! 
echo  Now start the backend with: mvn spring-boot:run
echo ==========================================
pause
