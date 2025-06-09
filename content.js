class VietnameseShoppingHelper {
    constructor() {
        this.settings = {
            salary: 8000000,
            salaryUnit: 'month',
            taxType: 'after',
            displayUnit: 'auto',
            enabled: true,
            disableBuyButtons: false
        };
        
        this.processedElements = new WeakSet();
        this.processedButtons = new WeakSet();
        this.disabledButtons = new WeakSet();
        this.confirmedButtons = new WeakSet(); // Thêm: theo dõi nút đã được confirm
        this.observer = null;
        this.isInitialized = false;
        this.debounceTimer = null;
        
        // Cải thiện hằng số thời gian theo yêu cầu
        this.timeConstants = {
            hoursPerDay: 8,      // 8 tiếng/ngày
            daysPerMonth: 30,    // 30 ngày/tháng  
            daysPerYear: 365,    // 365 ngày/năm
            hoursPerMonth: 240,  // 30 * 8 = 240 tiếng/tháng
            hoursPerYear: 2920   // 365 * 8 = 2920 tiếng/năm
        };
        
        // Hệ thống phân cấp dựa trên thời gian làm việc (ngày) - Mindful Buying với cảnh báo đầy đủ
        this.reminderLevels = {
            1: {
                range: [0, 1], // < 1 ngày
                emoji: ['💚', '✅', '😊'],
                level: 'An toàn',
                color: '#10b981',
                tooltipBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                reminders: [
                    "🌟 Đây là khoản chi tiêu hợp lý trong ngân sách. Bạn có thực sự cần và sẽ sử dụng món này thường xuyên không?",
                    "💡 Món này có thực sự mang lại giá trị lâu dài cho cuộc sống và công việc của bạn?",
                    "🔍 Bạn đã so sánh giá ở ít nhất 3 nơi khác nhau chưa? Có thể có nơi bán rẻ hơn.",
                    "⏰ Liệu bạn có thể đợi đến khi có chương trình khuyến mãi hoặc sale lớn hơn?",
                    "🛍️ Đây có phải là thứ bạn thực sự muốn hay chỉ đang trong cơn shopping therapy để giải tỏa stress?"
                ]
            },
            2: {
                range: [1, 3], // 1-3 ngày
                emoji: ['🟡', '⚠️', '🤔'],
                level: 'Cẩn thận',
                color: '#f59e0b',
                tooltipBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                reminders: [
                    "🔥 ĐÂY LÀ 1-3 NGÀY LÀM VIỆC CỦA BẠN! Liệu bạn có thể đợi thêm để tìm giá tốt hơn hoặc cân nhắc kỹ hơn?",
                    "🤔 Hãy tự hỏi thành thật: 'Tôi sẽ cảm thấy thế nào nếu không mua món này? Có thực sự ảnh hưởng đến cuộc sống?'",
                    "💭 Có phải bạn đang mua vì thực sự cần thiết hay chỉ vì muốn có cảm giác sở hữu thứ gì đó mới?",
                    "⏰ Bạn có thể thử áp dụng quy tắc 24 giờ - để đợi 1 ngày suy nghĩ rồi mới quyết định mua?",
                    "💸 Nếu lương của bạn giảm xuống còn một nửa ngày mai, bạn có vẫn quyết định mua món này không?"
                ]
            },
            3: {
                range: [3, 7], // 3-7 ngày (1 tuần)
                emoji: ['🔶', '😰', '⚡'],
                level: 'Cảnh báo nghiêm trọng',
                color: '#f97316',
                tooltipBg: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                reminders: [
                    "🚨 ĐÂY LÀ CẢ MỘT TUẦN LÀM VIỆC CỦA BẠN! Bạn có hoàn toàn chắc chắn đây là ưu tiên hàng đầu trong cuộc sống?",
                    "💭 Thử nghĩ xem: 'Sau 1 năm nữa, tôi có còn nhớ đến việc mua món này? Nó có còn quan trọng?'",
                    "🎯 Có những mục tiêu tài chính nào quan trọng hơn đang chờ đợi (mua nhà, du lịch, học tập, đầu tư)?",
                    "💰 Bạn có thể làm gì khác có ích hơn với số tiền này để đầu tư cho tương lai và phát triển bản thân?"
                ]
            },
            4: {
                range: [7, 30], // 1 tuần - 1 tháng
                emoji: ['🔴', '😱', '🚨'],
                level: 'NGUY HIỂM - Cần suy nghĩ rất kỹ',
                color: '#ef4444',
                tooltipBg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                reminders: [
                    "🚨 CẢNH BÁO ĐỎ: Đây là từ 1 tuần đến 1 tháng lương của bạn! Bạn đã có quỹ khẩn cấp đủ 3-6 tháng chi tiêu chưa?",
                    "💥 Liệu món này có thực sự thay đổi căn bản chất lượng cuộc sống, công việc hay sức khỏe của bạn?",
                    "😴 Hãy ngủ ít nhất một đêm và tham khảo ý kiến của ít nhất 2-3 người thân tin cậy trước khi quyết định!",
                    "💼 Nếu bạn bất ngờ mất việc vào ngày mai, món này có giúp bạn tìm được việc mới nhanh hơn không?"
                ]
            },
            5: {
                range: [30, Infinity], // > 1 tháng
                emoji: ['💥', '🚨', '⛔', '🛑'],
                level: 'CỰC KỲ NGUY HIỂM - Cần kế hoạch chi tiết',
                color: '#dc2626',
                tooltipBg: 'linear-gradient(135deg, #dc2626 0%, #991b1b 50%, #7f1d1d 100%)',
                reminders: [
                    "🚨 CẢNH BÁO ĐỎ TỐI ĐA: Đây là hơn 1 tháng lương! Bạn có kế hoạch tài chính chi tiết và dài hạn không?",
                    "💡 Món này có thực sự là điều cần thiết cho sự nghiệp, sức khỏe hay hạnh phúc lâu dài của bạn?",
                    "📈 Bạn đã tính toán cụ thể tác động đến mục tiêu tiết kiệm, đầu tư và kế hoạch nghỉ hưu chưa?",
                    "🚨 DỪNG LẠI NGAY BÂY GIỜ! Đây là số tiền KHỔNG LỒ có thể thay đổi tương lai tài chính - hãy suy nghĩ ít nhất 1 tuần!"
                ]
            }
        };
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Vietnamese Shopping Helper v1.6.2 - Khởi động với cảnh báo 1 lần...');
        
        try {
            await this.loadSettings();
            this.setupMessageListener();
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.startProcessing());
            } else {
                this.startProcessing();
            }
            
            this.isInitialized = true;
            console.log('✅ Extension đã khởi động thành công');
        } catch (error) {
            console.error('❌ Lỗi khởi động extension:', error);
        }
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
            console.log('📋 Đã tải cài đặt:', this.settings);
        } catch (error) {
            console.error('❌ Lỗi khi tải cài đặt:', error);
        }
    }
    
    setupMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            console.log('📨 Nhận tin nhắn:', request);
            
            if (request.action === 'updateSettings') {
                this.settings = request.settings;
                this.refreshAllPrices();
                this.refreshBuyButtonStatus();
                sendResponse({status: 'updated'});
            } else if (request.action === 'toggleExtension') {
                this.settings.enabled = request.enabled;
                if (request.enabled) {
                    this.refreshAllPrices();
                    this.refreshBuyButtonStatus();
                } else {
                    this.removeAllTimeDisplays();
                    this.enableAllBuyButtons();
                    this.removeAllFunnyMessages();
                }
                sendResponse({status: 'toggled'});
            }
        });
    }
    
    startProcessing() {
        if (!this.settings.enabled) {
            console.log('⏸️ Extension đã tắt');
            return;
        }
        
        console.log('🔍 Bắt đầu xử lý...');
        
        // Xử lý giá với nhiều lần thử
        this.processAllPrices();
        setTimeout(() => this.processAllPrices(), 2000);
        setTimeout(() => this.processAllPrices(), 5000);
        
        // Thiết lập xử lý nút mua hàng
        this.refreshBuyButtonStatus();
        setTimeout(() => this.refreshBuyButtonStatus(), 3000);
        
        // Theo dõi thay đổi DOM
        this.setupObserver();
    }
    
    refreshBuyButtonStatus() {
        if (this.settings.disableBuyButtons) {
            this.disableAllBuyButtons();
        } else {
            this.enableAllBuyButtons();
            this.setupBuyButtonWarnings();
        }
    }
    
    disableAllBuyButtons() {
        console.log('🛡️ Vô hiệu hóa tất cả nút mua hàng và hiển thị thông báo cải thiện...');
        
        let disabledCount = 0;
        const buyButtonTexts = ['mua ngay', 'buy now', 'mua với voucher', 'thêm vào giỏ', 'add to cart'];
        const allButtons = document.querySelectorAll('button, a[role="button"], [role="button"]');
        
        allButtons.forEach(button => {
            const text = button.textContent.toLowerCase().trim();
            const isBuyButton = buyButtonTexts.some(buyText => text.includes(buyText));
            
            if (isBuyButton && !this.disabledButtons.has(button)) {
                this.disableBuyButton(button);
                this.addFunnyMessageNextToButton(button);
                this.disabledButtons.add(button);
                disabledCount++;
            }
        });
        
        console.log(`🛡️ Đã vô hiệu hóa ${disabledCount} nút mua hàng`);
    }
    
    addFunnyMessageNextToButton(button) {
        // Kiểm tra xem đã có thông báo chưa
        if (button.parentElement?.querySelector('.vn-funny-message-side')) {
            return;
        }
        
        const messageBox = document.createElement('div');
        messageBox.className = 'vn-funny-message-side';
        messageBox.style.cssText = `
            position: absolute;
            top: 50%;
            left: calc(100% + 5px);
            transform: translateY(-50%);
            background: #dc2626;
            color: white;
            padding: 10px 16px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 700;
            white-space: nowrap;
            z-index: 1000;
            box-shadow: 0 3px 12px rgba(220, 38, 38, 0.5);
            border: 2px solid rgba(255, 255, 255, 0.3);
            max-width: 350px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            animation: funnyMessageSlideIn 0.5s ease-out;
            pointer-events: none;
            letter-spacing: 0.3px;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        `;
        
        messageBox.textContent = "Xách đuýt lên mà kiếm tiền đi, mua mua cái gì 🙄";
        
        // Đảm bảo button container có position relative
        const container = button.closest('div, section, article') || button.parentElement;
        if (container && getComputedStyle(container).position === 'static') {
            container.style.position = 'relative';
        }
        
        // Thêm CSS animation cải thiện nếu chưa có
        if (!document.querySelector('#vn-side-message-animations')) {
            const style = document.createElement('style');
            style.id = 'vn-side-message-animations';
            style.textContent = `
                @keyframes funnyMessageSlideIn {
                    0% { 
                        opacity: 0; 
                        transform: translateY(-50%) translateX(-15px) scale(0.9); 
                    }
                    100% { 
                        opacity: 1; 
                        transform: translateY(-50%) translateX(0) scale(1); 
                    }
                }
                @keyframes funnyMessageSlideOut {
                    0% { 
                        opacity: 1; 
                        transform: translateY(-50%) translateX(0) scale(1); 
                    }
                    100% { 
                        opacity: 0; 
                        transform: translateY(-50%) translateX(-15px) scale(0.9); 
                    }
                }
                .vn-funny-message-side:hover {
                    transform: translateY(-50%) scale(1.05) !important;
                    box-shadow: 0 5px 15px rgba(220, 38, 38, 0.7) !important;
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
                }
                
                /* Responsive positioning - gần hơn và to hơn */
                @media (max-width: 768px) {
                    .vn-funny-message-side {
                        position: fixed !important;
                        top: 15px !important;
                        left: 50% !important;
                        transform: translateX(-50%) !important;
                        max-width: 95vw !important;
                        font-size: 13px !important;
                        padding: 8px 14px !important;
                        z-index: 999999 !important;
                        border-radius: 8px !important;
                    }
                }
                
                /* Animation cho mobile */
                @media (max-width: 768px) {
                    @keyframes funnyMessageSlideIn {
                        0% { 
                            opacity: 0; 
                            transform: translateX(-50%) translateY(-20px) scale(0.9); 
                        }
                        100% { 
                            opacity: 1; 
                            transform: translateX(-50%) translateY(0) scale(1); 
                        }
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Thêm vào container thay vì button
        try {
            container.appendChild(messageBox);
            
            // Điều chỉnh vị trí nếu bị tràn màn hình
            setTimeout(() => {
                const rect = messageBox.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                
                if (rect.right > viewportWidth - 10) {
                    // Hiển thị bên trái nếu bị tràn - gần hơn
                    messageBox.style.left = 'auto';
                    messageBox.style.right = 'calc(100% + 5px)';
                }
                
                // Trên mobile, hiển thị fixed position
                if (window.innerWidth <= 768) {
                    messageBox.style.position = 'fixed';
                    messageBox.style.top = '15px';
                    messageBox.style.left = '50%';
                    messageBox.style.transform = 'translateX(-50%)';
                    messageBox.style.zIndex = '999999';
                }
            }, 100);
            
        } catch (error) {
            console.warn('❌ Không thể thêm thông báo bên cạnh nút:', error);
        }
    }
    
    removeAllFunnyMessages() {
        const funnyMessages = document.querySelectorAll('.vn-funny-message-side');
        funnyMessages.forEach(message => {
            message.style.animation = 'funnyMessageSlideOut 0.3s ease-out';
            setTimeout(() => message.remove(), 300);
        });
        console.log(`🗑️ Đã xóa ${funnyMessages.length} thông báo hài hước`);
    }
    
    disableBuyButton(button) {
        if (!button.dataset.vnOriginalDisabled) {
            button.dataset.vnOriginalDisabled = button.disabled || 'false';
            button.dataset.vnOriginalStyle = button.style.cssText || '';
            button.dataset.vnOriginalTitle = button.title || '';
        }
        
        button.disabled = true;
        button.style.opacity = '0.4';
        button.style.cursor = 'not-allowed';
        button.style.pointerEvents = 'none';
        button.style.filter = 'grayscale(100%)';
        button.title = "🛡️ Xách đuýt lên mà kiếm tiền đi, mua mua cái gì 🙄";
        button.classList.add('vn-disabled-button');
        
        const clickHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            this.showFunnyDisabledMessage();
            return false;
        };
        
        button.addEventListener('click', clickHandler, { capture: true });
    }
    
    showFunnyDisabledMessage() {
        const message = "Xách đuýt lên mà kiếm tiền đi, mua mua cái gì 🙄";
        alert(`🛡️ BẢO VỆ TÀI CHÍNH\n\n${message}`);
    }
    
    enableAllBuyButtons() {
        console.log('🔓 Bật lại tất cả nút mua hàng và reset cảnh báo...');
        
        const disabledButtons = document.querySelectorAll('.vn-disabled-button');
        disabledButtons.forEach(button => {
            this.enableBuyButton(button);
        });
        
        this.removeAllFunnyMessages();
        this.disabledButtons = new WeakSet();
        
        // Reset trạng thái cảnh báo khi enable lại
        this.confirmedButtons = new WeakSet();
        this.processedButtons = new WeakSet();
        
        console.log(`🔓 Đã bật lại ${disabledButtons.length} nút mua hàng và reset cảnh báo`);
    }
    
    enableBuyButton(button) {
        if (button.dataset.vnOriginalDisabled !== undefined) {
            button.disabled = button.dataset.vnOriginalDisabled === 'true';
            button.style.cssText = button.dataset.vnOriginalStyle || '';
            button.title = button.dataset.vnOriginalTitle || '';
            
            delete button.dataset.vnOriginalDisabled;
            delete button.dataset.vnOriginalStyle;
            delete button.dataset.vnOriginalTitle;
        }
        
        button.classList.remove('vn-disabled-button');
    }
    
    setupObserver() {
        if (this.observer) {
            this.observer.disconnect();
        }
        
        this.observer = new MutationObserver((mutations) => {
            if (!this.settings.enabled) return;
            
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.processAllPrices();
                this.refreshBuyButtonStatus();
            }, 1500);
        });
        
        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('👀 Đã thiết lập observer');
    }
    
    setupBuyButtonWarnings() {
        if (this.settings.disableBuyButtons) return;
        
        console.log('🛒 Thiết lập cảnh báo 1 lần cho nút mua hàng...');
        
        const buyButtonTexts = ['mua ngay', 'buy now', 'mua với voucher', 'thêm vào giỏ', 'add to cart'];
        const allButtons = document.querySelectorAll('button, a[role="button"], [role="button"]');
        
        allButtons.forEach(button => {
            const text = button.textContent.toLowerCase().trim();
            const isBuyButton = buyButtonTexts.some(buyText => text.includes(buyText));
            
            if (isBuyButton && !this.processedButtons.has(button) && !button.classList.contains('vn-disabled-button')) {
                this.addBuyButtonWarning(button);
                this.processedButtons.add(button);
            }
        });
    }
    
    addBuyButtonWarning(button) {
        console.log('🔔 Thêm cảnh báo 1 lần cho nút:', button.textContent?.trim());
        
        const originalHandler = async (event) => {
            // Kiểm tra xem nút này đã được confirm chưa
            if (this.confirmedButtons.has(button)) {
                console.log('✅ Nút đã được confirm trước đó, cho phép hoạt động bình thường');
                return true; // Cho phép tiếp tục mà không cảnh báo
            }
            
            console.log('🛒 Nút mua hàng được nhấn lần đầu, kiểm tra cảnh báo...');
            
            const price = this.findNearestPrice(button);
            console.log('💰 Giá tìm thấy:', price);
            
            if (price && price > 1000) {
                const dailyRate = this.calculateDailyRate();
                const daysNeeded = price / dailyRate;
                
                console.log('📊 Số ngày cần làm việc:', daysNeeded);
                
                if (daysNeeded >= 0.3) { // Threshold cho mindful buying
                    // Ngăn chặn action mặc định để hiển thị cảnh báo
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    
                    const reminderData = this.getReminderData(daysNeeded);
                    const shouldContinue = await this.showBuyWarning(price, daysNeeded, reminderData);
                    
                    if (shouldContinue) {
                        console.log('✅ Người dùng chọn tiếp tục mua, đánh dấu nút đã confirm');
                        // Đánh dấu nút này đã được confirm
                        this.confirmedButtons.add(button);
                        
                        // Thực hiện lại click sau khi confirm
                        setTimeout(() => {
                            console.log('🔄 Thực hiện lại click sau khi confirm...');
                            button.click();
                        }, 100);
                    } else {
                        console.log('❌ Người dùng chọn không mua, hủy bỏ action');
                    }
                    
                    return false;
                }
            }
            
            return true;
        };
        
        button.addEventListener('click', originalHandler, true);
        button.setAttribute('data-vn-warning-added', 'true');
    }
    
    showBuyWarning(price, daysNeeded, reminderData) {
        return new Promise((resolve) => {
            const timeWorked = this.formatTimeDisplay(daysNeeded * this.timeConstants.hoursPerDay);
            const formattedPrice = new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(price);
            
            let message = `${reminderData.emoji} MUA SẮM CÓ Ý THỨC\n\n`;
            message += `💰 Giá sản phẩm: ${formattedPrice}\n`;
            message += `⏰ Thời gian làm việc: ${timeWorked}\n`;
            message += `📊 Mức độ: ${reminderData.levelName}\n\n`;
            
            if (reminderData.reminder) {
                message += `🧠 ${reminderData.reminder}\n\n`;
            }
            
            message += `🤔 Hãy dành vài giây tự hỏi:\n`;
            message += `• Tôi có thực sự cần món này không?\n`;
            message += `• Có lựa chọn nào tốt hơn không?\n`;
            message += `• Món này có đáng số thời gian làm việc này?\n\n`;
            message += `❓ Bạn có muốn tiếp tục mua không?\n`;
            message += `(Lưu ý: Nếu chọn "OK", lần sau bấm nút này sẽ không có cảnh báo nữa)`;
            
            const result = confirm(message);
            console.log('🤔 Quyết định mindful buying:', result ? 'Tiếp tục mua (1 lần)' : 'Hủy bỏ');
            
            if (result) {
                console.log('💚 Người dùng đã cân nhắc và quyết định mua. Nút sẽ hoạt động bình thường từ giờ.');
            } else {
                console.log('💚 Mindful buying thành công! Đã ngăn chặn một lần mua sắm bốc đồng.');
            }
            
            resolve(result);
        });
    }
    
    findNearestPrice(button) {
        const containers = [
            button.closest('[class*="product"]'),
            button.closest('[class*="item"]'),
            button.closest('div'),
            button.parentElement,
            document
        ].filter(Boolean);
        
        for (const container of containers) {
            const timeDisplay = container.querySelector('.vn-price-time-container');
            if (timeDisplay && timeDisplay.dataset.price) {
                return parseFloat(timeDisplay.dataset.price);
            }
            
            const configs = this.getSiteConfigs();
            for (const config of configs) {
                const priceElement = container.querySelector(config.currentPriceSelector);
                if (priceElement) {
                    const price = this.extractPrice(priceElement.textContent, config);
                    if (price && price > 1000) {
                        return price;
                    }
                }
            }
        }
        
        return null;
    }
    
    calculateDailyRate() {
        let dailyRate = this.settings.salary;
        
        switch (this.settings.salaryUnit) {
            case 'year':
                dailyRate = this.settings.salary / this.timeConstants.daysPerYear;
                break;
            case 'month':
                dailyRate = this.settings.salary / this.timeConstants.daysPerMonth;
                break;
            case 'hour':
                dailyRate = this.settings.salary * this.timeConstants.hoursPerDay;
                break;
            case 'day':
            default:
                dailyRate = this.settings.salary;
                break;
        }
        
        if (this.settings.taxType === 'before') {
            dailyRate = dailyRate * 0.85;
        }
        
        return dailyRate;
    }
    
    calculateHourlyRate() {
        let hourlyRate = this.settings.salary;
        
        switch (this.settings.salaryUnit) {
            case 'year':
                hourlyRate = this.settings.salary / this.timeConstants.hoursPerYear;
                break;
            case 'month':
                hourlyRate = this.settings.salary / this.timeConstants.hoursPerMonth;
                break;
            case 'day':
                hourlyRate = this.settings.salary / this.timeConstants.hoursPerDay;
                break;
            case 'hour':
                hourlyRate = this.settings.salary;
                break;
        }
        
        if (this.settings.taxType === 'before') {
            hourlyRate = hourlyRate * 0.85;
        }
        
        return hourlyRate;
    }
    
    getReminderData(daysNeeded) {
        for (const [level, data] of Object.entries(this.reminderLevels)) {
            const [min, max] = data.range;
            if (daysNeeded >= min && daysNeeded <= max) {
                const randomEmoji = data.emoji[Math.floor(Math.random() * data.emoji.length)];
                const randomReminder = data.reminders.length > 0 ? 
                    data.reminders[Math.floor(Math.random() * data.reminders.length)] : null;
                
                return {
                    level: parseInt(level),
                    levelName: data.level,
                    emoji: randomEmoji,
                    reminder: randomReminder,
                    color: data.color,
                    tooltipBg: data.tooltipBg
                };
            }
        }
        
        return {
            level: 1,
            levelName: 'An toàn',
            emoji: '💚',
            reminder: null,
            color: '#10b981',
            tooltipBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        };
    }
    
    getSiteConfigs() {
        const hostname = window.location.hostname.toLowerCase();
        
        if (hostname.includes('shopee.vn')) {
            return [{
                name: 'Shopee',
                currentPriceSelector: '.IZPeQz:not(.ZA5sW5)',
                excludeSelectors: ['.ZA5sW5'],
                priceRegex: /₫([\d.,\s]+)/
            }];
        }
        
        if (hostname.includes('lazada.vn')) {
            return [{
                name: 'Lazada',
                currentPriceSelector: '.pdp-price_color_orange',
                excludeSelectors: ['.pdp-price_type_deleted'],
                priceRegex: /₫\s*([\d.,\s]+)/
            }];
        }
        
        return [{
            name: 'Generic',
            currentPriceSelector: '[class*="price"]:not([class*="old"])',
            excludeSelectors: ['.price.old', '[class*="old"]'],
            priceRegex: /₫?\s*([\d.,\s]+)/
        }];
    }
    
    processAllPrices() {
        let processedCount = 0;
        const configs = this.getSiteConfigs();
        
        configs.forEach(config => {
            try {
                const elements = document.querySelectorAll(config.currentPriceSelector);
                
                elements.forEach(element => {
                    if (this.processPriceElement(element, config)) {
                        processedCount++;
                    }
                });
            } catch (error) {
                console.warn(`⚠️ Lỗi với config "${config.name}":`, error);
            }
        });
        
        if (processedCount > 0) {
            console.log(`💰 Đã xử lý ${processedCount} giá với công thức thời gian cải thiện`);
        }
    }
    
    processPriceElement(element, config) {
        if (this.processedElements.has(element)) return false;
        if (this.hasTimeDisplay(element)) return false;
        if (this.isExcludedElement(element, config)) return false;
        
        const priceText = element.textContent;
        const price = this.extractPrice(priceText, config);
        
        if (price && price > 1000) {
            this.processedElements.add(element);
            this.addTimeDisplay(element, price);
            return true;
        }
        
        return false;
    }
    
    hasTimeDisplay(element) {
        return element.nextElementSibling?.classList.contains('vn-price-time-container') ||
               element.parentElement?.querySelector('.vn-price-time-container');
    }
    
    isExcludedElement(element, config) {
        const className = element.className || '';
        
        for (const excludeSelector of config.excludeSelectors) {
            try {
                if (element.matches(excludeSelector)) {
                    return true;
                }
            } catch (e) {
                // Ignore selector errors
            }
        }
        
        const style = window.getComputedStyle(element);
        if (style.textDecoration.includes('line-through')) {
            return true;
        }
        
        const oldPriceIndicators = ['old', 'before', 'strike', 'deleted'];
        for (const indicator of oldPriceIndicators) {
            if (className.toLowerCase().includes(indicator)) {
                return true;
            }
        }
        
        return false;
    }
    
    extractPrice(text, config) {
        if (!text || typeof text !== 'string') return null;
        
        let match;
        if (config.priceRegex) {
            match = text.match(config.priceRegex);
            if (match && match[1]) {
                text = match[1];
            }
        }
        
        const cleanText = text.replace(/[^\d.,\s]/g, '');
        if (!cleanText) return null;
        
        let price = cleanText.replace(/\s/g, '');
        
        if (price.includes(',') && price.includes('.')) {
            const lastComma = price.lastIndexOf(',');
            const lastDot = price.lastIndexOf('.');
            
            if (lastComma > lastDot) {
                price = price.replace(/\./g, '').replace(',', '.');
            } else {
                price = price.replace(/,/g, '');
            }
        } else if (price.includes(',')) {
            const parts = price.split(',');
            if (parts.length === 2 && parts[1].length <= 2) {
                price = price.replace(',', '.');
            } else {
                price = price.replace(/,/g, '');
            }
        } else if (price.includes('.')) {
            const parts = price.split('.');
            if (parts.length > 2 || (parts.length === 2 && parts[1].length > 2)) {
                price = price.replace(/\./g, '');
            }
        }
        
        const numPrice = parseFloat(price);
        return (numPrice >= 1000 && numPrice <= 1000000000) ? numPrice : null;
    }
    
    addTimeDisplay(element, price) {
        const dailyRate = this.calculateDailyRate();
        const daysNeeded = price / dailyRate;
        
        const hourlyRate = this.calculateHourlyRate();
        const hoursNeeded = price / hourlyRate;
        
        const timeWorked = this.formatTimeDisplay(hoursNeeded);
        const reminderData = this.getReminderData(daysNeeded);
        
        const timeDisplay = this.createTimeDisplay(timeWorked, reminderData, price);
        
        try {
            element.parentElement.insertBefore(timeDisplay, element.nextSibling);
            console.log('✅ Đã thêm time display:', timeWorked, 'cho giá:', price.toLocaleString('vi-VN'), 'VNĐ');
        } catch (error) {
            console.warn('❌ Lỗi khi thêm time display:', error);
        }
    }
    
    formatTimeDisplay(hoursNeeded) {
        const displayUnit = this.settings.displayUnit;
        
        if (displayUnit === 'hours') {
            if (hoursNeeded < 1) {
                return `${Math.round(hoursNeeded * 60)}p`;
            }
            const hours = Math.round(hoursNeeded * 10) / 10;
            return `${hours}h`;
        }
        
        if (displayUnit === 'days') {
            const days = Math.round((hoursNeeded / this.timeConstants.hoursPerDay) * 10) / 10;
            return `${days} ngày`;
        }
        
        if (displayUnit === 'months') {
            const months = Math.round((hoursNeeded / this.timeConstants.hoursPerMonth) * 10) / 10;
            return `${months} tháng`;
        }
        
        if (displayUnit === 'years') {
            const years = Math.round((hoursNeeded / this.timeConstants.hoursPerYear) * 100) / 100;
            return `${years} năm`;
        }
        
        // Auto mode - sử dụng hằng số thời gian cải thiện
        if (hoursNeeded < 1) {
            return `${Math.round(hoursNeeded * 60)}p`;
        } else if (hoursNeeded < this.timeConstants.hoursPerDay) {
            const hours = Math.floor(hoursNeeded);
            const minutes = Math.round((hoursNeeded - hours) * 60);
            return minutes > 0 ? `${hours}h${minutes}p` : `${hours}h`;
        } else if (hoursNeeded < this.timeConstants.hoursPerMonth) {
            const days = Math.floor(hoursNeeded / this.timeConstants.hoursPerDay);
            const remainingHours = Math.round(hoursNeeded % this.timeConstants.hoursPerDay);
            return remainingHours > 0 ? `${days}d${remainingHours}h` : `${days}d`;
        } else if (hoursNeeded < this.timeConstants.hoursPerYear) {
            const months = Math.floor(hoursNeeded / this.timeConstants.hoursPerMonth);
            const remainingDays = Math.round((hoursNeeded % this.timeConstants.hoursPerMonth) / this.timeConstants.hoursPerDay);
            return remainingDays > 0 ? `${months}th${remainingDays}d` : `${months}th`;
        } else {
            const years = Math.floor(hoursNeeded / this.timeConstants.hoursPerYear);
            const remainingMonths = Math.round((hoursNeeded % this.timeConstants.hoursPerYear) / this.timeConstants.hoursPerMonth);
            return remainingMonths > 0 ? `${years}y${remainingMonths}th` : `${years}y`;
        }
    }
    
    createTimeDisplay(timeWorked, reminderData, price) {
        const container = document.createElement('div');
        container.className = 'vn-price-time-container';
        container.dataset.price = price;
        
        const timeDisplay = document.createElement('div');
        timeDisplay.className = `vn-price-time vn-level-${reminderData.level}`;
        timeDisplay.innerHTML = `
            <span class="vn-emoji">${reminderData.emoji}</span>
            <span class="vn-time">⏰ ${timeWorked}</span>
        `;
        
        // Thêm tooltip với màu sắc theo level
        if (reminderData.reminder) {
            const tooltip = document.createElement('div');
            tooltip.className = 'vn-tooltip';
            tooltip.style.background = reminderData.tooltipBg;
            tooltip.style.borderColor = `${reminderData.color}44`; // 44 = 27% opacity
            tooltip.innerHTML = `
                <div style="font-weight: 700; margin-bottom: 8px; color: #ffffff;">
                    ${reminderData.emoji} ${reminderData.levelName.toUpperCase()}
                </div>
                <div style="margin-bottom: 8px; color: #f8fafc;">
                    <strong>💰 Giá:</strong> ${price.toLocaleString('vi-VN')}₫<br>
                    <strong>⏰ Thời gian:</strong> ${timeWorked}
                </div>
                <div style="font-size: 13px; line-height: 1.5; color: #e2e8f0;">
                    ${reminderData.reminder}
                </div>
            `;
            container.appendChild(tooltip);
        }
        
        container.appendChild(timeDisplay);
        
        // Event listeners cho tooltip
        if (reminderData.reminder) {
            let hoverTimeout;
            
            timeDisplay.addEventListener('mouseenter', () => {
                clearTimeout(hoverTimeout);
                const tooltip = container.querySelector('.vn-tooltip');
                if (tooltip) {
                    const rect = timeDisplay.getBoundingClientRect();
                    const left = rect.right + 30;
                    const top = rect.top - 20;
                    
                    tooltip.style.left = left + 'px';
                    tooltip.style.top = top + 'px';
                    tooltip.classList.add('show');
                }
            });
            
            timeDisplay.addEventListener('mouseleave', () => {
                hoverTimeout = setTimeout(() => {
                    const tooltip = container.querySelector('.vn-tooltip');
                    if (tooltip) {
                        tooltip.classList.remove('show');
                    }
                }, 300);
            });
        }
        
        return container;
    }
    
    refreshAllPrices() {
        console.log('🔄 Làm mới tất cả giá với công thức thời gian cải thiện...');
        this.removeAllTimeDisplays();
        this.processedElements = new WeakSet();
        setTimeout(() => this.processAllPrices(), 500);
    }
    
    removeAllTimeDisplays() {
        const timeDisplays = document.querySelectorAll('.vn-price-time-container');
        timeDisplays.forEach(display => display.remove());
        console.log(`🗑️ Đã xóa ${timeDisplays.length} time displays`);
    }
}

// Khởi động extension
console.log('🔌 Vietnamese Shopping Helper v1.6.2 - Content Script loading với cảnh báo 1 lần...');

if (!window.vnShoppingHelperInitialized) {
    window.vnShoppingHelperInitialized = true;
    
    try {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                new VietnameseShoppingHelper();
            });
        } else {
            new VietnameseShoppingHelper();
        }
    } catch (error) {
        console.error('❌ Lỗi khởi động Vietnamese Shopping Helper:', error);
    }
}