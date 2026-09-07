import type { ExtractedLicenseData } from "../types/applicant";

// -----------------------------------------------------------------------------
// MOCK EXTRACTION
// Swap this out for a real OCR/document-parsing API call later. It should
// accept the uploaded File and return the same shape as ExtractedLicenseData:
// { firstName, lastName, licenseNumber, dateOfBirth, expirationDate, address }
// -----------------------------------------------------------------------------
import type { LicenseInfo } from "../types/applicant";

export function mockExtractLicenseData(_file: File): Promise<LicenseInfo> {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				licenseNumber: "D1234-5678-9012",
				dateOfBirth: "1990-04-15",
				expirationDate: "2028-04-15",
				address: "742 Evergreen Terrace, Springfield, IL 62704",
			});
		}, 1500);
	});
}
