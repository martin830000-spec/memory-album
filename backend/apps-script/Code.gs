const DEFAULT_ROOT_FOLDER_ID = '1W0J9IWs_MKtZiLLBxB9NeXTpWzOVvooV';

function doGet(e) {
  const props = PropertiesService.getScriptProperties();
  const expected = String(props.getProperty('BROKER_KEY') || '');
  const supplied = String((e && e.parameter && e.parameter.key) || '');
  if (!expected || supplied !== expected) return json_({ ok: false, error: 'forbidden' });

  const rootId = String(props.getProperty('ALBUM_ROOT_FOLDER_ID') || DEFAULT_ROOT_FOLDER_ID);
  DriveApp.getFolderById(rootId).getName();

  return json_({
    ok: true,
    accessToken: ScriptApp.getOAuthToken(),
    rootFolderId: rootId,
    expiresIn: 3000
  });
}

function json_(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
