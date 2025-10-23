const express = require('express');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { exec } = require('child_process'); 
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); 

const TEMPLATE_PATH = path.join(__dirname, 'template.xlsx');

/**
 * Hàm điền dữ liệu vào Excel
 * (ĐÃ SỬA LỖI TYPO 'worksVsheet')
 */
async function fillExcel(data, outputPath) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(TEMPLATE_PATH);
    const worksheet = workbook.worksheets[0]; 

    // Điền dữ liệu
    worksheet.getCell('A5').value = data.a5;
    
    // Gán dữ liệu từ ID của đại ca vào đúng cột Excel (Bắt đầu từ B9)
    worksheet.getCell('B9').value = data.b9; // [Nội dung] (id b9 -> ô B9)
    worksheet.getCell('C9').value = data.c9; // [Chứng từ] (id c9 -> ô C9)
    worksheet.getCell('D9').value = data.d9; // [Chủng loại] (id d9 -> ô D9)
    worksheet.getCell('E9').value = data.e9; // [Khách hàng] (id e9 -> ô E9)
    worksheet.getCell('F9').value = data.f9; // [Người đại diện] (id f9 -> ô F9)
    worksheet.getCell('G9').value = data.g9; // [CCCD] (id g9 -> ô G9) - SỬA LỖI TYPO
    worksheet.getCell('H9').value = data.h9; // [BSX] (id h9 -> ô H9)
    worksheet.getCell('I9').value = data.i9; // [ĐVVC] (id i9 -> ô I9)
    worksheet.getCell('J9').value = data.j9; // [Số lô] (id j9 -> ô J9) - SỬA LỖI TYPO
    worksheet.getCell('K9').value = data.k9; // [Khối lượng] (id k9 -> ô K9)
    worksheet.getCell('L9').value = data.l9; // [Mục đích] (id l9 -> ô L9)
    worksheet.getCell('M9').value = data.m9; // [Ghi chú] (id m9 -> ô M9)

    // Gán trưởng kíp vào ô Người lập (K12)
    worksheet.getCell('I15').value = data.truongKip;

    // Lưu file
    await workbook.xlsx.writeFile(outputPath);
    return outputPath;
}

/**
 * Hàm trợ giúp: Chuyển đổi Excel sang PDF bằng LibreOffice
 * (Đã sửa lỗi ngắt trang)
 */
function convertToPdf(excelPath, outputDir) {
    // Cần có dấu nháy đơn bọc ngoài toàn bộ tham số convert-to
    const command = `libreoffice --headless --convert-to 'pdf:calc_pdf_Export:{"SinglePageSheets":{"type":"boolean","value":"true"}}' ${excelPath} --outdir ${outputDir}`;
    
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Lỗi khi convert PDF: ${stderr}`);
                console.error(`Stdout: ${stdout}`);
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
            // (ĐÃ SỬA LỖI TYPO 'tempXfsxPath' -> 'tempXlsxPath')
            const tempPdfPath = await convertToPdf(tempXlsxPath, tempDir); 
            fileToSendPath = tempPdfPath;
            filesToCleanup.push(tempPdfPath);
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
        filesToCleanup.forEach(filePath => {
            fs.unlink(filePath, (unlinkErr) => {});
        });
    }
});

app.listen(PORT, () => {
    console.log(`Máy chủ đang chạy tại cổng ${PORT}`);
});


