import { useActivities } from './hooks/useActivities';
import { useLayout } from './hooks/useLayout';
import { ActivityGrid } from './components/ActivityGrid';
import { ActivitySection } from './components/ActivitySection';
import './index.css';

/**
 * Format ISO date string to dd/MM/YY format
 * @param {string|null} isoDate - ISO date string
 * @returns {string} Formatted date or empty string
 */
function formatDate(isoDate) {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

/**
 * Main application component
 * Renders the Year Tracker 2026 habit tracking interface
 */
function App() {
  const { activities, progress, loading, error, toggleProgress, getProgressCount, getLastUpdated } = useActivities();

  // Handle responsive layout scaling
  useLayout();

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>Error: {error}</div>;
  }

  // Find activities by key
  const training = activities.find(a => a.key === 'training');
  const english = activities.find(a => a.key === 'english');
  const activitiesData = activities.find(a => a.key === 'squash');
  const books = activities.find(a => a.key === 'books');
  const games = activities.find(a => a.key === 'games');
  const filmsCinema = activities.find(a => a.key === 'films-cinema');
  const filmsHome = activities.find(a => a.key === 'films-home');

  const filmsTotal = (filmsCinema?.count || 0) + (filmsHome?.count || 0);
  const filmsTotalProgress = getProgressCount('films-cinema') + getProgressCount('films-home');

  // Get last updated for films (combined group)
  const filmsLastUpdated = getLastUpdated('films-cinema');
  const filmsFormattedDate = formatDate(filmsLastUpdated);

  return (
    <>
      <div className="header-bar">
        <h1>Year Tracker 2026</h1>
      </div>

      <div className="canvas-wrapper">
        <div className="canvas-area">

          {/* Training */}
          <ActivitySection
            activity={training}
            progress={progress[training?.key] || []}
            onToggle={toggleProgress}
            getProgressCount={getProgressCount}
            nameId="name-training"
            boxId="box-training"
            textId="text-training"
            updatedId="updated-training"
            lastUpdated={getLastUpdated('training')}
          />

          {/* Films - Special layout with cinema zone */}
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
          {filmsFormattedDate && (
            <div id="updated-films" className="last-updated">
              updated on {filmsFormattedDate}
            </div>
          )}

          {/* English */}
          <ActivitySection
            activity={english}
            progress={progress[english?.key] || []}
            onToggle={toggleProgress}
            getProgressCount={getProgressCount}
            nameId="name-english"
            boxId="box-english"
            textId="text-english"
            updatedId="updated-english"
            lastUpdated={getLastUpdated('english')}
          />

          {/* Activities (Squash, Padel, etc) */}
          <ActivitySection
            activity={activitiesData}
            progress={progress[activitiesData?.key] || []}
            onToggle={toggleProgress}
            getProgressCount={getProgressCount}
            nameId="name-activities"
            boxId="box-activities"
            textId="text-activities"
            customName="activities"
            subtitleId="subtitle-activities"
            subtitleText="(squash, padel, etc)"
            updatedId="updated-activities"
            lastUpdated={getLastUpdated('squash')}
          />

          {/* Books */}
          <ActivitySection
            activity={books}
            progress={progress[books?.key] || []}
            onToggle={toggleProgress}
            getProgressCount={getProgressCount}
            nameId="name-books"
            boxId="box-books"
            textId="text-books"
            updatedId="updated-books"
            lastUpdated={getLastUpdated('books')}
          />

          {/* Games */}
          <ActivitySection
            activity={games}
            progress={progress[games?.key] || []}
            onToggle={toggleProgress}
            getProgressCount={getProgressCount}
            nameId="name-games"
            boxId="box-games"
            textId="text-games"
            updatedId="updated-games"
            lastUpdated={getLastUpdated('games')}
          />

        </div>
      </div>

      <div className="footer-bar">
        Copyright 2026 Year Tracker. All rights reserved. Created by Valentyn Korniienko.
      </div>
    </>
  );
}

export default App;
