/* logic.js - Universal Fixer for All Mock Tests */
document.addEventListener("DOMContentLoaded", function() {
    
    // --- 1. Universal CSS Injection (सही/गलत रंगों के लिए) ---
    const style = document.createElement('style');
    style.innerHTML = `
        /* === Main Options Colors === */
        /* Correct (Green) */
        .opt.correct, .option-item.correct { border-color: #28a745 !important; background: #d4edda !important; }
        .opt.correct .circle, .option-item.correct .radio-circle { border-color: #28a745 !important; }
        .opt.correct .circle::after, .option-item.correct .radio-circle::after { background: #28a745 !important; content: ''; position: absolute; top: 3px; left: 3px; width: 8px; height: 8px; border-radius: 50%; }
        
        /* Wrong (Red) */
        .opt.wrong, .option-item.wrong { border-color: #dc3545 !important; background: #f8d7da !important; }
        .opt.wrong .circle, .option-item.wrong .radio-circle { border-color: #dc3545 !important; }
        .opt.wrong .circle::after, .option-item.wrong .radio-circle::after { background: #dc3545 !important; content: ''; position: absolute; top: 3px; left: 3px; width: 8px; height: 8px; border-radius: 50%; }

        /* Selected (Blue) - Before Submit */
        .opt.selected, .option-item.selected { border-color: #007bff !important; background: #ebf8ff !important; }
        .opt.selected .circle, .option-item.selected .radio-circle { border-color: #007bff !important; }
        .opt.selected .circle::after, .option-item.selected .radio-circle::after { background: #007bff !important; content: ''; width: 8px; height: 8px; border-radius: 50%; position: absolute; top: 3px; left: 3px; }
        
        /* === Palette (Sidebar) Colors === */
        /* Attempted (Blue) */
        .pal-btn.attempted, .p-btn.attempted { background: #007bff !important; color: white !important; border-color: #007bff !important; }
        
        /* Correct Result (Green) */
        .pal-btn.correct, .p-btn.correct { background: #28a745 !important; border-color: #28a745 !important; color: white !important; }
        
        /* Wrong Result (Red) */
        .pal-btn.wrong, .p-btn.wrong { background: #dc3545 !important; border-color: #dc3545 !important; color: white !important; }
    `;
    document.head.appendChild(style);


    // --- 2. Logic Detection & Override (Smart Fixer) ---

    // TYPE A FILES: (Verbs, Adverb, Voice, Narration, Conjunction, Superfluous, Tense)
    // पहचान: इनमें 'load', 'pick' और 'submit' फंक्शन हैं।
    if (typeof window.load === 'function' && typeof window.submit === 'function') {
        
        // Override 'load' 
        window.load = function(i) {
            curQ = i;
            let d = qList[i];
            
            // Text
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
                if(uAns[i] === idx) classes += " selected";
                
                if(sub) {
                    if(idx === d.a) classes += " correct";
                    else if(uAns[i] === idx && idx !== d.a) classes += " wrong";
                }

                h += `<div class="${classes}" onclick="pick(${idx})">
                    <div class="circle"></div><span>${l}</span>
                </div>`;
            });
            document.getElementById('opts').innerHTML = h;

            // Palette Active State
            document.querySelectorAll('.pal-btn').forEach(b => b.classList.remove('active'));
            if(document.getElementById('p'+i)) document.getElementById('p'+i).classList.add('active');

            if(sub) {
                document.getElementById('sol').style.display = 'block';
                document.getElementById('sol-txt').innerText = d.s;
            } else {
                document.getElementById('sol').style.display = 'none';
            }
        };

        // Override 'pick' (Click करते ही Blue)
        window.pick = function(o) {
            if(sub) return;
            uAns[curQ] = o;
            let btn = document.getElementById('p'+curQ);
            if(btn) btn.classList.add('attempted'); 
            load(curQ);
        };

        // Override 'submit' (Submit के बाद Red/Green)
        window.submit = function() {
            clearInterval(tmr);
            sub = true;
            document.querySelector('.submit').style.display = 'none';
            let sc = 0;
            qList.forEach((q, i) => {
                let btn = document.getElementById('p'+i);
                if(btn) {
                    btn.classList.remove('attempted'); // Blue हटाओ
                    if(uAns[i] === q.a) {
                        sc += 1;
                        btn.classList.add('correct'); // Green लगाओ
                    } else if(uAns[i] !== undefined) {
                        sc -= 0.25;
                        btn.classList.add('wrong'); // Red लगाओ
                    }
                }
            });
            alert('Score: ' + sc + ' / ' + qList.length);
            load(curQ);
        };
    }

    // TYPE B FILES: (Articles, Nouns, Pronoun, Subject-Verb, Adjectives)
    // पहचान: इनमें 'loadQuestion', 'selectOption' और 'submitTest' फंक्शन हैं।
    else if (typeof window.loadQuestion === 'function' && typeof window.submitTest === 'function') {
        
        // Override 'loadQuestion'
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
                const isSelected = userAnswers[idx] === i;
                if(isSelected) classes += " selected";
                
                if(isSubmitted) {
                    if(i === qData.ans) classes += " correct";
                    else if(isSelected && i !== qData.ans) classes += " wrong";
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

        // Override 'selectOption' (Click करते ही Blue)
        window.selectOption = function(optIndex) {
            if(isSubmitted) return;
            userAnswers[currentIdx] = optIndex;
            let btn = document.getElementById(`pal-${currentIdx}`);
            if(btn) {
                btn.classList.remove('answered'); // पुराना क्लास हटाओ
                btn.classList.add('attempted'); // नया Blue क्लास
            }
            loadQuestion(currentIdx);
        };

        // Override 'submitTest' (Submit के बाद Red/Green)
        window.submitTest = function() {
            clearInterval(timerRef);
            isSubmitted = true;
            document.querySelector('.submit-btn').style.display = 'none';
            
            let score = 0;
            setQuestions.forEach((q, i) => {
                let btn = document.getElementById(`pal-${i}`);
                if(btn) {
                    btn.classList.remove('attempted', 'answered', 'not-answered');
                    if(userAnswers[i] === q.ans) {
                        score += 1;
                        btn.classList.add('correct'); // Green
                    } else if(userAnswers[i] !== undefined) {
                        score -= 0.25;
                        btn.classList.add('wrong'); // Red
                    }
                }
            });
            
            alert(`Test Finished!\nScore: ${score} / ${setQuestions.length}`);
            loadQuestion(currentIdx); 
        };
    }

});
