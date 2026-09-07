import { useRef, useState } from "react";
import {
	SecondaryButton,
	TertiaryButton,
} from "@workday/canvas-kit-react/button";
import { TextInput } from "@workday/canvas-kit-react/text-input";
import { FormField } from "@workday/canvas-kit-react/form-field";
import { BodyText } from "@workday/canvas-kit-react/text";
import { Card } from "@workday/canvas-kit-react/card";
import { InformationHighlight } from "@workday/canvas-kit-react/information-highlight";
import { LoadingDots } from "@workday/canvas-kit-react/loading-dots";
import type { LicenseInfo } from "../types/applicant";
import { mockExtractLicenseData } from "../utils/mockExtractLicenseData";

interface DocumentUploadSectionProps {
	licenseInfo: LicenseInfo | null;
	onExtracted: (data: LicenseInfo) => void;
	onLicenseFieldChange: (field: keyof LicenseInfo, value: string) => void;
	onReset: () => void;
}

const inputStyle: React.CSSProperties = {
	border: "1px solid #c9c9c9",
	borderRadius: 8,
	padding: "10px 12px",
	fontSize: "inherit",
	width: "100%",
	boxSizing: "border-box",
};

export function DocumentUploadSection({
	licenseInfo,
	onExtracted,
	onLicenseFieldChange,
	onReset,
}: DocumentUploadSectionProps) {
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);

	const cameraInputRef = useRef<HTMLInputElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const isProcessed = !isProcessing && licenseInfo !== null;

	const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setPreviewUrl(URL.createObjectURL(file));
		setIsProcessing(true);

		const extracted = await mockExtractLicenseData(file);
		onExtracted(extracted);

		setIsProcessing(false);
	};

	const handleReset = () => {
		setPreviewUrl(null);
		if (cameraInputRef.current) cameraInputRef.current.value = "";
		if (fileInputRef.current) fileInputRef.current.value = "";
		onReset();
	};

	return (
		<Card
			style={{
				borderRadius: 16,
				boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
				border: "1px solid #e5e4e7",
			}}
		>
			<Card.Heading>Identity Verification (Driver's License)</Card.Heading>
			<Card.Body>
				<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
					{!previewUrl && (
						<div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
							<SecondaryButton onClick={() => cameraInputRef.current?.click()}>
								Take Photo
							</SecondaryButton>
							<SecondaryButton onClick={() => fileInputRef.current?.click()}>
								Upload Document
							</SecondaryButton>
						</div>
					)}

					{/* Hidden inputs: camera capture vs. file picker */}
					<input
						ref={cameraInputRef}
						type="file"
						accept="image/*"
						capture="environment"
						style={{ display: "none" }}
						onChange={handleFileSelected}
					/>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*,.pdf"
						style={{ display: "none" }}
						onChange={handleFileSelected}
					/>

					{previewUrl && (
						<div
							style={{
								display: "flex",
								gap: 16,
								alignItems: "flex-start",
								flexWrap: "wrap",
							}}
						>
							<img
								src={previewUrl}
								alt="Uploaded license"
								style={{
									width: 160,
									height: 100,
									objectFit: "cover",
									borderRadius: 8,
									border: "1px solid #e5e4e7",
								}}
							/>
							<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
								{isProcessing && (
									<div
										style={{ display: "flex", gap: 6, alignItems: "center" }}
									>
										<LoadingDots />
										<BodyText size="medium">Reading document…</BodyText>
									</div>
								)}
								<TertiaryButton onClick={handleReset}>
									{isProcessing ? "Cancel" : "Retake / Re-upload"}
								</TertiaryButton>
							</div>
						</div>
					)}

					{isProcessed && licenseInfo && (
						<>
							<InformationHighlight>
								<InformationHighlight.Icon />
								<InformationHighlight.Body>
									<InformationHighlight.Heading>
										Document processed
									</InformationHighlight.Heading>
									We pulled the details below from your license — please double
									check them and correct anything that's wrong.
								</InformationHighlight.Body>
							</InformationHighlight>

							<div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
								<FormField grow>
									<FormField.Label typeLevel="body.medium">
										License Number
									</FormField.Label>
									<FormField.Field>
										<FormField.Input
											as={TextInput}
											value={licenseInfo.licenseNumber}
											onChange={(e) =>
												onLicenseFieldChange("licenseNumber", e.target.value)
											}
											style={inputStyle}
										/>
									</FormField.Field>
								</FormField>

								<FormField grow>
									<FormField.Label typeLevel="body.medium">
										Date of Birth
									</FormField.Label>
									<FormField.Field>
										<FormField.Input
											as={TextInput}
											type="date"
											value={licenseInfo.dateOfBirth}
											onChange={(e) =>
												onLicenseFieldChange("dateOfBirth", e.target.value)
											}
											style={inputStyle}
										/>
									</FormField.Field>
								</FormField>
							</div>

							<FormField grow>
								<FormField.Label typeLevel="body.medium">
									Expiration Date
								</FormField.Label>
								<FormField.Field>
									<FormField.Input
										as={TextInput}
										type="date"
										value={licenseInfo.expirationDate}
										onChange={(e) =>
											onLicenseFieldChange("expirationDate", e.target.value)
										}
										style={inputStyle}
									/>
								</FormField.Field>
							</FormField>

							<FormField grow>
								<FormField.Label typeLevel="body.medium">
									Address
								</FormField.Label>
								<FormField.Field>
									<FormField.Input
										as={TextInput}
										value={licenseInfo.address}
										onChange={(e) =>
											onLicenseFieldChange("address", e.target.value)
										}
										style={inputStyle}
									/>
								</FormField.Field>
							</FormField>
						</>
					)}
				</div>
			</Card.Body>
		</Card>
	);
}
