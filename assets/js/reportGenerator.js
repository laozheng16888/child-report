// reportGenerator.js - 负责根据数据生成报告的 HTML 内容

window.ReportGenerator = {
    /**
     * 根据孩子的星座和行为测评数据生成完整的HTML报告内容。
     * @param {object} data - 包含孩子姓名、星座信息、行为测评结果等的数据对象。
     * @returns {string} 包含完整报告内容的HTML字符串。
     */
    generateReportHtml: function(data) {
        const { name, birthDate, birthTime, sunSign, ascendantSign, moonSign, houses, behaviorResults } = data;

        // 辅助函数：根据行为结果生成总结
        function generateBehaviorSummary(results) {
            const summary = {};
            for (const key in results) {
                const tag = results[key];
                const parts = tag.split('/'); // 例如 "情绪表达型/易敏"
                parts.forEach(part => {
                    summary[part.trim()] = (summary[part.trim()] || 0) + 1;
                });
            }

            let summaryHtml = '<ul style="list-style: none; padding: 0;">';
            for (const tag in summary) {
                // 筛选出出现次数较多的关键标签
                if (summary[tag] > 1) { // 至少出现两次的标签
                    summaryHtml += `<li style="margin-bottom: 8px; padding-left: 15px; position: relative;"><span style="color: #4CAF50; font-weight: bold; font-size: 1.1em;">&#10003;</span> ${tag} (出现${summary[tag]}次)</li>`;
                }
            }
            summaryHtml += '</ul>';
            if (Object.keys(summary).length === 0) {
                 summaryHtml = '<p>暂无显著的行为偏向总结，请确认您是否完成了所有测评。</p>';
            }
            return summaryHtml;
        }

        // 辅助函数：根据星座和行为特征生成兴趣建议
        function generateInterestSuggestions(sunSign, behaviorTags) {
            let suggestions = [];
            const tagsString = JSON.stringify(behaviorTags); // 将行为标签转换为字符串方便搜索

            if (sunSign.includes("白羊座") || tagsString.includes("活力") || tagsString.includes("探索欲：高")) {
                suggestions.push("户外运动（跑步、球类）、探险游戏、跆拳道等能释放活力和挑战的项目。");
            }
            if (sunSign.includes("金牛座") || tagsString.includes("动手实践") || tagsString.includes("艺术/创意")) {
                suggestions.push("手工制作、烹饪、园艺、音乐（声乐或乐器）、绘画等艺术和实用技能。");
            }
            if (sunSign.includes("双子座") || tagsString.includes("语言型") || tagsString.includes("逻辑型")) {
                suggestions.push("阅读、写作、辩论、编程基础、语言学习、棋类游戏等需要思考和表达的项目。");
            }
            if (sunSign.includes("巨蟹座") || tagsString.includes("情感表达") || tagsString.includes("关怀")) {
                suggestions.push("亲子阅读、家庭游戏、志愿活动、小动物照护、绘画、音乐等培养情感和共情能力的项目。");
            }
            if (sunSign.includes("狮子座") || tagsString.includes("领导型") || tagsString.includes("自信")) {
                suggestions.push("表演、演讲、舞台剧、组织小型活动、绘画、舞蹈等能展现自我和获得关注的项目。");
            }
            if (sunSign.includes("处女座") || tagsString.includes("细致度：高") || tagsString.includes("逻辑型")) {
                suggestions.push("乐高、拼图、科学实验、编程、整理收纳、手工制作等需要耐心和细致的项目。");
            }
             if (sunSign.includes("天秤座") || tagsString.includes("协作") || tagsString.includes("社交：外向型")) {
                suggestions.push("团队运动、社交游戏、辩论、艺术鉴赏、合唱等需要平衡和合作的项目。");
            }
            if (sunSign.includes("天蝎座") || tagsString.includes("坚韧") || tagsString.includes("探索欲：高")) {
                suggestions.push("侦探游戏、科学探索、深度阅读、策略类游戏、心理学启蒙等需要洞察力和深度的项目。");
            }
            if (sunSign.includes("射手座") || tagsString.includes("探索欲：高") || tagsString.includes("外向型")) {
                suggestions.push("旅行、户外探险、外语学习、哲学启蒙、体育竞技等能扩展视野和体验新事物的项目。");
            }
            if (sunSign.includes("摩羯座") || tagsString.includes("纪律性") || tagsString.includes("成就驱动")) {
                suggestions.push("围棋、书法、长期项目（如种植、模型制作）、学习一门技艺（乐器、编程）等需要耐心和毅力的项目。");
            }
            if (sunSign.includes("水瓶座") || tagsString.includes("想象型") || tagsString.includes("探索欲：高")) {
                suggestions.push("编程、机器人、科学幻想、发明创造、天文学、环保活动等具有创新性和未来感的项目。");
            }
            if (sunSign.includes("双鱼座") || tagsString.includes("艺术/创意") || tagsString.includes("情感表达")) {
                suggestions.push("绘画、音乐、舞蹈、诗歌、电影鉴赏、志愿服务等能滋养心灵和发挥想象力的项目。");
            }

            if (suggestions.length === 0) {
                return "<p>基于现有信息，暂无明确兴趣建议。请继续观察孩子的日常喜好。</p>";
            }
            return `<ul style="list-style: decimal; padding-left: 20px;">${suggestions.map(s => `<li>${s}</li>`).join('')}</ul>`;
        }


        // 辅助函数：根据行为特征生成沟通与教育建议
        function generateCommunicationSuggestions(behaviorTags) {
            let suggestions = [];
            const tagsString = JSON.stringify(behaviorTags);

            if (tagsString.includes("情绪表达型/易敏")) {
                suggestions.push("当孩子情绪激动时，父母应先倾听，承认孩子的情绪，再引导其用语言表达，而不是立即制止或说教。");
            }
            if (tagsString.includes("情绪压抑/内敛")) {
                suggestions.push("鼓励孩子表达内心感受，创造安全宽松的家庭氛围，避免过度追问，用绘本或游戏引导孩子认识情绪。");
            }
            if (tagsString.includes("社交：内向/社交困难")) {
                suggestions.push("不强迫孩子社交，提供小范围、熟悉的环境进行互动，鼓励他们从少量高质量的朋友开始建立关系。");
            }
            if (tagsString.includes("专注力：易分散") || tagsString.includes("专注力：短暂")) {
                suggestions.push("采用番茄工作法或碎片化学习，每次专注15-20分钟，逐步延长。减少干扰，提供固定学习环境。");
            }
            if (tagsString.includes("适应性：弱/抗拒变化")) {
                suggestions.push("在变化发生前提前告知孩子，给予充分的心理准备时间，并通过模拟游戏帮助他们适应新情境。");
            }
            if (tagsString.includes("粗心大意") || tagsString.includes("细致度：低")) {
                suggestions.push("引导孩子检查作业或任务，从小培养整理习惯。不过度指责，而是提供方法和工具。");
            }
            if (tagsString.includes("抗压性：弱/回避")) {
                suggestions.push("鼓励孩子尝试小挑战，即使失败也肯定其努力。教导孩子如何分解大任务，逐步攻克。");
            }
            if (tagsString.includes("自控力：弱/自由散漫")) {
                suggestions.push("和孩子一起制定清晰的规则，并坚持执行。通过奖励和惩罚机制，逐步培养其自律意识。");
            }
            if (tagsString.includes("思维模式：直觉/跳跃")) {
                suggestions.push("鼓励孩子发散思维，同时引导他们用逻辑思考验证想法，培养严谨性。");
            }
            if (tagsString.includes("人际：害羞内敛")) {
                suggestions.push("父母可以作为桥梁，帮助孩子融入集体。创造一对一或小团体游戏机会，减少社交压力。");
            }
            if (tagsString.length === 0) {
                 return "<p>暂无特别的沟通与教育建议，您的孩子可能性格均衡，请继续保持积极的引导。</p>";
            }

            return `<ul style="list-style: decimal; padding-left: 20px;">${suggestions.map(s => `<li>${s}</li>`).join('')}</ul>`;
        }

        const behaviorSummaryHtml = generateBehaviorSummary(behaviorResults);
        const interestSuggestionsHtml = generateInterestSuggestions(sunSign, behaviorResults);
        const communicationSuggestionsHtml = generateCommunicationSuggestions(behaviorResults);

        return `
            <div style="font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif; line-height: 1.8; color: #333; max-width: 650px; margin: auto; padding: 25px; border: 1px solid #eee; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); background-color: #ffffff;">
                <h2 style="color: #4CAF50; text-align: center; font-size: 2em; margin-bottom: 15px;">《孩子的星座性格与成长建议报告》</h2>
                <p style="text-align: center; color: #666; font-size: 1.1em; margin-bottom: 30px;">（基于出生时间与行为习惯，生成个性化育儿指南）</p>
                <hr style="border: none; border-top: 1px dashed #ddd; margin: 30px 0;">

                <h3 style="color: #007BFF; font-size: 1.6em; margin-bottom: 20px; border-left: 5px solid #007BFF; padding-left: 10px;">💡 孩子基本信息</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                    <tr><td style="padding: 8px 0; font-weight: bold; width: 30%;">姓名（化名）：</td><td style="padding: 8px 0;">${name}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold;">出生日期：</td><td style="padding: 8px 0;">${birthDate}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold;">出生时间：</td><td style="padding: 8px 0;">${birthTime}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold;">太阳星座：</td><td style="padding: 8px 0; color: #d32f2f; font-weight: bold;">${sunSign}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold;">上升星座：</td><td style="padding: 8px 0;">${ascendantSign}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold;">月亮星座：</td><td style="padding: 8px 0;">${moonSign}</td></tr>
                    <tr><td style="padding: 8px 0; font-weight: bold;">宫位概览：</td><td style="padding: 8px 0;">${houses}</td></tr>
                </table>

                <h3 style="color: #007BFF; font-size: 1.6em; margin-bottom: 20px; border-left: 5px solid #007BFF; padding-left: 10px;">📈 行为测评总结</h3>
                <p style="margin-bottom: 15px;">根据您对孩子的行为测评结果，我们总结出以下显著性格偏向：</p>
                ${behaviorSummaryHtml}
                <p style="font-size: 0.9em; color: #888; margin-top: 20px;">
                    （行为测评结果能更具体地反映孩子在日常生活中的表现，是对星座特质的补充与细化。）
                </p>
                <hr style="border: none; border-top: 1px dashed #ddd; margin: 30px 0;">

                <h3 style="color: #007BFF; font-size: 1.6em; margin-bottom: 20px; border-left: 5px solid #007BFF; padding-left: 10px;">🌱 兴趣发展方向建议</h3>
                <p style="margin-bottom: 15px;">结合孩子的星座特质和行为偏向，以下是一些建议的兴趣培养路线：</p>
                ${interestSuggestionsHtml}
                <p style="font-size: 0.9em; color: #888; margin-top: 20px;">
                    （发掘和培养孩子的兴趣，能帮助他们更好地发展潜能，找到属于自己的闪光点。）
                </p>
                 <hr style="border: none; border-top: 1px dashed #ddd; margin: 30px 0;">

                <h3 style="color: #007BFF; font-size: 1.6em; margin-bottom: 20px; border-left: 5px solid #007BFF; padding-left: 10px;">🤝 沟通与教育建议</h3>
                <p style="margin-bottom: 15px;">作为父母，以下引导方式可能更适合您的孩子，帮助他们健康成长：</p>
                ${communicationSuggestionsHtml}
                <p style="font-size: 0.9em; color: #888; margin-top: 20px;">
                    （理解孩子的内在需求和行为模式，才能用更有效的方式与他们沟通，建立更亲密的亲子关系。）
                </p>
                <hr style="border: none; border-top: 1px dashed #ddd; margin: 30px 0;">

                <p style="text-align: center; font-style: italic; color: #888; font-size: 1.2em; margin-top: 40px;">
                    “孩子不是问题，是一束等待理解的光。”
                </p>
                <p style="text-align: center; font-size: 0.85em; color: #aaa; margin-top: 30px;">
                    本报告仅供参考，旨在提供育儿启发。请以孩子的实际情况为准，您的爱和耐心是孩子成长最好的养分。
                </p>
            </div>
        `;
    }
};
