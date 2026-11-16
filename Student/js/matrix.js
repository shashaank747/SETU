/**
 * SETU CampusOS - Matrix Digital Rain Canvas Animation
 */

(function () {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  // Futuristic tech character pool: katakana, latin, numbers, binary & campus symbols
  const characters = '01CampusOSAIERP2026SETUΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ010101<>{}[]/*+=~#%$&@';
  const fontSize = 15;
  let columns = Math.floor(width / fontSize);

  // An array of drops - one per column
  let drops = [];
  function initDrops() {
    columns = Math.floor(width / fontSize);
    drops = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor((Math.random() * -height) / fontSize); // Stagger initial starts
    }
  }
  initDrops();

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initDrops();
  });

  // Render loop
  let lastTime = 0;
  const fps = 30; // Smooth digital rain speed
  const frameInterval = 1000 / fps;

  function draw(currentTime) {
    requestAnimationFrame(draw);

    const delta = currentTime - lastTime;
    if (delta < frameInterval) return;
    lastTime = currentTime - (delta % frameInterval);

    // Translucent dark fade to create iconic trailing effect on dark cyber canvas
    ctx.fillStyle = 'rgba(3, 7, 18, 0.08)';
    ctx.fillRect(0, 0, width, height);

    ctx.font = `bold ${fontSize}px "Courier New", Courier, monospace`;

    for (let i = 0; i < drops.length; i++) {
      // Pick random character
      const text = characters.charAt(Math.floor(Math.random() * characters.length));

      // Calculate coordinates
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      // Leading character glows in bright white/cyan spark, trailing in electric cyber cyan & matrix green
      if (Math.random() > 0.88) {
        ctx.fillStyle = '#ffffff'; // Bright white leading spark
      } else if (drops[i] < 3 || Math.random() > 0.75) {
        ctx.fillStyle = '#38bdf8'; // Electric Cyan Blue
      } else if (Math.random() > 0.45) {
        ctx.fillStyle = '#00ff66'; // Glowing Matrix Green
      } else {
        ctx.fillStyle = '#10b981'; // Emerald Green
      }

      ctx.fillText(text, x, y);

      // Reset to top when off screen or randomly
      if (y > height && Math.random() > 0.975) {
        drops[i] = 0;
      }

      drops[i]++;
    }
  }

  requestAnimationFrame(draw);
})();
