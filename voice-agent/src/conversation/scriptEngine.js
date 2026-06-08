const fs = require('fs');

function injectVariables(template, contact, scriptVars = {}) {
  if (!template) return '';

  const vars = {
    ...scriptVars,
    first_name: contact.first_name || contact.firstName || 'there',
    last_name: contact.last_name || contact.lastName || '',
    full_name: `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'there',
    contact_company: contact.company || contact.Company || 'your company',
    phone: contact.phone || '',
    ...contact,
  };

  return template
    .replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
    .replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}

function loadScript(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Script file not found: ${filePath}`);
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function buildSystemPrompt(script, contact) {
  const base = script.system_prompt ||
    'You are a professional voice agent. Be polite and concise. Never claim to be human if directly asked. Never deny being an AI if directly asked. Keep responses under 2 sentences.';

  const agentName = script.agent_name || 'Alex';
  const companyName = script.variables?.company_name || 'our company';
  const pitch = injectVariables(script.main_pitch, contact, script.variables || {});
  const cta = injectVariables(script.call_to_action, contact, script.variables || {});

  const objections = script.objection_responses
    ? Object.entries(script.objection_responses)
        .map(([k, v]) => `- If contact is ${k.replace(/_/g, ' ')}: "${v}"`)
        .join('\n')
    : '';

  return `${base}

Agent name: ${agentName}
Company: ${companyName}

Key script points:
- Main pitch: ${pitch}
- Call to action: ${cta}

Objection handling:
${objections}

Rules:
1. Always disclose you are an AI agent if directly asked
2. Stay on topic and be concise
3. If asked to be removed from call list, confirm and end the call politely
4. Maximum 15 conversation turns before wrapping up`;
}

function buildOpeningMessage(script, contact) {
  const opening = injectVariables(script.opening, contact, script.variables || {});
  const intro = injectVariables(script.introduction, contact, script.variables || {});
  return `${opening} ${intro}`;
}

function buildVoicemailScript(script, contact) {
  return injectVariables(script.voicemail_script, contact, script.variables || {});
}

function getObjectionResponse(script, objection, contact = {}) {
  const normalizedKey = String(objection || '').toLowerCase().replace(/\s+/g, '_');
  const response = script.objection_responses?.[normalizedKey];
  return response ? injectVariables(response, contact, script.variables || {}) : null;
}

module.exports = {
  injectVariables,
  loadScript,
  buildSystemPrompt,
  buildOpeningMessage,
  buildVoicemailScript,
  getObjectionResponse,
};
