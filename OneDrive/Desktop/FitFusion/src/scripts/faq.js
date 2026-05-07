/* ══════════════════════════════
   FAQ PAGE
══════════════════════════════ */

const FAQ_DATA = [
  {
    category: '🚀 Getting Started',
    items: [
      {
        q: 'How do I create my first outfit?',
        a: 'Head to the AI Stylist page and answer 9 quick questions about your style identity, fit preference, vibes, colours, budget, season, time of day, body type, and dress code. Our AI will generate a complete outfit with pieces, tips, and a colour palette in seconds.',
      },
      {
        q: 'What information do I need for my style profile?',
        a: 'Just your personal preferences — no measurements or account required to try it out. The more detail you provide (body type, occasion, cultural preferences), the higher your Style Match Score and the more tailored your results.',
      },
      {
        q: 'Is FitFusion free to use?',
        a: 'Yes! The core AI Stylist, wardrobe, and trending features are free. A Pro plan is available for unlimited outfit generations, advanced style analysis, and priority support.',
      },
    ],
  },
  {
    category: '🤖 AI Features',
    items: [
      {
        q: 'How accurate are the AI recommendations?',
        a: 'Our AI analyses your answers across 9 dimensions to curate outfits that match your style, budget, and occasion. The Style Match Score (0–99%) shows how well the result aligns with your profile — the more questions you answer, the higher the score.',
      },
      {
        q: 'Can the AI understand different fashion styles?',
        a: 'Absolutely. FitFusion supports a wide range of aesthetics including minimal, streetwear, classic, boho, edgy, luxe, sporty, vintage, and preppy. You can mix up to 3 vibes for a truly personalised look.',
      },
      {
        q: 'What is the Style Match Score?',
        a: 'The Style Match Score (shown as a percentage on your result) reflects how closely the generated outfit aligns with all the preferences you provided. A score of 88%+ means an excellent match. Add more details — like body type and cultural considerations — to push it higher.',
      },
    ],
  },
  {
    category: '👗 Wardrobe',
    items: [
      {
        q: 'How do I save looks to my wardrobe?',
        a: 'After generating an outfit, click the "🔖 Save This Look" button on the result screen. The look is instantly saved to your digital wardrobe where you can browse, filter, and revisit it anytime.',
      },
      {
        q: 'Can I delete saved looks?',
        a: 'Yes. Open any saved look in your wardrobe, then click the "🗑 Delete" button in the look detail panel. The look is removed immediately from your local storage.',
      },
      {
        q: 'How many looks can I save?',
        a: 'Free accounts can save up to 50 looks. Pro accounts get unlimited wardrobe storage. Looks are stored locally in your browser, so they persist across sessions on the same device.',
      },
    ],
  },
  {
    category: '🔒 Account & Privacy',
    items: [
      {
        q: 'Is my data secure?',
        a: 'Your style preferences and saved looks are stored locally in your browser and are never shared with third parties. Account data (email, name) is stored securely on our servers with industry-standard encryption.',
      },
      {
        q: 'Can I delete my account?',
        a: 'Yes. Go to Settings → Account → Delete Account. This permanently removes your account and all associated data from our servers. Local wardrobe data can be cleared from your browser settings.',
      },
      {
        q: 'How do I change my style preferences?',
        a: 'Simply run the AI Stylist questionnaire again — your answers are not locked in. Each session is independent, so you can explore different styles freely without affecting your saved looks.',
      },
    ],
  },
  {
    category: '⚙️ Technical',
    items: [
      {
        q: 'Why is the app slow?',
        a: 'FitFusion runs entirely in your browser with no heavy server calls. If you experience slowness, try refreshing the page or clearing your browser cache. Make sure you\'re on a modern browser for the best experience.',
      },
      {
        q: 'What browsers are supported?',
        a: 'FitFusion works best on Chrome, Firefox, Safari, and Edge (latest versions). Internet Explorer is not supported. For mobile, we recommend Chrome on Android and Safari on iOS.',
      },
      {
        q: 'How do I export my outfit report?',
        a: 'After generating an outfit, click the "⬇ Export Report" button on the result screen. A plain-text report containing your profile, outfit pieces, styling tips, and colour palette will be downloaded to your device.',
      },
    ],
  },
];

/* ── BUILD FAQ ── */
const faqMain = document.getElementById('faq-main');

function buildFAQ(data) {
  faqMain.innerHTML = '';

  let totalItems = 0;

  data.forEach(cat => {
    if (!cat.items.length) return;
    totalItems += cat.items.length;

    const section = document.createElement('div');
    section.className = 'faq-category';

    const title = document.createElement('h2');
    title.className = 'faq-cat-title';
    title.textContent = cat.category;
    section.appendChild(title);

    const list = document.createElement('div');
    list.className = 'faq-list';

    cat.items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'faq-item';
      el.innerHTML = `
        <div class="faq-q">
          <span class="faq-q-text">${item.q}</span>
          <span class="faq-chevron">▼</span>
        </div>
        <div class="faq-a"><p>${item.a}</p></div>
      `;

      el.querySelector('.faq-q').addEventListener('click', () => {
        const isOpen = el.classList.contains('open');
        // Close all others in same list
        list.querySelectorAll('.faq-item.open').forEach(o => o.classList.remove('open'));
        if (!isOpen) el.classList.add('open');
      });

      list.appendChild(el);
    });

    section.appendChild(list);
    faqMain.appendChild(section);
  });

  // No results
  const noResults = document.getElementById('faq-no-results');
  if (noResults) {
    noResults.style.display = totalItems === 0 ? 'block' : 'none';
  }
}

buildFAQ(FAQ_DATA);

/* ── SEARCH ── */
const searchInput = document.getElementById('faq-search');
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();

    if (!q) {
      buildFAQ(FAQ_DATA);
      return;
    }

    const filtered = FAQ_DATA.map(cat => ({
      ...cat,
      items: cat.items.filter(
        item =>
          item.q.toLowerCase().includes(q) ||
          item.a.toLowerCase().includes(q)
      ),
    }));

    buildFAQ(filtered);
  });
}
