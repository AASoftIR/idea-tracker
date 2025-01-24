/**
 * Formats a date string into a localized date-time representation
 * @param {string} dateString - The input date string to format
 * @returns {string} The formatted date string in "MMM D, YYYY, HH:MM AM/PM" format
 * @example
 * formatDate("2024-01-15T10:30:00")
 * // Returns: "Jan 15, 2024, 10:30 AM"
 */
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

/**
 * Makes an API call to the AI service using GROQ
 * @param {string} text - The input text to process
 * @returns {Promise<Object>} The parsed JSON response from the AI service
 * @throws {Error} If the API returns an error or if the request fails
 * @async
 * @example
 * try {
 *   const response = await ai("Generate ideas for my project");
 *   console.log(response);
 * } catch (error) {
 *   console.error(error);
 * }
 */
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
