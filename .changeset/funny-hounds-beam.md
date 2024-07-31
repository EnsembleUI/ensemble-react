---
"@ensembleui/react-framework": patch
"@ensembleui/react-kitchen-sink": patch
"@ensembleui/react-runtime": patch
"@ensembleui/react-preview": patch
"@ensembleui/react-starter": patch
---

Added mockResponse support to APIs. This allows you to return a mockResponse from the api with a statusCode, reasonPhrase, body, and headers. It can be toggled using the ensemble.setUseMockResponse() function.
