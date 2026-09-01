document.getElementById('year').textContent = new Date().getFullYear();

  // ---------- background curves (landing + hero) ----------
  function lissajous(a, b, delta, scale, cx, cy, steps){
    let d = "";
    for(let i=0;i<=steps;i++){
      const t = (i/steps) * Math.PI * 2;
      const x = cx + scale * Math.sin(a*t + delta);
      const y = cy + scale * Math.sin(b*t);
      d += (i===0 ? "M" : "L") + x.toFixed(2) + "," + y.toFixed(2) + " ";
    }
    return d;
  }
  function initDriftingCurves(id1, id2, id3){
    const c1 = document.getElementById(id1);
    const c2 = document.getElementById(id2);
    const c3 = document.getElementById(id3);
    if(!c1 || !c2 || !c3) return;
    let frame = 0;
    function animate(){
      frame += 0.006;
      c1.setAttribute('d', lissajous(3, 2, frame, 190, 400, 250, 300));
      c2.setAttribute('d', lissajous(2, 3, frame + 1, 150, 400, 250, 300));
      c3.setAttribute('d', lissajous(4, 3, frame + 2, 120, 400, 250, 300));
      requestAnimationFrame(animate);
    }
    if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      animate();
    } else {
      c1.setAttribute('d', lissajous(3,2,0,190,400,250,300));
      c2.setAttribute('d', lissajous(2,3,1,150,400,250,300));
      c3.setAttribute('d', lissajous(4,3,2,120,400,250,300));
    }
  }
  initDriftingCurves('heroC1', 'heroC2', 'heroC3');

  // ---------- landing page: sticker pop + cursor collect/scatter ----------
  const landingHero = document.getElementById('sec-landing');
  if(landingHero){
    const popCards = Array.from(landingHero.querySelectorAll('.pop-card')).map(el => ({
      el,
      hx: parseFloat(el.dataset.hx),
      hy: parseFloat(el.dataset.hy),
      rot: parseFloat(el.dataset.rot),
      delay: parseFloat(el.dataset.delay)
    }));

    function setStickerTransform(c, factor){
      const x = c.hx * factor;
      const y = c.hy * factor;
      const r = c.rot * factor;
      c.el.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1) rotate(${r}deg)`;
    }

    // Entrance: pop each sticker out from the center to its scattered spot, staggered.
    popCards.forEach(c => {
      setTimeout(() => {
        c.el.style.opacity = '1';
        setStickerTransform(c, 1);
      }, c.delay * 1000);
    });

    // Cursor interaction is live immediately — moving early just smoothly
    // redirects the in-progress entrance transition.
    landingHero.addEventListener('mousemove', (e) => {
      const rect = landingHero.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const factor = Math.min(1, Math.sqrt(dx * dx + dy * dy));
      popCards.forEach(c => setStickerTransform(c, factor));
    });

    landingHero.addEventListener('mouseleave', () => {
      popCards.forEach(c => setStickerTransform(c, 1));
    });
  }

  // ---------- scroll reveal ----------
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('in'); }
    });
  }, { threshold:0.15 });
  revealEls.forEach(el=>io.observe(el));

  // ---------- pipeline nav: build nodes + progress ----------
  const sections = [...document.querySelectorAll('section[data-label]')];
  const nodesG = document.getElementById('pipelineNodes');
  const fillPath = document.getElementById('pipelineFill');
  const nav = document.querySelector('.pipeline-nav');

  sections.forEach((sec, i)=>{
    const y = 10 + (i * (300/(sections.length-1)));
    const wrap = document.createElementNS('http://www.w3.org/2000/svg','g');
    wrap.setAttribute('class','pipeline-node-wrap');

    const circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
    circle.setAttribute('cx', 7);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', 5);
    circle.setAttribute('class','pipeline-node');
    circle.dataset.index = i;
    circle.addEventListener('click', ()=> sec.scrollIntoView({behavior:'smooth'}));
    wrap.appendChild(circle);
    nodesG.appendChild(wrap);

    const label = document.createElement('div');
    label.className = 'pipeline-label';
    label.style.top = `calc(${(y/320)*100}% - 8px)`;
    label.textContent = sec.dataset.label;
    nav.appendChild(label);
    wrap._label = label;
    wrap._circle = circle;
  });

  const nodeWraps = [...nodesG.querySelectorAll('.pipeline-node-wrap')];

  // hover label positioning fix (labels live outside svg, absolutely positioned)
  nodeWraps.forEach((wrap, i)=>{
    wrap._circle.addEventListener('mouseenter', ()=> wrap._label.style.opacity = 1);
    wrap._circle.addEventListener('mouseleave', ()=> wrap._label.style.opacity = 0);
  });

  function updatePipeline(){
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = Math.min(1, Math.max(0, scrollTop / docHeight));
    fillPath.style.strokeDashoffset = 1000 - (pct * 1000);

    let activeIdx = 0;
    sections.forEach((sec, i)=>{
      const rect = sec.getBoundingClientRect();
      if(rect.top < window.innerHeight * 0.5) activeIdx = i;
    });
    nodeWraps.forEach((wrap, i)=>{
      wrap._circle.classList.toggle('active', i === activeIdx);
    });
  }
  window.addEventListener('scroll', updatePipeline, { passive:true });
  updatePipeline();

  // ---------- ASCII flow trail ----------
  (function(){
    const canvas = document.getElementById('asciiCanvas');
    if(!canvas) return;
    const section = document.getElementById('sec-ascii');
    const ctx = canvas.getContext('2d');
    const CHARS = ['0','1','/','\\','+','.','*','·'];
    let particles = [];
    let lastSpawn = 0;

    function resize(){
      canvas.width = section.clientWidth;
      canvas.height = section.clientHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function spawn(x, y, vx, vy){
      particles.push({
        x, y, vx: vx*0.3, vy: vy*0.3,
        char: CHARS[Math.floor(Math.random()*CHARS.length)],
        life: 1,
        size: 14 + Math.random()*10
      });
    }

    let lastX = null, lastY = null;
    function handleMove(clientX, clientY){
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const now = performance.now();
      if(now - lastSpawn > 30){
        const vx = lastX !== null ? x - lastX : 0;
        const vy = lastY !== null ? y - lastY : 0;
        spawn(x, y, vx, vy);
        lastSpawn = now;
      }
      lastX = x; lastY = y;
    }

    section.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
    section.addEventListener('touchmove', (e) => {
      if(e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive:true });

    function render(){
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.018;
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.fillStyle = '#F5CBD7';
        ctx.font = `${p.size}px 'JetBrains Mono', monospace`;
        ctx.fillText(p.char, p.x, p.y);
      });
      ctx.globalAlpha = 1;
      particles = particles.filter(p => p.life > 0);
      requestAnimationFrame(render);
    }
    if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      requestAnimationFrame(render);
    }
  })();

  // ---------- lanyard card physics (simple verlet rope) ----------
  const lanyardWrap = document.querySelector('.lanyard-wrap');
  if(lanyardWrap){
    const lanyardCard = document.getElementById('lanyardCard');
    const lanyardPath = document.getElementById('lanyardStrapPath');
    const LANYARD_POINTS = 11;
    const LANYARD_SEGMENT = 28;
    const lanyardPts = [];
    for(let i=0;i<LANYARD_POINTS;i++){
      lanyardPts.push({ x:0, y:i*LANYARD_SEGMENT, oldx:0, oldy:i*LANYARD_SEGMENT, pinned:i===0 });
    }
    // small initial displacement so it swings gently on load instead of hanging static
    lanyardPts[LANYARD_POINTS-1].oldx = -28;

    let lanyardDragging = false;

    function lanyardAnchor(){
      const r = lanyardWrap.getBoundingClientRect();
      return { x:r.left, y:r.top };
    }
    function lanyardLocal(clientX, clientY){
      const a = lanyardAnchor();
      return { x:clientX - a.x, y:clientY - a.y };
    }

    function lanyardStep(){
      const gravity = 0.9;
      for(let i=0;i<lanyardPts.length;i++){
        const p = lanyardPts[i];
        if(p.pinned) continue;
        if(lanyardDragging && i === lanyardPts.length-1) continue;
        const vx = (p.x - p.oldx) * 0.98;
        const vy = (p.y - p.oldy) * 0.98;
        p.oldx = p.x; p.oldy = p.y;
        p.x += vx;
        p.y += vy + gravity;
      }
      for(let iter=0; iter<6; iter++){
        for(let i=0;i<lanyardPts.length-1;i++){
          const p1 = lanyardPts[i], p2 = lanyardPts[i+1];
          const dx = p2.x - p1.x, dy = p2.y - p1.y;
          const dist = Math.sqrt(dx*dx + dy*dy) || 0.0001;
          const diff = (dist - LANYARD_SEGMENT) / dist;
          const offx = dx * 0.5 * diff, offy = dy * 0.5 * diff;
          const p2IsDraggedEnd = lanyardDragging && (i+1 === lanyardPts.length-1);
          if(!p1.pinned){ p1.x += offx; p1.y += offy; }
          if(!p2.pinned && !p2IsDraggedEnd){ p2.x -= offx; p2.y -= offy; }
        }
        lanyardPts[0].x = 0; lanyardPts[0].y = 0;
      }
    }

    function lanyardRender(){
      let d = `M ${lanyardPts[0].x} ${lanyardPts[0].y}`;
      for(let i=1;i<lanyardPts.length;i++){ d += ` L ${lanyardPts[i].x} ${lanyardPts[i].y}`; }
      lanyardPath.setAttribute('d', d);

      const last = lanyardPts[lanyardPts.length-1];
      const prev = lanyardPts[lanyardPts.length-2];
      const angle = Math.atan2(last.x - prev.x, last.y - prev.y) * (180/Math.PI);
      lanyardCard.style.transform = `translate(${last.x - 105}px, ${last.y}px) rotate(${angle}deg)`;
    }

    function lanyardLoop(){
      lanyardStep();
      lanyardRender();
      requestAnimationFrame(lanyardLoop);
    }

    if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      requestAnimationFrame(lanyardLoop);
    } else {
      lanyardRender();
    }

    function lanyardPointerDown(e){
      lanyardDragging = true;
      e.preventDefault();
    }
    function lanyardPointerMove(e){
      if(!lanyardDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const local = lanyardLocal(clientX, clientY);
      const last = lanyardPts[lanyardPts.length-1];
      last.oldx = last.x; last.oldy = last.y;
      last.x = local.x; last.y = local.y;
    }
    function lanyardPointerUp(){ lanyardDragging = false; }

    lanyardCard.addEventListener('mousedown', lanyardPointerDown);
    lanyardCard.addEventListener('touchstart', lanyardPointerDown, { passive:false });
    window.addEventListener('mousemove', lanyardPointerMove);
    window.addEventListener('touchmove', lanyardPointerMove, { passive:false });
    window.addEventListener('mouseup', lanyardPointerUp);
    window.addEventListener('touchend', lanyardPointerUp);
  }
