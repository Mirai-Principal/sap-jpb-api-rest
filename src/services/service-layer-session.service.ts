import { env } from "../config/env";

interface SapErrorResponse {
    error?: {
        code?: number;
        message?: {
            value?: string;
        };
    };
}

interface SapLoginResponse {
    SessionId: string;
}

/**
 * Session manager for SAP B1
 * Handles authentication and session management
 */
class serviceLayerSession {
    private sessionId: string | null = null;
    private routeId: string | null = null;

    // singleton
    async request(endpoint: string, method: "GET" | "POST" | "PATCH" | "DELETE" = "GET", body?: unknown): Promise<unknown> {
        if (!this.sessionId) {
            await this.login();
        }

        const response = await fetch(
            `${env.sap.sapUrl}/${endpoint}`,
            {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Cookie: `B1SESSION=${this.sessionId}; ROUTEID=${this.routeId}`
                },
                body: body ? JSON.stringify(body) : undefined
            }
        );

        const data = (await response.json()) as SapErrorResponse;

        // sesion invalida
        if (data?.error?.code === 301) {
            console.error("❌ Session expired, relogin...");
            console.info("🔄 Relogin SAP...");
            await this.login();
            console.info("✅ Session reestablished");
            // retry automatico
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
        // extraer routeid
        const routeIdMatch = cookies?.match(/ROUTEID=([^;]+)/);
        this.routeId = routeIdMatch ? routeIdMatch[1] : null;
        console.info("✅ Cookies:", cookies);

        const data = (await response.json()) as SapLoginResponse;
        console.info("✅ Data:", data);
        this.sessionId = data.SessionId;
        return data;
    }
}

// Singleton pattern
export default new serviceLayerSession();
