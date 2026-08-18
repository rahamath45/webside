from PIL import Image

img = Image.open('public/logos/itel-logo-original.png')
width, height = img.size

# The image is 1024x984. The text is at the bottom. 
# Let's crop the bottom 250 pixels.
# Left, Upper, Right, Lower
cropped_img = img.crop((0, 0, width, height - 250))
cropped_img.save('public/logos/itel-logo-cropped.png')
print("Cropped image saved.")
