# 🎬 Movie Finder

A modern, responsive movie search web application built with **Vanilla JavaScript**, **HTML5**, and **CSS3**.  
This project uses **The Movie Database (TMDb)** API to display movie information.

---

## ✨ Features

- 🔍 **Advanced Search** — Real-time search with autocomplete suggestions  
- 🎭 **Genre Pages** — Browse movies by genre with filtering  
- 📱 **Fully Responsive** — Optimized for mobile, tablet, and desktop  
- 🎬 **Movie Details** — Comprehensive info including cast, crew, and scenes  
- ⭐ **Interactive UI** — Hero slider, pagination, smooth animations  
- 🔄 **State Management** — Search history + pagination persistence  
- 🎨 **Modern Design** — IMDb-inspired dark theme with accent colors

---

## 🛠️ Technologies Used

**Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3  
**API:** The Movie Database (TMDb) API  
**Styling:** Custom CSS (Grid, Flexbox, Variables)  
**Icons:** SVG Icons (no external libs)  
**Fonts:** Google Fonts (Inter)  
**Deployment:** GitHub Pages

---

## 📁 Project Structure

```
Movie-Finder/
├── index.html # Main homepage
├── assets/ # Static assets
│ └── images/ # Logo and images
├── src/
│ ├── css/
│ │ └── style.css # All styles in one file
│ ├── js/
│ │ ├── main.js # Homepage logic
│ │ ├── results.js # Search results page
│ │ ├── genre.js # Genre page logic
│ │ ├── details.js # Movie details page
│ │ ├── config.js # API configuration
│ │ ├── api/ # API service files
│ │ ├── components/ # Reusable components
│ │ └── utils/ # Utility functions
│ └── pages/ # Additional HTML pages
│ ├── results.html # Search results page
│ ├── genre.html # Genre browsing page
│ └── details.html # Movie details page
```


---

## 🚀 Live Demo

**Movie Finder on GitHub Pages**  
([Watch live](https://sadeghdehyadgari.github.io/movie-finder/))

---

## 📦 Installation & Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/sadeghdehyadgari/movie-finder.git
cd movie-finder
```
### 2. Get a TMDb API Key

Visit TMDb

Sign up

Go to Settings → API

Request an API key (v3 auth)

### 3. Configure the API Key

Create config.js in src/js 

### 4. Run locally

Open index.html 

or
```bash
npx serve .
```

## 🎯 How to Use

### 🏠 Homepage
- Browse movies in the **hero slider**
- Search for any movie using the **search bar**
- Filter titles using the **genre dropdown**

### 🔍 Search
- Type **2+ characters** to trigger live suggestions  
- See instant autocomplete results  
- Press **Enter** or click the **search button**  
- Select a movie to view its full details  

### 🎭 Genre Browsing
- Click **"Genres"** in the header  
- Choose any category  
- Explore filtered movies with **pagination**  

### 🎬 Movie Details
- Read full **plot**, **cast**, and **crew** info  
- Browse **movie images & scenes**  
- View **ratings** and **certification**  

---

## 🔧 Technical Highlights

### **Modular Architecture**
- Component-based, maintainable structure  
- Reusable classes: `MovieGrid`, `Pagination`, `HeroSlider`  
- Dedicated **API service layer**  

### **Performance Optimization**
- **Lazy-loaded** images  
- **Debounced** search input  
- Efficient **pagination system**  
- Optimized responsive images  

### **UX Considerations**
- Loading placeholders & skeletons  
- Clear error handling  
- Friendly empty states  
- Smooth transitions & micro-animations  
- Full mobile touch support  

---

## 📱 Responsive Design

- **Mobile (<768px):** Vertical layout, touch-friendly UI  
- **Tablet (768–1024px):** Adaptive grid system  
- **Desktop (>1024px):** Hover effects, extended layout  

---

## 🔌 API Integration

This project fetches:  
- 🔍 Movie search results  
- 🎭 Genre lists  
- 🎬 Movie details (plot, cast, crew, images)  
- ⭐ Ratings & certifications  

**Note:** Uses the TMDb API but is **not endorsed or certified** by TMDb.

---

## 👨‍💻 Development

### **Key JavaScript Classes**
- `TMDbService` — All API communication  
- `MovieGrid` — Renders movie cards  
- `Pagination` — Manages navigation  
- `HeroSlider` — Controls homepage slider  
- `SearchHandler` — Manages autocomplete & search flow  

### **CSS Architecture**
- CSS Variables for theming  
- `@layer`-based organization  
- BEM-inspired naming  
- Mobile-first responsive design  

---

## 🚀 Deployment

### **GitHub Pages**
1. Push code to repository  
2. Go to **Settings → Pages**  
3. Select branch (usually `main`)  
4. Choose the project root folder  

### **Custom Domain (Optional)**
- Add a **CNAME** file  
- Configure DNS settings with provider  

---

## 🤝 Contributing
1. Fork the repository  
2. Create a feature branch  
3. Commit your changes  
4. Push the branch  
5. Open a Pull Request  

---

## 📄 License
This project is licensed under the **MIT License**.

---

## 🙏 Acknowledgments
- The Movie Database (TMDb)  
- IMDb for design inspiration  
- Google Fonts (Inter)  
- All open-source tools and resources  

---

## 📧 Contact
**Sadegh Dehyadgari** — GitHub  
Project Link:  
https://github.com/sadeghdehyadgari/movie-finder

> This project is for educational purposes and showcases advanced Vanilla JavaScript techniques.
