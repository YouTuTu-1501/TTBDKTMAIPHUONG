const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldOptions = `<option value="Toán">Toán</option>
                    <option value="Ngữ văn">Ngữ văn</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="Vật lý">Vật lý</option>
                    <option value="Hóa học">Hóa học</option>
                    <option value="Sinh học">Sinh học</option>
                    <option value="Lịch sử">Lịch sử</option>
                    <option value="Địa lý">Địa lý</option>
                    <option value="GDKT-PL">GDKT-PL</option>
                    <option value="Tin học">Tin học</option>
                    <option value="Công nghệ">Công nghệ</option>
                    <option value="Năng khiếu">Năng khiếu</option>`;

const newOptions = `<option value="Toán">Toán</option>
                    <option value="Vật lý">Vật lý</option>
                    <option value="Ngữ văn">Ngữ văn</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>`;

code = code.replace(oldOptions, newOptions);

fs.writeFileSync('src/App.tsx', code);
