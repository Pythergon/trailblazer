const express = require('express');
const app = express();

const { print } = require('pdf-to-printer');

const PDFDocument = require('pdfkit');
const bwipjs = require('bwip-js');
const fs = require('fs');

const port = 3000
const ip_addr = '10.0.0.200'

app.use(express.json());

app.post('/', async (req, res) => {
    console.log(`Data: ${JSON.stringify(req.body)}`);
    let data = JSON.parse(JSON.stringify(req.body));

    const doc = new PDFDocument({size: [72, 288], margin: 3, layout: 'landscape'});

    doc.pipe(fs.createWriteStream(`${'test'}.pdf`));
    doc.fontSize(data.fontSize || 14);

    let png;

    try {
        png = await bwipjs.toBuffer({
            bcid: 'code128',
            text: data.barcode || '00000000',
            scale: 5,         
            height: 15,     
            sizunit: 'mm' 
        });
        console.log("Barcode generated successfully");
    } catch (err) {
        console.error("Barcode Generation Error:", err);
    }
    
    let data_str = '';
    for (const [key, value] of Object.entries(data)) {
        if (!(key === 'fontSize' || key === 'barcode')) {
        // doc.text(`${key}: ${value}`, {align: 'center'});
        data_str += `${key}: ${value}\n`;
        }
    }

    doc.image(png, { 
        align: 'left',
        width: 72,  
        height: 66 
    });

    doc.text(data_str, 78, 6, {
        align: 'left',
    });

    doc.end();

    // print(`${data.Title}.pdf`, {
    //     printer: 'Brother MFC-L8900CDW series',
    // });

    res.status(200).send(`Data received: ${data}`);
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on: http://${ip_addr}:${port}`)
});