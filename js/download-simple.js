// SIMPLE DOWNLOAD FUNCTION - NO COMPLEX SHIT
async function downloadWaifuCard(waifuName) {
    try {
        // Show loading
        const btn = event.target;
        btn.textContent = 'Loading...';
        btn.disabled = true;
        
        // Get waifu data
        const response = await fetch('data/waifu.json');
        const waifuList = await response.json();
        const waifu = waifuList.find(w => w.name === waifuName);
        
        if (!waifu) {
            throw new Error('Waifu not found');
        }
        
        // CREATE CARD AS CANVAS DIRECTLY - NO HTML SHIT
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 450;
        const ctx = canvas.getContext('2d');
        
        // CARD BACKGROUND #B38B6D
        ctx.fillStyle = '#B38B6D';
        ctx.fillRect(0, 0, 800, 450);
        
        // LOAD IMAGE
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = waifu.image;
        });
        
        // DRAW IMAGE (300x450)
        ctx.drawImage(img, 0, 0, 300, 450);
        
        // WHITE CONTENT BACKGROUND
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(300, 0, 500, 450);
        
        // DRAW BORDER
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, 800, 450);
        
        // TEXT SETTINGS
        ctx.textAlign = 'left';
        
        // NAME
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 24px Arial';
        ctx.fillText(waifu.name, 320, 40);
        
        // ANIME
        ctx.font = '16px Arial';
        ctx.fillStyle = '#6b7280';
        ctx.fillText(waifu.anime, 320, 65);
        
        // PERSONALITY
        ctx.fillStyle = '#9ca3af';
        ctx.font = '14px Arial';
        ctx.fillText(waifu.personality, 320, 85);
        
        // TRAITS
        ctx.fillStyle = '#DC2626';
        let traitX = 320;
        let traitY = 110;
        waifu.traits.forEach((trait, i) => {
            // Draw rounded rectangle for trait
            const width = ctx.measureText(trait).width + 20;
            ctx.beginPath();
            ctx.roundRect(traitX, traitY, width, 24, 12);
            ctx.fill();
            
            // Draw text
            ctx.fillStyle = '#ffffff';
            ctx.font = '11px Arial';
            ctx.fillText(trait, traitX + 10, traitY + 16);
            
            traitX += width + 10;
            if (traitX > 750) {
                traitX = 320;
                traitY += 30;
            }
        });
        
        // DESCRIPTION
        ctx.fillStyle = '#374151';
        ctx.font = '14px Arial';
        const words = waifu.description.split(' ');
        let line = '';
        let y = 180;
        const maxWidth = 460;
        const lineHeight = 20;
        
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, 320, y);
                line = words[n] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, 320, y);
        
        // WAIFU MATCH TEXT - BIG AND CENTERED
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('YOUR WAIFU MATCH', 550, 360);
        
        // BORDER AT BOTTOM
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(320, 370);
        ctx.lineTo(770, 370);
        ctx.stroke();
        
        // DOWNLOAD
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${waifu.name.replace(/\s+/g, '_')}_waifu_card.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            btn.textContent = 'Download';
            btn.disabled = false;
        }, 'image/jpeg', 0.9);
        
    } catch (error) {
        console.error('Download failed:', error);
        alert(`Download failed: ${error.message}`);
        
        if (event.target) {
            event.target.textContent = 'Download';
            event.target.disabled = false;
        }
    }
}

// Add roundedRect to canvas if not supported
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
    };
}