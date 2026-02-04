import { useEffect, useLayoutEffect } from 'react';
import { useActivities } from './hooks/useActivities';
import { ActivityGrid } from './components/ActivityGrid';
import './index.css';

const BASE_WIDTH = 2400;
const BASE_HEIGHT = 1300;
const BASE_HEADER_HEIGHT = 380;
const BASE_HEADER_FONT = 285;
const BASE_FOOTER_HEIGHT = 64;
const BASE_FOOTER_FONT = 16;
const MOBILE_BREAKPOINT = 1200;

function App() {
  const { activities, progress, loading, error, toggleProgress, getProgressCount } = useActivities();

  useLayoutEffect(() => {
    // Call immediately (synchronous)
    updateLayout();

    // Call again after a tiny delay to catch any late renders
    const timeoutId = setTimeout(() => {
      updateLayout();
    }, 0);

    window.addEventListener('resize', updateLayout);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateLayout);
    };
  }, []);

  // Additional safety check after mount
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateLayout();
    }, 10);

    return () => clearTimeout(timeoutId);
  }, []);

  function updateLayout() {
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    document.body.classList.toggle('mobile-layout', isMobile);

    const wrapper = document.querySelector('.canvas-wrapper');
    const canvas = document.querySelector('.canvas-area');

    if (!wrapper || !canvas) return;

    if (isMobile) {
      wrapper.style.width = '';
      wrapper.style.height = '';
      canvas.style.transform = '';
      document.documentElement.style.removeProperty('--header-height');
      document.documentElement.style.removeProperty('--header-font-size');
      document.documentElement.style.removeProperty('--footer-height');
      document.documentElement.style.removeProperty('--footer-font-size');
      return;
    }

    const padding = 32;
    const availableWidth = window.innerWidth - padding;
    const availableHeight = window.innerHeight - padding;
    const totalBaseHeight = BASE_HEIGHT + BASE_FOOTER_HEIGHT;
    const scale = Math.min(1, availableWidth / BASE_WIDTH, availableHeight / totalBaseHeight);

    wrapper.style.width = `${BASE_WIDTH * scale}px`;
    wrapper.style.height = `${BASE_HEIGHT * scale}px`;
    canvas.style.transform = `scale(${scale})`;
    document.documentElement.style.setProperty('--header-height', `${BASE_HEADER_HEIGHT * scale}px`);
    document.documentElement.style.setProperty('--header-font-size', `${BASE_HEADER_FONT * scale}px`);
    document.documentElement.style.setProperty('--footer-height', `${BASE_FOOTER_HEIGHT * scale}px`);
    document.documentElement.style.setProperty('--footer-font-size', `${BASE_FOOTER_FONT * scale}px`);
  }

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>Error: {error}</div>;
  }

  // Group activities by category
  const training = activities.find(a => a.key === 'training');
  const english = activities.find(a => a.key === 'english');
  const squash = activities.find(a => a.key === 'squash');
  const books = activities.find(a => a.key === 'books');
  const games = activities.find(a => a.key === 'games');
  const filmsCinema = activities.find(a => a.key === 'films-cinema');
  const filmsHome = activities.find(a => a.key === 'films-home');

  const filmsTotal = (filmsCinema?.count || 0) + (filmsHome?.count || 0);
  const filmsTotalProgress = getProgressCount('films-cinema') + getProgressCount('films-home');

  return (
    <>
      <div className="header-bar">
        <h1>Year Tracker 2026</h1>
      </div>

      <div className="canvas-wrapper">
        <div className="canvas-area">

          {/* Training */}
          {training && (
            <>
              <div id="name-training" className="name-block">training</div>
              <div id="box-training" className="circles-block">
                <ActivityGrid
                  activity={training}
                  progress={progress[training.key] || []}
                  onToggle={toggleProgress}
                />
              </div>
              <div id="text-training" className="meta-text">
                {getProgressCount(training.key)}/{training.count}
              </div>
            </>
          )}

          {/* Films */}
          <div id="name-films" className="name-block">films</div>
          <div id="box-films" className="circles-block">
            <div className="cinema-zone" id="cinema-zone">
              <svg className="cinema-border" viewBox="0 0 463 103" preserveAspectRatio="none" aria-hidden="true">
                <rect x="1" y="1" width="461" height="101" rx="15" ry="15" fill="none" stroke="#555" strokeWidth="2" strokeDasharray="2 2" />
              </svg>
              {filmsCinema && (
                <ActivityGrid
                  activity={filmsCinema}
                  progress={progress[filmsCinema.key] || []}
                  onToggle={toggleProgress}
                />
              )}
            </div>
            <span className="cinema-label" id="cinema-label">
              {getProgressCount('films-cinema')}/{filmsCinema?.count || 0} in the cinema
            </span>
            {filmsHome && (
              <ActivityGrid
                activity={filmsHome}
                progress={progress[filmsHome.key] || []}
                onToggle={toggleProgress}
              />
            )}
          </div>
          <div id="text-films" className="meta-text">
            {filmsTotalProgress}/{filmsTotal}
          </div>

          {/* English */}
          {english && (
            <>
              <div id="name-english" className="name-block">english</div>
              <div id="box-english" className="circles-block">
                <ActivityGrid
                  activity={english}
                  progress={progress[english.key] || []}
                  onToggle={toggleProgress}
                />
              </div>
              <div id="text-english" className="meta-text">
                {getProgressCount(english.key)}/{english.count}
              </div>
            </>
          )}

          {/* Squash */}
          {squash && (
            <>
              <div id="name-squash" className="name-block">squash</div>
              <div id="box-squash" className="circles-block">
                <ActivityGrid
                  activity={squash}
                  progress={progress[squash.key] || []}
                  onToggle={toggleProgress}
                />
              </div>
              <div id="text-squash" className="meta-text">
                {getProgressCount(squash.key)}/{squash.count}
              </div>
            </>
          )}

          {/* Books */}
          {books && (
            <>
              <div id="name-books" className="name-block">books</div>
              <div id="box-books" className="circles-block">
                <ActivityGrid
                  activity={books}
                  progress={progress[books.key] || []}
                  onToggle={toggleProgress}
                />
              </div>
              <div id="text-books" className="meta-text">
                {getProgressCount(books.key)}/{books.count}
              </div>
            </>
          )}

          {/* Games */}
          {games && (
            <>
              <div id="name-games" className="name-block">games</div>
              <div id="box-games" className="circles-block">
                <ActivityGrid
                  activity={games}
                  progress={progress[games.key] || []}
                  onToggle={toggleProgress}
                />
              </div>
              <div id="text-games" className="meta-text">
                {getProgressCount(games.key)}/{games.count}
              </div>
            </>
          )}

        </div>
      </div>

      <div className="footer-bar">
        Copyright 2026 Year Tracker. All rights reserved. Created by Valentyn Korniienko.
      </div>
    </>
  );
}

export default App;
