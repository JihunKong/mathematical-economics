#!/bin/sh

# wait-for-init.sh
# Script to wait for system initialization before starting the server

echo "Waiting for system initialization..."

MAX_RETRIES=30
RETRY_INTERVAL=2
retry_count=0

while [ $retry_count -lt $MAX_RETRIES ]; do
  # Check if the health endpoint returns ready
  if curl -f http://localhost:5001/api/health/ready 2>/dev/null; then
    echo "System is ready!"
    exit 0
  fi
  
  retry_count=$((retry_count + 1))
  echo "Waiting for initialization... ($retry_count/$MAX_RETRIES)"
  sleep $RETRY_INTERVAL
done

echo "System initialization timeout!"
exit 1