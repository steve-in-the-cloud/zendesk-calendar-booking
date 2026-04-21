#!/bin/bash

# Package Zendesk App
# This script creates a zip file for uploading to Zendesk

echo "Packaging Zendesk Calendar Booking App..."

# Remove old package if exists
rm -f zendesk-calendar-app.zip

# Create zip file excluding unnecessary files
zip -r zendesk-calendar-app.zip . \
  -x "*.git*" \
  -x "*node_modules*" \
  -x "*.DS_Store" \
  -x "README.md" \
  -x "package-app.sh"

echo "✓ Package created: zendesk-calendar-app.zip"
echo ""
echo "Next steps:"
echo "1. Go to Zendesk Admin Center"
echo "2. Navigate to Apps and integrations > Zendesk Support apps > Manage"
echo "3. Click 'Upload private app'"
echo "4. Select zendesk-calendar-app.zip"
echo "5. Configure the API Server URL in app settings"
