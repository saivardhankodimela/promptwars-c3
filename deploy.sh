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

PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
BACKEND_URL="https://ecomind-backend-${PROJECT_NUMBER}.asia-south1.run.app/api/v1"
echo "Constructed Backend API URL: $BACKEND_URL"

SUBSTITUTIONS=""
if [ -f "frontend/.env.local" ]; then
    echo "Loading environment variables from frontend/.env.local..."
    
    # Extract keys and strip any carriage returns (\r) for Windows compatibility
    API_KEY=$(grep NEXT_PUBLIC_FIREBASE_API_KEY frontend/.env.local | cut -d '=' -f2- | tr -d '\r')
    AUTH_DOMAIN=$(grep NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN frontend/.env.local | cut -d '=' -f2- | tr -d '\r')
    PROJECT_ID_ENV=$(grep NEXT_PUBLIC_FIREBASE_PROJECT_ID frontend/.env.local | cut -d '=' -f2- | tr -d '\r')
    STORAGE_BUCKET=$(grep NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET frontend/.env.local | cut -d '=' -f2- | tr -d '\r')
    MESSAGING_SENDER_ID=$(grep NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID frontend/.env.local | cut -d '=' -f2- | tr -d '\r')
    APP_ID=$(grep NEXT_PUBLIC_FIREBASE_APP_ID frontend/.env.local | cut -d '=' -f2- | tr -d '\r')
    
    # Fallback to active gcloud project ID if empty
    if [ -z "$PROJECT_ID_ENV" ]; then
        PROJECT_ID_ENV=$PROJECT_ID
    fi

    SUBSTITUTIONS="_FIREBASE_API_KEY=${API_KEY},_FIREBASE_AUTH_DOMAIN=${AUTH_DOMAIN},_FIREBASE_PROJECT_ID=${PROJECT_ID_ENV},_FIREBASE_STORAGE_BUCKET=${STORAGE_BUCKET},_FIREBASE_MESSAGING_SENDER_ID=${MESSAGING_SENDER_ID},_FIREBASE_APP_ID=${APP_ID},_NEXT_PUBLIC_API_URL=${BACKEND_URL}"
else
    SUBSTITUTIONS="_NEXT_PUBLIC_API_URL=${BACKEND_URL}"
fi

if [ -n "$SUBSTITUTIONS" ]; then
    echo "Running build with substitutions..."
    gcloud builds submit --config=cloudbuild.yaml --substitutions="$SUBSTITUTIONS" .
else
    echo "No substitutions compiled. Running build with default placeholders..."
    gcloud builds submit --config=cloudbuild.yaml .
fi

echo "========================================="
echo "EcoMind AI Deployment Submitted Successfully!"
echo "========================================="
