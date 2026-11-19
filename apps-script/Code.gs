const SPREADSHEET_ID = '1aLmYZzkaD0zQbKrj2lktFjuaSB_ninzDGzIHeowfotM';
const SHEET_NAME = 'Registrations';
const EXPECTED_SOURCE = 'devthon-4-registration-v1';

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

  if (data.source !== EXPECTED_SOURCE) throw new Error('Invalid registration source.');
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

function doPost(event) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const data = JSON.parse(event.postData.contents);
    const registration = validateRegistration(data);
    const now = new Date();
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

    return jsonResponse({ success: true, registrationId });
  } catch (error) {
    return jsonResponse({ success: false, error: error.message });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return jsonResponse({ success: true, service: 'DEVthon 4.0 registration' });
}
