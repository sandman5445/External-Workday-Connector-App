// Workday SOAP client for reading/writing the custom object attached to
// Job Application, via Workday Web Services (Recruiting service).
//
// SECURITY: this file must only ever run on a server. Never import it into
// browser-side React code — it holds/uses the ISU username and password.

const TENANT = process.env.WORKDAY_TENANT;
const USERNAME = process.env.WORKDAY_USERNAME;
const PASSWORD = process.env.WORKDAY_PASSWORD;
const BASE_URL = process.env.WORKDAY_BASE_URL;
const WSDL_VERSION = process.env.WORKDAY_WSDL_VERSION;

const SERVICE_ENDPOINT = `${BASE_URL}/${TENANT}/Recruiting/${WSDL_VERSION}`;

function buildEnvelope(bodyXml) {
	return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wd="urn:com.workday/bsvc">
  <soapenv:Header>
    <wsse:Security soapenv:mustUnderstand="1"
      xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
      <wsse:UsernameToken>
        <wsse:Username>${USERNAME}@${TENANT}</wsse:Username>
        <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">${PASSWORD}</wsse:Password>
      </wsse:UsernameToken>
    </wsse:Security>
  </soapenv:Header>
  <soapenv:Body>
    ${bodyXml}
  </soapenv:Body>
</soapenv:Envelope>`;
}

function redactPassword(envelope) {
	return envelope.replace(
		/(<wsse:Password[^>]*>)[^<]*(<\/wsse:Password>)/,
		"$1***REDACTED***$2"
	);
}

async function callWorkdaySoap(bodyXml) {
	const envelope = buildEnvelope(bodyXml);
	const requestXml = redactPassword(envelope);

	const response = await fetch(SERVICE_ENDPOINT, {
		method: "POST",
		headers: { "Content-Type": "text/xml;charset=UTF-8" },
		body: envelope,
	});

	const responseXml = await response.text();

	if (!response.ok) {
		const err = new Error(
			`Workday SOAP call failed (${response.status}): ${responseXml}`
		);
		err.requestXml = requestXml;
		err.responseXml = responseXml;
		throw err;
	}

	// A 200 response can still contain a <SOAP-ENV:Fault> body — check for it.
	if (responseXml.includes("<faultcode>") || responseXml.includes("Fault>")) {
		const err = new Error(`Workday returned a SOAP fault: ${responseXml}`);
		err.requestXml = requestXml;
		err.responseXml = responseXml;
		throw err;
	}

	return { requestXml, responseXml };
}

function escapeXml(str) {
	return String(str)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

const CUSTOM_NAMESPACE = `urn:com.workday/tenants/${TENANT}/data/custom`;

export async function putJobApplicationCustomData(jobApplicationId, fields) {
	const bodyXml = `
    <bsvc:Put_Job_Application_Additional_Data_Request xmlns:bsvc="urn:com.workday/bsvc" bsvc:version="${WSDL_VERSION}">
      <bsvc:Job_Application_Custom_Object_Data>
        <bsvc:Job_Application_Reference>
          <bsvc:ID bsvc:type="Job_Application_ID">${escapeXml(jobApplicationId)}</bsvc:ID>
        </bsvc:Job_Application_Reference>
        <bsvc:Business_Object_Additional_Data>
          <custom:candidateJobApplicationAddonData xmlns:custom="${CUSTOM_NAMESPACE}">
            <custom:firstName>${escapeXml(fields.firstName)}</custom:firstName>
            <custom:lastName>${escapeXml(fields.lastName)}</custom:lastName>
            <custom:phone>${escapeXml(fields.phone)}</custom:phone>
            <custom:email>${escapeXml(fields.email)}</custom:email>
            <custom:licenseId>${escapeXml(fields.licenseNumber ?? "")}</custom:licenseId>
            <custom:dateOfBirth>${escapeXml(fields.dateOfBirth ?? "")}</custom:dateOfBirth>
            <custom:expirationDate>${escapeXml(fields.expirationDate ?? "")}</custom:expirationDate>
            <custom:address>${escapeXml(fields.address ?? "")}</custom:address>
          </custom:candidateJobApplicationAddonData>
        </bsvc:Business_Object_Additional_Data>
      </bsvc:Job_Application_Custom_Object_Data>
    </bsvc:Put_Job_Application_Additional_Data_Request>`;

	return callWorkdaySoap(bodyXml);
}

export async function getJobApplicationCustomData(jobApplicationId) {
	const bodyXml = `
    <wd:Get_Job_Application_Additional_Data_Request>
      <wd:Request_References>
        <wd:Job_Application_Reference>
          <wd:ID wd:type="Job_Application_ID">${escapeXml(jobApplicationId)}</wd:ID>
        </wd:Job_Application_Reference>
      </wd:Request_References>
    </wd:Get_Job_Application_Additional_Data_Request>`;

	return callWorkdaySoap(bodyXml);
}
