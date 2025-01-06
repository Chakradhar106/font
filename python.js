const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const os = require('os');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint to fetch system UUID and save to a file
app.get('/get-uuid', (req, res) => {
    const platform = os.platform();

    let command;
    if (platform === 'win32') {
        command = 'wmic csproduct get UUID';
    } else if (platform === 'linux') {
        command = 'cat /sys/class/dmi/id/product_uuid';
    } else if (platform === 'darwin') {
        command = 'ioreg -rd1 -c IOPlatformExpertDevice | grep IOPlatformUUID';
    } else {
        return res.status(400).json({ error: 'Unsupported platform' });
    }

    exec(command, (err, stdout, stderr) => {
        if (err || stderr) {
            console.error('Error executing command:', err || stderr);
            return res.status(500).json({ error: 'Failed to retrieve UUID' });
        }

        let uuid;

        // Extract UUID based on platform
        if (platform === 'win32') {
            const lines = stdout.split('\n').map(line => line.trim());
            uuid = lines[1]; // Typically UUID is on the second line
        } else if (platform === 'linux' || platform === 'darwin') {
            uuid = stdout.trim();
            if (platform === 'darwin') {
                const match = uuid.match(/"([a-fA-F0-9\-]+)"/);
                uuid = match ? match[1] : null;
            }
        }

        if (uuid) {
            // Save UUID to a file
            fs.writeFile('uuid.txt', uuid, 'utf8', (fileErr) => {
                if (fileErr) {
                    console.error('Error writing to file:', fileErr);
                    return res.status(500).json({ error: 'Failed to save UUID to file' });
                }
                console.log('UUID saved to uuid.txt');
                res.json({ uuid, message: 'UUID saved to file successfully!' });
            });
        } else {
            res.status(500).json({ error: 'Unable to parse UUID' });
        }
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});