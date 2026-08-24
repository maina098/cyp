$email = "test@example.com"
$password = "Test123456!"

# Login
$loginBody = @{
    email = $email
    password = $password
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3001/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
$token = $response.access_token

Write-Host "Token received: $($token.Substring(0, 50))..."

# Get user profile
$headers = @{
    Authorization = "Bearer $token"
}

$user = Invoke-RestMethod -Uri "http://localhost:3001/users/me" -Method GET -Headers $headers
Write-Host "User Profile:"
$user | ConvertTo-Json
