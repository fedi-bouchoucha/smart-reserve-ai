# Get Token
$tokenJson = curl.exe -s -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d '{\"username\":\"admin\",\"password\":\"admin123\"}'
$token = ($tokenJson | ConvertFrom-Json).token

if (-not $token) {
    Write-Host "Failed to get token"
    Write-Host $tokenJson
    exit
}

Write-Host "Token obtained: $($token.Substring(0, 10))..."

# Call AI Endpoint
$payload = '{
    \"userId\": \"1\",
    \"date\": \"2026-05-10\",
    \"realTimeAvailability\": [
        { \"id\": \"1\", \"zone\": \"Quiet\", \"floor\": \"3\", \"capacity\": 1 },
        { \"id\": \"2\", \"zone\": \"Collaborative\", \"floor\": \"3\", \"capacity\": 1 }
    ]
}'

Write-Host "Calling AI endpoint..."
$response = curl.exe -i -s -X POST http://localhost:8080/api/recommendations/generate `
    -H "Content-Type: application/json" `
    -H "Authorization: Bearer $token" `
    -d $payload

Write-Host "Response received:"
Write-Host $response
