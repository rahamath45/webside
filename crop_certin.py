from PIL import Image

img = Image.open('public/logos/certin-logo-original.png')
width, height = img.size

# The previous crop of 40 pixels wasn't enough, leaving half the text.
# Let's crop 80 pixels.
cropped_img = img.crop((0, 0, width, height - 80))
cropped_img.save('public/logos/certin-logo-cropped.png')
print(f"Original size: {width}x{height}, Cropped size: {cropped_img.size}")
