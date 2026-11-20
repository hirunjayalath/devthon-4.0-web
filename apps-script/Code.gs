const SPREADSHEET_ID = '1aLmYZzkaD0zQbKrj2lktFjuaSB_ninzDGzIHeowfotM';
const SHEET_NAME = 'Registrations';
const SUBMISSIONS_SHEET_NAMES = {
  University: 'University Submissions',
  School: 'School Submissions',
};
const SUBMISSIONS_FOLDER_NAME = 'DEVthon 4.0 Submissions';
const EXPECTED_REGISTRATION_SOURCE = 'devthon-4-registration-v1';
const EXPECTED_SUBMISSION_SOURCE = 'devthon-4-submission-v1';
const MAX_SUBMISSION_BYTES = 8 * 1024 * 1024;

const SUBMISSION_WINDOWS = {
  'university-proposal': {
    category: 'University',
    type: 'Proposal',
    opensAt: '2026-12-24T00:00:00+05:30',
    closesAt: '2026-12-31T23:59:59.999+05:30',
    extensions: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'zip'],
  },
  'school-proposal': {
    category: 'School',
    type: 'Proposal',
    opensAt: '2027-01-05T00:00:00+05:30',
    closesAt: '2027-01-17T23:59:59.999+05:30',
    extensions: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'zip'],
  },
  'university-uiux': {
    category: 'University',
    type: 'UI/UX',
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

function validateSubmissionWindow(key, now) {
  const schedule = SUBMISSION_WINDOWS[key];
  if (!schedule) throw new Error('Invalid submission stage.');

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
  throw new Error('Registration ID was not found.');
}

function validateSubmission(data, now) {
  if (data.source !== EXPECTED_SUBMISSION_SOURCE) throw new Error('Invalid submission source.');

  const key = String(data.submissionKey || '');
  const schedule = validateSubmissionWindow(key, now);
  const registrationId = String(data.registrationId || '').trim();
  const teamName = String(data.teamName || '').trim();
  const leaderEmail = String(data.leaderEmail || '').trim();
  const file = data.file || {};
  const fileName = sanitizeFileName(file.name);
  const extension = fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : '';

  if (!registrationId || !teamName || !leaderEmail) throw new Error('Team verification details are incomplete.');
  if (String(data.category || '') !== schedule.category || String(data.submissionType || '') !== schedule.type) {
    throw new Error('Submission category does not match the selected stage.');
  }
  if (!fileName || !String(file.base64 || '')) throw new Error('A submission file is required.');
  if (!schedule.extensions.includes(extension)) throw new Error('This file type is not accepted for the selected stage.');

  const registeredTeam = findRegisteredTeam(registrationId);
  if (registeredTeam.category !== schedule.category) throw new Error('The registration category does not match this submission.');
  if (normalizedText(registeredTeam.teamName) !== normalizedText(teamName)) throw new Error('The team name does not match the registration.');
  if (normalizedText(registeredTeam.leaderEmail) !== normalizedText(leaderEmail)) throw new Error('The leader email does not match the registration.');

  const bytes = Utilities.base64Decode(String(file.base64));
  if (!bytes.length || bytes.length > MAX_SUBMISSION_BYTES) throw new Error('The file must be 8 MB or smaller.');

  return {
    key,
    category: schedule.category,
    type: schedule.type,
    registrationId: registeredTeam.registrationId,
    teamName: registeredTeam.teamName,
    leaderEmail: registeredTeam.leaderEmail,
    fileName,
    mimeType: String(file.type || 'application/octet-stream'),
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

  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    sheet.appendRow([
      'Submitted at',
      'Submission ID',
      'Registration ID',
      'Category',
      'Stage',
      'Team name',
      'Leader email',
      'Original file name',
      'File type',
      'File size',
      'Drive file ID',
      'Drive URL',
    ]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function initializeSubmissionStorage() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  getOrCreateSubmissionSheet(spreadsheet, 'University');
  getOrCreateSubmissionSheet(spreadsheet, 'School');

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

  const rootFolders = DriveApp.getFoldersByName(SUBMISSIONS_FOLDER_NAME);
  const rootFolder = rootFolders.hasNext() ? rootFolders.next() : DriveApp.createFolder(SUBMISSIONS_FOLDER_NAME);
  const categoryFolder = getOrCreateFolder(rootFolder, submission.category);
  const stageFolder = getOrCreateFolder(categoryFolder, submission.type.replace('/', '-'));
  const timestamp = Utilities.formatDate(now, 'Asia/Colombo', 'yyyyMMdd-HHmmss');
  const submissionId = 'DEV4-SUB-' + timestamp + '-' + Math.floor(100 + Math.random() * 900);
  const storedName = sanitizeFileName(submission.registrationId + '-' + submission.type.replace('/', '-') + '-' + submission.fileName);
  const blob = Utilities.newBlob(submission.bytes, submission.mimeType, storedName);
  const driveFile = stageFolder.createFile(blob);

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
    driveFile.getId(),
    driveFile.getUrl(),
  ]);

  return { success: true, submissionId };
}

function saveRegistration(data, now) {
  const registration = validateRegistration(data);
  const registrationId = 'DEV4-' + Utilities.formatDate(now, 'Asia/Colombo', 'yyyyMMdd-HHmmss') + '-' + Math.floor(100 + Math.random() * 900);
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Registration sheet was not found.');

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
