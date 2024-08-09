---
"@ensembleui/react-framework": patch
"@ensembleui/react-kitchen-sink": patch
"@ensembleui/react-runtime": patch
"@ensembleui/react-preview": patch
"@ensembleui/react-starter": patch
---

Added mockResponse support to APIs. This allows you to return a mockResponse from the api with a statusCode, reasonPhrase, body, and headers. It can be accessed and mutated using "app.useMockResponse" in a block of JS code.
