class PopupManager {
    constructor() {
        this.settings = {
            salary: 8000000,
            salaryUnit: 'month',
            taxType: 'after',
            displayUnit: 'auto',
            enabled: true
        };
        
        this.init();
    }
    
    async init() {
        await this.loadSettings();
        this.setupEventListeners();
        this.updatePreview();
    }
    
    setupEventListeners() {
        // Lưu cài đặt
        document.getElementById('saveSettings').addEventListener('click', () => this.saveSettings());
        
        // Toggle extension
        document.getElementById('enableExtension').addEventListener('change', (e) => {
            this.toggleExtension(e.target.checked);
        });
        
        // Update preview khi thay đổi settings
        ['salaryInput', 'salaryUnit', 'taxType', 'displayUnit'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.updatePreview());
                element.addEventListener('input', () => this.updatePreview());
            }
        });
        
        // Format số khi nhập lương
        const salaryInput = document.getElementById('salaryInput');
        salaryInput.addEventListener('input', (e) => {
            const value = e.target.value.replace(/[^\d]/g, '');
            if (value) {
                const formatted = new Intl.NumberFormat('vi-VN').format(value);
                e.target.setAttribute('data-formatted', formatted);
            }
        });
    }
    
    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get({
                salary: 8000000,
                salaryUnit: 'month',
                taxType: 'after',
                displayUnit: 'auto',
                enabled: true
            });
            
            this.settings = result;
            
            // Cập nhật UI
            document.getElementById('salaryInput').value = result.salary;
            document.getElementById('salaryUnit').value = result.salaryUnit;
            document.getElementById('taxType').value = result.taxType;
            document.getElementById('displayUnit').value = result.displayUnit;
            document.getElementById('enableExtension').checked = result.enabled;
            
        } catch (error) {
            console.error('Lỗi khi tải cài đặt:', error);
            this.showNotification('Lỗi khi tải cài đặt', 'error');
        }
    }
    
    async saveSettings() {
        const salary = parseFloat(document.getElementById('salaryInput').value) || 8000000;
        const salaryUnit = document.getElementById('salaryUnit').value;
        const taxType = document.getElementById('taxType').value;
        const displayUnit = document.getElementById('displayUnit').value;
        const enabled = document.getElementById('enableExtension').checked;
        
        this.settings = { salary, salaryUnit, taxType, displayUnit, enabled };
        
        try {
            await chrome.storage.sync.set(this.settings);
            
            // Gửi tin nhắn tới content script
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
            if (tab && tab.id) {
                try {
                    await chrome.tabs.sendMessage(tab.id, {
                        action: 'updateSettings',
                        settings: this.settings
                    });
                } catch (tabError) {
                    console.log('Content script chưa sẵn sàng:', tabError.message);
                }
            }
            
            this.showNotification('Cài đặt đã được lưu!', 'success');
            this.updatePreview();
            
        } catch (error) {
            console.error('Lỗi khi lưu cài đặt:', error);
            this.showNotification('Lỗi khi lưu cài đặt', 'error');
        }
    }
    
    async toggleExtension(enabled) {
        this.settings.enabled = enabled;
        
        try {
            await chrome.storage.sync.set({enabled});
            
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
            if (tab && tab.id) {
                try {
                    await chrome.tabs.sendMessage(tab.id, {
                        action: 'toggleExtension',
                        enabled
                    });
                } catch (tabError) {
                    console.log('Content script chưa sẵn sàng:', tabError.message);
                }
            }
            
            this.showNotification(
                enabled ? 'Extension đã được bật' : 'Extension đã được tắt',
                'info'
            );
        } catch (error) {
            console.error('Lỗi khi toggle extension:', error);
        }
    }
    
    updatePreview() {
        const salary = parseFloat(document.getElementById('salaryInput').value) || this.settings.salary;
        const salaryUnit = document.getElementById('salaryUnit').value;
        const taxType = document.getElementById('taxType').value;
        const displayUnit = document.getElementById('displayUnit').value;
        
        // Preview 1: 499,000
        const samplePrice1 = 499000;
        const timeWorked1 = this.calculateTimeWorked(samplePrice1, salary, salaryUnit, taxType, displayUnit);
        
        // Preview 2: 2,500,000
        const samplePrice2 = 2500000;
        const timeWorked2 = this.calculateTimeWorked(samplePrice2, salary, salaryUnit, taxType, displayUnit);
        
        const previewElement1 = document.getElementById('previewTime');
        const previewElement2 = document.getElementById('previewTime2');
        
        if (previewElement1) previewElement1.textContent = `⏰ ${timeWorked1}`;
        if (previewElement2) previewElement2.textContent = `⏰ ${timeWorked2}`;
    }
    
    calculateTimeWorked(price, salary, salaryUnit, taxType, displayUnit) {
        let hourlyRate = salary;
        
        // Chuyển đổi về hourly rate
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
        
        // Điều chỉnh thuế
        if (taxType === 'before') {
            hourlyRate = hourlyRate * 0.85;
        }
        
        const hoursNeeded = price / hourlyRate;
        
        // Format theo displayUnit
        return this.formatTimeDisplay(hoursNeeded, displayUnit);
    }
    
    formatTimeDisplay(hoursNeeded, displayUnit) {
        if (displayUnit === 'hours') {
            if (hoursNeeded < 1) {
                return `${Math.round(hoursNeeded * 60)} phút`;
            }
            const hours = Math.round(hoursNeeded * 10) / 10;
            return `${hours} giờ`;
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
        
        // Auto mode - thông minh
        if (hoursNeeded < 1) {
            return `${Math.round(hoursNeeded * 60)} phút`;
        } else if (hoursNeeded < 8) {
            const hours = Math.floor(hoursNeeded);
            const minutes = Math.round((hoursNeeded - hours) * 60);
            return minutes > 0 ? `${hours}h ${minutes}p` : `${hours} giờ`;
        } else if (hoursNeeded < 176) {
            const days = Math.floor(hoursNeeded / 8);
            const remainingHours = Math.round(hoursNeeded % 8);
            return remainingHours > 0 ? `${days} ngày ${remainingHours}h` : `${days} ngày`;
        } else {
            const months = Math.floor(hoursNeeded / 176);
            const remainingDays = Math.round((hoursNeeded % 176) / 8);
            return remainingDays > 0 ? `${months} tháng ${remainingDays} ngày` : `${months} tháng`;
        }
    }
    
    showNotification(message, type = 'info') {
        const btn = document.getElementById('saveSettings');
        const originalContent = btn.innerHTML;
        
        let icon, color;
        switch (type) {
            case 'success':
                icon = '✅';
                color = '#10b981';
                break;
            case 'error':
                icon = '❌';
                color = '#ef4444';
                break;
            default:
                icon = 'ℹ️';
                color = '#3b82f6';
        }
        
        btn.innerHTML = `${icon} ${message}`;
        btn.style.background = color;
        btn.disabled = true;
        
        setTimeout(() => {
            btn.innerHTML = originalContent;
            btn.style.background = '';
            btn.disabled = false;
        }, 2000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PopupManager();
});