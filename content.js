class VietnameseShoppingHelper {
    constructor() {
        this.settings = {
            salary: 8000000,
            salaryUnit: 'month',
            taxType: 'after',
            displayUnit: 'auto',
            enabled: true
        };
        
        this.processedElements = new WeakSet();
        this.processedButtons = new WeakSet();
        this.observer = null;
        this.isInitialized = false;
        this.debounceTimer = null;
        
        // Hệ thống phân cấp dựa trên thời gian làm việc (ngày)
        this.reminderLevels = {
            1: {
                range: [0, 1], // < 1 ngày
                emoji: ['💚', '✅'],
                level: 'An toàn',
                color: '#22c55e',
                reminders: []
            },
            2: {
                range: [1, 3], // 1-3 ngày
                emoji: ['🟡', '⚠️'],
                level: 'Cẩn thận',
                color: '#f59e0b',
                reminders: [
                    "Đây là khoảng 1-3 ngày làm việc. Bạn có thực sự cần món này không?",
                    "Hãy suy nghĩ: liệu món này có đáng để bạn làm việc vài ngày?",
                    "Trước khi mua, hãy đợi 24h để suy nghĩ lại nhé!"
                ]
            },
            3: {
                range: [3, 7], // 3-7 ngày (1 tuần)
                emoji: ['🔶', '😰'],
                level: 'Cảnh báo',
                color: '#f97316',
                reminders: [
                    "Đây là cả tuần làm việc! Bạn có chắc chắn cần thiết không?",
                    "1 tuần lương chỉ để mua món này - hãy cân nhắc kỹ!",
                    "Liệu bạn có thể tìm được lựa chọn rẻ hơn không?"
                ]
            },
            4: {
                range: [7, 30], // 1 tuần - 1 tháng
                emoji: ['🔴', '😱'],
                level: 'Nguy hiểm',
                color: '#ef4444',
                reminders: [
                    "Từ 1 tuần đến 1 tháng lương! Đây là quyết định lớn đấy!",
                    "Hãy tham khảo ý kiến người thân trước khi mua.",
                    "Bạn có thể tiết kiệm được bao nhiêu nếu không mua món này?"
                ]
            },
            5: {
                range: [30, Infinity], // > 1 tháng
                emoji: ['💥', '🚨', '⛔'],
                level: 'Rất nguy hiểm',
                color: '#dc2626',
                reminders: [
                    "CẢNH BÁO: Đây là hơn 1 tháng lương! Hãy suy nghĩ rất kỹ!",
                    "Món này đáng giá hơn cả tháng làm việc của bạn - thật sự cần thiết?",
                    "Đừng để cảm xúc chi phối - hãy lập kế hoạch tài chính trước!"
                ]
            }
        };
        
        // Selectors cho nút mua hàng
        this.buyButtonSelectors = [
            // Generic patterns
            'button:contains("Mua ngay")',
            'button:contains("Buy now")',
            'button:contains("MUA NGAY")',
            'button:contains("BUY NOW")',
            'a:contains("Mua ngay")',
            'a:contains("Buy now")',
            '[role="button"]:contains("Mua ngay")',
            '[role="button"]:contains("Buy now")',
            
            // Shopee
            'button[class*="btn-solid-primary"]',
            'button[class*="buy-now"]',
            'button[class*="shopee-button-solid"]',
            'button[class*="Ow1BH_"]',
            'div[role="button"][class*="btn"]',
            
            // Lazada
            '.add-to-cart-buy-now-btn',
            '.buyNow',
            '.pdp-mod-product-info-section .next-btn-primary',
            'button[class*="add-to-cart"]',
            
            // TGDD/DMX
            '.btn-buy-now',
            '.btnbuy',
            '.btn-red',
            'a[class*="btn"][class*="red"]',
            
            // Tiki
            'button[data-view-id*="buy_now"]',
            '.btn-buy',
            'button[class*="btn-large"]',
            
            // Sendo
            '.btn-buy-now',
            'button[class*="buy-now"]',
            
            // FPT Shop
            'button[class*="primary"]',
            'button[class*="buy"]',
            
            // Cellphones
            'button[class*="btn-primary"]',
            'button[class*="order"]',
            
            // Hasaki
            'button[class*="add-cart"]',
            'button[class*="buy-now"]',
            
            // Hoang Ha Mobile
            'button[class*="btn-buy"]',
            'a[class*="btn-buy"]',
            
            // More generic
            'button[class*="primary"]:not([class*="cart"])',
            'button[class*="buy"]',
            'button[class*="purchase"]',
            'a[class*="buy-now"]',
            'a[class*="purchase"]'
        ];
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Vietnamese Shopping Helper - Khởi động...');
        
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
                enabled: true
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
                this.setupBuyButtonWarnings();
                sendResponse({status: 'updated'});
            } else if (request.action === 'toggleExtension') {
                this.settings.enabled = request.enabled;
                if (request.enabled) {
                    this.refreshAllPrices();
                    this.setupBuyButtonWarnings();
                } else {
                    this.removeAllTimeDisplays();
                    this.removeBuyButtonWarnings();
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
        
        // Xử lý giá
        this.processAllPrices();
        setTimeout(() => this.processAllPrices(), 2000);
        setTimeout(() => this.processAllPrices(), 5000);
        
        // Thiết lập cảnh báo nút mua
        this.setupBuyButtonWarnings();
        setTimeout(() => this.setupBuyButtonWarnings(), 3000);
        setTimeout(() => this.setupBuyButtonWarnings(), 6000);
        
        // Theo dõi thay đổi DOM
        this.setupObserver();
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
                setTimeout(() => this.setupBuyButtonWarnings(), 1000);
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
                    if (!this.processedButtons.has(button)) {
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
                
                if (daysNeeded >= 1) {
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
            button.closest('div'),
            button.parentElement,
            document
        ].filter(Boolean);
        
        for (const container of containers) {
            const timeDisplay = container.querySelector('.vn-price-time-container');
            if (timeDisplay && timeDisplay.dataset.price) {
                const price = parseFloat(timeDisplay.dataset.price);
                console.log('💰 Tìm thấy giá từ time display:', price);
                return price;
            }
            
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
        const cleanText = text.replace(/[^\d.,]/g, '');
        if (!cleanText) return null;
        
        let price = cleanText;
        if (price.includes(',') && price.includes('.')) {
            const lastComma = price.lastIndexOf(',');
            const lastDot = price.lastIndexOf('.');
            price = lastComma > lastDot ? 
                price.replace(/\./g, '').replace(',', '.') : 
                price.replace(/,/g, '');
        } else if (price.includes(',')) {
            const parts = price.split(',');
            price = parts.length === 2 && parts[1].length <= 2 ? 
                price.replace(',', '.') : price.replace(/,/g, '');
        } else if (price.includes('.')) {
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
        
        let message = `${reminderData.emoji} BẠN ĐÃ CHẮC CHƯA?\n\n`;
        message += `💰 Giá sản phẩm: ${formattedPrice}\n`;
        message += `⏰ Thời gian làm việc: ${timeWorked}\n`;
        message += `📊 Mức độ: ${reminderData.levelName}\n\n`;
        
        if (reminderData.reminder) {
            message += `💡 ${reminderData.reminder}\n\n`;
        }
        
        message += `❓ Bạn có chắc chắn muốn mua không?`;
        
        const result = confirm(message);
        console.log('🤔 Người dùng quyết định:', result ? 'Tiếp tục mua' : 'Hủy bỏ');
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
            dailyRate = dailyRate * 0.85;
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
            color: '#22c55e'
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
                currentPriceSelector: '.IZPeQz.B67UQ0',
                excludeSelectors: ['.ZA5sW5'],
                priceRegex: /₫([\d.,]+)/,
                containerSelector: '.jRlVo0'
            }];
        }
        
        if (hostname.includes('lazada.vn')) {
            return [{
                name: 'Lazada',
                currentPriceSelector: '.pdp-price.pdp-price_type_normal.pdp-price_color_orange',
                excludeSelectors: ['.pdp-price_type_deleted'],
                priceRegex: /₫\s*([\d.,]+)/,
                containerSelector: '.pdp-product-price'
            }];
        }
        
        if (hostname.includes('thegioididong.com') || hostname.includes('dienmayxanh.com')) {
            return [{
                name: 'TGDD/DMX',
                currentPriceSelector: '.box-price-present',
                excludeSelectors: ['.box-price-old'],
                priceRegex: /([\d.,]+)₫/,
                containerSelector: '.box-price'
            }];
        }
        
        if (hostname.includes('tiki.vn')) {
            return [{
                name: 'Tiki',
                currentPriceSelector: '.product-price__current-price',
                excludeSelectors: ['.product-price__list-price'],
                priceRegex: /([\d.,]+)₫/,
                containerSelector: '.product-price'
            }];
        }
        
        if (hostname.includes('sendo.vn')) {
            return [{
                name: 'Sendo',
                currentPriceSelector: '.product_price_final',
                excludeSelectors: ['.product_price_market'],
                priceRegex: /([\d.,]+)₫/,
                containerSelector: '.product_price'
            }];
        }
        
        if (hostname.includes('fptshop.com.vn')) {
            return [{
                name: 'FPT Shop',
                currentPriceSelector: '.text-black-opacity-100.h4-bold', // Selector cho giá hiện tại
                excludeSelectors: ['.line-through'], // Loại trừ giá đã gạch
                priceRegex: /([\d.,]+)\s*₫/,
                containerSelector: '.flex.flex-col'
            }];
        }
        
        if (hostname.includes('cellphones.com.vn')) {
            return [{
                name: 'Cellphones',
                currentPriceSelector: '.sale-price', // Giá khuyến mại
                excludeSelectors: ['.base-price'], // Loại trừ giá gốc
                priceRegex: /([\d.,]+)đ/,
                containerSelector: '.is-flex.is-align-items-center'
            }];
        }
        
        if (hostname.includes('hasaki.vn')) {
            return [{
                name: 'Hasaki',
                currentPriceSelector: '.text-orange.text-lg.font-bold', // Giá hiện tại màu cam
                excludeSelectors: ['.line-through'],
                priceRegex: /([\d.,]+)\s*₫/,
                containerSelector: '.flex.items-center.gap-2\\.5'
            }];
        }
        
        if (hostname.includes('hoanghamobile.com')) {
            return [{
                name: 'Hoang Ha Mobile',
                currentPriceSelector: 'strong.price', // Giá trong thẻ strong
                excludeSelectors: ['.old-price', '.strike'],
                priceRegex: /([\d.,]+)\s*₫/,
                containerSelector: '.price'
            }];
        }
        
        return [{
            name: 'Generic',
            currentPriceSelector: '.price:not(.old):not(.before):not(.original)',
            excludeSelectors: ['.price.old', '.price.before', '.price.original'],
            priceRegex: /₫?\s*([\d.,]+)/,
            containerSelector: '.price'
        }];
    }
    
    processAllPrices() {
        let processedCount = 0;
        const configs = this.getSiteConfigs();
        
        console.log('🔍 Đang xử lý với configs:', configs);
        
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
            console.log('❌ Không tìm thấy giá nào để xử lý');
        }
    }
    
    processPriceElement(element, config) {
        if (this.processedElements.has(element)) return false;
        if (this.hasTimeDisplay(element)) return false;
        if (this.isExcludedElement(element, config)) {
            console.log('⏭️ Bỏ qua element bị loại trừ:', element.textContent);
            return false;
        }
        
        const priceText = this.getElementText(element);
        const price = this.extractPrice(priceText, config);
        
        console.log('💰 Đang xử lý element:', {
            text: priceText,
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
        
        const style = window.getComputedStyle(element);
        if (style.textDecoration.includes('line-through')) {
            return true;
        }
        
        const oldPriceIndicators = ['old', 'before', 'original', 'crossed', 'strike', 'deleted', 'lightgray', 'line-through'];
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
        
        const cleanText = text.replace(/[^\d.,]/g, '');
        if (!cleanText) return null;
        
        let price = cleanText;
        
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
            if (parts.length === 2 && parts[1].length <= 2) {
                // Giữ nguyên
            } else {
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
            console.log('✅ Đã thêm time display:', timeWorked, 'cho giá:', price, 'mức độ:', reminderData.levelName);
        } catch (error) {
            console.warn('❌ Lỗi khi thêm time display:', error);
            element.appendChild(timeDisplay);
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
            const container = element.closest('.jRlVo0') || element.parentElement;
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
    
    createTimeDisplay(timeWorked, reminderData, price) {
        const container = document.createElement('div');
        container.className = 'vn-price-time-container';
        container.dataset.price = price;
        
        const timeDisplay = document.createElement('div');
        timeDisplay.className = `vn-price-time vn-level-${reminderData.level}`;
        timeDisplay.style.setProperty('--level-color', reminderData.color);
        
        timeDisplay.innerHTML = `
            <span class="vn-emoji">${reminderData.emoji}</span>
            <span class="vn-time">⏰${timeWorked}</span>
        `;
        
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

// Khởi động extension
console.log('🔌 Vietnamese Shopping Helper - Content Script loaded');

if (!window.vnShoppingHelperInitialized) {
    window.vnShoppingHelperInitialized = true;
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new VietnameseShoppingHelper();
        });
    } else {
        new VietnameseShoppingHelper();
    }
}