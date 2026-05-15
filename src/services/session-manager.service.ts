import { env } from "../config/env";

class sessionManager {
    private sessionId: string | null = null;

    // singleton

    async request(endpoint: string): Promise<any> {
        if (!this.sessionId) {
            await this.login();
        }

        const response = await fetch(
            `${env.sap.sapUrl}/${endpoint}`,
            {
                headers: {
                    Cookie: `B1SESSION=${this.sessionId}`
                }
            }
        );

        const data = await response.json();

        // sesión inválida
        if (data?.error?.code === 301) {
            console.error("❌ Session expired, relogin...");
            console.info("🔄 Relogin SAP...");
            await this.login();
            console.info("✅ Session reestablished");
            // retry automático
            return this.request(endpoint);
        }

        // otros errores SAP
        if (data?.error) {
            console.error("❌ SAP Error:", data.error);
            throw new Error(
                data.error.message?.value || "SAP Error"
            );
        }

        return data;
    }

    async login() {
        // Ignorar error de certificado SSL auto-firmado
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        const response = await fetch(
            `${env.sap.sapUrl}/Login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    CompanyDB: env.sap.companyDb,
                    UserName: env.sap.username,
                    Password: env.sap.password
                })
            }
        );

        if (!response.ok) {
            const text = await response.text();
            console.error("❌ SAP API error:", response.status, response.statusText, "\nResponse:", text);
            throw new Error(`SAP API error: ${response.status} ${response.statusText}\nResponse: ${text}`);
        }
        const cookies = response.headers.get("set-cookie");

        console.info("Cookies:", cookies);

        const data = await response.json();
        this.sessionId = data.SessionId;
        return data;
    }
}

// Singleton pattern
export default new sessionManager();