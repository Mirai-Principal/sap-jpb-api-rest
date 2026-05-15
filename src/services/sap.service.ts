import { env } from "../config/env";

//? autenticacion SAP Business One
export const loginSap = async () => {
    // Ignorar error de certificado SSL auto-firmado
    if (env.ignoreSsl) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }

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
        throw new Error(`SAP API error: ${response.status} ${response.statusText}\nResponse: ${text}`);
    }

    const data = await response.json();
    return data;
};