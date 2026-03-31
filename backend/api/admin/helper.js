import crypto from "crypto";

export const formatDashboardResponse = (data) => {
	return {
		analytics: {
			signedDocuments: data.signed || 0,
			draftDocuments: data.draft || 0,
			uploadedDocuments: data.uploaded || 0,
			unsignedDocuments: data.notSigned || 0,
			activeUsers: data.activeUsers || 0,
			inactiveUsers: data.inactiveUsers || 0,
		},
	};
};

export const formatApprovalRequests = (users) => {
	return users.map((user) => ({
		id: user.id,
		name: user.name,
		email: user.email,
		requestedAt: user.updatedAt,
	}));
};


export function formatGroupedResults(datas, groupBy) {
	let data = datas.filter((item) => item.companyName != null);

	const grouped = {};
	const range =
		groupBy === "month"
			? Array.from({ length: 12 }, (_, i) => i + 1)
			: groupBy === "day"
			? Array.from({ length: 31 }, (_, i) => i + 1)
			: groupBy === "year"
			? Array.from(new Set(data.map((d) => d.year))).sort()
			: [];

	for (const row of data) {
		const key = Number(row[groupBy]);
		const companyName = row.companyName || "Unknown";

		if (isNaN(key)) {
			console.warn(`Missing or invalid ${groupBy} in row:`, row);
			continue;
		}

		if (!grouped[companyName]) {
			grouped[companyName] = {};
			for (const val of range) {
				grouped[companyName][val] = 0;
			}
		}

		grouped[companyName][key] = Number(row.count || 0);
	}

	return grouped;
}

export async function chunkUser(array, size) {
	const result = [];
	for (let i = 0; i < array.length; i += size) {
		result.push(array.slice(i, i + size));
	}
	return result;
}





export function generateRandomPassword() {
  const length = Math.floor(Math.random() * 3) + 6; 
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  let password = "";
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }
  return password;
}