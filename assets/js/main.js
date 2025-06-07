// main.js - 核心逻辑，包括页面跳转、数据处理、EmailJS、分享功能

document.addEventListener('DOMContentLoaded', () => {
    // ---- 引导页逻辑 (index.html) ----
    const startButton = document.getElementById('start-button');
    if (startButton) {
        startButton.addEventListener('click', () => {
            window.location.href = 'input.html';
        });
    }

    // ---- 输入页逻辑 (input.html) ----
    const childInfoForm = document.getElementById('child-info-form');
    const quizQuestionsContainer = document.getElementById('quiz-questions-container');

    if (quizQuestionsContainer) {
        // 动态加载行为测评题目
        loadBehaviorQuestions();
    }

    if (childInfoForm) {
        childInfoForm.addEventListener('submit', (e) => {
            e.preventDefault(); // 阻止表单默认提交行为

            const name = document.getElementById('child-name').value.trim() || '宝贝';
            const birthDate = document.getElementById('birth-date').value;
            const birthTime = document.getElementById('birth-time').value;
            const email = document.getElementById('email').value.trim();

            if (!birthDate || !birthTime || !email) {
                alert('请填写完整的出生日期、出生时间和接收报告的邮箱！');
                return;
            }

            if (!isValidEmail(email)) {
                alert('请输入有效的邮箱地址！');
                return;
            }

            // 收集行为测评答案
            const behaviorResults = collectBehaviorAnswers();
            if (!behaviorResults) {
                alert('请完成所有行为测评题目！');
                return;
            }

            // 执行占星计算
            // 假设 calculateAstrology(birthDate, birthTime) 在 astrology.js 中实现
            const { sunSign, ascendantSign, moonSign, houses } = window.AstrologyCalculator.calculateAstrology(birthDate, birthTime);

            // 组合所有数据
            const reportData = {
                name,
                birthDate,
                birthTime,
                email,
                sunSign,
                ascendantSign,
                moonSign,
                houses,
                behaviorResults
            };

            // 将数据存储到 localStorage，以便 result.html 访问
            localStorage.setItem('childReportData', JSON.stringify(reportData));
            window.location.href = 'result.html';
        });
    }

    // ---- 结果页逻辑 (result.html) ----
    const reportData = JSON.parse(localStorage.getItem('childReportData'));
    const shareLinkText = document.getElementById('share-link-text');
    const copyShareLinkButton = document.getElementById('copy-share-link');
    const shareStatusMessage = document.getElementById('share-status-message');
    const paymentConfirmButton = document.getElementById('payment-confirm-button');
    const emailSendSection = document.getElementById('email-send-section');
    const reportEmailInput = document.getElementById('report-email');
    const sendReportButton = document.getElementById('send-report-button');

    let isReportUnlocked = false; // 报告解锁状态

    if (reportData) {
        // 确保邮箱输入框预填为用户输入的邮箱
        if (reportEmailInput) {
            reportEmailInput.value = reportData.email;
        }
    } else if (window.location.pathname.includes('result.html')) {
        // 如果直接访问 result.html 且无数据，则返回输入页
        alert('未找到报告数据，请返回重新填写信息。');
        window.location.href = 'input.html';
        return;
    }


    // 处理分享链接的传入参数
    handleIncomingShareRef();
    // 更新分享链接显示
    updateShareLinkDisplay();
    // 检查分享状态，并可能自动解锁
    checkShareStatus();


    // 复制分享链接
    if (copyShareLinkButton) {
        copyShareLinkButton.addEventListener('click', () => {
            const linkToCopy = shareLinkText.textContent;
            navigator.clipboard.writeText(linkToCopy).then(() => {
                alert('分享链接已复制到剪贴板！');
                // 可选：添加临时视觉反馈，如按钮文本变为“已复制！”
            }).catch(err => {
                console.error('复制失败: ', err);
                alert('复制失败，请手动复制链接。');
            });
        });
    }

    // 打赏确认按钮
    if (paymentConfirmButton) {
        paymentConfirmButton.addEventListener('click', () => {
            if (confirm('确认您已完成打赏？确认后报告将发送至您的邮箱。')) {
                unlockReport();
            }
        });
    }

    // 发送报告按钮
    if (sendReportButton) {
        sendReportButton.addEventListener('click', () => {
            const finalEmail = reportEmailInput.value.trim();
            if (!finalEmail) {
                alert('请输入您的邮箱地址！');
                return;
            }
            if (!isValidEmail(finalEmail)) {
                alert('请输入有效的邮箱地址！');
                return;
            }

            sendReportViaEmailJS(reportData, finalEmail);
        });
    }


    // --- 辅助函数 ---

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // 加载行为测评题目到页面
    function loadBehaviorQuestions() {
        if (!window.behaviorQuestions || !quizQuestionsContainer) return;

        window.behaviorQuestions.forEach((qItem, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question-group';
            let optionsHtml = '';
            // qItem.options 是一个对象，键是值，值是显示文本
            for (const value in qItem.options) {
                optionsHtml += `
                    <label>
                        <input type="radio" name="${qItem.name}" value="${value}" required>
                        <span>${qItem.options[value]}</span>
                    </label>
                `;
            }
            questionDiv.innerHTML = `
                <p>${index + 1}. ${qItem.question}</p>
                ${optionsHtml}
            `;
            quizQuestionsContainer.appendChild(questionDiv);
        });
    }

    // 收集行为测评答案
    function collectBehaviorAnswers() {
        const results = {};
        let allAnswered = true;
        window.behaviorQuestions.forEach(qItem => {
            const selected = document.querySelector(`input[name="${qItem.name}"]:checked`);
            if (selected) {
                // 根据选项的值（a, b, c），从 qItem.tags 中获取对应的心理特征标签
                results[qItem.name] = qItem.tags[selected.value];
            } else {
                allAnswered = false;
            }
        });
        return allAnswered ? results : null;
    }

    // --- 分享与解锁逻辑 ---
    function getUniqueShareRef() {
        let ref = localStorage.getItem('myShareRef');
        if (!ref) {
            // 生成一个简单的唯一ID
            ref = 'ref_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
            localStorage.setItem('myShareRef', ref);
        }
        return ref;
    }

    function updateShareLinkDisplay() {
        const currentPath = window.location.pathname;
        const baseUrl = window.location.origin + currentPath.replace('result.html', 'index.html'); // 确保链接回到引导页
        const shareRef = getUniqueShareRef();
        const fullShareLink = `${baseUrl}?ref=${shareRef}`;
        if (shareLinkText) {
            shareLinkText.textContent = fullShareLink;
        }
    }

    function handleIncomingShareRef() {
        const urlParams = new URLSearchParams(window.location.search);
        const ref = urlParams.get('ref');
        if (ref) {
            let count = parseInt(localStorage.getItem(`shareCount_${ref}`) || '0', 10);
            count++;
            localStorage.setItem(`shareCount_${ref}`, count);
            // 清理 URL 参数，避免用户刷新时重复计数
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    function checkShareStatus() {
        const shareRef = getUniqueShareRef();
        const shareCount = parseInt(localStorage.getItem(`shareCount_${shareRef}`) || '0', 10);
        const requiredCount = 3;

        if (shareStatusMessage) {
            if (shareCount >= requiredCount) {
                shareStatusMessage.innerHTML = `恭喜！已成功邀请 ${shareCount} 位好友，<span class="unlocked-message">报告已解锁！</span>`;
                unlockReport();
            } else {
                shareStatusMessage.innerHTML = `您还需要邀请 <span>${requiredCount - shareCount}</span> 位好友点击访问...`;
            }
        }
    }

    function unlockReport() {
        if (!isReportUnlocked) {
            isReportUnlocked = true;
            if (emailSendSection) {
                emailSendSection.style.display = 'block'; // 显示邮箱发送区域
            }
            if (paymentConfirmButton) {
                paymentConfirmButton.disabled = true; // 禁用打赏按钮
                paymentConfirmButton.textContent = '已解锁';
            }
            // 可以添加更多UI反馈，比如隐藏分享模块的解锁提示
            const shareMethodDiv = document.querySelector('.unlock-method.method-share');
            if(shareMethodDiv) {
                shareMethodDiv.querySelector('.share-status').classList.add('unlocked-message');
            }
        }
    }

    // --- EmailJS 集成 ---
    function sendReportViaEmailJS(data, targetEmail) {
        // 在 EmailJS 官网注册并获取您的 PUBLIC_KEY, SERVICE_ID, TEMPLATE_ID
        // 这些凭证应该只在前端使用，如果需要更安全，则需要后端代理
        emailjs.init({
            publicKey: "YOUR_EMAILJS_PUBLIC_KEY", // <-- 替换为您的 EmailJS 公钥
        });

        const templateParams = {
            to_email: targetEmail,
            child_name: data.name,
            report_html: window.ReportGenerator.generateReportHtml(data) // 使用 ReportGenerator 生成 HTML 内容
        };

        sendReportButton.disabled = true;
        sendReportButton.textContent = '正在发送...';

        emailjs.send("YOUR_EMAILJS_SERVICE_ID", "YOUR_EMAILJS_TEMPLATE_ID", templateParams) // <-- 替换为您的 EmailJS 服务ID 和 模板ID
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
                alert('报告已成功发送至您的邮箱，请注意查收！');
                sendReportButton.textContent = '报告已发送！';
            }, function(error) {
                console.log('FAILED...', error);
                alert('报告发送失败，请稍后再试或检查邮箱地址。');
                sendReportButton.disabled = false;
                sendReportButton.textContent = '发送完整报告到邮箱';
            });
    }
});
