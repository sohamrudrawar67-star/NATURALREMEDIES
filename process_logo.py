from PIL import Image
import colorsys

img = Image.open('/Users/sohamdeepakrudrawar/.gemini/antigravity-ide/brain/97c53e92-058d-40b7-9a9d-397d2ba71e57/.user_uploaded/media_1791214502698.jpg').convert('RGBA')
box = (100, 100, 880, 810)
cropped = img.crop(box)

data = cropped.getdata()
new_data = []

# Create a circular mask to remove the extreme corners (gold)
w, h = cropped.size

for idx, item in enumerate(data):
    x = idx % w
    y = idx // w
    
    # Distance from center
    cx = w / 2
    cy = h / 2 - 20
    dist = ((x - cx)**2 + (y - cy)**2)**0.5
    
    r, g, b, a = item
    
    # If it's outside the circle (dist > 350), it's definitely background
    if dist > 380:
        new_data.append((255, 255, 255, 0))
        continue

    # Convert RGB to HSV
    hsv = colorsys.rgb_to_hsv(r/255.0, g/255.0, b/255.0)
    hue = hsv[0] * 360
    sat = hsv[1]
    val = hsv[2] * 255
    
    # The smoke is greyish, meaning low saturation and high value.
    # The green leaves have higher saturation and green hue (around 60-150).
    # The black text has very low value (val < 100).
    
    # If the pixel is dark enough, keep it (black text)
    if val < 130:
        # Keep original, but maybe ensure alpha is 255
        new_data.append((r, g, b, 255))
        continue
        
    # If the pixel is green, keep it
    # Green is roughly hue between 60 and 160
    if sat > 0.15 and 50 < hue < 170 and val < 210:
        new_data.append((r, g, b, 255))
        continue
        
    # Anti-aliasing: we need to handle pixels that are the boundary
    # If a pixel is between green/black and white, it will be light and have some color.
    # If we just hard threshold, we get jagged edges.
    # Instead, we can map the brightness directly to alpha!
    # For anything that doesn't meet the "definitely keep" criteria, it's either smoke or edge.
    # If it's very bright (val > 180), we fade it out to transparent.
    if val > 160:
        # Map val 160-255 to alpha 255-0
        alpha = int(255 - ((val - 160) / (255 - 160)) * 255)
        # To make it blend with white navbar, we also make the pixel color white
        # This acts as pre-multiplied alpha to white, giving a perfectly clean edge!
        # Since it's blending to a white background, setting color to white with alpha looks clean.
        # Actually, let's keep the color, just adjust alpha.
        new_data.append((r, g, b, max(0, alpha)))
    else:
        # It's some mid-tone (like 130-160), just keep it
        new_data.append((r, g, b, 255))

cropped.putdata(new_data)
cropped.save('public/logo.png', 'PNG')
