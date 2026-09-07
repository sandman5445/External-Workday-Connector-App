import express from "express";
import cors from "cors";
import {
	putJobApplicationCustomData,
	getJobApplicationCustomData,
} from "./workday-soap-client.mjs";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// POST /api/applications/:jobApplicationId/custom-data
// Body: { firstName, lastName, phone, email, licenseNumber, dateOfBirth, expirationDate, address }
app.post(
	"/api/applications/:jobApplicationId/custom-data",
	async (req, res) => {
		const { jobApplicationId } = req.params;
		const fields = req.body;

		if (
			!fields.firstName ||
			!fields.lastName ||
			!fields.phone ||
			!fields.email
		) {
			return res
				.status(400)
				.json({ error: "firstName, lastName, phone, and email are required." });
		}

		try {
			const result = await putJobApplicationCustomData(
				jobApplicationId,
				fields
			);
			res.json({
				success: true,
				requestXml: result.requestXml,
				responseXml: result.responseXml,
			});
		} catch (err) {
			console.error("Workday submit failed:", err.message);
			res.status(502).json({
				error: "Failed to submit data to Workday.",
				detail: err.message,
				requestXml: err.requestXml,
				responseXml: err.responseXml,
			});
		}
	}
);

// GET /api/applications/:jobApplicationId/custom-data
// Useful for checking whether this applicant already submitted data.
app.get("/api/applications/:jobApplicationId/custom-data", async (req, res) => {
	const { jobApplicationId } = req.params;

	try {
		const rawXml = await getJobApplicationCustomData(jobApplicationId);
		res.json({ success: true, rawXml });
	} catch (err) {
		console.error("Workday fetch failed:", err.message);
		res
			.status(502)
			.json({
				error: "Failed to fetch data from Workday.",
				detail: err.message,
			});
	}
});

app.listen(PORT, () => {
	console.log(`Workday proxy server listening on http://localhost:${PORT}`);
});
