document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const audioFileInput = document.getElementById('audioFile');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const audioPreview = document.getElementById('audioPreview');
    const audioPlayer = document.getElementById('audioPlayer');
    const removeAudioBtn = document.getElementById('removeAudioBtn');
    const fileInfo = document.getElementById('fileInfo');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const loading = document.getElementById('loading');
    const resultsSection = document.getElementById('resultsSection');
    const timestamp = document.getElementById('timestamp');
    const riskValue = document.getElementById('riskValue');
    const riskLevel = document.getElementById('riskLevel');
    const riskDescription = document.getElementById('riskDescription');
    const meterFill = document.getElementById('meterFill');
    const reportContent = document.getElementById('reportContent');
    
    let emotionChart, intensityChart;
    
    // 初始化事件
    selectFileBtn.addEventListener('click', () => audioFileInput.click());
    audioFileInput.addEventListener('change', handleFileSelect);
    removeAudioBtn.addEventListener('click', resetUpload);
    analyzeBtn.addEventListener('click', analyzeEmotion);
    
    // 拖放功能
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });
    
    function handleFileSelect(e) {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    }
    
    function handleFile(file) {
        if (!file.type.startsWith('audio/')) {
            alert('请选择音频文件');
            return;
        }
        
        if (file.size > 50 * 1024 * 1024) {
            alert('文件大小不能超过50MB');
            return;
        }
        
        fileInfo.textContent = `文件名: ${file.name} | 大小: ${formatFileSize(file.size)}`;
        
        const objectUrl = URL.createObjectURL(file);
        audioPlayer.src = objectUrl;
        audioPreview.style.display = 'flex';
        uploadArea.style.display = 'none';
        analyzeBtn.disabled = false;
    }
    
    function resetUpload() {
        audioFileInput.value = '';
        audioPlayer.src = '';
        audioPreview.style.display = 'none';
        uploadArea.style.display = 'block';
        fileInfo.textContent = '';
        analyzeBtn.disabled = true;
        resultsSection.style.display = 'none';
        if (emotionChart) emotionChart.destroy();
        if (intensityChart) intensityChart.destroy();
    }
    
    function analyzeEmotion() {
        analyzeBtn.style.display = 'none';
        loading.style.display = 'block';
        
        setTimeout(() => {
            const file = audioFileInput.files[0];
            if (!file) return;
            
            const analysisResult = simulateEmotionAnalysis(file);
            displayResults(analysisResult);
            
            loading.style.display = 'none';
            analyzeBtn.style.display = 'block';
        }, 2000);
    }
    
    function simulateEmotionAnalysis(file) {
        const seed = file.size + file.name.length;
        const random = (min, max) => min + (seed % (max - min + 1));
        
        const emotions = {
            calm: random(30, 60),
            tense: random(10, 30),
            angry: random(5, 20),
            excited: random(5, 25)
        };
        
        const total = emotions.calm + emotions.tense + emotions.angry + emotions.excited;
        Object.keys(emotions).forEach(key => {
            emotions[key] = Math.round((emotions[key] / total) * 100);
        });
        
        const conflictRisk = Math.min(100, emotions.tense * 0.6 + emotions.angry * 0.8 + emotions.excited * 0.4);
        
        const intensityData = [];
        for (let i = 0; i < 20; i++) {
            intensityData.push(Math.random() * 80 + 20);
        }
        
        return {
            emotions,
            conflictRisk: Math.round(conflictRisk),
            intensityData,
            timestamp: new Date().toLocaleString('zh-CN')
        };
    }
    
    function displayResults(result) {
        timestamp.textContent = result.timestamp;
        resultsSection.style.display = 'block';
        createEmotionChart(result.emotions);
        createIntensityChart(result.intensityData);
        updateRiskIndicator(result.conflictRisk, result.emotions);
        generateReport(result);
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    function createEmotionChart(emotions) {
        const ctx = document.getElementById('emotionChart').getContext('2d');
        if (emotionChart) emotionChart.destroy();
        
        emotionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['平静', '紧张', '愤怒', '兴奋'],
                datasets: [{
                    data: [emotions.calm, emotions.tense, emotions.angry, emotions.excited],
                    backgroundColor: ['#4CAF50', '#FFC107', '#F44336', '#9C27B0'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    function createIntensityChart(intensityData) {
        const ctx = document.getElementById('intensityChart').getContext('2d');
        if (intensityChart) intensityChart.destroy();
        
        intensityChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: intensityData.map((_, i) => `${i + 1}`),
                datasets: [{
                    label: '情绪强度',
                    data: intensityData,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
    
    function updateRiskIndicator(risk, emotions) {
        riskValue.textContent = risk + '%';
        meterFill.style.width = risk + '%';
        
        let level, description;
        if (risk < 30) {
            level = '低风险';
            description = '对话氛围良好，情绪平稳，冲突可能性低。';
            meterFill.style.background = '#48bb78';
        } else if (risk < 60) {
            level = '中等风险';
            description = '检测到一定紧张情绪，建议注意对话走向。';
            meterFill.style.background = '#ecc94b';
        } else {
            level = '高风险';
            description = '检测到强烈负面情绪，冲突风险较高，建议及时干预。';
            meterFill.style.background = '#f56565';
        }
        
        riskLevel.textContent = level;
        riskDescription.textContent = description;
    }
    
    function generateReport(result) {
        const { emotions, conflictRisk } = result;
        
        let reportHTML = `
            <div class="report-item">
                <h4>情绪分布总结</h4>
                <p>分析显示，对话中主要情绪为：${getDominantEmotion(emotions)}。</p>
                <ul>
                    <li>平静: ${emotions.calm}%</li>
                    <li>紧张: ${emotions.tense}%</li>
                    <li>愤怒: ${emotions.angry}%</li>
                    <li>兴奋: ${emotions.excited}%</li>
                </ul>
            </div>
            
            <div class="report-item">
                <h4>冲突风险评估</h4>
                <p>当前冲突风险指数为 <strong>${conflictRisk}%</strong>。</p>
                <p>${getRiskAdvice(conflictRisk)}</p>
            </div>
        `;
        
        reportContent.innerHTML = reportHTML;
    }
    
    function getDominantEmotion(emotions) {
        let maxValue = 0;
        let dominantEmotion = '';
        
        for (const [emotion, value] of Object.entries(emotions)) {
            if (value > maxValue) {
                maxValue = value;
                dominantEmotion = emotion;
            }
        }
        
        const emotionNames = { calm: '平静', tense: '紧张', angry: '愤怒', excited: '兴奋' };
        return emotionNames[dominantEmotion] || '平静';
    }
    
    function getRiskAdvice(risk) {
        if (risk < 30) return '当前对话氛围良好，继续保持积极沟通即可。';
        if (risk < 60) return '建议关注对话中的紧张情绪，适时引导话题走向更积极的方向。';
        return '检测到较高冲突风险，建议暂停当前话题，先处理情绪再继续讨论。';
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});
