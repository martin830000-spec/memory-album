const DEFAULT_ROOT_FOLDER_ID = '1W0J9IWs_MKtZiLLBxB9NeXTpWzOVvooV';

// Keep a write-capable Drive OAuth scope in Apps Script's automatic scope scan.
// This branch never runs; the explicit appsscript.json oauthScopes remains the source of truth.
function _declareDriveWriteScope_() {
  if (false) DriveApp.createFile('memory-album-write-scope-probe.txt', '');
}

function setup() {
  const props = PropertiesService.getScriptProperties();
  let brokerKey = String(props.getProperty('BROKER_KEY') || '');
  if (!brokerKey) {
    brokerKey = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
    props.setProperty('BROKER_KEY', brokerKey);
  }
  props.setProperty('ALBUM_ROOT_FOLDER_ID', DEFAULT_ROOT_FOLDER_ID);

  const folder = DriveApp.getFolderById(DEFAULT_ROOT_FOLDER_ID);
  const result = {
    ok: true,
    rootFolderName: folder.getName(),
    rootFolderId: DEFAULT_ROOT_FOLDER_ID,
    brokerKey: brokerKey
  };
  console.log(JSON.stringify(result));
  return result;
}

function testAccess() {
  const props = PropertiesService.getScriptProperties();
  const rootId = String(props.getProperty('ALBUM_ROOT_FOLDER_ID') || DEFAULT_ROOT_FOLDER_ID);
  const folder = DriveApp.getFolderById(rootId);
  const names = [];
  const it = folder.getFolders();
  while (it.hasNext() && names.length < 20) names.push(it.next().getName());
  const result = { ok: true, rootFolderName: folder.getName(), childFolders: names };
  console.log(JSON.stringify(result));
  return result;
}

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
