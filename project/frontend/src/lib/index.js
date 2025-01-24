// jsdoc
export function formatDate(dateString) {
	const date = new Date(dateString);
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

// jsdoc
export async function ai(text) {
	if (!text || typeof text !== "string") {
		throw new Error("Text parameter is required and must be a string");
	}

	try {
		const res = await fetch(`http://localhost:5000/api/groq`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ text }),
		});

		if (!res.ok) {
			throw new Error(`HTTP error! status: ${res.status}`);
		}

		const data = await res.json();
		if (data.error) {
			throw new Error(data.error);
		}

		return data;
	} catch (error) {
		throw new Error(`AI service error: ${error.message}`);
	}
}
