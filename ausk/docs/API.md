# API

The gateway exposes a minimal HTTP API used by the web frontend.
All responses are JSON encoded.

## `POST /chat`

Send a chat prompt to the language model.

Request body:

```json
{ "prompt": "Hello" }
```

Response body:

```json
{ "response": "Hi there" }
```

## `GET /docs`

Returns the list of uploaded document identifiers.
The response is an array of strings.

## `POST /upload`

Upload a document. The request body is the raw file bytes and a successful
upload returns HTTP `201 Created`.

### Error Responses

Any unhandled error will result in a `500` status with a plain text message.
Requests violating policy rules return `403` and an error object:

```json
{ "error": "blocked" }
```
