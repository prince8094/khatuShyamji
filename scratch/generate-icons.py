import os
from PIL import Image

def generate_icons():
    logo_path = r"c:\Users\princ\KhatuShyamji\public\images\khatu-shyam-logo.png"
    output_dir = r"c:\Users\princ\KhatuShyamji\public\images"
    
    if not os.path.exists(logo_path):
        print(f"Error: Logo file not found at {logo_path}")
        return
        
    try:
        # Load the base logo
        img = Image.open(logo_path)
        
        # 1. Standard Icons (Simple Resize)
        sizes = [192, 512]
        for size in sizes:
            out_img = img.resize((size, size), Image.Resampling.LANCZOS)
            out_img.save(os.path.join(output_dir, f"icon-{size}.png"), "PNG")
            print(f"Generated icon-{size}.png")
            
        # 2. Maskable Icons (Centered with padding and background #FAF6F0)
        bg_color = (250, 246, 240, 255) # #FAF6F0 in RGBA
        for size in sizes:
            # Create background canvas
            canvas = Image.new("RGBA", (size, size), bg_color)
            
            # Scale the source logo to be 60% of the canvas size to sit securely in the safe zone
            inner_size = int(size * 0.6)
            scaled_img = img.resize((inner_size, inner_size), Image.Resampling.LANCZOS)
            
            # Center the scaled image on the canvas
            offset = ((size - inner_size) // 2, (size - inner_size) // 2)
            
            # Handle alpha channel pasting
            if scaled_img.mode == 'RGBA':
                canvas.paste(scaled_img, offset, scaled_img)
            else:
                canvas.paste(scaled_img, offset)
                
            canvas.save(os.path.join(output_dir, f"icon-{size}-maskable.png"), "PNG")
            print(f"Generated icon-{size}-maskable.png")
            
        print("All PWA icons generated successfully!")
    except Exception as e:
        print(f"An error occurred during icon generation: {e}")

if __name__ == "__main__":
    generate_icons()
