# AnimeVerse - Anime Recommendation Platform

A modern, feature-rich web application for anime enthusiasts with personalized recommendations, waifu personality matching, and comprehensive anime database.

## 🎌 Features

### 🎯 Multi-Genre Recommendations
- Select multiple genres for hybrid recommendations
- Advanced filtering system
- Real-time visual feedback

### 💕 Waifu Personality Quiz
- 16-question personality assessment
- 10 personality traits tracked (tsundere, kuudere, deredere, etc.)
- AI-powered waifu matching based on quiz results

### 📚 Current Watching Tracker
- Track your ongoing anime series
- Progress monitoring
- Personalized watchlist management

### 🗄️ Complete Database
- Browse extensive anime collection
- Detailed waifu character profiles
- Advanced search and filtering capabilities

## 🚀 Technologies Used

- **Frontend**: Pure HTML, CSS, JavaScript (ES6+)
- **Styling**: Tailwind CSS + DaisyUI components
- **Animations**: GSAP library
- **Data Storage**: JSON files with localStorage
- **Performance**: Custom optimization engine

## 🎨 Color Scheme

```css
--anime-red: #DC2626
--anime-black: #0F0F0F
--anime-pink: #EC4899
--anime-purple: #8B5CF6
--anime-white: #FFFFFF
```

## 📁 Project Structure

```
├── index.html              # Landing page with hero section
├── genre-recommendations.html  # Multi-genre recommendation system
├── current-watching.html   # Personal anime tracking
├── waifu-quiz.html         # Personality quiz for waifu matching
├── database.html           # Browse complete anime/waifu database
├── contact.html            # Contact and about page
├── js/
│   ├── main.js            # Global initialization and navigation
│   ├── anime.js           # AnimeManager class
│   ├── waifu.js           # WaifuMatcher class
│   ├── questions.js       # QuizManager for personality quiz
│   ├── pipeline.js        # PipelineManager for multi-genre
│   ├── database.js        # DatabaseManager for data browsing
│   └── performance.js     # PerformanceOptimizer
├── data/
│   ├── anime.json         # Anime database
│   ├── waifu.json         # Waifu character database
│   └── questions.json     # Personality quiz questions
├── css/
│   ├── style.css          # Main styles
│   └── header.css         # Header-specific styles
└── components/
    └── navigation.html    # Shared navigation
```

## 🎯 Key Classes & Architecture

### Core Managers
- **AnimeManager**: Handles anime data and recommendations
- **WaifuMatcher**: Manages personality matching algorithms
- **QuizManager**: Controls personality quiz flow and scoring
- **PipelineManager**: Manages multi-genre selection and filtering
- **DatabaseManager**: Renders database tables and search
- **PerformanceOptimizer**: Provides memoization and batch processing

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/umairrrkhan/anime-wings.git
```

2. Navigate to the project directory:
```bash
cd anime-wings
```

3. Open `index.html` in your browser or serve with a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

## ⚙️ Configuration

### Quiz Question Count
Edit the constant in `js/questions.js`:
```javascript
const QUIZ_QUESTION_COUNT = 16; // Change this value (1-16)
```

### Adding New Anime
Edit `data/anime.json` following this schema:
```json
{
  "id": 1,
  "title": "Anime Title",
  "genres": ["genre1", "genre2"],
  "creator": "Creator Name",
  "rating": 9.0,
  "episodes": 87,
  "year": 2013,
  "status": "completed",
  "description": "Description text",
  "image": "image_url"
}
```

## 🎮 Usage

1. **Homepage**: Navigate to `index.html` for the main landing page
2. **Genre Recommendations**: Visit `genre-recommendations.html` for multi-genre filtering
3. **Waifu Quiz**: Take the personality quiz at `waifu-quiz.html`
4. **Current Watching**: Track your progress at `current-watching.html`
5. **Database**: Browse the complete collection at `database.html`

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (<768px)

## 🚀 Performance Features

- **Memoization**: Caches expensive calculations
- **Debounced Search**: Prevents UI blocking during search
- **Batch Processing**: Handles large datasets efficiently
- **Image Lazy Loading**: Optimizes page load times
- **Cache Management**: Automatic memory optimization

## 🌟 Browser Compatibility

Supports all modern browsers with ES6+:
- Chrome 60+
- Firefox 60+
- Safari 11+
- Edge 79+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Open a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Tailwind CSS for the utility-first CSS framework
- DaisyUI for the component library
- GSAP for smooth animations
- All anime and waifu data contributors

## 📞 Contact

For questions or suggestions, please visit our contact page at `contact.html` or open an issue on GitHub.

---

**Made with 💜 for anime enthusiasts**