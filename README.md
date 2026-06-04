# veditor

A modern, feature-rich video editor built with web technologies. Create, edit, and export videos directly in your browser with an intuitive interface.

## Features

- **Video Editing**: Cut, trim, and arrange video clips
- **GIF Export**: Convert your videos to animated GIFs
- **Responsive Design**: Works seamlessly on desktop and tablet devices
- **Web-based**: No installation required - access directly in your browser
- **SVG Icons**: Clean, scalable icon set for the user interface

## Tech Stack

- **HTML/CSS/JavaScript**: Core web technologies
- **Web Workers**: Efficient GIF encoding with `gif.worker.js`
- **Responsive UI**: Mobile-friendly interface design

## Project Structure

```
veditor/
├── index.html           # Main HTML entry point
├── favicon.svg          # Application favicon
├── icons.svg            # SVG icon library
├── gif.worker.js        # Web Worker for GIF encoding
└── assets/              # Compiled assets (generated)
```

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yabaggi/veditor.git
cd veditor
```

2. Serve the application locally:
```bash
# Using Python
python -m http.server 8000

# Or using Node.js
npx http-server
```

3. Open your browser and navigate to `http://localhost:8000`

## Usage

1. **Import Video**: Load a video file to begin editing
2. **Edit Timeline**: Use the timeline to trim and arrange clips
3. **Apply Effects**: Add transitions and effects to your video
4. **Export**: Download your edited video or export as GIF

## Browser Support

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

Modern browsers with ES6+ support and Web Worker capabilities are required.

## Development

This is a web-based application built with vanilla JavaScript. No build system is required for basic usage, though the project includes compiled assets for optimized performance.

### Building

If you need to build the project with optimizations:
```bash
# Build commands here (if applicable)
```

## License

This project is open source and available on GitHub.

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## Author

Created by [yabaggi](https://github.com/yabaggi)

---

**Note**: This is an in-browser video editor. For best performance, use modern browsers and keep video file sizes reasonable.
