class PopupManager {
    constructor() {
        this.settings = {
            salary: 8000000,
            salaryUnit: 'month',
            taxType: 'after',
            displayUnit: 'auto',
            enabled: true,
            disableBuyButtons: false
        };
        
        this.init();
    }
    
    async init() {
        await this.loadSettings();
        this.setupEventListeners();
        this.updateUI();
        this.updatePreview();
        console.log('🎨 Popup đã khởi động');
    }
    
    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get({
                salary: 8000000,
                salaryUnit: 'month',
                taxType: 'after',
                displayUnit: 'auto',
                enabled: true,
                disableBuyButtons: false
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
            this.updatePreview();
        });
        
        // Ngăn nhập ký tự không phải số
        salaryInput.addEventListener('keypress', (e) => {
            if (!/[\d\s]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                e.preventDefault();
            }
        });
        
        // Các sự kiện thay đổi cài đặt
        document.getElementById('salaryUnit').addEventListener('change', () => this.updatePreview());
        document.getElementById('taxType').addEventListener('change', () => this.updatePreview());
        document.getElementById('displayUnit').addEventListener('change', () => this.updatePreview());
        
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
    
    updateUI() {
        // Cập nhật các trường input từ settings
        const salaryInput = document.getElementById('salaryInput');
        salaryInput.value = this.formatNumber(this.settings.salary);
        
        document.getElementById('salaryUnit').value = this.settings.salaryUnit;
        document.getElementById('taxType').value = this.settings.taxType;
        document.getElementById('displayUnit').value = this.settings.displayUnit;
        document.getElementById('enableExtension').checked = this.settings.enabled;
        document.getElementById('disableBuyButtons').checked = this.settings.disableBuyButtons;
    }
    
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
    
    parseFormattedNumber(str) {
        return parseInt(str.replace(/\s/g, '')) || 0;
    }
    
    updatePreview() {
        const salaryInput = document.getElementById('salaryInput');
        const salary = this.parseFormattedNumber(salaryInput.value) || this.settings.salary;
        const salaryUnit = document.getElementById('salaryUnit').value;
        const taxType = document.getElementById('taxType').value;
        const displayUnit = document.getElementById('displayUnit').value;
        
        // Tính toán ví dụ
        const preview1Price = 499000;
        const preview2Price = 2500000;
        
        const time1 = this.calculateWorkTime(preview1Price, salary, salaryUnit, taxType, displayUnit);
        const time2 = this.calculateWorkTime(preview2Price, salary, salaryUnit, taxType, displayUnit);
        
        document.getElementById('previewTime').textContent = `⏰ ${time1}`;
        document.getElementById('previewTime2').textContent = `⏰ ${time2}`;
    }
    
    calculateWorkTime(price, salary, salaryUnit, taxType, displayUnit) {
        // Tính lương theo giờ
        let hourlyRate = salary;
        
        switch (salaryUnit) {
            case 'year':
                hourlyRate = salary / (12 * 22 * 8);
                break;
            case 'month':
                hourlyRate = salary / (22 * 8);
                break;
            case 'day':
                hourlyRate = salary / 8;
                break;
            case 'hour':
                hourlyRate = salary;
                break;
        }
        
        // Áp dụng thuế
        if (taxType === 'before') {
            hourlyRate = hourlyRate * 0.85;
        }
        
        const hoursNeeded = price / hourlyRate;
        
        return this.formatTimeDisplay(hoursNeeded, displayUnit);
    }
    
    formatTimeDisplay(hoursNeeded, displayUnit) {
        if (displayUnit === 'hours') {
            if (hoursNeeded < 1) {
                return `${Math.round(hoursNeeded * 60)}p`;
            }
            const hours = Math.round(hoursNeeded * 10) / 10;
            return `${hours}h`;
        }
        
        if (displayUnit === 'days') {
            const days = Math.round((hoursNeeded / 8) * 10) / 10;
            return `${days} ngày`;
        }
        
        if (displayUnit === 'months') {
            const months = Math.round((hoursNeeded / 176) * 10) / 10;
            return `${months} tháng`;
        }
        
        if (displayUnit === 'years') {
            const years = Math.round((hoursNeeded / 2112) * 100) / 100;
            return `${years} năm`;
        }
        
        // Auto mode
        if (hoursNeeded < 1) {
            return `${Math.round(hoursNeeded * 60)}p`;
        } else if (hoursNeeded < 8) {
            const hours = Math.floor(hoursNeeded);
            const minutes = Math.round((hoursNeeded - hours) * 60);
            return minutes > 0 ? `${hours}h${minutes}p` : `${hours}h`;
        } else if (hoursNeeded < 176) {
            const days = Math.floor(hoursNeeded / 8);
            const remainingHours = Math.round(hoursNeeded % 8);
            return remainingHours > 0 ? `${days}d${remainingHours}h` : `${days}d`;
        } else {
            const months = Math.floor(hoursNeeded / 176);
            const remainingDays = Math.round((hoursNeeded % 176) / 8);
            return remainingDays > 0 ? `${months}th${remainingDays}d` : `${months}th`;
        }
    }
    
    async saveSettings() {
        const salaryInput = document.getElementById('salaryInput');
        const saveBtn = document.getElementById('saveSettings');
        
        // Lấy giá trị từ form
        const newSettings = {
            salary: this.parseFormattedNumber(salaryInput.value) || 8000000,
            salaryUnit: document.getElementById('salaryUnit').value,
            taxType: document.getElementById('taxType').value,
            displayUnit: document.getElementById('displayUnit').value,
            enabled: document.getElementById('enableExtension').checked,
            disableBuyButtons: document.getElementById('disableBuyButtons').checked
        };
        
        try {
            // Hiệu ứng loading
            saveBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Đang lưu...</span>';
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
            saveBtn.innerHTML = '<span class="btn-icon">✅</span><span class="btn-text">Đã lưu!</span>';
            saveBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            
            setTimeout(() => {
                saveBtn.innerHTML = '<span class="btn-icon">💾</span><span class="btn-text">Lưu cài đặt</span>';
                saveBtn.disabled = false;
                saveBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            }, 2000);
            
            console.log('✅ Đã lưu cài đặt:', newSettings);
            
        } catch (error) {
            console.error('❌ Lỗi khi lưu cài đặt:', error);
            
            // Hiệu ứng lỗi
            saveBtn.innerHTML = '<span class="btn-icon">❌</span><span class="btn-text">Lỗi!</span>';
            saveBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            
            setTimeout(() => {
                saveBtn.innerHTML = '<span class="btn-icon">💾</span><span class="btn-text">Lưu cài đặt</span>';
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