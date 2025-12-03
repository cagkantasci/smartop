#!/bin/bash
# Login as admin
RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smartop.com.tr","password":"Admin123!"}')

TOKEN=$(echo "$RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

echo "=== Makineler ==="
curl -s -X GET "http://localhost:3001/api/v1/machines" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool 2>/dev/null || curl -s -X GET "http://localhost:3001/api/v1/machines" -H "Authorization: Bearer $TOKEN"

echo ""
echo "=== Kullanıcılar ==="
curl -s -X GET "http://localhost:3001/api/v1/users" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool 2>/dev/null || curl -s -X GET "http://localhost:3001/api/v1/users" -H "Authorization: Bearer $TOKEN"

echo ""
echo "=== Template'ler ==="
curl -s -X GET "http://localhost:3001/api/v1/checklists/templates" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool 2>/dev/null || curl -s -X GET "http://localhost:3001/api/v1/checklists/templates" -H "Authorization: Bearer $TOKEN"
