from PIL import Image

# Open image
img = Image.open('/Users/sohamdeepakrudrawar/.gemini/antigravity-ide/brain/97c53e92-058d-40b7-9a9d-397d2ba71e57/.user_uploaded/media_1791214502698.jpg')

# The original is 982x1024.
# The logo consists of NR, the leaves, and the circular arcs.
# "ENSURING LIVES" is at the bottom.
# Let's crop it tightly. 
# We'll crop left=150, upper=150, right=850, lower=800
box = (150, 150, 850, 800)
cropped = img.crop(box)

# Make background white (if it isn't completely white, it's fine, it's mostly white)
cropped.save('public/logo.jpg')

