import { env } from "../config/env";

interface SapErrorResponse {
    error?: {
        code?: number | string;
        message?: {
            value?: string;
        } | string;
        details?: Array<{ code?: string; message?: string }>;
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

    /**
     * Realiza una petición HTTP a la API de SAP Service Layer.
     * Gestiona automáticamente la sesión, inyectando las cookies necesarias 
     * (B1SESSION y ROUTEID) y reconectando en caso de que la sesión haya expirado.
     * 
     * @param endpoint - La ruta o recurso a consultar (ej. 'Users', 'Orders', 'Items?$top=10').
     * @param method - El método HTTP de la petición. Por defecto es 'GET'.
     * @param body - El cuerpo (payload) de la petición para métodos POST o PATCH. Opcional.
     * @param additionalHeaders - Cabeceras HTTP adicionales que se deseen enviar (ej. para paginación OData). Opcional.
     * @param isRetry - Bandera interna para evitar bucles infinitos de reintento.
     * @returns Una promesa que resuelve con los datos de respuesta enviados por SAP.
     * @throws {Error} Lanza un error si la respuesta de SAP contiene un código de error.
     */
    async request(
        endpoint: string,
        method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
        body?: unknown,
        additionalHeaders?: Record<string, string>,
        isRetry = false
    ): Promise<unknown> {
        if (!this.sessionId) {
            await this.login();
        }

        const baseUrl = env.sap.sapUrl.replace(/\/+$/, "");
        const cleanEndpoint = endpoint.replace(/^\/+/, "");

        const cookieParts: string[] = [];
        if (this.sessionId) cookieParts.push(`B1SESSION=${this.sessionId}`);
        if (this.routeId) cookieParts.push(`ROUTEID=${this.routeId}`);

        const response = await fetch(
            `${baseUrl}/${cleanEndpoint}`,
            {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Cookie: cookieParts.join("; "),
                    ...additionalHeaders
                },
                body: body ? JSON.stringify(body) : undefined
            }
        );

        // 1. Detectar expiración por Status HTTP 401
        if (response.status === 401 && !isRetry) {
            console.warn("⚠️ Sesión expirada (HTTP 401). Renovando sesión...");
            await this.login();
            console.info("✅ Sesión restablecida. Reintentando petición...");
            return this.request(endpoint, method, body, additionalHeaders, true);
        }

        let data: unknown;
        try {
            data = await response.json();
        } catch {
            if (!response.ok) {
                throw new Error(`SAP API error: ${response.status} ${response.statusText}`);
            }
            return null;
        }

        const sapError = (data as SapErrorResponse)?.error;

        // 2. Detectar expiración por código 301 (número o string) o mensaje de timeout
        const isSessionExpired =
            sapError?.code === 301 ||
            sapError?.code === "301" ||
            (typeof sapError?.message === "string" && sapError.message.toLowerCase().includes("session")) ||
            (typeof sapError?.message === "object" && sapError.message?.value?.toLowerCase().includes("session"));

        if (isSessionExpired && !isRetry) {
            console.warn("⚠️ Sesión expirada (Código 301). Renovando sesión...");
            await this.login();
            console.info("✅ Sesión restablecida. Reintentando petición...");
            return this.request(endpoint, method, body, additionalHeaders, true);
        }

        // Otros errores SAP
        if (sapError) {
            console.error("❌ SAP Error:", sapError);
            const errorMessage = typeof sapError.message === "string"
                ? sapError.message
                : sapError.message?.value || "SAP Error";
            throw new Error(errorMessage);
        }

        if (!response.ok) {
            throw new Error(`SAP API error: ${response.status} ${response.statusText}`);
        }

        return data;
    }

    async login() {
        // Ignorar error de certificado SSL auto-firmado
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        const baseUrl = env.sap.sapUrl.replace(/\/+$/, "");

        const response = await fetch(
            `${baseUrl}/Login`,
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
            console.error("❌ SAP Login error:", response.status, response.statusText, "\nResponse:", text);
            throw new Error(`SAP API error: ${response.status} ${response.statusText}\nResponse: ${text}`);
        }

        const cookies = response.headers.get("set-cookie");
        // extraer routeid
        const routeIdMatch = cookies?.match(/ROUTEID=([^;]+)/);
        this.routeId = routeIdMatch ? routeIdMatch[1] : null;

        const data = (await response.json()) as SapLoginResponse;
        this.sessionId = data.SessionId;
        console.info("✅ SAP Login exitoso, SessionId obtenido:", this.sessionId);
        return data;
    }
}

// Singleton pattern
export default new serviceLayerSession();
