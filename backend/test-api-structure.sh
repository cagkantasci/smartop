#!/bin/bash

# Login
RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smartop.com.tr","password":"Admin123!"}')

TOKEN=$(echo $RESPONSE | jq -r '.accessToken')
echo "Token obtained"

# Get Jobs and check structure
echo ""
echo "=== JOBS API RESPONSE KEYS ==="
curl -s -X GET "http://localhost:3001/api/v1/jobs" \
  -H "Authorization: Bearer $TOKEN" | jq 'keys'

echo ""
echo "=== FULL RESPONSE STRUCTURE ==="
curl -s -X GET "http://localhost:3001/api/v1/jobs" \
  -H "Authorization: Bearer $TOKEN" | jq '{total, page, limit, hasData: (.data | length), firstJobKeys: .data[0] | keys}'

echo ""
echo "=== FIRST JOB WITH jobAssignments ==="
curl -s -X GET "http://localhost:3001/api/v1/jobs" \
  -H "Authorization: Bearer $TOKEN" | jq '.data[0] | {id, title, jobAssignmentsCount: (.jobAssignments | length), firstAssignment: .jobAssignments[0]}'
