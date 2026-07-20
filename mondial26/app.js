// Mondial 2026 Pronostic App - CSV-driven display

const POINTS_EXACT = 3;
const POINTS_WINNER = 1;
const PLAYERS = ['Hillel', 'Yannai', 'Noam'];
const AVATARS = { Hillel: 'hillel.jpeg', Yannai: 'yannai.jpeg', Noam: 'noam.png' };

let matches = [];
let currentRound = 'F';
let currentView = 'home';

const ROUND_LABELS = { R32: 'Round of 32', R16: 'Round of 16', QF: 'Quarter Finals', SF: 'Semi Finals', '3RD': '3rd Place', F: 'Final' };

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

        renderHome();
        renderMatchesView();
    } catch (e) {
        document.getElementById('stats-grid').innerHTML = `
            <div class="empty">Error: run <code>start.command</code> to launch the server</div>`;
    }
}

// Scoring - qualifier can be team name or 1/2
function fuzzyMatch(a, b) {
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

    const predHigh = Math.max(p1, p2), predLow = Math.min(p1, p2);
    const resHigh = Math.max(r1, r2), resLow = Math.min(r1, r2);

    if (predHigh === resHigh && predLow === resLow) {
        if (p1 === p2) {
            return predQual === resQual ? POINTS_EXACT : POINTS_WINNER;
        }
        if (predQual === resQual) return POINTS_EXACT;
        return 0;
    }

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

// ===== STATS CALCULATIONS =====

function getCorrectWinners(player) {
    let count = 0;
    matches.forEach(m => {
        const pts = calculatePoints(m, player);
        if (pts !== null && pts > 0) count++;
    });
    return count;
}

function getExactScores(player) {
    let count = 0;
    matches.forEach(m => {
        const pts = calculatePoints(m, player);
        if (pts === POINTS_EXACT) count++;
    });
    return count;
}

function getPointsByRound(player) {
    const byRound = {};
    matches.forEach(m => {
        if (!byRound[m.Round]) byRound[m.Round] = 0;
        const pts = calculatePoints(m, player);
        if (pts !== null) byRound[m.Round] += pts;
    });
    return byRound;
}

function getBestRound(player) {
    const byRound = getPointsByRound(player);
    let best = null, bestPts = -1;
    for (const [round, pts] of Object.entries(byRound)) {
        if (pts > bestPts) { bestPts = pts; best = round; }
    }
    return { round: best, points: bestPts };
}

function getLongestStreak(player) {
    let maxStreak = 0, current = 0;
    matches.forEach(m => {
        const pts = calculatePoints(m, player);
        if (pts !== null && pts > 0) {
            current++;
            if (current > maxStreak) maxStreak = current;
        } else if (pts !== null) {
            current = 0;
        }
    });
    return maxStreak;
}

function getZeroCount(player) {
    let count = 0;
    matches.forEach(m => {
        const pts = calculatePoints(m, player);
        if (pts === 0) count++;
    });
    return count;
}

function getCorrectFinalWinner(player) {
    const final = matches.find(m => m.Round === 'F');
    if (!final) return false;
    const pts = calculatePoints(final, player);
    return pts !== null && pts > 0;
}

function getCorrectChampion(player) {
    const final = matches.find(m => m.Round === 'F');
    if (!final) return false;
    const predQual = resolveQualifier(final[`${player}_Qualifier`], final.Team1, final.Team2);
    const resQual = resolveQualifier(final.Result_Qualifier, final.Team1, final.Team2);
    return predQual === resQual && predQual !== 0;
}

function getKnockoutAccuracy(player) {
    let correct = 0, total = 0;
    matches.filter(m => m.Round !== 'R32').forEach(m => {
        const pts = calculatePoints(m, player);
        if (pts !== null) {
            total++;
            if (pts > 0) correct++;
        }
    });
    return { correct, total, pct: total > 0 ? Math.round(correct / total * 100) : 0 };
}

// ===== HOME RENDERING =====

function renderHome() {
    renderPredictionPodium();
    renderStats();
}

function renderPredictionPodium() {
    const scores = PLAYERS.map(p => ({ name: p, score: getTotalScore(p), avatar: AVATARS[p] }));
    scores.sort((a, b) => b.score - a.score);

    const container = document.getElementById('pred-podium');
    // Order: 2nd, 1st, 3rd for podium layout
    const ordered = [scores[1], scores[0], scores[2]];
    const places = ['second', 'first', 'third'];
    const medals = ['🥈', '🥇', '🥉'];

    container.innerHTML = ordered.map((p, i) => `
        <div class="pred-podium-spot ${places[i]}">
            <div class="pred-podium-medal">${medals[i]}</div>
            <img src="${p.avatar}" class="pred-podium-avatar">
            <div class="pred-podium-name">${p.name}</div>
            <div class="pred-podium-score">${p.score} pts</div>
            <div class="pred-podium-block">${places[i] === 'first' ? '1' : places[i] === 'second' ? '2' : '3'}</div>
        </div>
    `).join('');
}

function renderStats() {
    const container = document.getElementById('stats-grid');

    // Correct winners leaderboard
    const winnersData = PLAYERS.map(p => ({ name: p, count: getCorrectWinners(p), avatar: AVATARS[p] }));
    winnersData.sort((a, b) => b.count - a.count);

    // Exact scores
    const exactData = PLAYERS.map(p => ({ name: p, count: getExactScores(p), avatar: AVATARS[p] }));
    exactData.sort((a, b) => b.count - a.count);

    // Streaks
    const streakData = PLAYERS.map(p => ({ name: p, streak: getLongestStreak(p), avatar: AVATARS[p] }));
    streakData.sort((a, b) => b.streak - a.streak);

    // Knockout accuracy
    const koData = PLAYERS.map(p => ({ name: p, ...getKnockoutAccuracy(p), avatar: AVATARS[p] }));
    koData.sort((a, b) => b.pct - a.pct);

    // Zero count (most wrong)
    const zeroData = PLAYERS.map(p => ({ name: p, count: getZeroCount(p), avatar: AVATARS[p] }));
    zeroData.sort((a, b) => b.count - a.count);

    // Per-round breakdown
    const rounds = [...new Set(matches.map(m => m.Round))];
    const roundBreakdown = PLAYERS.map(p => ({ name: p, rounds: getPointsByRound(p), avatar: AVATARS[p] }));

    // Who predicted the champion
    const championPredictors = PLAYERS.filter(p => getCorrectChampion(p));

    container.innerHTML = `
        ${renderStatCard('Correct Winners', 'Most games with the right winner guessed', winnersData.map(d => `
            <div class="stat-row">
                <img src="${d.avatar}" class="stat-avatar">
                <span class="stat-name">${d.name}</span>
                <span class="stat-value">${d.count} / ${matches.length}</span>
            </div>
        `).join(''))}

        ${renderStatCard('Exact Score Predictions', 'Perfect score + winner predictions', exactData.map(d => `
            <div class="stat-row">
                <img src="${d.avatar}" class="stat-avatar">
                <span class="stat-name">${d.name}</span>
                <span class="stat-value">${d.count}</span>
            </div>
        `).join(''))}

        ${renderStatCard('Longest Winning Streak', 'Consecutive correct winner guesses', streakData.map(d => `
            <div class="stat-row">
                <img src="${d.avatar}" class="stat-avatar">
                <span class="stat-name">${d.name}</span>
                <span class="stat-value">${d.streak} games</span>
            </div>
        `).join(''))}

        ${renderStatCard('Most Wrong Predictions', 'Games with 0 points', zeroData.map(d => `
            <div class="stat-row">
                <img src="${d.avatar}" class="stat-avatar">
                <span class="stat-name">${d.name}</span>
                <span class="stat-value">${d.count}</span>
            </div>
        `).join(''))}

        <div class="stat-card full-width">
            <div class="stat-card-header">
                <h3 class="stat-card-title">Points Per Round</h3>
                <p class="stat-card-subtitle">Breakdown by tournament stage</p>
            </div>
            <div class="stat-card-body">${`
            <table class="round-table">
                <thead>
                    <tr>
                        <th></th>
                        ${rounds.map(r => `<th>${r}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${roundBreakdown.map(p => `
                        <tr>
                            <td><img src="${p.avatar}" class="stat-avatar"> ${p.name}</td>
                            ${rounds.map(r => `<td class="round-pts">${p.rounds[r] || 0}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `}</div>
        </div>
    `;
}

function renderStatCard(title, subtitle, content) {
    return `
        <div class="stat-card">
            <div class="stat-card-header">
                <h3 class="stat-card-title">${title}</h3>
                <p class="stat-card-subtitle">${subtitle}</p>
            </div>
            <div class="stat-card-body">${content}</div>
        </div>
    `;
}

// ===== MATCHES VIEW RENDERING =====

function renderMatchesView() {
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
        `<button class="round-btn ${r === currentRound ? 'active' : ''}" data-round="${r}">${ROUND_LABELS[r] || r}</button>`
    ).join('');

    container.querySelectorAll('.round-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentRound = btn.dataset.round;
            renderMatchesView();
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

// ===== NAVIGATION =====

function switchView(view) {
    currentView = view;
    document.getElementById('home-view').style.display = view === 'home' ? 'block' : 'none';
    document.getElementById('matches-view').style.display = view === 'matches' ? 'block' : 'none';
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    loadCSV();
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.view));
    });
});
