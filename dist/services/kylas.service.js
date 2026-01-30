"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kylasService = exports.KylasService = void 0;
const KYLAS_BASE_URL = process.env.KYLAS_BASE_URL || "https://api.kylas.io/v1";
const KYLAS_API_KEY = process.env.KYLAS_API_KEY || "";
class KylasService {
    get headers() {
        return {
            "Content-Type": "application/json",
            "api-key": KYLAS_API_KEY,
        };
    }
    get enabled() {
        return !!KYLAS_API_KEY;
    }
    async findLeadByEmail(email) {
        if (!this.enabled)
            return null;
        const res = await fetch(`${KYLAS_BASE_URL}/search/lead`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify({
                fields: ["id", "firstName", "lastName", "emails"],
                jsonRule: {
                    rules: [
                        {
                            id: "emails",
                            field: "emails",
                            type: "string",
                            input: "text",
                            operator: "contains",
                            value: email,
                        },
                    ],
                    condition: "AND",
                    valid: true,
                },
                limit: 1,
            }),
        });
        if (!res.ok) {
            console.error("Kylas search failed", res.status, await res.text());
            return null;
        }
        const data = await res.json();
        return data.totalCount > 0 ? data.records[0] : null;
    }
    async createLead(fullName, email) {
        if (!this.enabled)
            return null;
        const nameParts = fullName.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
        const res = await fetch(`${KYLAS_BASE_URL}/leads/`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify({
                firstName,
                lastName,
                emails: [{ type: "PERSONAL", value: email, primary: true }],
            }),
        });
        if (!res.ok) {
            console.error("Kylas create lead failed", res.status, await res.text());
            return null;
        }
        return res.json();
    }
    async addNoteToLead(leadId, description) {
        if (!this.enabled)
            return false;
        const res = await fetch(`${KYLAS_BASE_URL}/notes/relation`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify({
                targetEntityId: leadId,
                targetEntityType: "LEAD",
                sourceEntity: { description },
            }),
        });
        if (!res.ok) {
            console.error("Kylas add note failed", res.status, await res.text());
            return false;
        }
        return true;
    }
    async handleContactSubmission(fullName, email, message) {
        if (!this.enabled)
            return;
        try {
            let lead = await this.findLeadByEmail(email);
            if (!lead) {
                lead = await this.createLead(fullName, email);
            }
            if (!lead) {
                console.error("Kylas: could not find or create lead for", email);
                return;
            }
            const dateStr = new Date().toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
            const noteDescription = [
                "Contact Us Form Submitted",
                "",
                `- Name: ${fullName}`,
                `- Email: ${email}`,
                `- Message: ${message}`,
                `- Date: ${dateStr}`,
                `- Platform: web`,
            ].join("\n");
            await this.addNoteToLead(lead.id, noteDescription);
        }
        catch (err) {
            console.error("Kylas handleContactSubmission error", err);
        }
    }
}
exports.KylasService = KylasService;
exports.kylasService = new KylasService();
