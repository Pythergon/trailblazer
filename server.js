const express = require('express');
const app = express();

const { createCanvas } = require('canvas');
const bwipjs = require('bwip-js');
const fs = require('fs');
const { exec } = require('child_process');

const port = 3000;
const ip_addr = '10.0.0.200';

app.use(express.json());

app.post('/', async (req, res) => {
    console.log(`Data: ${JSON.stringify(req.body)}`);
    let data = JSON.parse(JSON.stringify(req.body));

    // Full resolution (812 x 203 pixels)
    const width = 812;  
    const height = 203; 
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.imageSmoothingEnabled = false;

    // 1. Opaque solid white base
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // --- CUSTOM INNER FRAMING BORDER ---
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4; // Twice as thick

    // Drawn exactly 10 pixels inward from all edges
    const inset = 10;
    ctx.strokeRect(inset, inset, width - (inset * 2), height - (inset * 2));
    // ------------------------------------

    let barcodeBuffer;
    try {
        barcodeBuffer = await bwipjs.toBuffer({
            bcid: 'code128',
            text: data.barcode || '00000000',
            scale: 5,
            height: 15,
            sizunit: 'mm'
        });
    } catch (err) {
        console.error("Barcode Generation Error:", err);
    }

    // 2. Render Barcode (Shifted slightly to stay clear of the 10px frame)
    if (barcodeBuffer) {
        const { Image } = require('canvas');
        const img = new Image();
        img.src = barcodeBuffer;
        ctx.drawImage(img, 25, 20, 180, height - 40);
    }

    // 3. Render Text
    ctx.fillStyle = '#000000';
    // Changed multiplier from 2 to 4 to make the font twice as large as before
    const size = (data.fontSize || 14) * 4; 
    ctx.font = `bold ${size}px sans-serif`;
    ctx.textBaseline = 'top';

    let currentY = 25; // Adjusted to align beautifully inside the 10px frame
    for (const [key, value] of Object.entries(data)) {
        if (!(key === 'fontSize' || key === 'barcode')) {
            ctx.fillText(`${key}: ${value}`, 230, currentY);
            // Dynamic spacing based on the new larger size to prevent text overlapping
            currentY += size + 12; 
        }
    }

    // 4. Flip canvas layer 180 degrees
    const flippedCanvas = createCanvas(width, height);
    const flippedCtx = flippedCanvas.getContext('2d');
    
    flippedCtx.translate(width / 2, height / 2);
    flippedCtx.rotate(Math.PI);
    flippedCtx.drawImage(canvas, -width / 2, -height / 2);

    // 5. Save the image layout
    const filename = `${data.Title || 'label'}.png`;
    const imageBuffer = flippedCanvas.toBuffer('image/png');
    
    try {
        fs.writeFileSync(filename, imageBuffer);
        console.log('Framed PNG saved to disk.');

        // 6. Native Windows Photo Engine Print Command
        const printerName = "Westinghouse WHTP203e Wireless";
        const command = `rundll32.exe C:\\Windows\\System32\\shimgvw.dll,ImageView_PrintTo "${__dirname}\\${filename}" "${printerName}"`;

        exec(command, (err, stdout, stderr) => {
            if (err) {
                console.error("System Spooler Error:", err);
                return;
            }
            console.log("Framed print job dispatched cleanly.");
            
            // Clean up file safely
            setTimeout(() => {
                if (fs.existsSync(filename)) fs.unlinkSync(filename);
            }, 5000);
        });

    } catch (fsErr) {
        console.error("File write error:", fsErr);
    }

    res.status(200).send(`Print payload processed.`);
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on: http://${ip_addr}:${port}`);
});