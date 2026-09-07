export interface PersonalInfo {
	firstName: string;
	lastName: string;
	phone: string;
	email: string;
}

export interface LicenseInfo {
	licenseNumber: string;
	dateOfBirth: string;
	expirationDate: string;
	address: string;
}

export interface ExtractedLicenseData extends LicenseInfo {
	firstName: string;
	lastName: string;
}
