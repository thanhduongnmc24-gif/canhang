const express = require('express');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { exec } = require('child_process'); // Thư viện để gọi lệnh hệ thống
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// Sử dụng middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Phục vụ file frontend

const TEMPLATE_PATH = path.join(__dirname, 'template.xlsx');

/**
 * Hàm trợ giúp: Điền dữ liệu vào file Excel
 */
async function fillExcel(data, outputPath) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(TEMPLATE_PATH);
    const worksheet = workbook.worksheets[0]; // Giả sử là sheet đầu tiên

    // Điền dữ liệu
    worksheet.getCell('A5').value = data.a5;
    worksheet.getCell('B9').value = data.b9;
    worksheet.getCell('C9').value = data.c9;
    worksheet.getCell('D9').value = data.d9;
    worksheet.getCell('E9').value = data.e9;
    worksheet.getCell('F9').value = data.f9;
    worksheet.getCell('G9').value = data.g9;
    worksheet.getCell('H9').value = data.h9; 
    worksheet.getCell('I9').value = data.i9;
    worksheet.getCell('J9').value = data.j9;
    worksheet.getCell('K9').value = data.k9;
    worksheet.getCell('L9').value = data.l9;
    worksheet.getCell('M9').value = data.m9;
    // Lưu file
    await workbook.xlsx.writeFile(outputPath);
    return outputPath;
}

/**
 * Hàm trợ giúp: Chuyển đổi Excel sang PDF bằng LibreOffice
 */
function convertToPdf(excelPath, outputDir) {
    // Đây chính là lệnh "Save as PDF"
    const command = `libreoffice --headless --convert-to pdf ${excelPath} --outdir ${outputDir}`;
    
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Lỗi khi convert PDF: ${stderr}`);
                return reject(new Error('Lỗi khi chuyển đổi PDF'));
            }
            // Tên file PDF sẽ giống file Excel
            const pdfPath = excelPath.replace('.xlsx', '.pdf');
            resolve(pdfPath);
        });
    });
}

/**
 * API Endpoint
 * Nhận dữ liệu, tạo file (XLSX hoặc PDF) và gửi về
 */
app.post('/api/generate', async (req, res) => {
    const { data, format } = req.body;

    if (!data) {
        return res.status(400).send('Không có dữ liệu');
    }

    const tempDir = os.tmpdir();
    const uniqueId = Date.now();
    const tempXlsxPath = path.join(tempDir, `filled_${uniqueId}.xlsx`);
    
    let fileToSendPath = '';
    const filesToCleanup = [tempXlsxPath];

    try {
        // Bước 1: Luôn luôn tạo file XLSX trước
        await fillExcel(data, tempXlsxPath);

        if (format === 'xlsx') {
            fileToSendPath = tempXlsxPath;
        } 
        else if (format === 'pdf') {
            // Bước 2: Nếu yêu cầu PDF, gọi LibreOffice
            const tempPdfPath = await convertToPdf(tempXlsxPath, tempDir);
            fileToSendPath = tempPdfPath;
            filesToCleanup.push(tempPdfPath); // Thêm file PDF vào danh sách dọn dẹp
        } 
        else {
            return res.status(400).send('Định dạng không hợp lệ');
        }

        // Bước 3: Gửi file về cho người dùng tải
        res.sendFile(fileToSendPath, (err) => {
            if (err) {
                console.error('Lỗi khi gửi file:', err);
            }
            // Bước 4: Dọn dẹp file tạm
            filesToCleanup.forEach(filePath => {
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) console.error('Lỗi khi xóa file tạm:', unlinkErr);
                });
            });
        });

    } catch (error) {
        console.error('Lỗi server:', error);
        res.status(500).send('Lỗi máy chủ khi tạo file');
        // Dọn dẹp nếu có lỗi
        filesToCleanup.forEach(filePath => {
            fs.unlink(filePath, (unlinkErr) => {});
        });
    }
});

app.listen(PORT, () => {
    console.log(`Máy chủ đang chạy tại cổng ${PORT}`);

});
