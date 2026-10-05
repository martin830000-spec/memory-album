# Memory Album backend

Architecture:

GitHub Pages album UI -> Cloud Run album API -> Google Drive
                         -> Cloudflare Worker proxy for Laos

The Cloud Run service gets a short-lived Google OAuth access token from the owner's Apps Script token broker. The wife never signs in to Google.

## One-time values

- Apps Script Script Property `BROKER_KEY`: random secret.
- Apps Script Script Property `ALBUM_ROOT_FOLDER_ID`: `1W0J9IWs_MKtZiLLBxB9NeXTpWzOVvooV`.
- Cloud Run `ALBUM_TOKEN_BROKER_URL`: deployed Apps Script web-app URL.
- Cloud Run `ALBUM_BROKER_KEY`: same broker secret.
- Cloud Run `ALBUM_ACCESS_KEY`: same private password already stored by the couple app under `translator_primary_password`.
- Cloud Run `GEMINI_API_KEY`: existing Gemini API key, reused only for automatic Korean folder-name -> Lao display-name translation.
- Cloud Run `GEMINI_MODEL`: configurable model name.
- Frontend `config.js`: set the direct Cloud Run URL and Cloudflare Worker URL after deployment.

The root folder itself is never shown. Only descendants of the configured root are accepted by the API.
