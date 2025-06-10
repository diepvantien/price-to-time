class PopupManager {
    constructor() {
        this.settings = {
            salary: 8000000,
            salaryUnit: 'month',
            displayUnit: 'auto',
            displayMode: 'priceAndTime',
            enabled: true,
            disableBuyButtons: false,
            hoursPerDay: 8,
            daysPerMonth: 30,
            language: 'vi',
            currency: 'VND'
        };
        
        // Ngôn ngữ và tiền tệ tự động liên kết
        this.languageCurrencyMap = {
            'vi': { currency: 'VND', symbol: '₫', defaultSalary: 8000000 },
            'en': { currency: 'USD', symbol: '$', defaultSalary: 3000 },
            'zh': { currency: 'CNY', symbol: '¥', defaultSalary: 20000 },
            'ko': { currency: 'KRW', symbol: '₩', defaultSalary: 3000000 },
            'ja': { currency: 'JPY', symbol: '¥', defaultSalary: 300000 }
        };
        
        this.translations = {
            vi: {
                title: 'Tính Giá Theo Thời Gian',
                subtitle: 'Mua sắm có ý thức, tiết kiệm thông minh',
                salary: 'Mức lương',
                timeDisplay: 'Hiển thị thời gian',
                displayMode: 'Chế độ hiển thị',
                enableExt: 'Bật extension',
                enableExtDesc: 'Tự động chuyển đổi giá thành thời gian',
                disableButtons: 'Vô hiệu hóa nút mua hàng',
                disableButtonsDesc: 'Tắt hoàn toàn nút "Mua ngay" và "Thêm vào giỏ"',
                saveSettings: 'Lưu cài đặt',
                saving: 'Đang lưu...',
                saved: 'Đã lưu!',
                error: 'Lỗi!',
                privacy: '100% riêng tư - Dữ liệu chỉ lưu trên máy bạn',
                sites: 'Hỗ trợ các trang thương mại điện tử lớn trên thế giới',
                workTime: 'Thời gian làm việc',
                language: 'Ngôn ngữ',
                currency: 'Tiền tệ',
                auto: 'Tự động (thông minh)',
                hours: 'Chỉ hiển thị giờ',
                days: 'Chỉ hiển thị ngày',
                months: 'Chỉ hiển thị tháng',
                years: 'Chỉ hiển thị năm',
                priceAndTime: 'Giá và thời gian',
                timeOnly: 'Chỉ thời gian',
                salaryPlaceholder: 'Nhập mức lương',
                hourUnit: '/giờ',
                dayUnit: '/ngày',
                monthUnit: '/tháng',
                yearUnit: '/năm',
                hoursPerDayLabel: 'Giờ/ngày',
                daysPerMonthLabel: 'Ngày/tháng'
            },
            en: {
                title: 'Price to Time Calculator',
                subtitle: 'Mindful shopping, smart saving',
                salary: 'Your salary',
                timeDisplay: 'Display time as',
                displayMode: 'Display mode',
                enableExt: 'Enable extension',
                enableExtDesc: 'Automatically convert prices to work time',
                disableButtons: 'Disable buy buttons',
                disableButtonsDesc: 'Completely disable "Buy now" and "Add to cart" buttons',
                saveSettings: 'Save Settings',
                saving: 'Saving...',
                saved: 'Saved!',
                error: 'Error!',
                privacy: '100% private - Data stored only on your device',
                sites: 'Supports major e-commerce sites worldwide',
                workTime: 'Working time',
                language: 'Language',
                currency: 'Currency',
                auto: 'Auto (smart)',
                hours: 'Hours only',
                days: 'Days only',
                months: 'Months only',
                years: 'Years only',
                priceAndTime: 'Price and time',
                timeOnly: 'Time only',
                salaryPlaceholder: 'Enter your salary',
                hourUnit: '/hour',
                dayUnit: '/day',
                monthUnit: '/month',
                yearUnit: '/year',
                hoursPerDayLabel: 'Hours/day',
                daysPerMonthLabel: 'Days/month'
            },
            zh: {
                title: '价格时间换算器',
                subtitle: '理性购物，智能储蓄',
                salary: '您的工资',
                timeDisplay: '时间显示方式',
                displayMode: '显示模式',
                enableExt: '启用扩展',
                enableExtDesc: '自动将价格转换为工作时间',
                disableButtons: '禁用购买按钮',
                disableButtonsDesc: '完全禁用"立即购买"和"添加到购物车"按钮',
                saveSettings: '保存设置',
                saving: '正在保存...',
                saved: '已保存！',
                error: '错误！',
                privacy: '100%隐私 - 数据仅存储在您的设备上',
                sites: '支持全球主要电商网站',
                workTime: '工作时间',
                language: '语言',
                currency: '货币',
                auto: '自动（智能）',
                hours: '仅显示小时',
                days: '仅显示天数',
                months: '仅显示月数',
                years: '仅显示年数',
                priceAndTime: '价格和时间',
                timeOnly: '仅时间',
                salaryPlaceholder: '输入您的工资',
                hourUnit: '/小时',
                dayUnit: '/天',
                monthUnit: '/月',
                yearUnit: '/年',
                hoursPerDayLabel: '小时/天',
                daysPerMonthLabel: '天/月'
            },
            ko: {
                title: '가격-시간 계산기',
                subtitle: '신중한 쇼핑, 스마트한 절약',
                salary: '귀하의 급여',
                timeDisplay: '시간 표시 방식',
                displayMode: '표시 모드',
                enableExt: '확장 프로그램 활성화',
                enableExtDesc: '가격을 작업 시간으로 자동 변환',
                disableButtons: '구매 버튼 비활성화',
                disableButtonsDesc: '"지금 구매" 및 "장바구니 추가" 버튼 완전 비활성화',
                saveSettings: '설정 저장',
                saving: '저장 중...',
                saved: '저장됨!',
                error: '오류!',
                privacy: '100% 개인정보 보호 - 데이터는 귀하의 기기에만 저장',
                sites: '전 세계 주요 전자상거래 사이트 지원',
                workTime: '근무 시간',
                language: '언어',
                currency: '통화',
                auto: '자동 (스마트)',
                hours: '시간만 표시',
                days: '일수만 표시',
                months: '월수만 표시',
                years: '년수만 표시',
                priceAndTime: '가격과 시간',
                timeOnly: '시간만',
                salaryPlaceholder: '급여를 입력하세요',
                hourUnit: '/시간',
                dayUnit: '/일',
                monthUnit: '/월',
                yearUnit: '/년',
                hoursPerDayLabel: '시간/일',
                daysPerMonthLabel: '일/월'
            },
            ja: {
                title: '価格時間換算ツール',
                subtitle: '賢いショッピング、スマートな節約',
                salary: 'あなたの給与',
                timeDisplay: '時間表示方式',
                displayMode: '表示モード',
                enableExt: '拡張機能を有効化',
                enableExtDesc: '価格を労働時間に自動変換',
                disableButtons: '購入ボタンを無効化',
                disableButtonsDesc: '「今すぐ購入」と「カートに追加」ボタンを完全無効化',
                saveSettings: '設定を保存',
                saving: '保存中...',
                saved: '保存しました！',
                error: 'エラー！',
                privacy: '100%プライベート - データはあなたのデバイスにのみ保存',
                sites: '世界の主要eコマースサイトをサポート',
                workTime: '労働時間',
                language: '言語',
                currency: '通貨',
                auto: '自動（スマート）',
                hours: '時間のみ表示',
                days: '日数のみ表示',
                months: '月数のみ表示',
                years: '年数のみ表示',
                priceAndTime: '価格と時間',
                timeOnly: '時間のみ',
                salaryPlaceholder: '給与を入力してください',
                hourUnit: '/時間',
                dayUnit: '/日',
                monthUnit: '/月',
                yearUnit: '/年',
                hoursPerDayLabel: '時間/日',
                daysPerMonthLabel: '日/月'
            }
        };
        
        this.init();
    }
    
    async init() {
        await this.loadSettings();
        this.setupEventListeners();
        this.updateUI();
        this.updateLanguage();
        console.log('🎨 Popup đã khởi động');
    }
    
    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get({
                salary: 8000000,
                salaryUnit: 'month',
                displayUnit: 'auto',
                displayMode: 'priceAndTime',
                enabled: true,
                disableBuyButtons: false,
                hoursPerDay: 8,
                daysPerMonth: 30,
                language: 'vi',
                currency: 'VND'
            });
            this.settings = result;
            console.log('📋 Đã tải cài đặt popup:', this.settings);
        } catch (error) {
            console.error('❌ Lỗi khi tải cài đặt popup:', error);
        }
    }
    
    setupEventListeners() {
        // Format số cho input lương
        const salaryInput = document.getElementById('salaryInput');
        salaryInput.addEventListener('input', (e) => {
            this.formatSalaryInput(e.target);
        });
        
        // Ngăn nhập ký tự không phải số cho các input số
        const numberInputs = ['salaryInput', 'hoursPerDay', 'daysPerMonth'];
        numberInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (!/[\d\s]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                        e.preventDefault();
                    }
                });
            }
        });
        
        // Sự kiện thay đổi ngôn ngữ - TỰ ĐỘNG ĐỔI TIỀN TỆ VÀ LƯƠNG
        document.getElementById('language').addEventListener('change', (e) => {
            const newLanguage = e.target.value;
            const currencyInfo = this.languageCurrencyMap[newLanguage];
            
            // Cập nhật ngôn ngữ và tiền tệ TỰ ĐỘNG
            this.settings.language = newLanguage;
            this.settings.currency = currencyInfo.currency;
            
            // Cập nhật lương mặc định nếu input trống
            const salaryInput = document.getElementById('salaryInput');
            if (!salaryInput.value || salaryInput.value.trim() === '') {
                this.settings.salary = currencyInfo.defaultSalary;
                salaryInput.value = this.formatNumber(currencyInfo.defaultSalary);
            }
            
            // Cập nhật giao diện NGAY LẬP TỨC
            this.updateLanguage();
            this.updateUI();
            
            console.log('🌍 Đã chuyển ngôn ngữ:', newLanguage, 'Tiền tệ:', currencyInfo.currency);
        });
        
        // Lưu cài đặt
        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveSettings();
        });
        
        // Enter để lưu
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveSettings();
            }
        });
    }
    
    formatSalaryInput(input) {
        // Lấy vị trí con trỏ
        const cursorPosition = input.selectionStart;
        const oldValue = input.value;
        
        // Xóa tất cả ký tự không phải số
        let value = input.value.replace(/[^\d]/g, '');
        
        // Thêm khoảng trắng mỗi 3 chữ số từ phải qua trái
        if (value) {
            value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        }
        
        // Cập nhật giá trị
        input.value = value;
        
        // Điều chỉnh vị trí con trỏ
        const spacesAdded = value.split(' ').length - oldValue.replace(/[^\d]/g, '').split(' ').length;
        const newPosition = Math.max(0, cursorPosition + spacesAdded);
        
        // Đặt lại vị trí con trỏ (setTimeout để đảm bảo DOM đã cập nhật)
        setTimeout(() => {
            input.setSelectionRange(newPosition, newPosition);
        }, 0);
    }
    
    updateLanguage() {
        const lang = this.settings.language;
        const t = this.translations[lang];
        
        console.log('🔄 Đang cập nhật ngôn ngữ:', lang);
        
        // Cập nhật tiêu đề
        document.querySelector('.logo-text h1').textContent = t.title;
        document.querySelector('.logo-text p').textContent = t.subtitle;
        
        // Cập nhật labels - COMPACT
        document.querySelector('label[for="language"] .label-text').textContent = t.language;
        document.querySelector('label[for="currency"] .label-text').textContent = t.currency;
        document.querySelector('label[for="salaryInput"] .label-text').textContent = t.salary;
        document.querySelector('label[for="workTime"] .label-text').textContent = t.workTime;
        document.querySelector('label[for="displayMode"] .label-text').textContent = t.displayMode;
        document.querySelector('label[for="displayUnit"] .label-text').textContent = t.timeDisplay;
        
        // Cập nhật placeholder
        document.getElementById('salaryInput').placeholder = t.salaryPlaceholder;
        document.getElementById('hoursPerDay').placeholder = t.hoursPerDayLabel;
        document.getElementById('daysPerMonth').placeholder = t.daysPerMonthLabel;
        
        // Cập nhật salary unit options với ký hiệu tiền tệ
        const currencyInfo = this.languageCurrencyMap[lang];
        const salaryUnitSelect = document.getElementById('salaryUnit');
        salaryUnitSelect.innerHTML = `
            <option value="hour">${currencyInfo.symbol}${t.hourUnit}</option>
            <option value="day">${currencyInfo.symbol}${t.dayUnit}</option>
            <option value="month">${currencyInfo.symbol}${t.monthUnit}</option>
            <option value="year">${currencyInfo.symbol}${t.yearUnit}</option>
        `;
        salaryUnitSelect.value = this.settings.salaryUnit;
        
        // Cập nhật toggle texts
        const toggles = document.querySelectorAll('.toggle-text .label-text');
        if (toggles[0]) toggles[0].textContent = t.enableExt;
        if (toggles[1]) toggles[1].textContent = t.disableButtons;
        
        const helperTexts = document.querySelectorAll('.helper-text');
        if (helperTexts[0]) helperTexts[0].textContent = t.enableExtDesc;
        if (helperTexts[1]) helperTexts[1].textContent = t.disableButtonsDesc;
        
        // Cập nhật nút lưu
        document.querySelector('.save-btn .btn-text').textContent = t.saveSettings;
        
        // Cập nhật footer
        const infoTexts = document.querySelectorAll('.info-text');
        if (infoTexts[0]) infoTexts[0].textContent = t.privacy;
        if (infoTexts[1]) infoTexts[1].textContent = t.sites;
        
        // Cập nhật options trong displayUnit
        const displayOptions = document.querySelectorAll('#displayUnit option');
        if (displayOptions[0]) displayOptions[0].textContent = t.auto;
        if (displayOptions[1]) displayOptions[1].textContent = t.hours;
        if (displayOptions[2]) displayOptions[2].textContent = t.days;
        if (displayOptions[3]) displayOptions[3].textContent = t.months;
        if (displayOptions[4]) displayOptions[4].textContent = t.years;
        
        // Cập nhật options trong displayMode
        const displayModeOptions = document.querySelectorAll('#displayMode option');
        if (displayModeOptions[0]) displayModeOptions[0].textContent = t.priceAndTime;
        if (displayModeOptions[1]) displayModeOptions[1].textContent = t.timeOnly;
        
        // Cập nhật currency select TỰ ĐỘNG
        this.updateCurrencySelect();
        
        console.log('✅ Đã cập nhật ngôn ngữ và tiền tệ thành công');
    }
    
    updateCurrencySelect() {
        const currencySelect = document.getElementById('currency');
        const lang = this.settings.language;
        
        // Chỉ hiển thị tiền tệ tương ứng với ngôn ngữ đã chọn
        const currencyOptions = {
            'vi': { 'VND': '🇻🇳 VND (Đồng Việt Nam)' },
            'en': { 'USD': '🇺🇸 USD (US Dollar)' },
            'zh': { 'CNY': '🇨🇳 CNY (人民币)' },
            'ko': { 'KRW': '🇰🇷 KRW (한국 원)' },
            'ja': { 'JPY': '🇯🇵 JPY (日本円)' }
        };
        
        const currencies = currencyOptions[lang] || currencyOptions['vi'];
        
        currencySelect.innerHTML = '';
        Object.entries(currencies).forEach(([code, name]) => {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = name;
            if (code === this.settings.currency) {
                option.selected = true;
            }
            currencySelect.appendChild(option);
        });
        
        // Tự động cập nhật settings.currency
        const currencyInfo = this.languageCurrencyMap[lang];
        this.settings.currency = currencyInfo.currency;
        currencySelect.value = currencyInfo.currency;
    }
    
    updateUI() {
        // Cập nhật các trường input từ settings
        const salaryInput = document.getElementById('salaryInput');
        if (this.settings.salary && this.settings.salary > 0) {
            salaryInput.value = this.formatNumber(this.settings.salary);
        } else {
            // Sử dụng lương mặc định theo ngôn ngữ
            const currencyInfo = this.languageCurrencyMap[this.settings.language];
            salaryInput.value = this.formatNumber(currencyInfo.defaultSalary);
            this.settings.salary = currencyInfo.defaultSalary;
        }
        
        document.getElementById('salaryUnit').value = this.settings.salaryUnit;
        document.getElementById('displayUnit').value = this.settings.displayUnit;
        document.getElementById('displayMode').value = this.settings.displayMode;
        document.getElementById('enableExtension').checked = this.settings.enabled;
        document.getElementById('disableBuyButtons').checked = this.settings.disableBuyButtons;
        document.getElementById('hoursPerDay').value = this.settings.hoursPerDay;
        document.getElementById('daysPerMonth').value = this.settings.daysPerMonth;
        document.getElementById('language').value = this.settings.language;
        document.getElementById('currency').value = this.settings.currency;
    }
    
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
    
    parseFormattedNumber(str) {
        return parseInt(str.replace(/\s/g, '')) || 0;
    }
    
    async saveSettings() {
        const salaryInput = document.getElementById('salaryInput');
        const saveBtn = document.getElementById('saveSettings');
        const t = this.translations[this.settings.language];
        
        // Lấy giá trị từ form
        const newSettings = {
            salary: this.parseFormattedNumber(salaryInput.value) || this.languageCurrencyMap[this.settings.language].defaultSalary,
            salaryUnit: document.getElementById('salaryUnit').value,
            displayUnit: document.getElementById('displayUnit').value,
            displayMode: document.getElementById('displayMode').value,
            enabled: document.getElementById('enableExtension').checked,
            disableBuyButtons: document.getElementById('disableBuyButtons').checked,
            hoursPerDay: parseInt(document.getElementById('hoursPerDay').value) || 8,
            daysPerMonth: parseInt(document.getElementById('daysPerMonth').value) || 30,
            language: document.getElementById('language').value,
            currency: document.getElementById('currency').value
        };
        
        try {
            // Hiệu ứng loading
            saveBtn.innerHTML = `<span class="btn-icon">⏳</span><span class="btn-text">${t.saving}</span>`;
            saveBtn.disabled = true;
            
            // Lưu vào storage
            await chrome.storage.sync.set(newSettings);
            this.settings = newSettings;
            
            // Gửi tin nhắn cập nhật đến content script
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
            if (tab) {
                try {
                    await chrome.tabs.sendMessage(tab.id, {
                        action: 'updateSettings',
                        settings: newSettings
                    });
                } catch (error) {
                    console.log('Không thể gửi tin nhắn đến content script (có thể tab không phù hợp)');
                }
            }
            
            // Hiệu ứng thành công
            saveBtn.innerHTML = `<span class="btn-icon">✅</span><span class="btn-text">${t.saved}</span>`;
            saveBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            
            setTimeout(() => {
                saveBtn.innerHTML = `<span class="btn-icon">💾</span><span class="btn-text">${t.saveSettings}</span>`;
                saveBtn.disabled = false;
                saveBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            }, 2000);
            
            console.log('✅ Đã lưu cài đặt:', newSettings);
            
        } catch (error) {
            console.error('❌ Lỗi khi lưu cài đặt:', error);
            
            // Hiệu ứng lỗi
            saveBtn.innerHTML = `<span class="btn-icon">❌</span><span class="btn-text">${t.error}</span>`;
            saveBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            
            setTimeout(() => {
                saveBtn.innerHTML = `<span class="btn-icon">💾</span><span class="btn-text">${t.saveSettings}</span>`;
                saveBtn.disabled = false;
                saveBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            }, 2000);
        }
    }
}

// Khởi động popup manager
document.addEventListener('DOMContentLoaded', () => {
    new PopupManager();
});