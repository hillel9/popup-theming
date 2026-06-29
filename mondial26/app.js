// Mondial 2026 Pronostic App - CSV-driven display

const POINTS_EXACT = 3;
const POINTS_WINNER = 1;

let matches = [];
let currentRound = 'R32';

// CSV Parsing
async function loadCSV() {
    try {
        const response = await fetch('matches.csv');
        const text = await response.text();
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',');

        matches = lines.slice(1).filter(line => line.trim()).map(line => {
            const values = line.split(',');
            const obj = {};
            headers.forEach((h, i) => obj[h.trim()] = values[i]?.trim() || '');
            return obj;
        });

        render();
    } catch (e) {
        document.getElementById('matches').innerHTML = `
            <div class="empty">Error: run <code>start.command</code> to launch the server</div>`;
    }
}

// Scoring - qualifier can be team name or 1/2
function fuzzyMatch(a, b) {
    // Check if two strings share a 3+ char substring
    a = a.toLowerCase();
    b = b.toLowerCase();
    if (a === b || a.includes(b) || b.includes(a)) return true;
    for (let i = 0; i <= a.length - 3; i++) {
        if (b.includes(a.substring(i, i + 3))) return true;
    }
    return false;
}

function resolveQualifier(qualifier, team1, team2) {
    if (!qualifier) return 0;
    if (qualifier === '1') return 1;
    if (qualifier === '2') return 2;
    if (fuzzyMatch(qualifier, team1)) return 1;
    if (fuzzyMatch(qualifier, team2)) return 2;
    return 0;
}

function getWinner(score1, score2, qualifier, team1, team2) {
    const s1 = parseInt(score1);
    const s2 = parseInt(score2);
    if (isNaN(s1) || isNaN(s2)) return null;
    // Qualifier is always the source of truth
    return resolveQualifier(qualifier, team1, team2);
}

function calculatePoints(m, player) {
    const p1 = parseInt(m[`${player}_Score1`]);
    const p2 = parseInt(m[`${player}_Score2`]);
    const r1 = parseInt(m.Result_Score1);
    const r2 = parseInt(m.Result_Score2);

    if (isNaN(p1) || isNaN(p2) || isNaN(r1) || isNaN(r2)) return null;

    const predQual = resolveQualifier(m[`${player}_Qualifier`], m.Team1, m.Team2);
    const resQual = resolveQualifier(m.Result_Qualifier, m.Team1, m.Team2);

    // Exact score: compare sorted scores (order in CSV doesn't matter)
    const predHigh = Math.max(p1, p2), predLow = Math.min(p1, p2);
    const resHigh = Math.max(r1, r2), resLow = Math.min(r1, r2);

    if (predHigh === resHigh && predLow === resLow) {
        if (p1 === p2) {
            // Draw — must also match qualifier for full points
            return predQual === resQual ? POINTS_EXACT : POINTS_WINNER;
        }
        // Same score, same winner = exact
        if (predQual === resQual) return POINTS_EXACT;
        // Same score but different winner = just correct score shape
        return 0;
    }

    // Correct winner
    if (predQual && resQual && predQual === resQual) return POINTS_WINNER;

    return 0;
}

function getTotalScore(player) {
    let total = 0;
    matches.forEach(m => {
        const pts = calculatePoints(m, player);
        if (pts !== null) total += pts;
    });
    return total;
}

// Rendering
function render() {
    renderScoreboard();
    renderRoundButtons();
    renderMatches();
}

function renderScoreboard() {
    document.getElementById('score-hillel').textContent = getTotalScore('Hillel');
    document.getElementById('score-yannai').textContent = getTotalScore('Yannai');
    document.getElementById('score-noam').textContent = getTotalScore('Noam');
}

function renderRoundButtons() {
    const rounds = [...new Set(matches.map(m => m.Round))];
    const container = document.getElementById('rounds');
    container.innerHTML = rounds.map(r =>
        `<button class="round-btn ${r === currentRound ? 'active' : ''}" data-round="${r}">${r}</button>`
    ).join('');

    container.querySelectorAll('.round-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentRound = btn.dataset.round;
            render();
        });
    });
}

function renderMatches() {
    const container = document.getElementById('matches');
    const roundMatches = matches.filter(m => m.Round === currentRound);

    if (roundMatches.length === 0) {
        container.innerHTML = `<div class="empty">No matches for this round yet.</div>`;
        return;
    }

    container.innerHTML = roundMatches.map(m => renderMatchCard(m)).join('');
}

function renderMatchCard(m) {
    const hasResult = m.Result_Score1 !== '' && m.Result_Score2 !== '';
    const hasPredH = m.Hillel_Score1 !== '' && m.Hillel_Score2 !== '';
    const hasPredY = m.Yannai_Score1 !== '' && m.Yannai_Score2 !== '';
    const hasPredN = m.Noam_Score1 !== '' && m.Noam_Score2 !== '';

    const ptsH = calculatePoints(m, 'Hillel');
    const ptsY = calculatePoints(m, 'Yannai');
    const ptsN = calculatePoints(m, 'Noam');

    // Format a prediction/result as "Winner (X-Y)" or "Winner (X-X, pen)"
    // Qualifier is the source of truth for who wins
    const formatScore = (score1, score2, qualifier, team1, team2) => {
        const s1 = parseInt(score1);
        const s2 = parseInt(score2);
        if (isNaN(s1) || isNaN(s2)) return '-';

        const q = resolveQualifier(qualifier, team1, team2);
        const winner = q === 1 ? team1 : q === 2 ? team2 : '?';
        const high = Math.max(s1, s2);
        const low = Math.min(s1, s2);

        if (s1 === s2) {
            return `${winner} (${s1}-${s2}, pen)`;
        }
        return `${winner} (${high}-${low})`;
    };

    return `
        <div class="match-card ${hasResult ? 'played' : ''}">
            <div class="match-header">
                <span class="match-date">${m.Date}</span>
                <span class="match-status ${hasResult ? 'played' : 'upcoming'}">
                    ${hasResult ? 'Played' : 'Upcoming'}
                </span>
            </div>
            <div class="match-teams">
                <span class="team-name">${m.Team1}</span>
                <span class="score-box">${hasResult ? m.Result_Score1 : ''}</span>
                <span class="score-separator">${hasResult ? '-' : 'vs'}</span>
                <span class="score-box">${hasResult ? m.Result_Score2 : ''}</span>
                <span class="team-name">${m.Team2}</span>
            </div>
            ${hasResult && parseInt(m.Result_Score1) === parseInt(m.Result_Score2) ? `<div class="pen-info">pen: ${m.Result_Qualifier}</div>` : ''}
            <div class="predictions">
                <div class="prediction-item hillel">
                    <div class="pred-player">
                        <img src="hillel.jpeg" class="pred-avatar">
                        <span class="pred-name">Hillel</span>
                    </div>
                    <div class="pred-result">
                        <span class="value">${hasPredH ? formatScore(m.Hillel_Score1, m.Hillel_Score2, m.Hillel_Qualifier, m.Team1, m.Team2) : '-'}</span>
                        ${ptsH !== null ? `<span class="points-badge pts-${ptsH}">+${ptsH}</span>` : ''}
                    </div>
                </div>
                <div class="prediction-item yannai">
                    <div class="pred-player">
                        <img src="yannai.jpeg" class="pred-avatar">
                        <span class="pred-name">Yannai</span>
                    </div>
                    <div class="pred-result">
                        <span class="value">${hasPredY ? formatScore(m.Yannai_Score1, m.Yannai_Score2, m.Yannai_Qualifier, m.Team1, m.Team2) : '-'}</span>
                        ${ptsY !== null ? `<span class="points-badge pts-${ptsY}">+${ptsY}</span>` : ''}
                    </div>
                </div>
                <div class="prediction-item noam">
                    <div class="pred-player">
                        <img src="noam.png" class="pred-avatar">
                        <span class="pred-name">Noam</span>
                    </div>
                    <div class="pred-result">
                        <span class="value">${hasPredN ? formatScore(m.Noam_Score1, m.Noam_Score2, m.Noam_Qualifier, m.Team1, m.Team2) : '-'}</span>
                        ${ptsN !== null ? `<span class="points-badge pts-${ptsN}">+${ptsN}</span>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Init
document.addEventListener('DOMContentLoaded', loadCSV);
