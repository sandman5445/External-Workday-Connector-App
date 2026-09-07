import { useState } from "react";
import { CanvasProvider } from "@workday/canvas-kit-react/common";
import {
	PrimaryButton,
	TertiaryButton,
} from "@workday/canvas-kit-react/button";
import { Heading, BodyText } from "@workday/canvas-kit-react/text";
import { InformationHighlight } from "@workday/canvas-kit-react/information-highlight";
import type { LicenseInfo, PersonalInfo } from "./types/applicant";
import { BrandHeader } from "./components/BrandHeader";
import { PersonalInfoSection } from "./components/PersonalInfoSection";
import { DocumentUploadSection } from "./components/DocumentUploadSection";

// POC only: points at the local backend proxy that makes the actual SOAP
// call to Workday. Move this to an env var (e.g. VITE_API_BASE_URL) before
// this goes anywhere near production.
const API_BASE_URL = "http://localhost:4000";

type SubmitStatus = "idle" | "submitting" | "success" | "error";

function App() {
	const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
		firstName: "",
		lastName: "",
		phone: "",
		email: "",
	});
	const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
	const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [lastRequestXml, setLastRequestXml] = useState<string | null>(null);
	const [lastResponseXml, setLastResponseXml] = useState<string | null>(null);
	const [showSoapDetails, setShowSoapDetails] = useState(false);

	// The candidate reaches this app via a link containing their Job
	// Application ID, e.g. https://yourapp.com/?applicationId=abc123
	const jobApplicationId = new URLSearchParams(window.location.search).get(
		"applicationId"
	);

	const handlePersonalInfoChange = (
		field: keyof PersonalInfo,
		value: string
	) => {
		setPersonalInfo((prev) => ({ ...prev, [field]: value }));
	};

	const handleLicenseFieldChange = (
		field: keyof LicenseInfo,
		value: string
	) => {
		setLicenseInfo((prev) => (prev ? { ...prev, [field]: value } : prev));
	};

	// Only license-derived fields come from the (mock) extraction. First Name,
	// Last Name, Phone, and Email always stay exactly what the person typed
	// in Section 1 — extraction never overwrites them.
	const handleExtracted = (extracted: LicenseInfo) => {
		setLicenseInfo(extracted);
	};

	const handleReset = () => {
		setLicenseInfo(null);
	};

	const isSubmitDisabled =
		!personalInfo.firstName ||
		!personalInfo.lastName ||
		!personalInfo.phone ||
		!personalInfo.email ||
		!jobApplicationId ||
		submitStatus === "submitting";

	const handleSubmit = async () => {
		if (!jobApplicationId) return;

		setSubmitStatus("submitting");
		setSubmitError(null);

		const payload = {
			...personalInfo,
			...(licenseInfo ?? {}),
		};

		try {
			const response = await fetch(
				`${API_BASE_URL}/api/applications/${encodeURIComponent(jobApplicationId)}/custom-data`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				}
			);

			const result = await response.json();

			setLastRequestXml(result.requestXml ?? null);
			setLastResponseXml(result.responseXml ?? null);

			if (!response.ok) {
				throw new Error(result.detail || result.error || "Submission failed.");
			}

			setSubmitStatus("success");
		} catch (err) {
			setSubmitStatus("error");
			setSubmitError(
				err instanceof Error ? err.message : "Something went wrong."
			);
		}
	};

	return (
		<CanvasProvider>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					minHeight: "100vh",
					backgroundColor: "#f7f7f5",
				}}
			>
				<BrandHeader />

				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 24,
						padding: 32,
						maxWidth: 640,
						margin: "0 auto",
						width: "100%",
						boxSizing: "border-box",
					}}
				>
					<Heading size="medium">New Applicant</Heading>

					{!jobApplicationId && (
						<InformationHighlight variant="caution">
							<InformationHighlight.Icon />
							<InformationHighlight.Body>
								<InformationHighlight.Heading>
									Missing application link
								</InformationHighlight.Heading>
								This page needs an <code>applicationId</code> in the URL to know
								which Workday record to save to. Try appending
								<code>?applicationId=YOUR_TEST_ID</code> to the address bar for
								testing.
							</InformationHighlight.Body>
						</InformationHighlight>
					)}

					{submitStatus === "success" && (
						<InformationHighlight>
							<InformationHighlight.Icon />
							<InformationHighlight.Body>
								<InformationHighlight.Heading>
									Submitted
								</InformationHighlight.Heading>
								Your information has been saved to Workday.
							</InformationHighlight.Body>
						</InformationHighlight>
					)}

					{submitStatus === "error" && (
						<InformationHighlight variant="critical">
							<InformationHighlight.Icon />
							<InformationHighlight.Body>
								<InformationHighlight.Heading>
									Submission failed
								</InformationHighlight.Heading>
								{submitError}
							</InformationHighlight.Body>
						</InformationHighlight>
					)}

					<PersonalInfoSection
						personalInfo={personalInfo}
						onChange={handlePersonalInfoChange}
					/>

					<DocumentUploadSection
						licenseInfo={licenseInfo}
						onExtracted={handleExtracted}
						onLicenseFieldChange={handleLicenseFieldChange}
						onReset={handleReset}
					/>

					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							gap: 12,
						}}
					>
						{lastRequestXml || lastResponseXml ? (
							<TertiaryButton
								onClick={() => setShowSoapDetails((prev) => !prev)}
							>
								{showSoapDetails ? "Hide" : "View"} SOAP request
							</TertiaryButton>
						) : (
							<span />
						)}

						<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
							{submitStatus === "submitting" && (
								<BodyText size="small">Submitting…</BodyText>
							)}
							<PrimaryButton onClick={handleSubmit} disabled={isSubmitDisabled}>
								Submit
							</PrimaryButton>
						</div>
					</div>

					{showSoapDetails && (
						<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
							{lastRequestXml && (
								<div>
									<BodyText
										size="small"
										style={{ fontWeight: 600, marginBottom: 4 }}
									>
										Request sent to Workday
									</BodyText>
									<pre
										style={{
											background: "#1e1e1e",
											color: "#d4d4d4",
											padding: 16,
											borderRadius: 8,
											overflowX: "auto",
											fontSize: 13,
											lineHeight: 1.5,
											maxHeight: 400,
											overflowY: "auto",
										}}
									>
										{lastRequestXml}
									</pre>
								</div>
							)}

							{lastResponseXml && (
								<div>
									<BodyText
										size="small"
										style={{ fontWeight: 600, marginBottom: 4 }}
									>
										Response from Workday
									</BodyText>
									<pre
										style={{
											background: "#1e1e1e",
											color: "#d4d4d4",
											padding: 16,
											borderRadius: 8,
											overflowX: "auto",
											fontSize: 13,
											lineHeight: 1.5,
											maxHeight: 400,
											overflowY: "auto",
										}}
									>
										{lastResponseXml}
									</pre>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</CanvasProvider>
	);
}

export default App;
