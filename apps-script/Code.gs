const SPREADSHEET_ID = '1aLmYZzkaD0zQbKrj2lktFjuaSB_ninzDGzIHeowfotM';
const SHEET_NAME = 'Registrations';
const SUBMISSIONS_SHEET_NAMES = {
  University: 'University Submissions',
  School: 'School Submissions',
};
const SUBMISSION_VIEW_DEFINITIONS = [
  { name: 'UNI Proposal', source: 'University Submissions', stage: 'Proposal' },
  { name: 'UNI UI-UX', source: 'University Submissions', stage: 'UI/UX' },
  { name: 'School Proposal', source: 'School Submissions', stage: 'Proposal' },
];
const SUBMISSIONS_FOLDER_NAME = 'DEVthon 4.0 Submissions';
const EXPECTED_REGISTRATION_SOURCE = 'devthon-4-registration-v1';
const EXPECTED_SUBMISSION_SOURCE = 'devthon-4-submission-v1';
const MAX_SUBMISSION_BYTES = 8 * 1024 * 1024;
// Temporary launch-testing switch. Set to false before the public submission period.
const TESTING_MODE = true;

const SUBMISSION_WINDOWS = {
  'university-proposal': {
    category: 'University',
    type: 'Proposal',
    inputMode: 'file',
    opensAt: '2026-12-24T00:00:00+05:30',
    closesAt: '2026-12-31T23:59:59.999+05:30',
    extensions: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'zip'],
  },
  'school-proposal': {
    category: 'School',
    type: 'Proposal',
    inputMode: 'file',
    opensAt: '2027-01-05T00:00:00+05:30',
    closesAt: '2027-01-17T23:59:59.999+05:30',
    extensions: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'zip'],
  },
  'university-uiux': {
    category: 'University',
    type: 'UI/UX',
    inputMode: 'figma-link',
    opensAt: '2027-01-13T00:00:00+05:30',
    closesAt: '2027-01-20T23:59:59.999+05:30',
    extensions: ['pdf', 'png', 'jpg', 'jpeg', 'zip'],
  },
};

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function normalizeParticipant(participant) {
  return {
    name: String(participant && participant.name || '').trim(),
    email: String(participant && participant.email || '').trim(),
    whatsapp: String(participant && participant.whatsapp || '').trim(),
    nic: String(participant && participant.nic || '').trim(),
  };
}

function plainText(value) {
  return "'" + String(value || '').trim();
}

function registrationCategorySuffix(category) {
  if (category === 'University') return 'U';
  if (category === 'School') return 'S';
  throw new Error('Invalid registration category.');
}

function formatRegistrationId(sequence, category) {
  return 'DEV-' + String(sequence).padStart(3, '0') + registrationCategorySuffix(category);
}

function nextRegistrationId(sheet, category) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return formatRegistrationId(1, category);

  const suffix = registrationCategorySuffix(category);
  const rows = sheet.getRange(2, 2, lastRow - 1, 2).getValues();
  let categoryRowCount = 0;
  let largestSequence = 0;

  rows.forEach(function (row) {
    if (String(row[1] || '').trim() !== category) return;
    categoryRowCount += 1;
    const match = String(row[0] || '').trim().match(/^DEV-(\d+)([US])$/i);
    if (match && match[2].toUpperCase() === suffix) {
      largestSequence = Math.max(largestSequence, Number(match[1]));
    }
  });

  return formatRegistrationId(Math.max(categoryRowCount, largestSequence) + 1, category);
}

function migrateLegacyRegistrationIds() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Registration sheet was not found.');

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return { updated: 0 };

  const range = sheet.getRange(2, 2, lastRow - 1, 2);
  const rows = range.getValues();
  const usedSequences = { U: {}, S: {} };
  const nextCandidate = { U: 1, S: 1 };

  rows.forEach(function (row) {
    const category = String(row[1] || '').trim();
    if (!['University', 'School'].includes(category)) return;
    const suffix = registrationCategorySuffix(category);
    const match = String(row[0] || '').trim().match(/^DEV-(\d+)([US])$/i);
    if (match && match[2].toUpperCase() === suffix) {
      usedSequences[suffix][Number(match[1])] = true;
    }
  });

  let updated = 0;
  const migratedIds = rows.map(function (row) {
    const currentId = String(row[0] || '').trim();
    const category = String(row[1] || '').trim();
    if (!['University', 'School'].includes(category)) return [currentId];

    const suffix = registrationCategorySuffix(category);
    if (/^DEV-(\d+)([US])$/i.test(currentId)) return [currentId];

    while (usedSequences[suffix][nextCandidate[suffix]]) nextCandidate[suffix] += 1;
    const sequence = nextCandidate[suffix];
    usedSequences[suffix][sequence] = true;
    nextCandidate[suffix] += 1;
    updated += 1;
    return [formatRegistrationId(sequence, category)];
  });

  sheet.getRange(2, 2, migratedIds.length, 1).setValues(migratedIds);
  return { updated };
}

function validateRegistration(data) {
  const category = String(data.category || '');
  const teamSize = Number(data.teamSize);
  const leader = normalizeParticipant(data.leader);
  const members = Array.isArray(data.members) ? data.members.map(normalizeParticipant) : [];

  if (data.source !== EXPECTED_REGISTRATION_SOURCE) throw new Error('Invalid registration source.');
  if (!['University', 'School'].includes(category)) throw new Error('Invalid category.');
  if (![3, 4, 5].includes(teamSize)) throw new Error('Invalid team size.');
  if (!String(data.teamName || '').trim()) throw new Error('Team name is required.');
  if (!String(data.institution || '').trim()) throw new Error('Institution is required.');
  if (!leader.name || !leader.email || !leader.whatsapp) throw new Error('Leader details are incomplete.');
  if (members.length !== teamSize - 1) throw new Error('Participant count does not match team size.');
  if (members.some((member) => !member.name || !member.email || !member.whatsapp)) throw new Error('Participant details are incomplete.');
  if (category === 'University' && [leader].concat(members).some((member) => !member.nic)) throw new Error('NIC is required for university participants.');

  return {
    category,
    teamSize,
    teamName: String(data.teamName).trim(),
    institution: String(data.institution).trim(),
    leader,
    members,
  };
}

function normalizedText(value) {
  return String(value || '').trim().toLowerCase();
}

function sanitizeFileName(value) {
  return String(value || 'submission')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120) || 'submission';
}

function isFigmaLink(value) {
  return /^https:\/\/(?:www\.)?figma\.com\/.+/i.test(String(value || '').trim());
}

function validateSubmissionWindow(key, now) {
  const schedule = SUBMISSION_WINDOWS[key];
  if (!schedule) throw new Error('Invalid submission stage.');

  if (TESTING_MODE) return schedule;

  const opensAt = new Date(schedule.opensAt).getTime();
  const closesAt = new Date(schedule.closesAt).getTime();
  const currentTime = now.getTime();
  if (currentTime < opensAt) throw new Error('This submission window has not opened yet.');
  if (currentTime > closesAt) throw new Error('This submission window has closed.');
  return schedule;
}

function findRegisteredTeam(registrationId) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Registration sheet was not found.');

  const rows = sheet.getDataRange().getValues();
  const wantedId = normalizedText(registrationId);
  for (let index = 0; index < rows.length; index += 1) {
    if (normalizedText(rows[index][1]) === wantedId) {
      return {
        registrationId: String(rows[index][1]).trim(),
        category: String(rows[index][2]).trim(),
        teamName: String(rows[index][3]).trim(),
        leaderEmail: String(rows[index][7]).trim(),
      };
    }
  }
  throw new Error('Team ID was not found.');
}

function validateSubmission(data, now) {
  if (data.source !== EXPECTED_SUBMISSION_SOURCE) throw new Error('Invalid submission source.');

  const key = String(data.submissionKey || '');
  const schedule = validateSubmissionWindow(key, now);
  const registrationId = String(data.registrationId || '').trim();
  const teamName = String(data.teamName || '').trim();
  const leaderEmail = String(data.leaderEmail || '').trim();
  const file = data.file || {};
  const figmaUrl = String(data.figmaUrl || '').trim();
  let fileName = '';
  let mimeType = '';
  let bytes = [];

  if (!registrationId || !teamName || !leaderEmail) throw new Error('Team verification details are incomplete.');
  if (String(data.category || '') !== schedule.category || String(data.submissionType || '') !== schedule.type) {
    throw new Error('Submission category does not match the selected stage.');
  }
  if (schedule.inputMode === 'figma-link') {
    if (!isFigmaLink(figmaUrl)) throw new Error('A valid public Figma link is required for UI/UX submissions.');
  } else {
    fileName = sanitizeFileName(file.name);
    const extension = fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : '';
    if (!fileName || !String(file.base64 || '')) throw new Error('A submission file is required.');
    if (!schedule.extensions.includes(extension)) throw new Error('This file type is not accepted for the selected stage.');
    bytes = Utilities.base64Decode(String(file.base64));
    if (!bytes.length || bytes.length > MAX_SUBMISSION_BYTES) throw new Error('The file must be 8 MB or smaller.');
    mimeType = String(file.type || 'application/octet-stream');
  }

  const registeredTeam = findRegisteredTeam(registrationId);
  if (registeredTeam.category !== schedule.category) throw new Error('The registration category does not match this submission.');
  if (normalizedText(registeredTeam.teamName) !== normalizedText(teamName)) throw new Error('The team name does not match the registration.');
  if (normalizedText(registeredTeam.leaderEmail) !== normalizedText(leaderEmail)) throw new Error('The leader email does not match the registration.');

  return {
    key,
    category: schedule.category,
    type: schedule.type,
    registrationId: registeredTeam.registrationId,
    teamName: registeredTeam.teamName,
    leaderEmail: registeredTeam.leaderEmail,
    inputMode: schedule.inputMode,
    figmaUrl,
    fileName,
    mimeType,
    bytes,
  };
}

function getOrCreateFolder(parent, name) {
  const folders = parent.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : parent.createFolder(name);
}

function getOrCreateSubmissionSheet(spreadsheet, category) {
  const sheetName = SUBMISSIONS_SHEET_NAMES[category];
  if (!sheetName) throw new Error('Invalid submission category.');

  const headers = [
    'Submitted at',
    'Submission ID',
    'Team ID',
    'Category',
    'Stage',
    'Team name',
    'Leader email',
    'Original file name',
    'File type',
    'File size',
    'Drive file ID',
    'Drive URL',
    'Submission format',
    'Figma URL',
  ];

  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  if (sheet.getMaxColumns() < headers.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
  }
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  return sheet;
}

function syncSubmissionViews(spreadsheet) {
  SUBMISSION_VIEW_DEFINITIONS.forEach(function (view) {
    let sheet = spreadsheet.getSheetByName(view.name);
    if (!sheet) sheet = spreadsheet.insertSheet(view.name);
    if (sheet.getMaxColumns() < 14) {
      sheet.insertColumnsAfter(sheet.getMaxColumns(), 14 - sheet.getMaxColumns());
    }
    sheet.getRange('A1').setFormula(
      '=QUERY(\'' + view.source + '\'!A:N,"select * where E = \'' + view.stage + '\'",1)'
    );
    sheet.setFrozenRows(1);
  });
}

function initializeSubmissionStorage() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const registrationSheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (registrationSheet) registrationSheet.getRange(1, 2).setValue('Team ID');
  getOrCreateSubmissionSheet(spreadsheet, 'University');
  getOrCreateSubmissionSheet(spreadsheet, 'School');
  syncSubmissionViews(spreadsheet);

  const rootFolders = DriveApp.getFoldersByName(SUBMISSIONS_FOLDER_NAME);
  const rootFolder = rootFolders.hasNext() ? rootFolders.next() : DriveApp.createFolder(SUBMISSIONS_FOLDER_NAME);
  const universityFolder = getOrCreateFolder(rootFolder, 'University');
  const schoolFolder = getOrCreateFolder(rootFolder, 'School');
  getOrCreateFolder(universityFolder, 'Proposal');
  getOrCreateFolder(universityFolder, 'UI-UX');
  getOrCreateFolder(schoolFolder, 'Proposal');

  const result = {
    folderId: rootFolder.getId(),
    folderUrl: rootFolder.getUrl(),
    spreadsheetUrl: spreadsheet.getUrl(),
  };
  console.log(JSON.stringify(result));
  return result;
}

function saveSubmission(data, now) {
  const submission = validateSubmission(data, now);
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = getOrCreateSubmissionSheet(spreadsheet, submission.category);

  const timestamp = Utilities.formatDate(now, 'Asia/Colombo', 'yyyyMMdd-HHmmss');
  const submissionId = 'DEV4-SUB-' + timestamp + '-' + Math.floor(100 + Math.random() * 900);
  let driveFileId = '';
  let driveFileUrl = '';

  if (submission.inputMode === 'file') {
    const rootFolders = DriveApp.getFoldersByName(SUBMISSIONS_FOLDER_NAME);
    const rootFolder = rootFolders.hasNext() ? rootFolders.next() : DriveApp.createFolder(SUBMISSIONS_FOLDER_NAME);
    const categoryFolder = getOrCreateFolder(rootFolder, submission.category);
    const stageFolder = getOrCreateFolder(categoryFolder, submission.type.replace('/', '-'));
    const storedName = sanitizeFileName(submission.registrationId + '-' + submission.type.replace('/', '-') + '-' + submission.fileName);
    const blob = Utilities.newBlob(submission.bytes, submission.mimeType, storedName);
    const driveFile = stageFolder.createFile(blob);
    driveFileId = driveFile.getId();
    driveFileUrl = driveFile.getUrl();
  }

  sheet.appendRow([
    now,
    submissionId,
    submission.registrationId,
    submission.category,
    submission.type,
    submission.teamName,
    submission.leaderEmail,
    submission.fileName,
    submission.mimeType,
    submission.bytes.length,
    driveFileId,
    driveFileUrl,
    submission.inputMode === 'figma-link' ? 'Figma link' : 'File upload',
    submission.figmaUrl,
  ]);

  return { success: true, submissionId };
}

function saveRegistration(data, now) {
  const registration = validateRegistration(data);
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Registration sheet was not found.');
  const registrationId = nextRegistrationId(sheet, registration.category);

  const participantCells = [];
  for (let index = 0; index < 4; index += 1) {
    const member = registration.members[index] || normalizeParticipant(null);
    participantCells.push(member.name, member.email, plainText(member.whatsapp), plainText(member.nic));
  }

  sheet.appendRow([
    now,
    registrationId,
    registration.category,
    registration.teamName,
    registration.teamSize,
    registration.institution,
    registration.leader.name,
    registration.leader.email,
    plainText(registration.leader.whatsapp),
    plainText(registration.leader.nic),
  ].concat(participantCells));

  return { success: true, registrationId };
}

function doPost(event) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const data = JSON.parse(event.postData.contents);
    const now = new Date();
    if (data.source === EXPECTED_SUBMISSION_SOURCE) return jsonResponse(saveSubmission(data, now));
    return jsonResponse(saveRegistration(data, now));
  } catch (error) {
    return jsonResponse({ success: false, error: error.message });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return jsonResponse({ success: true, service: 'DEVthon 4.0 registration and submissions' });
}
