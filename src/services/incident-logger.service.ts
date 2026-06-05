import * as fs from 'fs';
import * as path from 'path';

class IncidentLoggerService {
    private infoLogsDirectory = path.join(__dirname, '..', '..', 'logs', 'info');
    private errorLogsDirectory = path.join(__dirname, '..', '..', 'logs', 'error');

    constructor() {
        this.ensureLogsDirectoryExists();
    }

    private ensureLogsDirectoryExists() {
        if (!fs.existsSync(this.infoLogsDirectory)) {
            fs.mkdirSync(this.infoLogsDirectory, { recursive: true });
        }
        if (!fs.existsSync(this.errorLogsDirectory)) {
            fs.mkdirSync(this.errorLogsDirectory, { recursive: true });
        }
    }

    private async writeLog(type: 'info' | 'error', text: string): Promise<void> {
        try {
            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${day}`;
            const fileName = `${dateString}-${type}.txt`;
            
            const targetDirectory = type === 'info' ? this.infoLogsDirectory : this.errorLogsDirectory;
            const filePath = path.join(targetDirectory, fileName);

            const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
            const logEntry = `[${time}] ${text}\n`;

            await fs.promises.appendFile(filePath, logEntry, 'utf8');
        } catch (error) {
            console.error(`Error writing to ${type} log file:`, error);
        }
    }

    public async info(text: string): Promise<void> {
        await this.writeLog('info', text);
    }

    public async error(text: string): Promise<void> {
        await this.writeLog('error', text);
    }
}

export default new IncidentLoggerService();
