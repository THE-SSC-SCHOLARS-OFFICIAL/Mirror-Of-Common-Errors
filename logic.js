/* logic.js - Final Fix: Ensures Red/Green overwrites Blue after Submit */
document.addEventListener("DOMContentLoaded", function() {
    
    // --- 1. CSS Injection (Strong Colors) ---
    const style = document.createElement('style');
    style.innerHTML = `
        /* === OPTIONS COLORS === */
        
        /* 1. SELECTION (Blue) - Before Submit */
        .opt.selected, .option-item.selected { 
            border-color: #007bff !important; 
            background-color: #ebf8ff !important; 
        }
        .opt.selected .circle, .option-item.selected .radio-circle { 
            border-color: #007bff !important; 
        }
        .opt.selected .circle::after, .option-item.selected .radio-circle::after { 
            background: #007bff !important; 
            content: ''; position: absolute; top: 3px; left: 3px; width: 8px; height: 8px; border-radius: 50%; 
        }

        /* 2. CORRECT (Green) - After Submit */
        .opt.correct, .option-item.correct { 
            border-color: #28a745 !important; 
            background-color: #d4edda !important; 
            color: #155724 !important;
        }
        .opt.correct .circle, .option-item.correct .radio-circle { 
            border-color: #28a745 !important; 
        }
        .opt.correct .circle::after, .option-item.correct .radio-circle::after { 
            background: #28a745 !important; 
            content: ''; position: absolute; top: 3px; left: 3px; width: 8px; height: 8px; border-radius: 50%; 
        }
        
        /* 3. WRONG (Red) - After Submit */
        .opt.wrong, .option-item.wrong { 
            border-color: #dc3545 !important; 
            background-color: #f8d7da !important; 
            color: #721c24 !important;
        }
        .opt.wrong .circle, .option-item.wrong .radio-circle { 
            border-color: #dc3545 !important; 
        }
        .opt.wrong .circle::after, .option-item.wrong .radio-circle::after { 
            background: #dc3545 !important; 
            content: ''; position: absolute; top: 3px; left: 3px; width: 8px; height: 8px; border-radius: 50%; 
        }

        /* === PALETTE COLORS === */
        .pal-btn.attempted, .p-btn.attempted { background: #007bff !important; color: white !important; border-color: #007bff !important; }
        .pal-btn.correct, .p-btn.correct { background: #28a745 !important; border-color: #28a745 !important; color: white !important; }
        .pal-btn.wrong, .p-btn.wrong { background: #dc3545 !important; border-color: #dc3545 !important; color: white !important; }

        /* === RESULT MODAL === */
        .result-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 9999; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(5px); }
        .result-card { background: white; width: 90%; max-width: 450px; padding: 30px; border-radius: 20px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.3); animation: popIn 0.3s ease-out; }
        @keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .score-circle { width: 120px; height: 120px; margin: 0 auto 20px; border-radius: 50%; border: 8px solid #007bff; display: flex; flex-direction: column; justify-content: center; align-items: center; color: #007bff; }
        .score-val { font-size: 2.5rem; font-weight: 800; line-height: 1; }
        .score-label { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 25px; }
        .stat-box { padding: 10px; border-radius: 10px; color: white; }
        .stat-box h3 { margin: 0; font-size: 1.5rem; }
        .stat-box p { margin: 0; font-size: 0.8rem; opacity: 0.9; }
        .bg-green { background: #28a745; }
        .bg-red { background: #dc3545; }
        .bg-gray { background: #6c757d; }
        .btn-review { background: #007bff; color: white; border: none; padding: 12px 30px; border-radius: 50px; font-weight: bold; font-size: 1rem; cursor: pointer; transition: 0.2s; width: 100%; }
        .btn-review:hover { background: #0056b3; transform: translateY(-2px); }
        .btn-home { background: transparent; color: #666; border: none; margin-top: 15px; cursor: pointer; text-decoration: underline; }
    `;
    document.head.appendChild(style);

    // --- Analysis Logic ---
    window.showAnalysis = function(total, correct, wrong, score, callback) {
        const skipped = total - (correct + wrong);
        const html = `
            <div class="result-overlay">
                <div class="result-card">
                    <h2 style="margin:0 0 20px; color:#333;">Test Result</h2>
                    <div class="score-circle">
                        <span class="score-val">${score}</span>
                        <span class="score-label">Score</span>
                    </div>
                    <div class="stats-grid">
                        <div class="stat-box bg-green"><h3>${correct}</h3><p>Correct</p></div>
                        <div class="stat-box bg-red"><h3>${wrong}</h3><p>Wrong</p></div>
                        <div class="stat-box bg-gray"><h3>${skipped}</h3><p>Skipped</p></div>
                    </div>
                    <button class="btn-review" onclick="closeResult()">Review Solutions</button>
                    <button class="btn-home" onclick="window.location.href='index.html'">Back to Dashboard</button>
                </div>
            </div>`;
        const div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div);
        window.closeResult = function() { div.remove(); if(callback) callback(); };
    };

    // --- LOGIC TYPE A (Verbs, Voice, Narration, Tenses etc.) ---
    if (typeof window.load === 'function' && typeof window.submit === 'function') {
        
        window.load = function(i) {
            curQ = i;
            let d = qList[i];
            
            let txt = d.t.replace(/\(([A-E])\)/g, '<span class="marker">($1)</span>');
            document.getElementById('q-txt').innerHTML = txt;
            document.getElementById('q-idx').innerText = 'Q' + (i+1);

            let hasE = d.t.includes("(E)");
            let opts = ["(A)", "(B)", "(C)", "(D)"];
            if(hasE) opts.push("No Error (E)");
            else opts[3] = "No Error (D)"; 

            let h = '';
            opts.forEach((l, idx) => {
                let classes = "opt";
                
                // IMPORTANT: Logic to switch colors
                if(sub) {
                    // अगर सबमिट हो गया है:
                    if (idx === d.a) {
                        classes += " correct"; // सही जवाब -> Green
                    } else if (uAns[i] === idx) {
                        classes += " wrong";   // यूजर का गलत जवाब -> Red
                    }
                } else {
                    // अगर सबमिट नहीं हुआ है:
                    if(uAns[i] === idx) classes += " selected"; // सिर्फ Blue
                }

                h += `<div class="${classes}" onclick="pick(${idx})">
                    <div class="circle"></div><span>${l}</span>
                </div>`;
            });
            document.getElementById('opts').innerHTML = h;

            document.querySelectorAll('.pal-btn').forEach(b => b.classList.remove('active'));
            if(document.getElementById('p'+i)) document.getElementById('p'+i).classList.add('active');

            if(sub) {
                document.getElementById('sol').style.display = 'block';
                document.getElementById('sol-txt').innerText = d.s;
            } else {
                document.getElementById('sol').style.display = 'none';
            }
        };

        window.pick = function(o) {
            if(sub) return;
            uAns[curQ] = o;
            let btn = document.getElementById('p'+curQ);
            if(btn) btn.classList.add('attempted');
            load(curQ);
        };

        window.submit = function() {
            clearInterval(tmr);
            sub = true;
            document.querySelector('.submit').style.display = 'none';
            
            let score = 0, correct = 0, wrong = 0;
            qList.forEach((q, i) => {
                let btn = document.getElementById('p'+i);
                if(btn) {
                    btn.classList.remove('attempted'); // Blue हटाओ
                    if(uAns[i] === q.a) {
                        score += 1; correct++;
                        btn.classList.add('correct'); // Green लगाओ
                    } else if(uAns[i] !== undefined) {
                        score -= 0.25; wrong++;
                        btn.classList.add('wrong'); // Red लगाओ
                    }
                }
            });
            showAnalysis(qList.length, correct, wrong, score, () => load(curQ));
        };
    }

    // --- LOGIC TYPE B (Articles, Noun, Pronoun etc.) ---
    else if (typeof window.loadQuestion === 'function' && typeof window.submitTest === 'function') {
        
        window.loadQuestion = function(idx) {
            currentIdx = idx;
            const qData = setQuestions[idx];
            
            let formattedText = qData.q.replace(/\((A|B|C|D|E)\)/g, '<span class="highlight-part">($1)</span>');
            document.getElementById('q-text').innerHTML = formattedText;
            document.getElementById('q-num-disp').innerText = `Question ${idx+1}`;

            const optContainer = document.getElementById('options-container');
            const labels = ["(A)", "(B)", "(C)", "(D)", "No Error (E)"]; 
            
            optContainer.innerHTML = labels.map((label, i) => {
                let classes = "option-item";
                
                // IMPORTANT: Logic to switch colors
                if(isSubmitted) {
                    // सबमिट के बाद
                    if(i === qData.ans) {
                        classes += " correct"; // Green
                    } else if(userAnswers[idx] === i) {
                        classes += " wrong";   // Red
                    }
                } else {
                    // सबमिट से पहले
                    if(userAnswers[idx] === i) classes += " selected"; // Blue
                }

                return `
                <div class="${classes}" onclick="selectOption(${i})">
                    <div class="radio-circle"></div>
                    <span class="opt-label">${label}</span>
                </div>`;
            }).join('');

            document.querySelectorAll('.p-btn').forEach(el => el.classList.remove('active'));
            if(document.getElementById(`pal-${idx}`)) document.getElementById(`pal-${idx}`).classList.add('active');

            const solBox = document.getElementById('solution-box');
            if(isSubmitted) {
                solBox.style.display = 'block';
                document.getElementById('sol-text').innerText = qData.sol;
            } else {
                solBox.style.display = 'none';
            }
        };

        window.selectOption = function(optIndex) {
            if(isSubmitted) return;
            userAnswers[currentIdx] = optIndex;
            let btn = document.getElementById(`pal-${currentIdx}`);
            if(btn) {
                btn.classList.remove('answered');
                btn.classList.add('attempted');
            }
            loadQuestion(currentIdx);
        };

        window.submitTest = function() {
            clearInterval(timerRef);
            isSubmitted = true;
            document.querySelector('.submit-btn').style.display = 'none';
            
            let score = 0, correct = 0, wrong = 0;
            setQuestions.forEach((q, i) => {
                let btn = document.getElementById(`pal-${i}`);
                if(btn) {
                    btn.classList.remove('attempted', 'answered', 'not-answered');
                    if(userAnswers[i] === q.ans) {
                        score += 1; correct++;
                        btn.classList.add('correct');
                    } else if(userAnswers[i] !== undefined) {
                        score -= 0.25; wrong++;
                        btn.classList.add('wrong');
                    }
                }
            });
            showAnalysis(setQuestions.length, correct, wrong, score, () => loadQuestion(currentIdx));
        };
    }
});
