#!/bin/bash

# Login and get token
echo "Logging in..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smartop.com.tr","password":"Admin123!"}')

TOKEN=$(echo $RESPONSE | jq -r '.accessToken')
echo "Token: ${TOKEN:0:50}..."

# Get machines
echo ""
echo "Getting machines..."
MACHINES=$(curl -s -X GET http://localhost:3001/api/v1/machines \
  -H "Authorization: Bearer $TOKEN")
echo "Machines response (keys):"
echo $MACHINES | jq 'keys'
echo "First machine:"
echo $MACHINES | jq '.[0] | {id, name}'

# Get first machine ID (try different response formats)
MACHINE_ID=$(echo $MACHINES | jq -r 'if .machines then .machines[0].id elif .data then .data[0].id elif type == "array" then .[0].id else null end')
echo ""
echo "First machine ID: $MACHINE_ID"

# Create job with machine
echo ""
echo "Creating job with machine assignment..."
JOB_RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/jobs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Test Job with Machine\",\"description\":\"Testing machine assignment\",\"priority\":\"medium\",\"machineIds\":[\"$MACHINE_ID\"]}")

echo "Job creation response:"
echo $JOB_RESPONSE | jq '.'

# Check job assignments
JOB_ID=$(echo $JOB_RESPONSE | jq -r '.id')
echo ""
echo "Job ID: $JOB_ID"
echo "Job assignments:"
echo $JOB_RESPONSE | jq '.jobAssignments'
