#!/bin/bash

# Script to commit and push changes to Netlify

echo "🔍 Checking git status..."
git status

echo ""
echo "📦 Staging all changes..."
git add .

echo ""
echo "💾 Committing changes..."
git commit -m "Update local build to match Netlify deployment"

echo ""
echo "🚀 Pushing to remote..."
git push

echo ""
echo "✅ Done! Netlify should automatically deploy the changes."
