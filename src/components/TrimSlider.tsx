import React from 'react';

interface TrimSliderProps {
  duration: number;
  start: number;
  end: number;
  onChange: (start: number, end: number) => void;
}

const TrimSlider: React.FC<TrimSliderProps> = ({ duration, start, end, onChange }) => {
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (val < end) {
      onChange(val, end);
    }
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (val > start) {
      onChange(start, val);
    }
  };

  return (
    <div className="trim-slider">
      <div className="label">Trim: {start.toFixed(2)}s - {end.toFixed(2)}s</div>
      <div className="range-container">
        <input
          type="range"
          min={0}
          max={duration}
          step={0.1}
          value={start}
          onChange={handleStartChange}
          className="start-thumb"
        />
        <input
          type="range"
          min={0}
          max={duration}
          step={0.1}
          value={end}
          onChange={handleEndChange}
          className="end-thumb"
        />
      </div>
      <style>{`
        .trim-slider {
          margin: 16px 0;
          padding: 10px;
          background: #222;
          border-radius: 8px;
        }
        .trim-slider .label {
          font-size: 14px;
          margin-bottom: 8px;
          color: #ccc;
        }
        .range-container {
          position: relative;
          height: 30px;
        }
        .range-container input {
          position: absolute;
          width: 100%;
          background: none;
          -webkit-appearance: none;
        }
        .range-container input::-webkit-slider-thumb {
          pointer-events: auto;
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          background: var(--primary-color);
          border-radius: 50%;
          cursor: pointer;
        }
        .start-thumb {
          z-index: 2;
        }
        .end-thumb {
          z-index: 1;
        }
      `}</style>
    </div>
  );
};

export default TrimSlider;
