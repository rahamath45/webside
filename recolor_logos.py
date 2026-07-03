import os
from PIL import Image

def process_logo(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for item in data:
        r, g, b, a = item
        
        # 1. Convert white and near-white pixels to transparent
        # This removes both the outer background and the inner circle white background of the ITEL logo
        if r > 235 and g > 235 and b > 235:
            new_data.append((0, 0, 0, 0))
        else:
            # 2. Convert neutral dark/grey pixels to white text
            # Saffron, green, and blue have distinct R/G/B values, so they won't match this neutral check.
            diff_rg = abs(r - g)
            diff_gb = abs(g - b)
            diff_rb = abs(r - b)
            
            # If it's a shade of grey/black (all channels close to each other)
            if diff_rg < 35 and diff_gb < 35 and diff_rb < 35:
                # Make it white
                new_data.append((255, 255, 255, a))
            else:
                # Keep original colored pixel
                new_data.append((r, g, b, a))
                
    img.putdata(new_data)
    
    # Auto-trim transparent edges
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save(output_path, "PNG")
    print(f"Saved to {output_path}")

def main():
    logos_dir = "/home/nisha/nisha_projects/webside/public/logos"
    
    process_logo(
        os.path.join(logos_dir, "certin-logo-original.png"),
        os.path.join(logos_dir, "certin-logo.png")
    )
    process_logo(
        os.path.join(logos_dir, "ican-logo-original.png"),
        os.path.join(logos_dir, "ican-logo.png")
    )
    process_logo(
        os.path.join(logos_dir, "itel-logo-original.png"),
        os.path.join(logos_dir, "itel-logo.png")
    )

if __name__ == "__main__":
    main()
