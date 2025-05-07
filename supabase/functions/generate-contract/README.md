# Generate Contract Edge Function

This Edge Function securely calls the DeepSeek API to generate contract content based on provided contract data.

## Setup

1. Set the DeepSeek API key as a secret in your Supabase project:

```bash
supabase secrets set DEEPSEEK_API_KEY=your_deepseek_api_key
```

2. Deploy the function:

```bash
supabase functions deploy generate-contract
```

## Usage

The function expects a POST request with the following JSON body:

```json
{
  "contractData": {
    "title": "Contract Title",
    "type": "lease",
    "tenant": "tenant_id",
    "property": "property_id",
    "startDate": "2023-01-01",
    "endDate": "2023-12-31",
    "additionalTerms": "Any additional terms..."
  }
}
```

The function will return a JSON response with the generated contract content:

```json
{
  "content": "<html>Generated contract content...</html>"
}
```

## Error Handling

If an error occurs, the function will return a JSON response with an error message:

```json
{
  "error": "Error message"
}
```

## Authentication

The function requires a valid Supabase authentication token to be included in the request headers.
