#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "========================================="
echo "Starting Deployment for EcoMind AI"
echo "========================================="

# Get active project ID from gcloud config
PROJECT_ID=$(gcloud config get-value project)

if [ -z "$PROJECT_ID" ]; then
    echo "Error: No active Google Cloud Project found. Please run 'gcloud init' first."
    exit 1
fi

echo "Active GCP Project ID: $PROJECT_ID"

# Deploy Firestore rules & indexes if Firebase CLI is available
if command -v firebase &> /dev/null; then
    echo "Firebase CLI found. Deploying Firestore rules and indexes..."
    firebase deploy --only firestore
else
    echo "Firebase CLI not found. Please deploy firestore.rules and firestore.indexes.json manually or install firebase-tools."
fi

# Submit Build to Google Cloud Build
echo "Submitting build to Google Cloud Build..."
gcloud builds submit --config=cloudbuild.yaml .

echo "========================================="
echo "EcoMind AI Deployment Submitted Successfully!"
echo "========================================="
