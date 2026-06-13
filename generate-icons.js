const { Jimp } = require('jimp');
const path = require('path');

const SIZES = [192, 512];

async function generateIcon(size) {
  const img = new Jimp({ width: size, height: size, color: 0xff1f2833 });

  // Fondo redondeado: dibujar un rectángulo con bordes redondeados
  const radius = size * 0.18;
  const bgColor = 0xff1f2833;

  // Cuerpo de la caja registradora (rectángulo dorado)
  const boxW = size * 0.55;
  const boxH = size * 0.35;
  const boxX = (size - boxW) / 2;
  const boxY = size * 0.45;
  const goldColor = 0xffc5a059;

  // Pantalla (rectángulo claro arriba)
  const screenW = boxW * 0.75;
  const screenH = size * 0.08;
  const screenX = (size - screenW) / 2;
  const screenY = boxY - screenH - size * 0.04;
  const screenColor = 0xfff3f4f6;

  // Teclas (círculos)
  const keyRadius = size * 0.035;
  const keySpacing = size * 0.07;
  const keyY1 = boxY + size * 0.06;
  const keyY2 = boxY + size * 0.16;
  const keyStartX = boxX + size * 0.08;
  const keyColor = 0xccf3f4f6;

  // Ranura de monedas
  const slotW = size * 0.06;
  const slotH = size * 0.18;
  const slotX = boxX + boxW - size * 0.08;
  const slotY = boxY + size * 0.04;
  const slotColor = 0xff8b6914;

  // Moneda
  const coinR = size * 0.04;
  const coinX = slotX - size * 0.08;
  const coinY = boxY - size * 0.08;
  const coinColor = 0xfff3f4f6;

  // Dibujar caja (rectángulo de fondo principal)
  for (let y = boxY; y < boxY + boxH; y++) {
    for (let x = boxX; x < boxX + boxW; x++) {
      // Verificar si está dentro del rectángulo redondeado
      const isLeftEdge = x < boxX + radius;
      const isRightEdge = x > boxX + boxW - radius;
      const isTopEdge = y < boxY + radius;
      const isBottomEdge = y > boxY + boxH - radius;

      let inShape = true;

      if (isLeftEdge && isTopEdge) {
        const dx = x - (boxX + radius);
        const dy = y - (boxY + radius);
        inShape = dx * dx + dy * dy <= radius * radius;
      } else if (isRightEdge && isTopEdge) {
        const dx = x - (boxX + boxW - radius);
        const dy = y - (boxY + radius);
        inShape = dx * dx + dy * dy <= radius * radius;
      } else if (isLeftEdge && isBottomEdge) {
        const dx = x - (boxX + radius);
        const dy = y - (boxY + boxH - radius);
        inShape = dx * dx + dy * dy <= radius * radius;
      } else if (isRightEdge && isBottomEdge) {
        const dx = x - (boxX + boxW - radius);
        const dy = y - (boxY + boxH - radius);
        inShape = dx * dx + dy * dy <= radius * radius;
      }

      if (inShape) {
        img.setPixelColor(goldColor, x, y);
      }
    }
  }

  // Pantalla
  for (let y = screenY; y < screenY + screenH; y++) {
    for (let x = screenX; x < screenX + screenW; x++) {
      if (y >= 0 && y < size && x >= 0 && x < size) {
        img.setPixelColor(screenColor, x, y);
      }
    }
  }

  // Texto "Gs. 0" en la pantalla (simulado con píxeles)
  const textY = screenY + screenH * 0.3;
  const textColor = 0xff0b0c10;
  for (let y = textY; y < textY + screenH * 0.5; y++) {
    for (let x = screenX + screenW * 0.2; x < screenX + screenW * 0.6; x++) {
      if (y >= 0 && y < size && x >= 0 && x < size && (x % 3 === 0 || y % 3 === 0)) {
        // Simular texto con patrón de píxeles
        img.setPixelColor(textColor, x, y);
      }
    }
  }

  // Teclas fila 1
  for (let i = 0; i < 4; i++) {
    const kx = keyStartX + i * keySpacing;
    const ky = keyY1;
    for (let dy = -keyRadius; dy <= keyRadius; dy++) {
      for (let dx = -keyRadius; dx <= keyRadius; dx++) {
        if (dx * dx + dy * dy <= keyRadius * keyRadius) {
          const px = Math.round(kx + dx);
          const py = Math.round(ky + dy);
          if (px >= 0 && px < size && py >= 0 && py < size) {
            img.setPixelColor(keyColor, px, py);
          }
        }
      }
    }
  }

  // Teclas fila 2
  for (let i = 0; i < 4; i++) {
    const kx = keyStartX + i * keySpacing;
    const ky = keyY2;
    for (let dy = -keyRadius; dy <= keyRadius; dy++) {
      for (let dx = -keyRadius; dx <= keyRadius; dx++) {
        if (dx * dx + dy * dy <= keyRadius * keyRadius) {
          const px = Math.round(kx + dx);
          const py = Math.round(ky + dy);
          if (px >= 0 && px < size && py >= 0 && py < size) {
            img.setPixelColor(keyColor, px, py);
          }
        }
      }
    }
  }

  // Ranura de monedas
  for (let y = slotY; y < slotY + slotH; y++) {
    for (let x = slotX; x < slotX + slotW; x++) {
      if (x >= 0 && x < size && y >= 0 && y < size) {
        const isBorder = x === slotX || x === slotX + slotW - 1 || y === slotY || y === slotY + slotH - 1;
        img.setPixelColor(isBorder ? 0xff8b6914 : 0x80c5a059, x, y);
      }
    }
  }

  // Moneda
  for (let dy = -coinR; dy <= coinR; dy++) {
    for (let dx = -coinR; dx <= coinR; dx++) {
      if (dx * dx + dy * dy <= coinR * coinR) {
        const px = Math.round(coinX + dx);
        const py = Math.round(coinY + dy);
        if (px >= 0 && px < size && py >= 0 && py < size) {
          img.setPixelColor(coinColor, px, py);
        }
      }
    }
  }

  const filename = path.join(__dirname, 'icons', `icon-${size}.png`);
  await img.write(filename);
  console.log(`✅ ${filename} generado (${size}x${size})`);
}

(async () => {
  console.log('Generando íconos PNG...');
  for (const size of SIZES) {
    await generateIcon(size);
  }
  console.log('✅ Todos los íconos generados correctamente');
})();
