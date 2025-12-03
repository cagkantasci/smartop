#!/bin/bash

# Login
RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smartop.com.tr","password":"Admin123!"}')

TOKEN=$(echo $RESPONSE | jq -r '.accessToken')
echo "Token obtained: ${TOKEN:0:20}..."

# Get Jobs List
echo ""
echo "=== JOBS LIST RESPONSE ==="
curl -s -X GET "http://localhost:3001/api/v1/jobs" \
  -H "Authorization: Bearer $TOKEN" | jq '.data[0]'

echo ""
echo "=== CHECKING SPECIFIC JOB ASSIGNMENTS ==="
curl -s -X GET "http://localhost:3001/api/v1/jobs" \
  -H "Authorization: Bearer $TOKEN" | jq '.data[] | select(.jobAssignments | length > 0) | {id, title, assignmentCount: (.jobAssignments | length), machines: [.jobAssignments[].machine.name]}'
