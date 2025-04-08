# PNGtoSVG
HackUSF2025

## Inspiration
A well-designed website is crucial to establish a strong first impression and maintain a positive lasting impression, both for professional and personal purposes. The website owner's credibility can rest upon the quality of their design. Images on a site should appear crystal clear and not lag upon loading. To ensure this, scalable vector graphics (SVGs) can be superior to standard PNG images. While PNG to SVG converters exist, the sites hosting these tools only tackle one component of SVG editing (i.e. either conversion or editing, but not both). Additionally, the quality of their conversion algorithms are not always acceptable for design use. Our project, "SVGenie" serves as an all-in-one tool for all of your SVG editing needs. By recognizing a gap in existing tools, we created the very tool we wished we had in our own front-end development endeavors. 

## What it does
SVGenie's features include:
- Upload image via file selection or dragging/dropping onto screen
- Generate an SVG from a PNG
- Generate an SVG from a path
- Improve PNG quality via AI image upscaling
- Display SVG on interactive screen
- Pan and zoom on interactive screen

## How we built it
### Server:
- Flask (Python) backend
- HTML/JS/CSS frontend
Libraries:
- Numpy
- Matplotlib
- Base64
- Requests
- Time
- OS
- Pyautotrace
- Pillow

### APIs:
- Image Upscaling

## Challenges we ran into
- There are three different ways to handle images: accessing images via local path, storing images as a Pillow object, and recording the corresponding base64 url. Some API calls were only compatible with a specific method.
- The autotrace library was one of our top choices for PNG to SVG conversion, but the quality was not as great as it could be.
- Making API calls across main.js and app.py raised some errors, but we overcame this by replacing POST requests with GET requests.
- Zooming and panning on the interactive screen involved some research and experimentation, but we eventually implemented it successfully. 

## Accomplishments that we're proud of
- Leveraging AI to address a long-time problem amongst web designers
- Zooming and panning on screen
- Reformatting the path to appear more clear and intuitive
- Adjusting the SVG dimensions
- Dynamic window dimensions that appear well on different display sizes
- Successful API calls after multiple rounds of debugging
- Managing the three different image handling methods
- Finding a free, effective, and open-source AI image upscaling API
- Frontend user interface
- Application premise as a whole and the progress we made in only 24 hours!

## What we learned
- How SVGs actually work and understanding the different types of splines as components of the path
- Even-Odd rule of filling (making hollow SVGs)
- Encoding images in Python and JavaScript as well as sending image paths and data across both files/languages
- Flask server establishment
- API calls (specifically, POST vs GET requests)

## What's next for SVGenie
- Improve SVG generation quality by exploring other libraries than pyautotrace
- Customize AI image upscaling scale (2x, 3x, 4x)
- Download upscaled image PNG and SVG with transparent backgrounds
- Edit SVGs via adjustable splines
- Enhance the user interface
