/* logic.js - Universal Fixer */
document.addEventListener('DOMContentLoaded', () => {
    // 1. सही/गलत रंग (CSS) अपने आप डालना
    const style = document.createElement('style');
    style.textContent = `
        .opt.correct { border-color: #28a745 !important; background: #d4edda !important; }
        .opt.correct .circle { border-color: #28a745 !important; }
        .opt.correct .circle::after { background: #28a745 !important; content: ''; position: absolute; top: 3px; left: 3px; width: 8px; height: 8px; border-radius: 50%; }
        
        .opt.wrong { border-color: #dc3545 !important; background: #f8d7da !important; }
        .opt.wrong .circle { border-color: #dc3545 !important; }
        .opt.wrong .circle::after { background: #dc3545 !important; content: ''; position: absolute; top: 3px; left: 3px; width: 8px; height: 8px; border-radius: 50%; }

        .opt.selected { border-color: #007bff; background: #ebf8ff; }
        .opt.selected .circle { border-color: #007bff; }
        
        /* Sidebar Colors */
        .pal-btn.correct { background: #28a745 !important; border-color: #28a745 !important; color: white !important; }
        .pal-btn.wrong { background: #dc3545 !important; border-color: #dc3545 !important; color: white !important; }
        .pal-btn.attempted { background: #007bff; color: white; border-color: #007bff; }
    `;
    document.head.appendChild(style);

    // 2. पुराने गलत Logic को सही Logic से बदल देना
    window.load = function(i) {
        curQ = i;
        let d = qList[i];
        
        // Text
        let txt = d.t.replace(/\(([A-E])\)/g, '<span class="marker">($1)</span>');
        document.getElementById('q-txt').innerHTML = txt;
        document.getElementById('q-idx').innerText = 'Q' + (i+1);

        // Options
        let hasE = d.t.includes("(E)");
        let opts = ["(A)", "(B)", "(C)", "(D)"];
        if(hasE) opts.push("No Error (E)");
        else opts[3] = "No Error (D)"; 

        let h = '';
        opts.forEach((l, idx) => {
            let classes = "opt";
            // Selection Logic
            if(uAns[i] === idx) classes += " selected";
            
            // Result Logic (Submit ke baad)
            if(sub) {
                if(idx === d.a) classes += " correct"; // Right Answer Green
                else if(uAns[i] === idx && idx !== d.a) classes += " wrong"; // Your Wrong Answer Red
            }

            h += `<div class="${classes}" onclick="pick(${idx})">
                <div class="circle"></div><span>${l}</span>
            </div>`;
        });
        document.getElementById('opts').innerHTML = h;

        // Palette Active State
        document.querySelectorAll('.pal-btn').forEach(b => b.classList.remove('active'));
        if(document.getElementById('p'+i)) document.getElementById('p'+i).classList.add('active');

        // Solution Show/Hide
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
        document.getElementById('p'+curQ).classList.add('attempted'); // Blue Color on Click
        load(curQ);
    };

    window.submit = function() {
        clearInterval(tmr);
        sub = true;
        document.querySelector('.submit').style.display = 'none';
        let sc = 0;
        qList.forEach((q, i) => {
            let btn = document.getElementById('p'+i);
            btn.classList.remove('attempted'); // Blue Hatao
            
            if(uAns[i] === q.a) {
                sc += 1;
                btn.classList.add('correct'); // Green Lagao
            } else if(uAns[i] !== undefined) {
                sc -= 0.25;
                btn.classList.add('wrong'); // Red Lagao
            }
        });
        alert('Score: ' + sc + ' / ' + qList.length);
        load(curQ);
    };
});
