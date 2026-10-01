(function () {
  const aud = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 });
  const $ = (id) => document.getElementById(id);
  const num = (el) => { const v = parseFloat(String(el.value).replace(/[^0-9.]/g, '')); return isNaN(v) ? 0 : v; };

  // Repayment per period for a principal-and-interest loan
  function payment(principal, annualRate, years, perYear) {
    const n = years * perYear, r = annualRate / 100 / perYear;
    if (r === 0) return principal / n;
    return principal * r / (1 - Math.pow(1 + r, -n));
  }
  // Loan size a given repayment supports
  function principalFor(pay, annualRate, years, perYear) {
    const n = years * perYear, r = annualRate / 100 / perYear;
    if (r === 0) return pay * n;
    return pay * (1 - Math.pow(1 + r, -n)) / r;
  }

  // Mobile menu
  const menuBtn = $('menuBtn'), navLinks = $('navLinks');
  menuBtn.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false');
  }));

  // Hero repayment instrument
  let ppy = 12;
  const perLabel = { 12: '/month', 26: '/fortnight', 52: '/week' };
  function renderHero() {
    const L = +$('hLoan').value, rate = +$('hRate').value, term = +$('hTerm').value;
    $('hLoanOut').textContent = aud.format(L);
    $('hRateOut').textContent = rate.toFixed(2) + '% p.a.';
    $('hTermOut').textContent = term + ' years';
    const p = payment(L, rate, term, ppy);
    const interest = p * term * ppy - L;
    $('heroPay').innerHTML = aud.format(p) + '<small>' + perLabel[ppy] + '</small>';
    const total = L + interest;
    $('barP').style.width = (L / total * 100) + '%';
    $('barI').style.width = (interest / total * 100) + '%';
    $('legP').textContent = aud.format(L);
    $('legI').textContent = aud.format(interest);
  }
  ['hLoan', 'hRate', 'hTerm'].forEach(id => $(id).addEventListener('input', renderHero));
  document.querySelectorAll('.freq button').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.freq button').forEach(x => x.setAttribute('aria-pressed', 'false'));
    b.setAttribute('aria-pressed', 'true');
    ppy = +b.dataset.ppy;
    renderHero();
  }));
  renderHero();

  // Tabs
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  function selectTab(tab) {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      $(t.getAttribute('aria-controls')).hidden = !on;
    });
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t));
    t.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      selectTab(next); next.focus();
    });
  });

  // Format money inputs with thousands separators as you type
  document.querySelectorAll('.calc input[inputmode="numeric"]').forEach(el => {
    el.addEventListener('blur', () => { const v = num(el); el.value = v ? v.toLocaleString('en-AU') : '0'; });
  });

  // Approximate annual income tax for 2026-27 resident rates, plus 2% Medicare levy
  function netIncome(gross) {
    let tax = 0;
    if (gross > 190000) tax = 51370 + (gross - 190000) * 0.45;
    else if (gross > 135000) tax = 31020 + (gross - 135000) * 0.37;
    else if (gross > 45000) tax = 4020 + (gross - 45000) * 0.30;
    else if (gross > 18200) tax = (gross - 18200) * 0.15;
    const medicare = gross > 27000 ? gross * 0.02 : 0;
    return gross - tax - medicare;
  }

  function renderBorrow() {
    const inc1 = num($('bInc1')), inc2 = num($('bInc2'));
    const exp = num($('bExp')), debt = num($('bDebt')), cards = num($('bCards'));
    const rate = num($('bRate')), assess = rate + 3, term = 30;
    const netMonthly = (netIncome(inc1) + netIncome(inc2)) / 12;
    const surplus = netMonthly - exp - debt - cards * 0.038;
    let loan = surplus > 0 ? principalFor(surplus, assess, term, 12) : 0;
    const dtiCap = (inc1 + inc2) * 6;
    const capped = loan > dtiCap;
    if (capped) loan = dtiCap;
    loan = Math.max(0, Math.floor(loan / 1000) * 1000);
    $('bOut').textContent = aud.format(loan);
    $('bPay').textContent = aud.format(payment(loan, rate, term, 12));
    $('bAssess').textContent = assess.toFixed(2) + '%';
    $('bSurplus').textContent = aud.format(Math.max(0, surplus));
    $('bNote').textContent = (capped ? 'Limited to 6 times combined income, a common lender cap. ' : '') +
      'Indicative only. Uses 2026–27 tax rates and a 30-year term. Lenders also apply their own minimum living-expense benchmarks.';
  }
  $('borrowForm').addEventListener('input', renderBorrow);
  renderBorrow();

  function renderRefi() {
    const bal = num($('rBal')), yrs = num($('rYears')) || 1, now = num($('rNow')), nw = num($('rNew')), cost = num($('rCost'));
    const pNow = payment(bal, now, yrs, 12), pNew = payment(bal, nw, yrs, 12);
    const save = pNow - pNew;
    $('rPayNow').textContent = aud.format(pNow);
    $('rPayNew').textContent = aud.format(pNew);
    if (save > 0) {
      $('rOut').textContent = aud.format(save);
      $('rBreak').textContent = Math.max(1, Math.ceil(cost / save)) + ' months';
      $('rFive').textContent = aud.format(save * 60 - cost);
    } else {
      $('rOut').textContent = aud.format(0);
      $('rBreak').textContent = 'n/a';
      $('rFive').textContent = 'No saving at this rate';
    }
  }
  $('refiForm').addEventListener('input', renderRefi);
  renderRefi();

  // Contact form: posts to the Cloudflare Pages Function at /api/contact
  const form = $('contactForm');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name = $('cName').value.trim(), phone = $('cPhone').value.trim(), email = $('cEmail').value.trim();
    const err = $('formError'), msg = $('formMsg'), btn = $('cSubmit');
    msg.hidden = true;
    if (!name || !phone || !/^\S+@\S+\.\S+$/.test(email)) {
      err.textContent = 'Please add your name, a phone number and a valid email so we can get back to you.';
      err.hidden = false; return;
    }
    err.hidden = true;
    btn.disabled = true;
    try {
      const data = Object.fromEntries(new FormData(form));
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('send failed');
      msg.textContent = 'Thanks, ' + name.split(' ')[0] + '. We’ve got your details and will call you within one business day.';
      msg.hidden = false;
      form.reset();
    } catch (_) {
      err.textContent = 'Sorry, we couldn’t send your enquiry. Please call us on 1300 975 714 or email info@financely.com.au.';
      err.hidden = false;
    } finally {
      btn.disabled = false;
    }
  });

  $('year').textContent = new Date().getFullYear();
})();
