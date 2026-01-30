/* logic.js - Fixes Colors for Options & Palette (Green=Right, Red=Wrong) */
document.addEventListener("DOMContentLoaded", function() {
    
    // --- 1. Universal CSS (Option & Palette Colors) ---
    const style = document.createElement('style');
    style.innerHTML = `
        /* === OPTIONS COLORS (After Submit) === */
        
        /* Correct Answer = GREEN */
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
        
        /* Wrong Answer = RED */
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

        /* Selected (Before Submit) = BLUE */
        .opt.selected, .option-item.selected { 
            border-color: #007bff !important; 
            background-color: #ebf8ff !important; 
        }
        
        /* === PALETTE (SIDEBAR) COLORS === */
        
        /* Attempted = BLUE */
        .pal-btn.attempted, .p-btn.attempted { 
            background: #007bff !important; 
            color: white !important; 
            border-color: #007bff !important; 
        }
        
        /* Correct Result = GREEN */
        .pal-btn.correct, .p-btn.correct { 
            background: #28a745 !important; 
            border-color: #28a745 !important; 
            color: white !important; 
        }
        
        /* Wrong Result = RED */
        .pal-btn.wrong, .p-btn.wrong { 
            background: #dc3545 !important; 
            border-color: #dc3545 !important; 
            color: white !important; 
        }
    `;
    document.head.appendChild(style);


    // --- 2. Logic Override (Detects File Type & Fixes Logic) ---

    // TYPE A: (Verbs, Voice, Narration etc. -> uses 'load' & 'pick')
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
                if(uAns[i] === idx) classes += " selected"; // Blue if selected
                
                if(sub) {
                    if(idx === d.a) classes += " correct"; // Right Answer -> Green
                    else if(uAns[i] === idx && idx !== d.a) classes += " wrong"; // Your Wrong Answer -> Red
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
            if(btn) btn.classList.add('attempted'); // Click -> Blue
            load(curQ);
        };

        window.submit = function() {
            clearInterval(tmr);
            sub = true;
            document.querySelector('.submit').style.display = 'none';
            let sc = 0;
            qList.forEach((q, i) => {
                let btn = document.getElementById('p'+i);
                if(btn) {
                    btn.classList.remove('attempted'); // Blue remove
                    if(uAns[i] === q.a) {
                        sc += 1;
                        btn.classList.add('correct'); // Right -> Green
                    } else if(uAns[i] !== undefined) {
                        sc -= 0.25;
                        btn.classList.add('wrong'); // Wrong -> Red
                    }
                }
            });
            alert('Score: ' + sc + ' / ' + qList.length);
            load(curQ);
        };
    }

    // TYPE B: (Articles, Noun, Pronoun etc. -> uses 'loadQuestion' & 'submitTest')
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
                const isSelected = userAnswers[idx] === i;
                if(isSelected) classes += " selected";
                
                if(isSubmitted) {
                    if(i === qData.ans) classes += " correct"; // Right Answer -> Green
                    else if(isSelected && i !== qData.ans) classes += " wrong"; // Your Wrong Answer -> Red
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
                btn.classList.add('attempted'); // Click -> Blue
            }
            loadQuestion(currentIdx);
        };

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
                        btn.classList.add('correct'); // Right -> Green
                    } else if(userAnswers[i] !== undefined) {
                        score -= 0.25;
                        btn.classList.add('wrong'); // Wrong -> Red
                    }
                }
            });
            
            alert(`Test Finished!\nScore: ${score} / ${setQuestions.length}`);
            loadQuestion(currentIdx); 
        };
    }

});
