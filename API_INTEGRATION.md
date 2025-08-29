# Sophia API Integration

## Overview
This document describes the integration with the Sophia API endpoint and the new features implemented.

## API Endpoint
- **URL**: `https://sophia-api-l0ai.onrender.com/chat`
- **Method**: POST
- **Content-Type**: application/json

## Request Parameters
```json
{
  "message": "User's prompt message",
  "session_id": "unique_session_identifier"
}
```

## Features Implemented

### 1. Session Management
- Each chat gets a unique session ID when created
- Session IDs are generated using timestamp + random string
- Session IDs are sent with every request to maintain conversation context

### 2. Local Storage
- All chats are automatically saved to localStorage
- Chats persist across browser sessions
- Storage key: `sophia_chats`

### 3. Real-time Streaming
- Uses Server-Sent Events (SSE) for real-time response streaming
- Shows typing cursor animation during response generation
- Supports both streaming and direct response formats

### 4. Chat Management
- Create new chats with unique session IDs
- Delete chats (with automatic fallback to new chat if all deleted)
- Switch between different chat sessions
- All changes are automatically saved to localStorage

### 5. Error Handling
- Graceful handling of API errors
- Fallback mechanisms for different response formats
- User-friendly error messages

## Response Handling
The API can return responses in multiple formats:

1. **Direct Response**: `{ "response": "text" }` or `{ "message": "text" }`
2. **Streaming**: Returns SSE URL for real-time streaming
3. **Mixed**: Both direct response and streaming options

## Usage
1. Type a message in the input field
2. Press Enter or click Send
3. The message is sent to the API with the current session ID
4. Response streams in real-time with typing effect
5. Chat history is automatically saved

## Technical Details
- Session IDs format: `session_${timestamp}_${randomString}`
- Local storage is updated on every chat change
- SSE connection is automatically closed when response completes
- Typing cursor animation shows during active streaming 