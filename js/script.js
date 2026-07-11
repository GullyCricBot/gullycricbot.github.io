/* ==========================================================================
   GullyCric Bot — site script
   Powers: footer year · mobile nav · scroll reveal · nav shadow
           the homepage duel widget · the commands reference · the FAQ
   Vanilla JS, no dependencies. Each block is a no-op if its markup is absent.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {
    setYear();
    initNav();
    initNavShadow();
    initDuel();
    initCommands();
    initFaq();
    initReveal();
  });

  /* ---------- footer year ---------- */
  function setYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------- mobile nav ---------- */
  function initNav() {
    var toggle = document.getElementById('navToggle');
    var links = document.getElementById('navLinks');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.classList.toggle('active', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // close the drawer after tapping a link
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        links.classList.remove('open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- sticky nav shadow on scroll ---------- */
  function initNavShadow() {
    var nav = document.querySelector('.nav');
    if (!nav) return;
    var onScroll = function () {
      nav.classList.toggle('scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- scroll reveal (progressive enhancement) ---------- */
  function initReveal() {
    var targets = document.querySelectorAll(
      '.card, .role-card, .how-step, .feature-copy, .section-banner, ' +
      '.cta-band, .duel, .ruby-table, .ruby-side, .cmd-item, .faq-item'
    );
    if (!targets.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('reveal', 'in'); });
      return;
    }

    targets.forEach(function (el) { el.classList.add('reveal'); });
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(function (el) { io.observe(el); });
  }

  /* ======================================================================
     DUEL WIDGET  (index.html)
     One ball of Solo Mode: batter picks 0–6, bot bowls a hidden 0–6.
     Same number = OUT. Different = that many runs.
     ====================================================================== */
  function initDuel() {
    var widget = document.getElementById('duelWidget');
    if (!widget) return;

    var picker  = document.getElementById('duelPicker');
    var bowlerEl = document.getElementById('bowlerNum');
    var batterEl = document.getElementById('batterNum');
    var resultEl = document.getElementById('duelResult');
    var statusEl = document.getElementById('duelStatus');
    var runsEl  = document.getElementById('scoreRuns');
    var ballsEl = document.getElementById('scoreBalls');
    var wktsEl  = document.getElementById('scoreWkts');

    var state = { runs: 0, balls: 0, wkts: 0, out: false };

    function buildPicker() {
      picker.innerHTML = '';
      for (var i = 0; i <= 6; i++) {
        var b = document.createElement('button');
        b.className = 'duel-pick';
        b.type = 'button';
        b.textContent = String(i);
        b.setAttribute('aria-label', 'Play a ' + i);
        b.dataset.n = String(i);
        b.addEventListener('click', onPick);
        picker.appendChild(b);
      }
    }

    function onPick(e) {
      if (state.out) return;
      var n = parseInt(e.currentTarget.dataset.n, 10);
      var bowler = Math.floor(Math.random() * 7);

      batterEl.textContent = String(n);
      bowlerEl.textContent = String(bowler);
      state.balls++;

      bowlerEl.classList.remove('reveal-hit', 'reveal-safe');

      if (n === bowler) {
        state.wkts = 1;
        state.out = true;
        bowlerEl.classList.add('reveal-hit');
        resultEl.textContent = 'Same number — OUT! Bowled you, ' + n + ' on ' + bowler + '.';
        resultEl.className = 'duel-result out';
        statusEl.textContent = 'You are gone';
        showReplay();
      } else {
        state.runs += n;
        bowlerEl.classList.add('reveal-safe');
        resultEl.textContent = 'You played ' + n + ', bot bowled ' + bowler + ' — ' + n + (n === 1 ? ' run' : ' runs') + '.';
        resultEl.className = 'duel-result runs';
        statusEl.textContent = 'Your call, batter';
      }
      updateScore();
    }

    function showReplay() {
      picker.innerHTML = '';
      var btn = document.createElement('button');
      btn.className = 'duel-replay';
      btn.type = 'button';
      btn.textContent = 'Play again';
      btn.addEventListener('click', reset);
      picker.appendChild(btn);
    }

    function reset() {
      state = { runs: 0, balls: 0, wkts: 0, out: false };
      bowlerEl.textContent = '?';
      batterEl.textContent = '\u2013';
      bowlerEl.classList.remove('reveal-hit', 'reveal-safe');
      resultEl.textContent = "Pick a shot, 0 to 6. Match the bowler's number and you're gone.";
      resultEl.className = 'duel-result';
      statusEl.textContent = 'Your call, batter';
      updateScore();
      buildPicker();
    }

    function updateScore() {
      runsEl.textContent  = String(state.runs);
      ballsEl.textContent = String(state.balls);
      wktsEl.textContent  = String(state.wkts);
    }

    buildPicker();
    updateScore();
  }

  /* ======================================================================
     COMMANDS REFERENCE  (commands.html)
     ====================================================================== */
  var COMMANDS = [
    // ---- Everyone ----
    { name: '/startcricket', tag: 'everyone', desc: 'Open the main menu card: Solo, Team, Tournaments, Help, Cancel.' },
    { name: '/joinsolo',     tag: 'everyone', desc: 'Queue up for a Solo Mode round.' },
    { name: '/leavesolo',    tag: 'everyone', desc: 'Drop out of the Solo queue before the match starts.' },
    { name: '/join_team_a',  tag: 'everyone', desc: 'Join Team A during the Team Mode lobby window.' },
    { name: '/join_team_b',  tag: 'everyone', desc: 'Join Team B during the Team Mode lobby window.' },
    { name: '/alert',        tag: 'everyone', desc: 'Ping the player on strike or ball before the AFK timer bites.' },
    { name: '/bet a|b',      tag: 'everyone', desc: 'Back a side during the first innings; winners split the pool.' },
    { name: '/gift',         tag: 'everyone', desc: 'Send some of your Rubies to another player.' },
    { name: '/rubies',       tag: 'everyone', desc: 'Show your current Rubies balance.' },
    { name: '/purse',        tag: 'everyone', desc: 'Alias for your Rubies balance.' },
    { name: '/balance',      tag: 'everyone', desc: 'Alias for your Rubies balance.' },
    { name: '/userstat',     tag: 'everyone', desc: 'Your career record: runs, wickets, strike rate, milestones.' },
    { name: '/compare',      tag: 'everyone', desc: 'Head-to-head comparison of two players\u2019 stats.' },
    { name: '/botstats',     tag: 'everyone', desc: 'Community-wide numbers across every group.' },
    { name: '/leaderboard',  tag: 'everyone', desc: 'All-time Top-10 boards: runs, wickets, sixes, POTM and more.' },
    { name: '/ranking',      tag: 'everyone', desc: 'Weekly and all-time standings, with your position highlighted.' },
    { name: '/pointstable',  tag: 'everyone', desc: 'Live tournament points table with Net Run Rate.' },
    { name: '/tourroster',   tag: 'everyone', desc: 'See the squads registered in the current tournament.' },
    { name: '/tourstats',    tag: 'everyone', desc: 'Top scorers and wicket-takers for the tournament.' },
    { name: '/schedule',     tag: 'everyone', desc: 'Fixtures in your own timezone.' },
    { name: '/mytimezone',   tag: 'everyone', desc: 'Set your timezone so schedules read correctly.' },
    { name: '/about',        tag: 'everyone', desc: 'A quick card about the bot (auto-deletes after a moment).' },
    { name: '/help',         tag: 'everyone', desc: 'Open the in-chat help menu.' },

    // ---- Host & Captain ----
    { name: '/forcestart',   tag: 'host', desc: 'Start the match immediately instead of waiting on the timer.' },
    { name: '/set_overs',    tag: 'host', desc: 'Set how many overs the match runs before the toss.' },
    { name: '/batting N',    tag: 'host', desc: 'Send batter number N in to the crease.' },
    { name: '/bowling N',    tag: 'host', desc: 'Bring bowler number N on to bowl the next over.' },
    { name: '/substitute',   tag: 'host', desc: 'Swap a player before an innings — unlimited, pre-innings only.' },
    { name: '/impact',       tag: 'host', desc: 'Bring on an impact player mid-innings (max 2 per team).' },
    { name: '/add',          tag: 'host', desc: 'Add a player to a team roster during setup.' },
    { name: '/remove',       tag: 'host', desc: 'Remove a player from a team roster during setup.' },
    { name: '/shift',        tag: 'host', desc: 'Move a player between teams to balance the squads.' },
    { name: '/changecom',    tag: 'host', desc: 'Switch commentary language between English and Hindi.' },
    { name: '/sledge',       tag: 'host', desc: 'Fire off a bit of banter at the batter.' },

    // ---- Group Admin ----
    { name: '/lock',         tag: 'admin', desc: 'Lock the bot so only admins can start matches.' },
    { name: '/unlock',       tag: 'admin', desc: 'Unlock the bot for everyone in the group.' },
    { name: '/sledgeon',     tag: 'admin', desc: 'Turn spicy sledging on for the group.' },
    { name: '/sledgeoff',    tag: 'admin', desc: 'Turn sledging off for the group.' },
    { name: '/cleanuppostmatch', tag: 'admin', desc: 'Toggle whether old match messages sweep away after a game.' },
    { name: '/welcomeplayers',   tag: 'admin', desc: 'Toggle the welcome + verify message for new members.' },
    { name: '/cancel',       tag: 'admin', desc: 'Cancel the current lobby or setup.' },
    { name: '/endcricket',   tag: 'admin', desc: 'Abort a live match — needs 2 admin confirmations.' },

    // ---- Organiser (Superman) ----
    { name: '/hosttournament', tag: 'organiser', desc: 'Walk through naming a tour and registering teams squad by squad.' },
    { name: '/tournament',     tag: 'organiser', desc: 'Open the control panel: groups, squads, table, fixtures, schedule.' },
    { name: '/startplayoffs',  tag: 'organiser', desc: 'Seed the top 4 into Eliminator \u2192 Qualifiers \u2192 Final (needs 4+ teams).' },
    { name: '/forfeit',        tag: 'organiser', desc: 'Mark a team as forfeited when they go quiet.' },
    { name: '/pen',            tag: 'organiser', desc: 'Apply a points penalty to a team.' },
    { name: '/deltourteam',    tag: 'organiser', desc: 'Remove a team from the tournament.' },
    { name: '/excludestats',   tag: 'organiser', desc: 'Exclude an account from leaderboards (bots, test IDs).' },
    { name: '/includestats',   tag: 'organiser', desc: 'Re-include a previously excluded account.' },
    { name: '/lockedstats',    tag: 'organiser', desc: 'List which accounts are currently excluded from stats.' },
    { name: '/authorise',      tag: 'organiser', desc: 'Authorise a new group to run the bot.' },

    // ---- Core Dev ----
    { name: '/superman',     tag: 'dev', desc: 'Grant or revoke Organiser rights. Core developers only.' }
  ];

  var TAG_LABEL = {
    everyone:  'Everyone',
    host:      'Host & Captain',
    admin:     'Group Admin',
    organiser: 'Organiser',
    dev:       'Core Dev'
  };

  function initCommands() {
    var grid = document.getElementById('cmdGrid');
    if (!grid) return;
    var search  = document.getElementById('cmdSearch');
    var filters = document.getElementById('cmdFilters');
    var empty   = document.getElementById('cmdEmpty');

    var activeTag = 'all';
    var query = '';

    function render() {
      var q = query.trim().toLowerCase();
      var frag = document.createDocumentFragment();
      var shown = 0;

      COMMANDS.forEach(function (cmd) {
        if (activeTag !== 'all' && cmd.tag !== activeTag) return;
        if (q && (cmd.name.toLowerCase().indexOf(q) === -1 &&
                  cmd.desc.toLowerCase().indexOf(q) === -1)) return;

        var item = document.createElement('div');
        item.className = 'cmd-item';

        var name = document.createElement('span');
        name.className = 'cmd-name';
        name.textContent = cmd.name;

        var desc = document.createElement('span');
        desc.className = 'cmd-desc';
        desc.textContent = cmd.desc;

        var tag = document.createElement('span');
        tag.className = 'cmd-tag';
        tag.textContent = TAG_LABEL[cmd.tag] || cmd.tag;

        item.appendChild(name);
        item.appendChild(desc);
        item.appendChild(tag);
        frag.appendChild(item);
        shown++;
      });

      grid.innerHTML = '';
      grid.appendChild(frag);
      if (empty) empty.style.display = shown ? 'none' : 'block';
    }

    if (filters) {
      filters.addEventListener('click', function (e) {
        var btn = e.target.closest('.cmd-filter');
        if (!btn) return;
        filters.querySelectorAll('.cmd-filter').forEach(function (b) {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        activeTag = btn.dataset.tag || 'all';
        render();
      });
    }

    if (search) {
      search.addEventListener('input', function (e) {
        query = e.target.value || '';
        render();
      });
    }

    render();
  }

  /* ======================================================================
     FAQ  (faq.html)
     ====================================================================== */
  var FAQS = [
    {
      q: 'The bot never sends me a bowling keyboard. What did I miss?',
      a: 'You almost certainly skipped verification. Tap the welcome button and press <b>Start</b> in the bot\u2019s DM once \u2014 that\u2019s what unlocks squad tagging and the private bowling keyboard. No keyboard on your turn? Tap <b>Bowl Delivery</b> in the group and make sure you\u2019ve verified.'
    },
    {
      q: 'How do I get a match going from scratch?',
      a: 'Run <code>/startcricket</code> to drop the menu card, pick Solo or Team, and follow the prompts. For Team Mode: claim host, create team slots, players join with <code>/join_team_a</code> / <code>/join_team_b</code>, then the host sets overs and the toss fires on its own.'
    },
    {
      q: 'Why is 0 sometimes disabled?',
      a: 'In <b>Solo Mode</b> the number 0 is switched off entirely \u2014 every delivery and shot is 1\u20136. In <b>Team Mode</b> a bowler may bowl one dead-ball 0 per over (a forced dot), but it\u2019s banned on the last two balls of an innings and can\u2019t be used to block a hat-trick ball.'
    },
    {
      q: 'What happens if someone goes AFK?',
      a: 'After <b>80 seconds</b>, an idle bowler concedes +6 and gets rotated out, and an idle batter is given out. Use <code>/alert</code> to nudge whoever\u2019s holding things up before the timer decides for them.'
    },
    {
      q: 'When can I place a bet, and how do payouts work?',
      a: 'Betting is open <b>during the first innings only</b>. Back a side with <code>/bet a &lt;amount&gt;</code> or <code>/bet b &lt;amount&gt;</code>. Every stake goes into a shared pool and the winners split it once the match ends. The window shuts the moment the first innings does.'
    },
    {
      q: 'How is the chase target decided, and what if scores tie?',
      a: 'The target is the first-innings score plus one. If it\u2019s still level after both innings, a one-over <b>Super Over</b> decides the match.'
    },
    {
      q: 'My group isn\u2019t authorised. What now?',
      a: 'Groups need to be authorised before the bot will run there. Drop into <b>@GullyCricPavilion</b> and an organiser will sort it out. Organisers authorise groups from their extended menu.'
    },
    {
      q: 'Can I stop test or bot accounts from polluting the leaderboards?',
      a: 'Yes. Organisers can use <code>/excludestats</code> and <code>/includestats</code>, and check who\u2019s currently excluded with <code>/lockedstats</code>.'
    },
    {
      q: 'A match crashed mid-over. Did we lose it?',
      a: 'No. Live matches persist to disk, so a redeploy or restart resumes the game cleanly instead of eating it.'
    },
    {
      q: 'Who can end a live match?',
      a: 'Aborting a match in progress needs <b>two admin confirmations</b> via <code>/endcricket</code> \u2014 so no single person can nuke a game everyone\u2019s playing.'
    }
  ];

  function initFaq() {
    var list = document.getElementById('faqList');
    if (!list) return;

    FAQS.forEach(function (faq) {
      var item = document.createElement('div');
      item.className = 'faq-item';

      var btn = document.createElement('button');
      btn.className = 'faq-q';
      btn.type = 'button';
      btn.setAttribute('aria-expanded', 'false');

      var qText = document.createElement('span');
      qText.textContent = faq.q;

      var icon = document.createElement('span');
      icon.className = 'icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = '+';

      btn.appendChild(qText);
      btn.appendChild(icon);

      var ans = document.createElement('div');
      ans.className = 'faq-a';
      var inner = document.createElement('div');
      inner.className = 'faq-a-inner';
      inner.innerHTML = faq.a;
      ans.appendChild(inner);

      btn.addEventListener('click', function () {
        var isOpen = item.classList.toggle('open');
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        ans.style.maxHeight = isOpen ? (inner.offsetHeight + 22) + 'px' : '0px';
      });

      item.appendChild(btn);
      item.appendChild(ans);
      list.appendChild(item);
    });

    // keep open answers correctly sized on resize
    window.addEventListener('resize', function () {
      list.querySelectorAll('.faq-item.open').forEach(function (item) {
        var ans = item.querySelector('.faq-a');
        var inner = item.querySelector('.faq-a-inner');
        if (ans && inner) ans.style.maxHeight = (inner.offsetHeight + 22) + 'px';
      });
    });
  }
})();
