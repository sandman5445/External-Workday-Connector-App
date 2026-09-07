import { TextInput } from "@workday/canvas-kit-react/text-input";
import { FormField } from "@workday/canvas-kit-react/form-field";
import { Card } from "@workday/canvas-kit-react/card";
import type { PersonalInfo } from "../types/applicant";

interface PersonalInfoSectionProps {
	personalInfo: PersonalInfo;
	onChange: (field: keyof PersonalInfo, value: string) => void;
}

const inputStyle: React.CSSProperties = {
	border: "1px solid #c9c9c9",
	borderRadius: 8,
	padding: "10px 12px",
	fontSize: "inherit",
	width: "100%",
	boxSizing: "border-box",
};

export function PersonalInfoSection({
	personalInfo,
	onChange,
}: PersonalInfoSectionProps) {
	return (
		<Card
			style={{
				borderRadius: 16,
				boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
				border: "1px solid #e5e4e7",
			}}
		>
			<Card.Heading>Personal Information</Card.Heading>
			<Card.Body>
				<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
					<div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
						<FormField grow>
							<FormField.Label typeLevel="body.medium">
								First Name
							</FormField.Label>
							<FormField.Field>
								<FormField.Input
									as={TextInput}
									value={personalInfo.firstName}
									onChange={(e) => onChange("firstName", e.target.value)}
									placeholder="Enter First Name"
									style={inputStyle}
								/>
							</FormField.Field>
						</FormField>

						<FormField grow>
							<FormField.Label typeLevel="body.medium">
								Last Name
							</FormField.Label>
							<FormField.Field>
								<FormField.Input
									as={TextInput}
									value={personalInfo.lastName}
									onChange={(e) => onChange("lastName", e.target.value)}
									placeholder="Enter Last Name"
									style={inputStyle}
								/>
							</FormField.Field>
						</FormField>
					</div>

					<FormField grow>
						<FormField.Label typeLevel="body.medium">Phone</FormField.Label>
						<FormField.Field>
							<FormField.Input
								as={TextInput}
								type="tel"
								value={personalInfo.phone}
								onChange={(e) => onChange("phone", e.target.value)}
								placeholder="(555) 555-5555"
								style={inputStyle}
							/>
						</FormField.Field>
					</FormField>

					<FormField grow>
						<FormField.Label typeLevel="body.medium">Email</FormField.Label>
						<FormField.Field>
							<FormField.Input
								as={TextInput}
								type="email"
								value={personalInfo.email}
								onChange={(e) => onChange("email", e.target.value)}
								placeholder="jane.doe@example.com"
								style={inputStyle}
							/>
						</FormField.Field>
					</FormField>
				</div>
			</Card.Body>
		</Card>
	);
}
