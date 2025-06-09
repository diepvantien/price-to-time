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
        this.observer = null;
        this.isInitialized = false;
        this.debounceTimer = null;
        
        // Hệ thống phân cấp dựa trên thời gian làm việc (ngày) - Mindful Buying
        this.reminderLevels = {
            1: {
                range: [0, 1], // < 1 ngày
                emoji: ['💚', '✅', '😊'],
                level: 'An toàn',
                color: '#10b981',
                reminders: [
                    "Đây là khoản chi tiêu hợp lý. Bạn có thực sự cần và sẽ sử dụng nó không?",
                    "Món này có thực sự mang lại giá trị cho cuộc sống của bạn?",
                    "Bạn đã so sánh giá ở những nơi khác chưa?",
                    "Liệu bạn có thể đợi đến khi có khuyến mãi tốt hơn?"
                ]
            },
            2: {
                range: [1, 3], // 1-3 ngày
                emoji: ['🟡', '⚠️', '🤔'],
                level: 'Cẩn thận',
                color: '#f59e0b',
                reminders: [
                    "Đây là 1-3 ngày làm việc. Liệu bạn có thể đợi thêm để tìm giá tốt hơn?",
                    "Hãy tự hỏi: 'Tôi sẽ cảm thấy thế nào nếu không mua món này?'",
                    "Có phải bạn đang mua vì cần thiết hay chỉ vì muốn?",
                    "Bạn có thể thử quy tắc 24 giờ - đợi 1 ngày rồi quyết định?",
                    "Nếu lương của bạn giảm xuống còn một nửa, bạn có vẫn mua không?",
                    "Món này có giải quyết được vấn đề thực tế nào của bạn?"
                ]
            },
            3: {
                range: [3, 7], // 3-7 ngày (1 tuần)
                emoji: ['🔶', '😰', '⚡'],
                level: 'Cảnh báo',
                color: '#f97316',
                reminders: [
                    "Đây là cả tuần làm việc! Bạn có chắc đây là ưu tiên hàng đầu?",
                    "Thử nghĩ xem: 'Sau 1 năm, tôi có nhớ đến việc mua món này không?'",
                    "Có những mục tiêu tài chính nào quan trọng hơn đang chờ đợi?",
                    "Bạn có thể làm gì khác với số tiền này để đầu tư cho tương lai?",
                    "Hãy liệt kê 3 lý do thực sự cần mua và 3 lý do không nên mua.",
                    "Bạn có thể thuê, mượn hoặc tìm thay thế rẻ hơn không?",
                    "Số tiền này có thể giúp bạn học một kỹ năng mới thay vì mua đồ?"
                ]
            },
            4: {
                range: [7, 30], // 1 tuần - 1 tháng
                emoji: ['🔴', '😱', '🚨'],
                level: 'Nguy hiểm',
                color: '#ef4444',
                reminders: [
                    "Đây là từ 1 tuần đến 1 tháng lương! Bạn có emergency fund chưa?",
                    "Liệu món này có thay đổi căn bản chất lượng cuộc sống của bạn?",
                    "Hãy ngủ một đêm và tham khảo ý kiến người thân trước khi quyết định.",
                    "Nếu bạn mất việc ngày mai, món này có giúp bạn tìm việc mới không?",
                    "Có thể thuê, mượn, hoặc mua cũ thay vì mua mới không?",
                    "Bạn đã tính toán tổng chi phí sở hữu (bảo trì, bảo hiểm, lưu trữ)?",
                    "Món này có thực sự tăng thu nhập hoặc tiết kiệm chi phí trong tương lai?",
                    "Bạn có sẵn sàng làm thêm giờ để bù lại số tiền này không?"
                ]
            },
            5: {
                range: [30, Infinity], // > 1 tháng
                emoji: ['💥', '🚨', '⛔', '🛑'],
                level: 'Rất nguy hiểm',
                color: '#dc2626',
                reminders: [
                    "CẢNH BÁO: Đây là hơn 1 tháng lương! Bạn có kế hoạch tài chính dài hạn không?",
                    "Món này có thực sự cần thiết cho sự nghiệp hay cuộc sống của bạn?",
                    "Bạn đã tính toán tác động đến mục tiêu tiết kiệm và đầu tư chưa?",
                    "Có những cách nào khác để đạt được mục đích mà không cần chi số tiền này?",
                    "Hãy viết ra kế hoạch chi tiết tại sao món này xứng đáng với hơn 1 tháng lương.",
                    "Bạn có sẵn sàng làm thêm giờ 1 tháng để có tiền mua món này không?",
                    "Nếu bạn đầu tư số tiền này, sau 10 năm nó sẽ trở thành bao nhiều?",
                    "Đây có phải là quyết định mà bạn sẽ tự hào sau 5 năm nữa?",
                    "Bạn đã cân nhắc tất cả các lựa chọn thay thế chưa?"
                ]
            }
        };
        
        // Updated selectors based on actual website code
        this.buyButtonSelectors = [
            // Shopee - Updated based on actual code
            'button.btn.btn-solid-primary',
            'button.btn.btn-tinted',
            'button[aria-disabled="false"]:contains("Mua")',
            'button[aria-disabled="false"]:contains("voucher")',
            'button[aria-disabled="false"]:contains("giỏ hàng")',
            'button[aria-disabled="false"]:contains("Add to cart")',
            'button.YuENex.eFAm_w',
            'button.YuENex.a_JvBi',
            
            // Generic patterns cho "Mua ngay"
            'button:contains("Mua ngay")',
            'button:contains("Buy now")',
            'button:contains("MUA NGAY")',
            'button:contains("BUY NOW")',
            'button:contains("Mua với voucher")',
            'a:contains("Mua ngay")',
            'a:contains("Buy now")',
            '[role="button"]:contains("Mua ngay")',
            '[role="button"]:contains("Buy now")',
            
            // Generic patterns cho "Thêm vào giỏ"
            'button:contains("Thêm vào giỏ")',
            'button:contains("Add to cart")',
            'button:contains("THÊM VÀO GIỎ")',
            'button:contains("ADD TO CART")',
            'button:contains("thêm vào giỏ hàng")',
            'a:contains("Thêm vào giỏ")',
            'a:contains("Add to cart")',
            '[role="button"]:contains("Thêm vào giỏ")',
            '[role="button"]:contains("Add to cart")',
            
            // Lazada
            '.add-to-cart-buy-now-btn',
            '.buyNow',
            '.pdp-mod-product-info-section .next-btn-primary',
            'button[class*="add-to-cart"]',
            'button[class*="cart"]',
            
            // TGDD/DMX
            '.btn-buy-now',
            '.btnbuy',
            '.btn-red',
            'a[class*="btn"][class*="red"]',
            '.btn-add-cart',
            'button[class*="btn-buy"]',
            
            // Tiki
            'button[data-view-id*="buy_now"]',
            '.btn-buy',
            'button[class*="btn-large"]',
            'button[class*="add_to_cart"]',
            'button[class*="btn-primary"]',
            
            // Sendo
            '.btn-buy-now',
            'button[class*="buy-now"]',
            'button[class*="add-cart"]',
            'button[class*="primary"]',
            
            // FPT Shop
            'button[class*="primary"]',
            'button[class*="buy"]',
            'button[class*="cart"]',
            'button[class*="btn-orange"]',
            
            // Cellphones
            'button[class*="btn-primary"]',
            'button[class*="order"]',
            'button[class*="cart"]',
            'button[class*="buy-now"]',
            
            // Hasaki
            'button[class*="add-cart"]',
            'button[class*="buy-now"]',
            'button[class*="btn-primary"]',
            
            // Hoang Ha Mobile
            'button[class*="btn-buy"]',
            'a[class*="btn-buy"]',
            'button[class*="add-cart"]',
            
            // More generic
            'button[class*="primary"]:not([class*="filter"]):not([class*="search"])',
            'button[class*="buy"]:not([class*="guide"])',
            'button[class*="purchase"]',
            'button[class*="cart"]:not([class*="view"])',
            'a[class*="buy-now"]',
            'a[class*="purchase"]',
            'a[class*="cart"]:not([class*="view"])'
        ];
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Vietnamese Shopping Helper v1.3.1 - Khởi động...');
        
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
        setTimeout(() => this.processAllPrices(), 10000);
        
        // Thiết lập xử lý nút mua hàng
        this.refreshBuyButtonStatus();
        setTimeout(() => this.refreshBuyButtonStatus(), 3000);
        setTimeout(() => this.refreshBuyButtonStatus(), 6000);
        setTimeout(() => this.refreshBuyButtonStatus(), 12000);
        
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
        console.log('🛡️ Vô hiệu hóa tất cả nút mua hàng...');
        
        let disabledCount = 0;
        
        this.buyButtonSelectors.forEach(selector => {
            try {
                let elements = [];
                
                if (selector.includes(':contains')) {
                    const baseSelector = selector.split(':contains')[0];
                    const text = selector.match(/\("([^"]+)"\)/)?.[1];
                    
                    if (baseSelector && text) {
                        const candidates = document.querySelectorAll(baseSelector);
                        elements = Array.from(candidates).filter(el => 
                            el.textContent && el.textContent.toLowerCase().includes(text.toLowerCase())
                        );
                    }
                } else {
                    elements = Array.from(document.querySelectorAll(selector));
                }
                
                elements.forEach(button => {
                    if (!this.disabledButtons.has(button)) {
                        this.disableBuyButton(button);
                        this.disabledButtons.add(button);
                        disabledCount++;
                    }
                });
            } catch (error) {
                console.warn(`⚠️ Lỗi với buy button selector "${selector}":`, error);
            }
        });
        
        console.log(`🛡️ Đã vô hiệu hóa ${disabledCount} nút mua hàng`);
    }
    
    disableBuyButton(button) {
        // Lưu trạng thái ban đầu
        if (!button.dataset.vnOriginalDisabled) {
            button.dataset.vnOriginalDisabled = button.disabled || 'false';
            button.dataset.vnOriginalStyle = button.style.cssText || '';
            button.dataset.vnOriginalTitle = button.title || '';
        }
        
        // Vô hiệu hóa nút
        button.disabled = true;
        button.style.opacity = '0.4';
        button.style.cursor = 'not-allowed';
        button.style.pointerEvents = 'none';
        button.style.filter = 'grayscale(100%)';
        button.title = '🛡️ Nút mua hàng đã bị vô hiệu hóa để bảo vệ tài chính của bạn. Bạn có thể tắt tính năng này trong cài đặt extension.';
        
        // Thêm lớp CSS để nhận diện
        button.classList.add('vn-disabled-button');
        
        // Ngăn chặn click events
        const clickHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // Hiển thị thông báo
            this.showDisabledButtonMessage();
            return false;
        };
        
        button.addEventListener('click', clickHandler, { capture: true });
        button.dataset.vnClickHandler = 'added';
    }
    
    showDisabledButtonMessage() {
        alert('🛡️ BẢO VỆ TÀI CHÍNH\n\nNút mua hàng đã được vô hiệu hóa để giúp bạn kiểm soát chi tiêu.\n\nNếu bạn thực sự muốn mua sắm, hãy tắt tính năng này trong cài đặt extension.');
    }
    
    enableAllBuyButtons() {
        console.log('🔓 Bật lại tất cả nút mua hàng...');
        
        const disabledButtons = document.querySelectorAll('.vn-disabled-button');
        let enabledCount = 0;
        
        disabledButtons.forEach(button => {
            this.enableBuyButton(button);
            enabledCount++;
        });
        
        // Reset WeakSet
        this.disabledButtons = new WeakSet();
        
        console.log(`🔓 Đã bật lại ${enabledCount} nút mua hàng`);
    }
    
    enableBuyButton(button) {
        // Khôi phục trạng thái ban đầu
        if (button.dataset.vnOriginalDisabled !== undefined) {
            button.disabled = button.dataset.vnOriginalDisabled === 'true';
            button.style.cssText = button.dataset.vnOriginalStyle || '';
            button.title = button.dataset.vnOriginalTitle || '';
            
            // Xóa dữ liệu lưu trữ
            delete button.dataset.vnOriginalDisabled;
            delete button.dataset.vnOriginalStyle;
            delete button.dataset.vnOriginalTitle;
            delete button.dataset.vnClickHandler;
        }
        
        // Xóa lớp CSS
        button.classList.remove('vn-disabled-button');
    }
    
    setupObserver() {
        if (this.observer) {
            this.observer.disconnect();
        }
        
        this.observer = new MutationObserver((mutations) => {
            if (!this.settings.enabled) return;
            
            let shouldProcessPrices = false;
            let shouldProcessButtons = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (this.hasMatchingSelector(node)) {
                                shouldProcessPrices = true;
                            }
                            if (this.hasBuyButton(node)) {
                                shouldProcessButtons = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldProcessPrices) {
                clearTimeout(this.debounceTimer);
                this.debounceTimer = setTimeout(() => {
                    this.processAllPrices();
                }, 1500);
            }
            
            if (shouldProcessButtons) {
                setTimeout(() => this.refreshBuyButtonStatus(), 1000);
            }
        });
        
        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('👀 Đã thiết lập observer');
    }
    
    hasBuyButton(element) {
        return this.buyButtonSelectors.some(selector => {
            try {
                if (selector.includes(':contains')) {
                    const baseSelector = selector.split(':contains')[0];
                    const text = selector.match(/\("([^"]+)"\)/)?.[1];
                    
                    if (element.matches && element.matches(baseSelector)) {
                        return element.textContent && element.textContent.toLowerCase().includes(text?.toLowerCase() || '');
                    }
                    
                    if (element.querySelector) {
                        const candidates = element.querySelectorAll(baseSelector);
                        return Array.from(candidates).some(el => 
                            el.textContent && el.textContent.toLowerCase().includes(text?.toLowerCase() || '')
                        );
                    }
                } else {
                    return element.matches && element.matches(selector) || 
                           element.querySelector && element.querySelector(selector);
                }
            } catch (e) {
                return false;
            }
        });
    }
    
    setupBuyButtonWarnings() {
        if (this.settings.disableBuyButtons) {
            return; // Không thiết lập warning nếu đã disable buttons
        }
        
        console.log('🛒 Thiết lập cảnh báo nút mua hàng...');
        
        let processedCount = 0;
        
        this.buyButtonSelectors.forEach(selector => {
            try {
                let elements = [];
                
                if (selector.includes(':contains')) {
                    const baseSelector = selector.split(':contains')[0];
                    const text = selector.match(/\("([^"]+)"\)/)?.[1];
                    
                    if (baseSelector && text) {
                        const candidates = document.querySelectorAll(baseSelector);
                        elements = Array.from(candidates).filter(el => 
                            el.textContent && el.textContent.toLowerCase().includes(text.toLowerCase())
                        );
                    }
                } else {
                    elements = Array.from(document.querySelectorAll(selector));
                }
                
                elements.forEach(button => {
                    if (!this.processedButtons.has(button) && !button.classList.contains('vn-disabled-button')) {
                        this.addBuyButtonWarning(button);
                        this.processedButtons.add(button);
                        processedCount++;
                    }
                });
            } catch (error) {
                console.warn(`⚠️ Lỗi với buy button selector "${selector}":`, error);
            }
        });
        
        console.log(`🛒 Đã xử lý ${processedCount} nút mua hàng`);
    }
    
    addBuyButtonWarning(button) {
        console.log('🔔 Thêm cảnh báo cho nút:', button.textContent?.trim());
        
        const originalHandler = (event) => {
            console.log('🛒 Nút mua hàng được nhấn!', button);
            
            const price = this.findNearestPrice(button);
            console.log('💰 Giá tìm thấy:', price);
            
            if (price && price > 1000) {
                const dailyRate = this.calculateDailyRate();
                const daysNeeded = price / dailyRate;
                
                console.log('📊 Số ngày cần làm việc:', daysNeeded);
                
                if (daysNeeded >= 0.3) { // Lowered threshold cho mindful buying
                    const reminderData = this.getReminderData(daysNeeded);
                    const shouldContinue = this.showBuyWarning(price, daysNeeded, reminderData);
                    
                    if (!shouldContinue) {
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return false;
                    }
                }
            }
            
            return true;
        };
        
        button.addEventListener('click', originalHandler, true);
        button.setAttribute('data-vn-warning-added', 'true');
    }
    
    findNearestPrice(button) {
        console.log('🔍 Tìm kiếm giá gần nút mua:', button);
        
        const containers = [
            button.closest('[class*="product"]'),
            button.closest('[class*="item"]'),
            button.closest('.pdp-mod-product-info-section'),
            button.closest('[class*="price"]'),
            button.closest('[class*="info"]'),
            button.closest('[class*="detail"]'),
            button.closest('article'),
            button.closest('section'),
            button.closest('div'),
            button.parentElement,
            document
        ].filter(Boolean);
        
        for (const container of containers) {
            // Tìm từ time display trước
            const timeDisplay = container.querySelector('.vn-price-time-container');
            if (timeDisplay && timeDisplay.dataset.price) {
                const price = parseFloat(timeDisplay.dataset.price);
                console.log('💰 Tìm thấy giá từ time display:', price);
                return price;
            }
            
            // Tìm từ site configs
            const configs = this.getSiteConfigs();
            for (const config of configs) {
                const priceElement = container.querySelector(config.currentPriceSelector);
                if (priceElement) {
                    const price = this.extractPrice(this.getElementText(priceElement), config);
                    if (price && price > 1000) {
                        console.log('💰 Tìm thấy giá từ selector:', price);
                        return price;
                    }
                }
            }
            
            // Fallback: tìm text có chứa ₫
            const allElements = container.querySelectorAll('*');
            for (const el of allElements) {
                const text = el.textContent || '';
                if (text.includes('₫') && el.children.length === 0) {
                    const price = this.extractPriceFromText(text);
                    if (price && price > 1000) {
                        console.log('💰 Tìm thấy giá từ fallback:', price);
                        return price;
                    }
                }
            }
        }
        
        console.log('❌ Không tìm thấy giá');
        return null;
    }
    
    extractPriceFromText(text) {
        // Improved price extraction based on actual patterns
        const cleanText = text.replace(/[^\d.,]/g, '');
        if (!cleanText) return null;
        
        let price = cleanText;
        
        // Handle different number formats
        if (price.includes(',') && price.includes('.')) {
            const lastComma = price.lastIndexOf(',');
            const lastDot = price.lastIndexOf('.');
            price = lastComma > lastDot ? 
                price.replace(/\./g, '').replace(',', '.') : 
                price.replace(/,/g, '');
        } 
        // Only comma
        else if (price.includes(',')) {
            const parts = price.split(',');
            price = parts.length === 2 && parts[1].length <= 2 ? 
                price.replace(',', '.') : price.replace(/,/g, '');
        } 
        // Only dot
        else if (price.includes('.')) {
            const parts = price.split('.');
            if (parts.length > 2 || (parts.length === 2 && parts[1].length > 2)) {
                price = price.replace(/\./g, '');
            }
        }
        
        const numPrice = parseFloat(price);
        return (numPrice >= 1000 && numPrice <= 1000000000) ? numPrice : null;
    }
    
    showBuyWarning(price, daysNeeded, reminderData) {
        const timeWorked = this.formatTimeDisplay(daysNeeded * 8);
        const formattedPrice = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
        
        let message = `${reminderData.emoji} MUA SẮM CÓ Ý THỨC\n\n`;
        message += `💰 Giá sản phẩm: ${formattedPrice}\n`;
        message += `⏰ Thời gian làm việc: ${timeWorked}\n`;
        message += `📊 Mức độ: ${reminderData.levelName}\n\n`;
        
        if (reminderData.reminder) {
            message += `🧠 Câu hỏi để suy ngẫm:\n${reminderData.reminder}\n\n`;
        }
        
        message += `🤔 Hãy dành vài giây tự hỏi:\n`;
        message += `• Tôi có thực sự cần món này không?\n`;
        message += `• Có lựa chọn nào tốt hơn không?\n`;
        message += `• Món này có đáng số thời gian làm việc này?\n`;
        message += `• Tôi sẽ cảm thấy thế nào sau khi mua?\n\n`;
        message += `❓ Sau khi suy nghĩ cẩn thận, bạn có muốn tiếp tục mua không?`;
        
        const result = confirm(message);
        console.log('🤔 Quyết định mindful buying:', result ? 'Tiếp tục mua' : 'Hủy bỏ để suy nghĩ thêm');
        
        // Log để theo dõi hiệu quả
        if (!result) {
            console.log('💚 Mindful buying thành công! Đã ngăn chặn một lần mua sắm bốc đồng.');
        }
        
        return result;
    }
    
    removeBuyButtonWarnings() {
        const buttons = document.querySelectorAll('[data-vn-warning-added]');
        console.log(`🗑️ Xóa cảnh báo khỏi ${buttons.length} nút`);
        buttons.forEach(button => {
            button.removeAttribute('data-vn-warning-added');
        });
        this.processedButtons = new WeakSet();
    }
    
    calculateDailyRate() {
        let dailyRate = this.settings.salary;
        
        switch (this.settings.salaryUnit) {
            case 'year':
                dailyRate = this.settings.salary / (12 * 22);
                break;
            case 'month':
                dailyRate = this.settings.salary / 22;
                break;
            case 'hour':
                dailyRate = this.settings.salary * 8;
                break;
            case 'day':
            default:
                dailyRate = this.settings.salary;
                break;
        }
        
        if (this.settings.taxType === 'before') {
            dailyRate = dailyRate * 0.85; // Ước tính thuế và bảo hiểm
        }
        
        return dailyRate;
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
                    color: data.color
                };
            }
        }
        
        return {
            level: 1,
            levelName: 'An toàn',
            emoji: '💚',
            reminder: null,
            color: '#10b981'
        };
    }
    
    hasMatchingSelector(element) {
        const configs = this.getSiteConfigs();
        return configs.some(config => {
            try {
                return element.matches && element.matches(config.currentPriceSelector) || 
                       element.querySelector && element.querySelector(config.currentPriceSelector);
            } catch (e) {
                return false;
            }
        });
    }
    
    getSiteConfigs() {
        const hostname = window.location.hostname.toLowerCase();
        
        if (hostname.includes('shopee.vn')) {
            return [{
                name: 'Shopee',
                // Updated selectors based on actual HTML code
                currentPriceSelector: '.IZPeQz.B67UQ0, .IZPeQz, .pqTWkA, ._1w0TcH, .GCKXwL, div.jRlVo0 > div:first-child',
                excludeSelectors: ['.ZA5sW5', '.mq6YDA', '._1w9jWR', '.ZA5sW5[style*="margin-left"]'],
                priceRegex: /₫\s*([\d.,\s]+)/,
                containerSelector: '.jRlVo0, .flex, .product-briefing'
            }];
        }
        
        if (hostname.includes('lazada.vn')) {
            return [{
                name: 'Lazada',
                // Updated based on actual HTML code
                currentPriceSelector: '.pdp-price.pdp-price_color_orange, .pdp-price_color_orange, .pdp-price.pdp-price_type_normal',
                excludeSelectors: ['.pdp-price_type_deleted', '.pdp-price_color_lightgray', '.old-price'],
                priceRegex: /₫\s*([\d.,\s]+)/,
                containerSelector: '.pdp-product-price'
            }];
        }
        
        if (hostname.includes('thegioididong.com') || hostname.includes('dienmayxanh.com')) {
            return [{
                name: 'TGDD/DMX',
                // Updated based on actual HTML code
                currentPriceSelector: '.box-price-present, .price-current, .box-price-new, p.box-price-present',
                excludeSelectors: ['.box-price-old', '.price-old'],
                priceRegex: /([\d.,\s]+)₫/,
                containerSelector: '.box-price'
            }];
        }
        
        if (hostname.includes('tiki.vn')) {
            return [{
                name: 'Tiki',
                currentPriceSelector: '.product-price__current-price, .current-price',
                excludeSelectors: ['.product-price__list-price', '.list-price'],
                priceRegex: /([\d.,\s]+)₫/,
                containerSelector: '.product-price'
            }];
        }
        
        if (hostname.includes('sendo.vn')) {
            return [{
                name: 'Sendo',
                currentPriceSelector: '.product_price_final, .price-final',
                excludeSelectors: ['.product_price_market', '.price-market'],
                priceRegex: /([\d.,\s]+)₫/,
                containerSelector: '.product_price'
            }];
        }
        
        if (hostname.includes('fptshop.com.vn')) {
            return [{
                name: 'FPT Shop',
                // Updated based on actual HTML code
                currentPriceSelector: '.text-black-opacity-100.h4-bold, span.text-black-opacity-100, .product-price-current',
                excludeSelectors: ['.line-through', '.price-old', '.text-neutral-gray-5'],
                priceRegex: /([\d.,\s]+)\s*₫/,
                containerSelector: '.flex.flex-col'
            }];
        }
        
        if (hostname.includes('cellphones.com.vn')) {
            return [{
                name: 'Cellphones',
                // Updated based on actual HTML code
                currentPriceSelector: '.sale-price, div.sale-price, .product-price',
                excludeSelectors: ['.base-price', '.old-price', 'del.base-price'],
                priceRegex: /([\d.,\s]+)đ/,
                containerSelector: '.is-flex.is-align-items-center'
            }];
        }
        
        if (hostname.includes('hasaki.vn')) {
            return [{
                name: 'Hasaki',
                // Updated based on actual HTML code
                currentPriceSelector: '.text-orange.text-lg.font-bold, span.text-orange, .price-current',
                excludeSelectors: ['.line-through', '.price-old'],
                priceRegex: /([\d.,\s]+)\s*₫/,
                containerSelector: '.flex.items-center.gap-2\\.5'
            }];
        }
        
        if (hostname.includes('hoanghamobile.com')) {
            return [{
                name: 'Hoang Ha Mobile',
                // Updated based on actual HTML code
                currentPriceSelector: 'strong.price, .price-current, strong[class="price"]',
                excludeSelectors: ['.old-price', '.strike'],
                priceRegex: /([\d.,\s]+)\s*₫/,
                containerSelector: '.price'
            }];
        }
        
        if (hostname.includes('bachhoaxanh.com')) {
            return [{
                name: 'Bach Hoa Xanh',
                currentPriceSelector: '.box-price-present, .price-current',
                excludeSelectors: ['.box-price-old', '.price-old'],
                priceRegex: /([\d.,\s]+)₫/,
                containerSelector: '.box-price'
            }];
        }
        
        if (hostname.includes('fahasa.com')) {
            return [{
                name: 'Fahasa',
                currentPriceSelector: '.product-price-current, .price-current',
                excludeSelectors: ['.product-price-old', '.price-old'],
                priceRegex: /([\d.,\s]+)₫/,
                containerSelector: '.product-price'
            }];
        }
        
        if (hostname.includes('nguyenkim.com')) {
            return [{
                name: 'Nguyen Kim',
                currentPriceSelector: '.product-price-current, .price-current',
                excludeSelectors: ['.product-price-old', '.price-old'],
                priceRegex: /([\d.,\s]+)₫/,
                containerSelector: '.product-price'
            }];
        }
        
        // Generic fallback
        return [{
            name: 'Generic',
            currentPriceSelector: '.price:not(.old):not(.before):not(.original), [class*="price"]:not([class*="old"]):not([class*="before"])',
            excludeSelectors: ['.price.old', '.price.before', '.price.original', '[class*="old"]', '[class*="before"]'],
            priceRegex: /₫?\s*([\d.,\s]+)/,
            containerSelector: '.price, [class*="price"]'
        }];
    }
    
    processAllPrices() {
        let processedCount = 0;
        const configs = this.getSiteConfigs();
        
        console.log('🔍 Đang xử lý với configs:', configs.map(c => c.name));
        
        configs.forEach(config => {
            try {
                const elements = document.querySelectorAll(config.currentPriceSelector);
                console.log(`[${config.name}] Tìm thấy ${elements.length} elements với selector: ${config.currentPriceSelector}`);
                
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
            console.log(`💰 Đã xử lý ${processedCount} giá`);
        } else {
            console.log('ℹ️ Không tìm thấy giá mới để xử lý (có thể đã xử lý rồi)');
        }
    }
    
    processPriceElement(element, config) {
        if (this.processedElements.has(element)) return false;
        if (this.hasTimeDisplay(element)) return false;
        if (this.isExcludedElement(element, config)) {
            console.log('⏭️ Bỏ qua element bị loại trừ:', element.textContent?.trim());
            return false;
        }
        
        const priceText = this.getElementText(element);
        const price = this.extractPrice(priceText, config);
        
        console.log('💰 Đang xử lý element:', {
            text: priceText?.trim(),
            extractedPrice: price,
            className: element.className,
            tagName: element.tagName,
            config: config.name
        });
        
        if (price && price > 1000) {
            this.processedElements.add(element);
            this.addTimeDisplay(element, price);
            return true;
        }
        
        return false;
    }
    
    hasTimeDisplay(element) {
        const parent = element.parentElement;
        return element.querySelector('.vn-price-time-container') ||
               element.nextElementSibling?.classList.contains('vn-price-time-container') ||
               (parent && parent.querySelector('.vn-price-time-container'));
    }
    
    isExcludedElement(element, config) {
        const className = element.className || '';
        const parentClass = element.parentElement ? element.parentElement.className || '' : '';
        
        // Kiểm tra excludeSelectors
        for (const excludeSelector of config.excludeSelectors) {
            try {
                if (element.matches(excludeSelector) || 
                    (element.parentElement && element.parentElement.matches(excludeSelector))) {
                    return true;
                }
            } catch (e) {
                // Ignore selector errors
            }
        }
        
        // Kiểm tra text-decoration
        const style = window.getComputedStyle(element);
        if (style.textDecoration.includes('line-through')) {
            return true;
        }
        
        // Kiểm tra class names cho giá cũ
        const oldPriceIndicators = ['old', 'before', 'original', 'crossed', 'strike', 'deleted', 'lightgray', 'line-through', 'discount'];
        for (const indicator of oldPriceIndicators) {
            if (className.toLowerCase().includes(indicator) || 
                parentClass.toLowerCase().includes(indicator)) {
                return true;
            }
        }
        
        return false;
    }
    
    getElementText(element) {
        let text = element.textContent || element.innerText || '';
        
        if (!text.trim()) {
            text = element.getAttribute('data-price') || 
                   element.getAttribute('title') || 
                   element.getAttribute('alt') || '';
        }
        
        return text;
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
        
        // Remove all non-numeric characters except comma, dot and whitespace
        const cleanText = text.replace(/[^\d.,\s]/g, '');
        if (!cleanText) return null;
        
        // Remove whitespace
        let price = cleanText.replace(/\s/g, '');
        
        // Handle number formats
        if (price.includes(',') && price.includes('.')) {
            const lastComma = price.lastIndexOf(',');
            const lastDot = price.lastIndexOf('.');
            
            if (lastComma > lastDot) {
                // 1.234,56 format
                price = price.replace(/\./g, '').replace(',', '.');
            } else {
                // 1,234.56 format
                price = price.replace(/,/g, '');
            }
        } else if (price.includes(',')) {
            const parts = price.split(',');
            if (parts.length === 2 && parts[1].length <= 2) {
                // Decimal comma: 123,45
                price = price.replace(',', '.');
            } else {
                // Thousand separator: 1,234,567
                price = price.replace(/,/g, '');
            }
        } else if (price.includes('.')) {
            const parts = price.split('.');
            if (parts.length === 2 && parts[1].length <= 2) {
                // Decimal dot: 123.45 - keep as is
            } else {
                // Thousand separator: 1.234.567
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
        
        const insertPosition = this.findBestInsertPosition(element);
        
        try {
            insertPosition.parent.insertBefore(timeDisplay, insertPosition.nextSibling);
            console.log('✅ Đã thêm time display:', timeWorked, 'cho giá:', price.toLocaleString('vi-VN'), 'VNĐ, mức độ:', reminderData.levelName);
        } catch (error) {
            console.warn('❌ Lỗi khi thêm time display:', error);
            try {
                element.parentElement.appendChild(timeDisplay);
            } catch (e) {
                console.warn('❌ Không thể thêm time display:', e);
            }
        }
    }
    
    calculateHourlyRate() {
        let hourlyRate = this.settings.salary;
        
        switch (this.settings.salaryUnit) {
            case 'year':
                hourlyRate = this.settings.salary / (12 * 22 * 8);
                break;
            case 'month':
                hourlyRate = this.settings.salary / (22 * 8);
                break;
            case 'day':
                hourlyRate = this.settings.salary / 8;
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
    
    findBestInsertPosition(element) {
        const hostname = window.location.hostname.toLowerCase();
        
        if (hostname.includes('shopee.vn')) {
            // Optimized for Shopee's structure
            const container = element.closest('.jRlVo0') || 
                            element.closest('.flex') || 
                            element.parentElement;
            return {
                parent: container,
                nextSibling: null
            };
        }
        
        if (hostname.includes('lazada.vn')) {
            return {
                parent: element.parentElement,
                nextSibling: element.nextSibling
            };
        }
        
        if (hostname.includes('thegioididong.com') || hostname.includes('dienmayxanh.com')) {
            return {
                parent: element.parentElement,
                nextSibling: element.nextSibling
            };
        }
        
        if (hostname.includes('fptshop.com.vn')) {
            const container = element.closest('.flex.flex-col') || element.parentElement;
            return {
                parent: container,
                nextSibling: null
            };
        }
        
        if (hostname.includes('cellphones.com.vn')) {
            return {
                parent: element.parentElement,
                nextSibling: element.nextSibling
            };
        }
        
        if (hostname.includes('hasaki.vn')) {
            const container = element.closest('.flex.items-center') || element.parentElement;
            return {
                parent: container,
                nextSibling: null
            };
        }
        
        if (hostname.includes('hoanghamobile.com')) {
            return {
                parent: element.parentElement,
                nextSibling: element.nextSibling
            };
        }
        
        // Generic fallback
        return {
            parent: element.parentElement || document.body,
            nextSibling: element.nextSibling
        };
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
        
        // Auto mode - hiển thị thông minh
        if (hoursNeeded < 1) {
            return `${Math.round(hoursNeeded * 60)}p`;
        } else if (hoursNeeded < 8) {
            const hours = Math.floor(hoursNeeded);
            const minutes = Math.round((hoursNeeded - hours) * 60);
            return minutes > 0 ? `${hours}h${minutes}p` : `${hours}h`;
        } else if (hoursNeeded < 176) { // < 1 tháng
            const days = Math.floor(hoursNeeded / 8);
            const remainingHours = Math.round(hoursNeeded % 8);
            return remainingHours > 0 ? `${days}d${remainingHours}h` : `${days}d`;
        } else if (hoursNeeded < 2112) { // < 1 năm
            const months = Math.floor(hoursNeeded / 176);
            const remainingDays = Math.round((hoursNeeded % 176) / 8);
            return remainingDays > 0 ? `${months}th${remainingDays}d` : `${months}th`;
        } else {
            const years = Math.floor(hoursNeeded / 2112);
            const remainingMonths = Math.round((hoursNeeded % 2112) / 176);
            return remainingMonths > 0 ? `${years}y${remainingMonths}th` : `${years}y`;
        }
    }
    
    createTimeDisplay(timeWorked, reminderData, price) {
        const container = document.createElement('div');
        container.className = 'vn-price-time-container';
        container.dataset.price = price;
        
        const timeDisplay = document.createElement('div');
        timeDisplay.className = `vn-price-time vn-level-${reminderData.level}`;
        timeDisplay.style.setProperty('--level-color', reminderData.color);
        
        timeDisplay.innerHTML = `
            <span class="vn-emoji">${reminderData.emoji}</span>
            <span class="vn-time">⏰ ${timeWorked}</span>
        `;
        
        // Thêm tooltip nếu có reminder
        if (reminderData.reminder) {
            const tooltip = document.createElement('div');
            tooltip.className = 'vn-tooltip';
            tooltip.textContent = reminderData.reminder;
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
        console.log('🔄 Làm mới tất cả giá...');
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

// Khởi động extension với error handling
console.log('🔌 Vietnamese Shopping Helper v1.3.1 - Content Script loaded');

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
