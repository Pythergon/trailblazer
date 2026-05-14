const express = require('express');
const app = express();

const { print } = require('pdf-to-printer');

const PDFDocument = require('pdfkit');
const bwipjs = require('bwip-js');
const fs = require('fs');

// doc.fontSize(25).text(`Order for: ${jsonData.name}`, 100, 100);

const port = 3000
const ip_addr = '10.0.0.200'

app.use(express.json());

app.post('/', async (req, res) => {
    console.log(`Data: ${JSON.stringify(req.body)}`);
    let data = JSON.parse(JSON.stringify(req.body));

    const doc = new PDFDocument({size: [72, 288], margin: 0, layout: 'landscape'});
    // console.log(`Data Code: ${data.Code}`);

    doc.pipe(fs.createWriteStream(`${'test'}.pdf`));
    doc.fontSize(data.fontSize || 14);

    try {
        // Generate the barcode buffer
        const png = await bwipjs.toBuffer({
            bcid: 'code128',
            text: data.barcode.replaceAll('#', '').padStart(8, "0") || '00000000',
            scale: 3,
            height: 40,
        });

        // Now png is in scope and the data is ready
        doc.image(png, {align: 'center', width: 72});
        
    } catch (err) {
        console.error("Barcode Generation Error:", err);
    }

    // doc.fontSize(7).text(JSON.stringify(data), {align: 'center'});
    for (const [key, value] of Object.entries(data)) {
        if (!(key === 'fontSize')) {
        doc.text(`${key}: ${value}`, {align: 'center'});
        }
    }

    doc.end();

    // print(`${data.Title}.pdf`, {
    //     printer: 'Brother MFC-L8900CDW series',
    // });

    res.status(200).send(`Data received: ${data}`);
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on: http://${ip_addr}:${port}`)
});