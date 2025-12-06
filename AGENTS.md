# AnimeVerse - Agent Documentation

## Overview

AnimeVerse is a web-based anime recommendation platform with the following main features:
- Genre-based anime recommendations with multi-genre selection
- Waifu personality matching quiz (16 questions)
- Current watching anime tracking
- Complete anime and waifu database

## Project Structure

```
D:/anime/
├── index.html              # Landing page with hero section
├── genre-recommendations.html  # Multi-genre recommendation system
├── current-watching.html   # Personal anime tracking
├── waifu-quiz.html         # Personality quiz for waifu matching
├── database.html           # Browse complete anime/waifu database
├── js/
│   ├── main.js            # Global initialization and navigation
│   ├── anime.js           # AnimeManager class for anime operations
│   ├── waifu.js           # WaifuMatcher class for personality matching
│   ├── questions.js       # QuizManager for the personality quiz
│   ├── pipeline.js        # PipelineManager for multi-genre recommendations
│   ├── database.js        # DatabaseManager for data browsing
│   └── performance.js     # PerformanceOptimizer for optimization
├── data/
│   ├── anime.json          # Anime database with metadata
│   ├── waifu.json         # Waifu character database
│   └── questions.json     # Personality quiz questions
├── css/
│   └── style.css          # Custom styles
└── components/
    └── navigation.html    # Shared navigation component
```

## Technology Stack

- **Frontend**: Pure HTML, CSS, JavaScript (ES6+ classes)
- **UI Framework**: Tailwind CSS + DaisyUI components
- **Animations**: GSAP library
- **Data Storage**: JSON files with localStorage for user preferences
- **Performance**: Custom PerformanceOptimizer for large datasets

## Key Classes and Architecture

### Core Managers
- **AnimeManager** (js/anime.js): Handles anime data, recommendations, and current watching
- **WaifuMatcher** (js/waifu.js): Manages personality matching and waifu data
- **QuizManager** (js/questions.js): Controls personality quiz flow and scoring
- **PipelineManager** (js/pipeline.js): Manages multi-genre selection and filtering
- **DatabaseManager** (js/database.js): Renders database tables and search
- **PerformanceOptimizer** (js/performance.js): Provides memoization, debouncing, and batch processing

### Data Flow
1. All JSON data is loaded asynchronously via fetch API
2. User preferences are stored in localStorage
3. Large datasets (>500 items) trigger performance optimizations
4. Caching is implemented for expensive calculations

## Color Scheme

```css
--anime-red: #DC2626
--anime-black: #0F0F0F
--anime-pink: #EC4899
--anime-purple: #8B5CF6
--anime-white: #FFFFFF
```

## Important Features

### Multi-Genre Pipeline
- Users can select multiple genres for hybrid recommendations
- Genre selections are tracked in a Set data structure
- Real-time UI updates with visual feedback

### Waifu Personality Matching
- 10 personality traits tracked: tsundere, deredere, kuudere, loli, protective, independent, caring, playful, mature, mysterious
- Configurable quiz length via QUIZ_QUESTION_COUNT constant in js/questions.js
- Results are calculated based on personality trait scores

### Performance Optimizations
- Memoization for expensive calculations
- Debounced search/filter operations
- Batch processing for large datasets
- Image lazy loading
- Cache size limiting for memory management

## Configuration

### Quiz Question Count
Edit the constant in js/questions.js:
```javascript
const QUIZ_QUESTION_COUNT = 16; // Change this value (1-16)
```

### Tailwind Configuration
Tailwind config is defined inline in each HTML file with custom anime color theme.

## Navigation

The application uses a static navigation bar with links to all main pages. The mobile menu is handled by the `toggleMobileMenu()` function in main.js.

## Testing

No automated testing framework is present. Testing is done manually by:
1. Opening each HTML file in a browser
2. Verifying all interactive features work
3. Testing responsive design at different viewport sizes

## Performance Considerations

- Large anime/waifu datasets trigger automatic optimizations
- Image loading uses lazy loading
- Search operations are debounced
- Expensive calculations are memoized
- Batch processing prevents UI blocking

## Data Schema

### Anime Data
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
  "image": "image_url",
  "currentlyWatching": false
}
```

### Waifu Data
```json
{
  "id": 1,
  "name": "Character Name",
  "anime": "Anime Title",
  "personality": "tsundere",
  "traits": ["trait1", "trait2"],
  "description": "Character description",
  "image": "image_url"
}
```

### Question Data
```json
{
  "id": 1,
  "question": "Question text",
  "options": ["Option1", "Option2", "Option3", "Option4"]
}
```

## Browser Compatibility

The application targets modern browsers with ES6+ support. It uses:
- Arrow functions
- Async/await
- Classes
- Template literals
- Array methods (forEach, map, filter)

## Error Handling

- Global error listener shows user-friendly notifications
- Try-catch blocks around async operations
- Fallback content for failed data loads
- Console logging for debugging

## SEO Optimization

- Structured data for search engines
- Meta tags for social sharing
- Semantic HTML structure
- Performance optimizations for Core Web Vitals