import styles from './AmbientBackground.module.css';

export default function AmbientBackground() {
  return (
    <div className={styles.ambient}>
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" fill="none" strokeLinecap="round">
        {/* Equator (horizontal large ellipse) */}
        <ellipse cx="100" cy="100" rx="76" ry="24" stroke="#f0ebe2" strokeOpacity="0.07" strokeWidth="0.55"/>
        {/* Gnomon (tilted axis line) */}
        <line x1="68" y1="22" x2="132" y2="178" stroke="#f0ebe2" strokeOpacity="0.07" strokeWidth="0.35"/>
        {/* Ecliptic ring (rotating) */}
        <g className={styles.ecliptic}>
          <ellipse cx="100" cy="100" rx="62" ry="19" stroke="#f0ebe2" strokeOpacity="0.07" strokeWidth="0.45" transform="rotate(-23.5 100 100)"/>
        </g>
        {/* Ember (focal anchor) */}
        <circle className={styles.ember} cx="100" cy="100" r="3" fill="#d97757" fillOpacity="0.5"/>
      </svg>
    </div>
  );
}
